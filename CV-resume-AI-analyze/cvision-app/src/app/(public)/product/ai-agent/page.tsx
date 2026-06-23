import { Metadata } from "next";
import { ProductPage } from "@/components/product-page";

export const metadata: Metadata = {
  title: "AI Agent — CVision AI",
  description: "Agent tự động phân tích, tối ưu và tạo phiên bản CV theo từng JD",
};

const AgentMockup = () => (
  <div className="w-full space-y-3 text-[13px]">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      <span className="text-zinc-400 text-[12px]">AI Agent đang xử lý...</span>
    </div>
    {[
      { step: "1", label: "Đọc CV & trích xuất cấu trúc", done: true },
      { step: "2", label: "Phân tích Job Description",      done: true },
      { step: "3", label: "Trích xuất 24 từ khóa từ JD",   done: true },
      { step: "4", label: "Tạo Skill Target Plan",          done: true },
      { step: "5", label: "Generate 8 targeted diffs",      active: true },
      { step: "6", label: "Verify & refine output",         pending: true },
    ].map((s) => (
      <div key={s.step} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${
        s.active ? "bg-white/[0.06] border border-white/10" : "opacity-60"
      }`}>
        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
          s.done ? "bg-emerald-500/20 text-emerald-400" :
          s.active ? "bg-white/20 text-white" : "bg-white/[0.04] text-zinc-600"
        }`}>
          {s.done ? "✓" : s.step}
        </div>
        <span className={s.done ? "text-zinc-400 line-through" : s.active ? "text-white" : "text-zinc-600"}>
          {s.label}
        </span>
        {s.active && <div className="ml-auto w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
      </div>
    ))}
  </div>
);

export default function AIAgentPage() {
  return (
    <ProductPage
      breadcrumb="PRODUCT / AI Agent"
      headline={"Upload JD.\nNhận CV tối ưu trong 60 giây."}
      subheadline="AI Agent tự động chạy toàn bộ pipeline: phân tích JD, trích xuất từ khóa, tạo targeted diffs, verify và refine — không cần bạn làm gì thêm."
      cta={{ label: "Thử AI Agent ngay", href: "/dashboard/upload" }}
      heroMockup={<AgentMockup />}
      features={[
        {
          eyebrow: "FULL PIPELINE",
          title: "Tự động từ đầu đến cuối.",
          body: "Chỉ cần upload CV và paste JD. Agent sẽ chạy 6 bước xử lý tuần tự: parse → extract keywords → skill-target plan → generate diffs → apply → verify. Kết quả trong dưới 60 giây.",
          mockup: <AgentMockup />,
        },
        {
          eyebrow: "TARGETED DIFFS",
          title: "Không rewrite toàn bộ — chỉ sửa những gì cần.",
          body: "Agent tạo ra các surgical diffs nhắm vào đúng phần cần cải thiện. Không phải template CV mới — mà là phiên bản tối ưu của chính CV bạn.",
          side: "right",
          bullets: [
            "Chỉ thay đổi bullet points thiếu từ khóa quan trọng",
            "Giữ nguyên toàn bộ thông tin cá nhân và lịch sử",
            "Confidence score cho từng thay đổi",
            "Preview diff trước khi export",
          ],
        },
        {
          eyebrow: "MULTI-PROVIDER LLM",
          title: "Chạy trên bất kỳ AI provider nào.",
          body: "CVision Agent hỗ trợ OpenAI, Anthropic Claude, Google Gemini, DeepSeek, Groq và cả local models (Ollama). Tự cấu hình model theo ngân sách và nhu cầu.",
          bullets: [
            "OpenAI GPT-4o / GPT-4o-mini",
            "Anthropic Claude Haiku / Sonnet",
            "Google Gemini Flash / Pro",
            "Local: Ollama, llama.cpp, LM Studio",
          ],
        },
      ]}
      relatedLinks={[
        { label: "Smart Editor", href: "/product/smart-editor" },
        { label: "ATS Scanner",  href: "/product/ats-scanner" },
        { label: "CV Versions",  href: "/product/cv-versions" },
      ]}
    />
  );
}
