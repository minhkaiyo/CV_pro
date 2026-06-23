"""Authentication and usage-limit helpers."""

import logging
from typing import Optional
from datetime import date

from fastapi import Depends, HTTPException, Header
from app.supabase_client import get_supabase
from app.config import settings

logger = logging.getLogger(__name__)

# ── JWT verification ─────────────────────────────────────────────────────────

async def verify_user(authorization: Optional[str] = Header(None)) -> str:
    """
    Verify a Supabase JWT and return the user's UUID.

    In development (APP_ENV=development) with no token supplied, falls back to
    a mock UUID so the API stays testable without a real auth session.

    Priority:
      1. Real Supabase JWT (Bearer token) — always attempted first when present.
      2. Dev mock — only when APP_ENV != "production" AND no token provided.
    """
    if authorization:
        token = authorization.removeprefix("Bearer ").strip()
        if token:
            try:
                supabase = get_supabase()
                user_response = supabase.auth.get_user(token)
                if user_response and user_response.user:
                    return user_response.user.id
                raise HTTPException(status_code=401, detail="Invalid or expired token.")
            except HTTPException:
                raise
            except Exception as e:
                logger.warning(f"JWT verification failed: {e}")
                raise HTTPException(status_code=401, detail="Token verification failed.")

    # No token supplied
    if getattr(settings, "app_env", "development") == "production":
        raise HTTPException(status_code=401, detail="Authorization header required.")

    # Dev/test fallback — mock user
    logger.debug("No auth token — using mock user ID (dev mode only)")
    return "00000000-0000-0000-0000-000000000000"


# ── Usage limits ─────────────────────────────────────────────────────────────

async def check_usage_limit(user_id: str = Depends(verify_user)) -> bool:
    """
    Enforce per-plan usage limits.

    - premium / b2b: unlimited
    - free: 1 analysis per calendar day
    """
    supabase = get_supabase()

    try:
        profile_res = supabase.table("profiles").select("plan").eq("id", user_id).maybe_single().execute()
        plan = profile_res.data["plan"] if profile_res.data else "free"
    except Exception:
        plan = "free"

    if plan in ("premium", "b2b"):
        return True

    # Free tier: check today's usage
    today = date.today().isoformat()
    try:
        usage_res = (
            supabase.table("usage_logs")
            .select("id", count="exact")
            .eq("user_id", user_id)
            .eq("action", "analysis")
            .gte("created_at", today)
            .execute()
        )
        count = usage_res.count if hasattr(usage_res, "count") else len(usage_res.data or [])
    except Exception:
        count = 0

    if count >= 1:
        raise HTTPException(
            status_code=403,
            detail="Free tier limit: 1 analysis per day. Upgrade to Premium for unlimited access.",
        )
    return True


def log_usage(user_id: str, action: str, metadata: dict = {}) -> None:
    """Fire-and-forget usage log. Never raises."""
    try:
        supabase = get_supabase()
        supabase.table("usage_logs").insert({
            "user_id": user_id,
            "action": action,
            "metadata": metadata,
        }).execute()
    except Exception as e:
        logger.warning(f"Usage log failed (non-critical): {e}")
