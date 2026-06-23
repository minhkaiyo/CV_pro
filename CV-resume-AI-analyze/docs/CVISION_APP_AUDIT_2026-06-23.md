# CVision App Audit - 23/06/2026

Pham vi: `cvision-app` sau loat update UI moi. Chua audit production database/deploy.

## Ket Luan Nhanh

Trang web hien tai da tot hon nhieu so voi ban prototype truoc:

- Route `/` da ton tai lai qua `src/app/page.tsx`, nen loi `GET / 404` khong con la van de trong build hien tai.
- `npm run build` pass.
- `npm run lint` khong con error, chi con 5 warning unused import/variable.
- Public site da co nhieu trang: product, solutions, about, company, customers, security, pricing.
- Dashboard da co flow demo/local-first: upload, extract text, analysis, history, detail, CV versions, billing, templates, cover letter.
- Admin da duoc rebrand ve CVision tot hon ban truoc.

Trang hien tai co the dung de demo UI/tinh nang frontend. De dat muc commercial-ready, van nen xu ly cac muc ben duoi.

## Kiem Tra Ky Thuat

### Build

Command:

```bash
npm run build
```

Ket qua:

- Pass.
- Next build generate duoc 43 static/dynamic routes.
- Route `/` co trong output.
- Warning con lai:
  - `NODE_TLS_REJECT_UNAUTHORIZED=0` dang tat verify TLS trong moi truong shell. Can kiem tra env cua may/dev script, khong nen co o production.
  - Edge runtime warning tren mot page/API. Khong phai blocker nhung can theo doi neu can static generation.

### Lint

Command:

```bash
npm run lint
```

Ket qua:

- 0 errors.
- 5 warnings:
  - `src/app/(public)/product/page.tsx`: `Image` unused.
  - `src/app/dashboard/layout.tsx`: `useEffect` unused.
  - `src/app/page.tsx`: `FileText` unused.
  - `src/app/page.tsx`: `Zap` unused.
  - `src/components/public-nav.tsx`: `pathname` assigned but unused.

De xuat: don 5 warning nay de build log sach hon truoc khi demo cho doi tac.

## Route & Link Audit

### Routes Dang Co

Quan trong:

- `/`
- `/pricing`
- `/login`
- `/register`
- `/dashboard`
- `/dashboard/upload`
- `/dashboard/analyses`
- `/dashboard/analyses/[id]`
- `/dashboard/cv-versions`
- `/dashboard/billing`
- `/dashboard/cover-letter`
- `/dashboard/templates`
- `/admin`
- `/admin/products`
- `/product/*`
- `/solutions/*`
- `/about`
- `/company`
- `/customers`
- `/security`

### Link Noi Bo Dang Tro Toi Trang Chua Co

Nen them page hoac doi link:

- `/admin/analytics`
- `/admin/customers`
- `/admin/orders`
- `/admin/products/categories`
- `/admin/settings`
- `/admin/subscriptions`
- `/dashboard/profile`
- `/forgot-password`
- `/privacy`
- `/terms`

Muc can lam truoc:

1. Tao `/privacy` va `/terms` vi public footer/auth thuong can.
2. Tao `/forgot-password` hoac an link trong login.
3. Tao `/dashboard/profile` hoac doi link sidebar.
4. Admin: neu chua lam day du, an cac link con thieu hoac tao placeholder "Coming soon" de tranh 404.

## Diem Tot Hien Tai

### Public Website

- Visual direction rat kha: dark premium, nav kieu product SaaS, nhieu trang product/solutions rieng.
- Product pages dung component `ProductPage`, co kha nang scale noi dung tot.
- Copy da gan dung voi CVision AI hon: ATS Scanner, Smart Editor, AI Agent, CV Versions, Workflows.
- Landing `/` hien nam o `src/app/page.tsx`, khong con phu thuoc `(public)/page.tsx`.

### Dashboard

- Da co localStorage-backed store trong `src/lib/store.ts`.
- Upload flow da co:
  - File validation.
  - Extract text route.
  - Thu FastAPI backend.
  - Thu Next AI route.
  - Fallback demo neu AI/backend chua cau hinh.
- Analysis history co nhan `demo`.
- Analysis detail co data theo id, khong con hard-code mot ket qua duy nhat nhu ban cu.
- Cover letter co demo fallback, tot cho frontend demo.

### API Layer

- `src/lib/api.ts` da co client layer tap trung.
- Co typing co ban cho analyses, CV versions, subscription.
- Next API da tach:
  - `/api/v1/extract`
  - `/api/v1/analyses`
  - `/api/v1/upload`

## Rủi Ro & Diem Can Nang Cap

### P0 - Nen Lam Ngay

1. Don 5 lint warnings.

Ly do: khong blocker nhung rat de fix, lam log sach va tranh no tich tu.

2. Them cac route dang bi link 404.

Toi thieu nen tao placeholder page:

- `/privacy`
- `/terms`
- `/forgot-password`
- `/dashboard/profile`
- `/admin/analytics`
- `/admin/customers`
- `/admin/orders`
- `/admin/products/categories`
- `/admin/settings`
- `/admin/subscriptions`

3. Kiem tra `NODE_TLS_REJECT_UNAUTHORIZED=0`.

