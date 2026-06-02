# Storyboard — Script → Visual Concept Generator

Paste a script or scene description and get an AI-generated storyboard of minimalist stickman illustrations.

## How it works

1. You enter text in the sidebar
2. The app sends it to `/api/extract-keywords` — a Next.js server-side route
3. That route calls the Anthropic API **on the server** (your key is never in the browser)
4. Keywords are returned to the client, which generates images via [Pollinations.ai](https://pollinations.ai) (free, no key needed)

## Deploy to Vercel (2 minutes)

```bash
# 1. Unzip and enter the folder
unzip storyboard.zip && cd storyboard

# 2. Push to GitHub
git init && git add . && git commit -m "init"
gh repo create storyboard --public --push
# or create the repo at github.com manually and follow their push instructions

# 3. Go to vercel.com → New Project → import your repo → Deploy
```

**Add your API key on Vercel:**
- Project Settings → Environment Variables
- Name: `ANTHROPIC_API_KEY`
- Value: your key (`sk-ant-...`)
- Redeploy after saving

## Local development

```bash
cp .env.example .env.local
# Edit .env.local and add your key

npm install
npm run dev
# Open http://localhost:3000
```

## Security notes

- The Anthropic API key lives only in `process.env.ANTHROPIC_API_KEY` on the server
- It is never bundled into client JavaScript
- The `/api/extract-keywords` route validates input and handles errors gracefully
- Auth is localStorage-based (demo-grade); for production consider NextAuth or Clerk
