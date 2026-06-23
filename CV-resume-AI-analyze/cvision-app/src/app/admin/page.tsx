"use client";

import { useEffect, useState } from "react";
import {
  Users, FileText, CreditCard, TrendingUp,
  Activity, Settings, Search, Loader2, ArrowUpRight,
} from "lucide-react";
import { apiAdminMetrics, apiAdminListUsers, apiAdminUpdateUserPlan } from "@/lib/api";
import { toast } from "@/components/ui/toast";

interface Metrics {
  total_users: number;
  premium_users: number;
  total_revenue_vnd: number;
  analyses_count: number;
}

interface UserRow {
  id: string;
  email?: string;
  full_name?: string;
  plan?: string;
  created_at?: string;
}

export default function AdminPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [updatingPlan, setUpdatingPlan] = useState<string | null>(null);

  useEffect(() => {
    apiAdminMetrics()
      .then((res) => setMetrics(res || { total_users: 0, premium_users: 0, total_revenue_vnd: 0, analyses_count: 0 }))
      .catch(() => setMetrics({ total_users: 0, premium_users: 0, total_revenue_vnd: 0, analyses_count: 0 }))
      .finally(() => setLoadingMetrics(false));

    apiAdminListUsers()
      .then((res) => setUsers((res?.users as unknown as UserRow[]) || []))
      .catch(() => setUsers([]))
      .finally(() => setLoadingUsers(false));
  }, []);

  const handlePlanChange = async (userId: string, newPlan: string) => {
    setUpdatingPlan(userId);
    try {
      await apiAdminUpdateUserPlan(userId, newPlan);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, plan: newPlan } : u));
      toast("success", `Đã cập nhật gói thành ${newPlan}.`);
    } catch (err: unknown) {
      toast("error", err instanceof Error ? err.message : "Cập nhật thất bại.");
    } finally {
      setUpdatingPlan(null);
    }
  };

  const filteredUsers = users.filter((u) =>
    (u.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (u.full_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const STAT_CARDS = [
    {
      label: "Tổng người dùng",
      value: metrics?.total_users ?? 0,
      sub: "Tất cả tài khoản",
      icon: Users,
      bg: "bg-blue-50",
      border: "border-blue-100",
      iconColor: "text-blue-500",
    },
    {
      label: "Người dùng Premium",
      value: metrics?.premium_users ?? 0,
      sub: metrics ? `${Math.round((metrics.premium_users / Math.max(metrics.total_users, 1)) * 100)}% tổng số` : "",
      icon: CreditCard,
      bg: "bg-amber-50",
      border: "border-amber-100",
      iconColor: "text-amber-500",
    },
    {
      label: "Lượt phân tích",
      value: metrics?.analyses_count ?? 0,
      sub: "Tổng cộng",
      icon: FileText,
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      iconColor: "text-emerald-500",
    },
    {
      label: "Doanh thu ước tính",
      value: `${(((metrics?.total_revenue_vnd ?? 0)) / 1000).toFixed(0)}K đ`,
      sub: "Tháng này",
      icon: TrendingUp,
      bg: "bg-purple-50",
      border: "border-purple-100",
      iconColor: "text-purple-500",
    },
  ];

  const QUICK_ACTIONS = [
    { label: "Quản lý người dùng", icon: Users, desc: "Xem và chỉnh sửa tài khoản", color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Cấu hình gói dịch vụ", icon: Settings, desc: "Quản lý pricing & features", color: "text-gray-500", bg: "bg-gray-100" },
    { label: "Quản lý subscriptions", icon: CreditCard, desc: "Theo dõi đăng ký dịch vụ", color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Xem analytics", icon: Activity, desc: "Báo cáo và thống kê chi tiết", color: "text-emerald-500", bg: "bg-emerald-50" },
  ];

  return (
    <div className="space-y-8 font-inter">

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Tổng quan hệ thống</h1>
          <p className="text-gray-500 text-[13.5px]">CVision AI Platform · Cập nhật thời gian thực</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1.5 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Hoạt động ổn định
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl p-5 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 border ${card.bg} ${card.border}`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wide">{card.label}</span>
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm">
                <card.icon className={`w-4 h-4 ${card.iconColor}`} />
              </div>
            </div>
            <div className={`text-3xl font-black tabular-nums mb-1 ${card.iconColor}`}>
              {loadingMetrics
                ? <Loader2 className="w-6 h-6 animate-spin opacity-50" />
                : card.value
              }
            </div>
            <div className="text-xs text-gray-500 font-medium">{card.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Users Table */}
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-bold text-gray-800">Người dùng mới nhất</h2>
                <p className="text-[13px] text-gray-500 mt-0.5">Quản lý và cập nhật gói dịch vụ cho người dùng.</p>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm người dùng..."
                  className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 text-gray-700 placeholder:text-gray-400 outline-none rounded-xl focus:border-blue-400 focus:bg-white transition-all"
                />
              </div>
            </div>

            {loadingUsers ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                {search ? `Không tìm thấy "${search}"` : "Không có dữ liệu người dùng"}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr className="text-gray-500">
                      <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wide">Người dùng</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wide hidden sm:table-cell">Ngày đăng ký</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wide">Gói</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wide">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
                              {(user.full_name || user.email || "?")[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="text-gray-800 font-semibold">{user.full_name || "—"}</div>
                              <div className="text-gray-500 text-[12px] mt-0.5">{user.email || user.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 hidden sm:table-cell">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString("vi-VN") : "—"}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`text-[11px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                              user.plan === "premium" ? "bg-amber-100 text-amber-700" :
                              user.plan === "b2b" ? "bg-purple-100 text-purple-700" :
                              "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {user.plan ?? "free"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {updatingPlan === user.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                          ) : (
                            <select
                              value={user.plan ?? "free"}
                              onChange={(e) => handlePlanChange(user.id, e.target.value)}
                              className="text-xs rounded-lg px-2 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 outline-none cursor-pointer hover:border-blue-300 focus:border-blue-400 transition"
                            >
                              <option value="free">Free</option>
                              <option value="premium">Premium</option>
                              <option value="b2b">B2B</option>
                            </select>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h2 className="text-[15px] font-bold text-gray-800 mb-4">Truy cập nhanh</h2>
            <div className="space-y-3">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5 transition-all group bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${action.bg}`}>
                      <action.icon className={`w-4 h-4 ${action.color}`} />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-800 text-[13px] group-hover:text-[#3b82f6] transition-colors">{action.label}</div>
                      <div className="text-[11px] text-gray-500">{action.desc}</div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-[#3b82f6] transition-colors" />
                </button>
              ))}
            </div>
          </div>

          {/* System Note */}
          <div className="rounded-2xl p-5 bg-blue-50 border border-blue-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <Settings className="w-4 h-4 text-blue-600" />
              </div>
              <h4 className="text-[14px] font-bold text-blue-800">Cấu hình LLM Provider</h4>
            </div>
            <p className="text-[12.5px] text-blue-700/80 mb-4 leading-relaxed">
              Backend sử dụng FastAPI + LiteLLM. Cấu hình các biến môi trường trong file{" "}
              <code className="px-1.5 py-0.5 rounded bg-white text-blue-600 font-mono font-semibold shadow-sm border border-blue-100">
                backend/.env
              </code>
            </p>
            <div className="flex gap-2 flex-wrap">
              {["LLM_PROVIDER", "LLM_MODEL", "LLM_API_KEY", "STRIPE_SECRET_KEY"].map((k) => (
                <code
                  key={k}
                  className="text-[11px] rounded-lg px-2.5 py-1 bg-white text-blue-600 font-mono shadow-sm border border-blue-100"
                >
                  {k}
                </code>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
