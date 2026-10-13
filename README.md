# Biggbell AI Outreach Studio

Biggbell AI Outreach Studio is an end-to-end creator outreach and onboarding demo. It accepts a campaign brief, matches sample creators, generates personalized outreach drafts through n8n and Gemini, supports human approval before a controlled Gmail test send, classifies creator replies, and assesses onboarding completeness.

This is an independent prototype built to demonstrate an automation concept for Biggbell. It is not an official Biggbell product. Creator profiles and campaign metrics are synthetic, except for the explicitly authorized test email accounts described below.

## Live links

- Frontend: [https://bigbell.vercel.app](https://bigbell.vercel.app)
- Repository: [https://github.com/Ashish-prajapat08/bigbell](https://github.com/Ashish-prajapat08/bigbell)
- n8n workflow: [business08.app.n8n.cloud/workflow/77G3ssapsubMtxqw](https://business08.app.n8n.cloud/workflow/77G3ssapsubMtxqw)

## Current status

The controlled demo happy path is implemented:

- Validated campaign brief form.
- Demo mode with deterministic fictional data.
- Live mode connected to a configurable n8n webhook.
- Gemini-powered creator matching and personalized outreach.
- Editable drafts with approve/reject controls.
- Separate, confirmation-gated Gmail test sending.
- Gmail reply polling through n8n.
- AI reply classification into four outcomes.
- Latest classified Gmail reply retrieval in the UI.
- Automatic onboarding prefill after an `Interested` reply.
- Fast deterministic onboarding assessment.
- Responsive UI and loading, empty, validation, network, and workflow error states.
- Vercel deployment with environment-based configuration.

Local verification commands pass:

```bash
npm run lint
npm run build
```

## End-to-end user journey

### 1. Create a campaign

Enter the brand name, description, niche, audience/geography, INR budget, goal, and preferred platform. Click **Find matches & generate outreach**.

In Demo mode, the browser creates deterministic fictional results. In Live mode, it sends the brief to n8n, where Gemini scores the sample creators and writes personalized drafts.

### 2. Review matches and drafts

Each result includes the creator's profile, audience metrics, estimated rate, match score/reason, personalized subject/message, and workflow status.

- **Edit draft** modifies the subject/message in local UI state.
- **Reject** marks the draft rejected locally.
- **Approve** marks the draft approved locally.

Approval does not send an email. It is intentionally only a human-review step.

### 3. Send the authorized Gmail test

Only the synthetic `Ashish Prajapat` profile is send-enabled. In Live mode, approving it reveals **Send authorized test email**. Clicking that button opens a final browser confirmation before n8n is called.

Authorized test path:

- Sender: `codex.ai1009@gmail.com`
- Recipient: `ashishprajapat0805@gmail.com`
- Creator ID: `creator-test-ashish`
- Handle: `@ashishcreates`

n8n validates the recipient, approval flag, and creator identity. Editing frontend data alone must not enable arbitrary recipients.

### 4. Capture and classify a reply

Reply from the authorized creator Gmail account to the received email. The n8n Gmail Trigger polls unread replies, extracts the reply, classifies it with Gemini, stores the result in an n8n Data Table, and marks the processed message read.

In the UI, **Load latest Gmail reply** retrieves the newest stored record and shows its classification, confidence, reasoning, and suggested next action.

The **Classify reply** button instead classifies whatever text is currently in the textarea. Use it for manually pasted replies or to re-run classification. The supported outcomes are:

- `Interested`
- `Rejected`
- `Pricing Query`
- `More Information`

### 5. Start onboarding

Onboarding begins automatically only when Reply Intelligence returns `Interested`. This differs from approving an outreach draft: approval means the operator allows sending; `Interested` means the creator has agreed to proceed.

The UI then auto-fills known data:

- Full name
- Email
- Platform
- Creator handle
- Country when derivable from the campaign audience
- Content format based on platform

`Agreed rate` and `Delivery deadline` remain empty until real agreed values exist. The app never treats an estimated rate or campaign budget as an agreement.

Click **Assess onboarding status** to receive `Pending`, `In Progress`, or `Completed`, plus missing fields and the suggested next action. This assessment is deterministic, not AI-based, for speed, consistency, and cost control.

## Demo mode vs Live mode

### Demo mode ON

- Uses fictional creators from `src/data.ts`.
- Generates deterministic matches/drafts locally.
- Classifies pasted replies using simple local rules.
- Assesses onboarding locally.
- Never calls n8n or Gmail.

### Demo mode OFF

- Sends actions to `VITE_N8N_WEBHOOK_URL`.
- Uses n8n/Gemini for matching, generation, and classification.
- Loads replies captured by the Gmail Trigger.
- Allows the authorized Gmail test after approval and confirmation.
- Uses n8n for deterministic onboarding assessment.

When the toggle is grey and positioned left, Demo mode is OFF. The integration card should say **Webhook configured** and show a green indicator.

## Architecture

```text
React + TypeScript UI on Vercel
            |
            | POST JSON with an action field
            v
      n8n production webhook
            |
            +--> sample creator matching + Gemini draft generation
            +--> Gemini manual reply classification
            +--> confirmation-gated Gmail test send
            +--> latest stored reply lookup
            +--> deterministic onboarding assessment

Authorized Gmail reply
            |
            v
      n8n Gmail Trigger
            |
            +--> Gemini classification
            +--> n8n Data Table storage
            +--> mark message read
            v
      frontend loads latest reply
```

## Technology

- React, TypeScript, and Vite
- Lucide React icons
- Responsive plain CSS
- ESLint
- n8n Cloud
- Gemini configured as an n8n credential/model
- Gmail configured as an n8n OAuth credential
- n8n Data Table for classified replies
- Vercel hosting

No model or Gmail API key is stored in the frontend. The browser only receives the public webhook URL.

## Repository structure

```text
.
├── Biggbell_Codex_Master_Context.md  # Original requirements/source of truth
├── README.md                         # Complete project handoff
├── src/
│   ├── App.tsx                       # Main UI, state, and user actions
│   ├── api.ts                        # n8n calls and response normalization
│   ├── data.ts                       # Initial campaign and demo creators
│   ├── types.ts                      # Shared TypeScript contracts
│   ├── styles.css                    # Responsive visual system
│   ├── main.tsx                      # React entry point
│   └── vite-env.d.ts                 # Vite typings
├── .env.example                      # Public webhook configuration example
├── package.json                      # Commands and dependencies
├── vite.config.ts                    # Vite configuration
└── tsconfig*.json                    # TypeScript configuration
```

## Local development

Requirements: Node.js 20+ and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

For Live mode, use:

```env
VITE_N8N_WEBHOOK_URL=https://business08.app.n8n.cloud/webhook/biggbell-outreach-demo
```

Restart Vite after changing environment variables.

Verification and production preview:

```bash
npm run lint
npm run build
npm run preview
```

## Vercel deployment

1. Import the GitHub repository in Vercel.
2. Vercel should detect Vite automatically.
3. If entered manually, set build command `npm run build` and output directory `dist`.
4. Open **Project Settings → Environment Variables**.
5. Add `VITE_N8N_WEBHOOK_URL` with the production n8n webhook URL.
6. Enable it for Production and Preview as required.
7. Redeploy after changing it because Vite embeds `VITE_` variables during build.

Variables prefixed with `VITE_` are public in the browser bundle. Never place Gemini, OpenAI, Gmail, OAuth, n8n API, or other secret credentials there. Pushes to `main` trigger the connected Vercel deployment automatically.

## Frontend-to-n8n API contract

Every operation uses the same webhook and an `action` discriminator.

### Generate matches and outreach

```json
{
  "action": "find_matches_and_generate_outreach",
  "campaign": {
    "brandName": "Aster & Bloom",
    "description": "A clean, plant-powered skincare line launching a lightweight daily glow serum.",
    "niche": "Beauty & skincare",
    "targetAudience": "India, ages 18–30",
    "budget": 50000,
    "goal": "Product awareness",
    "platform": "Instagram"
  },
  "mode": "live"
}
```

Expected response:

```json
{
  "success": true,
  "prospects": [
    {
      "id": "creator-test-ashish",
      "name": "Ashish Prajapat",
      "handle": "@ashishcreates",
      "email": "ashishprajapat0805@gmail.com",
      "platform": "Instagram",
      "niche": "Tech & lifestyle",
      "followers": 28400,
      "engagementRate": 5.4,
      "estimatedRate": 8500,
      "matchScore": 96,
      "matchReason": "Relevant creator and budget fit.",
      "outreach": {
        "subject": "Aster & Bloom creator collaboration",
        "message": "Hi Ashish, ..."
      },
      "status": "draft_ready",
      "isTestProfile": true
    }
  ]
}
```

The frontend normalizer unwraps n8n's common single-item array response, validates required fields, applies safe defaults, and restores the authorized test email when model output omits it for the known test creator ID/handle.

### Classify a pasted reply

```json
{
  "action": "classify_reply",
  "reply": "Yes, I am interested and would like to proceed.",
  "creator": {
    "name": "Ashish Prajapat",
    "handle": "@ashishcreates"
  }
}
```

```json
{
  "success": true,
  "classification": "Interested",
  "confidence": 95,
  "reasoning": "The creator explicitly agrees to proceed.",
  "suggestedAction": "Begin onboarding and collect the remaining terms."
}
```

### Load stored Gmail replies

Request:

```json
{ "action": "get_latest_replies" }
```

The response contains a `replies` array with Gmail message/thread IDs, sender, creator, subject, text, classification, confidence, reasoning, suggested action, and received time.

### Send authorized outreach

```json
{
  "action": "send_approved_outreach",
  "approved": true,
  "creatorId": "creator-test-ashish",
  "to": "ashishprajapat0805@gmail.com",
  "subject": "Approved subject",
  "message": "Approved message"
}
```

The workflow must reject missing approval, a different creator, or a different recipient.

### Assess onboarding

```json
{
  "action": "assess_onboarding",
  "prospect": {
    "name": "Ashish Prajapat",
    "email": "ashishprajapat0805@gmail.com",
    "platform": "Instagram",
    "handle": "@ashishcreates",
    "country": "India",
    "agreedRate": "8500",
    "contentFormat": "Instagram Reel",
    "deadline": "2026-10-30"
  }
}
```

The response contains `status`, `missingFields`, `collectedFields`, and `nextAction`.

## n8n workflow details

The published `bigbell` workflow has two entry paths:

1. A production Webhook receives frontend actions and routes them to the correct operation.
2. A Gmail Trigger independently polls authorized unread replies.

It currently:

- Validates and routes action payloads.
- Matches campaigns against a fixed sample creator database.
- Uses Gemini for structured scores, reasons, subjects, and personalized messages.
- Preserves authorized test-profile metadata.
- Classifies manually submitted replies with Gemini.
- Sends approved outreach via the connected Gmail account.
- Restricts sending to the authorized test recipient.
- Polls the authorized Gmail reply account approximately every minute.
- Classifies captured replies and stores them in the `Biggbell Outreach Replies` Data Table.
- Returns the latest reply records to the UI.
- Assesses onboarding completeness with deterministic workflow logic.
- Returns structured JSON with browser-compatible CORS behavior.

Gemini and Gmail credentials live only in n8n. Temporary model capacity errors can occur; retries are configured, but another manual retry may still be needed during provider congestion.

## Data and state behavior

- Demo creators and the initial campaign are in `src/data.ts`.
- Frontend draft edits/statuses are React memory and reset on refresh.
- The n8n Data Table persists classified Gmail replies.
- Campaigns, approvals, and onboarding records are not yet persisted in a production database.
- Auto-onboarding uses the matched creator plus the Gmail sender email when available.
- Estimated creator rate is never copied into `agreedRate` automatically.

## Safety controls

- Creator profiles are synthetic demo profiles.
- There is no scraping or bulk prospect collection.
- Draft generation never sends automatically.
- Approve/Reject are local review actions.
- Sending requires approval, a separate send action, and final confirmation.
- n8n enforces a fixed authorized test creator and recipient.
- Secrets stay in n8n credentials and are not returned to the browser.
- Human review remains required before external communication.
- The demo makes no claim of Biggbell endorsement or real campaign performance.

## Error handling

The UI covers invalid campaign fields, missing webhook configuration, HTTP errors, invalid response shapes, empty results, missing reply history, Gmail polling delay, classification failures, onboarding failures, and disabled controls during requests.

If an action appears stuck, inspect the latest n8n execution. Onboarding is deterministic and should return quickly; a long request usually means an older deployment, unreachable webhook, or a route that did not reach its Respond to Webhook node.

## Troubleshooting

### Webhook not configured

- Check `VITE_N8N_WEBHOOK_URL` in `.env.local` or Vercel.
- Use the production `/webhook/` URL, not `/webhook-test/`.
- Restart Vite or redeploy Vercel after changing it.

### CORS or request failure

- Confirm the n8n workflow is published/active.
- Allow the deployed Vercel origin in webhook response headers.
- Ensure every router branch reaches a Respond to Webhook node.
- Inspect n8n Executions for the actual backend result.

### Approve does not send email

Expected behavior: approval only updates review status. Select the authorized Ashish profile, turn Demo mode OFF, approve it, click **Send authorized test email**, and confirm the browser prompt.

### Latest Gmail reply is missing

- Reply from `ashishprajapat0805@gmail.com` in the test thread.
- Wait approximately one minute for polling.
- Inspect the Gmail Trigger execution and Data Table insert.
- Click **Load latest Gmail reply** again.

### Reply is More Information instead of Interested

A message requesting deliverables, timeline, or budget is correctly `More Information`, even if it says “interested.” To test onboarding, use an unambiguous reply:

> Yes, I’m interested and would like to proceed with this collaboration.

### Onboarding remains empty

Auto-fill intentionally occurs only for `Interested`. `Rejected`, `Pricing Query`, and `More Information` do not begin onboarding. The creator must also exist in the current results so the reply can map to a profile.

### Gemini capacity error

- Retry after a short delay.
- Inspect the execution to confirm a provider error.
- Keep deterministic operations outside the LLM path.
- For production, add fallback models/providers and controlled backoff.

## Known limitations

- Matching uses a fixed sample database, not a live creator marketplace.
- AI quality and latency depend on Gemini availability.
- Most frontend state resets on refresh.
- Only one authorized test recipient is supported.
- Reply retrieval is button-driven, not real-time push.
- Thread-to-creator mapping is suitable for this controlled demo, not multi-tenant production.
- Agreed rate and deadline are not automatically extracted from conversation history.
- Country inference currently recognizes India from the campaign audience; it is not a general location parser.
- No authentication, roles, audit log, rate limiting, CRM, analytics, or production database exists.
- Sidebar items scroll to sections rather than opening separate application routes.

## Future roadmap

### Near-term demo improvements

- Add an activity timeline for generated, approved, sent, replied, classified, and onboarded events.
- Poll automatically for new Gmail replies.
- Add a visible **Start onboarding** action after an interested response while retaining auto-prefill.
- Generate reviewed response drafts for Pricing Query and More Information.
- Extract actually agreed rate, deliverables, and deadline from the conversation with human confirmation.
- Persist campaign/UI progress across refreshes.
- Show workflow execution references for easier support.

### Production data and automation

- Replace sample creators with Biggbell's authorized database/API.
- Persist campaigns, prospects, drafts, approvals, messages, replies, and onboarding state.
- Map email threads to campaigns/creators using stable IDs.
- Support multiple brands, campaigns, creators, and operators.
- Add idempotency/deduplication to prevent duplicate sends and reply records.
- Add queues, retry/backoff, dead-letter handling, monitoring, and alerts.
- Add versioned prompts, strict structured-output validation, and model/provider fallback.
- Add tenant-specific configuration and secret isolation.

### Email and communication

- Replace the single-recipient lock with authenticated, permissioned recipients.
- Add templates, signatures, scheduling, follow-ups, unsubscribe handling, and suppression lists.
- Synchronize full inbox threads instead of only loading the latest stored reply.
- Track delivery, bounce, complaint, and response events.
- Add optional Outlook, CRM, Slack, and creator-channel integrations.

### Onboarding

- Create a persistent onboarding record after explicit acceptance.
- Send secure forms for contract, tax, payment, content, and shipping data.
- Track signatures, shipping, deliverables, review rounds, invoice, and payment.
- Validate fields by campaign type and country.
- Add reminders/escalation for missing items.
- Keep sensitive personal/payment data out of email and in an appropriate secure system.

### Security and quality

- Add authentication, RBAC, tenant isolation, and audit logs.
- Put a secured backend/API gateway in front of the n8n webhook.
- Add request signing, rate limiting, abuse prevention, and stricter CORS.
- Add consent, retention, deletion, and privacy controls.
- Add unit, integration, contract, and end-to-end tests.
- Add observability for workflow success, latency, model failures, and email outcomes.

## Production-readiness statement

The project is ready for a controlled presentation and authorized Gmail test. It is not ready for real creator outreach at scale. Production use requires authentication, a secured backend boundary, persistent data, recipient authorization/consent, tenant isolation, auditability, idempotent sending, monitoring, recovery, privacy controls, and full testing.

## Change history

- Built the responsive React/TypeScript/Vite dashboard and fictional demo mode.
- Added typed n8n integration, response normalization, and visible failures.
- Connected Gemini creator matching and draft generation.
- Added Reply Intelligence and Onboarding Agent UI/workflows.
- Added a recipient-locked Gmail send path with final confirmation.
- Added Gmail polling, AI classification, Data Table storage, and reply retrieval.
- Fixed authorized test email normalization when AI omitted the field.
- Replaced slow AI onboarding assessment with deterministic logic.
- Added automatic onboarding prefill after an `Interested` reply.
- Deployed on Vercel and documented setup/operation.

## License and ownership

No open-source license is currently included. Treat this repository as private/proprietary unless the owner adds a license. Biggbell branding is used only for this independent demonstration concept.
