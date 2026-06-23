# CVision AI - Master Implementation Plan

Phien ban: 2.0  
Ngay lap: 23/06/2026  
Muc dich: tai cau truc plan san pham CVision AI va doi chieu voi cac source code mau hien co trong thu muc `source` de AI/dev tiep theo co the hoan thien du an thanh mot SaaS thuong mai.

---

## 1. Executive Summary

CVision AI la nen tang SaaS phan tich, cham diem va toi uu CV cho sinh vien nam 3-4, fresher va nguoi moi di lam tai Viet Nam. San pham tap trung vao 5 gia tri chinh:

1. Upload CV PDF/DOCX va trich xuat noi dung co cau truc.
2. Cham diem CV theo ATS, keyword, bo cuc, noi dung, ky nang, thanh tich.
3. So khop CV voi Job Description de tim tu khoa thieu va diem yeu.
4. Sinh phien ban CV moi theo tung vi tri/cong ty/nganh, co diff de nguoi dung kiem soat.
5. Tao cover letter, gia lap HR review va du doan xac suat phu hop.

Mo hinh kinh doanh de xuat:

- Free: 1 lan phan tich/ngay, feedback co ban, khong export ban toi uu.
- Premium: 49.000 VND/thang, phan tich khong gioi han hop ly, tao toi da 10 phien ban CV/thang, export PDF/DOCX, HR simulation, probability estimate.
- B2B: goi cho truong dai hoc, trung tam huong nghiep, bootcamp, doanh nghiep dao tao.

Ket luan ky thuat: nen xay dung ban thuong mai dua tren kien truc Next.js + FastAPI + PostgreSQL/Supabase. Trong 4 source hien co, `Resume-Matcher` nen duoc dung lam loi chinh cho backend AI tailoring, resume builder, template va PDF export; `ats-screener` nen duoc tach logic parser/scoring/ATS profile de tich hop; `resume-lm` nen duoc tham khao cho auth, Supabase schema, Stripe, dashboard va resume management; `ai-resume-analyzer` chi nen dung lam prototype UI/flow nhe, khong nen lam nen tang production vi phu thuoc Puter.

---

## 2. Source Code Audit

Thu muc `source` hien co gom:

| Source | Stack | Diem manh | Nen dung cho CVision AI | Rui ro / Ghi chu |
|---|---|---|---|---|
| `Resume-Matcher` | Next.js 16 frontend, FastAPI Python 3.13 backend, LiteLLM, TinyDB/SQLite, Playwright PDF | Day du nhat: upload resume, parse document, tailor theo JD, diff-based improvement, cover letter, outreach, multi-template PDF, i18n | Nen lam codebase nen cho MVP/Core | Can doi DB sang PostgreSQL/Supabase, them auth/subscription/admin, Viet hoa UX |
| `ats-screener` | SvelteKit 5, TypeScript, Firebase, client-side parser, scoring engine | Parser PDF/DOCX, section detector, contact extractor, TF-IDF, 6 ATS profiles: Workday, Taleo, iCIMS, Greenhouse, Lever, SuccessFactors | Lay engine scoring/parser lam module tham khao hoac port sang backend | UI Svelte khac stack; can port logic sang TypeScript package hoac Python |
| `resume-lm` | Next.js 15, Supabase, Stripe, AI SDK, shadcn/ui | Schema Supabase/RLS, auth, subscriptions, dashboard, resume builder, AI provider abstraction, Stripe webhook | Tham khao schema, billing, admin, dashboard, AI client | License AGPL can can nhac neu dung code truc tiep cho thuong mai dong nguon |
| `ai-resume-analyzer` | React Router 7, Vite, Tailwind, Zustand, Puter.js | Flow upload/analyze don gian, UI reusable, pdfjs, feedback prompt mau | Tham khao UX nhanh va component scoring | Puter phu thuoc ben ngoai, khong phu hop SaaS co DB/subscription rieng |

Quyet dinh de xuat:

- Repository dich nen la mono-repo moi hoac fork tu `Resume-Matcher`.
- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui.
- Backend: FastAPI Python, LiteLLM/OpenAI-compatible providers, PostgreSQL via SQLAlchemy hoac Supabase client.
- Auth/DB/Storage: Supabase Auth + PostgreSQL + Supabase Storage.
- Payment: Stripe truoc, MoMo/VNPay sau.
- PDF export: giu cach Resume-Matcher dung Playwright render tu route print.
- ATS score: port logic tu `ats-screener/src/lib/engine` vao backend service de co ket qua nhat quan, test duoc, khong lo leak CV tren client.

---

## 3. Product Positioning

Ten san pham: CVision AI  
Tagline: "CV chuan - Co hoi that"  
Target market: Viet Nam, sinh vien, fresher, junior 0-3 nam kinh nghiem.  
Tone: than thien, ro rang, nhu mentor nghe nghiep; khong noi qua kieu "AI than ky".

Thong diep chinh:

- CV cua ban co the bi loai truoc khi HR doc.
- CVision AI giup CV di qua ATS, noi dung dung JD, va thuyet phuc HR hon.
- AI co goi y, nhung nguoi dung luon thay diff va co quyen chap nhan/sua/xuat ban.

North Star Metric:

- So luong "CV optimized and exported" moi tuan.

Key activation:

1. User upload CV dau tien.
2. User paste JD va chay analysis.
3. User apply it nhat 1 goi y/diff.
4. User export PDF/DOCX hoac tao cover letter.

---

## 4. Design System

### 4.1 Brand Colors

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#4F46E5` | CTA, active tab, main accent |
| `primary-dark` | `#3730A3` | hover, selected nav |
| `soft-violet` | `#EEF2FF` | light section/card background |
| `charcoal` | `#1E1B4B` | heading, admin sidebar |
| `slate` | `#64748B` | secondary text |
| `success` | `#10B981` | high score, good status |
| `warning` | `#F59E0B` | medium score, warning |
| `danger` | `#EF4444` | low score, error |
| `white` | `#FFFFFF` | app background |

