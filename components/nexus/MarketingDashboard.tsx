'use client'

import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  TrendingUp, 
  ThumbsUp, 
  MessageSquare, 
  Plus, 
  Search, 
  FileText, 
  Calendar, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  Download, 
  Upload, 
  Shield, 
  User, 
  Check, 
  X, 
  Clock, 
  ArrowUpRight, 
  Activity, 
  Flame, 
  BookOpen,
  Send,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Sample base data
interface NormalizedMetric {
  impressions: number;
  reach: number;
  clicks: number;
  reactions: number;
  comments: number;
  shares: number;
  formSubmissions: number;
  conversions: number;
}

interface SocialPost {
  id: string;
  platform: 'facebook' | 'instagram' | 'linkedin' | 'website' | 'email';
  caption: string;
  status: 'draft' | 'scheduled' | 'approved' | 'published' | 'failed';
  scheduledAt?: string;
  publishedAt?: string;
  mediaUrl?: string;
  approvedBy?: string;
}

interface SocialComment {
  id: string;
  postId: string;
  postTitle: string;
  platform: 'facebook' | 'instagram' | 'linkedin';
  author: string;
  body: string;
  createdAt: string;
  analysis?: {
    sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
    confidence: number;
    intent: 'question' | 'complaint' | 'praise' | 'purchase_interest' | 'support_request' | 'other';
    urgency: 'low' | 'medium' | 'high';
    topics: string[];
    complianceRisk: 'none' | 'low' | 'medium' | 'high';
    leadPotential: 'low' | 'medium' | 'high';
    recommendedAction: string;
  };
}

interface UploadedDoc {
  id: string;
  name: string;
  size: string;
  type: string;
  date: string;
  extractedText: string;
  topics: string[];
}

