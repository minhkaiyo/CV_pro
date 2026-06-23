import os
from supabase import create_client, Client
from app.config import settings

def get_supabase() -> Client:
    supabase_url = os.environ.get("SUPABASE_URL", "http://localhost:54321")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "anon_key_mock")
    return create_client(supabase_url, supabase_key)