### 4.2 Typography

- Display: Plus Jakarta Sans, 800, 48-72px.
- Heading: Plus Jakarta Sans, 700, 24-40px.
- Body: Inter, 400/500, 14-16px.
- Caption/Label: Inter, 400/500, 12px.
- Score/Code: JetBrains Mono, 600, 14-24px.

### 4.3 UI Principles

- Dashboard phai dense, ro rang, it mau me hon landing page.
- Analysis page la man hinh quan trong nhat, can split view desktop: CV preview ben trai, insight ben phai.
- Mobile uu tien task flow: upload, xem score, xem goi y, export. An CV preview vao modal.
- Moi AI output lien quan den thay doi CV phai co diff, confidence va nut apply/reject.

### 4.4 Component Library Can Co

Atoms:

- Button: primary, secondary, ghost, danger, icon.
- Input, textarea, select, checkbox, toggle.
- Badge/chip: success, warning, danger, info, neutral.
- Tooltip, skeleton, progress bar, avatar.

Molecules:

- Upload dropzone.
- Score card + progress ring.
- Keyword tag co trang thai: matched, missing, semantic, added.
- Resume preview card.
- Plan card.
- AI suggestion card.
- Diff row/card.

Organisms:

- Navbar public.
- Dashboard sidebar.
- Mobile bottom nav.
- Analysis split panel.
- Score dashboard.
- Resume builder/editor.
- Admin data table.
- Billing panel.

---

## 5. Target Architecture

### 5.1 Recommended Stack

| Layer | Technology | Ly do |
|---|---|---|
| Frontend | Next.js App Router + React + TypeScript | SEO, dashboard, print routes, SSR/SSG |
| Styling | Tailwind CSS + shadcn/ui + lucide-react | Nhanh, dong nhat, co component tot |
| Server API | FastAPI Python | Tai su dung Resume-Matcher backend, xu ly AI/PDF tot |
| DB | PostgreSQL via Supabase | Auth, RLS, relational SaaS |
| Auth | Supabase Auth | Email/password, Google OAuth, session |
| Storage | Supabase Storage | Luu file goc, PDF/DOCX export, signed URL |
| AI Gateway | LiteLLM + OpenAI-compatible config | Doi model linh hoat, ho tro OpenAI/Claude/Gemini/OpenRouter/Ollama |
| Payment | Stripe phase 1; MoMo/VNPay phase 2 | Stripe nhanh de MVP, local payments cho VN |
| Email | Resend | Transactional email don gian |
| Analytics | PostHog | Product analytics, funnel |
| Monitoring | Sentry | Error tracking |
| Deployment | Vercel frontend + Railway/Fly.io backend | Nhanh de ship MVP |

### 5.2 Services

Frontend app:

- Public pages: landing, pricing, blog, contact, sample.
- Auth pages: login, register, forgot password.
- User dashboard: upload, analyses, CV versions, profile, billing, settings.
- Admin dashboard: users, subscriptions, plans, discounts, analytics, emails, settings.
- Print routes: resume PDF, cover letter PDF.

Backend API:

- Auth middleware: verify Supabase JWT, role/plan check.
- Resume parser service: PDF/DOCX/text -> structured resume.
- ATS scoring service: deterministic scoring + keyword matching.
- AI analysis service: summary, HR simulation, suggestions.
- CV version generator: diff-first tailoring.
- Export service: PDF/DOCX.
- Billing webhook: Stripe/MoMo/VNPay.
- Email service: transactional + scheduled.
- Admin service: user/revenue/usage analytics.

### 5.3 Folder Structure De Xuat

```txt
cvision-ai/
  apps/
    web/
      app/
        (public)/
        (auth)/
        (dashboard)/
        admin/
        print/
      components/
      lib/
      styles/
    api/
      app/
        routers/
        services/
        prompts/
        schemas/
        models/
        workers/
      tests/
  packages/
    ats-engine/
    ui/
    shared-types/
  docs/
    product/
    technical/
    prompts/
  supabase/
    migrations/
    seed.sql
```

Neu khong muon mono-repo moi, co the bat dau tu `Resume-Matcher` va refactor:

- `Resume-Matcher/apps/frontend` -> `apps/web`.
- `Resume-Matcher/apps/backend` -> `apps/api`.
- Them `supabase/migrations`.
- Port ATS engine tu `ats-screener`.

---

## 6. Database Schema

Nen dung PostgreSQL/Supabase. Schema duoi day ket hop plan PDF, ResumeLM schema va nhu cau CVision AI.

### 6.1 Auth/User Profile

`profiles`

- `id uuid primary key references auth.users(id)`
- `email text not null`
- `full_name text`
- `avatar_url text`
- `phone text`
- `school text`
- `major text`
- `graduation_year int`
- `target_industries jsonb default '[]'`
- `role text default 'user' check role in ('user','admin','b2b_admin')`
- `plan text default 'free' check plan in ('free','premium','b2b')`
- `created_at timestamptz`
- `updated_at timestamptz`

### 6.2 Resumes

`resumes`

- `id uuid primary key`
- `user_id uuid references profiles(id)`
- `name text not null`
- `source_file_url text`
- `source_file_type text check in ('pdf','docx','text')`
- `extracted_text text`
- `parsed_data jsonb`
- `is_base_resume boolean default false`
- `processing_status text check in ('pending','processing','ready','failed')`
- `parser_warnings jsonb default '[]'`
- `created_at timestamptz`
- `updated_at timestamptz`

### 6.3 Jobs

`jobs`

- `id uuid primary key`
- `user_id uuid references profiles(id)`
- `company_name text`
- `job_title text not null`
- `job_url text`
- `job_description text`
- `industry text`
- `location text`
- `keywords jsonb default '[]'`
- `created_at timestamptz`
- `updated_at timestamptz`

