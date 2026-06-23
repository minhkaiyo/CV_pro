"use client";

import Link from "next/link";
import { useRef, useState, useCallback } from "react";

// ── Nav data ──────────────────────────────────────────────────────────────────

export const PRODUCT_ITEMS = {
  main_left: [
    { label: "CVision aOS",     href: "/product/cvision-aos" },
    { label: "Smart Editor",    href: "/product/smart-editor" },
    { label: "Web Extension",   href: "/product/web-extension" },
    { label: "Editor",          href: "/product/editor" },
    { label: "Mobile app",      href: "/product/mobile-app" },
  ],
  main_right: [
    { label: "ATS Scanner",     href: "/product/ats-scanner" },
    { label: "Workflows",       href: "/product/workflows" },
    { label: "Career Research", href: "/product/career-research" },
    { label: "Portal",          href: "/dashboard" },
  ],
  new: [
    { label: "Monitors",        href: "/product/monitors" },
    { label: "Agent",           href: "/product/ai-agent" },
    { label: "Lists",           href: "/product/cv-versions" },
  ],
};

// ── Shared glass styles matching the screenshot ───────────────────────────────

const GLASS_DROPDOWN: React.CSSProperties = {
  background: "rgba(10, 10, 10, 0.45)", // More transparent black
  backdropFilter: "blur(24px) saturate(150%)",
  WebkitBackdropFilter: "blur(24px) saturate(150%)",
  boxShadow: "0 10px 40px -10px rgba(0,0,0,0.5)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const GLASS_PILL: React.CSSProperties = {
  background: "rgba(10, 10, 10, 0.3)",
  backdropFilter: "blur(16px) saturate(150%)",
  WebkitBackdropFilter: "blur(16px) saturate(150%)",
};

// ── NavDropdown ───────────────────────────────────────────────────────────────

function NavDropdown({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const enter = useCallback(() => {
    if (timeout.current) clearTimeout(timeout.current);
    setOpen(true);
  }, []);
  const leave = useCallback(() => {
    timeout.current = setTimeout(() => setOpen(false), 80);
  }, []);

  return (
    <div className="relative" onMouseEnter={enter} onMouseLeave={leave}>
      <button 
        className="px-5 py-2.5 rounded-full text-[15px] font-medium transition-all text-white"
        style={open ? GLASS_PILL : {}}
      >
        {label}
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 pt-2">
          {/* Dropdown Container */}
          <div
            onMouseEnter={enter}
            onMouseLeave={leave}
            className="rounded-[1.25rem] overflow-hidden min-w-[320px] text-white"
            style={GLASS_DROPDOWN}
          >
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Public Navbar ─────────────────────────────────────────────────────────────

export default function PublicNav() {
  return (
    <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 pt-4">
      {/* Left nav */}
      <nav className="hidden md:flex items-center gap-1">
        <NavDropdown label="Product">
          <div className="p-6">
            <div className="flex gap-12">
              {/* Left Column */}
              <div className="flex flex-col gap-5">
                {PRODUCT_ITEMS.main_left.map((item) => (
                  <Link key={item.href} href={item.href} className="text-[15px] text-white hover:opacity-80 transition">
                    {item.label}
                  </Link>
                ))}
              </div>
              {/* Right Column */}
              <div className="flex flex-col gap-5">
                {PRODUCT_ITEMS.main_right.map((item) => (
                  <Link key={item.href} href={item.href} className="text-[15px] text-white hover:opacity-80 transition">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="h-px bg-white/10 w-full my-6" />

            <div>
              <div className="text-[11px] text-white/50 mb-5 tracking-wide">New products</div>
              <div className="flex flex-col gap-5">
                {PRODUCT_ITEMS.new.map((item) => (
                  <Link key={item.href} href={item.href} className="text-[15px] text-white hover:opacity-80 transition">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </NavDropdown>

        <Link href="/solutions" className="px-5 py-2.5 rounded-full text-[15px] font-medium text-white hover:bg-white/10 transition">Solutions</Link>
        <Link href="/security"  className="px-5 py-2.5 rounded-full text-[15px] font-medium text-white hover:bg-white/10 transition">Security</Link>
        <Link href="/customers" className="px-5 py-2.5 rounded-full text-[15px] font-medium text-white hover:bg-white/10 transition">Customers</Link>
        <Link href="/about"     className="px-5 py-2.5 rounded-full text-[15px] font-medium text-white hover:bg-white/10 transition">Company</Link>
      </nav>

      {/* Logo center */}
      <Link href="/" className="absolute left-1/2 -translate-x-1/2 font-playfair text-2xl tracking-wide text-white uppercase">
        CVision
      </Link>

      {/* Right actions */}
      <div className="flex items-center gap-4">
        <Link href="/login" className="text-[15px] font-medium text-white hover:opacity-80 transition hidden sm:block">Log in</Link>
        <Link href="/register" className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 py-2 rounded-full text-[15px] font-medium hover:bg-white/20 transition">
          Start for free
        </Link>
      </div>
    </header>
  );
}
