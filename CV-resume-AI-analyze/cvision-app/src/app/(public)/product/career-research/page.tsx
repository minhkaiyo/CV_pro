import { Metadata } from "next";
import { ProductPage } from "@/components/product-page";
export const metadata: Metadata = { title: "Career Research — CVision AI" };
export default function CareerResearchPage() {
  return (
    <ProductPage
      breadcrumb="PRODUCT / Career Research"
      headline={"Hiểu thị trường\ntrước khi nộp hồ sơ."}
      subheadline="Career Research tổng hợp dữ liệu tuyển dụng từ hàng nghìn JD để cho bạn biết: ngành nào đang tuyển nhiều, skill nào đang hot, mức lương thực tế là bao nhiêu."
      cta={{ label: "Thử ngay", href: "/register" }}
      features={[
        {
          eyebrow: "MARKET INTELLIGENCE",
          title: "Data-driven career decisions.",
          body: "Không đoán mò ngành nào cần gì. Career Research phân tích hàng nghìn JD để extract skill requirements, keyword frequency và salary range theo từng role và industry tại Việt Nam.",
          bullets: [
            "Top 20 kỹ năng được yêu cầu nhiều nhất theo ngành",
            "Keyword frequency map theo vị trí",
            "Xu hướng tuyển dụng theo quý",
          ],
        },
      ]}
      relatedLinks={[
        { label: "ATS Scanner", href: "/product/ats-scanner" },
        { label: "AI Agent",    href: "/product/ai-agent" },
      ]}
    />
  );
}