### 6.4 Analyses

`analyses`

- `id uuid primary key`
- `user_id uuid references profiles(id)`
- `resume_id uuid references resumes(id)`
- `job_id uuid references jobs(id)`
- `total_score int`
- `layout_score int`
- `content_score int`
- `ats_score int`
- `keyword_score int`
- `skills_score int`
- `achievement_score int`
- `ats_platform_scores jsonb`
- `matched_keywords jsonb`
- `semantic_keywords jsonb`
- `missing_keywords jsonb`
- `suggestions jsonb`
- `hr_review jsonb`
- `probability_estimates jsonb`
- `ai_model text`
- `prompt_version text`
- `created_at timestamptz`

### 6.5 CV Versions

`cv_versions`

- `id uuid primary key`
- `user_id uuid references profiles(id)`
- `resume_id uuid references resumes(id)`
- `analysis_id uuid references analyses(id)`
- `job_id uuid references jobs(id)`
- `title text`
- `target_role text`
- `target_company text`
- `optimized_data jsonb`
- `optimized_markdown text`
- `diff_summary jsonb`
- `diff_items jsonb`
- `pdf_url text`
- `docx_url text`
- `status text check in ('draft','ready','exported','failed')`
- `created_at timestamptz`
- `updated_at timestamptz`

### 6.6 Billing

`subscriptions`

- `id uuid primary key`
- `user_id uuid references profiles(id)`
- `plan text`
- `provider text check in ('stripe','momo','vnpay','manual')`
- `provider_customer_id text`
- `provider_subscription_id text`
- `status text check in ('active','cancelled','past_due','trialing','expired')`
- `current_period_start timestamptz`
- `current_period_end timestamptz`
- `created_at timestamptz`
- `updated_at timestamptz`

`payments`

- `id uuid primary key`
- `user_id uuid`
- `subscription_id uuid`
- `provider text`
- `provider_payment_id text`
- `amount_vnd int`
- `currency text default 'VND'`
- `status text`
- `invoice_url text`
- `created_at timestamptz`

### 6.7 Usage & Audit

`usage_logs`

- `id uuid primary key`
- `user_id uuid`
- `action text check in ('upload','analysis','generate_version','export_pdf','export_docx','hr_simulation')`
- `metadata jsonb`
- `created_at timestamptz`

`admin_audit_logs`

- `id uuid primary key`
- `admin_user_id uuid`
- `action text`
- `target_type text`
- `target_id uuid`
- `metadata jsonb`
- `created_at timestamptz`

### 6.8 RLS Requirements

- User chi doc/ghi resume, job, analysis, cv_version cua chinh minh.
- Admin role duoc doc tat ca bang thong qua service role hoac RPC co kiem role.
- Payment webhook chi dung service role.
- File storage dung signed URL, khong public bucket cho CV goc.

---

## 7. Sitemap

Public:

- `/` - Landing page.
- `/pricing` - Bang gia.
- `/about` - Gioi thieu.
- `/blog` - Blog.
- `/blog/[slug]` - Chi tiet bai viet.
- `/contact` - Lien he.
- `/sample` - Demo paste CV/JD, gioi han output.

