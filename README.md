# Rexam AI - Advanced Government Exam Platform

Rexam AI is a modern, production-ready full-stack online examination platform featuring AI proctoring, OCR-based paper uploads, and instant performance analytics for SSC, UPSC, and Banking aspirants.

## Repository Structure

```
rexam-app/
├── frontend/             # Next.js 16 (App Router) Frontend
│   ├── src/
│   │   ├── app/          # App router pages & layouts
│   │   ├── components/   # UI & layout components
│   │   ├── context/      # React contexts (Auth, Theme)
│   │   ├── hooks/        # Custom hooks
│   │   ├── lib/          # Utilities & API client
│   │   └── types/        # TypeScript declarations
│   ├── public/           # Static assets (favicons, logos)
│   ├── next.config.ts    # Next.js configuration
│   ├── tsconfig.json     # TypeScript config for frontend
│   └── package.json      # Frontend dependencies
│
├── backend/              # Node.js + Express + Prisma Backend
│   ├── src/
│   │   ├── controllers/  # API route controllers
│   │   ├── middleware/   # Auth & error handling middlewares
│   │   ├── routes/       # Express router definitions
│   │   ├── services/     # Business logic & AI/OCR services
│   │   ├── index.ts      # Main server entry point
│   │   └── app.ts        # Express app initialization
│   ├── prisma/           # Prisma schema & seed scripts
│   ├── tsconfig.json     # TypeScript config for backend
│   └── package.json      # Backend dependencies
│
├── api/                  # Vercel serverless function entry adapter
│   └── index.ts
│
├── package.json          # Root monorepo workspace package configuration
├── vercel.json           # Vercel deployment configuration
└── README.md
```

## Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Configure Environment Variables
Copy `.env.example` to `backend/.env`:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key"
PORT=5000
```

### 3. Run Database Migrations & Seeds
```bash
npm run prisma:generate --prefix backend
```

### 4. Start Development Servers
```bash
npm run dev
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

---

## Testing

Run the full backend test suite:
```bash
npm test
```

---

## Deployment

### Frontend (Vercel)
- Deploy directly to Vercel via Git integration.
- Environment variables:
  - `NEXT_PUBLIC_API_URL`: Backend URL (e.g. `https://rexam-app.vercel.app/api`)

### Backend (Railway / Render / Docker)
- Deploy the `backend/` directory to Railway or Render.
- Build command: `npm run build`
- Start command: `npm start`
- Environment variables:
  - `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](file:///d:/Rexam---App/LICENSE) file for full details.

