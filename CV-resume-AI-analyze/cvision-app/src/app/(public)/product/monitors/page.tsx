import { Metadata } from "next";
import { ProductPage } from "@/components/product-page";
export const metadata: Metadata = { title: "Monitors — CVision AI" };
export default function MonitorsPage() {
  return (
    <ProductPage
      breadcrumb="PRODUCT / Monitors"
      headline={"Theo dõi thị trường\ntuyển dụng real-time."}
      subheadline="Monitors tự động scan các job board và thông báo khi có JD mới phù hợp với profile của bạn — giúp bạn nộp đơn sớm trước hàng nghìn ứng viên khác."
      cta={{ label: "Đăng ký early access", href: "/register" }}
      features={[
        {
          eyebrow: "JOB ALERTS",
          title: "Không bỏ lỡ cơ hội nào.",
          body: "Đặt keyword, ngành, địa điểm và mức lương mong muốn. Monitors scan liên tục và gửi alert ngay khi có match — kèm match score so với CV của bạn.",
          bullets: [
            "Scan TopCV, LinkedIn, Indeed, VietnamWorks mỗi 6 giờ",
            "Match score tự động với CV master",
            "Alert qua email hoặc notification",
            "One-click tạo CV tối ưu cho JD mới",
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
