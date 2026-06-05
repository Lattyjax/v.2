'use client'

import React, { useEffect, useState } from 'react'
import Dashboard from './_components/Dashboard'
import ContentCreator from './_components/ContentCreator'
import CRM from './_components/CRM'
import CampaignCalendar from './_components/CampaignCalendar'
import TemplateLibrary from './_components/TemplateLibrary'
import MarketingTools from './_components/MarketingTools'
import LegacyFunnels from './_components/LegacyFunnels'
import Connectors from './_components/Connectors'
import AssetVault from './_components/AssetVault'
import ChatBot from './_components/ChatBot'
import { ContentIdea, SocialPost } from './types'

const tabs = [
  ['dashboard','Legacy Pulse','fa-chart-line'],['crm','CRM','fa-users'],['creator','Creator','fa-pen-nib'],['calendar','Calendar','fa-calendar-days'],['library','Templates','fa-book'],['vault','Vault','fa-vault'],['tools','Tools','fa-toolbox'],['funnels','Funnels','fa-filter-circle-dollar'],['connectors','Connectors','fa-plug'],['settings','Settings','fa-gear']
]

function SettingsView() {
  return <div className="mx-auto max-w-3xl space-y-8 animate-fadeIn"><header><h1 className="text-3xl font-bold text-white">Account Management</h1><p className="text-slate-400">PA DOI License #1268820 | NIPR #21638507</p></header><div className="rounded-3xl border border-white/10 bg-white/5 p-8"><h2 className="mb-6 text-xl font-bold text-white">Regional Data Control</h2><button onClick={() => window.location.reload()} className="rounded-xl border border-rose-300/30 bg-rose-500/10 px-6 py-3 text-sm font-black uppercase tracking-widest text-rose-200 hover:bg-rose-500/20">Reset Session</button></div></div>
}

export default function SocialOSClient() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [scheduledPosts, setScheduledPosts] = useState<SocialPost[]>([])
  const [preFillTopic, setPreFillTopic] = useState<string | null>(null)
  const [assetIdeas, setAssetIdeas] = useState<ContentIdea[]>([])
  const [assetSource, setAssetSource] = useState<string>('')

  useEffect(() => {
    const handleTabChange = (e: Event) => setActiveTab((e as CustomEvent<string>).detail)
    window.addEventListener('changeTab', handleTabChange)
    return () => window.removeEventListener('changeTab', handleTabChange)
  }, [])

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard scheduledPosts={scheduledPosts} />
      case 'crm': return <CRM />
      case 'library': return <TemplateLibrary onUseTemplate={(s) => { setPreFillTopic(s); setActiveTab('creator') }} />
      case 'vault': return <AssetVault onIdeasGenerated={(ideas, fileName) => { setAssetIdeas(ideas); setAssetSource(fileName); setActiveTab('creator') }} />
      case 'creator': return <ContentCreator onPostScheduled={(p) => setScheduledPosts(prev => [...prev, p])} preFillTopic={preFillTopic} onClearPreFill={() => setPreFillTopic(null)} scheduledPosts={scheduledPosts} preBuiltIdeas={assetIdeas} preBuiltSource={assetSource} onClearPreBuiltIdeas={() => { setAssetIdeas([]); setAssetSource('') }} />
      case 'tools': return <MarketingTools onBulkSchedule={(posts) => setScheduledPosts(prev => [...prev, ...posts])} />
      case 'funnels': return <LegacyFunnels />
      case 'calendar': return <CampaignCalendar posts={scheduledPosts} onRemovePost={(id) => setScheduledPosts(prev => prev.filter(p => p.id !== id))} onAddPost={(p) => setScheduledPosts(prev => [...prev, p])} />
      case 'connectors': return <Connectors />
      case 'settings': return <SettingsView />
      default: return <Dashboard scheduledPosts={scheduledPosts} />
    }
  }

  return <div className="min-h-screen text-slate-100"><div className="border-b border-white/10 bg-[#0E1420]/80 px-6 py-4 backdrop-blur"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.35em] text-[#C49A6C]">Latimore Social OS</p><h1 className="text-2xl font-black text-white">Legacy Pulse Command Center</h1></div><div className="flex flex-wrap gap-2">{tabs.map(([id,label,icon]) => <button key={id} onClick={() => setActiveTab(id)} className={`rounded-xl px-3 py-2 text-xs font-black uppercase tracking-widest transition ${activeTab===id?'bg-[#C49A6C] text-slate-950':'bg-white/5 text-slate-300 hover:bg-white/10'}`}><i className={`fa-solid ${icon} mr-2`}></i>{label}</button>)}</div></div></div><div className="p-6 xl:p-8 [&_.bg-white]:!bg-white/95 [&_.text-slate-900]:!text-slate-950">{renderContent()}</div><ChatBot /></div>
}
