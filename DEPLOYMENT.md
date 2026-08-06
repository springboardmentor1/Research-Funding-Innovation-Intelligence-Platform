# Deployment Runbook

Backend → Render (free tier, includes managed Postgres).
Frontend → Vercel (free tier).

## 1. Push to GitHub

```bash
cd ~/rfip
git init
git add .
git commit -m "Initial commit: Milestones 1-4"
gh repo create rfip --private --source=. --push
```

## 2. Backend on Render

1. https://dashboard.render.com → **New +** → **Postgres**
   - Name: `rfip-db`, Plan: Free
   - Copy the **Internal Database URL** once created
2. **New +** → **Web Service** → connect your `rfip` GitHub repo
   - Root Directory: `backend`
   - Runtime: Docker
   - Plan: Free
3. Environment variables:
   - `DATABASE_URL` = Internal Database URL from step 1
   - `SECRET_KEY` = `python3 -c "import secrets; print(secrets.token_hex(32))"`
   - `ALLOWED_ORIGINS` = `*` for now
4. Deploy, note your backend URL (e.g. `https://rfip-backend.onrender.com`)
5. Seed data via Render's **Shell** tab:
```bash
   python -m app.seed_data.seed_funding
   python -m app.seed_data.seed_patents
```

## 3. Frontend on Vercel

```bash
cd ~/rfip/frontend
npm install -g vercel
vercel login
vercel
```

Then:
```bash
vercel env add VITE_API_URL production
# paste your Render backend URL when prompted
vercel --prod
```

## 4. Lock down CORS

Back in Render → backend service → Environment:
ALLOWED_ORIGINS=https://<your-vercel-url>
Redeploy for it to take effect.

## 5. Verify

- `https://<render-url>/api/health`
- `https://<render-url>/docs`
- `https://<vercel-url>` — register, log in, click through all pages
