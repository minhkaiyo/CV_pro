"use client";

import Link from "next/link";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";

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
    } catch (err: any) {
      if (err?.code === "auth/invalid-credential") {
        setError("Sai email hoặc mật khẩu. Nếu chưa có tài khoản, vui lòng Đăng ký.");
      } else {
        setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
      }
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
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 md:p-8 font-inter overflow-hidden bg-[#0a0a0a]">
      {/* ── BACKGROUND IMAGE & OVERLAY ── */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" 
          alt="Background" 
          fill 
          className="object-cover opacity-40 blur-[8px] scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/80 to-[#0a0a0a] backdrop-blur-[2px]" />
      </div>

      {/* ── MAIN CARD (GLASSMORPHISM) ── */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-[1000px] flex flex-col lg:flex-row rounded-[2rem] overflow-hidden border border-white/10 bg-black/40 backdrop-blur-2xl shadow-2xl"
      >
        {/* ── LEFT PANEL: Form ── */}
        <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-between relative border-r border-white/5 bg-black/20">
          <div className="flex items-center justify-between mb-12">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-[20px] text-white tracking-tight">CVision</span>
            </Link>
            <span className="text-[13px] text-gray-400">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="text-white font-bold hover:underline underline-offset-4">Đăng ký</Link>
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-[380px] mx-auto w-full">
            <h1 className="text-[36px] font-black text-white tracking-tight mb-2 leading-tight">Chào mừng<br/>trở lại.</h1>
            <p className="text-gray-400 text-[15px] mb-8 font-medium">Đăng nhập để tiếp tục phân tích hồ sơ của bạn.</p>

            {error && <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium rounded-xl">{error}</div>}

            <button onClick={handleGoogle} disabled={loading} className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-[14px] font-bold text-white mb-6">
              <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Tiếp tục với Google
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">HOẶC</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-2">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required
                  className="w-full px-4 py-3.5 text-[14px] bg-white/5 text-white rounded-xl border border-white/10 focus:outline-none focus:border-white/30 focus:bg-white/10 transition placeholder:text-gray-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Mật khẩu</label>
                  <Link href="/forgot-password" className="text-[12px] font-semibold text-gray-400 hover:text-white transition">Quên mật khẩu?</Link>
                </div>
                <div className="relative">
                  <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                    className="w-full px-4 py-3.5 text-[14px] bg-white/5 text-white rounded-xl border border-white/10 focus:outline-none focus:border-white/30 focus:bg-white/10 transition placeholder:text-gray-600 pr-12"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold py-3.5 px-4 rounded-xl hover:bg-gray-200 transition-all text-[14px] mt-6 disabled:opacity-60">
                {loading ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <>Đăng nhập <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          </div>

          <div className="mt-12 text-center flex items-center justify-center gap-2 opacity-50">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-[12px] text-white font-medium tracking-wide">CVision AI — Career Intelligence Platform</span>
          </div>
        </div>

        {/* ── RIGHT PANEL: Testimonial/Info ── */}
        <div className="hidden lg:flex w-1/2 relative p-12 flex-col justify-end">
          <div className="relative z-10 w-full max-w-md mx-auto bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl mb-8">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-400 text-[10px] font-bold tracking-wider uppercase">ATS MATCH RATE: 92%</span>
            </div>
            <p className="text-white text-[16px] leading-relaxed font-medium mb-6">
              "CVision giúp tôi tối ưu được hồ sơ trong vòng 10 phút và tôi đã nhận được lời mời phỏng vấn ngay tuần sau."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white text-[13px] font-bold border border-white/20">NL</div>
              <div>
                <div className="text-white text-[13px] font-bold">Nguyễn Linh</div>
                <div className="text-gray-400 text-[11px] font-medium">Software Engineer tại Shopee Vietnam</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
