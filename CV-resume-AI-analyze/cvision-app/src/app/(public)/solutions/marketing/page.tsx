import { Metadata } from "next";
import { ProductPage } from "@/components/product-page";
export const metadata: Metadata = { title: "CVision cho Marketing" };
export default function MarketingPage() {
  return (
    <ProductPage
      breadcrumb="SOLUTIONS / Marketing"
      headline={"CV marketing\nnói đúng ngôn ngữ KPI."}
      subheadline="Marketing JD ngày càng data-driven: ROAS, CPA, CTR, retention rate. CVision giúp bạn viết CV theo format đo lường được — số liệu, kết quả, impact."
      cta={{ label: "Phân tích CV ngay", href: "/dashboard/upload" }}
      features={[
        {
          eyebrow: "METRICS-FIRST CV",
          title: "Show, don&apos;t tell. Số liệu thuyết phục hơn mô tả.",
          body: "Smart Editor chuyển từ 'Managed social media' thành 'Grew Instagram following 3x to 50K in 6 months, achieving 8% engagement rate vs 2% industry average' — đây là cách marketing CV thuyết phục HR.",
          bullets: [
            "Template bullet: Achieved X% [metric] by [action], resulting in [impact]",
            "Gợi ý thêm digital marketing KPIs vào mô tả",
            "ATS keyword matching cho Growth, Performance, Brand Marketing",
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
