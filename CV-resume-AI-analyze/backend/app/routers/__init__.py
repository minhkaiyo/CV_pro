"""API routers."""

from app.routers.applications import router as applications_router
from app.routers.config import router as config_router
from app.routers.enrichment import router as enrichment_router
from app.routers.health import router as health_router
from app.routers.jobs import router as jobs_router
from app.routers.resume_wizard import router as resume_wizard_router
from app.routers.resumes import router as resumes_router
from app.routers.analyses import router as analyses_router
from app.routers.cv_versions import router as cv_versions_router
from app.routers.billing import router as billing_router
from app.routers.admin import router as admin_router
from app.routers.advanced_ai import router as advanced_ai_router

__all__ = [
    "resumes_router",
    "jobs_router",
    "config_router",
    "health_router",
    "enrichment_router",
    "applications_router",
    "resume_wizard_router",
    "analyses_router",
    "cv_versions_router",
    "billing_router",
    "admin_router",
    "advanced_ai_router",
]
