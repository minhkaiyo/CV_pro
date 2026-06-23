import { Metadata } from "next";
import { ProductPage } from "@/components/product-page";
export const metadata: Metadata = { title: "CVision cho IT & Software Engineering" };
export default function ITSoftwarePage() {
  return (
    <ProductPage
      breadcrumb="SOLUTIONS / IT & Software"
      headline={"CV tech stack đúng,\nHR đọc mới hiểu."}
      subheadline="Software engineers thường list quá nhiều tech stack mà không biết ATS lọc theo cái gì. CVision giúp bạn viết CV theo đúng ngôn ngữ của hệ thống tuyển dụng tech."
      cta={{ label: "Thử với CV của bạn", href: "/dashboard/upload" }}
      features={[
        {
          eyebrow: "CHO DEVELOPER & ENGINEER",
          title: "Tech keyword matching chuyên sâu.",
          body: "CVision được train trên hàng nghìn JD từ các công ty tech Việt Nam và quốc tế. Hệ thống hiểu sự khác biệt giữa React và ReactJS, Python và Python3, và detect semantic matches.",
          bullets: [
            "Keyword matching cho 200+ tech stack phổ biến",
            "Detect abbreviations: JS = JavaScript, ML = Machine Learning",
            "ATS score riêng cho từng nền tảng: Greenhouse (startup), Workday (enterprise)",
            "Gợi ý thêm/bớt tech skill dựa trên JD cụ thể",
          ],
        },
        {
          eyebrow: "PROJECT-BASED CV",
          title: "Số liệu định lượng thuyết phục hơn mô tả.",
          body: "Smart Editor giúp bạn rewrite experience bullets từ 'Developed features' thành 'Developed 3 core features reducing load time by 40%, serving 10K DAU' — có impact, có số liệu.",
          side: "right",
        },
      ]}
      relatedLinks={[
        { label: "ATS Scanner",   href: "/product/ats-scanner" },
        { label: "Smart Editor",  href: "/product/smart-editor" },
        { label: "AI Agent",      href: "/product/ai-agent" },
      ]}
    />
  );
}
