"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  UploadCloud, FileText, TrendingUp, ArrowRight,
  Sparkles, Bot, Layers, MessageSquare, Upload, Mail, Phone, Globe, MapPin,
  Share2, GitBranch,
} from "lucide-react";
import { getDashboardStats } from "@/lib/store";
import { apiListAnalyses } from "@/lib/api";
import { saveAnalysis } from "@/lib/store";
import type { AnalysisResult } from "@/lib/types";
import { motion } from "framer-motion";

// ── Score chip ────────────────────────────────────────────────────────────────

function ScoreChip({ score }: { score: number }) {
  const cls =
    score >= 80 ? "bg-emerald-100 text-emerald-600 border-emerald-200"
    : score >= 60 ? "bg-amber-100 text-amber-600 border-amber-200"
    : "bg-red-100 text-red-500 border-red-200";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      {score}/100
    </span>
  );
}

// ── Marquee ticker ────────────────────────────────────────────────────────────

const TICKER_WORDS = [
  "ATS SCAN", "✦", "AI ANALYSIS", "✦", "SMART RESUME", "✦",
  "CAREER BOOST", "✦", "CVISION AI", "✦", "KEYWORD MATCH", "✦",
  "JOB READY", "✦", "HR SIMULATION", "✦", "SCORE REPORT", "✦",
];

function Marquee() {
  return (
    <div className="w-full overflow-hidden border-y border-blue-100 bg-blue-50/60 py-3 my-6 select-none">
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 22, ease: "linear", repeat: Infinity }}
      >
        {[...TICKER_WORDS, ...TICKER_WORDS].map((w, i) => (
          <span
            key={i}
            className={`text-[11px] font-bold tracking-[0.2em] ${w === "✦" ? "text-blue-300" : "text-blue-500"}`}
          >
            {w}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ── Hero Banner Cards ─────────────────────────────────────────────────────────

const BANNER_CARDS = [
  {
    img: "/banner-cv-analysis.png",
    tag: "AI POWERED",
    title: "SMART CV\nANALYSIS",
    sub: "DEEP ATS SEMANTIC SCORING",
    href: "/dashboard/upload",
  },
  {
    img: "/banner-job-prep.png",
    tag: "INSTANT",
    title: "COVER\nLETTER",
    sub: "AI-CRAFTED PERSONALIZATION",
    href: "/dashboard/cover-letter",
  },
  {
    img: "/banner-career-growth.png",
    tag: "PREMIUM",
    title: "CAREER\nINSIGHTS",
    sub: "DATA-DRIVEN ADVICE",
    href: "/dashboard/analyses",
  },
];

function BannerCard({ card, idx }: { card: typeof BANNER_CARDS[number]; idx: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1 }}
      className="relative rounded-2xl overflow-hidden cursor-pointer group flex-1 min-w-0"
      style={{ minHeight: 200 }}
    >
      <Link href={card.href} className="relative block h-full">
        <Image
          src={card.img}
          alt={card.title}
          fill
          priority={idx === 0}
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        {/* Content */}
        <div className="absolute inset-0 p-5 flex flex-col justify-end">
          <span className="text-[10px] font-bold tracking-[0.2em] text-white/60 mb-1">{card.tag}</span>
          <h3 className="text-white font-black text-[22px] leading-tight whitespace-pre-line tracking-tight drop-shadow-sm">
            {card.title}
          </h3>
          <p className="text-white/60 text-[11px] font-semibold tracking-widest mt-1">{card.sub}</p>
        </div>
      </Link>
    </motion.div>
  );
}

// ── Stat Box ──────────────────────────────────────────────────────────────────

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <div className="text-[13px] text-gray-400 font-medium italic mb-1">{label}</div>
      <div className="text-3xl font-black text-[#3b82f6]">{value}</div>
    </div>
  );
}

// ── Quick Action Card ─────────────────────────────────────────────────────────

