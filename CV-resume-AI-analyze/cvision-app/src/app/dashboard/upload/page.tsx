"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { UploadCloud, FileType2, Loader2, CheckCircle2, X, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import { saveAnalysis } from "@/lib/store";
import type { AnalysisResult } from "@/lib/types";

const MAX_SIZE_MB = 10;
const ALLOWED_TYPES = ["application/pdf", "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const ALLOWED_EXT = [".pdf", ".doc", ".docx"];

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [role, setRole] = useState("");
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [step, setStep] = useState<"idle" | "reading" | "uploading" | "analyzing" | "done">("idle");

  const validateFile = (f: File): string | null => {
    const ext = "." + f.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXT.includes(ext) && !ALLOWED_TYPES.includes(f.type)) {
      return `Định dạng không hỗ trợ. Chỉ nhận PDF, DOC, DOCX.`;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File quá lớn (${(f.size / 1024 / 1024).toFixed(1)} MB). Giới hạn ${MAX_SIZE_MB} MB.`;
    }
    return null;
  };

  const pickFile = (f: File) => {
    const err = validateFile(f);
    if (err) { toast("error", err); return; }
    setFile(f);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) pickFile(e.target.files[0]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) {
      const validationError = validateFile(f);
      if (validationError) { toast("error", validationError); return; }
      setFile(f);
    }
  }, []);

  const handleAnalyze = async () => {
    if (!file) { toast("warning", "Vui lòng tải lên file CV!"); return; }
    if (!role.trim()) { toast("warning", "Vui lòng nhập vị trí ứng tuyển!"); return; }

    setLoading(true);
    setStep("reading");

    try {
      // Step 1: Extract text client-side
      const extractForm = new FormData();
      extractForm.append("file", file);
      const extractRes = await fetch("/api/v1/extract", { method: "POST", body: extractForm });
      if (!extractRes.ok) {
        const err = await extractRes.json().catch(() => ({}));
        throw new Error(err.error ?? "Không thể đọc nội dung file CV.");
      }
      const { text: cvText } = await extractRes.json();

      // Step 2: Run analysis — FastAPI backend → Next.js AI route → local demo
      setStep("analyzing");

      let resultData: Partial<AnalysisResult> = {};
      let isDemo = false;

      // 2a. FastAPI backend (has deterministic scorer + LLM enrichment)
      const backendForm = new FormData();
      backendForm.append("cv", file);
      backendForm.append("role", role.trim());
      if (jd.trim()) backendForm.append("jd", jd.trim());

      const backendRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"}/analyses`,
        { method: "POST", body: backendForm }
      ).catch(() => null);

      if (backendRes?.ok) {
        const data = await backendRes.json();
        // Merge backend result + IDs
        resultData = {
          ...(data.result ?? {}),
          analysis_id: data.analysis_id,
          resume_id: data.resume_id,
          job_id: data.job_id,
        };
      } else {
        // 2b. Next.js AI route (uses OPENAI_API_KEY env var)
        const nextForm = new FormData();
        nextForm.append("cv", file);
        nextForm.append("cvText", cvText);
        nextForm.append("role", role.trim());
        if (jd.trim()) nextForm.append("jd", jd.trim());

        const nextRes = await fetch("/api/v1/analyses", { method: "POST", body: nextForm }).catch(() => null);

        if (nextRes?.ok) {
          const data = await nextRes.json();
          resultData = { ...(data.result ?? {}), analysis_id: data.analysis_id };
        } else {
          // 2c. Local demo fallback
          toast("warning", "Chưa cấu hình AI API — hiển thị kết quả demo.");
          resultData = buildDemoResult(cvText, role.trim());
          isDemo = true;
        }
      }

      const analysis: AnalysisResult = {
        analysis_id: (resultData.analysis_id as string) ?? `local_${Date.now()}`,
        fileName: file.name,
        role: role.trim(),
        jd: jd.trim(),
        createdAt: new Date().toISOString(),
        isDemo,
        total_score: (resultData.total_score as number) ?? 0,
        layout_score: (resultData.layout_score as number) ?? 0,
        content_score: (resultData.content_score as number) ?? 0,
        ats_score: (resultData.ats_score as number) ?? 0,
        keyword_score: (resultData.keyword_score as number) ?? 0,
        skills_score: (resultData.skills_score as number) ?? 0,
        achievement_score: (resultData.achievement_score as number) ?? 0,
        matched_keywords: (resultData.matched_keywords as string[]) ?? [],
        missing_keywords: (resultData.missing_keywords as string[]) ?? [],
        semantic_keywords: (resultData.semantic_keywords as string[]) ?? [],
        suggestions: (resultData.suggestions as AnalysisResult["suggestions"]) ?? [],
        hr_review: resultData.hr_review as AnalysisResult["hr_review"],
        summary: resultData.summary as string,
        strengths: (resultData.strengths as string[]) ?? [],
        weaknesses: (resultData.weaknesses as string[]) ?? [],
        ats_platform_scores: resultData.ats_platform_scores as Record<string, number>,
        resume_id: resultData.resume_id as string,
        job_id: resultData.job_id as string,
      };

      saveAnalysis(analysis);
      setStep("done");
      toast("success", "Phân tích hoàn tất!");
      setTimeout(() => router.push(`/dashboard/analyses/${analysis.analysis_id}`), 600);
    } catch (err: unknown) {
      toast("error", err instanceof Error ? err.message : "Lỗi kết nối. Vui lòng thử lại.");
      setStep("idle");
    } finally {
      setLoading(false);
    }
  };

  const stepLabel: Record<string, string> = {
    reading: "Đang đọc CV...",
    uploading: "Đang tải lên...",
    analyzing: "AI đang phân tích...",
    done: "Hoàn tất!",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="relative w-full h-[180px] md:h-[220px] rounded-3xl overflow-hidden shadow-sm">
        <Image src="/banner-job-prep.png" alt="Phân tích CV" fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent flex flex-col justify-center px-8 md:px-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2 flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-blue-300" /> Phân tích CV mới
          </h1>
          <p className="text-blue-100 max-w-md text-sm md:text-base leading-relaxed">
            Tải lên CV và cung cấp Job Description để AI đánh giá chính xác mức độ phù hợp và tối ưu từ khóa ATS.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Upload Zone (Left - 2 cols) */}
        <div className="lg:col-span-2 flex flex-col h-full">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            className={`flex-1 relative border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 shadow-sm ${
              dragOver
                ? "border-blue-400 bg-blue-50/50 scale-[1.02]"
                : file
                ? "border-emerald-400 bg-emerald-50/50"
                : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-md cursor-pointer"
            }`}
          >
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={loading}
              aria-label="Chọn file CV"
            />
            {file ? (
              <div className="flex flex-col items-center animate-in zoom-in duration-300">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4 shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <p className="text-gray-800 font-bold text-lg max-w-[200px] truncate">{file.name}</p>
                <p className="text-gray-400 text-sm mt-1 font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="mt-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-500 hover:bg-red-100 text-xs font-semibold transition z-20"
                  disabled={loading}
                >
                  <X className="w-3.5 h-3.5" /> Xóa file
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-4 shadow-sm group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="text-gray-800 font-bold text-lg">Kéo thả CV vào đây</h3>
                <p className="text-gray-400 mt-2 text-sm max-w-[180px]">hoặc nhấp để chọn file từ máy tính</p>
                <div className="mt-6 flex gap-2">
                  <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 text-gray-500 rounded-md">PDF</span>
                  <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 text-gray-500 rounded-md">DOCX</span>
                  <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 text-gray-500 rounded-md">&lt;{MAX_SIZE_MB}MB</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Context Form (Right - 3 cols) */}
        <div className="lg:col-span-3 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col space-y-6">
          <div>
            <label htmlFor="role" className="block text-sm font-bold text-gray-700 mb-2">
              Vị trí ứng tuyển <span className="text-red-500">*</span>
            </label>
            <input
              id="role"
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="VD: Frontend Developer, Data Analyst..."
              disabled={loading}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder:text-gray-400 font-medium outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10 transition disabled:opacity-50 disabled:bg-gray-100"
            />
          </div>
          <div className="flex-1 flex flex-col">
            <label htmlFor="jd" className="block text-sm font-bold text-gray-700 mb-2">
              Job Description (JD){" "}
              <span className="text-gray-400 font-normal italic text-xs ml-1">(Đề xuất thêm để AI chấm điểm)</span>
            </label>
            <textarea
              id="jd"
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              disabled={loading}
              placeholder="Dán toàn bộ nội dung Job Description vào đây..."
              className="w-full flex-1 min-h-[140px] bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder:text-gray-400 font-medium outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10 resize-none transition disabled:opacity-50 disabled:bg-gray-100"
            />
          </div>

          {/* Loading progress */}
          {loading && step !== "idle" && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm text-blue-900">{stepLabel[step]}</div>
                <div className="text-blue-600/70 text-xs mt-0.5 font-medium">Vui lòng không đóng trang này...</div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleAnalyze}
              disabled={loading || !file || !role.trim()}
              className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:cursor-not-allowed w-full md:w-auto justify-center"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> {stepLabel[step] ?? "Đang xử lý..."}</>
              ) : (
                <><FileType2 className="w-5 h-5" /> Phân Tích CV Ngay</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Demo result builder (when backend is unavailable) ────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function buildDemoResult(cvText: string, role: string, _jd?: string): Partial<AnalysisResult> {
  const words = cvText.toLowerCase().split(/\s+/);
  const commonKeywords = ["python", "react", "sql", "javascript", "typescript", "excel",
    "figma", "node.js", "java", "git", "aws", "docker", "communication", "leadership"];
  const matched = commonKeywords.filter((k) => words.some((w) => w.includes(k)));
  const missing = commonKeywords.filter((k) => !matched.includes(k)).slice(0, 5);
  const baseScore = 55 + matched.length * 3;

  return {
    total_score: Math.min(baseScore, 95),
    layout_score: 75,
    content_score: 68,
    ats_score: 60 + matched.length * 2,
    keyword_score: 50 + matched.length * 4,
    skills_score: 70,
    achievement_score: 55,
    matched_keywords: matched,
    missing_keywords: missing,
    ats_platform_scores: { workday: 72, taleo: 65, icims: 70, greenhouse: 68, lever: 74, successfactors: 63 },
    suggestions: [
      { category: "keyword", priority: "high", problem: "Thiếu từ khóa quan trọng trong JD", recommendation: `Bổ sung: ${missing.slice(0, 3).join(", ")}`, evidence: "ATS sẽ lọc CV thiếu từ khóa cốt lõi" },
      { category: "achievement", priority: "medium", problem: "Mô tả kinh nghiệm chưa có số liệu định lượng", recommendation: "Thêm con số cụ thể: tăng X%, tiết kiệm Y giờ/tuần...", evidence: "CV có số liệu định lượng được đọc kỹ hơn 40%" },
      { category: "content", priority: "low", problem: "Mục tiêu nghề nghiệp quá chung chung", recommendation: `Cá nhân hóa mục tiêu cho vị trí ${role}`, evidence: "HR thường đọc phần này đầu tiên" },
    ],
    hr_review: {
      first_impression: `CV nhìn tổng thể khá ổn cho vị trí ${role}. Cần cải thiện phần từ khóa để qua ATS.`,
      strengths: ["Cấu trúc CV rõ ràng", "Có liệt kê kỹ năng kỹ thuật", "Kinh nghiệm được mô tả theo thứ tự thời gian"],
      concerns: ["Tỷ lệ khớp từ khóa với JD còn thấp", "Thiếu số liệu định lượng trong thành tích", "Mục tiêu nghề nghiệp chưa cụ thể"],
      priority_actions: [`Thêm từ khóa: ${missing.slice(0, 3).join(", ")}`, "Viết lại ít nhất 2 bullet điểm với số liệu cụ thể", `Tùy chỉnh mục tiêu cho vị trí ${role}`],
    },
    summary: `CV của bạn có nền tảng tốt nhưng cần được tối ưu để vượt qua hệ thống ATS và thu hút HR cho vị trí ${role}.`,
    strengths: ["Cấu trúc CV rõ ràng, dễ đọc", `Có ${matched.length} kỹ năng phù hợp với ${role}`],
    weaknesses: ["Tỷ lệ khớp từ khóa ATS chưa cao", "Thiếu số liệu định lượng cho thành tích"],
  };
}
