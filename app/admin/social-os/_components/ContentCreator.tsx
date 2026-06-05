'use client'

import React, { useState, useEffect } from 'react';
import { ContentIdea, ContentTemplate, SocialPost } from '../types';

// ─── Secure server-side fetch helper ──────────────────────────────────────────
async function fetchSocialContent(topic: string, platform: string, count = 3): Promise<ContentIdea[]> {
  const res = await fetch('/api/admin/ai/social', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, platform, count }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Content generation failed');
  }
  const data = await res.json();
  return data.posts ?? [];
}
// ──────────────────────────────────────────────────────────────────────────────

const INITIAL_TEMPLATES: ContentTemplate[] = [
  { id: '0', name: 'Legacy Anchor', structure: 'Open with the concept that a legacy is what you leave IN someone. Discuss how life insurance secures this for future generations in Central PA.', icon: 'fa-anchor' },
  { id: '1', name: 'The Educational Hook', structure: 'Start with a surprising fact about life insurance, followed by 3 tips for young families, and end with a CTA to protect their legacy.', icon: 'fa-graduation-cap' },
  { id: '2', name: 'Legacy Storyteller', structure: 'Share a story about the importance of planning for the next generation. Focus on peace of mind and family protection.', icon: 'fa-book-open' }
];

interface ContentCreatorProps {
  onPostScheduled?: (post: SocialPost) => void;
  preFillTopic?: string | null;
  onClearPreFill?: () => void;
  scheduledPosts?: SocialPost[];
  preBuiltIdeas?: ContentIdea[];
  preBuiltSource?: string;
  onClearPreBuiltIdeas?: () => void;
}

