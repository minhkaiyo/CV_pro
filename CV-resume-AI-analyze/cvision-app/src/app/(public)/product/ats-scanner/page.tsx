import { Metadata } from "next";
import { ProductPage } from "@/components/product-page";

export const metadata: Metadata = {
  title: "ATS Scanner — CVision AI",
  description: "Quét và chấm điểm CV của bạn theo 6 tiêu chí ATS chuyên sâu",
};

const ScoreMockup = () => (
  <div className="w-full space-y-4 text-[13px]">
    <div className="flex items-end justify-between mb-2">
      <span className="text-zinc-400">ATS Match Score</span>
      <span className="text-4xl font-light text-emerald-400">92<span className="text-xl text-zinc-600">%</span></span>
    </div>
    {[
      { label: "Workday", val: 94, color: "bg-emerald-500" },
      { label: "Taleo",   val: 88, color: "bg-emerald-500" },
      { label: "iCIMS",   val: 91, color: "bg-emerald-500" },
      { label: "Greenhouse", val: 85, color: "bg-amber-500" },
      { label: "Lever",   val: 90, color: "bg-emerald-500" },
    ].map((p) => (
      <div key={p.label}>
        <div className="flex justify-between text-[12px] text-zinc-500 mb-1">
          <span>{p.label}</span><span>{p.val}%</span>
        </div>
        <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
          <div className={`h-full ${p.color} rounded-full`} style={{ width: `${p.val}%` }} />
        </div>
      </div>
    ))}
  </div>
);

const KeywordMockup = () => (
  <div className="w-full space-y-3 text-[12px]">
    <div className="text-[11px] text-zinc-500 uppercase tracking-wider mb-3">Keyword Analysis</div>
    <div>
      <div className="text-zinc-500 mb-2">Matched (8)</div>
      <div className="flex flex-wrap gap-1.5">
        {["Python", "React", "SQL", "Git", "Docker", "AWS", "Agile", "TypeScript"].map((k) => (
          <span key={k} className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{k}</span>
        ))}
      </div>
    </div>
    <div>
      <div className="text-zinc-500 mb-2 mt-4">Missing (3)</div>
      <div className="flex flex-wrap gap-1.5">
        {["Kubernetes", "Terraform", "CI/CD"].map((k) => (
          <span key={k} className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">{k}</span>
        ))}
      </div>
    </div>
  </div>
);

export default function ATSScannerPage() {
  return (
    <ProductPage
      breadcrumb="PRODUCT / ATS Scanner"
      headline={"CV của bạn,\nlọt qua mọi hệ thống ATS."}
      subheadline="CVision ATS Scanner phân tích CV theo 6 nền tảng tuyển dụng phổ biến nhất — Workday, Taleo, iCIMS, Greenhouse, Lever, SuccessFactors — và chỉ ra chính xác những gì cần cải thiện."
      cta={{ label: "Quét CV ngay", href: "/dashboard/upload" }}
      heroMockup={<ScoreMockup />}
      features={[
        {
          eyebrow: "PHÂN TÍCH CHUYÊN SÂU",
          title: "6 nền tảng ATS. 1 lần phân tích.",
          body: "Thay vì đoán mò, CVision kiểm tra CV của bạn trên từng ATS system mà nhà tuyển dụng đang dùng và cho điểm từng hệ thống riêng biệt.",
          bullets: [
            "Workday — phổ biến ở ngân hàng, tập đoàn lớn",
            "Taleo — dùng nhiều ở công ty đa quốc gia",
            "Greenhouse & Lever — startup và tech company",
            "iCIMS & SuccessFactors — enterprise HR system",
          ],
          mockup: (
            <div className="w-full space-y-3 text-[13px]">
              {[
                { platform: "Workday",      score: 94, status: "Excellent" },
                { platform: "Taleo",        score: 78, status: "Good" },
                { platform: "Greenhouse",   score: 85, status: "Good" },
                { platform: "Lever",        score: 90, status: "Excellent" },
                { platform: "SuccessFactors", score: 71, status: "Fair" },
              ].map((p) => (
                <div key={p.platform} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-zinc-300">{p.platform}</span>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      p.score >= 90 ? "bg-emerald-500/10 text-emerald-400" :
                      p.score >= 80 ? "bg-amber-500/10 text-amber-400" :
                      "bg-zinc-500/10 text-zinc-400"
                    }`}>{p.status}</span>
                    <span className="text-white font-mono w-8 text-right">{p.score}</span>
                  </div>
                </div>
              ))}
            </div>
          ),
        },
        {
          eyebrow: "TỪ KHÓA THÔNG MINH",
          title: "Không chỉ exact match — AI hiểu ngữ nghĩa.",
          body: "CVision phát hiện cả từ khóa khớp trực tiếp (Python) lẫn từ khóa ngữ nghĩa (scripting language → Python). Đảm bảo bạn không bỏ lỡ điểm số vì viết khác từ.",
          side: "right",
          mockup: <KeywordMockup />,
        },
        {
          eyebrow: "GỢI Ý HÀNH ĐỘNG",
          title: "Biết điểm yếu. Biết cách sửa ngay.",
          body: "Mỗi gợi ý đều có evidence cụ thể — không phải lời khuyên chung chung. CVision chỉ rõ section nào, dòng nào, và cách rewrite để tăng điểm tối đa.",
          bullets: [
            "Gợi ý ưu tiên theo impact (High / Medium / Low)",
            "Rewrite suggestion cụ thể từng bullet point",
            "Cảnh báo formatting gây ATS parse lỗi (table, column, image)",
          ],
        },
      ]}
      relatedLinks={[
        { label: "Smart Editor", href: "/product/smart-editor" },
        { label: "CV Versions",  href: "/product/cv-versions" },
        { label: "AI Agent",     href: "/product/ai-agent" },
      ]}
    />
  );
}
