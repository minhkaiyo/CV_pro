# Setup Local
## 1. Yêu cầu hệ thống
- Node.js 18+
- Python 3.10+
- Docker (để chạy Supabase local)

## 2. Cài đặt Frontend (cvision-app)
```bash
cd cvision-app
npm install
npm run dev
```

## 3. Cài đặt Backend (backend)
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 4. Cài đặt Supabase
```bash
npx supabase start
```
Cấu hình `.env` cho frontend và backend bằng các key sinh ra từ local Supabase.