const ContentCreator: React.FC<ContentCreatorProps> = ({ onPostScheduled, preFillTopic, onClearPreFill, scheduledPosts = [], preBuiltIdeas = [], preBuiltSource = '', onClearPreBuiltIdeas }) => {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('LinkedIn');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<ContentIdea[]>([]);
  const [templates, setTemplates] = useState<ContentTemplate[]>(INITIAL_TEMPLATES);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [pendingIdx, setPendingIdx] = useState<number | null>(null);
  const [newTemplateName, setNewTemplateName] = useState('');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('latimore_user_templates');
      if (saved) { try { setTemplates([...INITIAL_TEMPLATES, ...JSON.parse(saved)]); } catch { } }
    }
  }, []);

  useEffect(() => {
    if (preFillTopic) { setTopic(preFillTopic); if (onClearPreFill) onClearPreFill(); }
  }, [preFillTopic, onClearPreFill]);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true); setError(null);
    try { setSuggestions(await fetchSocialContent(topic, platform, 3)); }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed to generate content'); }
    finally { setIsGenerating(false); }
  };

  const confirmSchedule = () => {
    if (pendingIdx === null || !onPostScheduled) return;
    const idea = suggestions[pendingIdx];
    onPostScheduled({ id: Math.random().toString(36).substr(2,9), content: idea.draft, platform: (idea.platform?.toLowerCase() as SocialPost['platform']) || 'linkedin', status: 'scheduled', scheduledDate: new Date(Date.now()+86400000).toISOString(), engagement: { likes:0, shares:0, comments:0, clicks:0 } });
    setShowConfirmModal(false); setPendingIdx(null);
  };

  const handleSaveTemplate = () => {
    if (!newTemplateName.trim() || pendingIdx === null) return;
    const idea = suggestions[pendingIdx];
    const newT: ContentTemplate = { id: Math.random().toString(36).substr(2,9), name: newTemplateName, structure: idea.draft, icon: 'fa-star' };
    const updated = [...templates, newT];
    setTemplates(updated);
    if (typeof window !== 'undefined') localStorage.setItem('latimore_user_templates', JSON.stringify(updated.filter(t => !INITIAL_TEMPLATES.find(i => i.id===t.id))));
    setNewTemplateName(''); setShowSaveTemplateModal(false); setPendingIdx(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Content Architect</h1>
        <p className="text-slate-500 mt-1">Generate brand-locked social content — server-side AI, no key exposure.</p>
      </header>

      <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2">
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Content Topic</label>
            <input type="text" value={topic} onChange={e=>setTopic(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleGenerate()}
              placeholder="e.g. Mortgage protection for young homebuyers in Schuylkill County"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#C49A6C] transition" />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Platform</label>
            <select value={platform} onChange={e=>setPlatform(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#C49A6C] transition bg-white">
              {['LinkedIn','Facebook','Instagram','Twitter'].map(p=><option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <button onClick={handleGenerate} disabled={isGenerating||!topic.trim()} className="flex items-center gap-3 rounded-xl bg-[#2C3E50] px-6 py-3 text-sm font-black uppercase tracking-widest text-white transition hover:bg-[#C49A6C] disabled:opacity-40">
          <i className={`fa-solid ${isGenerating?'fa-spinner fa-spin':'fa-wand-magic-sparkles'}`}></i>
          {isGenerating?'Architecting...':'Generate Content'}
        </button>
        {error && <p className="mt-3 text-sm text-red-500"><i className="fa-solid fa-triangle-exclamation mr-2"></i>{error}</p>}
      </div>

      <div>
        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Strategy Templates</p>
        <div className="flex flex-wrap gap-2">
          {templates.map(t=>(
            <button key={t.id} onClick={()=>setTopic(t.structure)} className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:border-[#C49A6C] hover:text-[#C49A6C]">
              <i className={`fa-solid ${t.icon} text-[#C49A6C]`}></i>{t.name}
            </button>
          ))}
        </div>
      </div>

      {preBuiltIdeas.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
              <i className="fa-solid fa-file-arrow-up text-[#C49A6C] mr-2"></i>
              {preBuiltIdeas.length} Posts Generated from {preBuiltSource || 'Asset'}
            </p>
            <button onClick={onClearPreBuiltIdeas} className="text-[10px] text-slate-400 hover:text-slate-600 uppercase tracking-widest font-black">✕ Clear</button>
          </div>
          {preBuiltIdeas.map((idea, idx) => (
            <div key={`asset-${idx}`} className="bg-white rounded-[2rem] p-6 border-2 border-[#C49A6C]/30 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#C49A6C]">{idea.platform}</span>
                  <h3 className="font-black text-slate-900 text-sm mt-0.5">{idea.title}</h3>
                </div>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mb-4">{idea.draft}</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => { setSuggestions(preBuiltIdeas); setPendingIdx(idx); setShowConfirmModal(true) }} className="flex items-center gap-2 rounded-xl bg-[#2C3E50] px-4 py-2 text-xs font-black uppercase tracking-widest text-white transition hover:bg-[#C49A6C]">
                  <i className="fa-solid fa-calendar-plus"></i>Schedule
                </button>
                <button onClick={() => navigator.clipboard?.writeText(idea.draft)} className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-600 transition hover:border-[#C49A6C] hover:text-[#C49A6C]">
                  <i className="fa-solid fa-copy"></i>Copy
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">{suggestions.length} Drafts Generated</p>
          {suggestions.map((idea,idx)=>(
            <div key={idx} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#C49A6C]">{idea.platform}</span>
                  <h3 className="font-black text-slate-900 text-sm mt-0.5">{idea.title}</h3>
                </div>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mb-4">{idea.draft}</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={()=>{setPendingIdx(idx);setShowConfirmModal(true);}} className="flex items-center gap-2 rounded-xl bg-[#2C3E50] px-4 py-2 text-xs font-black uppercase tracking-widest text-white transition hover:bg-[#C49A6C]">
                  <i className="fa-solid fa-calendar-plus"></i>Schedule
                </button>
                <button onClick={()=>{setPendingIdx(idx);setShowSaveTemplateModal(true);}} className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-600 transition hover:border-[#C49A6C] hover:text-[#C49A6C]">
                  <i className="fa-solid fa-bookmark"></i>Save Template
                </button>
                <button onClick={()=>navigator.clipboard?.writeText(idea.draft)} className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-600 transition hover:border-[#C49A6C] hover:text-[#C49A6C]">
                  <i className="fa-solid fa-copy"></i>Copy
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {scheduledPosts.length > 0 && (
        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Scheduled Queue ({scheduledPosts.length})</p>
          <div className="space-y-2">
            {scheduledPosts.slice(0,5).map(post=>(
              <div key={post.id} className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#C49A6C] w-20 shrink-0">{post.platform}</span>
                <p className="text-xs text-slate-600 truncate flex-1">{post.content}</p>
                <span className="text-[10px] text-slate-400 shrink-0">{post.scheduledDate?new Date(post.scheduledDate).toLocaleDateString():'Unscheduled'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showConfirmModal && pendingIdx!==null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="font-black text-slate-900 text-lg mb-2">Schedule This Post?</h3>
            <p className="text-sm text-slate-500 mb-6">This will add the post to your campaign calendar for tomorrow.</p>
            <div className="flex gap-3">
              <button onClick={confirmSchedule} className="flex-1 rounded-xl bg-[#2C3E50] py-3 text-sm font-black uppercase tracking-widest text-white hover:bg-[#C49A6C] transition">Confirm</button>
              <button onClick={()=>setShowConfirmModal(false)} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-black uppercase tracking-widest text-slate-600 hover:border-slate-400 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showSaveTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="font-black text-slate-900 text-lg mb-2">Save as Template</h3>
            <input type="text" value={newTemplateName} onChange={e=>setNewTemplateName(e.target.value)} placeholder="Template name..." className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#C49A6C] transition mb-4" />
            <div className="flex gap-3">
              <button onClick={handleSaveTemplate} className="flex-1 rounded-xl bg-[#2C3E50] py-3 text-sm font-black uppercase tracking-widest text-white hover:bg-[#C49A6C] transition">Save</button>
              <button onClick={()=>setShowSaveTemplateModal(false)} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-black uppercase tracking-widest text-slate-600 hover:border-slate-400 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentCreator;
