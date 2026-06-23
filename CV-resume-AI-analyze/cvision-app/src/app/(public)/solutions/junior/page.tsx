import { Metadata } from "next";
import { ProductPage } from "@/components/product-page";
export const metadata: Metadata = { title: "CVision cho Junior (1-3 năm)" };
export default function JuniorPage() {
  return (
    <ProductPage
      breadcrumb="SOLUTIONS / Junior 1-3 năm"
      headline={"Từ Junior\nthành ứng viên đáng chú ý."}
      subheadline="Sau 1-3 năm đầu, bạn đã có đủ kinh nghiệm để compete ở level cao hơn — nhưng CV chưa reflect được điều đó. CVision giúp bạn articulate impact thực sự của công việc đã làm."
      cta={{ label: "Nâng cấp CV ngay", href: "/dashboard/upload" }}
      features={[
        {
          eyebrow: "LEVEL UP CV",
          title: "Chuyển từ task-based sang impact-based.",
          body: "Junior CV thường mô tả nhiệm vụ ('Maintained codebase') thay vì impact ('Refactored authentication module, reducing bug reports by 60%'). Smart Editor giúp bạn reframe toàn bộ experience theo hướng này.",
          bullets: [
            "Rewrite từ task description sang achievement format",
            "Thêm số liệu ước tính khi chưa có exact metrics",
            "Highlight leadership và ownership signals",
            "ATS keyword boost cho mid-level positions",
          ],
        },
      ]}
      relatedLinks={[
        { label: "Smart Editor", href: "/product/smart-editor" },
        { label: "ATS Scanner",  href: "/product/ats-scanner" },
        { label: "AI Agent",     href: "/product/ai-agent" },
      ]}
    />
  );
}
