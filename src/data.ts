import type { CampaignBrief, Prospect } from './types'

export const initialCampaign: CampaignBrief = {
  brandName: 'Aster & Bloom',
  description: 'A clean, plant-powered skincare line launching a lightweight daily glow serum.',
  niche: 'Beauty & skincare',
  targetAudience: 'India, ages 18–30',
  budget: 50000,
  goal: 'Product awareness',
  platform: 'Instagram',
}

export function createDemoProspects(campaign: CampaignBrief): Prospect[] {
  const brand = campaign.brandName || 'your brand'
  return [
    {
      id: 'creator-test-ashish', name: 'Ashish Prajapat', handle: '@ashishcreates', email: 'ashishprajapat0805@gmail.com', platform: 'Instagram',
      niche: 'Tech & lifestyle', followers: 28400, engagementRate: 5.4, estimatedRate: 8500, matchScore: 96,
      matchReason: 'Authorized test creator profile for the Biggbell Gmail demo; strong lifestyle fit and within the sample budget.',
      outreach: { subject: `${brand} × Ashish — test creator collaboration`, message: `Hi Ashish,\n\nYour practical tech and lifestyle content feels like a natural fit for ${brand}. We’re exploring a creator-led launch story and would love to share the campaign brief, deliverables, and approved budget with you.\n\nWould you be open to taking a look?\n\nWarmly,\nThe ${brand} team` },
      status: 'draft_ready', avatarColor: '#f2b187', isTestProfile: true,
    },
    {
      id: 'creator-001', name: 'Maya Kapoor', handle: '@mayaglowguide', platform: 'Instagram',
      niche: 'Clean beauty', followers: 48200, engagementRate: 5.8, estimatedRate: 9000, matchScore: 94,
      matchReason: `Strong clean-beauty authority, high saves, and an audience aligned with ${campaign.targetAudience || 'your target market'}.`,
      outreach: { subject: `${brand} × Maya — a glow-first collaboration`, message: `Hi Maya,\n\nI’ve been following your thoughtful approach to ingredient-led skincare—especially how you make routines feel simple and attainable. We’re launching a lightweight daily glow serum at ${brand}, and your clean-beauty perspective feels genuinely aligned.\n\nWould you be open to exploring a creator collaboration? We’d love to shape the format around your voice and community.\n\nWarmly,\nThe ${brand} team` },
      status: 'draft_ready', avatarColor: '#ffb38a',
    },
    {
      id: 'creator-002', name: 'Riya Mehta', handle: '@riyareviews', platform: 'Instagram',
      niche: 'Skincare reviews', followers: 73500, engagementRate: 4.6, estimatedRate: 14000, matchScore: 89,
      matchReason: 'Consistent product-review content, credible ingredient education, and a strong audience fit within budget.',
      outreach: { subject: `A serum your community may want to meet`, message: `Hi Riya,\n\nYour candid skincare reviews and ingredient breakdowns make it easier for people to choose products with confidence. That is exactly the spirit behind ${brand}.\n\nWe’re preparing our daily glow serum launch and would love to invite you to try it and explore a paid partnership if it feels right for your audience. Interested in hearing more?\n\nBest,\nThe ${brand} team` },
      status: 'needs_review', avatarColor: '#a8c7ff',
    },
    {
      id: 'creator-003', name: 'Anika Rao', handle: '@anikasunday', platform: 'Instagram',
      niche: 'Wellness & lifestyle', followers: 31600, engagementRate: 6.2, estimatedRate: 7000, matchScore: 84,
      matchReason: 'Excellent engagement and wellness adjacency; content style suits an authentic morning-routine integration.',
      outreach: { subject: `${brand} for your Sunday reset`, message: `Hi Anika,\n\nWe love the calm, considered way you share everyday wellness—your Sunday reset series especially stood out. ${brand} is launching a plant-powered glow serum designed to make daily skincare feel just as uncomplicated.\n\nCould we send over the details for a potential routine-led collaboration?\n\nWarmly,\nThe ${brand} team` },
      status: 'draft_ready', avatarColor: '#cbb6ff',
    },
    {
      id: 'creator-004', name: 'Kabir Sethi', handle: '@kabircreates', platform: 'YouTube',
      niche: 'Beauty & lifestyle', followers: 128000, engagementRate: 3.9, estimatedRate: 28000, matchScore: 77,
      matchReason: 'Broad reach and polished beauty content, though platform and rate make this a secondary fit.',
      outreach: { subject: `A considered skincare story with ${brand}`, message: `Hi Kabir,\n\nYour beautifully produced lifestyle stories make product discovery feel personal rather than promotional. We think our new plant-powered glow serum could fit naturally into that world.\n\nWould you be open to discussing a launch collaboration with ${brand}? We’re happy to explore a concept that feels true to your channel.\n\nBest,\nThe ${brand} team` },
      status: 'matched', avatarColor: '#9bd8c1',
    },
  ]
}
