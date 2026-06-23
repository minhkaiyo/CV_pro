import { Metadata } from "next";
import { ProductPage } from "@/components/product-page";

export const metadata: Metadata = { title: "CVision aOS — CVision AI" };

export default function CVisionAOSPage() {
  return (
    <ProductPage
      breadcrumb="PRODUCT / CVision aOS"
      headline={"Hệ điều hành sự nghiệp.\nToàn diện. Thông minh."}
      subheadline="CVision aOS™ là nền tảng tích hợp toàn bộ vòng đời tìm việc: phân tích CV, tối ưu hóa, quản lý ứng tuyển, theo dõi tiến độ và giả lập phỏng vấn trong một hệ thống duy nhất."
      cta={{ label: "Khám phá aOS", href: "/dashboard" }}
      features={[
        {
          eyebrow: "UNIFIED PLATFORM",
          title: "Mọi công cụ. Một nơi.",
          body: "ATS Scanner, Smart Editor, AI Agent, CV Versions, Cover Letter, Application Tracker — tất cả được kết nối và chia sẻ dữ liệu với nhau. Upload CV một lần, dùng mãi mãi.",
          bullets: [
            "ATS Scanner — biết điểm yếu trước khi nộp",
            "Smart Editor — sửa có kiểm soát với AI",
            "Application Tracker — kanban theo dõi ứng tuyển",
            "HR Simulation — giả lập nhà tuyển dụng đọc CV",
          ],
        },
        {
          eyebrow: "DATA LAYER",
          title: "CV của bạn là dữ liệu cấu trúc.",
          body: "CVision không chỉ lưu file PDF — mà parse CV thành structured JSON với đầy đủ section, kinh nghiệm, kỹ năng, giáo dục. Mọi tính năng AI đều chạy trên data layer này.",
          side: "right",
        },
      ]}
      relatedLinks={[
        { label: "ATS Scanner",  href: "/product/ats-scanner" },
        { label: "Smart Editor", href: "/product/smart-editor" },
        { label: "AI Agent",     href: "/product/ai-agent" },
        { label: "CV Versions",  href: "/product/cv-versions" },
      ]}
    />
  );
}
