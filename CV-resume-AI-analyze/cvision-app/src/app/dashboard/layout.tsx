"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  LogOut,
  MessageSquare,
  Plus,
  User,
  Layers,
  Menu,
  X,
  UploadCloud,
  ChevronDown,
  Bell,
  Search,
  Sparkles,
  History,
  BookOpen,
  Target,
  Home,
  ChevronLeft,
  Shield,
  Settings,
  PenTool,
  Bookmark,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuthGuard } from "@/lib/use-auth-guard";
import { toast } from "@/components/ui/toast";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";

// ── UserMenu ───────────────────────────────────────────────────────────────────

function UserMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [userName, setUserName] = useState("User");
  const [userPlan, setUserPlan] = useState("FREE");

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (u) {
        const snap = await getDoc(doc(db, "profiles", u.uid)).catch(() => null);
        if (snap?.exists()) {
          setUserName(snap.data().full_name || u.email?.split("@")[0] || "User");
          setUserPlan(snap.data().plan?.toUpperCase() || "FREE");
        } else {
          setUserName(u.email?.split("@")[0] || "User");
        }
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast("success", "Đã đăng xuất thành công");
      router.push("/login");
    } catch {
      toast("error", "Có lỗi khi đăng xuất. Vui lòng thử lại.");
    }
  };

  const MENU_ITEMS = [
    { label: "Chỉnh sửa Profile", icon: User, href: "/dashboard/profile" },
    { label: "Tạo Cover Letter", icon: PenTool, href: "/dashboard/cover-letter" },
    { label: "Lịch sử Phân tích", icon: Bookmark, href: "/dashboard/analyses" },
    { label: "Nâng cấp tài khoản", icon: Sparkles, href: "/dashboard/billing" },
    { label: "Chế độ Admin", icon: Shield, href: "/admin", divider: true },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-gray-100 transition focus:outline-none"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-[11px] font-bold shadow-sm">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="hidden sm:block text-left mr-1">
          <div className="text-[13px] font-bold text-gray-700 leading-tight">{userName}</div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50 origin-top-right"
          >
            <div className="p-4 border-b border-gray-50 bg-blue-50/30">
              <div className="font-bold text-gray-800 text-[14px] truncate">{userName}</div>
              <div className="text-[11px] font-black text-emerald-500 tracking-wider mt-0.5">{userPlan}</div>
            </div>
            <div className="py-2">
              {MENU_ITEMS.map((item, idx) => (
                <div key={item.label}>
                  {item.divider && <div className="h-px bg-gray-50 my-1.5" />}
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 transition-colors"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                </div>
              ))}
              <div className="h-px bg-gray-50 my-1.5" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const NAV_MAIN = [
  { href: "/dashboard", label: "Trang Chủ", icon: Home, exact: true },
  { href: "/dashboard/analyses", label: "Lịch Sử Phân Tích", icon: History },
  { href: "/dashboard/cv-versions", label: "Các Bản CV", icon: FileText },
  { href: "/dashboard/upload", label: "Phân Tích Mới", icon: Target },
];

const NAV_TOOLS = [
  { href: "/dashboard/cover-letter", label: "Tạo Cover Letter", icon: MessageSquare },
  { href: "/dashboard/templates", label: "Mẫu CV (Templates)", icon: Layers },
];

const NAV_ACCOUNT = [
  { href: "/dashboard/billing", label: "Nâng Cấp Tài Khoản", icon: Sparkles },
  { href: "/dashboard/profile", label: "Hồ Sơ", icon: User },
];

// ── NavLink ────────────────────────────────────────────────────────────────────

function NavLink({
  href,
  label,
  icon: Icon,
  exact,
  onClick,
  accent = false,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  onClick?: () => void;
  accent?: boolean;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 text-[13.5px] rounded-xl font-medium transition-all duration-200 group ${
        active
          ? "bg-[#3b82f6] text-white shadow-[0_4px_14px_rgba(59,130,246,0.35)]"
          : accent
          ? "text-[#3b82f6] hover:bg-blue-50"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
      }`}
    >
      <Icon className={`w-4 h-4 shrink-0 ${active ? "text-white" : accent ? "text-[#3b82f6]" : "text-gray-400 group-hover:text-gray-600"}`} />
      {label}
    </Link>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────────

function Sidebar({ onClose }: { onClose?: () => void }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast("success", "Đã đăng xuất thành công");
      router.push("/login");
    } catch {
      toast("error", "Có lỗi khi đăng xuất. Vui lòng thử lại.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-100">
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-50 border border-gray-100 hover:bg-blue-50 hover:text-blue-500 hover:border-blue-200 text-gray-400 transition" title="Về trang chủ">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[#3b82f6] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[18px] text-[#3b82f6] tracking-tight">CVision</span>
          </Link>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 md:hidden">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav content */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {NAV_MAIN.map((item) => (
          <NavLink key={item.href} {...item} onClick={onClose} />
        ))}

        <div className="pt-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 pb-2">Công Cụ AI</p>
          {NAV_TOOLS.map((item) => (
            <NavLink key={item.href} {...item} onClick={onClose} />
          ))}
        </div>

        <div className="pt-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 pb-2">Tài Khoản</p>
          {NAV_ACCOUNT.map((item) => (
            <NavLink key={item.href} {...item} onClick={onClose} accent={item.href === "/dashboard/billing"} />
          ))}
        </div>
      </div>

      {/* Bottom user card */}
      <div className="p-3 border-t border-gray-100 shrink-0">
        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 transition cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
              U
            </div>
            <div>
              <div className="text-[13px] font-semibold text-gray-700">User</div>
              <div className="text-[11px] text-gray-400">Đang tải...</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Đăng xuất"
            className="text-gray-300 hover:text-red-400 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Layout ─────────────────────────────────────────────────────────────────────

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { loading } = useAuthGuard();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
        <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f5f7fb] font-inter overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-[240px] flex-col flex-shrink-0 z-20">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 bottom-0 w-[240px] z-10"
            >
              <Sidebar onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-5 flex-shrink-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-gray-400 hover:text-gray-600 transition md:hidden p-2 -ml-2"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search bar */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-400 w-72 cursor-text hover:border-blue-300 transition-colors">
            <Search className="w-4 h-4 shrink-0" />
            <span className="text-[13px]">Tìm kiếm...</span>
            <span className="ml-auto text-[11px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded font-mono">⌘K</span>
          </div>

          <div className="flex items-center gap-3">
            {/* New Analysis CTA */}
            <Link
              href="/dashboard/upload"
              className="hidden md:flex items-center gap-2 text-[13px] font-semibold px-4 py-2 bg-[#3b82f6] text-white rounded-xl hover:bg-blue-600 transition-all shadow-md shadow-blue-200 hover:shadow-blue-300"
            >
              <Plus className="w-4 h-4" />
              Phân Tích CV
            </Link>

            {/* Bell */}
            <button className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition text-gray-500">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-400 rounded-full" />
            </button>

            {/* User Menu */}
            <UserMenu />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1200px] mx-auto w-full p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
