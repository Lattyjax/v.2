'use client'

import React, { useState, useMemo } from 'react';
import { MOCK_CLIENTS, PIPELINE_STAGES } from '../constants';
import { Client, PipelineStage, ProductType, County, LeadSource } from '../types';

// ─── Secure server-side fetch helpers ─────────────────────────────────────────
// All AI inference goes through server API routes — no Gemini SDK in browser.

async function fetchClientSnapshot(notes: string, household: string): Promise<any> {
  const res = await fetch('/api/admin/ai/client-snapshot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes, household }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Snapshot generation failed');
  }
  return res.json();
}

async function fetchReviewScript(clientData: Partial<Client>): Promise<any> {
  const res = await fetch('/api/admin/ai/review-script', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientData }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Review script generation failed');
  }
  const data = await res.json();
  return data.script;
}
// ──────────────────────────────────────────────────────────────────────────────

const CRM: React.FC = () => {
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isGeneratingSnapshot, setIsGeneratingSnapshot] = useState(false);
  const [isGeneratingReview, setIsGeneratingReview] = useState(false);
  const [reviewScript, setReviewScript] = useState<any>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'Pipeline' | 'List'>('Pipeline');
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [newClient, setNewClient] = useState<Partial<Client>>({
    status: 'New Lead', county: 'Schuylkill', leadSource: 'Social', productInterest: 'None', household: '', notes: '', goals: []
  });

  const metrics = useMemo(() => ({
    newLeads: clients.filter(c => c.status === 'New Lead').length,
    underwriting: clients.filter(c => c.status === 'Underwriting').length,
    inForce: clients.filter(c => c.status === 'In Force + Review').length,
    pendingCalls: clients.filter(c => c.status === 'Booked Call').length,
  }), [clients]);

  const handleGenerateSnapshot = async (client: Client) => {
    setIsGeneratingSnapshot(true); setAiError(null);
    try {
      const snapshot = await fetchClientSnapshot(client.notes, client.household);
      if (snapshot) {
        const updatedClient = { ...client, snapshot };
        setClients(clients.map(c => c.id === client.id ? updatedClient : c));
        setSelectedClient(updatedClient);
      }
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Snapshot failed');
    } finally {
      setIsGeneratingSnapshot(false);
    }
  };

  const handleGenerateReview = async (client: Client) => {
    setIsGeneratingReview(true); setReviewScript(null); setAiError(null);
    try {
      const script = await fetchReviewScript(client);
      setReviewScript(script);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Review script failed');
    } finally {
      setIsGeneratingReview(false);
    }
  };

  const handleAddClient = () => {
    if (!newClient.name || !newClient.email) {
      alert('Jackson, we need at least a name and email to establish a legacy file.');
      return;
    }
    const clientToAdd: Client = {
      id: Math.random().toString(36).substr(2, 9),
      name: newClient.name || '',
      email: newClient.email || '',
      phone: newClient.phone || '',
      status: newClient.status || 'New Lead',
      county: (newClient.county as County) || 'Schuylkill',
      leadSource: (newClient.leadSource as LeadSource) || 'Social',
      productInterest: (newClient.productInterest as ProductType) || 'None',
      household: newClient.household || '',
      lastInteraction: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      goals: newClient.goals || [],
      notes: newClient.notes || '',
      monthlyPremium: newClient.monthlyPremium
    };
    setClients([clientToAdd, ...clients]);
    setIsAddingClient(false);
    setNewClient({ status: 'New Lead', county: 'Schuylkill', leadSource: 'Social', productInterest: 'None', household: '', notes: '', goals: [] });
  };

  const getStatusStyle = (status: PipelineStage) => {
    const styles: Record<string, string> = {
      'New Lead': 'bg-blue-50 text-blue-600 border-blue-100',
      'Underwriting': 'bg-amber-50 text-amber-600 border-amber-100',
      'In Force + Review': 'bg-emerald-50 text-emerald-600 border-emerald-100',
      'Lost / Not Proceeding': 'bg-slate-50 text-slate-400 border-slate-100',
    };
    return styles[status] || 'bg-slate-50 text-slate-600 border-slate-100';
  };

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateClientStatus = (clientId: string, newStatus: PipelineStage) => {
    const updated = clients.map(c => c.id === clientId ? { ...c, status: newStatus } : c);
    setClients(updated);
    if (selectedClient?.id === clientId) setSelectedClient({ ...selectedClient, status: newStatus });
  };

  return (
    <div className="space-y-8 animate-fadeIn h-full flex flex-col pb-12">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Latimore Life Hub</h1>
          <p className="text-slate-500 mt-1">PA DOI License #1268820 · Schuylkill, Luzerne & Northumberland Counties</p>
        </div>
        <div className="flex gap-3">
          <div className="flex rounded-xl border border-slate-200 overflow-hidden">
            {(['Pipeline','List'] as const).map(mode => (
              <button key={mode} onClick={() => setViewMode(mode)} className={`px-4 py-2.5 text-xs font-black uppercase tracking-widest transition ${viewMode===mode?'bg-[#2C3E50] text-white':'bg-white text-slate-600 hover:bg-slate-50'}`}>{mode}</button>
            ))}
          </div>
          <button onClick={() => setIsAddingClient(true)} className="flex items-center gap-2 rounded-xl bg-[#C49A6C] px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white hover:bg-[#2C3E50] transition">
            <i className="fa-solid fa-user-plus"></i> New Lead
          </button>
        </div>
      </header>

      {/* Metric Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'New Leads', value: metrics.newLeads, icon: 'fa-user-plus', color: 'text-blue-500' },
          { label: 'Booked Calls', value: metrics.pendingCalls, icon: 'fa-phone', color: 'text-violet-500' },
          { label: 'Underwriting', value: metrics.underwriting, icon: 'fa-file-signature', color: 'text-amber-500' },
          { label: 'In Force', value: metrics.inForce, icon: 'fa-shield-check', color: 'text-emerald-500' },
        ].map(m => (
          <div key={m.label} className="bg-white rounded-[1.5rem] p-5 border border-slate-100 shadow-sm">
            <div className={`text-2xl mb-1 ${m.color}`}><i className={`fa-solid ${m.icon}`}></i></div>
            <p className="text-3xl font-black text-slate-900">{m.value}</p>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
        <input type="text" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}
          placeholder="Search clients by name or email..."
          className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#C49A6C] transition" />
      </div>

      {aiError && (
        <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 flex items-center gap-3">
          <i className="fa-solid fa-triangle-exclamation text-red-400"></i>
          <p className="text-sm text-red-600">{aiError}</p>
          <button onClick={() => setAiError(null)} className="ml-auto text-red-300 hover:text-red-500"><i className="fa-solid fa-times"></i></button>
        </div>
      )}

      {/* Pipeline View */}
      {viewMode === 'Pipeline' && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {PIPELINE_STAGES.slice(0, 5).map(stage => {
              const stagClients = filteredClients.filter(c => c.status === stage);
              return (
                <div key={stage} className="w-64 shrink-0">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500 truncate">{stage}</p>
                    <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{stagClients.length}</span>
                  </div>
                  <div className="space-y-2">
                    {stagClients.map(client => (
                      <div key={client.id} onClick={() => setSelectedClient(client)} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm cursor-pointer hover:border-[#C49A6C] transition-all hover:shadow-md">
                        <p className="font-black text-slate-900 text-sm truncate">{client.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{client.county} · {client.productInterest}</p>
                        {client.monthlyPremium && <p className="text-[10px] font-bold text-[#C49A6C] mt-1">${client.monthlyPremium}/mo</p>}
                      </div>
                    ))}
                    {stagClients.length === 0 && <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-center text-[10px] text-slate-300 font-bold">Empty</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'List' && (
        <div className="space-y-2">
          {filteredClients.map(client => (
            <div key={client.id} onClick={() => setSelectedClient(client)} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm cursor-pointer hover:border-[#C49A6C] transition-all flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#2C3E50] flex items-center justify-center text-white font-black text-sm shrink-0">
                {client.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-slate-900 text-sm truncate">{client.name}</p>
                <p className="text-xs text-slate-400 truncate">{client.email}</p>
              </div>
              <div className="hidden md:flex items-center gap-3">
                <span className="text-xs text-slate-400">{client.county}</span>
                <span className="text-xs font-bold text-[#C49A6C]">{client.productInterest}</span>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${getStatusStyle(client.status)}`}>{client.status}</span>
              </div>
            </div>
          ))}
          {filteredClients.length === 0 && (
            <div className="bg-white rounded-[2rem] p-12 border border-slate-100 text-center">
              <p className="text-slate-400 font-black">No clients match your search.</p>
            </div>
          )}
        </div>
      )}

      {/* Client Detail Panel */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-slate-900/40 backdrop-blur-sm" onClick={() => { setSelectedClient(null); setReviewScript(null); setAiError(null); }}>
          <div className="bg-white h-full w-full max-w-lg shadow-2xl overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between z-10">
              <div>
                <h3 className="font-black text-slate-900 text-lg">{selectedClient.name}</h3>
                <p className="text-xs text-slate-400">{selectedClient.county} County · {selectedClient.leadSource}</p>
              </div>
              <button onClick={() => { setSelectedClient(null); setReviewScript(null); setAiError(null); }} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition">
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Picker */}
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Pipeline Stage</label>
                <select value={selectedClient.status} onChange={e => updateClientStatus(selectedClient.id, e.target.value as PipelineStage)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#C49A6C] transition bg-white font-bold">
                  {PIPELINE_STAGES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              {/* Key Info */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Email', selectedClient.email],
                  ['Phone', selectedClient.phone],
                  ['Household', selectedClient.household],
                  ['Product', selectedClient.productInterest],
                  ['Premium', selectedClient.monthlyPremium ? `$${selectedClient.monthlyPremium}/mo` : 'TBD'],
                  ['Last Contact', selectedClient.lastInteraction],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                    <p className="text-sm font-bold text-slate-700 mt-0.5 truncate">{value || '—'}</p>
                  </div>
                ))}
              </div>

              {/* Notes */}
              {selectedClient.notes && (
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Notes</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{selectedClient.notes}</p>
                </div>
              )}

              {/* AI Actions */}
              <div className="space-y-3">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">AI Tools</p>
                <button onClick={() => handleGenerateSnapshot(selectedClient)} disabled={isGeneratingSnapshot} className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#2C3E50] py-3 text-sm font-black uppercase tracking-widest text-white hover:bg-[#C49A6C] transition disabled:opacity-40">
                  <i className={`fa-solid ${isGeneratingSnapshot?'fa-spinner fa-spin':'fa-brain'}`}></i>
                  {isGeneratingSnapshot?'Generating Snapshot...':'Generate Client Snapshot'}
                </button>
                <button onClick={() => handleGenerateReview(selectedClient)} disabled={isGeneratingReview} className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#2C3E50] py-3 text-sm font-black uppercase tracking-widest text-[#2C3E50] hover:bg-[#2C3E50] hover:text-white transition disabled:opacity-40">
                  <i className={`fa-solid ${isGeneratingReview?'fa-spinner fa-spin':'fa-file-lines'}`}></i>
                  {isGeneratingReview?'Generating Script...':'Generate Review Script'}
                </button>
              </div>

              {/* AI Snapshot */}
              {selectedClient.snapshot && (
                <div className="rounded-2xl border border-slate-100 p-5 space-y-4">
                  <p className="text-xs font-black uppercase tracking-widest text-[#C49A6C]">AI Client Snapshot</p>
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Who They Are</p>
                    <p className="text-sm text-slate-700">{selectedClient.snapshot.whoTheyAre}</p>
                  </div>
                  {selectedClient.snapshot.riskThemes?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Risk & Opportunity Themes</p>
                      <div className="space-y-1">
                        {selectedClient.snapshot.riskThemes.map((t: string, i: number) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <i className="fa-solid fa-arrow-right text-[#C49A6C] mt-0.5 shrink-0 text-xs"></i>{t}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Summary</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{selectedClient.snapshot.summary}</p>
                  </div>
                </div>
              )}

              {/* Review Script */}
              {reviewScript && (
                <div className="rounded-2xl border border-slate-100 p-5 space-y-4">
                  <p className="text-xs font-black uppercase tracking-widest text-[#C49A6C]">Legacy Review Script</p>
                  {[
                    { label: 'Opening', content: reviewScript.opening },
                    { label: 'Strategic Pivot', content: reviewScript.strategicPivot },
                    { label: 'Closing', content: reviewScript.closing },
                  ].map(({label, content}) => (
                    <div key={label} className="bg-slate-50 rounded-xl p-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{content}</p>
                    </div>
                  ))}
                  {reviewScript.discoveryQuestions?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Discovery Questions</p>
                      <div className="space-y-1">
                        {reviewScript.discoveryQuestions.map((q: string, i: number) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="text-[#C49A6C] font-black shrink-0">{i+1}.</span>{q}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {isAddingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full shadow-2xl max-h-[85vh] overflow-y-auto">
            <h3 className="font-black text-slate-900 text-xl mb-6">Open a Legacy File</h3>
            <div className="space-y-4">
              {[
                { label: 'Full Name *', key: 'name', type: 'text', placeholder: 'Jane Smith' },
                { label: 'Email *', key: 'email', type: 'email', placeholder: 'jane@email.com' },
                { label: 'Phone', key: 'phone', type: 'tel', placeholder: '(570) 555-0100' },
                { label: 'Household', key: 'household', type: 'text', placeholder: 'Married, 2 children' },
                { label: 'Monthly Budget ($)', key: 'monthlyPremium', type: 'number', placeholder: '75' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1">{field.label}</label>
                  <input type={field.type} value={(newClient as any)[field.key] || ''} onChange={e => setNewClient({...newClient, [field.key]: field.type==='number'?Number(e.target.value):e.target.value})}
                    placeholder={field.placeholder} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#C49A6C] transition" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1">County</label>
                  <select value={newClient.county} onChange={e=>setNewClient({...newClient,county:e.target.value as County})} className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#C49A6C] bg-white">
                    {['Schuylkill','Luzerne','Northumberland','Other'].map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Product</label>
                  <select value={newClient.productInterest} onChange={e=>setNewClient({...newClient,productInterest:e.target.value as ProductType})} className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#C49A6C] bg-white">
                    {['None','Term','IUL','FE','FIA','Business','Whole Life'].map(p=><option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Notes</label>
                <textarea value={newClient.notes} onChange={e=>setNewClient({...newClient,notes:e.target.value})} placeholder="Health conditions, budget, goals, referral source..." rows={3} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#C49A6C] transition resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleAddClient} className="flex-1 rounded-xl bg-[#2C3E50] py-3 text-sm font-black uppercase tracking-widest text-white hover:bg-[#C49A6C] transition">Open File</button>
              <button onClick={()=>setIsAddingClient(false)} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-black uppercase tracking-widest text-slate-600 hover:border-slate-400 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRM;