Auth:

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/verify-email`

Dashboard:

- `/dashboard` - Tong quan.
- `/dashboard/upload` - Wizard upload CV va JD.
- `/dashboard/analyses` - Danh sach phan tich.
- `/dashboard/analyses/[id]` - Chi tiet analysis.
- `/dashboard/cv-versions` - Danh sach ban CV toi uu.
- `/dashboard/cv-versions/[id]` - Chi tiet, diff, editor, export.
- `/dashboard/profile`
- `/dashboard/billing`
- `/dashboard/settings`

Admin:

- `/admin`
- `/admin/users`
- `/admin/users/[id]`
- `/admin/subscriptions`
- `/admin/products`
- `/admin/discounts`
- `/admin/analytics`
- `/admin/emails`
- `/admin/emails/preview`
- `/admin/settings`

Print/Export:

- `/print/resumes/[id]`
- `/print/cover-letter/[id]`

---

## 8. Feature Specification

### 8.1 Landing Page

Muc tieu: chuyen doi visitor thanh registered user.

Sections:

1. Navbar: logo, features, pricing, blog, login, CTA.
2. Hero: "CV cua ban bi loai truoc khi HR doc"; upload CTA; demo video/GIF.
3. Social proof: logo truong doi tac hoac placeholder neu chua co.
4. Problem: ATS, thanh tich mo ho, gui mot CV cho moi cong ty.
5. Features: cham diem, ATS analysis, CV versions, HR simulation.
6. How it works: Upload -> Chon vi tri/JD -> Nhan ket qua.
7. Interactive demo: paste CV text + JD short.
8. Testimonials.
9. Pricing preview.
10. B2B CTA.
11. Footer.

Acceptance:

- Mobile responsive tot.
- CTA upload neu chua login redirect sau login ve `/dashboard/upload`.
- Demo public khong luu CV vao DB, co rate limit.

### 8.2 Upload & Parse Wizard

Step 1: Upload CV

- Ho tro PDF, DOCX, paste text.
- Max 10MB.
- Neu parser khong lay duoc text: bao PDF scan/anh va goi y upload DOCX.
- Luu file goc vao Supabase Storage voi signed URL.

Step 2: Job Target

- Chon industry.
- Nhap job title.
- Nhap company optional.
- Paste JD hoac URL JD optional phase 2.

Step 3: Run Analysis

- Tao record `resume`, `job`, `analysis`.
- Queue/background job neu AI lau.
- Loading messages: doc CV, tach section, tim keyword, cham ATS, tao goi y.
- Redirect sang `/dashboard/analyses/[id]`.

Nen tai su dung:

- Parser tu `ats-screener/src/lib/engine/parser`.
- Parser + structured conversion tu `Resume-Matcher/apps/backend/app/services/parser.py`.

### 8.3 Analysis Detail Page

Desktop layout:

- Left: CV preview, highlight green/yellow/red.
- Right: tabs ket qua.

Tabs:

1. Score
   - Total score.
   - Breakdown: Layout, Content, ATS, Keywords, Skills, Achievements.
   - Radar/bar chart.
   - 2-3 cau nhan xet tong quan.

2. ATS
   - Overall ATS score.
   - Platform scores: Workday, Taleo, iCIMS, Greenhouse, Lever, SuccessFactors.
   - Parseability warnings: multi-column, table, image, missing sections.
   - Top actions ranked by impact.

3. Keywords
   - Matched exact.
   - Matched semantic.
   - Missing.
   - Suggested placement in CV.

4. Achievements
   - Bullet before/after.
   - STAR/CAR rewrite suggestions.
   - Warning neu AI them metric khong co trong CV goc.

5. HR View
   - Strengths.
   - Concerns.
   - 30-second recruiter impression.
   - Priority fixes.

6. Probability
   - Estimate theo company/role neu co.
   - Formula ro rang: ATS, keyword, experience, education.
   - Disclaimer: uoc tinh tham khao, khong cam ket ket qua.

CTA:

- Free: xem insight co ban, nang Premium de generate version/export.
- Premium: `Generate optimized CV`.

### 8.4 ATS Scoring Engine

Ket hop deterministic + AI:

Deterministic:

- Formatting score.
- Section completeness.
- Keyword exact/fuzzy/semantic.
- Experience bullet quantification.
- Education relevance.
- 6 ATS profile scoring.

AI:

- Summarize problem.
- Suggest rewrite.
- HR review.

Implementation:

- Port `ats-screener/src/lib/engine/scorer` vao `packages/ats-engine` hoac backend Python.
- Moi scoring function phai co unit tests.
- Ket qua scoring phai deterministic voi cung input.

### 8.5 CV Version Generator

Input:

- Original structured resume.
- Job description.
- Analysis result.
- Target role/company/industry.

Output:

- `optimized_data` structured JSON.
- `optimized_markdown`.
- `diff_items`.
- PDF/DOCX export.

Truthfulness rules:

- Khong duoc thay doi ten, email, phone, school, company, date, degree.
- Khong tao metric moi neu CV goc khong co co so.
- Co the viet lai bullet de ro hon, them tu khoa neu nguoi dung thuc su co skill do hoac skill nam trong danh sach allowed/confirmed.
- Moi thay doi phai nam trong diff va co confidence.

Nen tai su dung:

- `Resume-Matcher/apps/backend/app/services/improver.py`: diff whitelist, prompt injection sanitization, diff verifier.
- `Resume-Matcher/apps/backend/app/routers/resumes.py`: preview/confirm flow, PDF endpoint.

### 8.6 Resume Builder & Editor

Features:

- Edit structured fields.
- Reorder sections.
- Template selector.
- Live preview.
- Diff view: original vs optimized.
- Apply/reject suggestion.
- Export PDF/DOCX.

Templates phase 1:

- Single column classic.
- Modern single column.
- Two column.
- Clean/Swiss.

Nen tai su dung:

- `Resume-Matcher/apps/frontend/components/builder`.
- `Resume-Matcher/apps/frontend/components/resume`.
- `Resume-Matcher/apps/frontend/app/print`.

### 8.7 Cover Letter

Input:

- Optimized CV version.
- JD.
- Company, job title.
- Tone: professional, concise, Vietnamese/English depending user.

Output:

- Editable cover letter.
- PDF export.

Nen tai su dung:

- `Resume-Matcher/apps/backend/app/services/cover_letter.py`.
- `Resume-Matcher/apps/frontend/app/print/cover-letter`.

### 8.8 Dashboard

Default state:

- Welcome.
- Stats: CV uploaded, analyses, CV versions, exports.
- Recent analyses.
- ATS score trend.
- Recommended action.

Empty state:

- Onboarding checklist: upload CV, run first analysis, create optimized version, complete profile.

### 8.9 Billing

Plans:

- Free: 1 analysis/day, no optimized export.
- Premium monthly: 49.000 VND/month.
- Premium yearly: 470.000 VND/year or 20% discount.
- B2B: contact sales.

Implementation phase:

1. Stripe Checkout + customer portal.
2. Stripe webhook idempotency.
3. MoMo/VNPay once core product stable.

Usage limit:

- `usage_logs` check per user per day/month.
- Server-side enforcement, UI chi la hien thi.

### 8.10 Admin Panel

MVP Admin:

- Overview: total users, premium users, revenue, analyses count.
- Users: search, filter plan/status, view detail, change plan manual, lock account.
- Subscriptions: status, period, payment history.
- Products/plans: plan config, usage limits.
- Analytics: funnel upload -> analysis -> version -> export.

Phase 2:

- Discounts.
- Email templates.
- Campaign.
- B2B organization management.

### 8.11 Email System

Transactional emails:

- Welcome.
- Verify email.
- Reset password.
- Analysis finished.
- CV version ready.
- Premium welcome.
- Payment invoice.
- Subscription expiring/failed.

Marketing:

- Re-activation after 30 days inactive.
- Weekly CV tip.
- Feature announcements.

---

## 9. AI Prompt Contracts

Tat ca AI endpoints phai tra JSON co schema ro rang. Khong parse text tu do neu co the tranh.

### 9.1 Analysis Prompt

System:

```txt
You are CVision AI, a Vietnamese career mentor and ATS resume analyst.
You must be truthful, specific, and practical.
Never invent work history, education, certifications, companies, dates, metrics, or skills.
Return only valid JSON matching the requested schema.
```

User input:

```txt
Resume text:
{{resume_text}}

