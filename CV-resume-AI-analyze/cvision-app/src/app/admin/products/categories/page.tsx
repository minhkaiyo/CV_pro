"use client";

import { useState } from "react";
import { Save, ToggleLeft, ToggleRight, Edit2, Check } from "lucide-react";
import { toast } from "@/components/ui/toast";

// ── Plan configuration ────────────────────────────────────────────────────────

interface Plan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  limits: {
    analyses_per_day: number;
    cv_versions_per_month: number;
    export_pdf: boolean;
    hr_simulation: boolean;
    priority_support: boolean;
  };
}

const DEFAULT_PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price_monthly: 0,
    price_yearly: 0,
    limits: { analyses_per_day: 1, cv_versions_per_month: 0, export_pdf: false, hr_simulation: false, priority_support: false },
  },
  {
    id: "premium",
    name: "Premium",
    price_monthly: 49000,
    price_yearly: 470000,
    limits: { analyses_per_day: -1, cv_versions_per_month: 10, export_pdf: true, hr_simulation: true, priority_support: false },
  },
  {
    id: "b2b",
    name: "B2B / Enterprise",
    price_monthly: 0,
    price_yearly: 0,
    limits: { analyses_per_day: -1, cv_versions_per_month: -1, export_pdf: true, hr_simulation: true, priority_support: true },
  },
];

// ── Feature toggles ───────────────────────────────────────────────────────────

interface Toggle {
  key: string;
  label: string;
  desc: string;
  enabled: boolean;
  audience: string;
}

const DEFAULT_TOGGLES: Toggle[] = [
  { key: "hr_simulation",  label: "HR Simulation",       desc: "Giả lập nhà tuyển dụng đọc CV",          enabled: true,  audience: "premium" },
  { key: "cv_diff_view",   label: "CV Diff View",        desc: "Hiển thị diff chi tiết khi tối ưu CV",   enabled: true,  audience: "all" },
  { key: "probability",    label: "Probability Estimate",desc: "Dự đoán xác suất phù hợp",               enabled: false, audience: "premium" },
  { key: "web_extension",  label: "Web Extension",       desc: "Phân tích JD trực tiếp trên trình duyệt",enabled: false, audience: "all" },
  { key: "linkedin_import",label: "LinkedIn Import",     desc: "Import dữ liệu từ LinkedIn",             enabled: false, audience: "premium" },
  { key: "ai_interview",   label: "AI Interview Prep",   desc: "Giả lập phỏng vấn với AI",               enabled: false, audience: "beta" },
];

// ── Inline number editor ──────────────────────────────────────────────────────

const glassCard: React.CSSProperties = {
  background: "rgba(10, 15, 28, 0.75)",
  backdropFilter: "blur(24px) saturate(160%)",
  WebkitBackdropFilter: "blur(24px) saturate(160%)",
  border: "1px solid rgba(255,255,255,0.06)",
};

