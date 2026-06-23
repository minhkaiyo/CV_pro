"use client";

import Link from "next/link";
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Sparkles, Trophy } from "lucide-react";
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await setDoc(doc(db, "profiles", user.uid), {
        full_name: name,
        email: email,
        plan: "free",
        role: "user",
        created_at: new Date()
      });

      router.push("/dashboard");
    } catch (err: any) {
      if (err?.code === "auth/email-already-in-use") {
        setError("Email này đã được đăng ký. Vui lòng chuyển sang trang Đăng nhập.");
      } else if (err?.code === "auth/weak-password") {
        setError("Mật khẩu quá yếu. Vui lòng nhập ít nhất 6 ký tự.");
      } else {
        setError("Đăng ký thất bại: " + (err instanceof Error ? err.message : "Lỗi không xác định"));
      }
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
        className="relative z-10 w-full max-w-[1000px] flex flex-col lg:flex-row-reverse rounded-[2rem] overflow-hidden border border-white/10 bg-black/40 backdrop-blur-2xl shadow-2xl"
      >
        {/* ── RIGHT PANEL: Form ── */}
        <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-between relative border-l border-white/5 bg-black/20">
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-[20px] text-white tracking-tight">CVision</span>
            </Link>
            <span className="text-[13px] text-gray-400">
              Đã có tài khoản?{" "}
              <Link href="/login" className="text-white font-bold hover:underline underline-offset-4">Đăng nhập</Link>
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-[380px] mx-auto w-full">
            <h1 className="text-[36px] font-black text-white tracking-tight mb-2 leading-tight">Tạo tài<br/>khoản.</h1>
            <p className="text-gray-400 text-[15px] mb-8 font-medium">Bắt đầu tối ưu hoá hồ sơ miễn phí ngay hôm nay.</p>

            {error && <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium rounded-xl">{error}</div>}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-2">Họ và tên</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nguyễn Văn A" required
                  className="w-full px-4 py-3.5 text-[14px] bg-white/5 text-white rounded-xl border border-white/10 focus:outline-none focus:border-white/30 focus:bg-white/10 transition placeholder:text-gray-600"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-2">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required
                  className="w-full px-4 py-3.5 text-[14px] bg-white/5 text-white rounded-xl border border-white/10 focus:outline-none focus:border-white/30 focus:bg-white/10 transition placeholder:text-gray-600"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-2">Mật khẩu</label>
                <div className="relative">
                  <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Tạo mật khẩu an toàn" required
                    className="w-full px-4 py-3.5 text-[14px] bg-white/5 text-white rounded-xl border border-white/10 focus:outline-none focus:border-white/30 focus:bg-white/10 transition placeholder:text-gray-600 pr-12"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold py-3.5 px-4 rounded-xl hover:bg-gray-200 transition-all text-[14px] mt-6 disabled:opacity-60">
                {loading ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <>Tạo tài khoản <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            <p className="text-[12px] text-gray-500 text-center mt-8 font-medium leading-relaxed">
              Bằng cách đăng ký, bạn đồng ý với{" "}
              <Link href="#" className="text-gray-400 font-bold hover:text-white transition underline-offset-2 hover:underline">Điều khoản dịch vụ</Link>
              {" "}và{" "}
              <Link href="#" className="text-gray-400 font-bold hover:text-white transition underline-offset-2 hover:underline">Chính sách bảo mật</Link>.
            </p>
          </div>
        </div>

        {/* ── LEFT PANEL: Informational ── */}
        <div className="hidden lg:flex w-1/2 relative p-12 flex-col justify-center items-center text-center">
          <div className="relative z-10 w-full max-w-sm mx-auto">
            <div className="w-20 h-20 bg-white/10 rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-8 rotate-12 hover:rotate-0 transition-all duration-500 border border-white/20">
              <Trophy className="w-10 h-10 text-emerald-400" />
            </div>
            
            <h2 className="text-[32px] font-black text-white tracking-tight mb-4 leading-tight">
              Mở khóa cơ hội <br/>
              <span className="text-emerald-400">nghề nghiệp</span> của bạn.
            </h2>
            <p className="text-gray-400 font-medium text-[15px] max-w-xs mx-auto leading-relaxed mb-12">
              Phân tích CV chuyên sâu và đánh bại hệ thống ATS chỉ với vài thao tác đơn giản.
            </p>

            <div className="bg-black/40 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/10 text-left relative">
              <div className="absolute -top-3 -left-3 text-4xl text-white/20 font-serif">"</div>
              <p className="text-gray-300 text-[14px] font-medium leading-relaxed mb-4 relative z-10">
                Hệ thống phân tích ATS của CVision hoạt động quá xuất sắc. Mình đã sửa CV theo gợi ý và ngay lập tức nhận được email phản hồi từ nhà tuyển dụng.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white text-[13px] font-bold border border-white/20">PM</div>
                <div>
                  <div className="text-white text-[13px] font-bold">Phạm Văn Minh</div>
                  <div className="text-gray-500 text-[11px] font-semibold">Software Engineer tại Techcombank</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