Parsed resume JSON:
{{parsed_resume_json}}

Job title:
{{job_title}}

Company:
{{company_name}}

Job description:
{{job_description}}

Language:
{{output_language}}
```

Output schema:

```json
{
  "summary": "string",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "suggestions": [
    {
      "category": "layout|content|ats|keyword|achievement|skill",
      "priority": "high|medium|low",
      "problem": "string",
      "recommendation": "string",
      "evidence": "string"
    }
  ],
  "hr_review": {
    "first_impression": "string",
    "strengths": ["string"],
    "concerns": ["string"],
    "priority_actions": ["string"]
  }
}
```

### 9.2 Diff-Based CV Optimization Prompt

System:

```txt
You are an expert resume editor. You improve wording and relevance without fabricating facts.
Only propose changes allowed by the schema. Do not change identity fields.
Every change must include the original text and the new text.
Return only valid JSON.
```

Allowed changes:

- Summary/objective.
- Work/project/education description bullets.
- Technical skills only if supported by original resume or explicitly present in confirmed user skills.
- Section order, if it improves role relevance.

Blocked changes:

- Name, email, phone, address.
- Company, school, degree, job title, dates.
- Metrics not present or not inferable.
- Certifications/awards not present.

Output schema:

```json
{
  "changes": [
    {
      "path": "workExperience[0].description[1]",
      "action": "replace|append|reorder|add_skill",
      "original": "string|null",
      "value": "string|array",
      "reason": "string",
      "confidence": "high|medium|low"
    }
  ]
}
```

### 9.3 HR Simulation Prompt

```txt
Act as a recruiter with 10 years of hiring experience in {{industry}}.
Read the resume for the role {{job_title}} at {{company_name}}.
Give a realistic 30-second screening impression.
Do not overpromise. Mention uncertainty where needed.
Return JSON with strengths, concerns, likely_screening_decision, and top_actions.
```

### 9.4 Probability Estimate Formula

Do not ask AI to invent probability blindly. Compute locally:

```txt
probability = 
  ats_score * 0.35 +
  keyword_score * 0.25 +
  experience_score * 0.20 +
  education_score * 0.10 +
  achievement_score * 0.10
