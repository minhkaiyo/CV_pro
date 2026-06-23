import { Metadata } from "next";
import { ProductPage } from "@/components/product-page";
export const metadata: Metadata = { title: "CVision cho HR & Admin" };
export default function HRAdminPage() {
  return (
    <ProductPage
      breadcrumb="SOLUTIONS / HR & Admin"
      headline={"HR biết ATS.\nDùng CVision để thắng nó."}
      subheadline="Bạn làm HR nên biết ATS hoạt động như thế nào. CVision giúp CV của chính bạn vượt qua các hệ thống ATS khi apply vào các vị trí HR Manager, HRBP, hay C&B."
      cta={{ label: "Phân tích CV ngay", href: "/dashboard/upload" }}
      features={[
        {
          eyebrow: "HR PROFESSIONAL CV",
          title: "CV ngành HR cũng cần ATS optimization.",
          body: "Nhiều HR professional nghĩ CV của mình không cần tối ưu vì họ hiểu tuyển dụng. Thực tế ATS không phân biệt — keyword missing là bị lọc. CVision giúp bạn không rơi vào bẫy này.",
          bullets: [
            "Keywords: HRBP, C&B, OKR, Performance Management, L&D",
            "ATS profile cho các công ty có HR department lớn",
            "Cover letter template cho HR-to-HR application",
          ],
        },
      ]}
      relatedLinks={[
        { label: "ATS Scanner",   href: "/product/ats-scanner" },
        { label: "Cover Letter",  href: "/dashboard/cover-letter" },
      ]}
    />
  );
}
