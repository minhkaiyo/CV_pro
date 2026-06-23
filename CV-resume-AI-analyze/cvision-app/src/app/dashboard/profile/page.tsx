"use client";

import { useEffect, useState } from "react";
import { Camera, Save, Eye, EyeOff, Shield, Bell, Link2, Loader2 } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, updatePassword, EmailAuthProvider, reauthenticateWithCredential, type User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "@/components/ui/toast";

// ── Section card ─────────────────────────────────────────────────────────────

function Card({ title, icon: Icon, children }: {
  title: string; icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-blue-600" />
        </div>
        <h3 className="font-bold text-gray-800 text-[15px]">{title}</h3>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">{label}</label>
      {children}
    </div>
  );
}

const INPUT = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-blue-400 focus:bg-white transition-all";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState({ full_name: "", email: "", phone: "", school: "", major: "" });
  const [saving, setSaving] = useState(false);

  // Password change
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  // Notifications
  const [notifRenewal, setNotifRenewal] = useState(true);
  const [notifTips, setNotifTips] = useState(false);
  const [notifAnalysis, setNotifAnalysis] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const snap = await getDoc(doc(db, "profiles", u.uid)).catch(() => null);
        if (snap?.exists()) {
          const data = snap.data();
          setProfile({
            full_name: data.full_name ?? "",
            email: u.email ?? "",
            phone: data.phone ?? "",
            school: data.school ?? "",
            major: data.major ?? "",
          });
        } else {
          setProfile(p => ({ ...p, email: u.email ?? "" }));
        }
      }
    });
    return unsub;
  }, []);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, "profiles", user.uid), {
        full_name: profile.full_name,
        phone: profile.phone,
        school: profile.school,
        major: profile.major,
        updated_at: new Date(),
      }, { merge: true });
      toast("success", "Đã lưu thông tin cá nhân!");
    } catch {
      toast("error", "Lưu thất bại. Thử lại sau.");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!user || !user.email) return;
    if (newPwd.length < 6) { toast("warning", "Mật khẩu mới phải có ít nhất 6 ký tự."); return; }
    if (newPwd !== confirmPwd) { toast("warning", "Mật khẩu xác nhận không khớp."); return; }
    setSavingPwd(true);
    try {
      const cred = EmailAuthProvider.credential(user.email, currentPwd);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPwd);
      toast("success", "Đã đổi mật khẩu thành công!");
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi không xác định";
      toast("error", msg.includes("wrong-password") ? "Mật khẩu hiện tại không đúng." : "Đổi mật khẩu thất bại.");
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl font-inter">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight mb-1">Hồ sơ cá nhân</h1>
        <p className="text-gray-500 text-[13.5px]">Quản lý thông tin tài khoản và tuỳ chọn thông báo.</p>
      </div>

      {/* Avatar + basic info */}
      <Card title="Thông tin tài khoản" icon={Camera}>
        {/* Avatar */}
        <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white shrink-0 shadow-md">
            {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <div className="font-bold text-gray-800 text-[16px]">{profile.full_name || "Chưa đặt tên"}</div>
            <div className="text-gray-500 text-[13px] mt-0.5">{profile.email}</div>
            <button className="text-[12px] font-semibold text-blue-500 hover:text-blue-700 mt-2 transition">
              Đổi ảnh đại diện →
            </button>
          </div>
        </div>

        <Field label="Họ và tên">
          <input value={profile.full_name} onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
            placeholder="Nguyễn Văn A" className={INPUT} />
        </Field>
        <Field label="Email">
          <input value={profile.email} disabled className={INPUT + " bg-gray-100 text-gray-400 cursor-not-allowed border-transparent"} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Số điện thoại">
            <input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
              placeholder="0912 345 678" className={INPUT} />
          </Field>
          <Field label="Trường đại học">
            <input value={profile.school} onChange={e => setProfile(p => ({ ...p, school: e.target.value }))}
              placeholder="HUST, NEU..." className={INPUT} />
          </Field>
        </div>
        <Field label="Ngành học">
          <input value={profile.major} onChange={e => setProfile(p => ({ ...p, major: e.target.value }))}
            placeholder="Công nghệ thông tin, Tài chính..." className={INPUT} />
        </Field>
        <div className="flex justify-end pt-2">
          <button onClick={saveProfile} disabled={saving}
            className="flex items-center gap-2 bg-[#3b82f6] text-white px-6 py-2.5 rounded-xl text-[13.5px] font-semibold hover:bg-blue-600 transition disabled:opacity-50 shadow-md shadow-blue-200">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Lưu thay đổi
          </button>
        </div>
      </Card>

      {/* Password */}
      <Card title="Mật khẩu & Bảo mật" icon={Shield}>
        <Field label="Mật khẩu hiện tại">
          <div className="relative">
            <input type={showPwd ? "text" : "password"} value={currentPwd}
              onChange={e => setCurrentPwd(e.target.value)} placeholder="••••••••" className={INPUT + " pr-10"} />
            <button onClick={() => setShowPwd(s => !s)} type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Mật khẩu mới">
            <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)}
              placeholder="Tối thiểu 6 ký tự" className={INPUT} />
          </Field>
          <Field label="Xác nhận mật khẩu mới">
            <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)}
              placeholder="Nhập lại mật khẩu mới" className={INPUT} />
          </Field>
        </div>
        <div className="flex justify-end pt-2">
          <button onClick={changePassword} disabled={savingPwd}
            className="flex items-center gap-2 bg-gray-800 text-white px-6 py-2.5 rounded-xl text-[13.5px] font-semibold hover:bg-gray-900 transition disabled:opacity-50 shadow-md">
            {savingPwd ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            Đổi mật khẩu
          </button>
        </div>
      </Card>

      {/* Notifications */}
      <Card title="Tuỳ chọn thông báo" icon={Bell}>
        <div className="space-y-4">
          {[
            { label: "Email nhắc gia hạn", desc: "Nhận thông báo 7 ngày trước khi subscription hết hạn", val: notifRenewal, set: setNotifRenewal },
            { label: "Email kết quả phân tích", desc: "Nhận email khi AI hoàn thành phân tích CV", val: notifAnalysis, set: setNotifAnalysis },
            { label: "Email mẹo tìm việc", desc: "Nhận tips tối ưu CV và xu hướng tuyển dụng hàng tuần", val: notifTips, set: setNotifTips },
          ].map((item, idx) => (
            <div key={item.label} className={`flex items-center justify-between ${idx !== 2 ? "pb-4 border-b border-gray-50" : ""}`}>
              <div>
                <div className="text-[14px] font-bold text-gray-800">{item.label}</div>
                <div className="text-[12.5px] text-gray-500 mt-0.5">{item.desc}</div>
              </div>
              <button onClick={() => item.set(!item.val)}
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 focus:outline-none ${item.val ? "bg-blue-500" : "bg-gray-200"}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${item.val ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Social links */}
      <Card title="Liên kết mạng xã hội" icon={Link2}>
        <Field label="LinkedIn URL">
          <input placeholder="https://linkedin.com/in/your-profile" className={INPUT} />
        </Field>
        <p className="text-[12.5px] text-gray-500 -mt-2">Liên kết LinkedIn để tự động điền thông tin vào CV (Sắp ra mắt).</p>
        <div className="flex justify-end pt-2">
          <button onClick={() => toast("warning", "Tính năng đang phát triển.")}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-6 py-2.5 rounded-xl text-[13.5px] font-semibold hover:bg-gray-50 transition shadow-sm">
            <Link2 className="w-4 h-4" /> Kết nối LinkedIn
          </button>
        </div>
      </Card>
    </div>
  );
}
