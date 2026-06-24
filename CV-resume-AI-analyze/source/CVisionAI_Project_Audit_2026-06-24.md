# CVisionAI Project Audit - 2026-06-24

## Executive Summary

Project frontend hien tai build duoc va giao dien da co nen tang tot de tiep tuc thuong mai hoa. Tuy nhien, codebase chua dat muc "hoan hao de commercial" vi van con mot so van de blocking o auth/API contract, lint hygiene, tai lieu du an, va mot vai khu vuc dang mang tinh demo hon la production.

Muc tieu uu tien hien tai:

1. Dong bo auth giua frontend va backend.
2. Sua cac API contract dang sai thuc te.
3. Don dep lint errors/warnings de codebase sach va de bao tri.
4. Chuan hoa docs/branding/developer onboarding.
5. Sau do moi tinh tiep den polish UI, animation, loading/error states, va telemetry.

---

## Current Status

### Frontend

- `next build`: pass
- `eslint`: fail (`7 errors`, `18 warnings`)
- Route `/` da ton tai trong build output, nen loi `GET / 404` truoc do khong con la van de route-missing o state hien tai.

### Backend

- FastAPI app bootstrapped day du router.
- Co auth guard cho nhieu route.
- Tuy nhien backend metadata/branding va mot so contract van chua dong bo voi frontend.

---

## Blocking Findings

### 1. Frontend dang dung Firebase auth, backend lai verify Supabase JWT

Day la van de nghiem trong nhat trong toan bo project.

#### Frontend

- `cvision-app/src/lib/firebase.ts`
- `cvision-app/src/lib/api.ts`
- `cvision-app/src/app/(auth)/login/page.tsx`
- `cvision-app/src/app/(auth)/register/page.tsx`

Frontend dang:

- login/register bang Firebase Auth
- tao profile bang Firestore
- gui `Firebase ID token` qua header `Authorization: Bearer ...`

#### Backend

- `backend/app/auth.py`

Backend dang:

- verify token bang `supabase.auth.get_user(token)`
- doc `profiles` va `usage_logs` tu Supabase

#### Risk

- User dang nhap thanh cong o frontend nhung backend van co the reject request.
- Usage limit, admin, billing, analyses, CV versions co nguy co khong hoat dong on dinh khi di qua backend.
- Day la blocker thuc su truoc khi commercial.

#### Required fix

Chon 1 trong 2 huong va thong nhat toan he thong:

1. Dung Firebase end-to-end.
2. Dung Supabase end-to-end.

Khong nen de frontend Firebase + backend Supabase nhu hien tai.

---

### 2. Admin update plan bi lech contract frontend/backend

#### Frontend

- `cvision-app/src/lib/api.ts`

Frontend goi:

- `PATCH /admin/users/{id}/plan`
- body JSON: `{ plan }`

#### Backend

- `backend/app/routers/admin.py`

Backend dinh nghia:

- `async def override_user_plan(id: str, plan: str, admin_id: str = Depends(verify_admin))`

Trong FastAPI, `plan: str` o day se duoc hieu la query param, khong phai JSON body.

#### Risk

- Frontend admin action co kha nang fail 422 hoac khong update dung nhu mong doi.

#### Required fix

Chuyen backend sang Pydantic body model cho `plan`, hoac doi frontend sang query param. Nen uu tien body model.

---

### 3. Admin dashboard metrics dang hard-code

#### File

- `backend/app/routers/admin.py`

`/admin/metrics` hien tra ve so lieu co dinh:

- `total_users: 1250`
- `premium_users: 150`
- `total_revenue_vnd: 45000000`
- `analyses_count: 5400`

#### Risk

- Giao dien admin trong demo thi dep, nhung production lai hien thi "fake operational data".
- Rat de gay mat niem tin khi mang di demo/ban hang.

#### Required fix

- Tinh metrics that su tu data store.
- Neu chua lam data layer, it nhat phai gan co `demo/mock` ro rang de tranh nham lan.

---

## Code Quality Findings

### 4. Frontend lint dang fail

#### Errors

- `cvision-app/src/app/(auth)/login/page.tsx`
  - `48:19` unexpected `any`
  - `64:19` unexpected `any`
  - `325:15`, `325:122` unescaped quotes
- `cvision-app/src/app/(auth)/register/page.tsx`
  - `54:19` unexpected `any`
  - `272:71` unescaped quote
- `cvision-app/src/components/AIChatWidget.tsx`
  - `73:21` unexpected `any`

#### Warnings

Con 18 warning unused imports/state/variables trong admin, dashboard, landing page, upload page, hook upload.

#### Risk

- Build van pass, nhung codebase chua sach.
- Kho maintain, kho handoff cho AI/dev khac.
- De lam mat confidence truoc khi deploy production.

#### Required fix

- Xoa unused imports/state.
- Thay `any` bang typed error handling.
- Sua text JSX co dau nhay de qua lint.

---

### 5. AI chat route chua validate input du chat

#### Files

- `cvision-app/src/app/api/v1/chat/route.ts`
- `cvision-app/src/components/AIChatWidget.tsx`

