import { Metadata } from "next";
import { ProductPage } from "@/components/product-page";
export const metadata: Metadata = { title: "CVision cho Manager & C-level" };
export default function ManagerPage() {
  return (
    <ProductPage
      breadcrumb="SOLUTIONS / Manager & C-level"
      headline={"Executive CV.\nBoard-ready. ATS-proof."}
      subheadline="Manager và C-level vẫn cần qua ATS trước khi đến bàn của executive recruiter. CVision đảm bảo CV của bạn không bị lọc bởi robot — và thuyết phục được người đọc ở level cao nhất."
      cta={{ label: "Tối ưu Executive CV", href: "/dashboard/upload" }}
      features={[
        {
          eyebrow: "C-LEVEL POSITIONING",
          title: "Revenue, market share, organizational change.",
          body: "Executive CV cần nói ngôn ngữ của board: P&L ownership, market expansion, M&A, organizational transformation. CVision giúp bạn lead với business outcomes thay vì functional responsibilities.",
          bullets: [
            "P&L và revenue impact framing",
            "Board-level keywords: strategic, governance, transformation",
            "Executive summary và value proposition",
            "LinkedIn headline alignment",
          ],
        },
      ]}
      relatedLinks={[
        { label: "Smart Editor", href: "/product/smart-editor" },
        { label: "CV Versions",  href: "/product/cv-versions" },
        { label: "Cover Letter", href: "/dashboard/cover-letter" },
      ]}
    />
  );
}
