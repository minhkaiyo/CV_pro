-- 6.1 Auth/User Profile
create table profiles (
  id uuid primary key references auth.users(id),
  email text not null,
  full_name text,
  avatar_url text,
  phone text,
  school text,
  major text,
  graduation_year int,
  target_industries jsonb default '[]',
  role text default 'user' check (role in ('user','admin','b2b_admin')),
  plan text default 'free' check (plan in ('free','premium','b2b')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6.2 Resumes
create table resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  name text not null,
  source_file_url text,
  source_file_type text check (source_file_type in ('pdf','docx','text')),
  extracted_text text,
  parsed_data jsonb,
  is_base_resume boolean default false,
  processing_status text check (processing_status in ('pending','processing','ready','failed')),
  parser_warnings jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6.3 Jobs
create table jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  company_name text,
  job_title text not null,
  job_url text,
  job_description text,
  industry text,
  location text,
  keywords jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6.4 Analyses
create table analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  resume_id uuid references resumes(id),
  job_id uuid references jobs(id),
  total_score int,
  layout_score int,
  content_score int,
  ats_score int,
  keyword_score int,
  skills_score int,
  achievement_score int,
  ats_platform_scores jsonb,
  matched_keywords jsonb,
  semantic_keywords jsonb,
  missing_keywords jsonb,
  suggestions jsonb,
  hr_review jsonb,
  probability_estimates jsonb,
  ai_model text,
  prompt_version text,
  created_at timestamptz default now()
);

-- 6.5 CV Versions
create table cv_versions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  resume_id uuid references resumes(id),
  analysis_id uuid references analyses(id),
  job_id uuid references jobs(id),
  title text,
  target_role text,
  target_company text,
  optimized_data jsonb,
  optimized_markdown text,
  diff_summary jsonb,
  diff_items jsonb,
  pdf_url text,
  docx_url text,
  status text check (status in ('draft','ready','exported','failed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6.6 Billing
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  plan text,
  provider text check (provider in ('stripe','momo','vnpay','manual')),
  provider_customer_id text,
  provider_subscription_id text,
  status text check (status in ('active','cancelled','past_due','trialing','expired')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  subscription_id uuid references subscriptions(id),
  provider text,
  provider_payment_id text,
  amount_vnd int,
  currency text default 'VND',
  status text,
  invoice_url text,
  created_at timestamptz default now()
);

-- 6.7 Usage & Audit
create table usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  action text check (action in ('upload','analysis','generate_version','export_pdf','export_docx','hr_simulation')),
  metadata jsonb,
  created_at timestamptz default now()
);

create table admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references profiles(id),
  action text,
  target_type text,
  target_id uuid,
  metadata jsonb,
  created_at timestamptz default now()
);
