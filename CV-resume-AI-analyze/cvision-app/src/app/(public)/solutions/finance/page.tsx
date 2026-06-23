import { Metadata } from "next";
import { ProductPage } from "@/components/product-page";
export const metadata: Metadata = { title: "CVision cho Tài chính & Banking" };
export default function FinancePage() {
  return (
    <ProductPage
      breadcrumb="SOLUTIONS / Tài chính & Banking"
      headline={"CV tài chính chuẩn,\nHR ngân hàng chú ý."}
      subheadline="Ngành tài chính có ngôn ngữ đặc thù: CFA, ACCA, P&L, ROE, NPL. CVision giúp bạn đảm bảo CV chứa đúng từ khóa mà các hệ thống ATS của ngân hàng và công ty tài chính đang tìm."
      cta={{ label: "Phân tích CV ngay", href: "/dashboard/upload" }}
      features={[
        {
          eyebrow: "FINANCE-SPECIFIC KEYWORDS",
          title: "Ngôn ngữ tài chính. Đúng ATS ngân hàng.",
          body: "CVision được tối ưu cho các từ khóa chuyên ngành tài chính — từ investment banking, credit risk, đến financial modeling và compliance. Đảm bảo CV của bạn không bị lọc vì thiếu terminology.",
          bullets: [
            "Keyword library: 300+ thuật ngữ tài chính",
            "ATS profiles: Workday (BIDV, VCB), Taleo (CitiBank, HSBC)",
            "Gợi ý bổ sung certifications phù hợp JD",
            "Format chuẩn cho CV banking sector",
          ],
        },
      ]}
      relatedLinks={[
        { label: "ATS Scanner",  href: "/product/ats-scanner" },
        { label: "CV Versions",  href: "/product/cv-versions" },
      ]}
    />
  );
}
