# Biggbell AI Outreach Studio

A polished frontend prototype for matching fictional creator prospects to a campaign brief and preparing personalized outreach drafts. This is an independent demo, not an official Biggbell product. All included people, figures, and results are synthetic.

## Run locally

Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`). Demo mode is enabled by default and works without any backend.

To verify a production build:

```bash
npm run build
npm run preview
```

## Connect an n8n webhook

1. Copy `.env.example` to `.env.local`.
2. Set the single frontend environment variable:

```env
VITE_N8N_WEBHOOK_URL=https://your-n8n-host/webhook/your-path
```

3. Restart the Vite development server.
4. Turn **Demo mode** off in the campaign form and submit a brief.

The same webhook supports `find_matches_and_generate_outreach`, `classify_reply`, `assess_onboarding`, `send_approved_outreach`, and `get_latest_replies`. A normalization layer validates responses and unwraps the common n8n single-item array format. Never place credentials or API keys in a `VITE_` variable because browser environment variables are public.

If a browser request is blocked, allow the deployed frontend origin in the webhook response's CORS headers. Use the n8n production webhook URL for a published workflow; n8n test webhook URLs generally work only while listening in the editor.

## Deploy to Vercel

1. Push this directory to a Git repository and import it in Vercel, or run `npx vercel` from the project directory.
2. Vercel should detect Vite automatically. If entered manually, use:
   - Build command: `npm run build`
   - Output directory: `dist`
3. In **Project Settings → Environment Variables**, add `VITE_N8N_WEBHOOK_URL` for Production (and Preview if desired).
4. Redeploy after changing the environment variable because Vite embeds it at build time.

The deployed UI can remain in Demo mode if the variable is not set.

## Gmail test flow

- The synthetic Ashish Prajapat profile is the only send-enabled profile and is locked to `ashishprajapat0805@gmail.com`.
- A draft must first be approved, then the browser asks for final confirmation before calling Gmail.
- n8n sends from the connected `codex.ai1009@gmail.com` credential.
- The Gmail trigger checks unread replies from the authorized test address every minute, classifies them with Gemini, stores them in the `Biggbell Outreach Replies` n8n Data Table, and marks processed messages read.
- In Live mode, **Load latest Gmail reply** displays the newest stored classification in the frontend.

## Safety behavior

- Approve and Reject update local UI state; approval alone never sends.
- Editing a draft only updates local UI state.
- Real sending is restricted in n8n to the single authorized test recipient and requires explicit approval plus confirmation.
- No scraping, bulk sending, CRM, authentication, or arbitrary recipient input is included.
