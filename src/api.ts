import type { CampaignBrief, GmailReplyRecord, OnboardingProspect, OnboardingResult, OutreachResponse, Platform, Prospect, ProspectStatus, ReplyResult, SendResult } from './types'

const WEBHOOK_URL = (import.meta.env.VITE_N8N_WEBHOOK_URL as string | undefined)?.trim()
export const isWebhookConfigured = Boolean(WEBHOOK_URL)

const platforms: Platform[] = ['Instagram', 'YouTube', 'TikTok', 'Other']
const statuses: ProspectStatus[] = ['matched', 'draft_ready', 'needs_review', 'approved', 'rejected', 'onboarding_pending']

function normalizeProspect(value: unknown, index: number): Prospect {
  if (!value || typeof value !== 'object') throw new Error(`Prospect ${index + 1} is not a valid object.`)
  const item = value as Record<string, unknown>
  const outreach = item.outreach as Record<string, unknown> | undefined
  const platform = platforms.includes(item.platform as Platform) ? item.platform as Platform : 'Other'
  const status = statuses.includes(item.status as ProspectStatus) ? item.status as ProspectStatus : 'needs_review'
  if (!item.name || !item.handle || !outreach?.message) throw new Error(`Prospect ${index + 1} is missing a name, handle, or outreach message.`)
  return {
    id: String(item.id ?? `prospect-${index + 1}`), name: String(item.name), handle: String(item.handle), email: item.email ? String(item.email) : undefined, platform,
    niche: String(item.niche ?? 'Creator'), followers: Number(item.followers ?? 0), engagementRate: Number(item.engagementRate ?? 0),
    estimatedRate: Number(item.estimatedRate ?? 0), matchScore: Number(item.matchScore ?? 0),
    matchReason: String(item.matchReason ?? 'Matched to the campaign brief.'),
    outreach: { subject: String(outreach.subject ?? 'Partnership opportunity'), message: String(outreach.message) }, status,
    isTestProfile: Boolean(item.isTestProfile),
  }
}

function normalizeResponse(value: unknown): OutreachResponse {
  const unwrapped = Array.isArray(value) && value.length === 1 ? value[0] : value
  if (!unwrapped || typeof unwrapped !== 'object') throw new Error('The webhook returned an invalid response.')
  const body = unwrapped as Record<string, unknown>
  if (!Array.isArray(body.prospects)) throw new Error('The webhook response must include a prospects array.')
  return { success: body.success !== false, prospects: body.prospects.map(normalizeProspect), message: body.message ? String(body.message) : undefined }
}

export async function requestOutreach(campaign: CampaignBrief): Promise<OutreachResponse> {
  if (!WEBHOOK_URL) throw new Error('No n8n webhook is configured. Enable Demo mode or set VITE_N8N_WEBHOOK_URL.')
  const response = await fetch(WEBHOOK_URL, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'find_matches_and_generate_outreach', campaign, mode: 'live' }),
  })
  if (!response.ok) throw new Error(`The n8n webhook returned ${response.status}. Check the workflow and CORS settings.`)
  return normalizeResponse(await response.json())
}

async function postAction<T>(payload: Record<string, unknown>): Promise<T> {
  if (!WEBHOOK_URL) throw new Error('No n8n webhook is configured. Enable Demo mode or set VITE_N8N_WEBHOOK_URL.')
  const response = await fetch(WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  if (!response.ok) throw new Error(`The n8n webhook returned ${response.status}. Check the workflow and CORS settings.`)
  const data = await response.json() as T & { success?: boolean; message?: string }
  if (data.success === false) throw new Error(data.message || 'The workflow could not complete this request.')
  return data
}

export function classifyReply(reply: string, creator: { name: string; handle: string }): Promise<ReplyResult> {
  return postAction<ReplyResult>({ action: 'classify_reply', reply, creator })
}

export function getLatestReplies(): Promise<{ success: boolean; replies: GmailReplyRecord[] }> {
  return postAction({ action: 'get_latest_replies' })
}

export function assessOnboarding(prospect: OnboardingProspect): Promise<OnboardingResult> {
  return postAction<OnboardingResult>({ action: 'assess_onboarding', prospect })
}

export function sendApprovedOutreach(prospect: Prospect): Promise<SendResult> {
  if (!prospect.email) throw new Error('This creator has no test email configured.')
  return postAction<SendResult>({
    action: 'send_approved_outreach', approved: true, creatorId: prospect.id,
    to: prospect.email, subject: prospect.outreach.subject, message: prospect.outreach.message,
  })
}
