"use client";

import Link from "next/link";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 md:p-8 font-inter overflow-hidden bg-[#f5f7fb]">
      {/* ── LIGHT BACKGROUND DECORATION ── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-400/20 rounded-full blur-[120px]" />
      </div>

      {/* ── MAIN CARD ── */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-[1000px] bg-white rounded-3xl overflow-hidden flex flex-col lg:flex-row shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-gray-100"
      >
        {/* ── LEFT PANEL: Form ── */}
        <div className="w-full lg:w-1/2 p-8 md:p-14 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-12">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-[#3b82f6] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-[20px] text-[#3b82f6] tracking-tight">CVision</span>
            </Link>
            <span className="text-[13px] text-gray-500">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="text-blue-600 font-bold hover:underline underline-offset-4">Đăng ký</Link>
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-[400px] mx-auto w-full">
            <h1 className="text-[32px] font-black text-gray-800 tracking-tight mb-2 leading-tight">Mừng bạn trở lại.</h1>
            <p className="text-gray-500 text-[15px] mb-8 font-medium">Đăng nhập để tiếp tục tối ưu hóa hồ sơ của bạn.</p>

            {error && <div className="mb-6 px-4 py-3 bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-xl">{error}</div>}

            {/* Google Sign-in */}
            <button onClick={handleGoogle} disabled={loading} className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all text-[14px] font-bold text-gray-700 mb-6 shadow-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Tiếp tục với Google
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">HOẶC</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2">Email của bạn</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required
                  className="w-full px-4 py-3 text-[14px] bg-gray-50 text-gray-800 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-400/10 transition placeholder:text-gray-400"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[13px] font-bold text-gray-700">Mật khẩu</label>
                  <Link href="/forgot-password" className="text-[12px] font-semibold text-blue-600 hover:text-blue-700 transition underline-offset-4 hover:underline">Quên mật khẩu?</Link>
                </div>
                <div className="relative">
                  <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                    className="w-full px-4 py-3 text-[14px] bg-gray-50 text-gray-800 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-400/10 transition placeholder:text-gray-400 pr-12"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-[#3b82f6] text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-200 transition-all text-[14px] mt-4 group disabled:opacity-60 disabled:hover:shadow-none">
                {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Đăng nhập <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
              </button>
            </form>
          </div>

          <div className="mt-12 text-center flex items-center justify-center gap-2 opacity-80">
            <Sparkles className="w-4 h-4 text-gray-300" />
            <span className="text-[12px] text-gray-400 font-semibold tracking-wide">CVision AI — Career Intelligence Platform</span>
          </div>
        </div>

        {/* ── RIGHT PANEL: Informational ── */}
        <div className="hidden lg:flex w-1/2 relative bg-[#f8fafc] border-l border-gray-100 p-12 flex-col justify-center">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
          
          <div className="relative z-10 max-w-md mx-auto w-full">
            <div className="mb-10">
              <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-200 rounded-full px-3 py-1.5 mb-6 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <span className="text-blue-700 text-[11px] font-bold tracking-wider uppercase">Tỉ lệ qua vòng hồ sơ: 92%</span>
              </div>
              <h2 className="text-3xl font-black text-gray-800 tracking-tight leading-tight mb-4">
                Chinh phục nhà tuyển dụng với AI
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">
                Tham gia cùng hàng ngàn ứng viên đã thành công trong việc tối ưu hóa CV và chinh phục các công ty công nghệ hàng đầu.
              </p>
            </div>

            <div className="space-y-4">
              {[
                "Phân tích chuyên sâu điểm mạnh/yếu",
                "Tối ưu từ khóa chuẩn hệ thống ATS",
                "Gợi ý diễn đạt theo số liệu thực tế"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span className="text-[13.5px] font-bold text-gray-700">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
