"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle, CheckCircle2, XCircle, Lightbulb, Target,
  User, BarChart2, TrendingUp, ArrowLeft, Loader2,
} from "lucide-react";
import Link from "next/link";
import { getAnalysisById } from "@/lib/store";
import type { AnalysisResult } from "@/lib/types";

type Tab = "score" | "ats" | "keywords" | "achievements" | "hr";

const TABS: { id: Tab; label: string }[] = [
  { id: "score", label: "Điểm số" },
  { id: "ats", label: "ATS" },
  { id: "keywords", label: "Từ khóa" },
  { id: "achievements", label: "Thành tích" },
  { id: "hr", label: "HR View" },
];

function ScoreBar({ label, value, max = 100, color }: { label: string; value: number; max?: number; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-zinc-400">
        <span>{label}</span>
        <span className="font-mono font-semibold text-white">{value}{max !== 100 ? `/${max}` : "%"}</span>
      </div>
      <div className="w-full bg-white/[0.06] h-2 rounded-full overflow-hidden">
        <div className={`h-2 rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ScoreColor(score: number) {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-amber-400";
  return "text-red-400";
}

function BarColor(score: number) {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-red-500";
}

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    high: "bg-red-500/10 text-red-400 border border-red-500/20",
    medium: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    low: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  };
  const label: Record<string, string> = { high: "Cao", medium: "Vừa", low: "Thấp" };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[priority] ?? map.low}`}>
      {label[priority] ?? priority}
    </span>
  );
}

