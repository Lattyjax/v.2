'use client'

import React, { useState, useEffect } from 'react';
import { Funnel, FunnelStage } from '../types';
import { FUNNEL_BLUEPRINTS, LANDING_PAGE_BLUEPRINTS, FORM_BLUEPRINTS } from '../constants';

// ─── Secure server-side fetch helper ──────────────────────────────────────────
async function fetchFunnelStrategy(goal: string, persona: string): Promise<FunnelStage[]> {
  const res = await fetch('/api/admin/ai/funnel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ goal, persona }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Funnel generation failed');
  }
  const data = await res.json();
  return data.stages ?? [];
}
// ──────────────────────────────────────────────────────────────────────────────

type HubView = 'Active' | 'FunnelDB' | 'LandingDB' | 'FormDB';

const LegacyFunnels: React.FC = () => {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [goal, setGoal] = useState('');
  const [persona, setPersona] = useState('Young Families');
  const [isArchitecting, setIsArchitecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeHubView, setActiveHubView] = useState<HubView>('Active');
  const [activeFunnel, setActiveFunnel] = useState<Funnel | null>(null);
  const [showPromptModal, setShowPromptModal] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('latimore_legacy_funnels');
      if (saved) { try { setFunnels(JSON.parse(saved)); } catch { } }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('latimore_legacy_funnels', JSON.stringify(funnels));
  }, [funnels]);

  const handleLaunchArchitect = async () => {
    if (!goal.trim()) return;
    setIsArchitecting(true); setError(null);
    try {
      const strategyStages = await fetchFunnelStrategy(goal, persona);
      const newFunnel: Funnel = {
        id: Math.random().toString(36).substr(2, 9),
        name: goal.length > 30 ? goal.substring(0, 27) + '...' : goal,
        goal, persona,
        stages: strategyStages,
        status: 'Draft'
      };
      setFunnels([newFunnel, ...funnels]);
      setActiveFunnel(newFunnel);
      setShowPromptModal(false);
      setGoal('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Funnel architecture failed');
    } finally {
      setIsArchitecting(false);
    }
  };

  const deleteFunnel = (id: string) => {
    setFunnels(funnels.filter(f => f.id !== id));
    if (activeFunnel?.id === id) setActiveFunnel(null);
  };

  const PERSONAS = ['Young Families', 'Pre-Retirees (55-65)', 'High Income Accumulators', 'School Districts', 'Small Business Owners', 'New Homeowners'];

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Legacy Hub</h1>
          <p className="text-slate-500 mt-1">Architect AI-powered funnels, landing pages, and lead forms.</p>
        </div>
        <button onClick={() => setShowPromptModal(true)} className="flex items-center gap-3 rounded-xl bg-[#2C3E50] px-5 py-3 text-sm font-black uppercase tracking-widest text-white transition hover:bg-[#C49A6C]">
          <i className="fa-solid fa-filter-circle-dollar"></i>New Funnel
        </button>
      </header>

      {/* View Tabs */}
      <div className="flex flex-wrap gap-2">
        {(['Active','FunnelDB','LandingDB','FormDB'] as HubView[]).map(v => (
          <button key={v} onClick={() => setActiveHubView(v)} className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest transition ${activeHubView===v?'bg-[#2C3E50] text-white':'bg-white border border-slate-200 text-slate-600 hover:border-[#C49A6C] hover:text-[#C49A6C]'}`}>
            {v === 'Active' ? 'Active Funnels' : v === 'FunnelDB' ? 'Funnel Blueprints' : v === 'LandingDB' ? 'Landing Pages' : 'Forms'}
          </button>
        ))}
      </div>

      {/* Active Funnels */}
      {activeHubView === 'Active' && (
        <div className="grid md:grid-cols-2 gap-6">
          {funnels.length === 0 ? (
            <div className="md:col-span-2 bg-white rounded-[2rem] p-12 border border-slate-100 text-center">
              <i className="fa-solid fa-filter-circle-dollar text-4xl text-slate-200 mb-4"></i>
              <p className="font-black text-slate-400">No funnels yet.</p>
              <p className="text-sm text-slate-400 mt-1">Click "New Funnel" to architect your first Legacy Funnel.</p>
            </div>
          ) : funnels.map(funnel => (
            <div key={funnel.id} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${funnel.status==='Active'?'bg-emerald-50 text-emerald-600':'bg-amber-50 text-amber-600'}`}>{funnel.status}</span>
                  <h3 className="font-black text-slate-900 mt-2">{funnel.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{funnel.persona}</p>
                </div>
                <button onClick={() => deleteFunnel(funnel.id)} className="text-slate-300 hover:text-rose-400 transition"><i className="fa-solid fa-trash text-xs"></i></button>
              </div>
              <div className="space-y-2 mb-4">
                {funnel.stages?.map((stage, idx) => (
                  <div key={idx} className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#C49A6C]">{stage.name}</p>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{stage.strategy}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setActiveFunnel(funnel); }} className="flex-1 rounded-xl border border-slate-200 py-2 text-xs font-black uppercase tracking-widest text-slate-600 hover:border-[#C49A6C] hover:text-[#C49A6C] transition">
                  View Detail
                </button>
                <button onClick={() => setFunnels(funnels.map(f => f.id===funnel.id ? {...f, status: f.status==='Draft'?'Active':'Draft'} : f))} className="flex-1 rounded-xl bg-[#2C3E50] py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-[#C49A6C] transition">
                  {funnel.status === 'Draft' ? 'Activate' : 'Pause'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Funnel Blueprints */}
      {activeHubView === 'FunnelDB' && (
        <div className="grid md:grid-cols-3 gap-4">
          {FUNNEL_BLUEPRINTS.map(bp => (
            <div key={bp.id} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#C49A6C]">{bp.category}</span>
              <h3 className="font-black text-slate-900 mt-1 mb-2">{bp.name}</h3>
              <p className="text-xs text-slate-400 mb-3 italic">{bp.persona}</p>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">{bp.description}</p>
              <div className="space-y-1">
                {bp.stages.map((s,i) => <div key={i} className="flex items-center gap-2 text-xs text-slate-500"><span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-400 shrink-0">{i+1}</span>{s}</div>)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Landing Page Blueprints */}
      {activeHubView === 'LandingDB' && (
        <div className="grid md:grid-cols-3 gap-4">
          {LANDING_PAGE_BLUEPRINTS.map(lp => (
            <div key={lp.id} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#C49A6C]">{lp.category}</span>
              <h3 className="font-black text-slate-900 mt-1 mb-2">{lp.name}</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">{lp.description}</p>
              <div className="space-y-1">{lp.sections.map((s,i)=><div key={i} className="text-xs text-slate-500">→ {s}</div>)}</div>
            </div>
          ))}
        </div>
      )}

      {/* Form Blueprints */}
      {activeHubView === 'FormDB' && (
        <div className="grid md:grid-cols-3 gap-4">
          {FORM_BLUEPRINTS.map(frm => (
            <div key={frm.id} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
              <h3 className="font-black text-slate-900 mb-1">{frm.name}</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">{frm.description}</p>
              <div className="flex flex-wrap gap-1">{frm.fields.map((f,i)=><span key={i} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">{f}</span>)}</div>
            </div>
          ))}
        </div>
      )}

      {/* Active Funnel Detail Modal */}
      {activeFunnel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-2xl w-full shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[#C49A6C]">{activeFunnel.persona}</p>
                <h3 className="font-black text-slate-900 text-xl mt-1">{activeFunnel.name}</h3>
              </div>
              <button onClick={() => setActiveFunnel(null)} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition">
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="space-y-4">
              {activeFunnel.stages?.map((stage, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-100 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-[#2C3E50] flex items-center justify-center text-white text-xs font-black">{idx+1}</div>
                    <h4 className="font-black text-slate-900">{stage.name}</h4>
                  </div>
                  <p className="text-sm text-slate-600 mb-3 leading-relaxed">{stage.strategy}</p>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#C49A6C] mb-2">Asset Copy</p>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{stage.assetCopy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* New Funnel Modal */}
      {showPromptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full shadow-2xl">
            <h3 className="font-black text-slate-900 text-xl mb-6">Architect a Legacy Funnel</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Campaign Goal</label>
                <input type="text" value={goal} onChange={e=>setGoal(e.target.value)} placeholder="e.g. Generate mortgage protection leads in Schuylkill County"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#C49A6C] transition" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Target Persona</label>
                <select value={persona} onChange={e=>setPersona(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#C49A6C] transition bg-white">
                  {PERSONAS.map(p=><option key={p}>{p}</option>)}
                </select>
              </div>
              {error && <p className="text-sm text-red-500"><i className="fa-solid fa-triangle-exclamation mr-2"></i>{error}</p>}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleLaunchArchitect} disabled={isArchitecting||!goal.trim()} className="flex-1 rounded-xl bg-[#2C3E50] py-3 text-sm font-black uppercase tracking-widest text-white hover:bg-[#C49A6C] transition disabled:opacity-40 flex items-center justify-center gap-2">
                <i className={`fa-solid ${isArchitecting?'fa-spinner fa-spin':'fa-filter-circle-dollar'}`}></i>
                {isArchitecting?'Architecting...':'Launch Architect'}
              </button>
              <button onClick={()=>{setShowPromptModal(false);setError(null);}} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-black uppercase tracking-widest text-slate-600 hover:border-slate-400 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LegacyFunnels;
