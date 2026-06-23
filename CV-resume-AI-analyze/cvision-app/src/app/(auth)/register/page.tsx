"use client";

import Link from "next/link";
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Sparkles, Trophy, AlertCircle } from "lucide-react";
import Image from "next/image";

const getRegisterErrorMsg = (code: string): string => {
  switch (code) {
    case "auth/email-already-in-use":
      return "Email này đã được đăng ký. Vui lòng chuyển sang trang Đăng nhập.";
    case "auth/weak-password":
      return "Mật khẩu quá yếu. Vui lòng nhập ít nhất 6 ký tự.";
    case "auth/invalid-email":
      return "Địa chỉ email không hợp lệ.";
    case "auth/network-request-failed":
      return "Lỗi kết nối mạng. Vui lòng kiểm tra internet.";
    default:
      return "Đăng ký thất bại. Vui lòng thử lại.";
  }
};

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
        created_at: new Date(),
      });

      router.push("/dashboard");
    } catch (err: any) {
      setError(getRegisterErrorMsg(err?.code || ""));
    } finally {
      setLoading(false);
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
        <div className="absolute inset-0 bg-gradient-to-bl from-black/80 via-black/60 to-[#0a0a12]/90" />
        <div className="absolute inset-0 backdrop-blur-[4px]" />
      </div>

      {/* ── MAIN CARD ── */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[980px] flex flex-col lg:flex-row-reverse rounded-[28px] overflow-hidden"
        style={{
          background: "rgba(10, 10, 10, 0.55)",
          backdropFilter: "blur(40px) saturate(180%)",
          WebkitBackdropFilter: "blur(40px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}
      >
        {/* ── RIGHT: FORM ── */}
        <div
          className="w-full lg:w-[52%] p-8 md:p-12 flex flex-col justify-between relative"
          style={{ borderLeft: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center justify-between mb-10 relative z-10">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: "rgba(59,130,246,0.25)",
                  border: "1px solid rgba(59,130,246,0.4)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <Sparkles className="w-4 h-4 text-blue-300" />
              </div>
              <span className="font-bold text-[19px] text-white tracking-tight">CVision</span>
            </Link>
            <span className="text-[13px] text-white/40">
              Đã có tài khoản?{" "}
              <Link href="/login" className="text-white/80 font-semibold hover:text-white transition">
                Đăng nhập
              </Link>
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-[380px] mx-auto w-full relative z-10">
            <h1 className="text-[38px] font-black text-white tracking-tight mb-1.5 leading-tight">
              Tạo tài<br />khoản.
            </h1>
            <p className="text-white/40 text-[14px] mb-8 font-medium">
              Bắt đầu tối ưu hoá hồ sơ miễn phí ngay hôm nay.
            </p>

            {error && (
              <div
                className="mb-5 px-4 py-3 rounded-2xl flex items-start gap-3 text-sm font-medium"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="text-red-300 leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-white/40 uppercase tracking-widest mb-2">
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  required
                  className="w-full px-4 py-3.5 text-[14px] text-white rounded-2xl outline-none transition-all placeholder:text-white/20"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    backdropFilter: "blur(12px)",
                  }}
                  onFocus={(e) => (e.target.style.border = "1px solid rgba(59,130,246,0.5)")}
                  onBlur={(e) => (e.target.style.border = "1px solid rgba(255,255,255,0.09)")}
                />
              </div>

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
                  onFocus={(e) => (e.target.style.border = "1px solid rgba(59,130,246,0.5)")}
                  onBlur={(e) => (e.target.style.border = "1px solid rgba(255,255,255,0.09)")}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white/40 uppercase tracking-widest mb-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ít nhất 6 ký tự"
                    required
                    className="w-full px-4 py-3.5 text-[14px] text-white rounded-2xl outline-none transition-all placeholder:text-white/20 pr-12"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.09)",
                      backdropFilter: "blur(12px)",
                    }}
                    onFocus={(e) => (e.target.style.border = "1px solid rgba(59,130,246,0.5)")}
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
                    <span>Tạo tài khoản</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-[12px] text-white/20 text-center mt-8 font-medium leading-relaxed">
              Bằng cách đăng ký, bạn đồng ý với{" "}
              <Link href="#" className="text-white/40 hover:text-white/70 transition">
                Điều khoản dịch vụ
              </Link>{" "}
              và{" "}
              <Link href="#" className="text-white/40 hover:text-white/70 transition">
                Chính sách bảo mật
              </Link>.
            </p>
          </div>
        </div>

        {/* ── LEFT: INFO PANEL ── */}
        <div className="hidden lg:flex w-[48%] relative p-10 flex-col justify-center items-center text-center overflow-hidden">
          <div className="relative z-10 w-full max-w-sm mx-auto">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 hover:rotate-0 transition-all duration-500"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(12px)",
                transform: "rotate(6deg)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "rotate(0deg)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "rotate(6deg)")}
            >
              <Trophy className="w-10 h-10 text-emerald-400" />
            </div>

            <h2 className="text-[30px] font-black text-white tracking-tight mb-4 leading-tight">
              Mở khóa cơ hội{" "}
              <span className="text-emerald-400">nghề nghiệp</span> của bạn.
            </h2>
            <p className="text-white/40 font-medium text-[14px] max-w-xs mx-auto leading-relaxed mb-10">
              Phân tích CV chuyên sâu và đánh bại hệ thống ATS chỉ với vài thao tác đơn giản.
            </p>

            <div
              className="rounded-2xl p-5 text-left"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(20px)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
            >
              <div className="text-3xl text-white/10 font-serif mb-2">"</div>
              <p className="text-white/70 text-[13px] font-medium leading-relaxed mb-4">
                Hệ thống phân tích ATS của CVision hoạt động quá xuất sắc. Mình đã sửa CV theo gợi ý và ngay lập tức nhận được email phản hồi từ nhà tuyển dụng.
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-bold"
                  style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
                >
                  PM
                </div>
                <div>
                  <div className="text-white/80 text-[13px] font-bold">Phạm Văn Minh</div>
                  <div className="text-white/30 text-[11px] font-semibold">Software Engineer tại Techcombank</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
