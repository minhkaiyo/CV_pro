import { Metadata } from "next";
import { ProductPage } from "@/components/product-page";

export const metadata: Metadata = {
  title: "CV Versions — CVision AI",
  description: "Quản lý nhiều phiên bản CV tối ưu theo từng vị trí ứng tuyển",
};

const VersionsMockup = () => (
  <div className="w-full space-y-2 text-[12px]">
    {[
      { title: "Frontend Dev — Techcombank",   role: "Frontend Developer", status: "ready",   score: 94 },
      { title: "Data Analyst — VNG",           role: "Data Analyst",       status: "ready",   score: 88 },
      { title: "Product Manager — MoMo",       role: "Product Manager",    status: "draft",   score: 71 },
      { title: "Backend Dev — FPT Software",   role: "Backend Developer",  status: "exported", score: 91 },
    ].map((v) => (
      <div key={v.title} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-white/10 transition">
        <div className="min-w-0 mr-3">
          <div className="text-zinc-200 font-medium truncate">{v.title}</div>
          <div className="text-zinc-600 text-[11px]">{v.role}</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`px-2 py-0.5 rounded-full text-[10px] border ${
            v.status === "ready"    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
            v.status === "exported" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
            "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
          }`}>{v.status}</span>
          <span className={`font-mono text-[12px] ${v.score >= 90 ? "text-emerald-400" : v.score >= 80 ? "text-amber-400" : "text-zinc-400"}`}>
            {v.score}
          </span>
        </div>
      </div>
    ))}
  </div>
);

export default function CVVersionsPage() {
  return (
    <ProductPage
      breadcrumb="PRODUCT / CV Versions"
      headline={"Một CV gốc.\nVô số phiên bản tối ưu."}
      subheadline="Mỗi vị trí ứng tuyển có yêu cầu khác nhau. CV Versions giúp bạn tạo và quản lý hàng chục phiên bản CV được cá nhân hóa — không cần tạo từ đầu mỗi lần."
      cta={{ label: "Tạo phiên bản CV", href: "/dashboard/cv-versions" }}
      heroMockup={<VersionsMockup />}
      features={[
        {
          eyebrow: "QUẢN LÝ TẬP TRUNG",
          title: "Tất cả phiên bản CV trong một nơi.",
          body: "Dashboard CV Versions cho bạn thấy toàn bộ các phiên bản đã tạo: tên vị trí, công ty, điểm ATS, trạng thái và ngày tạo. Tìm kiếm, lọc và tải xuống bất cứ lúc nào.",
          mockup: <VersionsMockup />,
        },
        {
          eyebrow: "DIFF VIEW",
          title: "Xem chính xác AI đã thay đổi gì.",
          body: "Mỗi CV version đi kèm Diff View — bảng so sánh từng thay đổi giữa CV gốc và phiên bản tối ưu. Transparency 100%: không có gì bị sửa mà bạn không biết.",
          side: "right",
          bullets: [
            "Before/after cho từng bullet point",
            "Lý do thay đổi và confidence level",
            "Apply hoặc reject từng thay đổi riêng lẻ",
            "Export sau khi đã review và approve",
          ],
        },
        {
          eyebrow: "EXPORT",
          title: "Xuất PDF chuẩn ATS trong 1 click.",
          body: "Premium users có thể export bất kỳ phiên bản nào sang PDF được render bởi Playwright — đảm bảo formatting đúng, font đúng, không bị lỗi parse khi upload lên ATS.",
          bullets: [
            "PDF chuẩn ATS — không dùng table, image trong text flow",
            "Multiple templates: Classic, Modern, Minimal",
            "DOCX export cho các hệ thống yêu cầu Word",
          ],
        },
      ]}
      relatedLinks={[
        { label: "Smart Editor",  href: "/product/smart-editor" },
        { label: "ATS Scanner",   href: "/product/ats-scanner" },
        { label: "AI Agent",      href: "/product/ai-agent" },
      ]}
    />
  );
}