Neu bien nay dang duoc set trong terminal/system env, bo di truoc khi deploy. Tat TLS verification la rui ro bao mat.

4. Fix `src/lib/supabase.ts` fallback dummy key.

Hien tai:

```ts
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_anon_key';
```

Nen doi sang fail rõ trong production, vi dummy key lam loi kho debug:

```ts
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  // only allow demo mode in development
}
```

### P1 - Commercial Demo Polish

1. Chuan hoa encoding/comment trong mot so file.

Mot so command PowerShell hien mojibake khi `Get-Content`, nhung Node/doc build doc duoc UTF-8. De chac chan, nen dam bao editor save UTF-8 va khong copy text tu terminal encoding loi.

2. Them "Demo mode" indicator ro rang hon.

Hien upload co fallback demo khi backend/AI chua cau hinh. Tot cho demo, nhung nen co banner nho trong dashboard:

- "Demo mode: ket qua duoc tao cuc bo, chua luu cloud."
- Khi co backend that thi an banner.

3. Privacy cho localStorage.

Vi CV text/analysis co the nhay cam, neu luu localStorage:

- Khong luu raw CV text neu khong can.
- Them nut "Xoa du lieu demo".
- Hien notice tren dashboard demo.

4. Route upload Cloudinary can validate file.

`/api/v1/upload` hien upload raw len Cloudinary neu co key. Nen them:

- Max file size server-side.
- MIME allowlist.
- Extension allowlist.
- Khong public file CV neu chua co policy ro.

5. API analysis prompt can co guardrails manh hon.

`/api/v1/analyses` nen them:

- Prompt injection guard.
- Yeu cau "khong tao metric/kinh nghiem/skill khong co trong CV".
- Output schema voi category enum chat hon.
- Fallback khi OpenAI JSON invalid.

### P2 - Feature Upgrade

1. CV version generation thuc su.

Hien CV versions UI co kha nang da co shell, nhung can flow:

- Tu analysis -> generate version.
- Diff view.
- Apply/reject.
- Save version.
- Export PDF/DOCX.

2. Profile/Billing/Auth real integration.

Khi lam database sau:

- Firebase hoac Supabase auth can chon mot, tranh song song neu khong can.
- Protected route middleware.
- Logout real.
- User plan state dung de unlock feature.

3. Admin modules.

Admin nen co:

- Users.
- Analyses.
- Subscriptions.
- Products/plans.
- Analytics.
- Settings.

Neu chua co backend, tao placeholder co empty state dep de khong 404.

4. E2E smoke test.

Nen them Playwright test toi thieu:

- `/` load ok.
- `/pricing` load ok.
- `/dashboard/upload` load ok.
- Upload invalid file -> error.
- Missing role -> error.
- Demo fallback -> analysis detail page.

## File/Code Notes

### `src/app/page.tsx`

- Landing route chinh hien co.
- Lint warning: `FileText`, `Zap` unused.
- Dang co interactive/demo content. Nen giu ban design hien tai cua ban, khong thay bang homepage toi gian.

### `src/components/public-nav.tsx`

- Lint warning: `pathname` unused.
- Co the dung `pathname` de active nav hoac xoa import/use.

### `src/app/(public)/product/page.tsx`

- Lint warning: `Image` unused.
- Xoa import neu khong dung.

### `src/app/dashboard/layout.tsx`

- Lint warning: `useEffect` unused.
- Sidebar co link `/dashboard/profile` nhung route chua co.

### `src/app/dashboard/upload/page.tsx`

- Flow da tot hon.
- Co fallback demo hop ly.
- Nen xem lai step `uploading`: state co khai bao nhung chua thay duoc set trong flow hien tai.

### `src/app/api/v1/extract/route.ts`

- Ho tro txt/doc/docx/pdf.
- Can kiem tra `pdf-parse` tren production runtime sau deploy.
- Nen them file size guard server-side.

### `src/app/api/v1/upload/route.ts`

- Can policy ro ve privacy khi upload CV len Cloudinary.
- Nen validate file type/size server-side.

## De Xuat Checklist Tiep Theo

### 30 phut

- Xoa unused imports/vars.
- Them placeholder `/privacy`, `/terms`, `/forgot-password`, `/dashboard/profile`.
- An hoac tao placeholder cho admin child routes dang 404.

### 1-2 gio

- Them "Demo mode" banner + "Clear demo data".
- Them file validation server-side cho `/api/v1/upload` va `/api/v1/extract`.
- Chuan hoa README tu default Next.js sang CVision setup.

### 1 ngay

- Hoan thien CV versions flow local-first.
- Tao PDF preview/export mock hoac print route.
- Them Playwright smoke tests.

## Trang Thai Hien Tai

Danh gia theo muc tieu "UI va tinh nang frontend truoc, DB/deploy sau":

- Visual/public site: 8/10.
- Dashboard shell: 7/10.
- Demo analysis flow: 7/10.
- Commercial readiness without DB: 6.5/10.
- Production technical hygiene: 7.5/10 vi build pass nhung con missing routes/warnings.

Uu tien tiep theo: sua missing routes + lint warnings, sau do them demo/privacy polish truoc khi tiep tuc build feature moi.