```

Then map:

- 80-100: Strong fit.
- 65-79: Competitive but needs targeted edits.
- 50-64: Possible but weak match.
- < 50: Low match, needs major revision.

Display disclaimer:

> Day la uoc tinh dua tren CV/JD va scoring heuristic, khong phai cam ket ket qua tu nha tuyen dung.

---

## 10. Security & Compliance

Must have:

- Supabase RLS cho moi bang user-owned.
- API verify JWT moi request protected.
- Admin middleware check role.
- Rate limit AI endpoints.
- Upload validation: file type, size, extension, MIME.
- Store CV file private, signed URL expires.
- Stripe webhook signature verification.
- Prompt injection sanitization cho JD/resume text.
- Audit log cho admin action.
- Delete account xoa/mark-delete CV va file trong storage.

Should have:

- Virus scan file upload phase 2.
- CSP, HSTS, secure cookie.
- Sentry error monitoring.
- PostHog PII redaction.
- Data retention policy: xoa CV sau 90 ngay neu account deleted.

---

## 11. SEO & Performance

SEO:

- Metadata rieng cho landing, pricing, blog.
- Open Graph cho Facebook/Zalo.
- Sitemap.xml, robots.txt.
- Blog content: CV theo nganh, ATS, fresher, phong van.
- Schema JSON-LD: Organization, Product, FAQ.

Performance targets:

- Lighthouse >= 90 cho public pages.
- LCP < 2.5s.
- CLS < 0.1.
- Dashboard first load < 3s tren 4G tot.
- PDF export async neu > 5s.

Frontend:

- Dynamic import cho PDF/parser/editor nang.
- Khong bundle ATS parser vao landing page.
- Skeleton/loading states cho dashboard.

---

## 12. Current UI/Feature Audit - 23/06/2026

Pham vi audit: `cvision-app` hien tai, chua tinh DB/deploy production. Ket luan: app chua san sang thuong mai; dang o muc prototype UI + mock flow.

### 12.1 Production Blockers

1. `npm run build` dang fail.
   - `src/app/api/analyze/route.ts` import `@ai-sdk/openai` nhung package chua co trong `package.json`.
   - `src/app/api/analyze/route.ts` import default `pdf-parse`, trong ban package hien tai export khong khop voi Turbopack/Next app route.
   - Must fix truoc khi danh gia UI/tinh nang tiep.

2. `npm run lint` dang fail.
   - Loi `react/no-unescaped-entities` o register, landing, analysis detail.
   - Loi `@typescript-eslint/no-explicit-any` trong API analyze.
   - Nhieu unused imports.

3. Metadata van la Next.js default.
   - `src/app/layout.tsx` dang de `title: "Create Next App"` va description default.
   - Phai doi thanh brand CVision AI truoc khi public.

### 12.2 Feature Gaps

1. Upload/analyze flow van la mock/local-only.
   - `src/app/dashboard/upload/page.tsx` luu ket qua vao `localStorage` voi key `mockAnalysisResult`.
   - Sau khi analyze luon redirect ve `/dashboard/analyses/1`.
   - Chua co analysis id that, chua co state/history that.

2. Analysis detail page khong doc ket qua that.
   - `src/app/dashboard/analyses/[id]/page.tsx` hard-code file `NguyenVanA_Data.pdf`, role `Data Analyst`, score `72`.
   - Tabs chi la button tinh, chua co tab state/noi dung ATS/Keywords/Achievements/HR View rieng.
   - CV preview chi la placeholder, chua render text/PDF preview.

3. API analyze moi ho tro PDF, UI lai claim PDF/DOC/DOCX.
   - `accept=".pdf,.doc,.docx"` nhung route chi parse PDF.
   - Can either implement DOCX via `mammoth` or tam thoi chi cho upload PDF de dung ky vong.

4. Login/register la form tinh.
   - Button `type="button"`, khong submit, khong validate, khong error/loading state.
   - Chua co auth session, protected routes, logout.
   - Neu DB/auth lam sau, van can demo-mode auth state ro rang hoac disable claim dang nhap that.

5. Dashboard va list pages dung hard-code data.
   - Dashboard stats, analysis history, CV versions deu la sample.
   - Can chuyen sang local app state/context hoac mock API co schema on dinh neu chua lam DB.

6. CV version feature chua that.
   - Trang `cv-versions` moi la cards mau.
   - Chua co generate optimized CV, diff view, editor, apply/reject, download PDF/DOCX.

7. Admin dang sai domain.
   - Admin layout noi ve "quan ly cua hang", "don hang", "san pham", banner Hostinger.
   - Can doi thanh CVision SaaS admin: users, analyses, subscriptions, plans, discounts, analytics, emails, settings.

8. Pricing chua co interaction.
   - Buttons chua link dung flow.
   - Chua co monthly/yearly toggle, FAQ, plan comparison detail, contact B2B action.

9. Public site thieu cac trang trong sitemap.
   - Chua co `/about`, `/blog`, `/blog/[slug]`, `/contact`, `/sample`, forgot/reset password, profile/billing/settings.

### 12.3 UX/Commercial Polish Gaps

- Can replace browser `alert()` bang toast/dialog inline.
- Can co empty/loading/error states cho moi page.
- Can co mobile bottom navigation hoac drawer dung nghia; hien mobile header chi co nut "Menu" khong lam gi.
- Need consistent brand: landing dang ghi "Tro ly Su Nghiep AI" thay vi CVision AI o nhieu noi.
- Need remove fake testimonials/statements hoac gan nhan demo; khong nen noi "hang nghin sinh vien" khi chua co evidence.
- Need accessibility pass: label, focus state, keyboard navigation, contrast, button disabled reasons.
- Need responsive QA for dashboard table/card tren mobile.

### 12.4 UI Completion Backlog Before Commercial Beta

Priority P0 - must fix before any demo to user:

- Fix `npm run build`.
- Fix `npm run lint`.
- Replace app metadata/favicon/title with CVision AI.
- Remove admin ecommerce/Hostinger copy.
- Make upload/analyze/result flow use one consistent in-app data model, not hard-coded `/analyses/1`.
- Either implement DOCX parsing or remove DOC/DOCX from UI.

Priority P1 - must finish before commercial beta:

- Real tabbed analysis detail: Score, ATS, Keywords, Achievements, HR View, Probability.
- Analysis result should render actual API output.
- CV preview should render extracted text at minimum; PDF thumbnail/preview can be phase 2.
- Add client-side validation for upload size/type/required role.
- Replace alert with toast/error components.
- Implement login/register UX states; if auth DB delayed, add clear "demo mode" behavior and protect dashboard later.
- Build CV version generation UI: suggestion list, diff preview, apply/reject, save version.
- Build CV versions detail page.
- Add PDF export mock/print route if backend export not ready.
- Add dashboard empty state for new user.
- Add admin pages relevant to CVision AI: overview, users, plans, subscriptions, analytics.

Priority P2 - polish and conversion:

- Improve landing page copy to match CVision AI positioning: CV/ATS/JD/HR simulation, not generic career assistant.
- Add `/sample` interactive demo with paste CV/JD.
- Add pricing FAQ and monthly/yearly toggle.
- Add contact/B2B lead form.
- Add blog shell with 3-5 seed posts or placeholders.
- Add terms/privacy placeholder pages.
- Add mobile nav and responsive QA.

### 12.5 Recommended Frontend-Only Architecture While DB Is Delayed

Neu DB/deploy de sau, van nen lam UI/tinh nang dung hon bang local-first mock layer:

```txt
src/
  lib/
    demo-store.ts        # localStorage-backed resumes, analyses, cvVersions
    schemas.ts           # zod schemas cho analysis/result/version
    analysis-client.ts   # call /api/analyze hoac fallback demo data
  app/
    dashboard/
      analyses/[id]/page.tsx  # doc id tu demo-store
      cv-versions/[id]/page.tsx
