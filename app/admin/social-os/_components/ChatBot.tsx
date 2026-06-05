'use client'

import React, { useState, useRef, useEffect } from 'react';
import { SocialStrategyResponse } from '../types';

// ─── Secure server-side fetch helpers ─────────────────────────────────────────
// All AI inference calls /api/admin/ai/chat — no API keys in the browser bundle.

async function apiFetch(mode: 'chat' | 'strategy' | 'trends', message: string, history: {role:string;text:string}[]): Promise<any> {
  const res = await fetch('/api/admin/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, mode, history }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'AI request failed');
  }
  return res.json();
}
// ──────────────────────────────────────────────────────────────────────────────

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string | React.ReactNode }[]>([
    { role: 'bot', text: 'Good day, Jackson. I am synchronized with the Latimore Life Hub. How can I assist your legacy mission today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<'chat' | 'strategy' | 'trends'>('chat');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isOpen]);

  const getTextHistory = () => messages
    .filter(m => typeof m.text === 'string')
    .slice(-6)
    .map(m => ({ role: m.role === 'user' ? 'user' : 'bot', text: m.text as string }));

  const handleSend = async (customText?: string) => {
    const messageToSend = customText || input.trim();
    if (!messageToSend || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: messageToSend }]);
    setIsLoading(true);

    try {
      if (activeMode === 'strategy') {
        const result = await apiFetch('strategy', messageToSend, getTextHistory());
        const strategy: SocialStrategyResponse = result.data;
        setMessages(prev => [...prev, {
          role: 'bot',
          text: (
            <div className="space-y-4">
              <p className="font-bold text-[#c5a059]">Strategic Blueprint Mapped:</p>
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase text-slate-400">Post Ideas</p>
                {strategy.ideas.map((idea, idx) => (
                  <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="font-bold text-slate-800 text-xs">{idea.title}</p>
                    <p className="text-[10px] text-slate-500 mt-1 italic">{idea.reasoning}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase text-slate-400">Draft Captions</p>
                {strategy.captions.map((cap, idx) => (
                  <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="font-black text-[9px] uppercase text-[#c5a059] mb-1">{cap.platform}</p>
                    <p className="text-xs text-slate-700">{cap.text}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-slate-400">Recommended Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {strategy.hashtags.map((tag, idx) => (
                    <span key={idx} className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          )
        }]);
        setActiveMode('chat');
      } else if (activeMode === 'trends') {
        const result = await apiFetch('trends', messageToSend, getTextHistory());
        const trends = result.data;
        setMessages(prev => [...prev, {
          role: 'bot',
          text: (
            <div className="space-y-4">
              <p className="font-bold text-[#c5a059]">Regional Trend Intelligence:</p>
              {trends.map((t: any, idx: number) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                  <p className="font-black text-xs text-slate-800 uppercase tracking-tight">{t.theme}</p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{t.description}</p>
                  <div className="flex items-center gap-2 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg w-fit">
                    <i className="fa-solid fa-chart-line"></i>{t.trendReason}
                  </div>
                </div>
              ))}
            </div>
          )
        }]);
        setActiveMode('chat');
      } else {
        const result = await apiFetch('chat', messageToSend, getTextHistory());
        setMessages(prev => [...prev, { role: 'bot', text: result.data || 'I encountered an issue processing that request.' }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: `Jackson, I hit a connection snag. ${err instanceof Error ? err.message : 'Please try again.'}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeTrends = async () => {
    setMessages(prev => [...prev, { role: 'user', text: 'Analyze Regional Trends' }]);
    setIsLoading(true);
    try {
      const result = await apiFetch('trends', 'Analyze regional trends for Central PA insurance market', getTextHistory());
      const trends = result.data;
      setMessages(prev => [...prev, {
        role: 'bot',
        text: (
          <div className="space-y-4">
            <p className="font-bold text-[#c5a059]">Regional Trend Intelligence:</p>
            {trends.map((t: any, idx: number) => (
              <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                <p className="font-black text-xs text-slate-800 uppercase tracking-tight">{t.theme}</p>
                <p className="text-[11px] text-slate-600 leading-relaxed">{t.description}</p>
                <div className="flex items-center gap-2 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg w-fit">
                  <i className="fa-solid fa-chart-line"></i>{t.trendReason}
                </div>
              </div>
            ))}
          </div>
        )
      }]);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: "Jackson, I couldn't pull trend data right now. Let's focus on our core legacy fundamentals." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const QUICK_PROMPTS = [
    { label: 'Follow Up Advice', prompt: 'How should I follow up with a lead in the "Discovery Complete" stage?' },
    { label: 'Explain IUL', prompt: 'Explain Indexed Universal Life insurance simply for a young family in Schuylkill county.' },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="w-80 sm:w-[28rem] bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 mb-4 flex flex-col overflow-hidden animate-slideUp max-h-[85vh]">
          <div className="bg-slate-900 p-6 flex items-center justify-between text-white border-b border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-[#c5a059] rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/40">
                <i className="fa-solid fa-shield-heart text-slate-900 text-lg"></i>
              </div>
              <div>
                <p className="font-black text-sm tracking-tight">Legacy Co-Pilot</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Assistant Prime Active</p>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all">
              <i className="fa-solid fa-times"></i>
            </button>
          </div>

          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex gap-2 overflow-x-auto no-scrollbar">
            <button onClick={() => { setActiveMode('strategy'); setInput('Mortgage Protection in Schuylkill County'); }}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${activeMode==='strategy'?'bg-slate-900 text-white border-slate-900':'bg-white text-slate-600 border-slate-200 hover:border-[#c5a059]'}`}>
              <i className="fa-solid fa-wand-magic-sparkles mr-2 text-[#c5a059]"></i>Get Strategy
            </button>
            <button onClick={handleAnalyzeTrends} className="flex-shrink-0 px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-[#c5a059] transition-all">
              <i className="fa-solid fa-chart-line mr-2 text-indigo-500"></i>Analyze Trends
            </button>
            <button onClick={() => setActiveMode('chat')}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${activeMode==='chat'?'bg-slate-900 text-white border-slate-900':'bg-white text-slate-600 border-slate-200 hover:border-[#c5a059]'}`}>
              <i className="fa-solid fa-comment mr-2 text-sky-500"></i>Standard Chat
            </button>
          </div>

          {activeMode === 'strategy' && (
            <div className="bg-[#c5a059]/10 border-b border-[#c5a059]/20 px-6 py-2">
              <p className="text-[10px] font-bold text-[#c5a059] uppercase tracking-widest italic animate-pulse">Input content topic below for high-impact architecture...</p>
            </div>
          )}

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 no-scrollbar min-h-[300px]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role==='user'?'justify-end':'justify-start'}`}>
                <div className={`max-w-[92%] p-4 rounded-3xl text-sm leading-relaxed shadow-sm ${msg.role==='user'?'bg-slate-900 text-white rounded-tr-none border border-slate-800 font-medium':'bg-white text-slate-700 border border-slate-100 rounded-tl-none'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-3xl rounded-tl-none border border-slate-100 shadow-sm">
                  <div className="flex gap-1.5">
                    {[0,150,300].map(d=><div key={d} className="w-1.5 h-1.5 bg-[#c5a059] rounded-full animate-bounce" style={{animationDelay:`${d}ms`}}></div>)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {messages.length < 3 && !isLoading && (
            <div className="px-6 pb-2 pt-2 bg-slate-50/50">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center">Quick Insights</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {QUICK_PROMPTS.map((q,idx)=>(
                  <button key={idx} onClick={()=>handleSend(q.prompt)} className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-600 hover:border-[#c5a059] hover:text-[#c5a059] transition-all shadow-sm">
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-6 bg-white border-t border-slate-100">
            <div className="relative flex items-center">
              <input type="text" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSend()}
                placeholder={activeMode==='strategy'?'Enter content topic...':'Ask your assistant anything...'}
                className={`w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] pl-6 pr-14 py-4 text-sm outline-none transition-all placeholder:text-slate-400 font-medium ${activeMode==='strategy'?'ring-2 ring-[#c5a059]':'focus:ring-2 focus:ring-[#c5a059]'}`} />
              <button onClick={()=>handleSend()} disabled={isLoading||!input.trim()} className="absolute right-2 w-11 h-11 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-[#c5a059] transition-all disabled:opacity-30 disabled:hover:bg-slate-900 shadow-lg shadow-slate-900/10">
                <i className={`fa-solid ${activeMode==='strategy'?'fa-wand-magic-sparkles':'fa-paper-plane'} text-xs`}></i>
              </button>
            </div>
            <p className="text-[9px] text-center text-slate-400 mt-4 font-bold uppercase tracking-widest">Securing Pennsylvania's Legacy</p>
          </div>
        </div>
      )}

      <button onClick={()=>setIsOpen(!isOpen)} className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 group relative ${isOpen?'bg-white text-slate-900 rotate-90 scale-90 border border-slate-200':'bg-slate-900 text-[#c5a059] hover:scale-110'}`}>
        <div className={`absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-slate-50 transition-opacity ${isOpen?'opacity-0':'opacity-100'}`}></div>
        <i className={`fa-solid ${isOpen?'fa-xmark':'fa-brain-circuit'} text-2xl`}></i>
        {!isOpen && (
          <div className="absolute right-20 bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0 pointer-events-none border border-slate-800">
            Assistant Active
          </div>
        )}
      </button>

      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
};

export default ChatBot;