function NumberField({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(String(value));

  if (!editing) {
    return (
      <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-white/60 hover:text-blue-400 group">
        <span className="font-mono font-semibold">{value === -1 ? "∞" : value}</span>
        <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
      </button>
    );
  }
  return (
    <div className="flex items-center gap-1">
      <input value={local} onChange={e => setLocal(e.target.value)} autoFocus
        className="w-16 rounded px-1.5 py-0.5 text-[13px] font-mono outline-none text-white"
        style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)" }} />
      <button onClick={() => { onChange(Number(local)); setEditing(false); }}
        className="text-emerald-400 hover:text-emerald-300">
        <Check className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function ProductCategoriesPage() {
  const [plans, setPlans] = useState<Plan[]>(DEFAULT_PLANS);
  const [toggles, setToggles] = useState<Toggle[]>(DEFAULT_TOGGLES);
  const [saved, setSaved] = useState(false);

  const updatePlanLimit = (planId: string, key: keyof Plan["limits"], val: number | boolean) => {
    setPlans(prev => prev.map(p =>
      p.id === planId ? { ...p, limits: { ...p.limits, [key]: val } } : p
    ));
  };

  const updatePrice = (planId: string, field: "price_monthly" | "price_yearly", val: number) => {
    setPlans(prev => prev.map(p => p.id === planId ? { ...p, [field]: val } : p));
  };

  const handleSave = () => {
    setSaved(true);
    toast("success", "Đã lưu cấu hình gói dịch vụ!");
    setTimeout(() => setSaved(false), 2000);
  };

  const BOOL_LIMITS: (keyof Plan["limits"])[] = ["export_pdf", "hr_simulation", "priority_support"];
  const NUM_LIMITS: { key: keyof Plan["limits"]; label: string }[] = [
    { key: "analyses_per_day", label: "Phân tích/ngày" },
    { key: "cv_versions_per_month", label: "CV Version/tháng" },
  ];

  return (
    <div className="space-y-6 pb-12 relative z-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Cấu hình gói dịch vụ</h1>
          <p className="text-[13px] text-white/40 mt-0.5">Thay đổi giá và giới hạn tính năng không cần deploy lại</p>
        </div>
        <button onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition"
          style={saved
            ? { background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.25)", color: "#34d399" }
            : { background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.25)", color: "#93c5fd" }
          }>
          <Save className="w-4 h-4" />
          {saved ? "Đã lưu!" : "Lưu thay đổi"}
        </button>
      </div>

      {/* Plans config */}
      <div className="rounded-2xl overflow-hidden" style={glassCard}>
        <div className="p-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <h3 className="font-semibold text-white/80">Bảng giá động</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <tr className="text-white/30 text-xs uppercase tracking-wide">
                <th className="p-4 text-left font-medium">Cấu hình</th>
                {plans.map(p => (
                  <th key={p.id} className="p-4 text-left font-medium">{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderTop: "1px solid rgba(255,255,255,0.03)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <td className="p-4 text-white/40">Giá tháng (đ)</td>
                {plans.map(p => (
                  <td key={p.id} className="p-4">
                    {p.id === "b2b" ? <span className="text-white/20 italic">Liên hệ</span>
                      : <NumberField value={p.price_monthly} onChange={v => updatePrice(p.id, "price_monthly", v)} />}
                  </td>
                ))}
              </tr>
              <tr style={{ borderTop: "1px solid rgba(255,255,255,0.03)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <td className="p-4 text-white/40">Giá năm (đ)</td>
                {plans.map(p => (
                  <td key={p.id} className="p-4">
                    {p.id === "b2b" ? <span className="text-white/20 italic">Liên hệ</span>
                      : <NumberField value={p.price_yearly} onChange={v => updatePrice(p.id, "price_yearly", v)} />}
                  </td>
                ))}
              </tr>
              {NUM_LIMITS.map(({ key, label }) => (
                <tr key={key} style={{ borderTop: "1px solid rgba(255,255,255,0.03)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <td className="p-4 text-white/40">{label} <span className="text-white/20 text-[11px]">(-1 = ∞)</span></td>
                  {plans.map(p => (
                    <td key={p.id} className="p-4">
                      <NumberField value={p.limits[key] as number} onChange={v => updatePlanLimit(p.id, key, v)} />
                    </td>
                  ))}
                </tr>
              ))}
              {BOOL_LIMITS.map(key => (
                <tr key={key} style={{ borderTop: "1px solid rgba(255,255,255,0.03)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <td className="p-4 text-white/40 capitalize">{String(key).replace(/_/g, " ")}</td>
                  {plans.map(p => (
                    <td key={p.id} className="p-4">
                      <button onClick={() => updatePlanLimit(p.id, key, !p.limits[key])}
                        className="text-[11px] px-2.5 py-1 rounded-full font-semibold transition"
                        style={p.limits[key]
                          ? { background: "rgba(16,185,129,0.12)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" }
                          : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.08)" }
                        }>
                        {p.limits[key] ? "Có" : "Không"}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature toggles */}
      <div className="rounded-2xl overflow-hidden" style={glassCard}>
        <div className="p-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <h3 className="font-semibold text-white/80">Feature Toggles</h3>
          <p className="text-[12px] text-white/30 mt-0.5">Bật/tắt tính năng thử nghiệm cho từng nhóm người dùng</p>
        </div>
        <div>
          {toggles.map(t => (
            <div key={t.key} className="flex items-center justify-between p-4 transition"
              style={{ borderTop: "1px solid rgba(255,255,255,0.03)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <div className="flex-1 min-w-0 mr-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white/70">{t.label}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    style={t.audience === "all"
                      ? { background: "rgba(59,130,246,0.12)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.2)" }
                      : t.audience === "premium"
                      ? { background: "rgba(245,158,11,0.12)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.2)" }
                      : { background: "rgba(139,92,246,0.12)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.2)" }
                    }>{t.audience.toUpperCase()}</span>
                </div>
                <p className="text-[12px] text-white/30 mt-0.5">{t.desc}</p>
              </div>
              <button onClick={() => setToggles(prev => prev.map(x => x.key === t.key ? { ...x, enabled: !x.enabled } : x))}
                className="shrink-0">
                {t.enabled
                  ? <ToggleRight className="w-8 h-8 text-emerald-400 hover:text-emerald-300 transition" />
                  : <ToggleLeft className="w-8 h-8 text-white/15 hover:text-white/30 transition" />
                }
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
