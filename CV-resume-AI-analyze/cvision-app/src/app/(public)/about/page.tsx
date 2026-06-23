import { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: "About — CVision AI" };

export default function AboutPage() {
  return (
    <div className="font-inter">
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16">
        <div className="text-[12px] font-semibold text-zinc-600 uppercase tracking-widest mb-6">COMPANY</div>
        <h1 className="text-4xl sm:text-5xl font-semibold text-white tracking-tight leading-tight mb-6">
          Xây dựng công cụ<br />mà chúng tôi muốn có.
        </h1>
        <p className="text-[16px] text-zinc-400 leading-relaxed max-w-2xl">
          CVision AI bắt đầu từ sự thất vọng: CV tốt bị lọc bởi robot trước khi HR đọc. Chúng tôi xây dựng CVision để giải quyết đúng vấn đề đó.
        </p>
      </section>

      <div className="border-t border-white/[0.04]" />

      <section className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-4">Sứ mệnh</h2>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            Chúng tôi tin rằng cơ hội nghề nghiệp không nên bị quyết định bởi thuật toán ATS. CVision tồn tại để giúp mọi ứng viên — dù là sinh viên mới ra trường hay senior 10 năm kinh nghiệm — trình bày đúng năng lực của mình theo ngôn ngữ mà cả robot lẫn HR đều hiểu.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-white mb-4">Nguyên tắc</h2>
          <ul className="space-y-4">
            {[
              { t: "Truthful AI", d: "Chúng tôi không cho phép AI bịa đặt thông tin. Mọi thay đổi đều có diff, có lý do, và người dùng kiểm soát." },
              { t: "Privacy first", d: "CV của bạn không được dùng để train model. Bạn sở hữu dữ liệu của mình." },
              { t: "Transparent scoring", d: "Điểm ATS được tính theo công thức xác định, không phải black box." },
            ].map((p) => (
              <li key={p.t} className="flex gap-4">
                <span className="w-1.5 h-1.5 rounded-full bg-white/30 mt-2.5 shrink-0" />
                <div>
                  <div className="text-[14px] font-medium text-white">{p.t}</div>
                  <div className="text-[13px] text-zinc-500 mt-0.5">{p.d}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="border-t border-white/[0.04]" />

      <section className="max-w-5xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/[0.04] rounded-2xl overflow-hidden border border-white/[0.04] my-4">
        {[
          { value: "2026", label: "Năm thành lập" },
          { value: "Hà Nội", label: "Trụ sở" },
          { value: "B2C + B2B", label: "Mô hình kinh doanh" },
        ].map((s) => (
          <div key={s.label} className="bg-[#080809] p-10 text-center hover:bg-white/[0.02] transition">
            <div className="text-3xl font-light text-white mb-2">{s.value}</div>
            <div className="text-[13px] text-zinc-500">{s.label}</div>
          </div>
        ))}
      </section>

      <div className="border-t border-white/[0.04]" />
      <section className="max-w-5xl mx-auto px-6 py-14 text-center">
        <h2 className="text-2xl font-semibold text-white mb-4">Tham gia cùng chúng tôi</h2>
        <p className="text-zinc-400 text-[14px] mb-6 max-w-md mx-auto">
          CVision đang tìm kiếm những người tin vào sứ mệnh giúp ứng viên Việt Nam tiếp cận cơ hội tốt hơn.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/register" className="inline-flex items-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-full text-[14px] hover:bg-zinc-200 transition">
            Dùng miễn phí
          </Link>
          <Link href="mailto:hello@cvision.ai" className="inline-flex items-center gap-2 border border-white/10 text-zinc-300 font-medium px-6 py-3 rounded-full text-[14px] hover:border-white/20 hover:text-white transition">
            Liên hệ
          </Link>
        </div>
      </section>
    </div>
  );
}
