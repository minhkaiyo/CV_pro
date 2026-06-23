// ============================================================
// Shared types used across the entire CVision AI frontend
// ============================================================

export interface AnalysisResult {
  analysis_id: string;
  resume_id?: string;
  job_id?: string;
  fileName: string;
  role: string;
  createdAt: string;
  isDemo?: boolean;

  // Scores
  total_score: number;
  layout_score: number;
  content_score: number;
  ats_score: number;
  keyword_score: number;
  skills_score: number;
  achievement_score: number;

  // ATS platform breakdown
  ats_platform_scores?: Record<string, number>;

  // Keywords
  matched_keywords: string[];
  missing_keywords: string[];
  semantic_keywords?: string[];

  // Suggestions
  suggestions: Suggestion[];

  // HR Review
  hr_review?: HRReview;

  // Summary
  summary?: string;
  strengths?: string[];
  weaknesses?: string[];

  // Probability
  probability?: ProbabilityEstimate;

  // Raw JD
  jd?: string;

  // File URL
  fileUrl?: string;
}

export interface Suggestion {
  category: "layout" | "content" | "ats" | "keyword" | "achievement" | "skill";
  priority: "high" | "medium" | "low";
  problem: string;
  recommendation: string;
  evidence?: string;
}

export interface HRReview {
  first_impression: string;
  strengths: string[];
  concerns: string[];
  priority_actions: string[];
}

export interface ProbabilityEstimate {
  score: number; // 0-100
  label: string; // "Strong fit" | "Competitive" | "Possible" | "Low match"
  breakdown: Record<string, number>;
}

export interface CVVersion {
  id: string;
  analysis_id: string;
  resume_id?: string;
  title: string;
  target_role: string;
  target_company?: string;
  status: "draft" | "ready" | "exported";
  createdAt: string;
  updatedAt: string;
  diff_items?: DiffItem[];
  pdf_url?: string;
  optimized_markdown?: string;
  cover_letter?: string;
}

export interface DiffItem {
  path: string;
  action: "replace" | "append" | "reorder" | "add_skill";
  original: string | null;
  value: string | string[];
  reason: string;
  confidence: "high" | "medium" | "low";
  applied?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  full_name: string;
  plan: "free" | "premium" | "b2b";
  role: "user" | "admin";
}
