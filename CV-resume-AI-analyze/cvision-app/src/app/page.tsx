"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */

import Link from "next/link";
import Image from "next/image";
import { Sparkles, Bot, Search, Lock, BarChart3, Workflow, CheckCircle } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useCallback } from "react";
import PublicNav from "@/components/public-nav";

// ── Dropdown data ────────────────────────────────────────────────────────────

const PRODUCT_ITEMS = {
  main: [
    { label: "CVision aOS", href: "/product", desc: "Hệ điều hành sự nghiệp" },
    { label: "ATS Scanner", href: "/product", desc: "Quét & chấm điểm ATS" },
    { label: "Web Extension", href: "/product", desc: "Tối ưu CV trực tiếp" },
    { label: "Workflows", href: "/product", desc: "Tự động hóa quy trình" },
    { label: "Smart Editor", href: "/dashboard/cv-versions", desc: "Chỉnh sửa thông minh" },
    { label: "Career Research", href: "/product", desc: "Nghiên cứu nghề nghiệp" },
    { label: "Mobile app", href: "/product", desc: "Ứng dụng di động" },
    { label: "Portal", href: "/dashboard", desc: "Truy cập dashboard" },
  ],
  new: [
    { label: "Monitors", href: "/product", desc: "Theo dõi thị trường tuyển dụng" },
    { label: "AI Agent", href: "/dashboard/upload", desc: "Phân tích CV tự động" },
    { label: "CV Versions", href: "/dashboard/cv-versions", desc: "Quản lý nhiều phiên bản CV" },
  ],
};

const SOLUTIONS_ITEMS = {
  area: [
    { label: "IT & Software", href: "/solutions" },
    { label: "Tài chính & Banking", href: "/solutions" },
    { label: "Marketing", href: "/solutions" },
    { label: "Nhân sự & Admin", href: "/solutions" },
    { label: "Kỹ thuật & SX", href: "/solutions" },
  ],
  level: [
    { label: "Sinh viên / Fresher", href: "/solutions" },
    { label: "Junior (1-3 năm)", href: "/solutions" },
    { label: "Senior / Lead", href: "/solutions" },
    { label: "Manager / C-level", href: "/solutions" },
  ],
};

// ── Dropdown component ─────────────────────────────────────────────────────────

