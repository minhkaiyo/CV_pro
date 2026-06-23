"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Search, FileText, Bot, Zap, Layers, Monitor, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Search, label: "ATS Scanner", color: "text-blue-600", bg: "bg-blue-50",
    desc: "Quét CV so với JD theo thời gian thực. Phát hiện từ khóa thiếu, cấu trúc lỗi và rủi ro format ngay lập tức."
  },
  {
    icon: FileText, label: "Smart Editor", color: "text-purple-600", bg: "bg-purple-50",
    desc: "Trình soạn thảo AI có gắn thẻ ngữ nghĩa (Leadership, Impact, Technical). Gợi ý viết lại inline."
  },
  {
    icon: Bot, label: "AI Agent", color: "text-emerald-600", bg: "bg-emerald-50",
    desc: "Agent tự động lập kế hoạch, rà soát toàn bộ CV và thực thi gợi ý mà không cần bạn chỉnh sửa thủ công."
  },
  {
    icon: Zap, label: "AI Workflows", color: "text-amber-600", bg: "bg-amber-50",
    desc: "Luồng tự động hóa: nhận JD → phân tích → tạo checklist → gợi ý Cover Letter chỉ với 1 click."
  },
  {
    icon: Monitor, label: "ATS Monitors", color: "text-red-600", bg: "bg-red-50",
    desc: "Theo dõi sát các thuật toán ATS mới nhất của Workday, Greenhouse, Lever và 20+ platform tuyển dụng."
  },
  {
    icon: Layers, label: "Smart Lists", color: "text-cyan-600", bg: "bg-cyan-50",
    desc: "Tự sinh danh sách hành động (checklist) từ kết quả phân tích, kết nối trực tiếp vào luồng chỉnh sửa."
  },
];

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-white text-[#111] font-inter">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#EBEBEB] flex items-center justify-between px-10 py-4">
        <Link href="/" className="text-[17px] font-bold tracking-tight">CVision</Link>
        <div className="hidden md:flex gap-8 text-[13px] text-zinc-500">
          <Link href="/product" className="text-black font-semibold">Product</Link>
          <Link href="/solutions" className="hover:text-black transition">Solutions</Link>
          <Link href="/security" className="hover:text-black transition">Security</Link>
          <Link href="/customers" className="hover:text-black transition">Customers</Link>
          <Link href="/company" className="hover:text-black transition">Company</Link>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/login" className="text-[13px] text-zinc-500 hover:text-black transition">Log in</Link>
          <Link href="/register" className="bg-black text-white px-5 py-2 rounded-full text-[13px] font-semibold hover:bg-zinc-800 transition">Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-10 max-w-[1200px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[12px] font-bold uppercase tracking-widest text-zinc-400 mb-4">CVision Product</p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-tight">
            Hệ điều hành<br />sự nghiệp của bạn.
          </h1>
          <p className="text-xl text-zinc-500 max-w-2xl leading-relaxed mb-10">
            CVision aOS™ là nền tảng AI toàn diện đầu tiên dành riêng cho ứng viên — từ phân tích ATS, tối ưu CV đến tự động tạo Cover Letter và chuẩn bị phỏng vấn.
          </p>
          <Link href="/register" className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-semibold text-[15px] hover:bg-zinc-800 transition group">
            Bắt đầu miễn phí <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </section>

      {/* Video section */}
      <section className="px-10 max-w-[1400px] mx-auto mb-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="w-full rounded-3xl overflow-hidden border border-[#EBEBEB] shadow-2xl bg-[#0B0B0C]"
        >
          <video autoPlay loop muted playsInline className="w-full h-auto">
            <source src="https://framerusercontent.com/assets/YKL6xa3KPAeOS9MRDngjVEVhQ.mp4" type="video/mp4" />
          </video>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="px-10 max-w-[1200px] mx-auto mb-32">
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Tất cả trong một nền tảng.</h2>
          <p className="text-xl text-zinc-500 max-w-xl">Từ sinh viên mới tốt nghiệp đến chuyên gia cấp cao — CVision có đúng công cụ bạn cần.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="group p-8 border border-[#EBEBEB] rounded-2xl hover:shadow-lg transition-all cursor-pointer hover:border-zinc-300"
            >
              <div className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <h3 className="text-[17px] font-semibold mb-2">{f.label}</h3>
              <p className="text-zinc-500 text-[14px] leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-10 py-24 bg-[#0B0B0C] text-white text-center">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Bắt đầu tối ưu hồ sơ ngay hôm nay.</h2>
        <p className="text-zinc-400 text-xl mb-10 max-w-xl mx-auto">Miễn phí, không cần thẻ tín dụng. Kết quả phân tích đầu tiên trong 60 giây.</p>
        <Link href="/register" className="inline-flex items-center gap-2 bg-white text-black px-10 py-4 rounded-full font-bold text-[15px] hover:bg-zinc-200 transition">
          Dùng thử miễn phí →
        </Link>
      </section>

      {/* Simple footer */}
      <div className="bg-white py-6 px-10 border-t border-[#EBEBEB] text-[12px] text-zinc-400 flex justify-between">
        <span>© 2026 CVision Inc.</span>
        <div className="flex gap-6">
          <Link href="/privacy" className="hover:text-black transition">Privacy</Link>
          <Link href="/terms" className="hover:text-black transition">Terms</Link>
        </div>
      </div>
    </div>
  );
}
