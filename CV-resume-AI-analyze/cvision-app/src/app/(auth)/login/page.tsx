"use client";

import Link from "next/link";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from "firebase/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Sparkles, AlertCircle } from "lucide-react";
import Image from "next/image";

const getAuthErrorMsg = (code: string): string => {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email hoặc mật khẩu không đúng.";
    case "auth/too-many-requests":
      return "Tài khoản bị khóa tạm thời do đăng nhập sai nhiều lần. Nhấn \"Quên mật khẩu?\" để đặt lại mật khẩu, hoặc thử lại sau vài phút.";
    case "auth/user-disabled":
      return "Tài khoản này đã bị vô hiệu hóa.";
    case "auth/network-request-failed":
      return "Lỗi kết nối mạng. Vui lòng kiểm tra internet.";
    default:
      return "Đăng nhập thất bại. Vui lòng thử lại.";
  }
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [isTooMany, setIsTooMany] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResetSent(false);
    setIsTooMany(false);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      const code = err?.code || "";
      setError(getAuthErrorMsg(code));
      if (code === "auth/too-many-requests") setIsTooMany(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (err: any) {
      setError(getAuthErrorMsg(err?.code || ""));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError("Nhập email của bạn vào ô bên dưới trước, rồi nhấn nút này.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setError("");
      setIsTooMany(false);
    } catch {
      setError("Không thể gửi email đặt lại. Kiểm tra lại địa chỉ email.");
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 md:p-8 overflow-hidden bg-[#0a0a12]">
      {/* ── BACKGROUND ── */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2560&auto=format&fit=crop"
          alt="Background"
          fill
          className="object-cover opacity-50"
          priority
        />
        {/* Multi-layer overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-[#0a0a12]/90" />
        <div className="absolute inset-0 backdrop-blur-[4px]" />
        {/* Noise texture for depth */}
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")'}} />
      </div>

      {/* ── MAIN CARD ── */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[980px] flex flex-col lg:flex-row rounded-[28px] overflow-hidden"
        style={{
          background: "rgba(10, 10, 20, 0.55)",
          backdropFilter: "blur(40px) saturate(180%)",
          WebkitBackdropFilter: "blur(40px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}
      >
        {/* ── LEFT: FORM ── */}
        <div
          className="w-full lg:w-[52%] p-8 md:p-12 flex flex-col justify-between relative"
          style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}
        >
          {/* Subtle inner glow */}
          <div
            className="absolute top-0 left-0 w-64 h-64 rounded-full opacity-10 pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)",
              transform: "translate(-30%, -30%)",
            }}
          />

          <div className="flex items-center justify-between mb-10 relative z-10">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: "rgba(139,92,246,0.25)",
                  border: "1px solid rgba(139,92,246,0.4)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <Sparkles className="w-4 h-4 text-purple-300" />
              </div>
              <span className="font-bold text-[19px] text-white tracking-tight">CVision</span>
            </Link>
            <span className="text-[13px] text-white/40">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="text-white/80 font-semibold hover:text-white transition">
                Đăng ký
              </Link>
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-[380px] mx-auto w-full relative z-10">
            <h1 className="text-[38px] font-black text-white tracking-tight mb-1.5 leading-tight">
              Chào mừng<br />trở lại.
            </h1>
            <p className="text-white/40 text-[14px] mb-8 font-medium">
              Đăng nhập để tiếp tục phân tích hồ sơ của bạn.
            </p>

            {/* Error box */}
            {error && (
              <div
                className="mb-5 px-4 py-3 rounded-2xl flex items-start gap-3 text-sm font-medium"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="text-red-300 leading-relaxed">{error}</span>
              </div>
            )}

            {/* Reset sent confirmation */}
            {resetSent && (
              <div
                className="mb-5 px-4 py-3 rounded-2xl text-sm font-medium"
                style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}
              >
                <span className="text-emerald-400">
                  ✓ Email đặt lại mật khẩu đã được gửi! Kiểm tra hộp thư của bạn.
                </span>
              </div>
            )}

            {/* Google button */}
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl font-semibold text-white/80 hover:text-white text-[14px] mb-5 transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(12px)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Tiếp tục với Google
            </button>

            <div className="flex items-center gap-4 mb-5">
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
              <span className="text-[11px] text-white/25 font-bold tracking-widest">HOẶC</span>
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
            </div>

            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-white/40 uppercase tracking-widest mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="w-full px-4 py-3.5 text-[14px] text-white rounded-2xl outline-none transition-all placeholder:text-white/20"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    backdropFilter: "blur(12px)",
                  }}
                  onFocus={(e) => (e.target.style.border = "1px solid rgba(139,92,246,0.5)")}
                  onBlur={(e) => (e.target.style.border = "1px solid rgba(255,255,255,0.09)")}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest">
                    Mật khẩu
                  </label>
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    className="text-[12px] font-semibold text-purple-400 hover:text-purple-300 transition"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3.5 text-[14px] text-white rounded-2xl outline-none transition-all placeholder:text-white/20 pr-12"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.09)",
                      backdropFilter: "blur(12px)",
                    }}
                    onFocus={(e) => (e.target.style.border = "1px solid rgba(139,92,246,0.5)")}
                    onBlur={(e) => (e.target.style.border = "1px solid rgba(255,255,255,0.09)")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Quick reset button when locked */}
              {isTooMany && (
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="w-full py-2.5 rounded-xl text-[13px] font-semibold text-purple-300 hover:text-purple-200 transition"
                  style={{
                    background: "rgba(139,92,246,0.1)",
                    border: "1px solid rgba(139,92,246,0.2)",
                  }}
                >
                  → Gửi email đặt lại mật khẩu ngay
                </button>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-bold text-[14px] mt-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                style={{ background: "rgba(255,255,255,0.95)", color: "#0a0a12" }}
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Đăng nhập</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-10 flex items-center justify-center gap-2 relative z-10">
            <Sparkles className="w-3.5 h-3.5 text-white/15" />
            <span className="text-[11px] text-white/20 font-medium tracking-wide">
              CVision AI — Career Intelligence Platform
            </span>
          </div>
        </div>

        {/* ── RIGHT: INFO PANEL ── */}
        <div className="hidden lg:flex w-[48%] relative p-10 flex-col justify-end overflow-hidden">
          <div
            className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-15 pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(59,130,246,0.5) 0%, transparent 70%)",
              transform: "translate(20%, -20%)",
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-56 h-56 rounded-full opacity-10 pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)",
              transform: "translate(-20%, 20%)",
            }}
          />

          <div
            className="relative z-10 rounded-2xl p-6"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(20px)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
          >
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-5"
              style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-400 text-[10px] font-bold tracking-widest uppercase">
                ATS Match Rate: 92%
              </span>
            </div>
            <p className="text-white/80 text-[16px] leading-relaxed font-medium mb-6">
              "CVision giúp tôi tối ưu được hồ sơ trong vòng 10 phút và tôi đã nhận được lời mời phỏng vấn ngay tuần sau."
            </p>
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-bold"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
              >
                NL
              </div>
              <div>
                <div className="text-white/80 text-[13px] font-bold">Nguyễn Linh</div>
                <div className="text-white/35 text-[11px] font-medium">Software Engineer tại Shopee Vietnam</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
