"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const values = [
  {
    title: "Transparency First",
    desc: "We explain every AI decision. No black boxes, no magic — only clear, auditable logic.",
  },
  {
    title: "Human-Centered AI",
    desc: "AI exists to amplify human potential, not replace it. Every suggestion serves the candidate's goals.",
  },
  {
    title: "Craft & Quality",
    desc: "Every line of code, every UI pixel is deliberate. We ship nothing we're not proud of.",
  },
  {
    title: "Privacy by Design",
    desc: "Security isn't an afterthought — it's architected into the system from day one.",
  },
];

const team = [
  {
    name: "Phạm Văn Minh",
    role: "Founder & Lead Engineer",
    img: "/vision_image.png",
    desc: "HUST — Electronics & Telecom. Passionate about AI and building products with real-world impact.",
    linkedin: "#",
  },
  {
    name: "AI Research",
    role: "AI/ML Research",
    img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=400&auto=format&fit=crop",
    desc: "Research advanced NLP models to deeply understand CV and job description semantics.",
  },
  {
    name: "Design",
    role: "Product Design",
    img: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=400&auto=format&fit=crop",
    desc: "Crafting minimal yet powerful UX, inspired by the world's leading SaaS products.",
  },
];

// Hero editorial photos — 3-column grid like Legora Company page
const heroPhotos = [
  {
    src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600&auto=format&fit=crop",
    alt: "Team collaborating",
    tall: false,
  },
  {
    src: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?q=80&w=900&auto=format&fit=crop",
    alt: "Person working at laptop",
    tall: true, // centre column is taller
  },
  {
    src: "https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=600&auto=format&fit=crop",
    alt: "Developer coding",
    tall: false,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CompanyPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#111] font-inter">

      {/* ── EDITORIAL PHOTO GRID HERO ── */}
      <section className="pt-[68px]">
        {/* 3-column photo bar — full width, no padding */}
        <div className="grid grid-cols-3 h-[420px] md:h-[520px] lg:h-[600px]">
          {heroPhotos.map((photo, i) => (
            <div
              key={photo.src}
              className={`relative overflow-hidden ${
                i === 1 ? "row-span-1" : ""
              }`}
              style={{ borderRight: i < 2 ? "1px solid #E5E5E4" : undefined }}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover object-center hover:scale-[1.03] transition-transform duration-700"
                sizes="33vw"
                priority={i === 1}
              />
              {/* Subtle overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>
          ))}
        </div>
      </section>

      {/* ── MISSION STATEMENT ── */}
      <section className="bg-white py-28 px-10">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-12 items-start">
          {/* Left: floating photo */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="hidden lg:block relative h-56 rounded-2xl overflow-hidden shadow-lg mt-8"
          >
            <Image
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=400&auto=format&fit=crop"
              alt="Team meeting"
              fill
              className="object-cover"
            />
          </motion.div>

          {/* Centre: mission text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-5">
              Our Mission
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-[1.05] mb-8">
              Build the OS for the world&apos;s{" "}
              <em className="font-bold not-italic">career growth.</em>
            </h1>
            <p className="text-[16px] text-zinc-500 leading-relaxed max-w-xl mx-auto mb-4">
              Delivering on our mission means the teams we hire need to
              move fast, think clearly, and care deeply about getting it right.
            </p>
            <p className="text-[16px] text-zinc-500 leading-relaxed max-w-xl mx-auto">
              The mission comes before ego. Titles take a back seat to progress.
              Character takes a front seat to everything.
            </p>
          </motion.div>

          {/* Right: floating photo */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="hidden lg:block relative h-56 rounded-2xl overflow-hidden shadow-lg mt-8"
          >
            <Image
              src="https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=400&auto=format&fit=crop"
              alt="Team brainstorm"
              fill
              className="object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* ── VALUES — editorial grid ── */}
      <section className="bg-[#F7F7F5] py-28 px-10 border-t border-[#E5E5E4]">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-end justify-between mb-16 border-b border-[#EBEBEB] pb-8">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-3">
                What we believe
              </p>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                Values that guide<br />every decision.
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-y divide-[#E5E5E4] border border-[#E5E5E4]">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-10 bg-white hover:bg-[#F7F7F5] transition-colors group cursor-default"
              >
                <div className="w-9 h-px bg-[#111] mb-8 group-hover:w-14 transition-all duration-500" />
                <h3 className="text-[19px] font-bold tracking-tight mb-3">{v.title}</h3>
                <p className="text-zinc-500 text-[14px] leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="bg-white py-28 px-10 border-t border-[#E5E5E4]">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-16 border-b border-[#EBEBEB] pb-8">
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-3">
              The people
            </p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Meet the team.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group"
              >
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-6 bg-zinc-100">
                  <Image
                    src={member.img}
                    alt={member.name}
                    fill
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  {/* Subtle bottom gradient */}
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent" />
                  {/* Name overlay at bottom */}
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <div className="text-white font-bold text-[17px] tracking-tight leading-tight drop-shadow">
                      {member.name}
                    </div>
                    <div className="text-white/70 text-[12px] uppercase tracking-widest font-medium drop-shadow">
                      {member.role}
                    </div>
                  </div>
                </div>
                <p className="text-zinc-500 text-[13px] leading-relaxed">{member.desc}</p>
                {member.linkedin && (
                  <Link
                    href={member.linkedin}
                    className="inline-flex items-center gap-1.5 text-[12px] mt-4 font-semibold text-zinc-400 hover:text-black transition"
                  >
                    LinkedIn →
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CAREERS CTA ── */}
      <section className="bg-[#0B0B0C] py-28 px-10">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-6">
            Careers
          </p>
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-10">
            <h2 className="text-5xl md:text-6xl font-bold tracking-tighter text-white leading-[1.05] max-w-2xl">
              Want to help build<br />
              <em className="not-italic text-zinc-400">the future of careers?</em>
            </h2>
            <Link
              href="mailto:careers@cvision.ai"
              className="shrink-0 inline-flex items-center gap-2 bg-white text-black px-9 py-4 rounded-full font-semibold text-[14px] hover:bg-zinc-200 transition-colors group"
            >
              See open roles
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
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
