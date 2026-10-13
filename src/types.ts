export type Platform = 'Instagram' | 'YouTube' | 'TikTok' | 'Other'
export type ProspectStatus = 'matched' | 'draft_ready' | 'needs_review' | 'approved' | 'rejected' | 'onboarding_pending'

export interface CampaignBrief {
  brandName: string
  description: string
  niche: string
  targetAudience: string
  budget: number
  goal: string
  platform: Platform
}

export interface Prospect {
  id: string
  name: string
  handle: string
  email?: string
  platform: Platform
  niche: string
  followers: number
  engagementRate: number
  estimatedRate: number
  matchScore: number
  matchReason: string
  outreach: { subject: string; message: string }
  status: ProspectStatus
  avatarColor?: string
  isTestProfile?: boolean
}

export interface OutreachResponse {
  success: boolean
  prospects: Prospect[]
  message?: string
}

export interface SendResult {
  success: boolean
  status: 'sent'
  message: string
  messageId?: string | null
  threadId?: string | null
}

export type ReplyClassification = 'Interested' | 'Rejected' | 'Pricing Query' | 'More Information'

export interface ReplyResult {
  success: boolean
  classification: ReplyClassification | null
  confidence: number
  reasoning: string
  suggestedAction: string
}

export interface GmailReplyRecord {
  gmail_message_id: string
  thread_id: string
  sender_email: string
  creator_name: string
  subject: string
  reply_text: string
  classification: ReplyClassification
  confidence: number
  reasoning: string
  suggested_action: string
  received_at: string
}

export type OnboardingStatus = 'Pending' | 'In Progress' | 'Completed'

export interface OnboardingProspect {
  name: string
  email: string
  platform: string
  handle: string
  country: string
  agreedRate: string
  contentFormat: string
  deadline: string
}

export interface OnboardingResult {
  success: boolean
  status: OnboardingStatus
  missingFields: string[]
  collectedFields: Record<string, unknown>
  nextAction: string
}
