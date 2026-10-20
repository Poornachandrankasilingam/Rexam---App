# 🚀 Rexam AI - Vercel Deployment Guide (Vercel-ல் Deploy செய்யும் வழிகாட்டி)

Rexam AI Project-ஐ Vercel-ல் Full-Stack (Frontend Vite SPA + Backend Express Serverless Functions) ஆக Deploy செய்வதற்கான முழுமையான வழிமுறைகள் கீழே கொடுக்கப்பட்டுள்ளன.

---

## 📁 1. ஏற்கனவே தயார் செய்யப்பட்ட கோப்புகள் (Pre-configured Files)

1. **[`vercel.json`](file:///d:/Rexam---App/vercel.json)**:
   - Framework: `vite`
   - Build Command: `npm run build`
   - Output Directory: `frontend/dist`
   - Function Max Duration: `60s` (AI Question Generation & OCR timeout ஆகாமல் இருக்க)
   - Rewrites: `/api/*` மற்றும் `/health` கோரிக்கைகளை `/api/index.ts` Serverless Function-க்கு திருப்பி விடும்; பிற URL-களை React Router-க்கு (`/index.html`) திருப்பி விடும்.

2. **[`api/index.ts`](file:///d:/Rexam---App/api/index.ts)**:
   - Vercel Serverless Function entry point.
   - Build செய்யப்பட்ட Express Backend (`backend/dist/app.js`)-ஐ இணைத்து API கோரிக்கைகளை நிறைவேற்றுகிறது.

3. **[`package.json`](file:///d:/Rexam---App/package.json)**:
   - `"type": "module"` மற்றும் `"workspaces": ["backend", "frontend"]` சேர்க்கப்பட்டுள்ளது.
   - `"vercel-build"` script backend & frontend இரண்டையும் தானாகவே compile செய்யும்.

4. **[`backend/src/config/prisma.ts`](file:///d:/Rexam---App/backend/src/config/prisma.ts)**:
   - Serverless சூழலில் Database connection leak ஆகாமல் இருக்க `globalThis` caching இணைக்கப்பட்டுள்ளது.

---

## 🔑 2. Vercel-ல் சேர்க்க வேண்டிய Environment Variables

Vercel Dashboard-ல் உங்கள் Project-ஐ Import செய்த பின், **Settings ➔ Environment Variables** பகுதிக்கு சென்று கீழ்க்கண்ட மாறிகளை சேர்க்கவும்:

| Variable Name | Description / Example |
| :--- | :--- |
| `DATABASE_URL` | உங்கள் PostgreSQL Database URL (Supabase / Neon / AWS RDS) |
| `JWT_SECRET` | Auth Token Secret Key (e.g. `rexam_jwt_secret_key_2026`) |
| `REFRESH_TOKEN_SECRET` | Refresh Token Secret Key (e.g. `rexam_refresh_secret_key_2026`) |
| `NODE_ENV` | `production` |
| `GEMINI_API_KEY` | Google Gemini API Key (`gemini-3.6-flash` & `gemini-3.8-flash`) |
| `NVIDIA_API_KEY` | NVIDIA NIM API Key (`meta/llama-3.2-11b-vision-instruct`) |
| `GROQ_API_KEY` | Groq API Key (`openai/gpt-oss-120b` fallback) |
| `CLIENT_URL` | உங்கள் Vercel Domain URL (e.g. `https://rexam-ai.vercel.app`) |
| `PORT` | `5000` |

---

## 🚀 3. Step-by-Step Deploy செய்யும் முறை

### Step 1: மாற்றங்களை Git-ல் Commit செய்து Push செய்யவும்
```bash
git add .
git commit -m "Configure project for Vercel deployment with serverless API and Gemini/NVIDIA support"
git push origin main
```

### Step 2: Vercel-ல் Import செய்தல்
1. [vercel.com](https://vercel.com)-க்கு செல்லவும்.
2. **Add New... ➔ Project** கிளிக் செய்யவும்.
3. உங்கள் GitHub Repository (`Rexam---App`)-ஐ **Import** செய்யவும்.

### Step 3: Project Configuration
- **Framework Preset**: `Vite` (தானாகவே கண்டறியப்படும்)
- **Root Directory**: `./` (Root directory-ஆகவே விடவும், மாற்ற வேண்டாம்)
- **Build Command**: `npm run build` (Default)
- **Output Directory**: `frontend/dist` (Default)

### Step 4: Environment Variables Add செய்து Deploy கிளிக் செய்யவும்
மேலே உள்ள அட்டவணையில் உள்ள Keys (`DATABASE_URL`, `GEMINI_API_KEY`, `NVIDIA_API_KEY`, etc.) அனைத்தையும் Paste செய்து **Deploy** பட்டனை அழுத்தவும்.

---

## ✅ 4. Deploy முடிந்ததும் சரிபார்க்க வேண்டியவை (Verification)
1. **Frontend Home Page**: `https://<your-project>.vercel.app/`
2. **Backend API Health Check**: `https://<your-project>.vercel.app/health` ➔ `{"status": "ok"}`
3. **Public AI Question Generator**: `POST https://<your-project>.vercel.app/api/public/ai-generate`
