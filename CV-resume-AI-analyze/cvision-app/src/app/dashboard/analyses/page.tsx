"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FileText, Calendar, ChevronRight, Trash2, Search, UploadCloud, Loader2 } from "lucide-react";
import { getAnalyses, saveAnalysis, deleteAnalysis } from "@/lib/store";
import { apiListAnalyses, apiDeleteAnalysis } from "@/lib/api";
import type { AnalysisResult } from "@/lib/types";
import { toast } from "@/components/ui/toast";

function ScoreChip({ score }: { score: number }) {
  const cls =
    score >= 80 ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
    : score >= 60 ? "bg-amber-50 text-amber-600 border border-amber-100"
    : "bg-red-50 text-red-600 border border-red-100";
  return <span className={`px-2.5 py-1 rounded-full text-xs font-bold tabular-nums ${cls}`}>{score}/100</span>;
}

export default function AnalysesHistory() {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>(() =>
    typeof window !== "undefined" ? getAnalyses() : []
  );
  const [search, setSearch] = useState("");
  const [syncing, setSyncing] = useState(false);

  // Sync from backend on mount — merges remote records into local store
  useEffect(() => {
    let cancelled = false;
    async function sync() {
      setSyncing(true);
      try {
        const { analyses: remote } = await apiListAnalyses();
        if (cancelled) return;
        // Convert API shape → AnalysisResult and merge into store
        for (const r of remote) {
          const existing = getAnalyses().find((a) => a.analysis_id === r.id);
          if (!existing) {
            saveAnalysis({
              analysis_id: r.id,
              fileName: r.file_name ?? "unknown.pdf",
              role: r.role ?? "",
              createdAt: r.created_at,
              total_score: r.total_score,
              layout_score: r.layout_score,
              content_score: r.content_score,
              ats_score: r.ats_score,
              keyword_score: r.keyword_score,
              skills_score: r.skills_score,
              achievement_score: r.achievement_score,
              ats_platform_scores: r.ats_platform_scores,
              matched_keywords: r.matched_keywords ?? [],
              missing_keywords: r.missing_keywords ?? [],
              suggestions: (r.suggestions as AnalysisResult["suggestions"]) ?? [],
              hr_review: r.hr_review as AnalysisResult["hr_review"],
              summary: r.summary,
              resume_id: r.resume_id,
              job_id: r.job_id,
            });
          }
        }
        setAnalyses(getAnalyses());
      } catch {
        // Backend not available — silently use local store
      } finally {
        if (!cancelled) setSyncing(false);
      }
    }
    sync();
    return () => { cancelled = true; };
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Delete locally immediately
    deleteAnalysis(id);
    setAnalyses(getAnalyses());
    // Best-effort delete on backend
    apiDeleteAnalysis(id).catch(() => null);
    toast("success", "Đã xóa kết quả phân tích.");
  };

  const filtered = analyses.filter(
    (a) =>
      a.fileName.toLowerCase().includes(search.toLowerCase()) ||
      a.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="relative w-full h-[180px] md:h-[220px] rounded-3xl overflow-hidden shadow-sm">
        <Image src="/banner-career-growth.png" alt="Lịch sử phân tích" fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent flex flex-col justify-center px-8 md:px-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2 flex items-center gap-2">
                <FileText className="w-8 h-8 text-blue-300" /> Lịch sử phân tích
                {syncing && <Loader2 className="w-5 h-5 animate-spin text-blue-200 ml-2" />}
              </h1>
              <p className="text-blue-100 max-w-md text-sm md:text-base leading-relaxed">
                Xem lại kết quả đánh giá ATS, theo dõi sự tiến bộ của bạn qua từng phiên bản CV.
              </p>
            </div>
            <div className="hidden sm:block">
              <Link
                href="/dashboard/upload"
                className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-50 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <UploadCloud className="w-5 h-5" /> Phân tích CV mới
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        {/* Search */}
        {analyses.length > 0 && (
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên file CV hoặc vị trí ứng tuyển..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10 transition"
            />
          </div>
        )}

        {/* Empty state */}
        {analyses.length === 0 && !syncing && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 shadow-sm">
              <FileText className="w-10 h-10 text-blue-400" />
            </div>
            <h3 className="text-gray-800 font-bold text-xl mb-2">Chưa có phân tích nào</h3>
            <p className="text-gray-500 text-sm mb-8 max-w-sm">Tải lên CV đầu tiên của bạn để AI bắt đầu quét lỗi và tối ưu hóa từ khóa.</p>
            <Link href="/dashboard/upload" className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-blue-700 hover:shadow-lg transition-all flex items-center gap-2">
              <UploadCloud className="w-5 h-5" /> Phân tích CV ngay
            </Link>
          </div>
        )}

        {/* List */}
        {filtered.length > 0 && (
          <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm divide-y divide-gray-100">
            {filtered.map((item) => (
              <Link
                key={item.analysis_id}
                href={`/dashboard/analyses/${item.analysis_id}`}
                className="flex items-center justify-between p-5 hover:bg-gray-50 transition group"
              >
                <div className="flex items-center gap-5 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <FileText className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-800 text-base truncate mb-1">{item.role}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-gray-500">
                      <span className="flex items-center gap-1.5 truncate max-w-[200px] bg-gray-100 px-2 py-0.5 rounded-md">
                        <FileText className="w-3.5 h-3.5 shrink-0 text-gray-400" /> {item.fileName}
                      </span>
                      <span className="flex items-center gap-1.5 shrink-0 bg-gray-100 px-2 py-0.5 rounded-md">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                      {item.isDemo && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] bg-amber-50 text-amber-600 border border-amber-100 font-bold uppercase tracking-wider">demo</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0 ml-4">
                  <ScoreChip score={item.total_score} />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDelete(item.analysis_id, e)}
                      className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {filtered.length === 0 && analyses.length > 0 && (
          <div className="text-center py-16 text-gray-500 font-medium">
            Không tìm thấy kết quả với &ldquo;<span className="text-gray-800">{search}</span>&rdquo;
          </div>
        )}
      </div>
    </div>
  );
}
