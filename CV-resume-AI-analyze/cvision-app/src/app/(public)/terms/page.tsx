import { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: "Điều khoản Dịch vụ — CVision AI" };

const SECTIONS = [
  {
    id: "chap-nhan",
    title: "1. Chấp nhận Điều khoản",
    items: [
      { h: "Phạm vi áp dụng", p: "Bằng cách tạo tài khoản hoặc sử dụng dịch vụ CVision AI (\"Dịch vụ\"), bạn đồng ý bị ràng buộc bởi các Điều khoản Dịch vụ này. Nếu bạn không đồng ý, vui lòng không sử dụng Dịch vụ." },
      { h: "Độ tuổi", p: "Bạn phải từ 13 tuổi trở lên để sử dụng Dịch vụ. Người dùng dưới 18 tuổi cần có sự đồng ý của cha mẹ hoặc người giám hộ hợp pháp." },
    ],
  },
  {
    id: "tai-khoan",
    title: "2. Tài khoản người dùng",
    items: [
      { h: "Trách nhiệm tài khoản", p: "Bạn chịu trách nhiệm giữ bí mật thông tin đăng nhập và tất cả hoạt động xảy ra trong tài khoản của mình. Hãy thông báo ngay cho chúng tôi nếu phát hiện truy cập trái phép." },
      { h: "Thông tin chính xác", p: "Bạn đồng ý cung cấp thông tin chính xác, đầy đủ và cập nhật khi đăng ký. CVision AI không chịu trách nhiệm cho các vấn đề phát sinh do thông tin sai lệch." },
      { h: "Không chia sẻ tài khoản", p: "Mỗi tài khoản chỉ dành cho một người dùng. Chia sẻ thông tin đăng nhập vi phạm điều khoản và có thể dẫn đến tạm ngưng tài khoản." },
    ],
  },
  {
    id: "su-dung-chinh-sach",
    title: "3. Chính sách sử dụng chấp nhận được",
    items: [
      { h: "Được phép", p: "Sử dụng Dịch vụ để phân tích, tối ưu và quản lý CV của chính bạn hoặc CV bạn có quyền đại diện hợp pháp. Tạo phiên bản CV tối ưu cho mục đích tìm kiếm việc làm hợp pháp." },
      { h: "Nghiêm cấm", p: "Sử dụng Dịch vụ để tạo CV gian lận, giả mạo danh tính người khác, upload CV có chứa thông tin sai lệch có hại, spam hệ thống, khai thác lỗ hổng bảo mật, hoặc bất kỳ hoạt động vi phạm pháp luật nào." },
      { h: "Giới hạn tần suất", p: "Gói Free giới hạn 1 lần phân tích/ngày. Cố tình vượt qua giới hạn này bằng cách tạo nhiều tài khoản là vi phạm điều khoản." },
    ],
  },
  {
    id: "so-huu-tri-tue",
    title: "4. Sở hữu trí tuệ",
    items: [
      { h: "Bản quyền CVision", p: "Phần mềm, thuật toán, giao diện và tài liệu của CVision AI thuộc bản quyền của chúng tôi. Bạn không được sao chép, phân phối hoặc tạo sản phẩm phái sinh." },
      { h: "Quyền sở hữu CV của bạn", p: "Nội dung CV do bạn upload và tạo ra thuộc sở hữu của bạn. CVision AI có giấy phép giới hạn để xử lý nội dung này nhằm cung cấp Dịch vụ cho bạn." },
      { h: "Kết quả phân tích AI", p: "Kết quả phân tích, điểm số ATS và gợi ý do AI tạo ra trong phiên làm việc của bạn thuộc quyền sử dụng của bạn trong phạm vi cá nhân." },
    ],
  },
  {
    id: "thanh-toan",
    title: "5. Thanh toán và Hoàn tiền",
    items: [
      { h: "Gói trả phí", p: "Gói Premium được tính phí theo chu kỳ (tháng hoặc năm) và tự động gia hạn cho đến khi bạn huỷ. Giá chưa bao gồm thuế VAT (nếu áp dụng)." },
      { h: "Chính sách hoàn tiền", p: "Chúng tôi cung cấp hoàn tiền trong vòng 7 ngày kể từ ngày thanh toán đầu tiên nếu bạn chưa sử dụng quá 3 lần phân tích Premium. Gửi yêu cầu về billing@cvision.ai." },
      { h: "Huỷ subscription", p: "Bạn có thể huỷ bất kỳ lúc nào. Subscription vẫn có hiệu lực đến hết chu kỳ đã thanh toán. Không có phí huỷ." },
      { h: "Thay đổi giá", p: "Chúng tôi sẽ thông báo ít nhất 30 ngày trước khi tăng giá. Việc tiếp tục sử dụng sau thay đổi đồng nghĩa bạn chấp nhận mức giá mới." },
    ],
  },
  {
    id: "gioi-han-trach-nhiem",
    title: "6. Giới hạn trách nhiệm",
    items: [
      { h: "Dịch vụ \"As-Is\"", p: "CVision AI cung cấp Dịch vụ \"nguyên trạng\". Chúng tôi không đảm bảo rằng phân tích AI là 100% chính xác hay CV được tối ưu sẽ đảm bảo bạn có được công việc." },
      { h: "Giới hạn bồi thường", p: "Trách nhiệm tổng cộng của CVision AI đối với bạn không vượt quá số tiền bạn đã thanh toán trong 12 tháng gần nhất, hoặc 500.000đ, tùy giá trị nào thấp hơn." },
      { h: "Miễn trách nhiệm", p: "CVision AI không chịu trách nhiệm về thiệt hại gián tiếp, mất việc làm, mất dữ liệu do nguyên nhân nằm ngoài tầm kiểm soát hợp lý của chúng tôi." },
    ],
  },
  {
    id: "chấm-dut",
    title: "7. Chấm dứt dịch vụ",
    items: [
      { h: "Quyền chấm dứt của bạn", p: "Bạn có thể xóa tài khoản bất kỳ lúc nào từ phần Hồ sơ cá nhân. Việc xóa tài khoản chấm dứt toàn bộ quyền truy cập vào Dịch vụ." },
      { h: "Quyền chấm dứt của CVision", p: "Chúng tôi có thể tạm ngưng hoặc chấm dứt tài khoản vi phạm điều khoản, sau khi thông báo (trừ trường hợp vi phạm nghiêm trọng có thể dẫn đến chấm dứt tức thì)." },
    ],
  },
  {
    id: "lien-he-phap-ly",
    title: "8. Luật áp dụng & Liên hệ",
    items: [
      { h: "Luật áp dụng", p: "Điều khoản này được điều chỉnh bởi pháp luật Việt Nam. Mọi tranh chấp được giải quyết tại Tòa án có thẩm quyền tại Hà Nội, Việt Nam." },
      { h: "Liên hệ pháp lý", p: "Mọi thắc mắc pháp lý: legal@cvision.ai · Địa chỉ: [Địa chỉ công ty], Hà Nội, Việt Nam." },
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#080809] font-inter">
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-24">
        <div className="mb-12">
          <div className="text-[11px] font-semibold text-zinc-600 uppercase tracking-widest mb-4">LEGAL</div>
          <h1 className="text-4xl font-semibold text-white tracking-tight mb-3">Điều khoản Dịch vụ</h1>
          <p className="text-zinc-400 text-[15px]">Cập nhật lần cuối: 23 tháng 6, 2026</p>
          <p className="text-zinc-400 text-[14px] mt-2 max-w-2xl leading-relaxed">
            Vui lòng đọc kỹ Điều khoản Dịch vụ này trước khi sử dụng CVision AI. Việc tạo tài khoản đồng nghĩa bạn đã đồng ý với các điều khoản bên dưới.
          </p>
          <div className="flex gap-3 mt-4">
            <Link href="/privacy" className="text-sm text-zinc-400 hover:text-white transition underline">
              Chính sách Bảo mật →
            </Link>
          </div>
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
                  {section.items.map((item, i) => (
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