```

Rules:

- Khong hard-code data trong page component.
- Moi page doc data qua schema/shared type.
- Demo data co nhan ro `isDemo`.
- Khi co DB sau nay chi thay `demo-store` bang API/Supabase, UI khong can viet lai.

---

## 13. Implementation Roadmap

### Phase 0 - Repository Decision & Cleanup (2-3 ngay)

Goal: chon codebase nen va tao skeleton dung.

Tasks:

- [x] Chon `Resume-Matcher` lam base hoac tao monorepo moi.
- [x] Doi brand sang CVision AI.
- [x] Xoa/vo hieu hoa phan khong can cho MVP.
- [x] Tao `.env.example` moi.
- [x] Tao docs: setup local, architecture, AI prompts.
- [x] Tao Supabase project local/remote.

Acceptance:

- `apps/web` chay duoc.
- `apps/api` chay duoc.
- Health check OK.
- README co lenh setup.

### Phase 0.5 - Current Frontend Stabilization (2-4 ngay)

Goal: bien `cvision-app` tu prototype loi build thanh frontend demo on dinh, co flow noi bo dung.

Tasks:

- Fix missing dependencies/imports in `/api/analyze`.
- Fix lint errors and unused imports.
- Doi metadata, favicon/title, README.
- Sua admin copy/domain ve CVision AI.
- Tao `schemas.ts` cho AnalysisResult, ResumeRecord, CVVersion.
- Tao `demo-store.ts` localStorage-backed.
- Upload page tao analysis id that trong local store.
- Analysis detail doc data theo `[id]`, khong hard-code.
- Analysis history doc list tu store.
- CV versions doc list tu store.
- Neu chua implement DOCX, chi cho upload PDF trong UI.

Acceptance:

- `npm run lint` pass.
- `npm run build` pass.
- Upload PDF -> analyze -> xem result theo id that.
- Refresh browser khong mat result demo.
- Khong con copy "Create Next App", "Hostinger", "quan ly cua hang".

### Phase 1 - MVP Analysis (1-2 tuan)

Goal: user login, upload CV, paste JD, nhan analysis.

Tasks:

- [x] Supabase Auth + profile.
- [x] Upload PDF/DOCX/text.
- [x] Parser -> extracted text + parsed_data.
- [x] ATS deterministic scoring.
- [x] AI analysis summary + suggestions.
- [x] Analysis detail page.
- [x] Usage limit Free: 1 analysis/day.

Acceptance:

- New user co the dang ky, upload CV va nhan score.
- Parser warning hien thi dung.
- Result luu trong DB va xem lai duoc.
- Test cho parser/scorer core.

### Phase 2 - CV Version & Export (2-3 tuan)

Goal: Premium value loop hoan chinh.

Tasks:

- [x] Diff-based CV optimizer.
- [x] Suggestion apply/reject.
- [x] Resume builder/editor.
- [x] Template selector.
- [x] Export PDF.
- [x] Cover letter generator.
- [x] CV versions list/detail.

Acceptance:

- AI khong thay doi identity fields.
- User thay diff truoc khi save.
- PDF export khong blank, layout dep.
- Co it nhat 3 template.

### Phase 3 - Billing & Admin MVP (1-2 tuan)

Goal: thu tien va quan tri co ban.

Tasks:

- [x] Pricing page.
- [x] Stripe Checkout.
- [x] Stripe webhook idempotency.
- [x] Subscription status.
- [x] Billing page.
- [x] Admin overview/users/subscriptions.
- [x] Manual plan override for admin.

Acceptance:

- Upgrade Premium unlock feature server-side.
- Webhook co retry/idempotency.
- Admin xem duoc users/revenue/analysis count.

### Phase 4 - Advanced AI & Growth (2-4 tuan)

Goal: khac biet hoa san pham.

Tasks:

- [x] HR simulation.
- [x] Probability estimate.
- [x] MoMo/VNPay.
- [x] Email transactional.
- [x] Blog CMS/MDX.
- [x] Admin analytics.
- [x] B2B organization portal.

Acceptance:

- HR review co disclaimer va output on dinh.
- Payment VN hoat dong sandbox.
- Email analysis completed gui dung.
- Blog SEO deploy duoc.

---

## 14. Concrete Reuse Map

### Tu `Resume-Matcher`

Copy/port:

- Backend routers: resumes, jobs, config, health.
- Services: parser, improver, refiner, cover_letter.
- Prompt guardrails and diff verifier.
- PDF render service.
- Frontend resume builder, templates, print routes.
- Tests quanh diff, parser, PDF render.

Refactor:

- Database layer tu TinyDB/SQLite sang PostgreSQL/Supabase.
- Auth middleware.
- Branding/i18n sang Vietnamese-first.
- Routes theo sitemap CVision AI.

### Tu `ats-screener`

Copy/port:

- Parser concepts: PDF/DOCX dynamic import, warnings for multi-column/table/image.
- Contact extractor, section detector, date extractor.
- Scoring engine: formatting, sections, experience, education, keyword matcher.
- ATS profiles.
- Unit tests cho tokenizer/TF-IDF/scorers.

Refactor:

- Convert sang shared TypeScript package neu frontend/backend cung Node, hoac port sang Python neu backend chay FastAPI.
- Sua text loi/tips sang tieng Viet.

### Tu `resume-lm`

Tham khao/copy co chon loc:

- Supabase schema va RLS pattern.
- Stripe subscription/webhook idempotency.
- Dashboard components.
- AI provider abstraction.
- Settings/profile/billing UI.

Can check license truoc khi copy truc tiep vi AGPL.

### Tu `ai-resume-analyzer`

Tham khao:

- UX upload/analyze nhe.
- Zustand store style.
- Score components.
- React Router flow neu can prototype.

Khong nen dung:

- Puter auth/storage/AI cho ban commercial production.

---

## 15. API Contract Draft

Base URL: `/api/v1`

Auth:

- `GET /me`
- `PATCH /me/profile`

Resumes:

- `POST /resumes/upload`
- `POST /resumes/from-text`
- `GET /resumes`
- `GET /resumes/{id}`
- `PATCH /resumes/{id}`
- `DELETE /resumes/{id}`

Jobs:

- `POST /jobs`
- `GET /jobs`
- `GET /jobs/{id}`

Analyses:

- `POST /analyses`
- `GET /analyses`
- `GET /analyses/{id}`
- `POST /analyses/{id}/hr-simulation`
- `POST /analyses/{id}/probability`

CV Versions:

- `POST /cv-versions`
- `GET /cv-versions`
- `GET /cv-versions/{id}`
- `PATCH /cv-versions/{id}`
- `POST /cv-versions/{id}/confirm-diff`
- `GET /cv-versions/{id}/pdf`
- `GET /cv-versions/{id}/docx`

Billing:

- `POST /billing/checkout`
- `POST /billing/portal`
- `POST /webhooks/stripe`
- `GET /billing/subscription`

Admin:

- `GET /admin/metrics`
- `GET /admin/users`
- `GET /admin/users/{id}`
- `PATCH /admin/users/{id}`
- `GET /admin/subscriptions`
- `GET /admin/analytics/funnel`

---

## 16. Testing Plan

Unit tests:

- PDF/DOCX parser.
- Section detector.
- Keyword extraction.
- ATS scoring.
- Usage limit logic.
- Diff apply/reject.
- Prompt output schema validation.
- Payment webhook idempotency.

Integration tests:

- Upload -> parse -> analysis.
- Analysis -> generate version -> confirm diff -> export PDF.
- Free limit blocks second analysis.
- Premium unlocks export.
- Admin cannot be accessed by normal user.

E2E tests:

- Register/login.
- Upload sample CV.
- Paste sample JD.
- View analysis tabs.
- Generate optimized CV.
- Export PDF.
- Upgrade checkout sandbox.

Visual/PDF QA:

- Render PDF templates desktop/mobile print.
- Check non-blank PDF.
- Check no clipped text for common CV lengths.

---

## 17. Environment Variables

Frontend:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_POSTHOG_KEY=
```

