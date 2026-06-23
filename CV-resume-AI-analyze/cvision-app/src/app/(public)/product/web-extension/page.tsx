import { Metadata } from "next";
import { ProductPage } from "@/components/product-page";
export const metadata: Metadata = { title: "Web Extension — CVision AI" };
export default function WebExtensionPage() {
  return (
    <ProductPage
      breadcrumb="PRODUCT / Web Extension"
      headline={"Tối ưu CV ngay\ntrên trình duyệt."}
      subheadline="CVision Web Extension hoạt động trực tiếp khi bạn đang đọc JD trên TopCV, LinkedIn hay Indeed — highlight từ khóa quan trọng và hiển thị match score ngay lập tức."
      cta={{ label: "Tải extension", href: "/register" }}
      features={[
        {
          eyebrow: "BROWSER NATIVE",
          title: "Phân tích JD mà không cần copy-paste.",
          body: "Chỉ cần mở trang JD bất kỳ, extension tự động phát hiện job description, trích xuất từ khóa và so sánh với CV master của bạn. Match score hiện ngay góc màn hình.",
          bullets: [
            "Hỗ trợ TopCV, LinkedIn, Indeed, VietnamWorks",
            "Highlight từ khóa missing trực tiếp trên trang JD",
            "One-click optimize với AI Agent",
          ],
        },
      ]}
      relatedLinks={[
        { label: "AI Agent",     href: "/product/ai-agent" },
        { label: "ATS Scanner",  href: "/product/ats-scanner" },
      ]}
    />
  );
}