export const MarketingDashboard: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'scheduler' | 'sentiment' | 'docs' | 'reports'>('analytics');
  const [platformFilter, setPlatformFilter] = useState<'all' | 'facebook' | 'instagram' | 'linkedin' | 'website' | 'email'>('all');
  
  // Simulated Spike System Metrics
  const [spikeMultiplier, setSpikeMultiplier] = useState<number>(2);
  const [spikeThreshold, setSpikeThreshold] = useState<number>(100);
  const [spikeAlerts, setSpikeAlerts] = useState<Array<{
    id: string;
    postTitle: string;
    platform: string;
    metricValue: number;
    baselineValue: number;
    timestamp: string;
    stage: 'critical' | 'info';
  }>>([
    {
      id: 's1',
      postTitle: 'PAHS Football 2026 Continuity Support',
      platform: 'facebook',
      metricValue: 420,
      baselineValue: 120,
      timestamp: '10 mins ago',
      stage: 'critical'
    },
    {
      id: 's2',
      postTitle: 'Legacy Planning for Coal Region Families',
      platform: 'linkedin',
      metricValue: 280,
      baselineValue: 90,
      timestamp: '1 hour ago',
      stage: 'info'
    }
  ]);

  // Social KPI scorecards
  const rawMetrics: Record<string, NormalizedMetric> = {
    facebook: { impressions: 12500, reach: 9800, clicks: 840, reactions: 320, comments: 142, shares: 88, formSubmissions: 32, conversions: 12 },
    instagram: { impressions: 18200, reach: 14300, clicks: 1120, reactions: 950, comments: 218, shares: 145, formSubmissions: 18, conversions: 5 },
    linkedin: { impressions: 5400, reach: 3800, clicks: 420, reactions: 110, comments: 55, shares: 24, formSubmissions: 45, conversions: 18 },
    website: { impressions: 24500, reach: 18000, clicks: 3100, reactions: 0, comments: 42, shares: 0, formSubmissions: 124, conversions: 42 },
    email: { impressions: 4500, reach: 4100, clicks: 1850, reactions: 0, comments: 12, shares: 62, formSubmissions: 84, conversions: 31 }
  };

  // State arrays for Scheduling & Comments
  const [posts, setPosts] = useState<SocialPost[]>([
    { id: 'p1', platform: 'facebook', caption: 'Protecting Today. Securing Tomorrow. We’re proud to sponsor the upcoming Pottsvilles Area High School legacy program. #TheBeatGoesOn #SchuylkillCounty', status: 'approved', scheduledAt: '2026-05-24 10:00 AM', approvedBy: 'Patrick Latimore' },
    { id: 'p2', platform: 'linkedin', caption: 'How local business leaders coordinate cross-generational succession plans. Critical takeaways from our discussion with Sam Chivinski. Link in bio.', status: 'scheduled', scheduledAt: '2026-05-25 09:00 AM' },
    { id: 'p3', platform: 'instagram', caption: 'Secure your family legacy with an on-brand policy built by local specialists. 🍂 Family-first, Coal Region matters. #ProtectingToday #TheBeatGoesOn', status: 'draft' },
    { id: 'p4', platform: 'facebook', caption: 'Luzerne County Latino business assets protection playbook is now live! Transcending barriers with Spanish speaking support. 🇺🇸🇵🇷', status: 'published', publishedAt: '2026-05-18 02:30 PM', approvedBy: 'Patrick Latimore' },
    { id: 'p5', platform: 'linkedin', caption: 'Audit Checklist for life and legacy planning - Schuylkill Valley businesses.', status: 'failed', scheduledAt: '2026-05-15 11:15 AM' }
  ]);

  const [comments, setComments] = useState<SocialComment[]>([
    { id: 'c1', postId: 'p1', postTitle: 'PAHS Football sponsoring', platform: 'facebook', author: 'Markus D.', body: 'This is amazing. How do we apply for the sponsor matching option for our local youth league?', createdAt: '2026-05-21 08:30 AM' },
    { id: 'c2', postId: 'p2', postTitle: 'Succession Planning Checklist', platform: 'linkedin', author: 'Ericka L.', body: 'Are there specific tax regulatory frameworks with lifetime trust limits that Schuylkill county residents should prepare for?', createdAt: '2026-05-20T14:40:00Z', analysis: {
      sentiment: 'neutral',
      confidence: 0.94,
      intent: 'question',
      urgency: 'low',
      topics: ['succession', 'taxes', 'trusts'],
      complianceRisk: 'none',
      leadPotential: 'medium',
      recommendedAction: 'Provide standard Schuylkill valley succession literature.'
    }},
    { id: 'c3', postId: 'p1', postTitle: 'PAHS Football sponsoring', platform: 'facebook', author: 'Samantha K.', body: 'I lost my brother last year and our school support team was legendary. Heartwarming to see Latimore sponsoring this program. Thank you, Patrick.', createdAt: '2026-05-20 12:15 PM' },
    { id: 'c4', postId: 'p4', postTitle: 'Latino Market Launch', platform: 'facebook', author: 'Ramon V.', body: '¿Ofrecen asesoría en español sobre seguros de vida con ahorro? Interesado para mi negocio familiar.', createdAt: '2026-05-19T10:08:00Z' }
  ]);

  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([
    { id: 'doc1', name: 'Sponsorship-Guide-Pottsville-Athletics.pdf', size: '1.4 MB', type: 'PDF', date: '2026-05-18', extractedText: 'PAHS legacy initiative sponsors guidelines. Priority is community integration first. G-WZWMX83WXQ reference analytics target page views and organic signup CTA click parameters.', topics: ['pottsville', 'sponsorship', 'youth'] },
    { id: 'doc2', name: 'Schuylkill-Succession-Policy-Brief.docx', size: '840 KB', type: 'DOCX', date: '2026-05-15', extractedText: 'Succession audit guidelines outline for life & legacy. Compliance checklist metrics and capital gains frameworks rules.', topics: ['succession', 'compliance', 'Schuylkill'] }
  ]);

  // UI state for creating a post
  const [newPostPlatform, setNewPostPlatform] = useState<'facebook' | 'instagram' | 'linkedin'>('facebook');
  const [newPostCaption, setNewPostCaption] = useState('');
  const [newPostDate, setNewPostDate] = useState('');
  const [postNeedsApproval, setPostNeedsApproval] = useState(true);

  // UI State for AI analysis
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const [analyzingCommentId, setAnalyzingCommentId] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // UI state for document-derived content generator
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>('doc1');
  const [customGenTarget, setCustomGenTarget] = useState<'social' | 'email' | 'ad'>('social');
  const [customGenOutput, setCustomGenOutput] = useState('');
  const [customGenLoading, setCustomGenLoading] = useState(false);

  // Simulation controls
  const [simulationMetric, setSimulationMetric] = useState<'impressions' | 'clicks' | 'reactions' | 'formSubmissions'>('clicks');
  const [simulationPlatform, setSimulationPlatform] = useState<'facebook' | 'instagram' | 'linkedin'>('facebook');
  const [simulationValue, setSimulationValue] = useState<number>(300);

  // Active aggregated values based on platformFilter
  const getAggregatedMetrics = () => {
    if (platformFilter === 'all') {
      const all: NormalizedMetric = { impressions: 0, reach: 0, clicks: 0, reactions: 0, comments: 0, shares: 0, formSubmissions: 0, conversions: 0 };
      Object.values(rawMetrics).forEach(m => {
        all.impressions += m.impressions;
        all.reach += m.reach;
        all.clicks += m.clicks;
        all.reactions += m.reactions;
        all.comments += m.comments;
        all.shares += m.shares;
        all.formSubmissions += m.formSubmissions;
        all.conversions += m.conversions;
      });
      return all;
    }
    return rawMetrics[platformFilter] || rawMetrics.facebook;
  };

  const agg = getAggregatedMetrics();
  const engagementRate = agg.reach > 0 ? (((agg.reactions + agg.comments + agg.clicks + agg.shares) / agg.reach) * 100).toFixed(1) : '0.0';
  const conversionRate = agg.clicks > 0 ? ((agg.conversions / agg.clicks) * 100).toFixed(1) : '0.0';

  // Handle sentiment analysis with actual server call (Gemini SDK)
  const analyzeComment = async (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    setAnalyzingCommentId(commentId);
    setAiError(null);

    try {
      const response = await fetch('/api/social/analyse-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentText: comment.body, author: comment.author })
      });

      if (!response.ok) {
        throw new Error('Analysis request failed on server.');
      }

      const result = await response.json();
      
      setComments(prev => prev.map(c => {
        if (c.id === commentId) {
          return {
            ...c,
            analysis: result
          };
        }
        return c;
      }));

      // Automatically select the comment for sidebar view
      setSelectedCommentId(commentId);

      // Check for spike or immediate compliance notification if high urgency
      if (result.urgency === 'high') {
        const matchingPost = posts.find(p => p.id === comment.postId) || { caption: 'Sponsor Program' };
        setSpikeAlerts(prev => [
          {
            id: 'alert-' + Date.now(),
            postTitle: `Urgent Inbound comment re: ${matchingPost.caption.slice(0, 30)}...`,
            platform: comment.platform,
            metricValue: 1,
            baselineValue: 0,
            timestamp: 'Just now',
            stage: 'critical'
          },
          ...prev
        ]);
      }
    } catch (e: any) {
      console.error(e);
      setAiError(e.message || 'Error executing Gemini API call.');
    } finally {
      setAnalyzingCommentId(null);
    }
  };

  // Content Generation backed by Doc Extraction via Copilot endpoint
  const generateFromDocument = async () => {
    const doc = uploadedDocs.find(d => d.id === selectedDocumentId);
    if (!doc) return;

    setCustomGenLoading(true);
    setCustomGenOutput('');
    try {
      const prompt = `Based on the attached document context: "${doc.extractedText}"
      Generate a compelling, highly on-brand ${customGenTarget} campaign artifact.
      Target Audience: Coal Region and Pottsville families.
      Include Latimore motto: "Protecting Today. Securing Tomorrow." and #TheBeatGoesOn.
      Tone: Mission-driven, respectful, compliant, high-end professional.`;

      const response = await fetch('/api/admin/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          history: [],
          fileSystem: {}
        })
      });

      if (!response.ok) {
        throw new Error('Failed to query Copilot API.');
      }

      const data = await response.json();
      setCustomGenOutput(data.content || 'Error parsing generated copy.');
    } catch (e: any) {
      setCustomGenOutput(`Failed to craft copy: ${e.message}`);
    } finally {
      setCustomGenLoading(false);
    }
  };

  // Submit Social Post Creation
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostCaption.trim()) return;

    const newPost: SocialPost = {
      id: 'p-' + Date.now(),
      platform: newPostPlatform,
      caption: newPostCaption,
      status: postNeedsApproval ? 'draft' : 'scheduled',
      scheduledAt: newPostDate || 'Tomorrow 10:00 AM'
    };

    setPosts(prev => [newPost, ...prev]);
    setNewPostCaption('');
    setNewPostDate('');
    alert(`Post Created! Status: ${newPost.status.toUpperCase()}`);
  };

  // Approve scheduled draft
  const approvePost = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          status: 'approved',
          approvedBy: 'Patrick Latimore'
        };
      }
      return p;
    }));
  };

  // Publish trigger simulator
  const simulatePublish = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          status: 'published',
          publishedAt: 'Just Now'
        };
      }
      return p;
    }));
    alert('Simulated Direct API publish. Success payload returned.');
  };

  // Simulated Spike Event Injector
  const triggerSimulation = () => {
    // Add positive spike
    if (simulationValue >= spikeThreshold * spikeMultiplier) {
      setSpikeAlerts(prev => [
        {
          id: 'sim-' + Date.now(),
          postTitle: `Simulated Performance spike directly on ${simulationPlatform.toUpperCase()}`,
          platform: simulationPlatform,
          metricValue: simulationValue,
          baselineValue: spikeThreshold,
          timestamp: 'Just now',
          stage: 'critical'
        },
        ...prev
      ]);
    }
    alert(`Simulated webhook injected successfully: Platform Event ${simulationPlatform.toUpperCase()} recorded ${simulationValue} ${simulationMetric}!`);
  };

  // Branded PDF exporter view handler
  const handlePrintWeeklyReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[rgba(44,62,80,0.12)] pb-4">
        <div>
          <h2 className="text-lg font-bold text-[#2C3E50] tracking-tight flex items-center gap-2">
            <Share2 className="text-[#C49A6C]" size={20} />
            Social Engagement Intelligence
          </h2>
          <p className="text-xs text-[#6b6b6b] mt-0.5">
            Cross-platform campaign routing, automated sentiment analysis, spike alert engine and document audit.
          </p>
        </div>
        
        {/* Sub Navigation Tabs */}
        <div className="flex bg-[#fcfbf9] border border-[rgba(44,62,80,0.12)] rounded-lg p-1 shrink-0">
          {[
            { id: 'analytics', label: 'Analytics & Spikes', icon: TrendingUp },
            { id: 'scheduler', label: 'Social Scheduler', icon: Calendar },
            { id: 'sentiment', label: 'Comments AI Feed', icon: MessageSquare },
            { id: 'docs', label: 'Document Grounding', icon: FileText },
            { id: 'reports', label: 'Weekly Reports', icon: BookOpen }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold tracking-tight transition-all duration-150 ${
                activeSubTab === tab.id 
                  ? 'bg-[#2C3E50] text-white shadow-sm'
                  : 'text-[#6b6b6b] hover:text-[#2C3E50] hover:bg-black/5'
              }`}
            >
              <tab.icon size={13} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Sections */}
      <AnimatePresence mode="wait">
        
        {/* ANALYTICS TAB */}
        {activeSubTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Simulation Sidebar & Platform Filter Combo */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#fdfcfa] border border-[rgba(44,62,80,0.12)] p-3 rounded-xl shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#2C3E50]">Filter Channel:</span>
                <div className="flex flex-wrap gap-1">
                  {['all', 'facebook', 'instagram', 'linkedin', 'website', 'email'].map(p => (
                    <button
                      key={p}
                      onClick={() => setPlatformFilter(p as any)}
                      className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-md transition-all ${
                        platformFilter === p 
                          ? 'bg-[#E8D5B7] text-[#8B6A45] border border-[#C49A6C]/30'
                          : 'bg-[#f5f4f1] border border-transparent text-[#6b6b6b] hover:text-[#1a1a1a]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-xs bg-[#2C3E50]/5 border border-[#2C3E50]/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
                <span className="font-semibold text-[11px] text-[#2C3E50]">Primary GA4 Source:</span>
                <code className="text-[10px] font-bold text-[#8B6A45] bg-[#2C3E50]/10 px-1 rounded">G-S0Q3E4DEBJ</code>
              </div>
            </div>

            {/* Scorecard grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-[rgba(44,62,80,0.12)] rounded-xl p-4 shadow-sm relative overflow-hidden group">
                <div className="text-[10px] uppercase tracking-wider text-[#6b6b6b] font-bold">Impressions / Reach</div>
                <div className="text-2xl font-bold text-[#2C3E50] mt-2 tracking-tight">
                  {agg.impressions.toLocaleString()} <span className="text-xs text-[#9a9a9a] font-normal">/ {agg.reach.toLocaleString()}</span>
                </div>
                <div className="text-[10px] text-[#3d8b5a] mt-1 font-medium flex items-center gap-0.5">
                  <ArrowUpRight size={10} /> +12% vs last week
                </div>
                <div className="absolute right-3 top-3 opacity-10 text-[#2C3E50] group-hover:opacity-20 transition-all">
                  <Activity size={24} />
                </div>
              </div>

              <div className="bg-white border border-[rgba(44,62,80,0.12)] rounded-xl p-4 shadow-sm relative overflow-hidden group">
                <div className="text-[10px] uppercase tracking-wider text-[#6b6b6b] font-bold">Clicks & CTAs</div>
                <div className="text-2xl font-bold text-[#2C3E50] mt-2 tracking-tight">
                  {agg.clicks.toLocaleString()}
                </div>
                <div className="text-[10px] text-[#3d8b5a] mt-1 font-medium flex items-center gap-0.5">
                  <ArrowUpRight size={10} /> +8.4% conversion velocity
                </div>
                <div className="absolute right-3 top-3 opacity-10 text-[#2C3E50] group-hover:opacity-20 transition-all">
                  <Sparkles size={24} />
                </div>
              </div>

              <div className="bg-white border border-[rgba(44,62,80,0.12)] rounded-xl p-4 shadow-sm relative overflow-hidden group">
                <div className="text-[10px] uppercase tracking-wider text-[#6b6b6b] font-bold">Engagement Rate</div>
                <div className="text-2xl font-bold text-[#2C3E50] mt-2 tracking-tight">
                  {engagementRate}%
                </div>
                <div className="text-[10px] text-amber-600 mt-1 font-medium flex items-center gap-0.5">
                  <Activity size={10} /> High brand resonance
                </div>
                <div className="absolute right-3 top-3 opacity-10 text-[#2C3E50] group-hover:opacity-20 transition-all">
                  <ThumbsUp size={24} />
                </div>
              </div>

              <div className="bg-white border border-[rgba(44,62,80,0.12)] rounded-xl p-4 shadow-sm relative overflow-hidden group">
                <div className="text-[10px] uppercase tracking-wider text-[#6b6b6b] font-bold">Attributed Leads</div>
                <div className="text-2xl font-bold text-[#C49A6C] mt-2 tracking-tight">
                  {agg.formSubmissions} <span className="text-xs text-[#2C3E50] font-normal">({conversionRate}% conv.)</span>
                </div>
                <div className="text-[10px] text-[#3d8b5a] mt-1 font-medium flex items-center gap-0.5">
                  <CheckCircle size={10} /> CRM attributed sync active
                </div>
                <div className="absolute right-3 top-3 opacity-10 text-[#2C3E50] group-hover:opacity-20 transition-all">
                  <User size={24} />
                </div>
              </div>
            </div>

            {/* Spike alert widget and Interactive Multipliers */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 bg-white border border-[rgba(44,62,80,0.12)] p-4 rounded-xl shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-[#f5f4f1] pb-3">
                  <div>
                    <h3 className="text-xs font-bold text-[#2C3E50] uppercase tracking-wider flex items-center gap-1.5">
                      <Flame className="text-[#C49A6C] animate-pulse" size={15} />
                      Real-time Spike Alerts
                    </h3>
                    <p className="text-[10px] text-[#6b6b6b]">Automated detection on high volume webhook signals</p>
                  </div>
                  
                  {/* Controls to adjust algorithm */}
                  <div className="flex gap-3 text-[11px]">
                    <div>
                      <span className="text-[#6b6b6b]">Multiplier: </span>
                      <select 
                        value={spikeMultiplier} 
                        onChange={(e) => setSpikeMultiplier(Number(e.target.value))}
                        className="font-bold text-[#2C3E50] outline-none border rounded border-slate-200 px-1 py-0.5 bg-white"
                      >
                        <option value={1.5}>1.5x</option>
                        <option value={2}>2.0x</option>
                        <option value={3}>3.0x</option>
                      </select>
                    </div>
                    <div>
                      <span className="text-[#6b6b6b]">Baseline: </span>
                      <select 
                        value={spikeThreshold} 
                        onChange={(e) => setSpikeThreshold(Number(e.target.value))}
                        className="font-bold text-[#2C3E50] outline-none border rounded border-slate-200 px-1 py-0.5 bg-white"
                      >
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                        <option value={200}>200</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 max-h-[160px] overflow-y-auto">
                  {spikeAlerts.map(alert => (
                    <div 
                      key={alert.id}
                      className={`p-3 rounded-lg border flex gap-3 items-start justify-between ${
                        alert.metricValue >= (alert.baselineValue * spikeMultiplier)
                          ? 'bg-rose-50/70 border-rose-100 text-[#b33030]'
                          : 'bg-amber-50/50 border-amber-100 text-[#b37400]'
                      }`}
                    >
                      <div className="flex gap-2.5 items-start">
                        <AlertTriangle className="mt-0.5 shrink-0" size={14} />
                        <div>
                          <div className="text-xs font-semibold">{alert.postTitle}</div>
                          <div className="text-[10px] opacity-75 mt-0.5">
                            Platform: <span className="uppercase font-bold">{alert.platform}</span> • Vol: {alert.metricValue} vs baseline: {alert.baselineValue}
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] font-medium shrink-0 opacity-75">{alert.timestamp}</div>
                    </div>
                  ))}
                </div>

                {/* Simulated Webhook Injector */}
                <div className="bg-[#f9f8f6] p-3 rounded-lg border border-[rgba(44,62,80,0.12)]">
                  <div className="text-[10px] uppercase font-bold text-[#2C3E50] mb-2">Simulated Event Injector (GA4 webhook mock)</div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <select 
                      value={simulationPlatform} 
                      onChange={(e) => setSimulationPlatform(e.target.value as any)}
                      className="bg-white border rounded p-1 px-1.5 text-[11px] outline-none"
                    >
                      <option value="facebook">Facebook</option>
                      <option value="instagram">Instagram</option>
                      <option value="linkedin">LinkedIn</option>
                    </select>
                    <select 
                      value={simulationMetric} 
                      onChange={(e) => setSimulationMetric(e.target.value as any)}
                      className="bg-white border rounded p-1 px-1.5 text-[11px] outline-none"
                    >
                      <option value="clicks">CTA & Clicks</option>
                      <option value="reactions">Reactions</option>
                      <option value="formSubmissions">Form leads</option>
                    </select>
                    <input 
                      type="number" 
                      value={simulationValue} 
                      onChange={(e) => setSimulationValue(Number(e.target.value))}
                      className="bg-white border rounded p-1 text-[11px] w-20 outline-none"
                    />
                    <button 
                      onClick={triggerSimulation}
                      className="bg-[#2C3E50] hover:bg-[#C49A6C] text-white text-[10px] font-bold px-3.5 py-1.5 rounded-md transition-all shrink-0 ml-auto"
                    >
                      Inject Webhook
                    </button>
                  </div>
                </div>
              </div>

              {/* Engagement Trend beautiful customized SVG lines */}
              <div className="bg-white border border-[rgba(44,62,80,0.12)] p-4 rounded-xl shadow-sm space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-[#2C3E50] uppercase tracking-wider">Metrics Timeline Trend</h3>
                  <p className="text-[10px] text-[#6b6b6b]">Relative reach performance (cumulative over trailing 6 days)</p>
                </div>

                <div className="h-44 w-full bg-slate-50 border rounded-lg py-2 relative flex flex-col justify-end">
                  {/* Grid background lines */}
                  <div className="absolute inset-x-0 top-1/4 border-t border-slate-200/50"></div>
                  <div className="absolute inset-x-0 top-2/4 border-t border-slate-200/50"></div>
                  <div className="absolute inset-x-0 top-3/4 border-t border-slate-200/50"></div>
                  
                  {/* High Quality Styled Area SVG Chart */}
                  <svg className="w-[100%] h-[105px] absolute bottom-6 z-10" viewBox="0 0 100 50" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="gradientGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(196, 154, 108, 0.45)" />
                        <stop offset="100%" stopColor="rgba(196, 154, 108, 0)" />
                      </linearGradient>
                    </defs>
                    {/* Fill */}
                    <path d="M 0 50 Q 20 18, 40 32 T 80 12 T 100 4 L 100 50 Z" fill="url(#gradientGrad)" />
                    {/* Line */}
                    <path d="M 0 50 Q 20 18, 40 32 T 80 12 T 100 4" fill="none" stroke="#C49A6C" strokeWidth="1.5" />
                  </svg>

                  {/* Axis indicators */}
                  <div className="flex justify-between px-3 text-[9px] font-mono text-slate-400 mt-2 border-t pt-1 z-20 bg-slate-50">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>

                  {/* Absolute interactive stats label */}
                  <div className="absolute top-4 left-4 bg-white/90 border border-slate-100 px-2 py-1 rounded text-[10px] font-semibold text-[#2C3E50] shadow-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C49A6C]"></span>
                    Conversion Peak: 14.8% (Thu)
                  </div>
                </div>
              </div>

            </div>

            {/* Campaign Funnel Lead Attribution Checklist */}
            <div className="bg-white border border-[rgba(44,62,80,0.12)] p-4 rounded-xl shadow-sm">
              <h3 className="text-xs font-bold text-[#2C3E50] uppercase tracking-wider mb-4">Cross-platform Funnel Lead Attribution Checklist</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { stage: '1. Brand Impressions', value: agg.impressions, pct: '100%', color: 'bg-[#2C3E50]/70' },
                  { stage: '2. Profile Reach', value: agg.reach, pct: ((agg.reach / agg.impressions) * 100).toFixed(0) + '%', color: 'bg-[#2C3E50]/80' },
                  { stage: '3. CTA Enquiries', value: agg.clicks, pct: ((agg.clicks / agg.reach) * 100).toFixed(0) + '%', color: 'bg-[#C49A6C]' },
                  { stage: '4. Signed Conversions', value: agg.formSubmissions, pct: ((agg.formSubmissions / agg.clicks) * 100).toFixed(0) + '%', color: 'bg-[#A37B50]' }
                ].map((funnel, index) => (
                  <div key={index} className="border border-slate-100 p-3 rounded-lg flex flex-col justify-between space-y-2">
                    <div className="text-[10px] font-bold text-[#6b6b6b] uppercase">{funnel.stage}</div>
                    <div>
                      <div className="text-xl font-bold text-slate-800">{funnel.value.toLocaleString()}</div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
                        <div className={`h-[100%] ${funnel.color}`} style={{ width: funnel.pct }}></div>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400">Yield conversion profile: <span className="font-bold text-[#2C3E50]">{funnel.pct}</span></div>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        )}

        {/* SOCIAL SCHEDULER TAB */}
        {activeSubTab === 'scheduler' && (
          <motion.div
            key="scheduler"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Entry Form */}
            <div className="bg-white border border-[rgba(44,62,80,0.12)] p-4 rounded-xl shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-xs font-bold text-[#2C3E50] uppercase tracking-wider">Draft New Social Post</h3>
                <p className="text-[10px] text-[#6b6b6b]">Submit compliant social campaigns</p>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[#6b6b6b] mb-1 font-semibold">Select Target Platform</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['facebook', 'instagram', 'linkedin'].map(p => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setNewPostPlatform(p as any)}
                        className={`py-1.5 rounded-md uppercase font-bold text-[9px] border transition-all ${
                          newPostPlatform === p 
                            ? 'bg-[#2C3E50] text-white border-[#2C3E50]'
                            : 'bg-white border-slate-200 text-[#6b6b6b] hover:bg-slate-50'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[#6b6b6b] mb-1 font-semibold font-sans">Caption Draft</label>
                  <textarea
                    value={newPostCaption}
                    onChange={(e) => setNewPostCaption(e.target.value)}
                    rows={4}
                    placeholder="Input post draft content here. Make sure legacy insurance compliance flags are handled..."
                    className="w-full bg-[#fcfbf9] border border-slate-200 rounded-lg p-2 resize-none outline-none focus:border-[#C49A6C] font-sans"
                  />
                  <div className="mt-1 flex justify-between text-[10px] text-[#9a9a9a]">
                    <span>Character count: {newPostCaption.length}</span>
                    <span className="text-[#8B6A45] font-semibold">#TheBeatGoesOn suggested</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[#6b6b6b] mb-1 font-semibold">Schedule Time (Optional)</label>
                  <input
                    type="datetime-local"
                    value={newPostDate}
                    onChange={(e) => setNewPostDate(e.target.value)}
                    className="w-full bg-[#fcfbf9] border border-slate-200 rounded-lg p-2 outline-none focus:border-[#C49A6C]"
                  />
                </div>

                {/* Insurance Regulation Guard checkbox */}
                <div className="bg-amber-50/50 p-2.5 rounded-lg border border-amber-100/60 flex items-start gap-2 text-[10px] text-[#8b7400]">
                  <Shield size={14} className="mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold">Insurance Regulation Guard:</span>
                    <p className="opacity-80 mt-0.5">Regulated insurance and legacy offerings require explicit principal review.</p>
                    <label className="flex items-center gap-1.5 mt-1.5 cursor-pointer font-bold">
                      <input 
                        type="checkbox" 
                        checked={postNeedsApproval} 
                        onChange={(e) => setPostNeedsApproval(e.target.checked)}
                        className="rounded accent-[#C49A6C]"
                      />
                      Route to Principal Review Queue
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#2C3E50] hover:bg-[#C49A6C] text-white py-2 rounded-lg font-bold transition-all text-xs flex justify-center items-center gap-1.5"
                >
                  <Plus size={14} /> Schedule Post
                </button>
              </form>
            </div>

            {/* Posting Queue & Audit history */}
            <div className="lg:col-span-2 bg-white border border-[rgba(44,62,80,0.12)] p-4 rounded-xl shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-xs font-bold text-[#2C3E50] uppercase tracking-wider">Campaign Posting Pipeline</h3>
                  <p className="text-[10px] text-[#6b6b6b]">Post lifecycle: Draft, Scheduled, Approved & Published with compliance audits</p>
                </div>
                
                <span className="text-[10px] bg-slate-100 text-[#2C3E50] px-2.5 py-1 rounded-full font-bold">
                  {posts.length} Campaigns Loaded
                </span>
              </div>

              <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                {posts.map(post => (
                  <div key={post.id} className="border border-slate-100 rounded-lg p-3 hover:border-slate-200 transition-all flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
                    <div className="space-y-1.5 flex-1 select-all">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] bg-[#C49A6C]/15 border border-[#C49A6C]/20 text-[#8B6A45] font-bold uppercase rounded px-2 py-0.5 shadow-sm">
                          {post.platform}
                        </span>
                        
                        {/* Status Badges */}
                        <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                          post.status === 'published' ? 'bg-[#d4edda] text-[#3d8b5a]' :
                          post.status === 'approved' ? 'bg-[#ddeeff] text-[#1a6fa8]' :
                          post.status === 'scheduled' ? 'bg-amber-100/70 text-amber-700' :
                          post.status === 'failed' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-[#6B6B6B]'
                        }`}>
                          {post.status}
                        </span>

                        <span className="text-[10px] text-[#9a9a9a] font-mono">ID: {post.id}</span>
                      </div>
                      
                      <p className="text-xs leading-relaxed text-[#2c3e50] font-sans font-medium">"{post.caption}"</p>
                      
                      {post.approvedBy && (
                        <div className="text-[9px] text-slate-400 font-bold flex items-center gap-0.5">
                          <Check size={11} className="text-[#3d8b5a]" /> Approved & audited by {post.approvedBy}
                        </div>
                      )}
                    </div>

                    {/* Operational triggers */}
                    <div className="flex items-center gap-2 shrink-0 text-xs w-full md:w-auto justify-end border-t md:border-t-0 pt-2 md:pt-0">
                      {post.status === 'draft' && (
                        <button
                          onClick={() => approvePost(post.id)}
                          className="bg-[#fcfbf9] border border-emerald-500/30 hover:bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded"
                        >
                          Approve Draft
                        </button>
                      )}

                      {post.status === 'approved' && (
                        <button
                          onClick={() => simulatePublish(post.id)}
                          className="bg-[#2C3E50] hover:bg-[#3d8b5a] text-white text-[10px] font-bold px-2.5 py-1 rounded"
                        >
                          Simulate Direct Publish
                        </button>
                      )}

                      <span className="text-[10px] font-mono text-[#9a9a9a]">
                        {post.status === 'published' ? `Published: ${post.publishedAt}` : `Sch: ${post.scheduledAt || 'Not Scheduled'}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* SENTIMENT FEED TAB */}
        {activeSubTab === 'sentiment' && (
          <motion.div
            key="sentiment"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Main feed list */}
            <div className="lg:col-span-2 bg-white border border-[rgba(44,62,80,0.12)] p-4 rounded-xl shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-bold text-[#2C3E50] uppercase tracking-wider">Inbound Comments Sentiment AI feed</h3>
                  <p className="text-[10px] text-[#6b6b6b]">Real-time sentiment and topic analysis powered by Gemini Flash-Lite</p>
                </div>
                
                <span className="text-[10px] text-slate-400 bg-slate-50 border border-slate-100 px-2 py-1 rounded font-mono">
                  Routing rules: Gemini default-lite
                </span>
              </div>

              {aiError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-xs flex justify-between items-center">
                  <span>{aiError}</span>
                  <button onClick={() => setAiError(null)}>
                    <X size={14} />
                  </button>
                </div>
              )}

              <div className="space-y-3.5 max-h-[440px] overflow-y-auto pr-1">
                {comments.map(c => {
                  const hasAnalysis = !!c.analysis;
                  
                  return (
                    <div 
                      key={c.id} 
                      onClick={() => setSelectedCommentId(c.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-2.5 ${
                        selectedCommentId === c.id 
                          ? 'border-[#C49A6C] bg-[#fdfcfa] shadow-sm ring-1 ring-[#C49A6C]/25' 
                          : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-[#2C3E50]/10 rounded-full flex items-center justify-center font-bold text-[10px] text-[#2C3E50]">
                            {c.author[0]}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800">{c.author}</span>
                            <span className="text-[9px] text-[#9a9a9a] uppercase font-bold ml-1.5">{c.platform}</span>
                          </div>
                        </div>
                        
                        <div className="text-[9px] text-slate-400 font-mono">{c.createdAt}</div>
                      </div>

                      <p className="text-xs text-[#2c3e50] font-sans">"{c.body}"</p>

                      <div className="flex justify-between items-center border-t border-slate-50 pt-2 flex-wrap gap-2">
                        <span className="text-[10px] text-[#9a9a9a]">Related: <span className="italic font-medium">"{c.postTitle}"</span></span>
                        
                        <div className="flex gap-1.5">
                          {hasAnalysis ? (
                            <>
                              <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                                c.analysis?.sentiment === 'positive' ? 'bg-[#d4edda] text-[#3d8b5a]' :
                                c.analysis?.sentiment === 'negative' ? 'bg-rose-100 text-rose-700' :
                                'bg-slate-100 text-[#6b6b6b]'
                              }`}>
                                {c.analysis?.sentiment}
                              </span>
                              
                              <span className="text-[9px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded">
                                Intent: {c.analysis?.intent}
                              </span>
                            </>
                          ) : (
                            <button
                              disabled={analyzingCommentId === c.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                analyzeComment(c.id);
                              }}
                              className="bg-[#2C3E50] hover:bg-[#C49A6C] text-white text-[9px] font-bold px-3 py-1 rounded transition-all flex items-center gap-1"
                            >
                              {analyzingCommentId === c.id ? (
                                <>
                                  <Loader2 className="animate-spin" size={10} /> Analyzing...
                                </>
                              ) : (
                                <>
                                  <Sparkles size={10} /> Run AI Analysis
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sidebar Inspector details */}
            <div className="bg-[#fcfbf9] border border-[rgba(44,62,80,0.12)] p-4 rounded-xl shadow-sm space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-xs font-bold text-[#2C3E50] uppercase tracking-wider flex items-center gap-1.5">
                  <Shield size={14} className="text-[#C49A6C]" />
                  Sentinel Audit Panel
                </h3>
              </div>

              {selectedCommentId ? (() => {
                const active = comments.find(c => c.id === selectedCommentId);
                if (!active) return <p className="text-xs text-[#6b6b6b]">Select comment to inspect.</p>;
                const analysis = active.analysis;

                return (
                  <div className="space-y-4 text-xs">
                    <div className="bg-white p-3 border rounded-xl space-y-2">
                      <div className="text-[10px] uppercase font-bold text-[#9a9a9a]">Selected Inbound Msg</div>
                      <p className="font-semibold text-[#2C3E50]">"{active.body}"</p>
                      <div className="text-[10px] text-[#6b6b6b] italic font-sans">— Raised by {active.author} ({active.platform})</div>
                    </div>

                    {analysis ? (
                      <div className="space-y-3.5">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white p-2 border border-slate-100 rounded-lg">
                            <span className="text-[9px] uppercase font-bold text-[#6b6b6b]">Sentiment score</span>
                            <div className="text-sm font-bold text-slate-800 capitalize mt-0.5 flex items-center justify-between">
                              {analysis.sentiment}
                              <span className="text-[10px] text-[#4ade80] font-mono">{(analysis.confidence * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                          
                          <div className="bg-white p-2 border border-slate-100 rounded-lg">
                            <span className="text-[9px] uppercase font-bold text-[#6b6b6b]">Urgency urgency</span>
                            <span className={`block text-xs font-bold uppercase mt-1 ${
                              analysis.urgency === 'high' ? 'text-rose-600' : 'text-[#6b6b6b]'
                            }`}>
                              {analysis.urgency}
                            </span>
                          </div>
                        </div>

                        <div className="bg-white p-3 border border-slate-100 rounded-xl space-y-1">
                          <span className="text-[9px] uppercase font-bold text-[#6b6b6b] block">Categorized Topics</span>
                          <div className="flex flex-wrap gap-1 pt-1">
                            {analysis.topics.map(t => (
                              <span key={t} className="text-[9px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded">
                                #{t}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white p-2 border border-slate-100 rounded-lg">
                            <span className="text-[9px] uppercase font-bold text-[slate-400]">Lead Potential</span>
                            <span className={`block text-xs font-bold uppercase mt-1 ${
                              analysis.leadPotential === 'high' ? 'text-emerald-600' : 'text-[#6b6b6b]'
                            }`}>
                              {analysis.leadPotential}
                            </span>
                          </div>
                          
                          <div className="bg-white p-2 border border-slate-100 rounded-lg">
                            <span className="text-[9px] uppercase font-bold text-[slate-400] flex items-center gap-0.5">
                              Compliance Risk
                            </span>
                            <span className="block text-xs font-bold text-[#b37400] uppercase mt-1">
                              {analysis.complianceRisk}
                            </span>
                          </div>
                        </div>

                        <div className="bg-[#2C3E50] p-3 rounded-xl border border-[rgba(44,62,80,0.12)] text-white space-y-1.5 shadow-sm">
                          <h4 className="text-[10px] uppercase font-bold text-[#C49A6C] tracking-wide flex items-center gap-1">
                            <Send size={11} /> AI Suggested Response Copy
                          </h4>
                          <p className="text-[11px] leading-relaxed italic opacity-95 font-sans font-medium">
                            "{analysis.recommendedAction}"
                          </p>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(analysis.recommendedAction);
                              alert('Reply draft copied to dashboard clipboard!');
                            }}
                            className="text-[9px] text-[#C49A6C] font-bold underline cursor-pointer hover:text-white transition-all pt-1 block"
                          >
                            Copy Copy Response Copy
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 border border-dashed rounded-lg bg-white">
                        <Sparkles size={24} className="text-[#C49A6C] opacity-40 mb-2" />
                        <p className="text-[11px] text-[#6b6b6b] text-center max-w-[200px]">
                          This comment has not been analyzed yet. Run AI Analysis to evaluate sentiment, risk, and generate replies.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })() : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-xs">
                  <User size={32} className="opacity-20 mb-2" />
                  <p className="italic">Click an inbound comment to inspect metadata</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* DOCUMENT GROUNDING TAB */}
        {activeSubTab === 'docs' && (
          <motion.div
            key="docs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left upload listings */}
            <div className="bg-white border border-[rgba(44,62,80,0.12)] p-4 rounded-xl shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-xs font-bold text-[#2C3E50] uppercase tracking-wider flex items-center gap-1.5">
                  <Upload size={14} className="text-[#C49A6C]" />
                  Document Upload Hub
                </h3>
                <p className="text-[10px] text-[#6b6b6b]">Analyze PDFs, brief guides, templates and briefs</p>
              </div>

              {/* Upload Drag and Drop simulated zone */}
              <div className="border-2 border-dashed border-[#C49A6C]/30 bg-[#fefdfb] hover:bg-[#faf9f6] rounded-xl p-5 text-center transition-all cursor-pointer">
                <FileText className="mx-auto text-[#C49A6C]/50 mb-2" size={24} />
                <span className="text-xs font-bold text-[#2C3E50] block">Drag & Drop Documents</span>
                <span className="text-[10px] text-[#9a9a9a] block mt-0.5">Supports PDF, DOCX, XLSX and TXT</span>
                <button 
                  onClick={() => {
                    const docName = prompt('Enter simulated document filename (with extension):');
                    if (docName) {
                      const newDoc: UploadedDoc = {
                        id: 'd-' + Date.now(),
                        name: docName,
                        size: '85 KB',
                        type: docName.split('.').pop()?.toUpperCase() || 'TXT',
                        date: '2026-05-19',
                        extractedText: 'Extracted terms based on custom file upload ' + docName + ' indicating campaign metrics for Pottsville family trust and life protection objectives.',
                        topics: ['insurance', 'compliance']
                      };
                      setUploadedDocs(prev => [...prev, newDoc]);
                      alert('Simulated document uploaded and parsed. Embedding coordinates calculated.');
                    }
                  }} 
                  className="bg-[#2C3E50] text-white font-bold text-[9px] px-3 py-1.5 rounded-md mt-3 hover:bg-[#C49A6C] transition-all uppercase tracking-wider"
                >
                  Browse Files
                </button>
              </div>

              {/* Listing of parsed docs */}
              <div className="space-y-2.5">
                <span className="text-[10px] uppercase font-bold text-[#6b6b6b]">Currently Indexed Library</span>
                
                {uploadedDocs.map(doc => (
                  <div 
                    key={doc.id}
                    onClick={() => setSelectedDocumentId(doc.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedDocumentId === doc.id 
                        ? 'border-[#C49A6C] bg-[#fdfcfa]' 
                        : 'border-slate-100 hover:border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="truncate text-xs font-bold text-[#2C3E50] pr-2">{doc.name}</div>
                      <span className="text-[9px] bg-slate-100 text-[#6b6b6b] px-1.5 py-0.5 rounded font-bold">{doc.type}</span>
                    </div>
                    
                    <div className="text-[10px] text-slate-400 mt-1 uppercase font-bold flex justify-between">
                      <span>{doc.size}</span>
                      <span>{doc.date}</span>
                    </div>

                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {doc.topics.map(tag => (
                        <span key={tag} className="text-[9px] bg-[#E8D5B7]/50 text-[#8B6A45] font-bold px-1.5 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Document Grounded Generator Output */}
            <div className="lg:col-span-2 bg-white border border-[rgba(44,62,80,0.12)] p-4 rounded-xl shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-bold text-[#2C3E50] uppercase tracking-wider">Document Assisted Copy Generation Engine</h3>
                  <p className="text-[10px] text-[#6b6b6b]">Extract vectors, target topics & ground generative copy to regulatory assets</p>
                </div>
              </div>

              {(() => {
                const active = uploadedDocs.find(d => d.id === selectedDocumentId);
                if (!active) return <p className="text-xs text-[#6b6b6b]">Select an indexed document.</p>;
                
                return (
                  <div className="space-y-4 text-xs">
                    <div className="bg-[#fcfbf9] border p-3 rounded-lg space-y-1">
                      <span className="text-[9px] font-bold uppercase text-[#9a9a9a]">Parsed extracted text segment (Grounding Context)</span>
                      <p className="italic text-[#2c3e50] leading-relaxed">"{active.extractedText}"</p>
                    </div>

                    <div className="bg-slate-50 border p-3 rounded-xl space-y-3">
                      <div className="text-[10px] uppercase font-bold text-[#2C3E50]">Configure Grounded Copy Generator</div>
                      
                      <div className="flex flex-wrap gap-3 items-center text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-600">Form Factor:</span>
                          <select 
                            value={customGenTarget}
                            onChange={(e) => setCustomGenTarget(e.target.value as any)}
                            className="bg-white border p-1 rounded outline-none font-bold"
                          >
                            <option value="social">Social caption sequence</option>
                            <option value="email">Marketing introduction email</option>
                            <option value="ad">Localized flyer/ad campaign copy</option>
                          </select>
                        </div>

                        <button
                          onClick={generateFromDocument}
                          disabled={customGenLoading}
                          className="bg-[#2C3E50] hover:bg-[#C49A6C] text-white font-bold text-[10px] px-4 py-1.5 rounded-md shadow-sm transition-all ml-auto flex items-center gap-1.5"
                        >
                          {customGenLoading ? (
                            <>
                              <Loader2 className="animate-spin" size={13} /> Generating copy...
                            </>
                          ) : (
                            <>
                              <Sparkles size={13} /> Ground Generative Copy 🚀
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {customGenOutput && (
                      <div className="border border-[#C49A6C]/30 bg-[#fdfcfa] rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-[#2C3E50] p-2 px-3 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                          <CheckCircle className="text-[#C49A6C]" size={13} />
                          Grounded Brand Assist Output
                        </div>
                        <div className="p-4 bg-white min-h-[140px] text-xs leading-relaxed text-[#2C3E50] font-sans font-medium whitespace-pre-wrap select-all">
                          {customGenOutput}
                        </div>
                        <div className="bg-slate-50 p-2.5 px-3 border-t border-slate-100 flex justify-between items-center text-[10px]">
                          <span className="text-slate-400">Grounded in Pottsville B2B Contextual weights</span>
                          <button 
                            onClick={() => {
                              // Push directly to scheduling pipeline drafts
                              setPosts(prev => [
                                {
                                  id: 'p-generated-' + Date.now(),
                                  platform: 'facebook',
                                  caption: customGenOutput.slice(0, 280),
                                  status: 'draft'
                                },
                                ...prev
                              ]);
                              alert('Copy pushed to Post Scheduling Queue as high-value Draft!');
                            }}
                            className="text-[#8B6A45] hover:text-[#2C3E50] font-bold underline"
                          >
                            Push directly to Posts Queue ↗
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </motion.div>
        )}

        {/* WEEKLY REPORTS TAB */}
        {activeSubTab === 'reports' && (
          <motion.div
            key="reports"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Branded Executive Summary card */}
            <div id="print-weekly-container" className="bg-white border border-[rgba(44,62,80,0.12)] p-6 rounded-2xl shadow-sm space-y-6 relative overflow-hidden">
              
              {/* Branded watermark top corner for visual depth */}
              <div className="absolute right-0 top-0 w-32 h-32 bg-[#C49A6C]/5 rounded-bl-[100px] pointer-events-none border-l border-b border-[#C49A6C]/10 sm:block hidden"></div>

              {/* Header section styled elegantly */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#f5f4f1] pb-5 gap-3">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-[#8B6A45] uppercase tracking-widest">LATIMORE LIFE & LEGACY LLC</div>
                  <h3 className="text-lg font-bold text-[#2C3E50] tracking-tight font-sans">Weekly Growth Marketing Intelligence Report</h3>
                  <p className="text-xs text-[#6b6b6b]">Audit Period: Trailing Week ending May 19, 2026</p>
                </div>

                <div className="text-right sm:text-right text-left">
                  <span className="text-[9px] bg-slate-100 border text-[#2C3E50] px-2.5 py-1 rounded-full font-bold uppercase">
                    Status: Verified & Compliant
                  </span>
                </div>
              </div>

              {/* KPI comparisons summaries */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
                {[
                  { metric: 'Impressions Reach', current: '36.1K', target: '30K baseline', velocity: '+20% gain', key: 'Impressions' },
                  { metric: 'Conversion Rate', current: conversionRate + '%', target: '2.5%', velocity: 'Optimal efficiency', key: 'Clicks' },
                  { metric: 'Assigned Leads', current: agg.formSubmissions + '', target: '35 / wk target', velocity: '+14% spike', key: 'Leads' },
                  { metric: 'Sentiment Index', current: 'Positive (84%)', target: 'Harmonic', velocity: 'Urgent requests: 0', key: 'Engagement' }
                ].map((k, i) => (
                  <div key={i} className="bg-[#fdfcfa] border rounded-xl p-3 px-3.5 space-y-1">
                    <span className="text-[9px] uppercase font-bold text-slate-400">{k.metric}</span>
                    <div className="text-xl font-bold text-[#2C3E50]">{k.current}</div>
                    <div className="text-[9px] text-[#8B6A45] font-semibold flex items-center justify-between">
                      <span>{k.target}</span>
                      <span className="text-[#3d8b5a]">{k.velocity}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Core Opportunity matrix */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#2C3E50] uppercase tracking-wider border-b pb-1.5">Actionable Opportunities & Growth Drivers</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                  <div className="space-y-2 border border-slate-50 bg-slate-50/50 p-3.5 rounded-xl">
                    <div className="text-[10px] uppercase font-bold text-slate-400">High-yield Opportunities</div>
                    <ul className="list-disc pl-4 space-y-1.5 text-slate-700 font-medium">
                      <li>The Pottsville football sponsorship continuity campaign has generated a <strong>3.5x engagement spike</strong>. Prioritize matching sponsorship follow-up scripts.</li>
                      <li>Spanish language inquiries in Luzerne county represent high immediate conversion likelihood. Formularize Hispanic segment translation frameworks.</li>
                    </ul>
                  </div>

                  <div className="space-y-2 border border-slate-50 bg-slate-50/50 p-3.5 rounded-xl">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Target Action Plans (Compliance Guarded)</div>
                    <ul className="list-disc pl-4 space-y-1.5 text-slate-700 font-medium font-sans">
                      <li>Prepare B2B collateral briefing package for Pottsville Area High School athletic directress.</li>
                      <li>Initiate monthly life trust policy checks with Schuylkill Valley succession prospects.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Executive Sign-off and Print Block */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[10px] border-t pt-4 text-slate-400 gap-4">
                <div className="flex gap-4">
                  <span>Auditor Hash: <span className="font-mono text-slate-600">medxfhhx</span></span>
                  <span>GA4 Tracking: <span className="font-mono text-[#8B6A45] font-bold">G-S0Q3E4DEBJ</span></span>
                </div>
                
                <span className="text-slate-400 text-right italic font-semibold">
                  Motto: "Protecting Today. Securing Tomorrow." • Latimore LLC
                </span>
              </div>
            </div>

            {/* Print and Export actions */}
            <div className="flex justify-end gap-3 pb-6">
              <button
                onClick={handlePrintWeeklyReport}
                className="bg-[#2C3E50] hover:bg-[#C49A6C] text-white text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 shadow"
              >
                <Download size={14} /> Export Branded PDF Report
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};