function QuickCard({
  href, icon: Icon, title, desc, color,
}: {
  href: string; icon: React.ElementType; title: string; desc: string; color: string;
}) {
  return (
    <Link
      href={href}
      className="group bg-white rounded-2xl border border-gray-100 p-5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all duration-300 flex items-start gap-4"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <div className="font-bold text-gray-800 text-[14px] mb-1">{title}</div>
        <div className="text-[12px] text-gray-400 leading-relaxed">{desc}</div>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400 shrink-0 mt-0.5 transition-colors ml-auto" />
    </Link>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DashboardHome() {
  const [stats, setStats] = useState(() => getDashboardStats());

  useEffect(() => {
    apiListAnalyses()
      .then(({ analyses: remote }) => {
        for (const r of remote) {
          const exists = getDashboardStats().recentAnalyses.find((a) => a.analysis_id === r.id);
          if (!exists) {
            saveAnalysis({
              analysis_id: r.id,
              fileName: r.file_name ?? "unknown.pdf",
              role: r.role ?? "",
              createdAt: r.created_at,
              total_score: r.total_score,
              layout_score: r.layout_score,
              content_score: r.content_score,
              ats_score: r.ats_score,
              keyword_score: r.keyword_score,
              skills_score: r.skills_score,
              achievement_score: r.achievement_score,
              ats_platform_scores: r.ats_platform_scores,
              matched_keywords: r.matched_keywords ?? [],
              missing_keywords: r.missing_keywords ?? [],
              suggestions: (r.suggestions as AnalysisResult["suggestions"]) ?? [],
              hr_review: r.hr_review as AnalysisResult["hr_review"],
              summary: r.summary,
              resume_id: r.resume_id,
              job_id: r.job_id,
            });
          }
        }
        setStats(getDashboardStats());
      })
      .catch(() => null);
  }, []);

  const isEmpty = stats.analysisCount === 0;

  return (
    <div className="pb-12 space-y-0">
      {/* ── Banner Cards ── */}
      <div className="flex gap-4" style={{ height: 220 }}>
        {BANNER_CARDS.map((card, i) => (
          <BannerCard key={i} card={card} idx={i} />
        ))}
      </div>

      {/* ── Ticker ── */}
      <Marquee />

      {/* ── "Why People Choose" section ── */}
      <div className="bg-white rounded-2xl border border-gray-100 px-8 py-8 mb-6 relative overflow-hidden">
        {/* Decorative dots */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2">
          {[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full bg-blue-200" />)}
        </div>
        <p className="text-center text-[11px] font-bold tracking-[0.25em] text-blue-400 uppercase pt-4 mb-1">
          Trusted by Job Seekers
        </p>
        <h2 className="text-center text-2xl font-bold text-gray-800 mb-6">
          Why People{" "}
          <span className="text-[#3b82f6] italic font-black" style={{ fontFamily: "serif" }}>
            Choose CVision
          </span>
        </h2>
        <div className="flex items-center justify-center gap-12 flex-wrap">
          <StatBox label="Analyses" value={stats.analysisCount || "—"} />
          <StatBox label="CV Versions" value={stats.versionCount || "—"} />
          <StatBox label="Avg Score" value={stats.avgScore > 0 ? `${stats.avgScore}` : "—"} />
          <StatBox label="Features" value="6" />
        </div>
      </div>

      {/* ── Explore section ── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-gray-800">Explore !!</h2>
          <Link
            href="/dashboard/upload"
            className="flex items-center gap-2 text-[13px] font-semibold bg-[#3b82f6] text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition shadow-md shadow-blue-200"
          >
            <Upload className="w-4 h-4" />
            + Phân Tích CV
          </Link>
        </div>

        {/* Quick Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickCard
            href="/dashboard/upload"
            icon={UploadCloud}
            title="Phân Tích CV Mới"
            desc="Upload CV + JD để AI chấm điểm ATS, gợi ý từ khóa và tối ưu hóa."
            color="bg-blue-50 text-blue-500"
          />
          <QuickCard
            href="/dashboard/cover-letter"
            icon={MessageSquare}
            title="Tạo Cover Letter"
            desc="AI tự động soạn cover letter cá nhân hóa theo JD bạn nhắm đến."
            color="bg-indigo-50 text-indigo-500"
          />
          <QuickCard
            href="/dashboard/templates"
            icon={Layers}
            title="Mẫu CV Đẹp"
            desc="Bộ template ATS-friendly, thiết kế chuyên nghiệp, xuất PDF ngay."
            color="bg-emerald-50 text-emerald-500"
          />
          <QuickCard
            href="/dashboard/analyses"
            icon={TrendingUp}
            title="Xem Lịch Sử"
            desc="Tra cứu toàn bộ kết quả phân tích, điểm số và gợi ý đã nhận."
            color="bg-amber-50 text-amber-500"
          />
          <QuickCard
            href="/dashboard/cv-versions"
            icon={FileText}
            title="Các Bản CV Đã Tạo"
            desc="Quản lý nhiều phiên bản CV được tối ưu cho từng vị trí khác nhau."
            color="bg-purple-50 text-purple-500"
          />
          <QuickCard
            href="/dashboard/billing"
            icon={Sparkles}
            title="Nâng Cấp Premium"
            desc="Mở khoá phân tích không giới hạn, HR Simulation và tính năng Pro."
            color="bg-pink-50 text-pink-500"
          />
        </div>
      </div>

      {/* ── Recent Analyses ── */}
      {isEmpty ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <Bot className="w-7 h-7 text-blue-400" />
          </div>
          <h3 className="text-gray-800 font-bold text-xl mb-2">Bắt đầu phân tích đầu tiên</h3>
          <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto leading-relaxed">
            Upload CV của bạn cùng mô tả công việc. AI sẽ thực hiện phân tích sâu về ATS, keyword matching và đưa ra gợi ý chi tiết.
          </p>
          <Link
            href="/dashboard/upload"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#3b82f6] text-white font-semibold rounded-xl hover:bg-blue-600 transition shadow-md shadow-blue-200"
          >
            <UploadCloud className="w-4 h-4" />
            Phân Tích Ngay
          </Link>
        </motion.div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-bold text-gray-700">Phân Tích Gần Đây</h2>
            <Link href="/dashboard/analyses" className="text-[13px] text-blue-500 hover:text-blue-700 flex items-center gap-1 font-medium transition">
              Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-[13px]">
              <thead className="border-b border-gray-100 text-gray-400 text-[12px] font-semibold">
                <tr>
                  <th className="px-5 py-4 font-semibold">Tài Liệu</th>
                  <th className="px-5 py-4 font-semibold hidden sm:table-cell">Vị Trí</th>
                  <th className="px-5 py-4 font-semibold">Điểm</th>
                  <th className="px-5 py-4 font-semibold" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentAnalyses.map((item) => (
                  <tr key={item.analysis_id} className="group hover:bg-blue-50/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-blue-400" />
                        </div>
                        <span className="font-semibold text-gray-700 truncate max-w-[180px]">
                          {item.fileName}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-400 hidden sm:table-cell">
                      {item.role || "N/A"}
                    </td>
                    <td className="px-5 py-4">
                      <ScoreChip score={item.total_score} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/dashboard/analyses/${item.analysis_id}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 border border-gray-200 text-gray-400 hover:bg-blue-500 hover:border-blue-500 hover:text-white transition-all"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Photo Grid Marquee (Băng chuyền) ── */}
      <div className="mt-12 overflow-hidden w-full flex flex-col gap-4 relative">
        <div className="absolute inset-y-0 left-0 w-12 md:w-32 bg-gradient-to-r from-[#f5f7fb] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-12 md:w-32 bg-gradient-to-l from-[#f5f7fb] to-transparent z-10 pointer-events-none" />

        {/* Row 1 - scrolling left */}
        <motion.div
          className="flex gap-4 w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 40, ease: "linear", repeat: Infinity }}
        >
          {[1, 2].map((set) => (
            <div key={`row1-${set}`} className="flex gap-4 w-max">
              <div className="w-[280px] md:w-[320px] h-[180px] md:h-[220px] rounded-2xl overflow-hidden relative shadow-md">
                <Image src="/grid-ats-scan.png" alt="ATS Scan" fill className="object-cover hover:scale-105 transition-transform duration-500" sizes="320px" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4"><span className="text-white font-bold text-sm">Quét ATS Nâng Cao</span></div>
              </div>
              <div className="w-[400px] md:w-[500px] h-[180px] md:h-[220px] rounded-2xl overflow-hidden relative shadow-md">
                <Image src="/banner-cv-analysis.png" alt="CV Analysis" fill className="object-cover hover:scale-105 transition-transform duration-500" sizes="500px" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4"><span className="text-white font-bold text-sm">Phân tích CV chi tiết</span></div>
              </div>
              <div className="w-[280px] md:w-[320px] h-[180px] md:h-[220px] rounded-2xl overflow-hidden relative shadow-md">
                <Image src="/grid-keywords.png" alt="Keywords" fill className="object-cover hover:scale-105 transition-transform duration-500" sizes="320px" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4"><span className="text-white font-bold text-sm">Trích xuất Từ Khóa</span></div>
              </div>
              <div className="w-[280px] md:w-[320px] h-[180px] md:h-[220px] rounded-2xl overflow-hidden relative shadow-md">
                <Image src="/banner-career-growth.png" alt="Career Growth" fill className="object-cover hover:scale-105 transition-transform duration-500" sizes="320px" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4"><span className="text-white font-bold text-sm">Định hướng Nghề Nghiệp</span></div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Row 2 - scrolling right */}
        <motion.div
          className="flex gap-4 w-max"
          animate={{ x: ["-50%", "0%"] }}
          transition={{ duration: 45, ease: "linear", repeat: Infinity }}
        >
          {[1, 2].map((set) => (
            <div key={`row2-${set}`} className="flex gap-4 w-max">
              <div className="w-[300px] md:w-[340px] h-[160px] md:h-[180px] rounded-2xl overflow-hidden relative shadow-md">
                <Image src="/banner-career-growth.png" alt="Career" fill className="object-cover object-bottom hover:scale-105 transition-transform duration-500" sizes="340px" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4"><span className="text-white font-bold text-sm">Mở Rộng Tương Lai</span></div>
              </div>
              <div className="w-[420px] md:w-[520px] h-[160px] md:h-[180px] rounded-2xl overflow-hidden relative shadow-md">
                <Image src="/grid-interview.png" alt="Interview" fill className="object-cover hover:scale-105 transition-transform duration-500" sizes="520px" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4"><span className="text-white font-bold text-sm">Mô phỏng Phỏng Vấn AI</span></div>
              </div>
              <div className="w-[280px] md:w-[320px] h-[160px] md:h-[180px] rounded-2xl overflow-hidden relative shadow-md">
                <Image src="/banner-job-prep.png" alt="Job Prep" fill className="object-cover hover:scale-105 transition-transform duration-500" sizes="320px" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4"><span className="text-white font-bold text-sm">Chuẩn Bị Nhận Việc</span></div>
              </div>
              <div className="w-[280px] md:w-[320px] h-[160px] md:h-[180px] rounded-2xl overflow-hidden relative shadow-md">
                <Image src="/grid-ats-scan.png" alt="ATS" fill className="object-cover object-top hover:scale-105 transition-transform duration-500" sizes="320px" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4"><span className="text-white font-bold text-sm">Thiết Kế Đẹp Mắt</span></div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Footer ── */}
      <footer className="mt-10 border-t border-gray-100 pt-8">
        {/* Tagline */}
        <p className="text-center text-[12px] text-blue-400 font-semibold tracking-[0.25em] mb-8">
          ✦ CVision AI ✦
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand col */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#3b82f6] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-[18px] text-[#3b82f6]" style={{ fontFamily: 'serif' }}>CVision</span>
            </div>
            <p className="text-[12.5px] text-gray-400 leading-relaxed mb-4">
              Nền tảng tối ưu CV thông minh — nơi AI phân tích, scoring và giúp bạn chinh phục nhà tuyển dụng.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-blue-100 hover:text-blue-500 transition">
                <Share2 className="w-3.5 h-3.5" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-blue-100 hover:text-blue-500 transition">
                <Mail className="w-3.5 h-3.5" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-blue-100 hover:text-blue-500 transition">
                <GitBranch className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Navigation col */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                <Globe className="w-3 h-3 text-blue-500" />
              </div>
              <h4 className="font-bold text-[13px] text-gray-700 uppercase tracking-widest">Điều Hướng</h4>
            </div>
            <ul className="space-y-2">
              {[
                { label: "Trang Chủ Dashboard", href: "/dashboard" },
                { label: "Phân Tích CV", href: "/dashboard/upload" },
                { label: "Lịch Sử", href: "/dashboard/analyses" },
                { label: "Các Bản CV", href: "/dashboard/cv-versions" },
                { label: "Cover Letter", href: "/dashboard/cover-letter" },
                { label: "Mẫu CV", href: "/dashboard/templates" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[13px] text-gray-500 hover:text-blue-500 transition flex items-center gap-1.5 group"
                  >
                    <span className="text-gray-300 group-hover:text-blue-300">›</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Features col */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-emerald-500" />
              </div>
              <h4 className="font-bold text-[13px] text-gray-700 uppercase tracking-widest">Tính Năng</h4>
            </div>
            <ul className="space-y-2.5">
              {[
                { label: "ATS Score & Keyword Match", tag: "AI" },
                { label: "HR Simulation", tag: "PRO" },
                { label: "Cover Letter Generator", tag: "AI" },
                { label: "Smart CV Templates", tag: "" },
                { label: "Multi-version CV", tag: "" },
              ].map((feat, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-[13px] text-gray-500">{feat.label}</span>
                  {feat.tag && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-500">{feat.tag}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact col */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center">
                <Mail className="w-3 h-3 text-amber-500" />
              </div>
              <h4 className="font-bold text-[13px] text-gray-700 uppercase tracking-widest">Liên Hệ</h4>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gray-300 mt-0.5 shrink-0" />
                <span className="text-[12.5px] text-gray-500 leading-snug">
                  Trường ĐH Bách Khoa Hà Nội<br />Số 1, Đại Cồ Việt, Hà Nội
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gray-300 shrink-0" />
                <a href="tel:+84" className="text-[12.5px] text-gray-500 hover:text-blue-500 transition">+84 xxx xxx xxx</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gray-300 shrink-0" />
                <a href="mailto:cvision@email.com" className="text-[12.5px] text-gray-500 hover:text-blue-500 transition">cvision@email.com</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-gray-300 shrink-0" />
                <a href="https://cv-resume-ai-analyze.vercel.app" target="_blank" className="text-[12.5px] text-blue-400 hover:text-blue-600 transition">cv-resume-ai-analyze.vercel.app</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="mt-8 pt-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11.5px] text-gray-400">
            © 2024 CVision AI. Được xây dựng với ❤️ bởi sinh viên HUST.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-[11.5px] text-gray-400 hover:text-blue-500 transition">Chính Sách Bảo Mật</Link>
            <Link href="/terms" className="text-[11.5px] text-gray-400 hover:text-blue-500 transition">Điều Khoản Sử Dụng</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
