# CVisionAI Frontend

Next.js frontend cho CVisionAI: dashboard phan tich CV, cover letter, CV versions, billing, admin, va cac landing/product pages.

## Current Status

- `npm run lint`: pass
- `npm run build`: pass
- UI/route structure: on dinh
- Auth architecture: da chuyen frontend sang Supabase de dong bo voi backend

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- Supabase JS client

## Project Structure

```text
src/
  app/
    (auth)/              login, register, forgot-password
    (public)/            landing, product, solutions, company, customers
    admin/               admin dashboard pages
    dashboard/           user workspace
    api/v1/              Next-side helper APIs (chat, analyses, extract, upload)
  components/            shared UI blocks
  hooks/                 upload and client hooks
  lib/                   api client, auth helpers, stores, types
```

## Local Development

### Frontend

```bash
npm install
npm run dev
```

Frontend mac dinh chay tai `http://localhost:3000`.

### Backend

Frontend ky vong backend FastAPI tai:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Neu backend chua chay, mot so luong se roi ve demo/local mode.

## Environment Variables

### Required for normal frontend usage

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### AI chat

```env
CVISION_GEMINI_KEY=...
# or
GEMINI_API_KEY=...
```

## Key Commands

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Functional Areas

### User Workspace

- Dashboard overview
- Upload CV + JD
- ATS analysis history
- CV versions
- Cover letter generation
- Billing/profile

### Admin

- Metrics
- User list
- Plan override
- Product/category mock management pages

### Public Pages

- Homepage
- Product detail pages
- Solutions pages
- Pricing/privacy/terms/company/customers

## API Notes

Frontend chinh hien tai goi backend FastAPI cho:

- `/analyses`
- `/cv-versions`
- `/advanced-ai/cover-letter`
- `/billing/*`
- `/admin/*`
- `/health`
- `/resumes/improve/*`

Next.js local API routes dang xu ly bo tro cho:

- `/api/v1/chat`
- `/api/v1/analyses`
- `/api/v1/extract`
- `/api/v1/upload`

## Commercial Readiness Notes

Nhung phan da duoc lam sach:

- Admin update-plan contract da dong bo body JSON
- Frontend lint da sach
- Frontend build da pass
- Chat payload da duoc type/validate chat che hon
- Backend branding API da doi sang CVisionAI

Nhung phan con lai can lam tiep:

1. Kiem tra va chot policy/RLS cho `profiles`, `usage_logs`, `subscriptions`
2. Thay hard-coded admin metrics bang data that su
3. Bo sung test script va smoke tests
4. Chuan hoa env + deployment flow

## Biggest Known Risk

Commercial risk lon nhat hien tai khong con nam o auth split nua, ma nam o:

- chua khoa chat Supabase env/deploy flow
- admin metrics van la mock data
- chua co test automation cho core flows

## Suggested Next Work Order

1. Chot RLS + auth deployment checklist
2. Replace admin demo metrics
3. Add smoke tests
4. Final deploy checklist
