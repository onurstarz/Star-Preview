# ⭐ Star Desk — School Dashboard

A cozy, interactive quick-launch dashboard for **Ontario Virtual School** and the
everyday tools you use for school. Log in once, then jump straight to your classroom,
school Gmail, Docs, Slides, Canva, ChatGPT, YouTube, a grammar checker, and your
current project — all from one warm little home screen.

Built with Next.js. **Two purpose-built layouts** ship in one app: a rich, decorated
desktop dashboard and a thumb-friendly mobile layout, picked automatically by screen size.

## Features

- 🔐 Simple local login (saved in your browser only — no server, nothing leaves the device)
- 🖥️📱 Separate desktop and mobile UIs, switched automatically
- ✨ Interactive 3D-tilt tool cards + floating decorative elements (mouse parallax on desktop)
- 🔎 Instant tool search (desktop)
- 🎓 One-tap links that nudge Google links toward your school account

## Customize your links

Open `app/Dashboard.jsx` and edit the two things at the top:

1. `SCHOOL_EMAIL` — your school Google account (so Gmail/Docs/Slides land on the right account).
2. The `TOOLS` array — change any name, description, icon, or URL. A couple worth setting:
   - **Ontario Virtual School** → swap in your exact course portal URL if different.
   - **Grammar Checker** → currently Grammarly; point it at whichever checker you use.
   - **My Current Project** → set its `href` to wherever your current work lives.

All tools open in a new tab on purpose — Google, ChatGPT, etc. block being embedded in a page.

## Run it

```bash
npm install
npm run dev      # open http://localhost:3000

npm run build    # production build
npm start        # serve the production build
```

## Deploy

Push to GitHub and import the repo on [Vercel](https://vercel.com) → Deploy. No
environment variables required — it's a fully client-side dashboard.
