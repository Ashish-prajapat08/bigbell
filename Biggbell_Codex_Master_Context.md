# Biggbell AI Outreach & Onboarding Demo — Codex Master Context

## 1. Goal

Build a small, polished, working demo for Biggbell.com in **two hours**.

The requested use case comes from this opportunity:

> “Looking for an AI Agent Expert who can help us build an AI agent to automate outreach and onboarding for brands, creators, and agencies at Biggbell.com.”

The immediate deliverable is:
1. **Build the frontend first** using the existing local project in Codex.
2. Keep the n8n webhook URL configurable; the user will provide it later.
3. Once the frontend is ready and the webhook URL is provided, build/connect the n8n workflow.
4. Keep the demo focused. Do not build unrelated features or production infrastructure.

The user says Codex has access to their n8n instance and that an existing workflow named **`bigbell`** appears among the available workflows. Inspect the existing workflow before editing anything. Do not overwrite, publish, or execute unrelated workflows.

## 2. Product to demonstrate

**Working name:** Biggbell AI Outreach Studio  
**Purpose:** Demonstrate how an AI-powered workflow can help a creator-economy platform identify relevant prospects and prepare personalized outreach, then track onboarding interest.

This is a prototype/demo, not an official Biggbell product. Do not imply it is affiliated with or endorsed by Biggbell. Use sample/demo data only.

### Primary user journey

1. User opens the dashboard.
2. User enters a campaign brief:
   - Campaign / brand name
   - Product or campaign description
   - Target niche/category
   - Target audience or geography (optional)
   - Budget range
   - Campaign goal
   - Preferred platform (Instagram, YouTube, TikTok, or other)
3. User clicks **Find Matches & Generate Outreach**.
4. UI sends a JSON `POST` request to a configurable n8n webhook URL.
5. n8n should eventually return:
   - matched prospects / creators
   - match score and short reason
   - personalized outreach draft per prospect
   - status (e.g. draft / needs review)
6. UI displays the response in a clear results view.
7. User can inspect a draft and use **Approve**, **Reject**, and **Edit draft** UI actions.
8. In the first demo, approval must NOT send a real email unless a separate send action is explicitly implemented and confirmed. Prefer a safe mock approval/status update.

## 3. Scope: build now vs later

### Build now (frontend)

- A professional, responsive SaaS dashboard.
- Campaign brief form with sensible validation.
- A small sample creator/prospect dataset for a useful demo before webhook integration is ready.
- Prospect cards/table with:
  - name / handle
  - platform
  - niche
  - audience/follower count
  - engagement rate (if sample data includes it)
  - estimated rate or budget fit
  - match score
  - concise match explanation
- Outreach draft panel with personalized subject and message.
- Status indicators: Matched, Draft Ready, Needs Review, Approved, Rejected, Onboarding Pending.
- Loading, empty, success, and error states.
- Clear indication when demo/mock data is being shown.
- A settings/configuration location for the n8n webhook URL, or a single clearly documented config constant/environment variable. Do not hardcode a made-up URL.
- A frontend service function that sends a `POST` request with JSON to the configured webhook.
- A fallback/demo mode so the UI can be previewed without a webhook.
- Basic accessibility and mobile responsiveness.

### Build later (do not block the frontend)

- Connect the real n8n webhook after the user supplies the URL.
- Build or update the n8n workflow after inspecting the existing `bigbell` workflow.
- LLM-based prospect matching and personalized outreach.
- Reply classification and onboarding automation.
- Real email sending, CRM integrations, authentication, billing, persistent production database, multi-agent architecture, and analytics.
- Do not implement these extra items unless specifically asked after the first demo works.

## 4. Technical expectations

- First inspect the current repository and its framework. Reuse the existing setup; do not replace the project or introduce unnecessary dependencies.
- If the repository is empty, build a clean frontend using the simplest suitable stack already available. Prefer the existing framework; if there is none, use React + TypeScript + Vite.
- Use clean component structure and typed data models.
- Keep the webhook URL in one place, such as an environment variable (`VITE_N8N_WEBHOOK_URL`) or a small configuration setting.
- Never expose LLM keys, n8n credentials, or other secrets in browser code.
- Send only necessary campaign information in the request.
- Handle network failures and invalid responses gracefully.
- Do not assume a particular n8n response schema without documenting it. Implement a small normalization layer that can handle the expected response shape and show a helpful error if the response is invalid.
- A browser-to-n8n request may require CORS configuration in n8n. Note this if it blocks the connection; do not fake a successful integration.
- Do not claim the frontend is connected to n8n until a real request succeeds.

### Suggested request payload

