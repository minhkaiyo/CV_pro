import { Metadata } from "next";
import { ProductPage } from "@/components/product-page";
export const metadata: Metadata = { title: "Workflows — CVision AI" };
export default function WorkflowsPage() {
  return (
    <ProductPage
      breadcrumb="PRODUCT / Workflows"
      headline={"Tự động hoá\nquy trình tìm việc."}
      subheadline="Workflows cho phép bạn tạo các pipeline tự động: upload CV → phân tích → tạo phiên bản tối ưu → gửi → theo dõi. Không cần thao tác thủ công từng bước."
      cta={{ label: "Xem dashboard", href: "/dashboard" }}
      features={[
        {
          eyebrow: "AUTOMATION",
          title: "Pipeline từ CV đến offer letter.",
          body: "Định nghĩa workflow một lần, áp dụng cho hàng chục job application. CVision tự động chạy phân tích, tạo CV tối ưu và tạo cover letter theo từng JD.",
          bullets: [
            "Trigger: upload CV mới hoặc add job mới",
            "Action: auto-scan, auto-optimize, auto-draft cover letter",
            "Notification: email khi workflow hoàn thành",
          ],
        },
      ]}
      relatedLinks={[
        { label: "AI Agent",    href: "/product/ai-agent" },
        { label: "CV Versions", href: "/product/cv-versions" },
      ]}
    />
  );
}
