import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface FeatureBlock {
  eyebrow?: string;
  title: string;
  body: string;
  bullets?: string[];
  badge?: string;
  side?: "left" | "right";
  mockup?: React.ReactNode;
}

export interface ProductPageProps {
  breadcrumb: string;
  headline: string;
  subheadline: string;
  cta?: { label: string; href: string };
  heroMockup?: React.ReactNode;
  features: FeatureBlock[];
  relatedLinks?: { label: string; href: string }[];
}

function MockupShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden shadow-2xl shadow-black/60">
      {/* traffic lights */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06]">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
      </div>
      <div className="p-6 min-h-[260px] flex items-center justify-center">{children}</div>
    </div>
  );
}

export function ProductPage({
  breadcrumb, headline, subheadline, cta, heroMockup, features, relatedLinks,
}: ProductPageProps) {
  return (
    <div className="font-inter">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="text-[12px] font-semibold text-zinc-600 uppercase tracking-widest mb-6">
          {breadcrumb}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl font-semibold text-white leading-[1.1] tracking-tight mb-6">
              {headline}
            </h1>
            <p className="text-[16px] text-zinc-400 leading-relaxed mb-8 max-w-lg">
              {subheadline}
            </p>
            {cta && (
              <Link
                href={cta.href}
                className="inline-flex items-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-full text-[14px] hover:bg-zinc-200 transition"
              >
                {cta.label} <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
          {heroMockup && (
            <MockupShell>{heroMockup}</MockupShell>
          )}
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-white/[0.04]" />

      {/* Features */}
      {features.map((f, i) => (
        <section key={i} className="max-w-6xl mx-auto px-6 py-20">
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${
            f.side === "right" ? "lg:[&>*:first-child]:order-2" : ""
          }`}>
            {/* Text */}
            <div>
              {f.eyebrow && (
                <div className="text-[11px] font-semibold text-zinc-600 uppercase tracking-widest mb-4">
                  {f.eyebrow}
                </div>
              )}
              <h2 className="text-3xl sm:text-4xl font-semibold text-white leading-tight mb-4 tracking-tight">
                {f.title}
              </h2>
              <p className="text-[15px] text-zinc-400 leading-relaxed mb-6">{f.body}</p>
              {f.bullets && (
                <ul className="space-y-3">
                  {f.bullets.map((b, j) => (
                    <li key={j} className="flex items-start gap-3 text-[14px] text-zinc-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/40 mt-2 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Mockup */}
            {f.mockup && <MockupShell>{f.mockup}</MockupShell>}
          </div>
          {i < features.length - 1 && <div className="border-t border-white/[0.04] mt-20" />}
        </section>
      ))}

      {/* Related links */}
      {relatedLinks && relatedLinks.length > 0 && (
        <section className="border-t border-white/[0.04]">
          <div className="max-w-6xl mx-auto px-6 py-14">
            <div className="text-[11px] font-semibold text-zinc-600 uppercase tracking-widest mb-6">
              Khám phá thêm
            </div>
            <div className="flex flex-wrap gap-3">
              {relatedLinks.map((r) => (
                <Link
                  key={r.href}
                  href={r.href}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/[0.08] text-[13px] text-zinc-400 hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition"
                >
                  {r.label} <ArrowRight className="w-3 h-3" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
