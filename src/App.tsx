import { useMemo, useState } from 'react'
import {
  ArrowRight, Bell, Check, CheckCircle2, ChevronDown, ClipboardCheck, FilePenLine, LayoutDashboard,
  LoaderCircle, Mail, Menu, MessageSquareText, Search, Settings, Sparkles, Target, Users, X, XCircle, Info,
} from 'lucide-react'
import { assessOnboarding, classifyReply, getLatestReplies, requestOutreach, sendApprovedOutreach, isWebhookConfigured } from './api'
import { createDemoProspects, initialCampaign } from './data'
import type { CampaignBrief, OnboardingProspect, OnboardingResult, Platform, Prospect, ProspectStatus, ReplyResult } from './types'

const nav = [
  { label: 'Overview', icon: LayoutDashboard }, { label: 'Campaigns', icon: Target }, { label: 'Prospects', icon: Users },
  { label: 'Outreach', icon: Mail }, { label: 'Onboarding', icon: ClipboardCheck },
]

const statusLabels: Record<ProspectStatus, string> = {
  matched: 'Matched', draft_ready: 'Draft Ready', needs_review: 'Needs Review', approved: 'Approved',
  rejected: 'Rejected', onboarding_pending: 'Onboarding Pending',
}

function initials(name: string) { return name.split(' ').map((part) => part[0]).join('').slice(0, 2) }
function compactNumber(value: number) { return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value) }
function money(value: number) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value) }

