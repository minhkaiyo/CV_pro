"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Shield, Lock, Key, CheckCircle, ArrowRight, FileCheck } from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const certs = [
  { icon: FileCheck, label: "SOC 2 Type II" },
  { icon: Shield,    label: "ISO 27001" },
  { icon: CheckCircle, label: "GDPR Ready" },
  { icon: Lock,      label: "ISO 42001" },
];

const pillars = [
  {
    title: "End-to-End Encryption",
    desc: "All CV data is encrypted with AES-256 at rest and TLS 1.3 in transit. Zero plaintext exposure at any layer.",
  },
  {
    title: "Zero Data Sharing",
    desc: "We never sell or share your CV data with recruiters or third parties. Your data is yours — full stop.",
  },
  {
    title: "EU Data Residency",
    desc: "Data can be stored in the EU on request. Infrastructure runs on AWS with geo-replication and 99.99% SLA.",
  },
  {
    title: "Granular Access Controls",
    desc: "Role-based access control, mandatory MFA for admins, automatic session timeouts, and full audit logs.",
  },
  {
    title: "Vulnerability Management",
    desc: "Continuous automated scanning, responsible disclosure program, and quarterly third-party penetration testing.",
  },
  {
    title: "Incident Response",
    desc: "24/7 monitoring with sub-1-hour response SLA for critical incidents. Full post-mortems published to users.",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#111] font-inter">

      {/* ── HERO: split layout ── */}
      <section className="relative flex min-h-screen">

        {/* Left: dark panel */}
        <div className="relative z-10 flex flex-col justify-between w-full md:w-[42%] bg-[#0B0B0C] text-white px-10 py-32">
          {/* Top label */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
              SECURITY
              <span className="text-zinc-400 font-normal normal-case tracking-normal ml-2">
                Always on. Always secure.
              </span>
            </p>
          </div>

          {/* Main heading */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 flex flex-col justify-center gap-10"
          >
            <h1 className="text-5xl lg:text-6xl font-bold tracking-tighter leading-[1.05]">
              Your data is<br />in safe hands.
            </h1>

            <p className="text-[15px] text-zinc-400 leading-relaxed max-w-sm">
              From encryption to access management, CVision enforces
              rigorous standards to ensure your data stays secure,
              private, and compliant.
            </p>

            <div>
              <Link
                href="#trust"
                className="inline-flex items-center gap-2 border border-white/20 text-white px-6 py-3 rounded-full text-[13px] font-semibold hover:bg-white hover:text-black transition-all duration-300 group"
              >
                Go to trust center
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* Bottom certs row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-wrap gap-3"
          >
            {certs.map((c) => (
              <div
                key={c.label}
                className="flex items-center gap-2 border border-white/10 rounded-full px-4 py-1.5 text-[11px] font-semibold text-zinc-300"
              >
                <c.icon className="w-3 h-3 text-emerald-400" />
                {c.label}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: editorial photo with floating glass cards */}
        <div className="hidden md:block relative flex-1">
          <Image
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1400&auto=format&fit=crop"
            alt="Security — locked vault door"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/20" />

          {/* Floating glass icon strip — centred */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="flex items-center gap-3 bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl px-5 py-4 shadow-2xl">
              {/* Icon: Shield — muted glass */}
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md flex items-center justify-center">
                <Shield className="w-7 h-7 text-white/60" />
              </div>
              {/* Icon: Key — bright white (active) */}
              <div className="w-16 h-16 rounded-2xl bg-white border border-white/20 shadow-lg flex items-center justify-center">
                <Key className="w-7 h-7 text-[#0B0B0C]" />
              </div>
              {/* Icon: Lock — muted glass */}
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md flex items-center justify-center">
                <Lock className="w-7 h-7 text-white/60" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── PILLARS GRID ── */}
      <section id="trust" className="bg-white py-28 px-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-end justify-between mb-16 border-b border-[#EBEBEB] pb-8">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-3">
                How we protect you
              </p>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                Security by design.<br />Not by accident.
              </h2>
            </div>
            <Link
              href="#"
              className="hidden md:inline-flex shrink-0 items-center gap-2 bg-[#0B0B0C] text-white px-7 py-3.5 rounded-full text-[13px] font-semibold hover:bg-zinc-800 transition group"
            >
              View security docs
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-x divide-y divide-[#EBEBEB] border border-[#EBEBEB]">
            {pillars.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="p-10 hover:bg-[#F7F7F5] transition-colors group cursor-default"
              >
                <div className="w-9 h-px bg-[#111] mb-8 group-hover:w-14 transition-all duration-500" />
                <h3 className="text-[17px] font-bold tracking-tight mb-3">{p.title}</h3>
                <p className="text-zinc-500 text-[13px] leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST BANNER ── */}
      <section className="bg-[#0B0B0C] py-24 px-10">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-4">
              Trust Center
            </p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight mb-6">
              Want the full<br />technical details?
            </h2>
            <p className="text-zinc-400 text-[15px] leading-relaxed max-w-md">
              Visit our Trust Center to view audit reports, sub-processor lists,
              and our complete security policy documentation.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="shrink-0"
          >
            <Link
              href="#"
              className="inline-flex items-center gap-2 bg-white text-black px-9 py-4 rounded-full font-semibold text-[14px] hover:bg-zinc-200 transition-colors group"
            >
              Go to Trust Center
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <div className="bg-white py-6 px-10 border-t border-[#EBEBEB] text-[12px] text-zinc-400 flex justify-between">
        <span>© 2026 CVision Inc.</span>
        <div className="flex gap-6">
          <Link href="/privacy" className="hover:text-black transition">Privacy</Link>
          <Link href="/terms"   className="hover:text-black transition">Terms</Link>
        </div>
      </div>
    </div>
  );
}
