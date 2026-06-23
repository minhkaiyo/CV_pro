"use client";
// ============================================================
// Demo store — localStorage-backed state for CVision AI
// Provides a consistent data layer whether or not the backend
// is connected. When the backend IS connected, we hydrate from
// its API and write-through to localStorage as a cache.
// ============================================================

import type { AnalysisResult, CVVersion } from "./types";

const KEYS = {
  analyses: "cvision_analyses",
  cvVersions: "cvision_cv_versions",
};

// ── Analyses ────────────────────────────────────────────────

export function getAnalyses(): AnalysisResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEYS.analyses);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAnalysis(result: AnalysisResult): void {
  if (typeof window === "undefined") return;
  const list = getAnalyses().filter((a) => a.analysis_id !== result.analysis_id);
  list.unshift(result);
  localStorage.setItem(KEYS.analyses, JSON.stringify(list.slice(0, 50)));
}

export function getAnalysisById(id: string): AnalysisResult | null {
  return getAnalyses().find((a) => a.analysis_id === id) ?? null;
}

export function deleteAnalysis(id: string): void {
  if (typeof window === "undefined") return;
  const list = getAnalyses().filter((a) => a.analysis_id !== id);
  localStorage.setItem(KEYS.analyses, JSON.stringify(list));
}

// ── CV Versions ─────────────────────────────────────────────

export function getCVVersions(): CVVersion[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEYS.cvVersions);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCVVersion(version: CVVersion): void {
  if (typeof window === "undefined") return;
  const list = getCVVersions().filter((v) => v.id !== version.id);
  list.unshift(version);
  localStorage.setItem(KEYS.cvVersions, JSON.stringify(list.slice(0, 30)));
}

export function getCVVersionById(id: string): CVVersion | null {
  return getCVVersions().find((v) => v.id === id) ?? null;
}

export function deleteCVVersion(id: string): void {
  if (typeof window === "undefined") return;
  const list = getCVVersions().filter((v) => v.id !== id);
  localStorage.setItem(KEYS.cvVersions, JSON.stringify(list));
}

// ── Stats helper ────────────────────────────────────────────

export function getDashboardStats() {
  const analyses = getAnalyses();
  const versions = getCVVersions();
  const avgScore =
    analyses.length > 0
      ? Math.round(analyses.reduce((s, a) => s + a.total_score, 0) / analyses.length)
      : 0;
  return {
    analysisCount: analyses.length,
    versionCount: versions.length,
    avgScore,
    recentAnalyses: analyses.slice(0, 5),
  };
}
