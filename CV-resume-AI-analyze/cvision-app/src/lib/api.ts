/**
 * API client for CVision AI
 *
 * - Automatically attaches Firebase ID token as Bearer header
 * - Falls back to unauthenticated on token fetch failure (dev mode)
 * - All errors throw with a Vietnamese-friendly message
 */

import { getAccessToken } from "./auth";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

// ── Auth header helper ───────────────────────────────────────────────────────

async function getAuthHeader(): Promise<Record<string, string>> {
  try {
    const token = await getAccessToken();
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  } catch {
    // Non-blocking — dev mode continues without token
  }
  return {};
}

// ── Core request ─────────────────────────────────────────────────────────────

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const authHeader = await getAuthHeader();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      ...authHeader,
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function requestForm<T>(path: string, formData: FormData): Promise<T> {
  const authHeader = await getAuthHeader();
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: authHeader,
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface ApiAnalysis {
  id: string;
  file_name?: string;
  role?: string;
  total_score: number;
  ats_score: number;
  keyword_score: number;
  layout_score: number;
  content_score: number;
  skills_score: number;
  achievement_score: number;
  ats_platform_scores?: Record<string, number>;
  matched_keywords: string[];
  missing_keywords: string[];
  suggestions?: unknown[];
  hr_review?: unknown;
  summary?: string;
  created_at: string;
  resume_id?: string;
  job_id?: string;
}

export interface ApiCVVersion {
  id: string;
  title: string;
  target_role?: string;
  status: string;
  created_at: string;
  diff_items?: unknown[];
}

export interface ApiSubscription {
  plan: "free" | "premium" | "b2b";
  status: string;
  provider?: string;
  current_period_end?: string;
}

// ── Analyses ─────────────────────────────────────────────────────────────────

export async function apiAnalyzeResume(formData: FormData) {
  return requestForm<{
    status: string;
    analysis_id: string;
    resume_id: string;
    job_id: string;
    result: ApiAnalysis;
  }>("/analyses", formData);
}

export async function apiListAnalyses() {
  return request<{ analyses: ApiAnalysis[] }>("/analyses");
}

export async function apiGetAnalysis(id: string) {
  return request<ApiAnalysis>(`/analyses/${id}`);
}

export async function apiDeleteAnalysis(id: string) {
  return request<{ status: string }>(`/analyses/${id}`, { method: "DELETE" });
}

// ── CV Versions ───────────────────────────────────────────────────────────────

export async function apiGenerateCVVersion(payload: {
  resume_id: string;
  job_id: string;
  analysis_id?: string;
  prompt_id?: string;
}) {
  return request<{
    status: string;
    cv_version_id: string;
    title: string;
    diff_count: number;
    note?: string;
  }>("/cv-versions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function apiListCVVersions() {
  return request<{ cv_versions: ApiCVVersion[] }>("/cv-versions");
}

export async function apiGetCVVersion(id: string) {
  return request<ApiCVVersion>(`/cv-versions/${id}`);
}

export async function apiDeleteCVVersion(id: string) {
  return request<{ status: string }>(`/cv-versions/${id}`, { method: "DELETE" });
}

export async function apiExportCVPDF(id: string): Promise<Blob> {
  const authHeader = await getAuthHeader();
  const res = await fetch(`${BASE}/cv-versions/${id}/export-pdf`, {
    method: "POST",
    headers: authHeader,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? "PDF export failed");
  }
  return res.blob();
}

// ── Cover Letter ──────────────────────────────────────────────────────────────

export async function apiGenerateCoverLetter(payload: {
  job_title: string;
  company_name?: string;
  job_description?: string;
  resume_markdown?: string;
  tone?: string;
}) {
  return request<{ status: string; cover_letter: string }>("/advanced-ai/cover-letter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// ── Billing ───────────────────────────────────────────────────────────────────

export async function apiGetSubscription() {
  return request<ApiSubscription>("/billing/subscription");
}

export async function apiCreateCheckout(plan: string, successUrl?: string, cancelUrl?: string) {
  return request<{ checkout_url: string; session_id: string }>("/billing/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan, success_url: successUrl, cancel_url: cancelUrl }),
  });
}

export async function apiCreatePortalSession() {
  return request<{ portal_url: string }>("/billing/portal", { method: "POST" });
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export async function apiAdminMetrics() {
  return request<{
    total_users: number;
    premium_users: number;
    total_revenue_vnd: number;
    analyses_count: number;
  }>("/admin/metrics");
}

export async function apiAdminListUsers() {
  return request<{ users: Record<string, unknown>[] }>("/admin/users");
}

export async function apiAdminUpdateUserPlan(userId: string, plan: string) {
  return request<{ status: string }>(`/admin/users/${userId}/plan`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  });
}

// ── Health ────────────────────────────────────────────────────────────────────

export async function apiCheckHealth() {
  return request<{ status: string }>("/health");
}

// ── Resume-Matcher improve pipeline (via FastAPI backend) ─────────────────────

export async function apiImprovePreview(payload: {
  resume_id: string;
  job_id: string;
  prompt_id?: string;
}) {
  return request<Record<string, unknown>>("/resumes/improve/preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function apiImproveConfirm(payload: {
  resume_id: string;
  job_id: string;
  improved_data: Record<string, unknown>;
  preview_hash: string;
}) {
  return request<Record<string, unknown>>("/resumes/improve/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