// ── Tab: Score ───────────────────────────────────────────────
function TabScore({ a }: { a: AnalysisResult }) {
  return (
    <div className="space-y-6">
      {/* Hero score */}
      <div className="flex items-center justify-between p-6 bg-white/[0.03] rounded-2xl border border-white/10">
        <div>
          <h2 className="text-sm font-medium text-zinc-400 mb-1">Điểm tổng quan</h2>
          <p className="text-zinc-500 text-xs">Vị trí: <span className="text-zinc-300">{a.role}</span></p>
          {a.isDemo && (
            <span className="mt-2 inline-block text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Demo — kết nối backend để có kết quả thực
            </span>
          )}
        </div>
        <div className={`text-6xl font-light tabular-nums ${ScoreColor(a.total_score)}`}>
          {a.total_score}<span className="text-2xl text-zinc-500">/100</span>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: "Bố cục & Trình bày", value: a.layout_score },
          { label: "Nội dung", value: a.content_score },
          { label: "Điểm ATS", value: a.ats_score },
          { label: "Từ khóa", value: a.keyword_score },
          { label: "Kỹ năng", value: a.skills_score },
          { label: "Thành tích", value: a.achievement_score },
        ].map((item) => (
          <div key={item.label} className="bg-[#0B0B0C] p-4 rounded-xl border border-white/[0.06]">
            <ScoreBar label={item.label} value={item.value} color={BarColor(item.value)} />
          </div>
        ))}
      </div>

      {/* Strengths & Weaknesses */}
      {(a.strengths?.length || a.weaknesses?.length) ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {a.strengths?.length ? (
            <div className="bg-emerald-500/[0.05] border border-emerald-500/20 rounded-xl p-4">
              <h4 className="font-semibold text-emerald-400 text-sm mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Điểm mạnh
              </h4>
              <ul className="space-y-2">
                {a.strengths.map((s, i) => <li key={i} className="text-zinc-300 text-sm flex gap-2"><span className="text-emerald-500 shrink-0">✓</span>{s}</li>)}
              </ul>
            </div>
          ) : null}
          {a.weaknesses?.length ? (
            <div className="bg-red-500/[0.05] border border-red-500/20 rounded-xl p-4">
              <h4 className="font-semibold text-red-400 text-sm mb-3 flex items-center gap-2">
                <XCircle className="w-4 h-4" /> Điểm yếu
              </h4>
              <ul className="space-y-2">
                {a.weaknesses.map((s, i) => <li key={i} className="text-zinc-300 text-sm flex gap-2"><span className="text-red-500 shrink-0">✗</span>{s}</li>)}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Suggestions */}
      {a.suggestions?.length ? (
        <div>
          <h3 className="text-sm font-semibold text-white mb-3">Gợi ý cải thiện</h3>
          <div className="space-y-3">
            {a.suggestions.map((s, i) => (
              <div key={i} className="bg-[#161618] border border-white/[0.06] rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="text-sm font-medium text-zinc-200">{s.problem}</p>
                  <PriorityBadge priority={s.priority} />
                </div>
                <p className="text-sm text-zinc-400">{s.recommendation}</p>
                {s.evidence && <p className="text-xs text-zinc-600 mt-1 italic">{s.evidence}</p>}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ── Tab: ATS ─────────────────────────────────────────────────
function TabATS({ a }: { a: AnalysisResult }) {
  const platforms = a.ats_platform_scores ?? {};
  return (
    <div className="space-y-6">
      <div className="p-6 bg-white/[0.03] rounded-2xl border border-white/10 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-zinc-400 mb-1">Điểm ATS tổng thể</h2>
          <p className="text-xs text-zinc-500">Khả năng CV của bạn vượt qua hệ thống lọc tự động</p>
        </div>
        <div className={`text-5xl font-light tabular-nums ${ScoreColor(a.ats_score)}`}>
          {a.ats_score}<span className="text-xl text-zinc-500">%</span>
        </div>
      </div>

      {Object.keys(platforms).length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white mb-3">Điểm theo từng nền tảng ATS</h3>
          <div className="space-y-3">
            {Object.entries(platforms).map(([platform, score]) => (
              <div key={platform} className="bg-[#161618] p-4 rounded-xl border border-white/[0.06]">
                <ScoreBar label={platform.charAt(0).toUpperCase() + platform.slice(1)} value={score as number} color={BarColor(score as number)} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-amber-500/[0.05] border border-amber-500/20 rounded-xl p-5">
        <h4 className="font-semibold text-amber-400 text-sm mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Lưu ý về ATS
        </h4>
        <ul className="space-y-2 text-sm text-zinc-300">
          <li className="flex gap-2"><span className="text-amber-500 shrink-0">→</span>Tránh dùng bảng, cột đa cột, hình ảnh trong CV (ATS khó đọc)</li>
          <li className="flex gap-2"><span className="text-amber-500 shrink-0">→</span>Dùng heading chuẩn: Experience, Education, Skills</li>
          <li className="flex gap-2"><span className="text-amber-500 shrink-0">→</span>Tỷ lệ khớp từ khóa với JD cần đạt ít nhất 60%</li>
        </ul>
      </div>
    </div>
  );
}

// ── Tab: Keywords ────────────────────────────────────────────
function TabKeywords({ a }: { a: AnalysisResult }) {
  return (
    <div className="space-y-6">
      {a.matched_keywords?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Từ khóa khớp ({a.matched_keywords.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {a.matched_keywords.map((kw) => (
              <span key={kw} className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{kw}</span>
            ))}
          </div>
        </div>
      )}

      {a.semantic_keywords?.length ? (
        <div>
          <h3 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" /> Khớp ngữ nghĩa ({a.semantic_keywords.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {a.semantic_keywords.map((kw) => (
              <span key={kw} className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">{kw}</span>
            ))}
          </div>
        </div>
      ) : null}

      {a.missing_keywords?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
            <XCircle className="w-4 h-4" /> Từ khóa thiếu ({a.missing_keywords.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {a.missing_keywords.map((kw) => (
              <span key={kw} className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">{kw}</span>
            ))}
          </div>
          <p className="text-zinc-500 text-xs mt-3">Bổ sung những từ khóa này vào CV nếu bạn thực sự có kinh nghiệm hoặc kỹ năng đó.</p>
        </div>
      )}
    </div>
  );
}

// ── Tab: Achievements ────────────────────────────────────────
function TabAchievements({ a }: { a: AnalysisResult }) {
  const achieveSuggestions = a.suggestions?.filter((s) => s.category === "achievement") ?? [];
  return (
    <div className="space-y-6">
      <div className="p-5 bg-white/[0.03] rounded-xl border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-zinc-400">Điểm thành tích</span>
          <span className={`text-2xl font-light tabular-nums ${ScoreColor(a.achievement_score)}`}>{a.achievement_score}/100</span>
        </div>
        <div className="w-full bg-white/[0.06] h-2 rounded-full overflow-hidden">
          <div className={`h-2 rounded-full ${BarColor(a.achievement_score)}`} style={{ width: `${a.achievement_score}%` }} />
        </div>
      </div>

      <div className="bg-[#161618] border border-white/[0.06] rounded-xl p-5">
        <h4 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-400" /> Cách viết thành tích hiệu quả (STAR)
        </h4>
        <div className="space-y-3 text-sm text-zinc-400">
          <div className="grid grid-cols-4 gap-3 text-center mb-4">
            {[["S", "Situation", "bg-blue-500/10 text-blue-400"], ["T", "Task", "bg-purple-500/10 text-purple-400"], ["A", "Action", "bg-amber-500/10 text-amber-400"], ["R", "Result", "bg-emerald-500/10 text-emerald-400"]].map(([letter, word, cls]) => (
              <div key={letter} className={`p-3 rounded-xl border ${cls.replace("text-", "border-").replace("-400", "-500/20")} ${cls}`}>
                <div className="text-2xl font-black">{letter}</div>
                <div className="text-xs mt-1">{word}</div>
              </div>
            ))}
          </div>
          <p className="italic text-zinc-500">Ví dụ: &ldquo;Phát triển [Action] hệ thống báo cáo tự động [Task] cho team 10 người [Situation], giảm 3 giờ/tuần công việc thủ công [Result].&rdquo;</p>
        </div>
      </div>

      {achieveSuggestions.length > 0 ? (
        <div>
          <h3 className="text-sm font-semibold text-white mb-3">Gợi ý cải thiện thành tích từ AI</h3>
          <div className="space-y-3">
            {achieveSuggestions.map((s, i) => (
              <div key={i} className="bg-[#161618] border border-white/[0.06] rounded-xl p-4">
                <p className="text-sm font-medium text-zinc-200 mb-1">{s.problem}</p>
                <p className="text-sm text-zinc-400">{s.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-zinc-500 text-sm">
          <Target className="w-10 h-10 mx-auto mb-3 text-zinc-700" />
          Không có gợi ý cụ thể. Thêm JD để AI phân tích sâu hơn.
        </div>
      )}
    </div>
  );
}

// ── Tab: HR View ──────────────────────────────────────────────
function TabHR({ a }: { a: AnalysisResult }) {
  const hr = a.hr_review;
  if (!hr) {
    return (
      <div className="text-center py-16 text-zinc-500">
        <User className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
        <p className="text-sm">Chưa có dữ liệu HR View. Kết nối backend để phân tích đầy đủ.</p>
      </div>
    );
  }
  return (
    <div className="space-y-5">
      <div className="bg-[#161618] border border-white/[0.06] rounded-xl p-5">
        <h4 className="text-sm font-semibold text-zinc-300 mb-2 flex items-center gap-2">
          <User className="w-4 h-4 text-zinc-400" /> Ấn tượng đầu tiên của HR (30 giây)
        </h4>
        <p className="text-zinc-300 text-sm leading-relaxed">{hr.first_impression}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {hr.strengths?.length ? (
          <div className="bg-emerald-500/[0.05] border border-emerald-500/20 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-emerald-400 mb-3">Điểm mạnh HR nhận ra</h4>
            <ul className="space-y-2">
              {hr.strengths.map((s, i) => <li key={i} className="text-sm text-zinc-300 flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />{s}</li>)}
            </ul>
          </div>
        ) : null}
        {hr.concerns?.length ? (
          <div className="bg-red-500/[0.05] border border-red-500/20 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-red-400 mb-3">Điểm lo ngại của HR</h4>
            <ul className="space-y-2">
              {hr.concerns.map((s, i) => <li key={i} className="text-sm text-zinc-300 flex gap-2"><XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />{s}</li>)}
            </ul>
          </div>
        ) : null}
      </div>

      {hr.priority_actions?.length ? (
        <div className="bg-[#161618] border border-white/[0.06] rounded-xl p-4">
          <h4 className="text-sm font-semibold text-white mb-3">Hành động ưu tiên</h4>
          <ol className="space-y-2">
            {hr.priority_actions.map((a, i) => (
              <li key={i} className="text-sm text-zinc-300 flex gap-3">
                <span className="w-5 h-5 rounded-full bg-white/10 text-zinc-400 flex items-center justify-center text-xs shrink-0 mt-0.5">{i + 1}</span>
                {a}
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      <p className="text-xs text-zinc-600 text-center italic">
        Đây là ước tính dựa trên CV và JD, không phải cam kết từ nhà tuyển dụng thực.
      </p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function AnalysisDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("score");

  const id = params?.id as string;
  const analysis = id ? getAnalysisById(id) : null;

  if (!id) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <XCircle className="w-12 h-12 text-zinc-700 mb-4" />
        <h2 className="text-white font-semibold text-lg mb-2">Không tìm thấy kết quả phân tích</h2>
        <p className="text-zinc-500 text-sm mb-6">Kết quả này có thể đã bị xóa hoặc chưa được tạo.</p>
        <Link href="/dashboard/upload" className="bg-white text-black px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-zinc-200 transition">
          Phân tích CV mới
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-zinc-400 hover:text-white transition p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-white truncate">{analysis.fileName}</h1>
          <p className="text-zinc-500 text-sm">{analysis.role} · {new Date(analysis.createdAt).toLocaleDateString("vi-VN")}</p>
        </div>
        <div className={`text-3xl font-light tabular-nums ${ScoreColor(analysis.total_score)}`}>
          {analysis.total_score}<span className="text-sm text-zinc-500">/100</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 overflow-x-auto gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition border-b-2 -mb-px ${
              activeTab === tab.id
                ? "border-white text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "score" && <TabScore a={analysis} />}
        {activeTab === "ats" && <TabATS a={analysis} />}
        {activeTab === "keywords" && <TabKeywords a={analysis} />}
        {activeTab === "achievements" && <TabAchievements a={analysis} />}
        {activeTab === "hr" && <TabHR a={analysis} />}
      </div>

      {/* CTA */}
      <div className="pt-4 border-t border-white/10">
        <Link
          href="/dashboard/cv-versions"
          className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold py-3.5 rounded-xl hover:bg-zinc-200 transition shadow-lg"
        >
          <BarChart2 className="w-5 h-5" /> Tạo phiên bản CV tối ưu từ kết quả này
        </Link>
      </div>
    </div>
  );
}