```json
{
  "action": "find_matches_and_generate_outreach",
  "campaign": {
    "brandName": "Example Brand",
    "description": "A demo campaign for a skincare launch",
    "niche": "Beauty and skincare",
    "targetAudience": "India, ages 18–30",
    "budget": 50000,
    "goal": "Product awareness",
    "platform": "Instagram"
  },
  "mode": "demo"
}
```

### Suggested response shape

```json
{
  "success": true,
  "prospects": [
    {
      "id": "creator-001",
      "name": "Aarav Sharma",
      "handle": "@aaravskincare",
      "platform": "Instagram",
      "niche": "Beauty and skincare",
      "followers": 45000,
      "engagementRate": 4.2,
      "estimatedRate": 8000,
      "matchScore": 92,
      "matchReason": "Relevant skincare content and fits the campaign budget.",
      "outreach": {
        "subject": "Collaboration with Example Brand",
        "message": "Hi Aarav, ..."
      },
      "status": "draft_ready"
    }
  ]
}
```

These are examples only. All names, figures, and campaign details are fictional demo data. The backend response can be adapted when the actual n8n workflow is inspected.

## 5. UI/UX direction

Create a polished, modern B2B SaaS interface suitable for showing to a prospective employer/client:
- Clean layout, strong visual hierarchy, restrained colors, excellent spacing.
- A left navigation or compact sidebar with Overview, Campaigns, Prospects, Outreach, and Onboarding. These can be lightweight views; do not build a complex app.
- Main dashboard should make the core journey obvious: campaign brief → matches → outreach drafts → review.
- Use realistic but explicitly fictional demo data.
- Avoid fake claims, fake customer logos, or claims of real Biggbell metrics.
- No unnecessary animations or complex charts that consume build time.
- Make the primary CTA obvious.
- The UI should look complete even while the n8n webhook is not configured.

## 6. n8n workflow requirements (later phase)

Before changing n8n:
1. Inspect the available workflow named `bigbell`.
2. Report what it currently contains and whether it is safe to reuse.
3. Do not overwrite or publish it without checking with the user if it contains existing logic.
4. Prefer creating a new workflow with a clear name such as `Biggbell — Creator Outreach Demo` if the existing workflow is unrelated or unclear.

Expected first workflow:
1. Webhook trigger accepting `POST` JSON.
2. Validate required campaign fields.
3. Read sample prospects from a simple source (static data or a small sheet if already available; do not spend time setting up a new database).
4. Filter/score prospects based on niche, platform, and budget fit.
5. Use the already-configured LLM credential if available to generate personalized outreach drafts. Never print or expose credentials.
6. Return structured JSON through a Respond to Webhook node.
7. Include error handling and a clear response for missing fields or model failures.
8. Do not send real outreach emails automatically. The initial workflow only generates drafts.
9. Test with sample data and verify the actual response.
10. Activate/publish only when appropriate and after validating the workflow. Do not run actions that send messages to real people.

Suggested response:
```json
{
  "success": true,
  "prospects": [],
  "message": "Demo results generated."
}
```

## 7. Demo safety and integrity

- Use synthetic sample data only unless the user explicitly provides authorized data.
- Never scrape personal contact details or send unsolicited bulk messages as part of this demo.
- Draft generation only; human review before external communication.
- Do not include secrets in code, logs, screenshots, or the deployed frontend.
- Never claim real-world outreach, conversion, or onboarding results from mock data.
- Keep demo mode visually identifiable.

## 8. Acceptance criteria

Frontend is ready when:
- [ ] It runs locally without errors.
- [ ] The dashboard and campaign form are visually polished.
- [ ] A user can submit a campaign brief.
- [ ] Demo mode displays believable, clearly fictional prospect matches and outreach drafts.
- [ ] The webhook URL is configurable without code changes in multiple places.
- [ ] A real webhook request can be enabled when the user supplies the URL.
- [ ] Loading and error states are handled.
- [ ] Approve/reject controls update the visible status without sending a real message.
- [ ] No secret keys are exposed.
- [ ] The README explains how to run locally and configure the webhook for deployment on Vercel.

## 9. Work order

**Step A — now:** Inspect repository, then build the frontend only. Do not spend time inspecting or editing n8n yet unless necessary to understand the current project.

**Step B — after frontend:** Summarize changed files, provide local run commands, and tell the user exactly where to add the webhook URL and which Vercel environment variable to set.

**Step C — when the user provides the webhook URL:** Test the UI-to-webhook connection. Diagnose CORS or response-shape issues honestly.

**Step D — then:** Inspect the existing n8n workflow named `bigbell`; decide whether to reuse it or create a separate demo workflow. Build, test, and validate the workflow without sending real outreach.

**Keep the goal in view:** a credible, end-to-end demo quickly. Prioritize a working happy path over a large feature set.