function NavDropdown({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  }, []);

  const handleLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => setOpen(false), 80);
  }, []);

  return (
    <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        className={`px-4 py-2 rounded-full text-[14px] font-medium transition ${open ? "bg-white/10 text-white" : "text-zinc-300 hover:bg-white/10 hover:text-white"
          }`}
      >
        {label}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            className="absolute top-full left-0 mt-2 bg-white/[0.12] backdrop-blur-[32px] border border-white/[0.15] rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.5)] z-[100] overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/10 before:to-transparent before:pointer-events-none"
          >
            {/* Noise texture overlay */}
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

            <div className="relative z-10">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.96]);

  // Interactive aOS demo state
  const [activeTab, setActiveTab] = useState(0);
  const aosTabs = [
    {
      id: 0, label: "ATS Scan", icon: Search, color: "text-blue-400", bg: "bg-blue-400/10",
      title: "ATS Compatibility Score",
      score: 87,
      scoreColor: "text-emerald-400",
      items: [
        { label: "Keywords matched", value: "24/28", ok: true },
        { label: "Format compatibility", value: "Pass", ok: true },
        { label: "Missing: 'CI/CD pipelines'", value: "Add", ok: false },
        { label: "Section structure", value: "Optimal", ok: true },
      ],
    },
    {
      id: 1, label: "Semantic AI", icon: Sparkles, color: "text-purple-400", bg: "bg-purple-400/10",
      title: "Semantic Analysis",
      score: 73,
      scoreColor: "text-amber-400",
      items: [
        { label: "Leadership signals", value: "Weak", ok: false },
        { label: "Impact quantification", value: "Good", ok: true },
        { label: "Technical depth", value: "Strong", ok: true },
        { label: "Action verbs variety", value: "Improve", ok: false },
      ],
    },
    {
      id: 2, label: "AI Suggest", icon: Bot, color: "text-emerald-400", bg: "bg-emerald-400/10",
      title: "AI Rewrite Suggestions",
      score: 95,
      scoreColor: "text-emerald-400",
      items: [
        { label: "Spearheaded CI/CD across 3 products", value: "Applied", ok: true },
        { label: "Reduced deploy time by 60%", value: "Applied", ok: true },
        { label: "Led cross-functional team of 8", value: "Suggest", ok: false },
        { label: "P0 incident response rate 99.8%", value: "Suggest", ok: false },
      ],
    },
  ];

  const testimonials = [
    { name: "Nguyễn Thanh Hà", role: "Software Engineer tại Grab", quote: "CVision tăng tỷ lệ phỏng vấn của tôi lên 3 lần. Phân tích keyword cực kỳ chính xác.", avatar: "NH" },
    { name: "Trần Minh Đức", role: "Product Manager tại VNG", quote: "Tôi landing được offer mơ ước chỉ sau 2 tuần dùng CVision. Không thể tin được.", avatar: "TD" },
    { name: "Phạm Thị Lan", role: "Data Scientist tại Shopee", quote: "AI gợi ý viết lại câu rất thông minh. Hồ sơ của tôi chuyên nghiệp hơn hẳn.", avatar: "PL" },
  ];

  // Templates Carousel State
  const cvTemplates = [
    { title: "Modernist", desc: "Bố cục chia cột hiện đại, tối ưu cho ATS và làm nổi bật các kỹ năng cốt lõi. Phù hợp đa ngành nghề.", img: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=800&auto=format&fit=crop" },
    { title: "Creative", desc: "Thiết kế phá cách mang đậm dấu ấn cá nhân. Dành riêng cho Design, Marketing và ngành sáng tạo.", img: "https://images.unsplash.com/photo-1626125345654-0ebf156d9595?q=80&w=800&auto=format&fit=crop" },
    { title: "Tech Pro", desc: "Hiển thị rõ ràng Tech Stack, dự án Open Source và luồng CI/CD. Hoàn hảo cho Software Engineer.", img: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop" },
    { title: "Executive", desc: "Phong cách C-level sang trọng. Tập trung vào tầm nhìn, quy mô quản lý và các thành tựu chiến lược.", img: "https://images.unsplash.com/photo-1554774853-719586f82d77?q=80&w=800&auto=format&fit=crop" },
    { title: "Academic", desc: "Chuẩn mực học thuật quốc tế. Bố cục truyền thống, chặt chẽ chuyên dùng cho nghiên cứu sinh.", img: "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?q=80&w=800&auto=format&fit=crop" },
  ];
  const [activeTemplateIndex, setActiveTemplateIndex] = useState(2); // Start at Center

  const nextTemplate = () => setActiveTemplateIndex(p => Math.min(cvTemplates.length - 1, p + 1));
  const prevTemplate = () => setActiveTemplateIndex(p => Math.max(0, p - 1));

  return (
    <div className="bg-[#0B0B0C] text-white font-inter min-h-screen overflow-x-hidden">

      {/* ── NAVIGATION ── */}
      {/* Shared Navbar */}
      <PublicNav />

      {/* ── HERO (Video Background) ── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden pt-20">
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
          <video
            autoPlay loop muted playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-screen"
            src="https://framerusercontent.com/assets/xuzZDtBvtug5DwF3ys67sqZV7VI.mp4"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B0B0C]/50 to-[#0B0B0C] z-10 pointer-events-none" />
        </div>

        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="relative z-20 max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2.5 mb-8 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-[13px] text-zinc-300 font-medium">CVision aOS v2.0 — Mới ra mắt</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.8 }}
            className="font-playfair text-5xl sm:text-6xl md:text-[5rem] lg:text-[6.5rem] font-bold leading-none tracking-tighter text-white mb-8"
          >
            Nâng tầm hồ sơ.<br />
            <span className="italic text-zinc-400">Kiến tạo bởi AI.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="text-xl md:text-2xl text-zinc-400 font-light max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Phân tích ATS chuyên sâu, gợi ý viết lại thông minh và tối ưu hóa hồ sơ theo thời gian thực — tất cả trong một nền tảng.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-semibold text-[15px] hover:bg-zinc-200 transition-all shadow-lg shadow-white/10"
            >
              Bắt đầu miễn phí
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link
              href="/product"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/20 text-white text-[15px] font-medium hover:bg-white/10 transition"
            >
              Xem demo
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
            className="mt-16 flex items-center justify-center gap-8 text-[13px] text-zinc-500"
          >
            {["Không cần thẻ tín dụng", "Kết quả trong 60 giây", "Hỗ trợ 20+ ATS platform"].map((t) => (
              <span key={t} className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> {t}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── BRAND LOGOS MARQUEE ── */}
      <section className="py-16 bg-[#0B0B0C] border-y border-white/[0.04] overflow-hidden">
        <p className="text-center text-[12px] text-zinc-600 font-semibold uppercase tracking-widest mb-8">Tin dùng bởi ứng viên từ các công ty hàng đầu</p>
        <div className="relative flex overflow-hidden">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ ease: "linear", duration: 25, repeat: Infinity }}
            className="flex w-max"
          >
            {[0, 1].map((setIdx) => (
              <div key={setIdx} className="flex items-center gap-16 px-8">
                {["FPT Software", "Grab Vietnam", "Shopee", "VNG", "MoMo", "Tiki", "Vingroup", "Techcombank", "KPMG", "Deloitte"].map((brand) => (
                  <span key={brand} className="text-[15px] font-bold text-zinc-700 whitespace-nowrap tracking-tight hover:text-zinc-400 transition cursor-default">
                    {brand}
                  </span>
                ))}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── INTERACTIVE aOS DEMO ── Premium full-width layout ── */}
      <section id="product" className="py-0 relative z-20 overflow-hidden">
        {/* Full-width dark container */}
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] min-h-[700px] border-t border-b border-white/[0.06]">

            {/* LEFT: CV Mockup panel with floating analysis overlay */}
            <motion.div
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1 }}
              className="relative bg-[#0d0d10] border-r border-white/[0.06] p-10 lg:p-16 flex flex-col overflow-hidden"
            >
              {/* Background glows */}
              <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/[0.07] blur-[100px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-emerald-600/[0.05] blur-[80px] rounded-full pointer-events-none" />

              {/* Top label */}
              <div className="flex items-center gap-2 mb-12 z-10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">CVision aOS™ — Live Preview</span>
              </div>

              {/* Fake CV document */}
              <div className="relative z-10 flex-1 flex flex-col">
                {/* CV card */}
                <div className="bg-[#16161a] border border-white/[0.08] rounded-2xl p-7 shadow-2xl mb-6">
                  {/* CV Header */}
                  <div className="flex items-start gap-5 mb-6 pb-6 border-b border-white/[0.06]">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 border border-white/10 flex items-center justify-center text-white font-bold text-lg shrink-0">NV</div>
                    <div>
                      <div className="text-white font-semibold text-lg">Nguyen Van An</div>
                      <div className="text-zinc-400 text-[13px] mt-0.5">Senior Software Engineer</div>
                      <div className="flex gap-3 mt-2">
                        <span className="text-zinc-600 text-[12px]">Hanoi, Vietnam</span>
                        <span className="text-zinc-600 text-[12px]">•</span>
                        <span className="text-zinc-600 text-[12px]">5 years exp.</span>
                      </div>
                    </div>
                  </div>

                  {/* Experience lines */}
                  <div className="space-y-4">
                    {[
                      { company: "Shopee Vietnam", role: "Senior Engineer", years: "2022–Now", highlight: true },
                      { company: "FPT Software", role: "Backend Developer", years: "2020–2022", highlight: false },
                      { company: "StartupXYZ", role: "Junior Developer", years: "2019–2020", highlight: false },
                    ].map((exp, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${exp.highlight ? "bg-emerald-400" : "bg-zinc-700"}`} />
                          <div>
                            <span className={`text-[13px] font-medium ${exp.highlight ? "text-white" : "text-zinc-400"}`}>{exp.company}</span>
                            <span className="text-zinc-600 text-[12px] ml-2">— {exp.role}</span>
                          </div>
                        </div>
                        <span className="text-zinc-600 text-[11px] font-mono">{exp.years}</span>
                      </div>
                    ))}
                  </div>

                  {/* Skills row */}
                  <div className="mt-5 pt-5 border-t border-white/[0.06] flex flex-wrap gap-2">
                    {["React", "Node.js", "Docker", "PostgreSQL", "AWS"].map((skill) => (
                      <span key={skill} className="px-3 py-1 bg-white/[0.04] border border-white/[0.08] rounded-full text-[11px] text-zinc-400">{skill}</span>
                    ))}
                    <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-[11px] text-amber-400 flex items-center gap-1">
                      <span>+</span> CI/CD pipelines
                    </span>
                  </div>
                </div>

                {/* Floating analysis cards */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Score card */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab + "-score"}
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                      className="bg-[#16161a] border border-white/[0.08] rounded-2xl p-5"
                    >
                      <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mb-2">{aosTabs[activeTab].label}</div>
                      <div className={`text-4xl font-bold ${aosTabs[activeTab].scoreColor} mb-2`}>
                        {aosTabs[activeTab].score}<span className="text-zinc-700 text-xl">/100</span>
                      </div>
                      <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }} animate={{ width: `${aosTabs[activeTab].score}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className={`h-full rounded-full ${aosTabs[activeTab].score >= 85 ? "bg-emerald-500" : aosTabs[activeTab].score >= 70 ? "bg-amber-500" : "bg-red-500"}`}
                        />
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Issues card */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab + "-issues"}
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.1 }}
                      className="bg-[#16161a] border border-white/[0.08] rounded-2xl p-5 space-y-2"
                    >
                      {aosTabs[activeTab].items.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-[11px] text-zinc-500 truncate max-w-[100px]">{item.label}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.ok ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* RIGHT: Tab selector + description */}
            <motion.div
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col justify-between p-10 lg:p-12"
            >
              <div>
                <p className="text-[11px] text-zinc-600 font-bold uppercase tracking-widest mb-5">CVision aOS™</p>
                <h2 className="font-playfair text-3xl md:text-4xl text-white tracking-tight mb-5 leading-tight">
                  Hệ điều hành<br />sự nghiệp của bạn.
                </h2>
                <p className="text-zinc-500 text-[14px] leading-relaxed mb-8">
                  Không chỉ chấm điểm — aOS phân tích ngữ nghĩa sâu và đề xuất chỉnh sửa theo từng JD cụ thể.
                </p>
              </div>

              {/* Tab buttons — vertical */}
              <div className="flex flex-col gap-2 flex-1 justify-center">
                {aosTabs.map((tab, i) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    whileHover={{ x: 4 }}
                    className={`relative flex items-center gap-4 px-5 py-5 rounded-2xl text-left transition-all duration-300 overflow-hidden group ${activeTab === tab.id
                      ? "bg-white/[0.07] border border-white/15"
                      : "border border-transparent hover:bg-white/[0.04] hover:border-white/[0.06]"
                      }`}
                  >
                    {/* Active indicator bar */}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeBar"
                        className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full ${tab.color.replace("text-", "bg-")}`}
                      />
                    )}
                    <div className={`w-10 h-10 rounded-xl ${tab.bg} flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`}>
                      <tab.icon className={`w-5 h-5 ${tab.color}`} />
                    </div>
                    <div>
                      <div className="text-white font-semibold text-[15px] mb-0.5">{tab.label}</div>
                      <div className="text-zinc-600 text-[12px]">
                        {i === 0 && "Kiểm tra bộ lọc ATS theo thời gian thực"}
                        {i === 1 && "Phân tích ngữ nghĩa và cấu trúc câu"}
                        {i === 2 && "Gợi ý viết lại thông minh theo ngữ cảnh"}
                      </div>
                    </div>
                    {/* Score badge */}
                    <div className={`ml-auto text-[13px] font-bold ${tab.scoreColor} shrink-0`}>
                      {tab.score}
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="mt-8">
                <Link href="/register" className="flex items-center justify-center gap-2 w-full bg-white text-black font-semibold py-3.5 rounded-xl text-[14px] hover:bg-zinc-200 transition group">
                  Thử ngay miễn phí
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── BENTO GRID ── */}
      <section className="py-32 px-6 max-w-[1600px] mx-auto relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mb-24 text-center"
        >
          <p className="text-[12px] text-zinc-500 font-bold uppercase tracking-widest mb-4">Platform Intelligence</p>
          <h2 className="font-playfair text-4xl md:text-6xl text-white tracking-tight mb-6">Trải nghiệm tương tác hoàn hảo.</h2>
          <p className="text-xl text-zinc-400 font-light max-w-2xl mx-auto">Công cụ được thiết kế tỉ mỉ tới từng pixel, mang lại trải nghiệm phân tích mượt mà và trực quan nhất.</p>
        </motion.div>

        {/* Row 1: 2 equal cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="bg-[#111113] border border-white/[0.06] rounded-[2rem] overflow-hidden group flex flex-col hover:border-white/[0.12] transition-all duration-500"
          >
            <div className="relative h-[320px] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#111113] z-10" />
              <Image
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop"
                alt="ATS Scanning Interface" width={800} height={400}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute top-6 left-6 z-20 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-md px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-400 text-[11px] font-semibold uppercase tracking-wider">ATS Scanner Active</span>
              </div>
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-semibold text-white mb-3">Thông minh. Đột phá.</h3>
              <p className="text-zinc-400 leading-relaxed">Tự động nhận diện rủi ro từ khóa ẩn sâu bên trong các bộ lọc khắt khe nhất của ATS. Phân tích đa tầng, kết quả tức thì.</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.15 }}
            className="bg-[#111113] border border-white/[0.06] rounded-[2rem] overflow-hidden group flex flex-col hover:border-white/[0.12] transition-all duration-500"
          >
            <div className="relative h-[320px] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#111113] z-10" />
              <Image
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop"
                alt="Speed Analytics" width={800} height={400}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute bottom-6 right-6 z-20 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-3 flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Response Time</div>
                  <div className="text-white text-xl font-bold">0.4<span className="text-zinc-500 text-sm font-normal">s</span></div>
                </div>
              </div>
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-semibold text-white mb-3">Tốc độ. Chính xác.</h3>
              <p className="text-zinc-400 leading-relaxed">Kết quả phân tích được trả về tính bằng mili-giây, cho phép bạn tinh chỉnh CV theo thời gian thực mà không bỏ lỡ bất kỳ cơ hội nào.</p>
            </div>
          </motion.div>
        </div>

        {/* Row 2: Full-width */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }}
          className="bg-[#111113] border border-white/[0.06] rounded-[2rem] overflow-hidden group hover:border-white/[0.12] transition-all duration-500"
        >
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-10 md:p-16 flex flex-col justify-center">
              <p className="text-[11px] text-zinc-600 font-bold uppercase tracking-widest mb-4">AI Rewrite Engine</p>
              <h3 className="text-3xl md:text-4xl font-semibold text-white mb-5 leading-tight">Gợi ý chỉnh sửa<br />theo Ngữ Cảnh.</h3>
              <p className="text-zinc-400 text-lg leading-relaxed mb-8">
                AI của chúng tôi không chỉ tìm từ khóa cứng nhắc — nó hiểu mạch văn và đề xuất cấu trúc lại câu văn để tối đa hóa điểm số ấn tượng trước mắt nhà tuyển dụng.
              </p>
              <div className="flex items-center gap-2 text-white font-medium hover:text-blue-400 transition cursor-pointer group/cta w-fit">
                Xem cách thức hoạt động
                <span className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-sm group-hover/cta:translate-x-1 transition-transform">→</span>
              </div>
            </div>
            <div className="relative min-h-[360px] overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1587614382346-4ec70e388b28?q=80&w=800&auto=format&fit=crop"
                alt="AI Writing Assistant" width={800} height={600}
                className="w-full h-full object-cover absolute inset-0 transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#111113] via-[#111113]/20 to-transparent" />
              <div className="absolute bottom-8 right-8 bg-black/70 backdrop-blur-xl border border-white/10 p-4 rounded-2xl max-w-[220px] shadow-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <span className="text-emerald-400 text-[10px]">✦</span>
                  </div>
                  <span className="text-emerald-400 text-[11px] font-semibold">Rewrite Applied</span>
                </div>
                <p className="text-zinc-300 text-[11px] leading-relaxed">&ldquo;Spearheaded CI/CD pipelines across 3 product lines, reducing deployment time by 60%.&rdquo;</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── ATS PLATFORM COMPATIBILITY ── */}
      <section className="py-0 border-t border-white/[0.04] bg-[#0B0B0C] relative z-20 overflow-hidden">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 min-h-[520px]">
          {/* LEFT: Platform grid */}
          <motion.div
            initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="relative bg-[#0d0d10] border-r border-white/[0.06] p-14 flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-600 z-10 relative">ATS Compatibility</div>
            <div className="flex-1 flex items-center justify-center py-10 z-10 relative">
              <div className="grid grid-cols-3 gap-4 w-full max-w-[420px]">
                {[
                  { name: "Workday", color: "from-blue-500/10 to-blue-600/5", border: "border-blue-500/20", text: "text-blue-300" },
                  { name: "Greenhouse", color: "from-emerald-500/10 to-emerald-600/5", border: "border-emerald-500/20", text: "text-emerald-300" },
                  { name: "Lever", color: "from-purple-500/10 to-purple-600/5", border: "border-purple-500/20", text: "text-purple-300" },
                  { name: "Taleo", color: "from-amber-500/10 to-amber-600/5", border: "border-amber-500/20", text: "text-amber-300" },
                  { name: "iCIMS", color: "from-cyan-500/10 to-cyan-600/5", border: "border-cyan-500/20", text: "text-cyan-300" },
                  { name: "BambooHR", color: "from-rose-500/10 to-rose-600/5", border: "border-rose-500/20", text: "text-rose-300" },
                  { name: "SmartRecruit.", color: "from-indigo-500/10 to-indigo-600/5", border: "border-indigo-500/20", text: "text-indigo-300" },
                  { name: "Jobvite", color: "from-orange-500/10 to-orange-600/5", border: "border-orange-500/20", text: "text-orange-300" },
                  { name: "Bullhorn", color: "from-teal-500/10 to-teal-600/5", border: "border-teal-500/20", text: "text-teal-300" },
                ].map((p, i) => (
                  <motion.div
                    key={p.name}
                    initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                    className={`bg-gradient-to-br ${p.color} border ${p.border} rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform duration-300 cursor-default`}
                  >
                    <div className={`text-[11px] font-bold ${p.text} text-center leading-tight`}>{p.name}</div>
                    <div className="w-5 h-5 rounded-full border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="z-10 relative flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[13px] text-zinc-400 font-medium">20+ nền tảng ATS được hỗ trợ và cập nhật liên tục</span>
            </div>
          </motion.div>

          {/* RIGHT: Text */}
          <motion.div
            initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.15 }}
            className="p-14 flex flex-col justify-center"
          >
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-600 mb-6">Universal Compatibility</p>
            <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tight mb-6 leading-tight">
              Hỗ trợ đa<br />nền tảng ATS.
            </h2>
            <p className="text-lg text-zinc-400 leading-relaxed mb-10">
              Từ Workday, Taleo, Greenhouse cho tới Lever và iCIMS. Hệ thống được huấn luyện trên hàng ngàn logic tuyển dụng của các tập đoàn hàng đầu thế giới.
            </p>
            <div className="space-y-4">
              {[
                "Phát hiện keyword thiếu theo từng ATS cụ thể",
                "Cảnh báo format không tương thích tự động",
                "Cập nhật thuật toán ATS theo thời gian thực",
              ].map((feat) => (
                <div key={feat} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[15px] text-zinc-300">{feat}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── IMPACT STATS ── */}
      <section className="py-32 px-6 bg-[#0B0B0C] relative z-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
          className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-3 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black"
        >
          {[
            { num: "68", unit: "%", label: "Tỷ lệ qua vòng hồ sơ tăng lên rõ rệt." },
            { num: "4.3", unit: "h", label: "Tiết kiệm mỗi tuần khi tinh chỉnh CV." },
            { num: "10", unit: "x", label: "Nhanh hơn cách làm truyền thống." },
          ].map(({ num, unit, label }, i) => (
            <div key={i} className="bg-[#101012] p-16 flex flex-col items-center text-center hover:bg-[#131316] transition-colors border-r border-white/10 last:border-r-0">
              <span className="text-7xl md:text-[6rem] font-light text-white mb-6 tracking-tighter">
                {num}<span className="text-4xl text-zinc-600">{unit}</span>
              </span>
              <span className="text-[15px] text-zinc-400 font-medium">{label}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── VIDEO SHOWCASE ── */}
      <section className="px-6 max-w-[1200px] mx-auto pb-32 relative z-30 bg-[#0B0B0C]">
        <motion.div
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full rounded-3xl overflow-hidden border border-white/[0.08] shadow-[0_32px_64px_rgba(0,0,0,0.8)] bg-[#0B0B0C] relative"
        >
          {/* Glass light reflection on top edge */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-10" />
          <video autoPlay loop muted playsInline className="w-full h-auto relative z-0">
            <source src="https://framerusercontent.com/assets/YKL6xa3KPAeOS9MRDngjVEVhQ.mp4" type="video/mp4" />
          </video>
        </motion.div>
      </section>

      {/* ── CV TEMPLATES GALLERY (Inspired by Legora) ── */}
      <section className="py-24 bg-[#F9F9F8] text-[#111] overflow-hidden relative z-20">
        <div className="max-w-[1600px] mx-auto px-6 mb-16 relative">
          
          {/* Pagination & Controls */}
          <div className="flex items-center justify-between w-full relative z-10">
            <button onClick={prevTemplate} disabled={activeTemplateIndex === 0} className="w-10 h-10 rounded-full bg-[#EAEAEA] flex items-center justify-center hover:bg-[#DCDCDA] transition disabled:opacity-30 disabled:cursor-not-allowed">
              <span className="text-xl leading-none -mt-1">&larr;</span>
            </button>
            
            <div className="flex gap-2 bg-[#EAEAEA] px-4 py-2 rounded-full">
              {cvTemplates.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === activeTemplateIndex ? 'w-4 bg-black' : 'w-1.5 bg-black/20'}`} />
              ))}
            </div>
            
            <button onClick={nextTemplate} disabled={activeTemplateIndex === cvTemplates.length - 1} className="w-10 h-10 rounded-full bg-[#EAEAEA] flex items-center justify-center hover:bg-[#DCDCDA] transition disabled:opacity-30 disabled:cursor-not-allowed">
              <span className="text-xl leading-none -mt-1">&rarr;</span>
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="w-full flex justify-center relative min-h-[700px] mt-10">
          {cvTemplates.map((tpl, i) => {
            const offset = i - activeTemplateIndex;
            const isCenter = offset === 0;
            const absOffset = Math.abs(offset);
            
            // Calculate cover flow layout
            const x = offset * 420; // horizontal spacing
            const scale = isCenter ? 1 : 0.85;
            const opacity = absOffset > 2 ? 0 : isCenter ? 1 : 0.6;
            const zIndex = 10 - absOffset;
            
            return (
              <motion.div
                key={i}
                animate={{ x, scale, opacity, zIndex }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="absolute top-0 flex flex-col items-center"
                style={{ width: "500px", transformOrigin: "top center" }}
              >
                <div 
                  className="w-full aspect-[4/4.5] bg-white shadow-xl relative overflow-hidden group cursor-pointer transition-shadow hover:shadow-2xl" 
                  onClick={() => setActiveTemplateIndex(i)}
                >
                  <Image src={tpl.img} alt={tpl.title} width={600} height={700} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  
                  {/* Overlay for non-centered items */}
                  {!isCenter && <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] transition-opacity" />}
                  
                  {/* Top center text just like Legora */}
                  <div className="absolute top-6 left-0 w-full text-center z-10">
                    <span className="text-white text-sm font-medium tracking-wide drop-shadow-md">{tpl.title}</span>
                  </div>
                </div>
                
                {/* Information below center image */}
                {isCenter && (
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }} className="text-left w-full px-2 mt-8">
                     <h3 className="text-xl font-medium mb-4 text-black">CVision {tpl.title} Template</h3>
                     <p className="text-[#555] text-[15px] leading-relaxed mb-6 max-w-md">{tpl.desc}</p>
                     <button className="text-[14px] font-medium text-black flex items-center gap-2 hover:opacity-70 transition border-b border-black pb-0.5">
                        &darr; Read more
                     </button>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ── VISION SECTION (Light) ── */}
      <section className="py-32 px-6 bg-[#EBEBE8] text-[#111] relative z-20">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-5 flex flex-col">
            <motion.h2
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
              className="text-5xl md:text-6xl tracking-tight mb-20 font-medium"
            >
              Tầm Nhìn
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-auto"
            >
              <Image src="/vision_image.png" alt="Founder" width={600} height={600} className="w-full max-w-[320px] aspect-[4/5] object-cover rounded-xl shadow-xl mb-4" />
              <div className="text-[15px] font-medium text-[#111]">Phạm Văn Minh</div>
              <div className="text-[14px] text-zinc-500">Founder & Lead Engineer</div>
            </motion.div>
          </div>

          <div className="lg:col-span-7 flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1 }}
              className="flex flex-col md:flex-row gap-8 mb-16 text-[#444] text-[15px] leading-relaxed font-medium"
            >
              <div className="md:w-1/2">
                Con người mang đến sự phán đoán, chiến lược và tính sáng tạo. AI mang lại tốc độ, quy mô và độ chính xác tuyệt đối. Cùng nhau, chúng ta mở ra những khả năng mới cho hành trình phát triển sự nghiệp.
              </div>
              <div className="md:w-1/2">
                Tầm nhìn của chúng tôi là cung cấp cho mọi ứng viên công cụ để vượt qua sự rập khuôn của hệ thống ATS. Bằng cách tự động hóa những tác vụ phân tích rườm rà, chúng tôi giúp bạn dành nhiều thời gian hơn để trau dồi chuyên môn.
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }}
              className="w-full mt-auto"
            >
              <Image
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600&auto=format&fit=crop"
                alt="Office Workspace" width={900} height={560}
                className="w-full h-auto aspect-[16/10] object-cover rounded-2xl shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── INDUSTRY MARQUEE ── */}
      <section className="py-24 bg-[#EBEBE8] text-center overflow-hidden">
        <motion.h2
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-4xl md:text-5xl font-medium text-[#111] mb-4 tracking-tight"
        >
          Mọi ngành nghề.<br />Mọi vị trí.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
          className="text-[#555] text-[15px] max-w-2xl mx-auto mb-16"
        >
          CVision xử lý các luồng công việc phức tạp từ đầu đến cuối cho mọi lĩnh vực, từ sinh viên mới ra trường đến các chuyên gia cấp cao.
        </motion.p>
        <div className="relative w-full overflow-hidden flex pb-12 group">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ ease: "linear", duration: 35, repeat: Infinity }}
            className="flex w-max"
          >
            {[0, 1].map((setIndex) => (
              <div key={setIndex} className="flex gap-6 px-3">
                {[
                  { title: "Công nghệ thông tin", img: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=600&auto=format&fit=crop" },
                  { title: "Tài chính & Ngân hàng", img: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=600&auto=format&fit=crop" },
                  { title: "Marketing & Truyền thông", img: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=600&auto=format&fit=crop" },
                  { title: "Quản trị Nhân sự", img: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=600&auto=format&fit=crop" },
                  { title: "Kỹ thuật & Sản xuất", img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=600&auto=format&fit=crop" },
                ].map((item, idx) => (
                  <div key={idx} className="min-w-[280px] md:min-w-[340px] aspect-[4/5] relative rounded-lg overflow-hidden flex-shrink-0 cursor-pointer">
                    <Image src={item.img} alt={item.title} width={340} height={425} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <p className="text-white font-semibold text-[16px] leading-tight">{item.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── PRODUCT FEATURES (Light theme) ── */}
      <section id="solutions" className="py-32 px-6 bg-white text-[#111] relative z-20">
        <div className="max-w-[1600px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mb-20 max-w-3xl"
          >
            <p className="text-[12px] text-zinc-400 font-bold uppercase tracking-widest mb-4">What&apos;s inside</p>
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-5">Tất cả công cụ bạn cần để thành công.</h2>
            <p className="text-[#555] text-lg leading-relaxed">Từ phân tích ATS chuyên sâu đến gợi ý viết lại thông minh — CVision là trợ lý sự nghiệp toàn diện nhất.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Search, title: "ATS Scanner", desc: "Tự động nhận diện rủi ro từ khóa ẩn sâu bên trong các bộ lọc khắt khe nhất của ATS.", img: "https://framerusercontent.com/images/BGgtXSuezGkXRg4zYlZNzJAXEE.webp" },
              { icon: Bot, title: "AI Agent", desc: "Thực thi tự động hóa end-to-end. AI Agent tự lên kế hoạch, rà soát và tinh chỉnh CV của bạn.", img: "https://framerusercontent.com/images/qlpK6MJmUtSiRbbJJw2m0Tnj0.webp" },
              { icon: BarChart3, title: "Phân tích đa chiều", desc: "Dẫn đầu xu thế tuyển dụng. Liên tục quét và đối chiếu với các thuật toán ATS mới nhất.", img: "https://framerusercontent.com/images/BGgtXSuezGkXRg4zYlZNzJAXEE.webp" },
              { icon: Workflow, title: "Checklist thông minh", desc: "Tự động khởi tạo danh sách hành động từ kết quả phân tích, kết nối trực tiếp vào luồng chỉnh sửa.", img: "https://framerusercontent.com/images/E7BgozJAm5PBqfplk2ynWhC1qU.webp" },
            ].map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex flex-col"
              >
                <div className="bg-[#F4F4F4] rounded-2xl mb-6 overflow-hidden aspect-square flex items-center justify-center p-4">
                  <Image src={feat.img} alt={feat.title} width={600} height={600} className="w-full h-full object-cover rounded-xl" />
                </div>
                <h3 className="font-semibold text-lg mb-3">{feat.title}</h3>
                <p className="text-[#666] text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 px-6 bg-[#F7F7F5] text-[#111] relative z-20">
        <div className="max-w-[1400px] mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-4xl font-medium tracking-tight mb-16 text-center"
          >
            Người dùng nói gì về CVision.
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="bg-white rounded-3xl p-8 shadow-sm border border-[#EBEBEB] hover:shadow-md transition-all"
              >
                <div className="text-4xl font-serif opacity-30 mb-4">&ldquo;</div>
                <p className="text-[15px] text-[#333] leading-relaxed mb-6">{t.quote}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0B0B0C] text-white flex items-center justify-center text-[12px] font-bold shrink-0">{t.avatar}</div>
                  <div>
                    <div className="font-semibold text-[14px]">{t.name}</div>
                    <div className="text-zinc-500 text-[12px]">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECURITY BADGES ── */}
      <section id="security" className="py-32 px-6 bg-[#0B0B0C] border-t border-white/[0.04]">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="max-w-[1600px] mx-auto text-center"
        >
          <h2 className="text-3xl font-semibold text-white mb-16 tracking-tight">Bảo mật dữ liệu cấp độ Doanh nghiệp.</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {["SOC 2 Type II", "ISO 27001", "GDPR Ready", "End-to-end Encryption"].map((cert, i) => (
              <motion.div
                key={cert}
                initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="px-8 py-4 rounded-full border border-white/[0.08] bg-[#161618] text-zinc-300 text-[13px] font-mono flex items-center gap-3 hover:border-white/20 transition cursor-default"
              >
                <Lock className="w-4 h-4 text-zinc-500" />
                {cert}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 px-6 bg-[#0B0B0C] relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="max-w-[900px] mx-auto text-center"
        >
          <h2 className="font-playfair text-5xl md:text-7xl text-white tracking-tight mb-8 leading-tight">
            Bắt đầu hành trình<br />sự nghiệp của bạn.
          </h2>
          <p className="text-zinc-400 text-xl mb-12 max-w-xl mx-auto leading-relaxed">
            Miễn phí, không cần thẻ tín dụng. Kết quả phân tích ATS đầu tiên trong vòng 60 giây.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="group inline-flex items-center gap-2 bg-white text-black px-10 py-4 rounded-full font-bold text-[15px] hover:bg-zinc-200 transition shadow-lg shadow-white/10">
              Dùng thử miễn phí
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link href="/product" className="inline-flex items-center gap-2 border border-white/20 text-white px-10 py-4 rounded-full font-medium text-[15px] hover:bg-white/10 transition">
              Xem tính năng
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER (Legora style) ── */}
      <footer className="bg-white text-[#111] border-t border-[#E5E5E5]">
        <div className="max-w-[1600px] mx-auto px-10 pt-16 pb-12 grid grid-cols-2 md:grid-cols-4 gap-10">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-5">Product</p>
            <ul className="space-y-3 text-[14px]">
              {["CVision aOS", "ATS Scanner", "Smart Editor", "AI Workflows", "Mobile app", "ATS Monitors", "AI Agent", "Smart Lists"].map((item) => (
                <li key={item}><Link href="/product" className="text-zinc-600 hover:text-black transition">{item}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-5">Solutions</p>
            <ul className="space-y-3 text-[14px]">
              {["IT & Software", "Finance", "Marketing", "HR & Admin", "Engineering", "Freshers", "Mid-level", "Senior & Managers"].map((item) => (
                <li key={item}><Link href="/solutions" className="text-zinc-600 hover:text-black transition">{item}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-5">Security</p>
            <ul className="space-y-3 text-[14px]">
              {["SOC 2 Type II", "ISO 27001", "GDPR Ready", "Trust Center", "Data Privacy"].map((item) => (
                <li key={item}><Link href="/security" className="text-zinc-600 hover:text-black transition">{item}</Link></li>
              ))}
            </ul>
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-5 mt-8">Company</p>
            <ul className="space-y-3 text-[14px]">
              {["About", "Careers", "Press", "Contact"].map((item) => (
                <li key={item}><Link href="/company" className="text-zinc-600 hover:text-black transition">{item}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-5">Resources</p>
            <ul className="space-y-3 text-[14px]">
              {["Blog", "Career Guide", "CV Templates", "ATS Checklist", "Salary Research", "Interview Prep"].map((item) => (
                <li key={item}><Link href="#" className="text-zinc-600 hover:text-black transition">{item}</Link></li>
              ))}
            </ul>
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-5 mt-8">Customers</p>
            <ul className="space-y-3 text-[14px]">
              {["Customer Stories", "Case Studies", "Reviews"].map((item) => (
                <li key={item}><Link href="/customers" className="text-zinc-600 hover:text-black transition">{item}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        {/* Giant brand */}
        <div className="border-t border-[#E5E5E5] py-10 px-10 flex items-center justify-center overflow-hidden">
          <div className="text-[10vw] font-bold tracking-tighter text-[#111] leading-none select-none whitespace-nowrap opacity-[0.06]">
            CVISION
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#E5E5E5] px-10 py-5">
          <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[12px] text-zinc-500">
            <div className="flex flex-wrap gap-6">
              <Link href="#" className="hover:text-black transition">Terms of use</Link>
              <Link href="#" className="hover:text-black transition">Privacy Policy</Link>
              <Link href="#" className="hover:text-black transition">Cookie Policy</Link>
              <Link href="#" className="hover:text-black transition">Security Policy</Link>
            </div>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-black transition">Blog</Link>
              <Link href="#" className="hover:text-black transition">Career Guide</Link>
              <Link href="#" className="hover:text-black transition">API</Link>
            </div>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-black transition font-medium">𝕏 Twitter</Link>
              <Link href="#" className="hover:text-black transition font-medium">LinkedIn</Link>
              <span>&copy; 2026 CVision Inc.</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