#### Issues

- `history` dang cast truc tiep thanh `Array<{ role: string; text: string }>` ma khong validate.
- Widget gui ca object message day du (`id`, `timestamp`, `role`, `text`), backend dang tu map tay.
- Error handling van dung `any`.
- Import `Loader2` dang thua.

#### Risk

- De vo contract khi widget/chat UI duoc nang cap them.
- Kho mo rong chat memory, persistence, streaming, attachment support.

#### Recommended upgrade

- Dung schema validation (`zod` hoac equivalent).
- Normalize message payload ngay tu client.
- Tach `ChatRequest`, `ChatMessage`, `ChatResponse` type ro rang.

---

### 6. Encoding / text consistency chua sach

Khi doc source truc tiep, nhieu comment/text dang hien thi dau hieu encoding khong dong nhat.

#### Risk

- De gay loi khi mo rong docs/script/tooling.
- De phat sinh text vo nghia o mot so terminal/editor/deploy environment.

#### Recommended upgrade

- Chuan hoa file text sang UTF-8.
- Kiem tra lai cac file auth/chat co string tieng Viet.

---

## Product/Commercial Readiness Gaps

### 7. README frontend van la boilerplate mac dinh

#### File

- `cvision-app/README.md`

#### Current state

Van la README mac dinh cua `create-next-app`.

#### Risk

- Handoff cho AI/dev khac rat mat context.
- Kho setup nhanh.
- Khong phan anh duoc architecture, env vars, scripts, deployment assumptions.

#### Required fix

README moi nen co:

- Project overview
- Architecture map
- Env vars frontend/backend
- Auth choice
- Local setup
- Build/lint/test commands
- API surface chinh
- Deployment notes

---

### 8. Backend branding chua doi het sang CVisionAI

#### File

- `backend/app/main.py`

#### Current state

FastAPI app van de:

- `title="Resume Matcher API"`
- `description="AI-powered resume tailoring for job descriptions"`
- root response `name: "Resume Matcher API"`

#### Risk

- Branding lech khi mo `/docs`, health root, API inspection.
- Khong tot cho thuong mai va onboarding.

#### Required fix

- Doi toan bo metadata sang brand CVisionAI nhat quan.

---

### 9. Khong co frontend test script

#### Current state

- `npm run test` fail vi khong co script.

#### Risk

- Moi thay doi UI/feature de gay vo ma khong co net an toan.

#### Recommended upgrade

Toi thieu nen co:

- component smoke tests
- API client tests
- route/page render smoke tests

Neu uu tien cao hon:

- Playwright flow cho login, upload, dashboard, chat

---

## UI/UX Assessment

### Things already good

- Visual direction da co ban sac rieng.
- Glass styling co potential rat tot.
- Dashboard layout tong the on.
- Auth pages co muc do polish kha.
- Build output cho thay route structure da ro rang hon truoc.

### Things still worth upgrading

1. Chuan hoa contrast tren cac layer glass.
2. Giam so luong import/state thua trong dashboard shell.
3. Kiem tra lai empty/loading/error states cho upload, analyses, CV versions, billing.
4. Kiem tra responsive tai cac breakpoint 1280, 1024, 768, 390.
5. Kiem tra consistency cua CTA labels, icon sizing, card padding, heading hierarchy.

---

## Recommended Priority Roadmap

### P0 - Must fix before calling it production-ready

1. Dong bo auth stack Firebase/Supabase.
2. Sua contract `admin/users/{id}/plan`.
3. Clean 100% lint errors.
4. Thay hard-coded admin metrics bang data that su hoac mock mode ro rang.
5. Chuan hoa README va env setup.

### P1 - Strongly recommended next

1. Add schema validation cho chat/API payloads.
2. Don dep warning lint con lai.
3. Chuan hoa encoding UTF-8.
4. Chuan hoa backend branding.
5. Add smoke tests cho frontend critical flows.

### P2 - Product polish

1. Hoan thien empty/loading/error UX.
2. Persist chat session neu AI assistant la feature quan trong.
3. The hien data freshness / last sync / last analysis metadata.
4. Bo sung audit log, analytics hooks, event tracking cho user journey.

---

## Practical Handoff Instructions for the Next AI

Neu giao cho AI khac lam tiep, nen yeu cau theo thu tu sau:

1. Audit va unify auth architecture giua frontend va backend.
2. Fix API contracts sai, dac biet admin update plan.
3. Make frontend lint clean with zero errors.
4. Replace demo admin metrics with real queries or explicit mock mode.
5. Rewrite README and env documentation.
6. Run build + lint + basic test verification after each phase.

---

## Final Verdict

Project hien tai **co the demo dep**, nhung **chua nen xem la san sang commercial** neu chua sua cac diem P0 o tren.

Neu can xep muc do:

- UI direction: tot
- Feature surface: kha day
- Production discipline: trung binh
- Commercial readiness right now: chua dat

Ly do chinh khong nam o "web xau hay thieu tinh nang", ma nam o **auth/data contract va do sach cua codebase**. Sua dung cac diem nay xong, project se tang chat luong rat nhanh.
