import { Metadata } from "next";
export const metadata: Metadata = { title: "Chính sách Bảo mật — CVision AI" };

const SECTIONS = [
  {
    id: "thu-thap",
    title: "1. Thông tin chúng tôi thu thập",
    content: [
      { h: "Thông tin tài khoản", p: "Khi đăng ký, chúng tôi thu thập họ tên, địa chỉ email và mật khẩu (được mã hóa bcrypt). Chúng tôi không thu thập số thẻ tín dụng trực tiếp — thanh toán được xử lý hoàn toàn bởi Stripe." },
      { h: "Nội dung CV", p: "Khi bạn upload CV, chúng tôi lưu trữ nội dung văn bản (sau khi parse từ PDF/DOCX) và dữ liệu cấu trúc JSON được extract. File PDF/DOCX gốc được lưu trong Supabase Storage với signed URL hết hạn và không được public." },
      { h: "Dữ liệu sử dụng", p: "Chúng tôi ghi lại log sử dụng: thời gian phân tích CV, số lần gọi AI API, loại hành động (không có nội dung CV). Dữ liệu này dùng để enforce usage limits và cải thiện hiệu năng." },
      { h: "Dữ liệu kỹ thuật", p: "Địa chỉ IP, loại trình duyệt, hệ điều hành — thu thập tự động để phát hiện bot, bảo mật tài khoản và chẩn đoán lỗi. Không được dùng cho quảng cáo." },
    ],
  },
  {
    id: "su-dung",
    title: "2. Cách chúng tôi sử dụng thông tin",
    content: [
      { h: "Cung cấp dịch vụ", p: "CV của bạn được gửi đến AI (OpenAI/LLM provider đã cấu hình) để phân tích và tối ưu. Mỗi yêu cầu là một phiên làm việc độc lập; chúng tôi không lưu dữ liệu trong bộ nhớ của AI." },
      { h: "Cải thiện sản phẩm", p: "Chúng tôi sử dụng dữ liệu sử dụng ẩn danh (không có nội dung CV, không có thông tin cá nhân) để phân tích tính năng nào được sử dụng nhiều và cải thiện độ chính xác." },
      { h: "Liên lạc", p: "Email transactional: xác nhận tài khoản, đặt lại mật khẩu, thông báo gia hạn subscription, hóa đơn. Bạn có thể tắt email marketing bất kỳ lúc nào trong phần Cài đặt." },
    ],
  },
  {
    id: "cam-ket-ai",
    title: "3. Cam kết về AI và dữ liệu CV (Quan trọng)",
    content: [
      { h: "🔒 Không dùng CV để train AI", p: "CVision AI CAM KẾT: Nội dung CV của bạn không bao giờ được sử dụng để training hoặc fine-tuning bất kỳ model AI nào. Dữ liệu CV chỉ được xử lý để cung cấp dịch vụ phân tích cho chính bạn." },
      { h: "🔒 Không bán dữ liệu CV", p: "Chúng tôi không bán, không chia sẻ, không chuyển nhượng nội dung CV của bạn cho bên thứ ba với bất kỳ mục đích thương mại nào." },
      { h: "🔒 AI xử lý, không lưu trữ", p: "Khi gửi CV đến OpenAI để phân tích, dữ liệu được xử lý theo điều khoản API của OpenAI (không được dùng để train GPT theo chính sách Enterprise). Chúng tôi không gửi thông tin nhận dạng cá nhân (email, SĐT) đến AI." },
    ],
  },
  {
    id: "bao-mat",
    title: "4. Bảo mật dữ liệu",
    content: [
      { h: "Mã hóa", p: "Tất cả dữ liệu được mã hóa AES-256 khi lưu trữ (at rest) và TLS 1.3 khi truyền (in transit). API keys được mã hóa bằng Fernet symmetric encryption và không bao giờ lưu plaintext." },
      { h: "Row-level Security", p: "Supabase RLS đảm bảo mỗi user chỉ truy cập được dữ liệu của chính mình. Không có API endpoint nào cho phép cross-user data access." },
      { h: "Kiểm soát truy cập", p: "Chỉ nhân viên có quyền truy cập production với xác thực hai yếu tố (2FA) bắt buộc. Admin audit log ghi lại mọi hành động trên dữ liệu người dùng." },
    ],
  },
  {
    id: "quyen",
    title: "5. Quyền của bạn (GDPR)",
    content: [
      { h: "Quyền truy cập", p: "Bạn có quyền yêu cầu bản sao toàn bộ dữ liệu chúng tôi lưu về bạn (CV, lịch sử phân tích, thông tin tài khoản). Gửi yêu cầu về privacy@cvision.ai." },
      { h: "Quyền xóa", p: "Bạn có quyền yêu cầu xóa tài khoản và toàn bộ dữ liệu liên quan. Dữ liệu sẽ bị xóa hoàn toàn trong 30 ngày. Hóa đơn thanh toán có thể được giữ lại để tuân thủ nghĩa vụ pháp lý trong 7 năm." },
      { h: "Quyền cập nhật", p: "Bạn có thể cập nhật thông tin cá nhân bất kỳ lúc nào trong phần Hồ sơ cá nhân tại dashboard." },
      { h: "Quyền phản đối", p: "Bạn có thể phản đối việc xử lý dữ liệu cho mục đích marketing. Gửi yêu cầu về privacy@cvision.ai trong vòng 30 ngày làm việc." },
    ],
  },
  {
    id: "luu-tru",
    title: "6. Lưu trữ và xóa dữ liệu",
    content: [
      { h: "Dữ liệu tài khoản", p: "Được lưu trữ trong suốt thời gian tài khoản hoạt động." },
      { h: "Nội dung CV", p: "Được lưu trữ vô thời hạn trong khi tài khoản còn hoạt động. Sau khi xóa tài khoản, CV được xóa trong 30 ngày." },
      { h: "File gốc (PDF/DOCX)", p: "File gốc trong Supabase Storage được xóa sau 90 ngày hoặc khi bạn xóa tài khoản, tùy cái nào đến trước." },
      { h: "Log hệ thống", p: "Được giữ tối đa 90 ngày để bảo mật và troubleshooting, sau đó bị xóa tự động." },
    ],
  },
  {
    id: "lien-he",
    title: "7. Liên hệ & Khiếu nại",
    content: [
      { h: "Data Protection Officer", p: "Email: privacy@cvision.ai · Thời gian phản hồi: 3-5 ngày làm việc." },
      { h: "Khiếu nại", p: "Nếu bạn cho rằng dữ liệu của mình bị xử lý không đúng cách, bạn có quyền khiếu nại với cơ quan bảo vệ dữ liệu tại quốc gia bạn cư trú. Tại Việt Nam: Cục An toàn thông tin, Bộ TT&TT." },
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#080809] font-inter">
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-24">
        <div className="mb-12">
          <div className="text-[11px] font-semibold text-zinc-600 uppercase tracking-widest mb-4">LEGAL</div>
          <h1 className="text-4xl font-semibold text-white tracking-tight mb-3">Chính sách Bảo mật</h1>
          <p className="text-zinc-400 text-[15px]">Cập nhật lần cuối: 23 tháng 6, 2026</p>
          <p className="text-zinc-400 text-[14px] mt-2 max-w-2xl leading-relaxed">
            Chúng tôi xây dựng CVision AI với nguyên tắc privacy-first. Tài liệu này giải thích rõ ràng những gì chúng tôi thu thập, cách sử dụng và cam kết của chúng tôi về dữ liệu CV của bạn.
          </p>
        </div>

        <div className="flex gap-8 items-start">
          {/* Sticky TOC */}
          <nav className="hidden lg:block w-64 shrink-0 sticky top-20">
            <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.06] rounded-2xl p-4">
              <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">Mục lục</div>
              <ul className="space-y-1">
                {SECTIONS.map(s => (
                  <li key={s.id}>
                    <a href={`#${s.id}`}
                      className="block text-[13px] text-zinc-400 hover:text-white transition py-1 px-2 rounded-lg hover:bg-white/[0.05] truncate">
                      {s.title.replace(/^\d+\.\s/, "")}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Content */}
          <div className="flex-1 space-y-10">
            {SECTIONS.map(section => (
              <section key={section.id} id={section.id}>
                <h2 className="text-xl font-semibold text-white mb-5 pb-3 border-b border-white/[0.06]">
                  {section.title}
                </h2>
                <div className="space-y-5">
                  {section.content.map((item, i) => (
                    <div key={i}>
                      <h3 className="text-[14px] font-semibold text-zinc-200 mb-1.5">{item.h}</h3>
                      <p className="text-[14px] text-zinc-400 leading-relaxed">{item.p}</p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