function App() {
  const [activeNav, setActiveNav] = useState('Overview')
  const [mobileNav, setMobileNav] = useState(false)
  const [campaign, setCampaign] = useState<CampaignBrief>(initialCampaign)
  const [demoMode, setDemoMode] = useState(!isWebhookConfigured)
  const [prospects, setProspects] = useState<Prospect[]>(createDemoProspects(initialCampaign))
  const [selectedId, setSelectedId] = useState('creator-test-ashish')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasRun, setHasRun] = useState(true)
  const [editing, setEditing] = useState(false)
  const [savedNotice, setSavedNotice] = useState(false)
  const [replyText, setReplyText] = useState("Hi, this sounds interesting. Could you share the deliverables and let me know what budget you have in mind?")
  const [replyResult, setReplyResult] = useState<ReplyResult | null>(null)
  const [replyLoading, setReplyLoading] = useState(false)
  const [replyError, setReplyError] = useState('')
  const [onboarding, setOnboarding] = useState<OnboardingProspect>({ name: '', email: '', platform: '', handle: '', country: '', agreedRate: '', contentFormat: '', deadline: '' })
  const [onboardingSource, setOnboardingSource] = useState('')
  const [onboardingResult, setOnboardingResult] = useState<OnboardingResult | null>(null)
  const [onboardingLoading, setOnboardingLoading] = useState(false)
  const [onboardingError, setOnboardingError] = useState('')

  const selected = prospects.find((item) => item.id === selectedId) ?? prospects[0]
  const approved = prospects.filter((item) => item.status === 'approved').length
  const avgScore = prospects.length ? Math.round(prospects.reduce((sum, item) => sum + item.matchScore, 0) / prospects.length) : 0

  const fieldErrors = useMemo(() => ({
    brandName: campaign.brandName.trim() ? '' : 'Brand name is required.',
    description: campaign.description.trim().length >= 20 ? '' : 'Add at least 20 characters.',
    niche: campaign.niche.trim() ? '' : 'Target niche is required.',
    budget: campaign.budget > 0 ? '' : 'Enter a budget greater than zero.',
    goal: campaign.goal.trim() ? '' : 'Campaign goal is required.',
  }), [campaign])

  const valid = !Object.values(fieldErrors).some(Boolean)
  function update<K extends keyof CampaignBrief>(key: K, value: CampaignBrief[K]) { setCampaign((current) => ({ ...current, [key]: value })) }

  function prefillOnboarding(prospect: Prospect, email = prospect.email || '') {
    const country = /india/i.test(campaign.targetAudience) ? 'India' : ''
    const contentFormat = prospect.platform === 'Instagram' ? 'Instagram Reel' : prospect.platform === 'YouTube' ? 'YouTube Integration' : prospect.platform === 'TikTok' ? 'TikTok Video' : ''
    setOnboarding((current) => ({
      ...current,
      name: prospect.name,
      email,
      platform: prospect.platform,
      handle: prospect.handle,
      country,
      contentFormat,
    }))
    setOnboardingSource(prospect.name)
    setOnboardingResult(null)
    setOnboardingError('')
  }

  function applyReplyResult(result: ReplyResult, prospect: Prospect | undefined, email?: string) {
    setReplyResult(result)
    if (result.classification === 'Interested' && prospect) prefillOnboarding(prospect, email)
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!valid) { setError('Please complete the required campaign fields.'); return }
    setLoading(true); setError(''); setHasRun(false)
    try {
      if (demoMode) {
        await new Promise((resolve) => window.setTimeout(resolve, 950))
        const demo = createDemoProspects(campaign)
        setProspects(demo); setSelectedId(demo[0].id)
      } else {
        const response = await requestOutreach(campaign)
        setProspects(response.prospects); setSelectedId(response.prospects[0]?.id ?? '')
      }
      setHasRun(true)
      window.setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Something went wrong. Please try again.')
      setHasRun(true)
    } finally { setLoading(false) }
  }

  function setStatus(status: ProspectStatus) {
    if (!selected) return
    setProspects((items) => items.map((item) => item.id === selected.id ? { ...item, status } : item))
  }

  function saveDraft(subject: string, message: string) {
    if (!selected) return
    setProspects((items) => items.map((item) => item.id === selected.id ? { ...item, outreach: { subject, message }, status: 'needs_review' } : item))
    setEditing(false); setSavedNotice(true); window.setTimeout(() => setSavedNotice(false), 2200)
  }

  function navigate(label: string) {
    setActiveNav(label); setMobileNav(false)
    const targets: Record<string, string> = { Overview: 'top', Campaigns: 'campaign', Prospects: 'results', Outreach: 'reply-intelligence', Onboarding: 'onboarding-agent' }
    window.setTimeout(() => document.getElementById(targets[label])?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 20)
  }

  async function runReplyIntelligence() {
    if (!replyText.trim()) { setReplyError('Paste a sample reply first.'); return }
    setReplyLoading(true); setReplyError(''); setReplyResult(null)
    try {
      if (demoMode) {
        await new Promise((resolve) => window.setTimeout(resolve, 750))
        const lower = replyText.toLowerCase()
        const classification = lower.includes('budget') || lower.includes('rate') || lower.includes('price') ? 'Pricing Query' : lower.includes('not interested') || lower.includes('pass') ? 'Rejected' : lower.includes('details') || lower.includes('more information') ? 'More Information' : 'Interested'
        applyReplyResult({ success: true, classification, confidence: 92, reasoning: classification === 'Pricing Query' ? 'The creator is open to the opportunity and explicitly asks about compensation.' : 'The language indicates the creator’s likely intent.', suggestedAction: classification === 'Pricing Query' ? 'Review the approved budget and prepare a clear rate-and-deliverables response for human approval.' : 'Prepare the appropriate next response and review it before sending.' }, selected)
      } else {
        const result = await classifyReply(replyText, { name: selected?.name || 'Sample Creator', handle: selected?.handle || '@samplecreator' })
        applyReplyResult(result, selected)
      }
    } catch (caught) { setReplyError(caught instanceof Error ? caught.message : 'Reply classification failed.') }
    finally { setReplyLoading(false) }
  }

  async function loadGmailReply() {
    setReplyLoading(true); setReplyError('')
    try {
      const data = await getLatestReplies()
      const latest = data.replies[0]
      if (!latest) throw new Error('No classified Gmail reply found yet. Send a reply from the test creator account and try again in about a minute.')
      const replyProspect = prospects.find((prospect) => prospect.email?.toLowerCase() === latest.sender_email.toLowerCase())
        ?? prospects.find((prospect) => prospect.name.toLowerCase() === latest.creator_name.toLowerCase())
        ?? selected
      if (replyProspect) setSelectedId(replyProspect.id)
      setReplyText(latest.reply_text)
      applyReplyResult({ success: true, classification: latest.classification, confidence: latest.confidence, reasoning: latest.reasoning, suggestedAction: latest.suggested_action }, replyProspect, latest.sender_email)
    } catch (caught) { setReplyError(caught instanceof Error ? caught.message : 'Could not load Gmail replies.') }
    finally { setReplyLoading(false) }
  }

  async function runOnboarding() {
    setOnboardingLoading(true); setOnboardingError(''); setOnboardingResult(null)
    try {
      if (demoMode) {
        await new Promise((resolve) => window.setTimeout(resolve, 750))
        const required: (keyof OnboardingProspect)[] = ['name','email','platform','handle','country','agreedRate','contentFormat','deadline']
        const missing = required.filter((key) => !onboarding[key].trim())
        const filled = required.length - missing.length
        setOnboardingResult({ success: true, status: missing.length === 0 ? 'Completed' : filled >= 2 ? 'In Progress' : 'Pending', missingFields: missing, collectedFields: Object.fromEntries(required.filter((key) => onboarding[key]).map((key) => [key, onboarding[key]])), nextAction: missing.length ? `Collect ${missing.slice(0, 3).join(', ')}${missing.length > 3 ? ' and remaining details' : ''}.` : 'All required information is ready for final human review.' })
      } else setOnboardingResult(await assessOnboarding(onboarding))
    } catch (caught) { setOnboardingError(caught instanceof Error ? caught.message : 'Onboarding assessment failed.') }
    finally { setOnboardingLoading(false) }
  }

  return (
    <div className="app-shell" id="top">
      <aside className={`sidebar ${mobileNav ? 'open' : ''}`}>
        <div className="brand"><div className="brand-mark"><Sparkles size={18} /></div><span>Biggbell</span><button className="close-nav" onClick={() => setMobileNav(false)} aria-label="Close menu"><X /></button></div>
        <div className="workspace-label">AI OUTREACH STUDIO</div>
        <nav aria-label="Main navigation">
          {nav.map(({ label, icon: Icon }) => <button key={label} className={activeNav === label ? 'active' : ''} onClick={() => navigate(label)}><Icon size={18} /><span>{label}</span>{label === 'Outreach' && <b>{prospects.filter((p) => p.status === 'needs_review').length}</b>}</button>)}
        </nav>
        <div className="sidebar-foot">
          <button onClick={() => document.getElementById('configuration')?.scrollIntoView({ behavior: 'smooth' })}><Settings size={18} />Settings</button>
          <div className="operator"><div className="operator-avatar">AS</div><div><strong>Demo workspace</strong><span>Portfolio preview</span></div><ChevronDown size={16} /></div>
        </div>
      </aside>
      {mobileNav && <button className="nav-scrim" onClick={() => setMobileNav(false)} aria-label="Close navigation" />}

      <main>
        <header className="topbar">
          <button className="menu-button" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu /></button>
          <div><span className="eyebrow">Workspace</span><strong>Outreach command center</strong></div>
          <div className="header-actions"><span className="demo-chip"><span /> Fictional demo data</span><button className="icon-button" aria-label="Notifications"><Bell size={19} /></button><div className="operator-avatar small">AS</div></div>
        </header>

        <div className="page">
          <section className="hero">
            <div><div className="hero-kicker"><span /> HUMAN-REVIEWED AI WORKFLOW</div><h1>Turn a campaign brief into<br /><em>creator-ready outreach.</em></h1><p>Match the right creators, generate thoughtful first drafts, and keep every message behind a human approval step.</p></div>
            <div className="safety-note"><div><CheckCircle2 size={18} /><strong>Safe by design</strong></div><p>Approvals update this demo only. Nothing is sent to real people.</p></div>
          </section>

          <section className="metrics" aria-label="Campaign summary">
            <article><div className="metric-icon lilac"><Users /></div><div><span>Matched prospects</span><strong>{prospects.length}</strong><small>Fictional creators</small></div></article>
            <article><div className="metric-icon mint"><Target /></div><div><span>Average match</span><strong>{avgScore}%</strong><small>Based on demo scoring</small></div></article>
            <article><div className="metric-icon peach"><MessageSquareText /></div><div><span>Drafts ready</span><strong>{prospects.filter((p) => ['draft_ready', 'needs_review'].includes(p.status)).length}</strong><small>Waiting for review</small></div></article>
            <article><div className="metric-icon blue"><Check /></div><div><span>Approved</span><strong>{approved}</strong><small>Not sent</small></div></article>
          </section>

          <section className="workflow-grid" id="campaign">
            <form className="panel campaign-panel" onSubmit={submit} noValidate>
              <div className="panel-heading"><div><span className="step">01</span><div><h2>Campaign brief</h2><p>Tell the matching engine what a great fit looks like.</p></div></div><span className="autosave"><Check size={13} /> Ready</span></div>
              <div className="form-grid">
                <label>Campaign / brand name<input value={campaign.brandName} onChange={(e) => update('brandName', e.target.value)} placeholder="e.g. Aster & Bloom" />{!campaign.brandName && <small>{fieldErrors.brandName}</small>}</label>
                <label>Preferred platform<select value={campaign.platform} onChange={(e) => update('platform', e.target.value as Platform)}><option>Instagram</option><option>YouTube</option><option>TikTok</option><option>Other</option></select></label>
                <label className="wide">Product or campaign description<textarea value={campaign.description} onChange={(e) => update('description', e.target.value)} rows={3} /><span className="char-count">{campaign.description.length} characters</span></label>
                <label>Target niche / category<input value={campaign.niche} onChange={(e) => update('niche', e.target.value)} /></label>
                <label>Audience or geography <i>Optional</i><input value={campaign.targetAudience} onChange={(e) => update('targetAudience', e.target.value)} /></label>
                <label>Campaign budget (INR)<div className="money-input"><span>₹</span><input type="number" min="1" value={campaign.budget} onChange={(e) => update('budget', Number(e.target.value))} /></div></label>
                <label>Campaign goal<select value={campaign.goal} onChange={(e) => update('goal', e.target.value)}><option>Product awareness</option><option>Content creation</option><option>Conversions</option><option>Community growth</option><option>Product feedback</option></select></label>
              </div>
              <div className="mode-row">
                <div><strong>Demo mode</strong><span>{demoMode ? 'Use fictional sample creators' : isWebhookConfigured ? 'Send to configured n8n webhook' : 'Webhook not configured'}</span></div>
                <button type="button" role="switch" aria-checked={demoMode} className={`toggle ${demoMode ? 'on' : ''}`} onClick={() => { setDemoMode(!demoMode); setError('') }}><span /></button>
              </div>
              {error && <div className="error-box"><XCircle size={18} /><span>{error}</span><button type="button" onClick={() => setError('')}>Dismiss</button></div>}
              <button className="primary-cta" disabled={loading || !valid}>{loading ? <><LoaderCircle className="spin" /> Finding great fits…</> : <><Sparkles size={18} /> Find matches & generate outreach <ArrowRight size={18} /></>}</button>
              <p className="cta-note">Draft generation never sends automatically. The authorized Gmail test requires approval and confirmation.</p>
            </form>

            <aside className="panel process-panel">
              <div className="panel-heading"><div><span className="step muted">HOW</span><div><h2>What happens next</h2><p>A transparent, review-first flow.</p></div></div></div>
              <ol className="process-list">
                <li className={loading ? 'active' : 'done'}><span>{loading ? <LoaderCircle className="spin" /> : <Check />}</span><div><strong>Understand your brief</strong><p>Extract audience, niche, goal, and budget signals.</p></div></li>
                <li className={loading ? 'active' : hasRun ? 'done' : ''}><span>{hasRun && !loading ? <Check /> : '2'}</span><div><strong>Score potential matches</strong><p>Compare creators against campaign fit.</p></div></li>
                <li className={loading ? '' : hasRun ? 'done' : ''}><span>{hasRun && !loading ? <Check /> : '3'}</span><div><strong>Write personal drafts</strong><p>Create a tailored starting point for each creator.</p></div></li>
                <li><span>4</span><div><strong>You stay in control</strong><p>Edit, approve, or reject. Test sending needs a final confirmation.</p></div></li>
              </ol>
              <div className="integration-card" id="configuration"><div className="integration-icon">n8n</div><div><strong>{isWebhookConfigured ? 'Webhook configured' : 'Ready for your n8n webhook'}</strong><p>{isWebhookConfigured ? 'Switch Demo mode off to use it.' : 'Add VITE_N8N_WEBHOOK_URL when available.'}</p></div><span className={isWebhookConfigured ? 'dot live' : 'dot'} /></div>
            </aside>
          </section>

          <section id="results" className="results-section">
            <div className="section-title"><div><span className="step">02</span><div><h2>Best-fit creators</h2><p>{prospects.length ? `${prospects.length} fictional prospects ranked for ${campaign.brandName}` : 'Run a campaign to discover prospects'}</p></div></div><span className="demo-label">DEMO DATA</span></div>
            {loading ? <div className="loading-state"><div className="scan"><Sparkles /><span /></div><h3>Finding the right creative fit…</h3><p>Reviewing niche, audience, budget, and campaign goals.</p></div> : prospects.length === 0 ? <div className="empty-state"><Search /><h3>No matches returned</h3><p>Try broadening your niche, platform, or campaign budget.</p></div> :
            <div className="results-layout">
              <div className="prospect-list" role="list">
                {prospects.map((prospect, index) => <button role="listitem" key={prospect.id} className={`prospect-card ${selected?.id === prospect.id ? 'selected' : ''}`} onClick={() => { setSelectedId(prospect.id); setEditing(false) }}>
                  <span className="rank">{String(index + 1).padStart(2, '0')}</span><span className="avatar" style={{ background: prospect.avatarColor }}>{initials(prospect.name)}</span>
                  <span className="prospect-main"><span className="name-line"><strong>{prospect.name}</strong><i>{prospect.platform}</i></span><small>{prospect.handle} · {prospect.niche}</small><span className="facts"><span><b>{compactNumber(prospect.followers)}</b> followers</span><span><b>{prospect.engagementRate}%</b> engagement</span><span><b>{money(prospect.estimatedRate)}</b> est. rate</span></span></span>
                  <span className="score"><strong>{prospect.matchScore}</strong><small>match</small></span><span className={`status ${prospect.status}`}>{statusLabels[prospect.status]}</span><ArrowRight className="card-arrow" size={18} />
                </button>)}
              </div>
              {selected && <DraftPanel key={selected.id + String(editing)} prospect={selected} editing={editing} demoMode={demoMode} onEdit={() => setEditing(true)} onCancel={() => setEditing(false)} onSave={saveDraft} onApprove={() => setStatus('approved')} onReject={() => setStatus('rejected')} />}
            </div>}
          </section>

          <section id="reply-intelligence" className="agent-section">
            <div className="section-title"><div><span className="step">03</span><div><h2>Reply Intelligence</h2><p>Understand creator intent and prepare the right next move.</p></div></div><span className="demo-label">HUMAN REVIEW</span></div>
            <div className="agent-grid">
              <article className="panel agent-form">
                <div className="mini-profile"><span className="avatar" style={{ background: selected?.avatarColor || '#ffb38a' }}>{initials(selected?.name || 'Sample Creator')}</span><div><strong>{selected?.name || 'Sample Creator'}</strong><small>{selected?.handle || '@samplecreator'} · Sample reply</small></div></div>
                <label>Creator reply<textarea rows={7} value={replyText} onChange={(event) => setReplyText(event.target.value)} placeholder="Paste a fictional creator reply here…" /></label>
                {replyError && <div className="error-box"><XCircle size={18} /><span>{replyError}</span></div>}
                <button className="primary-cta" onClick={runReplyIntelligence} disabled={replyLoading}>{replyLoading ? <><LoaderCircle className="spin" /> Classifying reply…</> : <><MessageSquareText size={18} /> Classify reply <ArrowRight size={18} /></>}</button>
                {!demoMode && <button className="secondary gmail-load" onClick={loadGmailReply} disabled={replyLoading}><Mail size={16} /> Load latest Gmail reply</button>}
              </article>
              <article className="panel intelligence-result">
                {!replyResult ? <div className="agent-placeholder"><MessageSquareText /><h3>Intent appears here</h3><p>Classify a sample reply into one of four clear outcomes.</p><div className="intent-list"><span>Interested</span><span>Rejected</span><span>Pricing Query</span><span>More Information</span></div></div> : <>
                  <div className="result-kicker">CLASSIFICATION</div><div className="classification-line"><span className={`classification ${replyResult.classification?.toLowerCase().replace(' ', '-')}`}>{replyResult.classification}</span><strong>{replyResult.confidence}% confidence</strong></div>
                  <div className="result-block"><span>Why</span><p>{replyResult.reasoning}</p></div>
                  <div className="next-action"><ArrowRight /><div><span>Suggested next action</span><p>{replyResult.suggestedAction}</p></div></div>
                  <p className="send-warning"><span /> Recommendation only — review before contacting anyone.</p>
                </>}
              </article>
            </div>
          </section>

          <section id="onboarding-agent" className="agent-section onboarding-section">
            <div className="section-title"><div><span className="step">04</span><div><h2>Onboarding Agent</h2><p>{onboardingSource ? `${onboardingSource}'s known details were auto-filled after an Interested reply.` : 'An Interested reply will automatically load the creator’s known details here.'}</p></div></div><span className="demo-label">{onboardingSource ? 'AUTO-FILLED' : 'WAITING FOR INTEREST'}</span></div>
            <div className="agent-grid onboarding-grid">
              <article className="panel agent-form">
                <div className="onboarding-fields">
                  {(Object.keys(onboarding) as (keyof OnboardingProspect)[]).map((key) => <label key={key}>{({ name:'Full name', email:'Email', platform:'Platform', handle:'Creator handle', country:'Country', agreedRate:'Agreed rate', contentFormat:'Content format', deadline:'Delivery deadline' })[key]}<input type={key === 'email' ? 'email' : key === 'deadline' ? 'date' : 'text'} value={onboarding[key]} onChange={(event) => setOnboarding((current) => ({ ...current, [key]: event.target.value }))} placeholder={key === 'email' ? 'creator@example.com' : key === 'agreedRate' ? 'e.g. ₹12,000' : ''} /></label>)}
                </div>
                {onboardingError && <div className="error-box"><XCircle size={18} /><span>{onboardingError}</span></div>}
                <button className="primary-cta" onClick={runOnboarding} disabled={onboardingLoading}>{onboardingLoading ? <><LoaderCircle className="spin" /> Checking details…</> : <><ClipboardCheck size={18} /> Assess onboarding status <ArrowRight size={18} /></>}</button>
              </article>
              <article className="panel intelligence-result onboarding-result">
                {!onboardingResult ? <div className="agent-placeholder"><ClipboardCheck /><h3>Status appears here</h3><p>Review completeness without inventing missing personal information.</p><div className="status-flow"><span>Pending</span><ArrowRight /><span>In Progress</span><ArrowRight /><span>Completed</span></div></div> : <>
                  <div className="result-kicker">ONBOARDING STATUS</div><div className={`onboarding-status ${onboardingResult.status.toLowerCase().replace(' ', '-')}`}><CheckCircle2 /><div><strong>{onboardingResult.status}</strong><span>{onboardingResult.missingFields.length ? `${onboardingResult.missingFields.length} required fields missing` : 'All required fields collected'}</span></div></div>
                  <div className="result-block"><span>Missing information</span><div className="missing-chips">{onboardingResult.missingFields.length ? onboardingResult.missingFields.map((field) => <i key={field}>{field}</i>) : <i className="complete">Nothing missing</i>}</div></div>
                  <div className="next-action"><Info /><div><span>Next action</span><p>{onboardingResult.nextAction}</p></div></div>
                </>}
              </article>
            </div>
          </section>

          {savedNotice && <div className="toast"><CheckCircle2 /> Draft saved for review</div>}
          <footer><div><Sparkles size={14} /> Biggbell AI Outreach Studio</div><p>Independent prototype · Synthetic creators · Gated authorized Gmail test</p></footer>
        </div>
      </main>
    </div>
  )
}

