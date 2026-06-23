import { Metadata } from "next";
import { ProductPage } from "@/components/product-page";
export const metadata: Metadata = { title: "Mobile App — CVision AI" };
export default function MobileAppPage() {
  return (
    <ProductPage
      breadcrumb="PRODUCT / Mobile App"
      headline={"CVision trên\nmọi thiết bị."}
      subheadline="Ứng dụng di động CVision cho phép bạn xem kết quả phân tích, nhận thông báo khi AI hoàn thành và theo dõi ứng tuyển mọi lúc mọi nơi. Coming soon."
      cta={{ label: "Nhận thông báo ra mắt", href: "/register" }}
      features={[
        {
          eyebrow: "COMING SOON",
          title: "iOS & Android — Q3 2026.",
          body: "Mobile app CVision đang trong quá trình phát triển. Đăng ký để nhận thông báo đầu tiên khi app ra mắt.",
          bullets: [
            "Xem điểm ATS và gợi ý cải thiện",
            "Theo dõi application status trên Kanban board",
            "Nhận thông báo push khi AI hoàn thành phân tích",
            "Quick-upload ảnh CV từ camera",
          ],
        },
      ]}
      relatedLinks={[
        { label: "Web Extension", href: "/product/web-extension" },
        { label: "AI Agent",      href: "/product/ai-agent" },
      ]}
    />
  );
}
