"use client";

import { useState } from "react";
import Image from "next/image";
import { PenLine, Download, Loader2, Copy, RefreshCw, FileText, Sparkles } from "lucide-react";
import { getCVVersions, getAnalyses } from "@/lib/store";
import type { CVVersion, AnalysisResult } from "@/lib/types";
import { toast } from "@/components/ui/toast";

export default function CoverLetterPage() {
  const [cvVersions] = useState<CVVersion[]>(() =>
    typeof window !== "undefined" ? getCVVersions() : []
  );
  const [analyses] = useState<AnalysisResult[]>(() =>
    typeof window !== "undefined" ? getAnalyses() : []
  );
  const [selectedSource, setSelectedSource] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jd, setJd] = useState("");
  const [tone, setTone] = useState("professional");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!jobTitle.trim()) { toast("warning", "Vui lòng nhập vị trí ứng tuyển!"); return; }

    setLoading(true);
    setResult("");
    try {
      // Find resume markdown from selected source
      let resumeMarkdown = "";
      if (selectedSource) {
        const version = cvVersions.find((v) => v.id === selectedSource);
        const analysis = analyses.find((a) => a.analysis_id === selectedSource);
        resumeMarkdown = version?.optimized_markdown ?? analysis?.fileName ?? "";
      }

      const { apiGenerateCoverLetter } = await import("@/lib/api");
      const data = await apiGenerateCoverLetter({
        job_title: jobTitle.trim(),
        company_name: company.trim() || undefined,
        job_description: jd.trim() || undefined,
        resume_markdown: resumeMarkdown || undefined,
        tone,
      });
      setResult(data.cover_letter ?? "");
      toast("success", "Cover letter đã được tạo!");
    } catch {
      // Demo fallback
      setResult(buildDemoCoverLetter(jobTitle, company, tone));
      toast("warning", "Backend chưa kết nối — hiển thị mẫu demo.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    toast("success", "Đã sao chép vào clipboard!");
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cover-letter-${jobTitle.replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast("success", "Đã tải xuống file!");
  };

  const sources = [
    ...analyses.map((a) => ({ id: a.analysis_id, label: `📄 ${a.fileName} (${a.role})` })),
    ...cvVersions.map((v) => ({ id: v.id, label: `✨ ${v.title}` })),
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="relative w-full h-[180px] md:h-[220px] rounded-3xl overflow-hidden shadow-sm">
        <Image src="/banner-job-prep.png" alt="Cover Letter" fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent flex flex-col justify-center px-8 md:px-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2 flex items-center gap-2">
            <PenLine className="w-8 h-8 text-blue-300" /> Tạo Cover Letter
          </h1>
          <p className="text-blue-100 max-w-md text-sm md:text-base leading-relaxed">
            Để AI viết một lá thư xin việc cá nhân hóa, chuyên nghiệp dựa trên CV của bạn và JD.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form */}
        <div className="lg:col-span-5 space-y-5 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm h-fit">
          {sources.length > 0 && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Chọn CV nguồn (tuỳ chọn)</label>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10 transition"
              >
                <option value="">— Không chọn —</option>
                {sources.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Vị trí ứng tuyển <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="VD: Frontend Developer, Data Analyst..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Tên công ty / Gửi đến HR</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="VD: Gửi bộ phận Tuyển dụng VNG..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Giọng văn (Tone)</label>
            <div className="flex gap-2">
              {[["professional", "Chuyên nghiệp"], ["concise", "Ngắn gọn"], ["enthusiastic", "Nhiệt huyết"]].map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => setTone(v)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    tone === v 
                      ? "bg-blue-600 text-white border-blue-600 shadow-md" 
                      : "bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả công việc (JD)</label>
            <textarea
              rows={4}
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Dán nội dung JD vào đây để AI viết sát hơn..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10 resize-none transition"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !jobTitle.trim()}
            className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mt-4"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Đang soạn thảo...</> : <><Sparkles className="w-5 h-5" /> Tạo Cover Letter bằng AI</>}
          </button>
        </div>

        {/* Output */}
        <div className="lg:col-span-7 bg-white border border-gray-100 rounded-3xl p-6 md:p-8 flex flex-col min-h-[600px] shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" /> Bản nháp Cover Letter
            </h3>
            {result && (
              <div className="flex gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
                <button onClick={handleGenerate} className="text-gray-500 hover:text-blue-600 hover:bg-white transition p-2 rounded-lg font-medium text-xs flex items-center gap-1.5 shadow-sm" title="Tạo lại">
                  <RefreshCw className="w-3.5 h-3.5" /> Tạo lại
                </button>
                <button onClick={handleCopy} className="text-gray-500 hover:text-blue-600 hover:bg-white transition p-2 rounded-lg font-medium text-xs flex items-center gap-1.5 shadow-sm" title="Sao chép">
                  <Copy className="w-3.5 h-3.5" /> Copy
                </button>
                <button onClick={handleDownload} className="text-gray-500 hover:text-blue-600 hover:bg-white transition p-2 rounded-lg font-medium text-xs flex items-center gap-1.5 shadow-sm" title="Tải xuống">
                  <Download className="w-3.5 h-3.5" /> Tải về
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 bg-gray-50/50 border border-gray-100 rounded-2xl p-6 md:p-8 overflow-y-auto text-[15px] text-gray-700 leading-relaxed font-serif whitespace-pre-wrap relative shadow-inner">
            {loading ? (
              <div className="flex items-center gap-4 text-blue-500 h-full justify-center flex-col absolute inset-0 bg-white/80 backdrop-blur-sm z-10">
                <Loader2 className="w-10 h-10 animate-spin" />
                <span className="font-bold">AI đang soạn thảo Cover Letter...</span>
              </div>
            ) : result ? (
              result
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                <PenLine className="w-16 h-16 text-gray-200 mb-4" />
                <p className="font-medium">Kết quả sẽ xuất hiện ở đây sau khi bạn nhấn<br/><span className="text-gray-500 font-bold">&ldquo;Tạo Cover Letter bằng AI&rdquo;</span>.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function buildDemoCoverLetter(jobTitle: string, company: string, tone: string): string {
  const companyLine = company ? `Kính gửi Bộ phận Tuyển dụng ${company},` : "Kính gửi Nhà tuyển dụng,";

  return `${companyLine}

Tôi viết thư này để bày tỏ sự quan tâm đến vị trí ${jobTitle} mà quý công ty đang tuyển dụng. Thông qua thông tin tuyển dụng, tôi nhận thấy định hướng phát triển của công ty hoàn toàn phù hợp với mục tiêu nghề nghiệp của tôi.

${tone === "enthusiastic" ? "Tôi vô cùng hứng khởi khi được biết đến cơ hội này. Tôi đã theo dõi các dự án của công ty từ lâu và luôn mong muốn được trở thành một phần của đội ngũ tài năng này." : "Với kinh nghiệm tích lũy, tôi tự tin mình có thể đóng góp hiệu quả vào các dự án và sự phát triển chung của công ty."}

Trong quá trình học tập và làm việc trước đây, tôi đã:
• Phát triển các kỹ năng cốt lõi đáp ứng trực tiếp yêu cầu của vị trí ${jobTitle}.
• Tham gia xử lý và hoàn thành các dự án với thái độ làm việc nhóm tích cực.
• Luôn nỗ lực học hỏi để nâng cao năng lực chuyên môn và thích ứng nhanh với môi trường mới.

${tone === "concise" ? "Tôi hy vọng có cơ hội thảo luận chi tiết hơn về cách tôi có thể đóng góp cho công ty trong một buổi phỏng vấn." : "Tôi tin rằng tinh thần ham học hỏi và nền tảng kỹ năng hiện tại sẽ giúp tôi bắt nhịp nhanh chóng và tạo ra giá trị thực tiễn. Tôi rất mong có cơ hội được trình bày chi tiết hơn về năng lực của mình trong một buổi phỏng vấn trực tiếp."}

Cảm ơn anh/chị đã dành thời gian xem xét thư ứng tuyển và hồ sơ đính kèm.

Trân trọng,

[Họ và tên của bạn]
[Số điện thoại]
[Email]`;
}
