import { Metadata } from "next";
import { ProductPage } from "@/components/product-page";
export const metadata: Metadata = { title: "CVision cho Fresher & Sinh viên" };
export default function FresherPage() {
  return (
    <ProductPage
      breadcrumb="SOLUTIONS / Sinh viên & Fresher"
      headline={"CV đầu tiên.\nCơ hội thật sự."}
      subheadline="Sinh viên và fresher thường bị loại bởi ATS chỉ vì không biết cách format CV đúng. CVision giúp bạn hiểu hệ thống và tối ưu ngay từ lần nộp đầu tiên."
      cta={{ label: "Phân tích CV miễn phí", href: "/register" }}
      features={[
        {
          eyebrow: "CHO NGƯỜI MỚI BẮT ĐẦU",
          title: "Không có kinh nghiệm không có nghĩa là CV yếu.",
          body: "CVision giúp fresher viết lại CV theo hướng project-based: nêu bật đồ án tốt nghiệp, side projects, internship và hoạt động ngoại khóa theo format STAR được ATS và HR đánh giá cao.",
          bullets: [
            "Template CV chuẩn ATS cho sinh viên",
            "Gợi ý cách viết bullet point khi chưa có kinh nghiệm",
            "Hướng dẫn highlight skills từ đồ án và coursework",
            "ATS score và lộ trình cải thiện cụ thể",
          ],
        },
        {
          eyebrow: "GÓI FREE",
          title: "Miễn phí 1 lần phân tích mỗi ngày.",
          body: "Gói Free của CVision đủ để bạn phân tích và cải thiện CV trước mỗi lần nộp. Không cần thẻ tín dụng, không cần cam kết.",
          side: "right",
          bullets: [
            "1 lần phân tích ATS miễn phí mỗi ngày",
            "Xem điểm số và từ khóa thiếu",
            "Gợi ý cải thiện cơ bản",
            "Upgrade khi cần tạo nhiều phiên bản CV",
          ],
        },
      ]}
      relatedLinks={[
        { label: "ATS Scanner",  href: "/product/ats-scanner" },
        { label: "Smart Editor", href: "/product/smart-editor" },
        { label: "Xem giá",      href: "/pricing" },
      ]}
    />
  );
}
