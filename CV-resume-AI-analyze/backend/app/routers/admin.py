from fastapi import APIRouter, Depends, HTTPException
from app.auth import verify_user
from app.supabase_client import get_supabase
import logging

router = APIRouter(tags=["admin"])
logger = logging.getLogger(__name__)

def verify_admin(user_id: str = Depends(verify_user)) -> str:
    supabase = get_supabase()
    profile_res = supabase.table("profiles").select("role").eq("id", user_id).execute()
    role = profile_res.data[0]["role"] if profile_res.data else "user"
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user_id

@router.get("/admin/metrics")
async def get_dashboard_metrics(admin_id: str = Depends(verify_admin)):
    """Get high level metrics for the admin dashboard."""
    # Real implementation would aggregate tables
    return {
        "total_users": 1250,
        "premium_users": 150,
        "total_revenue_vnd": 45000000,
        "analyses_count": 5400
    }

@router.get("/admin/users")
async def list_users(admin_id: str = Depends(verify_admin)):
    """List users for admin panel."""
    supabase = get_supabase()
    res = supabase.table("profiles").select("*").limit(50).execute()
    return {"users": res.data}

@router.patch("/admin/users/{id}/plan")
async def override_user_plan(id: str, plan: str, admin_id: str = Depends(verify_admin)):
    """Manually override a user's subscription plan."""
    supabase = get_supabase()
    res = supabase.table("profiles").update({"plan": plan}).eq("id", id).execute()
    return {"status": "success", "updated": res.data}