Backend:

```env
APP_ENV=development
DATABASE_URL=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=
STORAGE_BUCKET_RESUMES=resumes
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
OPENROUTER_API_KEY=
DEFAULT_AI_PROVIDER=openai
DEFAULT_AI_MODEL=gpt-4o-mini
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
SENTRY_DSN=
```

---

## 18. Definition of Done

Frontend demo duoc coi la xong, trong giai do chua lam DB/deploy, khi:

- `npm run lint` pass.
- `npm run build` pass.
- Landing, pricing, login, register, dashboard, upload, analysis detail, cv versions, admin khong con copy/template sai domain.
- Upload PDF -> analyze -> redirect sang analysis id that -> result page doc dung result vua tao.
- Refresh browser van xem lai duoc demo analyses/cv versions qua localStorage-backed store.
- Analysis detail co tabs that: Score, ATS, Keywords, Achievements, HR View, Probability.
- Khong con hard-code result chinh nhu `NguyenVanA_Data.pdf`, score `72`, role `Data Analyst` trong detail page.
- UI khong claim tinh nang chua co, vi du DOCX/PDF export/auth/payment, tru khi co badge "demo" ro rang.
- Mobile dashboard co nav su dung duoc, khong chi la nut "Menu" tinh.
- Tat ca form co validation, loading, error state; khong dung browser `alert()` cho UX chinh.

MVP duoc coi la xong khi:

- User dang ky/dang nhap duoc.
- Upload PDF/DOCX/text va parse duoc.
- Chay analysis co score + suggestions + missing keywords.
- Ket qua luu DB va xem lai duoc.
- Generate optimized CV co diff va khong fabricates identity fields.
- Export PDF hoat dong.
- Free/Premium limit enforce server-side.
- Admin xem duoc users/subscriptions/usage co ban.
- Core tests pass.
- README setup ro rang.

Commercial beta duoc coi la san sang khi:

- Stripe production ready.
- Email transactional.
- Sentry/PostHog configured.
- Privacy policy/terms co ban.
- Data deletion flow.
- Rate limit AI endpoints.
- PDF templates khong loi layout tren sample CV.

---

## 19. Prompt Cho AI Tiep Theo

Dung prompt nay de giao cho AI/dev tiep theo:

```txt
Ban dang tiep quan du an CVision AI trong thu muc source. Hay doc file:
source/CVisionAI_Implementation_Master_Plan.md

Muc tieu: xay dung SaaS CVision AI tu cac source hien co.

Quyet dinh ky thuat:
- Dung Resume-Matcher lam nen tang chinh cho frontend/backend, resume builder, AI tailoring, PDF export.
- Port ATS parser/scoring tu ats-screener.
- Tham khao Supabase/RLS/Stripe/dashboard tu resume-lm.
- Khong dung Puter cua ai-resume-analyzer cho production.

Hay lam theo thu tu:
1. Audit nhanh `cvision-app` va doc muc 12 Current UI/Feature Audit.
2. Implement Phase 0.5 truoc: fix build/lint, demo-store, upload -> analysis -> result that trong frontend.
3. Sau khi frontend demo on dinh moi implement Phase 1.
4. Moi thay doi phai co test hoac manual verification ro rang.
5. Khong fabricate CV data trong AI optimizer; bat buoc diff-based.
6. Ghi lai nhung gi da lam vao docs/progress.md.

Output mong doi dau tien:
- `npm run lint` va `npm run build` pass.
- Danh sach file da sua.
- Checklist Phase 0.5 con lai.
```

---

## 20. Immediate Next Actions

1. Sua `cvision-app` de `npm run build` pass: dependency/import `@ai-sdk/openai`, `pdf-parse`, error typing.
2. Sua `npm run lint` pass.
3. Doi metadata, README, admin copy, public copy ve CVision AI.
4. Tao frontend `demo-store` va schemas de thay hard-code/localStorage roi rac.
5. Lam upload -> analyze -> analysis detail doc data theo id that.
6. Lam history/dashboard/cv-versions doc tu demo-store thay sample hard-code.
7. Lam analysis tabs that va hien actual output: score, ATS, keywords, HR review, suggested bullets.
8. Neu chua lam DOCX, remove `.doc,.docx` khoi upload UI; neu lam thi parse DOCX bang `mammoth`.
9. Sau khi frontend demo on dinh, moi quay lai DB/Supabase/deploy/payment theo roadmap.

---

## 21. Notes & Risks

- License: `resume-lm` dung AGPL, can can nhac neu copy code truc tiep cho san pham dong nguon. Nen tham khao y tuong/schema pattern hon la copy nguyen.
- AI hallucination: day la rui ro lon nhat. Bat buoc dung diff whitelist, verifier, personal info preservation.
- PDF parsing: scan/image PDF se fail. MVP chi can detect va huong dan upload DOCX/text.
- Payment VN: MoMo/VNPay co sandbox va quy trinh doanh nghiep, nen de sau Stripe.
- Admin panel khong nen lam qua sau o MVP; uu tien user value loop.
- ATS probability khong duoc marketing nhu cam ket trung tuyen.
