"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Download, Eye, Trash2, Plus, FileText, Loader2, Sparkles, Wand2 } from "lucide-react";
import { getCVVersions, deleteCVVersion, getAnalyses, saveCVVersion } from "@/lib/store";
import { apiListCVVersions, apiDeleteCVVersion, apiExportCVPDF } from "@/lib/api";
import type { CVVersion, AnalysisResult, DiffItem } from "@/lib/types";
import { toast } from "@/components/ui/toast";

// ── Generate CV Version modal ─────────────────────────────────
function GenerateModal({
  analyses,
  onClose,
  onGenerated,
}: {
  analyses: AnalysisResult[];
  onClose: () => void;
  onGenerated: (v: CVVersion) => void;
}) {
  const [selectedAnalysis, setSelectedAnalysis] = useState(analyses[0]?.analysis_id ?? "");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    const analysis = analyses.find((a) => a.analysis_id === selectedAnalysis);
    if (!analysis) { toast("warning", "Vui lòng chọn một kết quả phân tích."); return; }

    setLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
      let diffs: DiffItem[] = [];
      let optimizedMarkdown = "";
      let backendVersionId: string | undefined;

      // 1. Try new /cv-versions endpoint
      if (analysis.resume_id && analysis.job_id) {
        const cvVerRes = await fetch(`${apiBase}/cv-versions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resume_id: analysis.resume_id,
            job_id: analysis.job_id,
            analysis_id: analysis.analysis_id,
          }),
        }).catch(() => null);

        if (cvVerRes?.ok) {
          const cvVerData = await cvVerRes.json();
          backendVersionId = cvVerData.cv_version_id;
          if (backendVersionId) {
            const detailRes = await fetch(`${apiBase}/cv-versions/${backendVersionId}`, {
              headers: { "Content-Type": "application/json" },
            }).catch(() => null);
            if (detailRes?.ok) {
              const detail = await detailRes.json();
              diffs = (detail.diff_items ?? []) as DiffItem[];
              optimizedMarkdown = detail.optimized_markdown ?? "";
            }
          }
        }
      }

      // 2. Fallback: Resume-Matcher improve/preview
      if (diffs.length === 0 && analysis.resume_id && analysis.job_id) {
        const previewRes = await fetch(`${apiBase}/resumes/improve/preview`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resume_id: analysis.resume_id, job_id: analysis.job_id }),
        }).catch(() => null);
        if (previewRes?.ok) {
          const previewData = await previewRes.json();
          diffs = previewData.data?.diff_summary?.changes ?? [];
          optimizedMarkdown = previewData.data?.improved_resume?.content ?? "";
        }
      }

      // 3. Final fallback: analysis suggestions as diffs
      if (diffs.length === 0) {
        diffs = (analysis.suggestions ?? []).map((s, i) => ({
          path: `suggestion_${i}`,
          action: "replace" as const,
          original: s.problem,
          value: s.recommendation,
          reason: s.recommendation,
          confidence: (s.priority === "high" ? "high" : s.priority === "medium" ? "medium" : "low") as DiffItem["confidence"],
          applied: false,
        }));
      }

      const version: CVVersion = {
        id: backendVersionId ?? `ver_${Date.now()}`,
        analysis_id: analysis.analysis_id,
        resume_id: analysis.resume_id,
        title: `${analysis.role} — CV tối ưu`,
        target_role: analysis.role,
        status: "ready",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        diff_items: diffs,
        optimized_markdown: optimizedMarkdown,
      };

      saveCVVersion(version);
      onGenerated(version);
      toast("success", "Đã tạo phiên bản CV tối ưu!");
    } catch {
      toast("error", "Có lỗi khi tạo phiên bản CV. Thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-gray-100 rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Tạo phiên bản CV mới</h3>
        <p className="text-gray-500 text-sm mb-6">AI sẽ dựa trên kết quả phân tích ATS để tạo ra phiên bản CV tối ưu nhất cho bạn.</p>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Chọn kết quả phân tích</label>
            {analyses.length === 0 ? (
              <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 text-orange-600 text-sm text-center">
                Chưa có phân tích nào. <Link href="/dashboard/upload" className="font-bold underline">Phân tích CV trước.</Link>
              </div>
            ) : (
              <select
                value={selectedAnalysis}
                onChange={(e) => setSelectedAnalysis(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10 transition"
              >
                {analyses.map((a) => (
                  <option key={a.analysis_id} value={a.analysis_id}>{a.role} — {a.fileName}</option>
                ))}
              </select>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 bg-gray-50 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-bold hover:bg-gray-100 transition">
              Hủy
            </button>
            <button
              onClick={handleGenerate}
              disabled={loading || analyses.length === 0}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang tạo...</> : <><Wand2 className="w-4 h-4" /> Tạo ngay</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Diff Preview modal ────────────────────────────────────────
function DiffModal({ version, onClose }: { version: CVVersion; onClose: () => void }) {
  const diffs = version.diff_items ?? [];
  const confColor: Record<string, string> = {
    high: "text-emerald-600 border-emerald-100 bg-emerald-50",
    medium: "text-amber-600 border-amber-100 bg-amber-50",
    low: "text-gray-500 border-gray-200 bg-gray-50",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-gray-100 rounded-3xl w-full max-w-2xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-xl font-bold text-gray-800">{version.title}</h3>
            <p className="text-xs text-gray-500 font-medium mt-1">Chi tiết gợi ý thay đổi để tối ưu ATS</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 hover:bg-red-100 hover:text-red-500 transition font-bold text-lg leading-none">×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-white">
          {diffs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Sparkles className="w-12 h-12 text-blue-200 mb-3" />
              <p className="text-gray-500 font-medium">Không có gợi ý thay đổi nào.</p>
            </div>
          ) : diffs.map((diff, i) => (
            <div key={i} className="bg-gray-50 border border-gray-100 rounded-2xl p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between gap-3 mb-4">
                <span className="text-xs text-gray-500 font-mono bg-white px-2 py-1 rounded-md border border-gray-200 shadow-sm">{diff.path}</span>
                <span className={`text-xs px-2.5 py-1 rounded-full border font-bold ${confColor[diff.confidence] ?? confColor.low}`}>
                  {diff.confidence === "high" ? "Cao" : diff.confidence === "medium" ? "Vừa" : "Thấp"}
                </span>
              </div>
              {diff.original && (
                <div className="mb-3 p-3 bg-red-50/50 border border-red-100 rounded-xl relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-300" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 block mb-1.5 ml-2">Phiên bản cũ:</span>
                  <p className="text-sm text-gray-600 ml-2">{diff.original}</p>
                </div>
              )}
              <div className="mb-3 p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-1.5 ml-2">Đề xuất thay đổi:</span>
                <p className="text-sm text-gray-800 font-medium ml-2">{Array.isArray(diff.value) ? diff.value.join(", ") : diff.value}</p>
              </div>
              <p className="text-xs text-gray-500 mt-3 font-medium flex items-start gap-1.5 bg-white p-2.5 rounded-lg border border-gray-100">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                {diff.reason}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function CVVersions() {
  const [versions, setVersions] = useState<CVVersion[]>(() =>
    typeof window !== "undefined" ? getCVVersions() : []
  );
  const [analyses] = useState<AnalysisResult[]>(() =>
    typeof window !== "undefined" ? getAnalyses() : []
  );
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [previewVersion, setPreviewVersion] = useState<CVVersion | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);

  // Sync from backend on mount
  useEffect(() => {
    let cancelled = false;
    async function sync() {
      try {
        const { cv_versions: remote } = await apiListCVVersions();
        if (cancelled) return;
        for (const r of remote) {
          const exists = getCVVersions().find((v) => v.id === r.id);
          if (!exists) {
            saveCVVersion({
              id: r.id,
              analysis_id: "",
              title: r.title,
              target_role: r.target_role ?? "",
              status: r.status as CVVersion["status"],
              createdAt: r.created_at,
              updatedAt: r.created_at,
              diff_items: (r.diff_items as CVVersion["diff_items"]) ?? [],
            });
          }
        }
        setVersions(getCVVersions());
      } catch {
        // Backend not available — use local store silently
      }
    }
    sync();
    return () => { cancelled = true; };
  }, []);

  const handleDelete = (id: string) => {
    deleteCVVersion(id);
    setVersions(getCVVersions());
    // Best-effort delete on backend
    apiDeleteCVVersion(id).catch(() => null);
    toast("success", "Đã xóa phiên bản CV.");
  };

  const handleDownload = async (v: CVVersion) => {
    // Try PDF export from backend first (premium)
    setExportingId(v.id);
    try {
      const blob = await apiExportCVPDF(v.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${v.title.replace(/\s+/g, "-")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast("success", "Đã tải xuống PDF!");
    } catch {
      // Fallback: download as markdown/txt
      const content = v.optimized_markdown ?? `# ${v.title}\n\nTarget Role: ${v.target_role}`;
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${v.title.replace(/\s+/g, "-")}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast("success", "Đã tải xuống (nâng cấp Premium để xuất PDF).");
    } finally {
      setExportingId(null);
    }
  };

  const statusBadge: Record<CVVersion["status"], { label: string; cls: string }> = {
    draft: { label: "Nháp", cls: "bg-gray-100 text-gray-500 border border-gray-200" },
    ready: { label: "Sẵn sàng", cls: "bg-emerald-50 text-emerald-600 border border-emerald-100" },
    exported: { label: "Đã xuất", cls: "bg-blue-50 text-blue-600 border border-blue-100" },
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="relative w-full h-[180px] md:h-[220px] rounded-3xl overflow-hidden shadow-sm">
        <Image src="/banner-cv-analysis.png" alt="Các bản CV đã tạo" fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent flex flex-col justify-center px-8 md:px-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2 flex items-center gap-2">
                <FileText className="w-8 h-8 text-blue-300" /> Quản lý CV
              </h1>
              <p className="text-blue-100 max-w-md text-sm md:text-base leading-relaxed">
                Xem, tải xuống và quản lý các phiên bản CV đã được AI tối ưu hóa cho từng vị trí ứng tuyển.
              </p>
            </div>
            <div className="hidden sm:block">
              <button
                onClick={() => setShowGenerateModal(true)}
                className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-50 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <Wand2 className="w-5 h-5" /> Tạo CV tối ưu
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex sm:hidden justify-center mb-4">
           <button
             onClick={() => setShowGenerateModal(true)}
             className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow-md"
           >
             <Wand2 className="w-5 h-5" /> Tạo CV tối ưu
           </button>
        </div>

        {versions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 shadow-sm">
              <Wand2 className="w-10 h-10 text-blue-400" />
            </div>
            <h3 className="text-gray-800 font-bold text-xl mb-2">Chưa có phiên bản CV nào</h3>
            <p className="text-gray-500 text-sm mb-8 max-w-sm">Hãy để AI tạo ra phiên bản CV hoàn hảo nhất từ kết quả phân tích của bạn.</p>
            <button onClick={() => setShowGenerateModal(true)} className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-blue-700 hover:shadow-lg transition-all flex items-center gap-2">
              <Wand2 className="w-5 h-5" /> Tạo phiên bản đầu tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Add new card */}
            <button
              onClick={() => setShowGenerateModal(true)}
              className="bg-blue-50/50 border-2 border-dashed border-blue-200 rounded-3xl flex flex-col items-center justify-center p-8 text-blue-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all min-h-[220px] group shadow-sm"
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                <Plus className="w-8 h-8 text-blue-500" />
              </div>
              <span className="text-base font-bold text-blue-800">Tạo phiên bản mới</span>
              <span className="text-xs text-blue-500/70 mt-2 font-medium text-center">Tối ưu CV cho JD cụ thể</span>
            </button>

            {versions.map((v) => (
              <div key={v.id} className="bg-white border border-gray-200 rounded-3xl flex flex-col overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300 group">
                {/* Card header */}
                <div className="p-6 border-b border-gray-100 bg-gray-50/30 group-hover:bg-blue-50/30 transition-colors flex-1">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-bold text-gray-800 text-lg leading-snug line-clamp-2">{v.title}</h3>
                    <span className={`text-xs px-2.5 py-1 rounded-full shrink-0 font-bold uppercase tracking-wider ${statusBadge[v.status]?.cls}`}>
                      {statusBadge[v.status]?.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-1.5">
                    <span className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                      <FileText className="w-3 h-3" />
                    </span>
                    <span className="truncate">{v.target_role}</span>
                  </div>
                  <p className="text-xs text-gray-400 font-medium">{new Date(v.createdAt).toLocaleDateString("vi-VN")}</p>
                </div>

                {/* Diff summary */}
                {v.diff_items && v.diff_items.length > 0 && (
                  <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      <p className="text-xs font-bold text-gray-600">{v.diff_items.length} thay đổi tối ưu</p>
                    </div>
                    <div className="flex gap-1.5">
                      {(["high", "medium", "low"] as const).map((c) => {
                        const count = v.diff_items!.filter((d) => d.confidence === c).length;
                        if (!count) return null;
                        const cls = c === "high" ? "bg-emerald-100 text-emerald-600" : c === "medium" ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-500";
                        return <span key={c} className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold ${cls}`} title={c}>{count}</span>;
                      })}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="p-4 flex gap-2 bg-gray-50">
                  <button
                    onClick={() => setPreviewVersion(v)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-gray-200 text-gray-600 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-100 hover:text-gray-900 transition shadow-sm"
                  >
                    <Eye className="w-4 h-4 text-gray-400" /> Xem diff
                  </button>
                  <button
                    onClick={() => handleDownload(v)}
                    disabled={exportingId === v.id}
                    className="flex-[1.5] flex items-center justify-center gap-1.5 bg-blue-600 border border-blue-600 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-sm shadow-blue-200 disabled:opacity-50"
                  >
                    {exportingId === v.id
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Xuất...</>
                      : <><Download className="w-4 h-4" /> Tải xuống PDF</>
                    }
                  </button>
                  <button
                    onClick={() => handleDelete(v.id)}
                    className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 text-gray-400 rounded-xl hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition shadow-sm shrink-0"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showGenerateModal && (
        <GenerateModal
          analyses={analyses}
          onClose={() => setShowGenerateModal(false)}
          onGenerated={(v) => { setVersions(getCVVersions()); setShowGenerateModal(false); setPreviewVersion(v); }}
        />
      )}
      {previewVersion && (
        <DiffModal version={previewVersion} onClose={() => setPreviewVersion(null)} />
      )}
    </div>
  );
}
