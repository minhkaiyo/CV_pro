import { Metadata } from "next";
import { ProductPage } from "@/components/product-page";

export const metadata: Metadata = {
  title: "Smart Editor — CVision AI",
  description: "Chỉnh sửa CV thông minh với AI diff — xem trước mọi thay đổi trước khi áp dụng",
};

const DiffMockup = () => (
  <div className="w-full space-y-3 text-[12px]">
    <div className="text-[11px] text-zinc-500 uppercase tracking-wider mb-4">Edit Suggestions — 3 available</div>
    {[
      {
        before: "Responsible for frontend development tasks",
        after: "Led frontend development for 3 key features, reducing page load time by 40%",
        conf: "high",
      },
      {
        before: "Worked with SQL databases",
        after: "Designed and optimized PostgreSQL schemas serving 50K+ daily active users",
        conf: "high",
      },
    ].map((d, i) => (
      <div key={i} className="rounded-xl border border-white/[0.06] overflow-hidden">
        <div className="px-3 py-2 bg-red-500/[0.06] border-b border-white/[0.04]">
          <span className="text-red-400/70 line-through text-[11px]">{d.before}</span>
        </div>
        <div className="px-3 py-2 bg-emerald-500/[0.06]">
          <span className="text-emerald-400 text-[11px]">{d.after}</span>
        </div>
        <div className="px-3 py-2 flex items-center justify-between bg-white/[0.02]">
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] border border-emerald-500/20">High confidence</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded-lg text-[11px] text-zinc-400 hover:bg-white/[0.06] transition">Skip</button>
            <button className="px-3 py-1 rounded-lg text-[11px] bg-white text-black font-medium hover:bg-zinc-200 transition">Apply</button>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default function SmartEditorPage() {
  return (
    <ProductPage
      breadcrumb="PRODUCT / Smart Editor"
      headline={"Sửa CV với AI.\nKiểm soát từng thay đổi."}
      subheadline="Smart Editor không viết lại CV của bạn — nó đề xuất những thay đổi có mục tiêu, giải thích lý do, và để bạn quyết định apply hay bỏ qua từng dòng."
      cta={{ label: "Thử Smart Editor", href: "/dashboard/cv-versions" }}
      heroMockup={<DiffMockup />}
      features={[
        {
          eyebrow: "DIFF-BASED EDITING",
          title: "Không overwrite — chỉ gợi ý có kiểm soát.",
          body: "Mỗi thay đổi được trình bày dạng diff: trước và sau. Bạn thấy chính xác AI muốn đổi gì, tại sao, và confidence level là bao nhiêu trước khi apply.",
          bullets: [
            "Before/after preview cho từng bullet point",
            "Confidence: High / Medium / Low với lý do cụ thể",
            "Apply tất cả hoặc từng thay đổi một",
            "Undo bất cứ lúc nào",
          ],
          mockup: <DiffMockup />,
        },
        {
          eyebrow: "TRUTHFULNESS GUARD",
          title: "AI không bao giờ bịa đặt thông tin của bạn.",
          body: "Smart Editor có bộ quy tắc cứng: không thay đổi tên, email, số điện thoại, tên công ty, trường học, bằng cấp, ngày tháng. Không thêm số liệu không có trong CV gốc.",
          side: "right",
          bullets: [
            "Personal info 100% được bảo vệ",
            "Ngày tháng không bị mất độ chính xác",
            "Số liệu chỉ được rewrite, không được tạo mới",
            "Skills chỉ được thêm nếu bạn xác nhận có kỹ năng đó",
          ],
        },
      ]}
      relatedLinks={[
        { label: "ATS Scanner",  href: "/product/ats-scanner" },
        { label: "CV Versions",  href: "/product/cv-versions" },
        { label: "AI Agent",     href: "/product/ai-agent" },
      ]}
    />
  );
}