function DraftPanel({ prospect, editing, demoMode, onEdit, onCancel, onSave, onApprove, onReject }: { prospect: Prospect; editing: boolean; demoMode: boolean; onEdit: () => void; onCancel: () => void; onSave: (subject: string, message: string) => void; onApprove: () => void; onReject: () => void }) {
  const [subject, setSubject] = useState(prospect.outreach.subject)
  const [message, setMessage] = useState(prospect.outreach.message)
  const [sending, setSending] = useState(false)
  const [sendState, setSendState] = useState('')
  async function sendTestEmail() {
    if (!window.confirm(`Send this approved test email to ${prospect.email}?`)) return
    setSending(true); setSendState('')
    try { const result = await sendApprovedOutreach(prospect); setSendState(result.message) }
    catch (caught) { setSendState(caught instanceof Error ? caught.message : 'Email could not be sent.') }
    finally { setSending(false) }
  }
  return <article className="draft-panel">
    <div className="draft-head"><div><span>PERSONALIZED DRAFT</span><h3>{prospect.name}</h3></div><span className={`status ${prospect.status}`}>{statusLabels[prospect.status]}</span></div>
    <div className="match-reason"><Sparkles size={16} /><p><strong>Why this match</strong>{prospect.matchReason}</p></div>
    <div className="draft-content">
      <label>Subject</label>{editing ? <input value={subject} onChange={(e) => setSubject(e.target.value)} /> : <div className="subject-line">{prospect.outreach.subject}</div>}
      <label>Message</label>{editing ? <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={12} /> : <div className="message-copy">{prospect.outreach.message}</div>}
    </div>
    <div className="draft-actions">
      {editing ? <><button className="secondary" onClick={onCancel}>Cancel</button><button className="approve" onClick={() => onSave(subject, message)}><Check /> Save changes</button></> : <><button className="secondary" onClick={onEdit}><FilePenLine /> Edit draft</button><button className="reject" onClick={onReject} disabled={prospect.status === 'rejected'}><X /> Reject</button><button className="approve" onClick={onApprove} disabled={prospect.status === 'approved'}><Check /> {prospect.status === 'approved' ? 'Approved' : 'Approve'}</button></>}
    </div>
    {prospect.status === 'approved' && prospect.isTestProfile && !demoMode && <div className="draft-actions"><button className="approve" onClick={sendTestEmail} disabled={sending}><Mail /> {sending ? 'Sending…' : 'Send authorized test email'}</button></div>}
    <p className="send-warning"><span /> {prospect.isTestProfile && !demoMode ? 'Sending requires approval plus a final confirmation.' : 'Review action only — this will not send a message.'}</p>
    {sendState && <p className="send-warning">{sendState}</p>}
  </article>
}

export default App
