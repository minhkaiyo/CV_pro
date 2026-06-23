"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import {
  Home, ShoppingCart, Tag, UserCheck, Users, BarChart2,
  Settings, X, LayoutTemplate, Sparkles, ChevronDown, ChevronLeft, Menu, Bell, Search,
  User, PenTool, Bookmark, LogOut, Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "@/components/ui/toast";

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
    { label: "Chế độ User", icon: Shield, href: "/dashboard", divider: true },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-gray-100 transition focus:outline-none"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[11px] font-bold shadow-sm">
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
            <div className="p-4 border-b border-gray-50 bg-indigo-50/30">
              <div className="font-bold text-gray-800 text-[14px] truncate">{userName}</div>
              <div className="text-[11px] font-black text-indigo-500 tracking-wider mt-0.5">{userPlan}</div>
            </div>
            <div className="py-2">
              {MENU_ITEMS.map((item, idx) => (
                <div key={item.label}>
                  {item.divider && <div className="h-px bg-gray-50 my-1.5" />}
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors"
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

// ── Nav structure ──────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: "Tổng quan", href: "/admin", icon: Home, exact: true },
  { label: "Giao dịch", href: "/admin/orders", icon: ShoppingCart },
  {
    label: "Dịch vụ AI", href: "/admin/products", icon: Tag,
    children: [
      { label: "Danh sách models", href: "/admin/products" },
      { label: "Danh mục", href: "/admin/products/categories" },
    ],
  },
  { label: "Khách Premium", href: "/admin/subscriptions", icon: UserCheck },
  { label: "Người dùng", href: "/admin/customers", icon: Users },
  { label: "Phân tích", href: "/admin/analytics", icon: BarChart2 },
  { label: "Cài đặt", href: "/admin/settings", icon: Settings },
];

// ── NavItem ────────────────────────────────────────────────────────────────────

function NavItem({
  item,
  onClose,
}: {
  item: typeof NAV_ITEMS[number];
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
  const [open, setOpen] = useState(active);

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={`w-full flex items-center justify-between px-4 py-2.5 text-[13.5px] rounded-xl font-medium transition-all duration-200 group ${
            active
              ? "bg-blue-50 text-blue-600 shadow-sm"
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          }`}
        >
          <div className="flex items-center gap-3">
            <item.icon className={`w-4 h-4 shrink-0 ${active ? "text-blue-500" : "text-gray-400 group-hover:text-gray-600"}`} />
            {item.label}
          </div>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden pl-7 mt-1 space-y-0.5"
            >
              {item.children.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={onClose}
                  className={`block px-4 py-2 text-[13px] rounded-lg transition-all ${
                    pathname === child.href
                      ? "text-blue-600 bg-blue-50 font-semibold"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {child.label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onClose}
      className={`flex items-center gap-3 px-4 py-2.5 text-[13.5px] rounded-xl font-medium transition-all duration-200 group ${
        active
          ? "bg-[#3b82f6] text-white shadow-[0_4px_14px_rgba(59,130,246,0.35)]"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
      }`}
    >
      <item.icon className={`w-4 h-4 shrink-0 ${active ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`} />
      {item.label}
    </Link>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────────

function Sidebar({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-100">
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-50 border border-gray-100 hover:bg-blue-50 hover:text-blue-500 hover:border-blue-200 text-gray-400 transition" title="Về trang chủ">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <Link href="/admin" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
                 style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}
            >
              <Sparkles className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <span className="font-bold text-[16px] text-gray-800 tracking-tight leading-none block">CVision</span>
              <span className="text-[10px] text-blue-500 font-semibold tracking-wider uppercase block mt-0.5">Admin</span>
            </div>
          </Link>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 md:hidden">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Setup Banner */}
      <div className="m-4 rounded-xl overflow-hidden bg-blue-50 border border-blue-100">
        <div className="p-3 flex items-center justify-between border-b border-blue-100/50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-[10px] shrink-0 border border-blue-200">
              2/4
            </div>
            <span className="font-semibold text-blue-700 text-[12px]">System Setup</span>
          </div>
        </div>
        <div className="p-3 text-blue-600 flex items-center gap-2 cursor-pointer hover:bg-blue-100/50 transition text-[12px] font-medium">
          <LayoutTemplate className="w-4 h-4" /> Cập nhật AI Model
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-1 scrollbar-hide">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 py-2 mt-1">Tổng quan</p>
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.href} item={item as typeof NAV_ITEMS[number]} onClose={onClose} />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 shrink-0">
        <div className="text-[11px] text-gray-400 text-center font-medium">CVision Admin v2.0</div>
      </div>
    </div>
  );
}

// ── Layout ─────────────────────────────────────────────────────────────────────

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

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
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
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
        {/* Status Banner */}
        <div className="h-9 flex items-center justify-center px-4 text-[12px] font-medium shrink-0 bg-emerald-50 text-emerald-700 border-b border-emerald-100">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Hệ thống CVision AI đang hoạt động ổn định · Đã xử lý 42.1k hồ sơ trong 24h qua.</span>
          </div>
          <button className="ml-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 hover:bg-emerald-200 transition text-emerald-800">
            View Logs
          </button>
        </div>

        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-5 flex-shrink-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="text-gray-400 hover:text-gray-600 transition md:hidden p-2 -ml-2"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden md:block text-[16px] font-bold text-gray-800">Admin Dashboard</div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="hidden sm:flex items-center gap-2 text-sm text-gray-500 hover:text-[#3b82f6] bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 transition-colors px-3 py-1.5 rounded-xl font-medium"
            >
              ← Về User Dashboard
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
        <main className="flex-1 overflow-y-auto bg-[#f5f7fb]">
          <div className="p-6">
            <div className="max-w-[1200px] mx-auto w-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
