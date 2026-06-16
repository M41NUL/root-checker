# Root Checker — MAINUL-X

AI-powered Android root checker. Upload your phone's About screen screenshot and AI will analyze if it can be rooted.

## Project Structure

```
root-checker/
├── api/
│   └── analyze.js      ← Vercel serverless function (Anthropic proxy)
├── public/
│   └── index.html      ← Frontend
├── vercel.json         ← Vercel config
└── README.md
```

## Deploy on Vercel

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Root Checker v1"
git remote add origin https://github.com/YOUR_USERNAME/root-checker.git
git push -u origin main
```

### Step 2 — Import on Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repo
3. Click **Deploy** (no build settings needed)

### Step 3 — Add API Key
1. In Vercel dashboard → your project → **Settings** → **Environment Variables**
2. Add:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** `sk-ant-xxxxxxxxxxxxxxxx`
3. Click **Save** → then **Redeploy**

Done! Your site will be live at `https://your-project.vercel.app`

## Developer
- GitHub: https://github.com/M41NUL
- Telegram: @mdmainulislaminfo
- WhatsApp: +8801308850528
