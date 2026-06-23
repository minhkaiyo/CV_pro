"""Billing endpoints — Stripe checkout, webhook, subscription status."""

import json
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, Header
from typing import Optional
from pydantic import BaseModel

from app.auth import verify_user
from app.supabase_client import get_supabase
from app.config import settings

router = APIRouter(tags=["billing"])
logger = logging.getLogger(__name__)

# ── Price mapping (set real Stripe price IDs in env) ─────────────────────────
PLAN_PRICE_IDS: dict[str, str] = {
    "premium_monthly": getattr(settings, "stripe_price_monthly", "price_monthly_placeholder"),
    "premium_yearly":  getattr(settings, "stripe_price_yearly",  "price_yearly_placeholder"),
}


def _get_stripe():
    """Lazy-import stripe so the app starts without STRIPE_SECRET_KEY set."""
    import stripe as _stripe
    key = getattr(settings, "stripe_secret_key", "")
    if not key:
        raise HTTPException(status_code=503, detail="Stripe not configured (missing STRIPE_SECRET_KEY).")
    _stripe.api_key = key
    return _stripe


# ── POST /billing/checkout ────────────────────────────────────────────────────

class CheckoutRequest(BaseModel):
    plan: str = "premium_monthly"
    success_url: Optional[str] = None
    cancel_url: Optional[str] = None


@router.post("/billing/checkout")
async def create_checkout_session(
    req: CheckoutRequest,
    user_id: str = Depends(verify_user),
):
    """Create a Stripe Checkout session and return the URL."""
    price_id = PLAN_PRICE_IDS.get(req.plan)
    if not price_id or "placeholder" in price_id:
        raise HTTPException(
            status_code=503,
            detail=f"Stripe price ID for '{req.plan}' not configured. Set STRIPE_PRICE_MONTHLY / STRIPE_PRICE_YEARLY in .env."
        )

    stripe = _get_stripe()
    frontend_url = getattr(settings, "frontend_base_url", "http://localhost:3000")

    # Get or create Stripe customer for this user
    supabase = get_supabase()
    try:
        sub_res = (
            supabase.table("subscriptions")
            .select("provider_customer_id")
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )
        customer_id = sub_res.data["provider_customer_id"] if sub_res.data else None
    except Exception:
        customer_id = None

    session_params: dict = {
        "mode": "subscription",
        "line_items": [{"price": price_id, "quantity": 1}],
        "success_url": req.success_url or f"{frontend_url}/dashboard/billing?session_id={{CHECKOUT_SESSION_ID}}&status=success",
        "cancel_url": req.cancel_url or f"{frontend_url}/dashboard/billing?status=cancelled",
        "metadata": {"user_id": user_id, "plan": req.plan},
    }
    if customer_id:
        session_params["customer"] = customer_id

    try:
        session = stripe.checkout.Session.create(**session_params)
        return {"checkout_url": session.url, "session_id": session.id}
    except Exception as e:
        logger.error(f"Stripe checkout creation failed: {e}")
        raise HTTPException(status_code=500, detail="Could not create checkout session.")


# ── POST /webhooks/stripe ─────────────────────────────────────────────────────

