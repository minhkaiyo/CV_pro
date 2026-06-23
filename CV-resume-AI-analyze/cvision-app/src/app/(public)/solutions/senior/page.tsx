import { Metadata } from "next";
import { ProductPage } from "@/components/product-page";
export const metadata: Metadata = { title: "CVision cho Senior & Lead" };
export default function SeniorPage() {
  return (
    <ProductPage
      breadcrumb="SOLUTIONS / Senior & Lead"
      headline={"Senior CV.\nStrategic. Measurable. Compelling."}
      subheadline="Ở cấp Senior và Lead, CV không chỉ cần keyword — cần thể hiện được scope, ownership và business impact. CVision giúp bạn articulate đúng những gì hiring manager cấp cao tìm kiếm."
      cta={{ label: "Tối ưu CV Senior", href: "/dashboard/upload" }}
      features={[
        {
          eyebrow: "SENIOR-LEVEL POSITIONING",
          title: "Không phải list skills — mà là tell a story.",
          body: "Senior CV cần cho thấy: bạn đã dẫn dắt gì, thay đổi gì, và impact tổ chức ra sao. CVision giúp restructure narrative từ individual contributor sang strategic contributor.",
          bullets: [
            "Leadership signals: team size, budget, cross-functional impact",
            "Reframe từ 'Managed team' sang 'Built and led team of 8 engineers, delivered 3 products in 18 months'",
            "Executive summary optimization",
            "ATS keywords cho Senior/Lead/Principal level",
          ],
        },
      ]}
      relatedLinks={[
        { label: "Smart Editor", href: "/product/smart-editor" },
        { label: "CV Versions",  href: "/product/cv-versions" },
      ]}
    />
  );
}
