"use client";

import Link from "next/link";
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Sparkles, Trophy } from "lucide-react";

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
      
      // Khởi tạo profile mặc định trong Firestore
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
    <div className="min-h-screen relative flex items-center justify-center p-4 md:p-8 font-inter overflow-hidden bg-[#f5f7fb]">
      {/* ── LIGHT BACKGROUND DECORATION ── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[120px]" />
      </div>

      {/* ── MAIN CARD ── */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-[1000px] bg-white rounded-3xl overflow-hidden flex flex-col lg:flex-row-reverse shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-gray-100"
      >
        {/* ── RIGHT PANEL: Form (Now on Right for Register) ── */}
        <div className="w-full lg:w-1/2 p-8 md:p-14 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-[#3b82f6] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-[20px] text-[#3b82f6] tracking-tight">CVision</span>
            </Link>
            <span className="text-[13px] text-gray-500">
              Đã có tài khoản?{" "}
              <Link href="/login" className="text-blue-600 font-bold hover:underline underline-offset-4">Đăng nhập</Link>
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-[400px] mx-auto w-full">
            <h1 className="text-[32px] font-black text-gray-800 tracking-tight mb-2 leading-tight">Tạo tài khoản.</h1>
            <p className="text-gray-500 text-[15px] mb-8 font-medium">Bắt đầu tối ưu hoá hồ sơ miễn phí ngay hôm nay.</p>

            {error && <div className="mb-6 px-4 py-3 bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-xl">{error}</div>}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2">Họ và tên</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nguyễn Văn A" required
                  className="w-full px-4 py-3 text-[14px] bg-gray-50 text-gray-800 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-400/10 transition placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required
                  className="w-full px-4 py-3 text-[14px] bg-gray-50 text-gray-800 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-400/10 transition placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2">Mật khẩu</label>
                <div className="relative">
                  <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Tạo mật khẩu an toàn" required
                    className="w-full px-4 py-3 text-[14px] bg-gray-50 text-gray-800 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-400/10 transition placeholder:text-gray-400 pr-12"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-[#3b82f6] text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-200 transition-all text-[14px] mt-4 group disabled:opacity-60 disabled:hover:shadow-none">
                {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Tạo tài khoản <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
              </button>
            </form>

            <p className="text-[12px] text-gray-400 text-center mt-6 font-medium leading-relaxed">
              Bằng cách đăng ký, bạn đồng ý với{" "}
              <Link href="#" className="text-gray-500 font-bold hover:text-blue-600 transition underline-offset-2 hover:underline">Điều khoản dịch vụ</Link>
              {" "}và{" "}
              <Link href="#" className="text-gray-500 font-bold hover:text-blue-600 transition underline-offset-2 hover:underline">Chính sách bảo mật</Link>.
            </p>
          </div>
        </div>

        {/* ── LEFT PANEL: Informational ── */}
        <div className="hidden lg:flex w-1/2 relative bg-indigo-50 border-r border-indigo-100 p-12 flex-col justify-center items-center text-center">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
          
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-8 rotate-12 hover:rotate-0 transition-all duration-500">
              <Trophy className="w-10 h-10 text-indigo-500" />
            </div>
            
            <h2 className="text-3xl font-black text-gray-800 tracking-tight mb-4 leading-tight">
              Mở khóa cơ hội <br/>
              <span className="text-indigo-600">nghề nghiệp</span> của bạn.
            </h2>
            <p className="text-gray-500 font-medium text-[15px] max-w-sm mx-auto leading-relaxed mb-12">
              Phân tích CV chuyên sâu và đánh bại hệ thống ATS chỉ với vài thao tác đơn giản.
            </p>

            <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-100 text-left relative max-w-sm mx-auto">
              <div className="absolute -top-3 -left-3 text-4xl text-indigo-200 font-serif">"</div>
              <p className="text-gray-600 text-[14px] font-medium leading-relaxed mb-4 relative z-10">
                Hệ thống phân tích ATS của CVision hoạt động quá xuất sắc. Mình đã sửa CV theo gợi ý và ngay lập tức nhận được email phản hồi từ nhà tuyển dụng.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 border border-indigo-50 flex items-center justify-center text-indigo-700 text-[13px] font-bold">PM</div>
                <div>
                  <div className="text-gray-800 text-[13px] font-bold">Phạm Văn Minh</div>
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
