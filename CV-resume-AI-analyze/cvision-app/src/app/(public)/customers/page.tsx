"use client";

import Link from "next/link";
import PublicNav from "@/components/public-nav";
import { motion } from "framer-motion";

// ── Data — Legora-style: video/image + quote + name/role ──────────────────────
// Videos sourced from Legora's Framerusercontent CDN (public assets)

const TOP_ROW = [
  {
    company: "WARDYNSKI & PARTNERS",
    name: "Nguyễn Thành Long",
    role: "Senior Software Engineer tại FPT Software",
    quote: "The firms that shape what comes next will be the ones building alongside the people driving this transformation.",
    // Video from Legora's asset CDN
    video: "https://framerusercontent.com/assets/xuzZDtBvtug5DwF3ys67sqZV7VI.mp4",
    poster: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=600&auto=format&fit=crop",
  },
  {
    company: "BIRD & BIRD",
    name: "Trần Minh Châu",
    role: "Product Manager tại Grab Vietnam",
    quote: "With the help of AI, we can make the knowledge of more than 7,000 developers available at scale.",
    video: "https://framerusercontent.com/assets/YKL6xa3KPAeOS9MRDngjVEVhQ.mp4",
    poster: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop",
  },
  {
    company: "ERSTE GROUP",
    name: "Lê Hoàng Nam",
    role: "Business Analyst tại Vingroup",
    quote: "Any technology introduced into the company must meet uncompromising standards of security, accuracy, and intention.",
    video: "https://framerusercontent.com/assets/xuzZDtBvtug5DwF3ys67sqZV7VI.mp4",
    poster: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop",
  },
  {
    company: "BAHR",
    name: "Phạm Thu Hà",
    role: "Data Scientist tại Shopee Vietnam",
    quote: "Today as much as 80% of our people are active users, and as high as 30% use CVision more than ten times a day.",
    video: "https://framerusercontent.com/assets/YKL6xa3KPAeOS9MRDngjVEVhQ.mp4",
    poster: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=600&auto=format&fit=crop",
  },
];

const BOTTOM_ROW = [
  {
    company: "WARDYNSKI & PARTNERS",
    name: "Đặng Quốc Huy",
    role: "DevOps Engineer tại MoMo",
    quote: "With CVision, I made my technical skills visible to non-technical recruiters. Landed 3 offers in one month.",
    video: "https://framerusercontent.com/assets/xuzZDtBvtug5DwF3ys67sqZV7VI.mp4",
    poster: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=600&auto=format&fit=crop",
  },
  {
    company: "BIRD & BIRD",
    name: "Vũ Thanh Ngân",
    role: "UX Designer tại Tiki",
    quote: "Any ATS system must surface the right keywords. CVision told me exactly what those were for my target role.",
    video: "https://framerusercontent.com/assets/YKL6xa3KPAeOS9MRDngjVEVhQ.mp4",
    poster: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=600&auto=format&fit=crop",
  },
  {
    company: "VNG",
    name: "Bùi Minh Tú",
    role: "Backend Engineer tại VNG",
    quote: "CVision helped standardize 5 years of experience into a resume with near 90% interview conversion rate.",
    video: "https://framerusercontent.com/assets/xuzZDtBvtug5DwF3ys67sqZV7VI.mp4",
    poster: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop",
  },
  {
    company: "TECHCOMBANK",
    name: "Lưu Bảo Ngọc",
    role: "Financial Analyst tại Techcombank",
    quote: "The semantic analysis showed exactly which bullet points sounded weak. After AI rewrites, results were immediate.",
    video: "https://framerusercontent.com/assets/YKL6xa3KPAeOS9MRDngjVEVhQ.mp4",
    poster: "https://images.unsplash.com/photo-1598550874175-4d0ef436c909?q=80&w=600&auto=format&fit=crop",
  },
];

// ── CustomerCard ───────────────────────────────────────────────────────────────

function CustomerCard({
  item,
  index,
  tall = false,
}: {
  item: typeof TOP_ROW[number];
  index: number;
  tall?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className="flex flex-col group cursor-pointer overflow-hidden"
      style={{ borderRight: "1px solid #E5E5E4", borderBottom: "1px solid #E5E5E4" }}
    >
      {/* Media */}
      <div className={`relative overflow-hidden flex-shrink-0 ${tall ? "h-[420px]" : "h-[280px]"} bg-[#DCDCDA]`}>
        {/* Company label top-left */}
        <div className="absolute top-4 left-4 z-10 text-[10px] font-semibold uppercase tracking-widest text-white/90 drop-shadow-md">
          {item.company}
        </div>

        {/* Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={item.poster}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        >
          <source src={item.video} type="video/mp4" />
        </video>

        {/* Subtle gradient bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Quote + attribution */}
      <div className="p-6 bg-white flex flex-col gap-3 flex-1">
        <div className="text-[22px] text-[#AAAAAA] leading-none font-serif select-none">&ldquo;</div>
        <p className="text-[14px] leading-[1.6] text-[#1A1A1A] font-medium">{item.quote}</p>
        <div className="mt-auto pt-3">
          <div className="text-[13px] font-semibold text-[#1A1A1A]">{item.name}</div>
          <div className="text-[12px] text-[#888]">{item.role}</div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function CustomersPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111] font-inter">
      {/* Shared navbar */}
      <PublicNav />

      {/* Hero */}
      <section className="pt-40 pb-20 px-10 max-w-[1400px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#AAAAAA] mb-5">Customer stories</p>
          <h1 className="text-6xl md:text-7xl font-medium tracking-tighter text-[#0A0A0A] leading-none">
            Nâng tầm sự nghiệp<br />
            <span className="italic text-[#888]">cùng CVision.</span>
          </h1>
        </motion.div>
      </section>

      {/* Top row — 4 columns */}
      <section style={{ borderTop: "1px solid #E5E5E4" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {TOP_ROW.map((item, i) => (
            <CustomerCard key={item.name} item={item} index={i} tall />
          ))}
        </div>
      </section>

      {/* Bottom row — 4 columns */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {BOTTOM_ROW.map((item, i) => (
            <CustomerCard key={item.name} item={item} index={i} />
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="py-28 px-10 bg-[#F3F3F0]" style={{ borderTop: "1px solid #E5E5E4" }}>
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
          {[
            ["50,000+", "Ứng viên đã dùng CVision"],
            ["92%", "Tỷ lệ phỏng vấn trung bình sau khi tối ưu"],
            ["4.8★", "Điểm đánh giá trung bình từ người dùng"],
          ].map(([num, label]) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-6xl font-light tracking-tighter text-[#0A0A0A] mb-3">{num}</div>
              <div className="text-[15px] text-[#888]">{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#0A0A0A] text-white text-center px-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-5xl font-medium tracking-tight mb-8 leading-tight">
            Trở thành câu chuyện<br />
            <span className="italic text-zinc-500">thành công tiếp theo.</span>
          </h2>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-black px-10 py-4 rounded-full font-medium text-[15px] hover:bg-zinc-200 transition"
          >
            Bắt đầu miễn phí →
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <div
        className="bg-[#FAFAF8] py-5 px-10 text-[12px] text-[#AAAAAA] flex justify-between"
        style={{ borderTop: "1px solid #E5E5E4" }}
      >
        <span>© 2026 CVision Inc.</span>
        <div className="flex gap-6">
          <Link href="/privacy" className="hover:text-black transition">Privacy</Link>
          <Link href="/terms" className="hover:text-black transition">Terms</Link>
        </div>
      </div>
    </div>
  );
}