@router.post("/webhooks/stripe")
async def stripe_webhook(
    request: Request,
    stripe_signature: Optional[str] = Header(None, alias="stripe-signature"),
):
    """
    Handle Stripe webhook events.
    Verifies the signature, then updates the Supabase subscriptions + profiles tables.
    """
    body = await request.body()
    webhook_secret = getattr(settings, "stripe_webhook_secret", "")

    stripe = _get_stripe()

    # Verify signature
    try:
        event = stripe.Webhook.construct_event(body, stripe_signature, webhook_secret)
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid Stripe webhook signature.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Webhook error: {e}")

    supabase = get_supabase()
    event_type = event["type"]
    data = event["data"]["object"]
    logger.info(f"Stripe webhook: {event_type}")

    if event_type in ("checkout.session.completed",):
        user_id = data.get("metadata", {}).get("user_id")
        plan = data.get("metadata", {}).get("plan", "premium_monthly")
        customer_id = data.get("customer")
        subscription_id = data.get("subscription")

        if user_id:
            # Upsert subscription record
            supabase.table("subscriptions").upsert({
                "user_id": user_id,
                "plan": "premium",
                "provider": "stripe",
                "provider_customer_id": customer_id,
                "provider_subscription_id": subscription_id,
                "status": "active",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }, on_conflict="user_id").execute()

            # Promote user plan
            supabase.table("profiles").update({
                "plan": "premium",
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }).eq("id", user_id).execute()

    elif event_type in ("customer.subscription.deleted", "customer.subscription.paused"):
        subscription_id = data.get("id")
        customer_id = data.get("customer")
        if subscription_id:
            # Downgrade subscription
            update_res = (
                supabase.table("subscriptions")
                .update({"status": "cancelled", "updated_at": datetime.now(timezone.utc).isoformat()})
                .eq("provider_subscription_id", subscription_id)
                .execute()
            )
            if update_res.data:
                user_id = update_res.data[0].get("user_id")
                if user_id:
                    supabase.table("profiles").update({"plan": "free"}).eq("id", user_id).execute()

    elif event_type == "customer.subscription.updated":
        subscription_id = data.get("id")
        status = data.get("status")
        period_end = data.get("current_period_end")
        if subscription_id:
            supabase.table("subscriptions").update({
                "status": status,
                "current_period_end": datetime.fromtimestamp(period_end, tz=timezone.utc).isoformat() if period_end else None,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }).eq("provider_subscription_id", subscription_id).execute()

    elif event_type in ("invoice.payment_failed",):
        subscription_id = data.get("subscription")
        if subscription_id:
            supabase.table("subscriptions").update({
                "status": "past_due",
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }).eq("provider_subscription_id", subscription_id).execute()

    return {"received": True}


# ── GET /billing/subscription ─────────────────────────────────────────────────

@router.get("/billing/subscription")
async def get_subscription(user_id: str = Depends(verify_user)):
    """Get current user's plan and subscription status."""
    supabase = get_supabase()

    # Get plan from profile (source of truth for enforcement)
    try:
        profile_res = supabase.table("profiles").select("plan").eq("id", user_id).maybe_single().execute()
        plan = profile_res.data["plan"] if profile_res.data else "free"
    except Exception:
        plan = "free"

    # Get subscription detail
    try:
        sub_res = (
            supabase.table("subscriptions")
            .select("status, provider, current_period_end, created_at")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        sub = sub_res.data[0] if sub_res.data else {}
    except Exception:
        sub = {}

    return {
        "plan": plan,
        "status": sub.get("status", "active" if plan == "free" else "unknown"),
        "provider": sub.get("provider"),
        "current_period_end": sub.get("current_period_end"),
    }


# ── POST /billing/portal ──────────────────────────────────────────────────────

@router.post("/billing/portal")
async def create_portal_session(user_id: str = Depends(verify_user)):
    """Create a Stripe customer portal session so user can manage their subscription."""
    supabase = get_supabase()
    try:
        sub_res = (
            supabase.table("subscriptions")
            .select("provider_customer_id")
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )
        customer_id = sub_res.data["provider_customer_id"] if sub_res.data else None
    except Exception:
        customer_id = None

    if not customer_id:
        raise HTTPException(status_code=404, detail="No Stripe customer found for this user.")

    stripe = _get_stripe()
    frontend_url = getattr(settings, "frontend_base_url", "http://localhost:3000")
    try:
        session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=f"{frontend_url}/dashboard/billing",
        )
        return {"portal_url": session.url}
    except Exception as e:
        logger.error(f"Portal session creation failed: {e}")
        raise HTTPException(status_code=500, detail="Could not create billing portal session.")
