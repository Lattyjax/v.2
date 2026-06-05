'use client'

import React, { useState, useRef } from 'react';
import { CarrierAsset, ContentIdea } from '../types';

// ─── Secure server-side fetch helper ──────────────────────────────────────────
async function fetchAssetAnalysis(base64Data: string, mimeType: string, platform: string, assetName: string): Promise<ContentIdea[]> {
  const res = await fetch('/api/admin/ai/asset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64Data, mimeType, platform, assetName }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Asset analysis failed');
  }
  const data = await res.json();
  return data.posts ?? [];
}
// ──────────────────────────────────────────────────────────────────────────────

const MOCK_ASSETS: CarrierAsset[] = [
  { id: '1', name: 'Builder Plus 4 IUL Brochure', carrier: 'North American', type: 'IUL', uploadDate: '2024-05-12' },
  { id: '2', name: 'Safe Income Advantage Rider', carrier: 'F&G', type: 'Annuity', uploadDate: '2024-05-10' },
  { id: '3', name: 'Ethos Term Life Spec Sheet', carrier: 'Ethos', type: 'Term', uploadDate: '2024-05-15' },
];

interface AssetVaultProps {
  onIdeasGenerated?: (ideas: ContentIdea[], fileName: string) => void;
}

const AssetVault: React.FC<AssetVaultProps> = ({ onIdeasGenerated }) => {
  const [assets, setAssets] = useState<CarrierAsset[]>(MOCK_ASSETS);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [platform, setPlatform] = useState('LinkedIn');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result?.toString().split(',')[1];
      const newAsset: CarrierAsset = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        carrier: 'Manual Upload',
        type: file.type.includes('pdf') ? 'PDF Document' : 'Product Image',
        uploadDate: new Date().toISOString().split('T')[0],
        fileData: base64Data,
        mimeType: file.type
      };
      setAssets(prev => [newAsset, ...prev]);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAnalyze = async (asset: CarrierAsset) => {
    if (!asset.fileData || !asset.mimeType) {
      setError('This asset has no file data. Please upload a fresh file to test analysis.');
      return;
    }
    setIsAnalyzing(asset.id); setError(null);
    try {
      const ideas = await fetchAssetAnalysis(asset.fileData, asset.mimeType, platform, asset.name);
      if (ideas.length > 0 && onIdeasGenerated) onIdeasGenerated(ideas, asset.name);
      else setError('No content ideas generated. Try a different document or platform.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(null);
    }
  };

  const deleteAsset = (id: string) => setAssets(prev => prev.filter(a => a.id !== id));

  const TYPE_COLORS: Record<string, string> = {
    'IUL': 'bg-purple-50 text-purple-600',
    'Annuity': 'bg-blue-50 text-blue-600',
    'Term': 'bg-emerald-50 text-emerald-600',
    'PDF Document': 'bg-amber-50 text-amber-600',
    'Product Image': 'bg-pink-50 text-pink-600',
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Asset Vault</h1>
          <p className="text-slate-500 mt-1">Upload carrier documents. AI generates brand-locked social content from them.</p>
        </div>
        <div className="flex gap-3 items-center">
          <select value={platform} onChange={e=>setPlatform(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-[#C49A6C] bg-white">
            {['LinkedIn','Facebook','Instagram','Twitter'].map(p=><option key={p}>{p}</option>)}
          </select>
          <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="flex items-center gap-2 rounded-xl bg-[#2C3E50] px-5 py-3 text-sm font-black uppercase tracking-widest text-white transition hover:bg-[#C49A6C] disabled:opacity-40">
            <i className={`fa-solid ${isUploading?'fa-spinner fa-spin':'fa-upload'}`}></i>
            {isUploading?'Uploading...':'Upload Asset'}
          </button>
          <input ref={fileInputRef} type="file" accept=".pdf,image/*" onChange={handleFileUpload} className="hidden" />
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 flex items-center gap-3">
          <i className="fa-solid fa-triangle-exclamation text-red-400"></i>
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-300 hover:text-red-500"><i className="fa-solid fa-times"></i></button>
        </div>
      )}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {assets.map(asset => (
          <div key={asset.id} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl">
                {asset.mimeType?.startsWith('image/') ? '🖼️' : asset.type === 'PDF Document' ? '📄' : '📋'}
              </div>
              <button onClick={() => deleteAsset(asset.id)} className="text-slate-200 hover:text-rose-400 transition">
                <i className="fa-solid fa-trash text-xs"></i>
              </button>
            </div>
            <h3 className="font-black text-slate-900 text-sm leading-tight mb-1">{asset.name}</h3>
            <p className="text-xs text-slate-400 mb-3">{asset.carrier} · {asset.uploadDate}</p>
            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${TYPE_COLORS[asset.type] || 'bg-slate-50 text-slate-500'}`}>
              {asset.type}
            </span>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <button
                onClick={() => handleAnalyze(asset)}
                disabled={!!isAnalyzing || !asset.fileData}
                className={`w-full rounded-xl py-2.5 text-xs font-black uppercase tracking-widest transition flex items-center justify-center gap-2 ${asset.fileData ? 'bg-[#2C3E50] text-white hover:bg-[#C49A6C]' : 'bg-slate-100 text-slate-400 cursor-not-allowed'} disabled:opacity-60`}
              >
                <i className={`fa-solid ${isAnalyzing===asset.id?'fa-spinner fa-spin':'fa-wand-magic-sparkles'}`}></i>
                {isAnalyzing===asset.id ? 'Analyzing...' : asset.fileData ? 'Generate Content' : 'Upload File First'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {assets.length === 0 && (
        <div className="bg-white rounded-[2rem] p-16 border border-slate-100 text-center">
          <i className="fa-solid fa-vault text-5xl text-slate-200 mb-4"></i>
          <p className="font-black text-slate-400">Your vault is empty.</p>
          <p className="text-sm text-slate-400 mt-1">Upload carrier brochures, spec sheets, or product images to generate content from them.</p>
        </div>
      )}
    </div>
  );
};

export default AssetVault;
