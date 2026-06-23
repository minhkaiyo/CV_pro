import { Metadata } from "next";
import { ProductPage } from "@/components/product-page";
export const metadata: Metadata = { title: "CVision cho Kỹ thuật & Sản xuất" };
export default function EngineeringPage() {
  return (
    <ProductPage
      breadcrumb="SOLUTIONS / Kỹ thuật & Sản xuất"
      headline={"CV kỹ thuật.\nRõ ràng. Đo được. ATS-ready."}
      subheadline="Mechanical, Electrical, Civil, Industrial Engineering — mỗi ngành có bộ từ khóa ATS riêng. CVision đảm bảo CV của bạn chứa đúng technical terminology mà nhà tuyển dụng đang tìm."
      cta={{ label: "Phân tích CV ngay", href: "/dashboard/upload" }}
      features={[
        {
          eyebrow: "ENGINEERING CV",
          title: "Technical skills cần được list đúng cách.",
          body: "Kỹ sư thường list quá nhiều tool mà không có context. CVision giúp rewrite từ 'Used AutoCAD' thành 'Designed 15+ mechanical components using AutoCAD, reducing prototyping time by 30%'.",
          bullets: [
            "Engineering keyword library: 500+ technical terms",
            "CAD/CAM, PLC, QA/QC, ISO, Lean Manufacturing",
            "Template format chuẩn cho engineering CV",
            "Gợi ý bổ sung certifications (Six Sigma, PMP)",
          ],
        },
      ]}
      relatedLinks={[
        { label: "Smart Editor", href: "/product/smart-editor" },
        { label: "ATS Scanner",  href: "/product/ats-scanner" },
      ]}
    />
  );
}
