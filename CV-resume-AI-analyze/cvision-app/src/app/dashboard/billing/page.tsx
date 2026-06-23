"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, CreditCard, Loader2, Sparkles, X, ExternalLink, ShieldCheck } from "lucide-react";
import { apiGetSubscription, apiCreateCheckout, apiCreatePortalSession } from "@/lib/api";
import { toast } from "@/components/ui/toast";

interface SubInfo {
  plan: "free" | "premium" | "b2b";
  status: string;
  provider?: string;
  current_period_end?: string;
}

export default function BillingPage() {
  const [sub, setSub] = useState<SubInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);

  // Load subscription from backend
  useEffect(() => {
    apiGetSubscription()
      .then(setSub)
      .catch(() => setSub({ plan: "free", status: "active" }))
      .finally(() => setLoading(false));

    // Handle return from Stripe checkout
    const params = new URLSearchParams(window.location.search);
    if (params.get("status") === "success") {
      toast("success", "Nâng cấp Premium thành công! Tính năng đã được mở khóa.");
      // Refresh sub info
      apiGetSubscription().then(setSub).catch(() => null);
      window.history.replaceState({}, "", "/dashboard/billing");
    } else if (params.get("status") === "cancelled") {
      toast("warning", "Thanh toán đã bị hủy.");
      window.history.replaceState({}, "", "/dashboard/billing");
    }
  }, []);

  const handleUpgrade = async (plan = "premium_monthly") => {
    setUpgrading(true);
    try {
      const { checkout_url } = await apiCreateCheckout(plan);
      window.location.href = checkout_url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi kết nối";
      toast("error", msg.includes("not configured") ? "Stripe chưa được cấu hình. Liên hệ admin." : msg);
    } finally {
      setUpgrading(false);
    }
  };

  const handleManage = async () => {
    setOpeningPortal(true);
    try {
      const { portal_url } = await apiCreatePortalSession();
      window.open(portal_url, "_blank");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể mở cổng quản lý";
      toast("error", msg);
    } finally {
      setOpeningPortal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const isPremium = sub?.plan === "premium" || sub?.plan === "b2b";

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="relative w-full h-[180px] md:h-[220px] rounded-3xl overflow-hidden shadow-sm">
        <Image src="/banner-career-growth.png" alt="Quản lý Thanh toán" fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent flex flex-col justify-center px-8 md:px-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2 flex items-center gap-2">
            <CreditCard className="w-8 h-8 text-blue-300" /> Quản lý Gói dịch vụ
          </h1>
          <p className="text-blue-100 max-w-md text-sm md:text-base leading-relaxed">
            Nâng cấp gói Premium để mở khóa toàn bộ sức mạnh AI, phân tích không giới hạn và xuất file PDF chuyên nghiệp.
          </p>
        </div>
      </div>

      {/* Current Plan */}
      <div className={`bg-white border-2 rounded-3xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-sm transition-colors ${isPremium ? 'border-amber-400/50' : 'border-gray-100'}`}>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-2xl font-bold text-gray-900 capitalize flex items-center gap-2">
              {isPremium && <Sparkles className="w-6 h-6 text-amber-500" />}
              Gói {sub?.plan === "b2b" ? "B2B" : sub?.plan === "premium" ? "Premium" : "Free"}
            </h2>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border tracking-wide uppercase ${
              isPremium
                ? "bg-amber-50 text-amber-600 border-amber-200"
                : "bg-gray-100 text-gray-600 border-gray-200"
            }`}>
              {sub?.status === "active" ? "Đang hoạt động" : sub?.status ?? "Hiện tại"}
            </span>
          </div>

          {isPremium ? (
            <p className="text-gray-600 text-base mb-6 font-medium">
              Bạn đang dùng gói Premium — tận hưởng tối đa sức mạnh AI phân tích CV.
              {sub?.current_period_end && (
                <span className="block mt-1 text-sm text-gray-500">
                  Gia hạn vào ngày <strong className="text-gray-800">
                    {new Date(sub.current_period_end).toLocaleDateString("vi-VN")}
                  </strong>.
                </span>
              )}
            </p>
          ) : (
            <p className="text-gray-600 text-base mb-6 font-medium">Bạn đang sử dụng gói Miễn phí với giới hạn 1 lần phân tích CV/ngày.</p>
          )}

          <ul className="space-y-3">
            {[
              { text: "Tối đa 1 phân tích mỗi ngày", active: true, premiumOnly: false },
              { text: "Đánh giá điểm ATS + từ khóa", active: true, premiumOnly: false },
              { text: "Phân tích ATS không giới hạn", active: isPremium, premiumOnly: true },
              { text: "Tạo phiên bản CV tối ưu (AI diff)", active: isPremium, premiumOnly: true },
              { text: "Giả lập HR & Dự đoán xác suất", active: isPremium, premiumOnly: true },
              { text: "Xuất PDF/DOCX chuẩn ATS", active: isPremium, premiumOnly: true },
            ].map((item, i) => (
              <li key={i} className={`flex items-center gap-3 text-[15px] font-medium ${
                item.active ? "text-gray-800" : "text-gray-400"
              } ${!item.active && item.premiumOnly ? "line-through opacity-70" : ""}`}>
                {item.active
                  ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  : <X className="w-5 h-5 text-gray-300 shrink-0" />
                }
                {item.text}
                {item.premiumOnly && !item.active && (
                  <span className="text-[10px] font-bold text-amber-500 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md ml-2 uppercase tracking-wider">Premium</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="shrink-0 w-full md:w-[300px] space-y-3 bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col justify-center min-h-[220px]">
          {isPremium ? (
            <>
              <div className="text-center mb-4">
                <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-emerald-600">Thanh toán an toàn qua Stripe</p>
              </div>
              <button
                onClick={handleManage}
                disabled={openingPortal}
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-bold px-6 py-3.5 rounded-xl hover:bg-gray-50 hover:text-blue-600 transition disabled:opacity-50 shadow-sm"
              >
                {openingPortal ? <Loader2 className="w-5 h-5 animate-spin" /> : <ExternalLink className="w-5 h-5" />}
                Quản lý gói cước
              </button>
            </>
          ) : (
            <>
              <div className="text-center mb-2">
                <span className="text-3xl font-black text-gray-900">49.000₫</span>
                <span className="text-gray-500 font-medium">/tháng</span>
              </div>
              <button
                onClick={() => handleUpgrade("premium_monthly")}
                disabled={upgrading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold px-6 py-3.5 rounded-xl hover:bg-blue-700 hover:shadow-lg transition-all disabled:opacity-50"
              >
                {upgrading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-amber-300" />}
                Nâng cấp Premium
              </button>
              <button
                onClick={() => handleUpgrade("premium_yearly")}
                disabled={upgrading}
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-600 font-bold px-6 py-3 rounded-xl hover:bg-gray-50 hover:text-blue-600 transition disabled:opacity-50 text-sm shadow-sm"
              >
                Gói năm: 470k (Giảm 20%)
              </button>
              <p className="text-xs text-gray-500 font-medium text-center mt-2 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-gray-400" /> Hủy bất kỳ lúc nào
              </p>
            </>
          )}
        </div>
      </div>

      {/* Payment method section */}
      {!isPremium && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-gray-400" /> Phương thức thanh toán
          </h3>
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
              <CreditCard className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">Chưa có phương thức thanh toán.</p>
            <p className="text-sm text-gray-500 mt-1">Nâng cấp Premium để thêm thẻ thanh toán an toàn qua Stripe.</p>
          </div>
        </div>
      )}

      <div className="text-center pt-4">
        <Link href="/pricing" className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 transition hover:underline">
          Xem chi tiết bảng giá <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
