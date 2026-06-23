"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const NavLinks = () => (
  <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#EBEBEB] flex items-center justify-between px-10 py-4">
    <Link href="/" className="text-[17px] font-bold tracking-tight">CVision</Link>
    <div className="hidden md:flex gap-8 text-[13px] text-zinc-500">
      <Link href="/product" className="hover:text-black transition">Product</Link>
      <Link href="/solutions" className="text-black font-semibold">Solutions</Link>
      <Link href="/security" className="hover:text-black transition">Security</Link>
      <Link href="/customers" className="hover:text-black transition">Customers</Link>
      <Link href="/company" className="hover:text-black transition">Company</Link>
    </div>
    <div className="flex gap-4 items-center">
      <Link href="/login" className="text-[13px] text-zinc-500 hover:text-black transition">Log in</Link>
      <Link href="/register" className="bg-black text-white px-5 py-2 rounded-full text-[13px] font-semibold hover:bg-zinc-800 transition">Get started</Link>
    </div>
  </nav>
);

const solutions = [
  { area: "IT & Software", desc: "Tối ưu CV cho Software Engineer, DevOps, Data Scientist. Phát hiện keyword thiếu như Docker, Kubernetes, CI/CD.", img: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop" },
  { area: "Tài chính & Ngân hàng", desc: "Định vị kỹ năng phân tích, mô hình hóa tài chính, compliance đúng chuẩn các tập đoàn như KPMG, Deloitte.", img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=600&auto=format&fit=crop" },
  { area: "Marketing & Truyền thông", desc: "Tối ưu Portfolio và thành tích ROI, brand growth cho các vị trí Digital Marketing, Content, Brand Manager.", img: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?q=80&w=600&auto=format&fit=crop" },
  { area: "HR & Admin", desc: "Chuẩn hóa ngôn ngữ hành chính, nhấn mạnh kỹ năng quản lý nhân sự, recruitment experience phù hợp.", img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=600&auto=format&fit=crop" },
  { area: "Kỹ thuật & Sản xuất", desc: "Làm nổi bật bằng sáng chế, dự án R&D, tiêu chuẩn ISO và các chứng chỉ kỹ thuật quốc tế.", img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=600&auto=format&fit=crop" },
  { area: "Quản trị & Lãnh đạo", desc: "Làm rõ impact P&L, leadership scope và chiến lược cấp cao phù hợp với vị trí Director, VP, C-Suite.", img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600&auto=format&fit=crop" },
];

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-white text-[#111] font-inter">
      <NavLinks />

      {/* Hero */}
      <section className="pt-36 pb-20 px-10 max-w-[1200px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[12px] font-bold uppercase tracking-widest text-zinc-400 mb-4">CVision Solutions</p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-tight">
            Giải pháp<br />cho mọi nghề.
          </h1>
          <p className="text-xl text-zinc-500 max-w-2xl leading-relaxed">
            Dù bạn là sinh viên mới ra trường hay lãnh đạo cấp cao — CVision đều có đúng công cụ phù hợp với lĩnh vực và mục tiêu nghề nghiệp của bạn.
          </p>
        </motion.div>
      </section>

      {/* Solutions grid — Legora "Customer stories" style */}
      <section className="px-0 max-w-full mb-0">
        <div className="px-10 max-w-[1400px] mx-auto mb-4">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">By area</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-[#EBEBEB]">
          {solutions.map((sol, i) => (
            <motion.div
              key={sol.area}
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="group flex flex-col border-b border-r border-[#EBEBEB] cursor-pointer hover:bg-zinc-50 transition-colors"
            >
              <div className="relative h-[260px] overflow-hidden">
                <Image src={sol.img} alt={sol.area} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute top-5 left-5 text-[10px] font-bold uppercase tracking-widest text-white drop-shadow">{sol.area}</div>
              </div>
              <div className="p-7 flex-1 flex flex-col">
                <div className="text-3xl font-serif mb-2">&ldquo;</div>
                <p className="text-[14px] text-[#333] leading-relaxed flex-1">{sol.desc}</p>
                <div className="mt-5 flex items-center gap-2 text-[13px] font-medium text-zinc-400 group-hover:text-black transition">
                  Tìm hiểu thêm <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Level targeting */}
      <section className="py-24 px-10 max-w-[1200px] mx-auto">
        <h2 className="text-4xl font-bold tracking-tight mb-12">By level</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { level: "Freshers & Students", desc: "Làm nổi bật project, internship và kỹ năng học thuật. Tạo CV ấn tượng ngay từ bước đầu tiên.", tag: "Entry Level" },
            { level: "Mid-level Professionals", desc: "Định lượng thành tích, làm nổi bật career progression và chứng minh sự phát triển trong 3-8 năm kinh nghiệm.", tag: "3–8 Years Exp." },
            { level: "Senior & Managers", desc: "Truyền đạt impact chiến lược, leadership scope, P&L ownership và tầm nhìn lãnh đạo ở level Director+.", tag: "8+ Years Exp." },
          ].map(({ level, desc, tag }) => (
            <div key={level} className="p-8 border border-[#EBEBEB] rounded-2xl hover:shadow-md transition-all">
              <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-4 block">{tag}</span>
              <h3 className="text-[19px] font-semibold mb-3">{level}</h3>
              <p className="text-zinc-500 text-[14px] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-10 py-20 bg-[#0B0B0C] text-white text-center">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">CVision phù hợp với bạn — dù bạn là ai.</h2>
        <Link href="/register" className="inline-flex items-center gap-2 bg-white text-black px-10 py-4 rounded-full font-bold text-[15px] hover:bg-zinc-200 transition mt-4">
          Bắt đầu ngay →
        </Link>
      </section>
      <div className="bg-white py-6 px-10 border-t border-[#EBEBEB] text-[12px] text-zinc-400 flex justify-between">
        <span>© 2026 CVision Inc.</span>
        <div className="flex gap-6"><Link href="/privacy" className="hover:text-black transition">Privacy</Link><Link href="/terms" className="hover:text-black transition">Terms</Link></div>
      </div>
    </div>
  );
}
