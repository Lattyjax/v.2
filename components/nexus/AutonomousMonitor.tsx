'use client'

import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Cpu, 
  Terminal, 
  Play, 
  Pause, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Filter, 
  Trash2, 
  Plus, 
  FileText, 
  TrendingUp, 
  Database,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Workflow {
  id: string;
  name: string;
  category: 'Compliance' | 'Marketing' | 'SLA' | 'Database';
  status: 'running' | 'paused' | 'completed' | 'failed';
  progress: number;
  duration: number; // in seconds
  launchedAt: string;
  stepsCount: number;
  completedSteps: number;
  error?: string;
  logs: string[];
}

interface AlertItem {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
}

interface HistoricalPoint {
  time: string;
  cpu: number;
  memory: number;
  tasksCompleted: number;
}

export const AutonomousMonitor: React.FC = () => {
  // State for filtering
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('1h');
  const [logFilter, setLogFilter] = useState<'all' | 'error' | 'warn' | 'info'>('all');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);

  // Live fluctuating metrics state
  const [cpuUsage, setCpuUsage] = useState<number>(34);
  const [memoryUsage, setMemoryUsage] = useState<number>(1.24); // GB
  const [apiLatency, setApiLatency] = useState<number>(422); // ms
  const [tokensRate, setTokensRate] = useState<number>(120); // tokens per sec

  // Historical lists for sparkline SVG drawing
  const [cpuHistory, setCpuHistory] = useState<number[]>([30, 35, 42, 38, 31, 35, 40, 38, 45, 52, 48, 44, 38, 35, 33, 34, 37, 36, 32, 34]);
  const [memoryHistory, setMemoryHistory] = useState<number[]>([1.18, 1.20, 1.22, 1.22, 1.23, 1.23, 1.24, 1.24, 1.24, 1.25, 1.25, 1.26, 1.26, 1.25, 1.24, 1.24, 1.24, 1.24, 1.24, 1.24]);

  // System status metrics summary based on time range
  const getHistoricalSummary = () => {
    switch (timeRange) {
      case '1h':
        return {
          totalTasks: 24,
          completedTasks: 21,
          failedTasks: 2,
          runningTasks: 1,
          tokensUsed: '124,520',
          avgCostSaved: '$420',
          uptime: '99.98%'
        };
      case '24h':
        return {
          totalTasks: 412,
          completedTasks: 388,
          failedTasks: 18,
          runningTasks: 6,
          tokensUsed: '2,840,110',
          avgCostSaved: '$3,850',
          uptime: '99.94%'
        };
      case '7d':
        return {
          totalTasks: 2841,
          completedTasks: 2712,
          failedTasks: 94,
          runningTasks: 35,
          tokensUsed: '19,428,204',
          avgCostSaved: '$24,200',
          uptime: '99.97%'
        };
    }
  };

  const summary = getHistoricalSummary();

  // Active Simulated Workflows
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: 'wf-1',
      name: 'Autumn Brand compliance Audit & Remediation',
      category: 'Compliance',
      status: 'running',
      progress: 72,
      duration: 182,
      launchedAt: '12m ago',
      stepsCount: 5,
      completedSteps: 3,
      logs: [
        'Initialize verification sequence...',
        'Checking workspace documents...',
        'Read file "readme.md" - status: scan successful',
        'Detecting compliance conflicts in "readme.md"...',
        'Creating reports folder at docs/...',
        'Writing "docs/compliance_scan.json" with results.'
      ]
    },
    {
      id: 'wf-2',
      name: 'Policy Validation Underwriting Rules Verification',
      category: 'SLA',
      status: 'failed',
      progress: 80,
      duration: 540,
      launchedAt: '1h ago',
      stepsCount: 10,
      completedSteps: 8,
      error: 'Vercel Server Routing limits exceeded (30s TCP timeout)',
      logs: [
        'Fetching rules schema from cloud bucket...',
        'Validating PA school regulations guidelines...',
        'Comparing with current policy drafts...',
        'SLA validation rules test #1 - success',
        'SLA validation rules test #8 - running',
        'Error: Network socket timed out on route /api/rules/verify'
      ]
    },
    {
      id: 'wf-3',
      name: 'Dynamic Lead Ingestion & Profile Enrichment',
      category: 'Marketing',
      status: 'completed',
      progress: 100,
      duration: 345,
      launchedAt: '2h ago',
      stepsCount: 6,
      completedSteps: 6,
      logs: [
        'Found 12 prospective customer sheets from Google Drive folder',
        'Scanning rows for prospect contact email entries...',
        'Auto-completing CRM profiles with matched regional demography...',
        'Enrichment database synced to Supabase schema: complete',
        'Dispatched notification to sales channel: complete'
      ]
    },
    {
      id: 'wf-4',
      name: 'Secure Vault Synchronization Client Credentials',
      category: 'Database',
      status: 'paused',
      progress: 45,
      duration: 120,
      launchedAt: '15m ago',
      stepsCount: 4,
      completedSteps: 2,
      logs: [
        'Attempting background credentials sync...',
        'Loading secure cryptographic key schema...',
        'Operation suspended: Pending manual authorization trigger.'
      ]
    }
  ]);

  // Active alerts list
  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: 'alt-1',
      severity: 'critical',
      message: 'Underwriting database connection timeout on endpoint db.latimore.internal',
      timestamp: '15m ago',
      resolved: false
    },
    {
      id: 'alt-2',
      severity: 'warning',
      message: 'Workflow "Underwriting SLA Audit" failed after 3 consecutive retry attempts',
      timestamp: '1h ago',
      resolved: false
    },
    {
      id: 'alt-3',
      severity: 'info',
      message: 'Brand asset compliance check resolved 14 soft layout warnings, auto-aligned headers',
      timestamp: '2h ago',
      resolved: false
    }
  ]);

  // Handle live ticks (Fluctuating resources & progress of running workflows)
  useEffect(() => {
    const interval = setInterval(() => {
      // Fluctuate metrics
      setCpuUsage(prev => {
        const next = prev + (Math.random() * 8 - 4);
        const clamped = Math.max(10, Math.min(95, Math.round(next)));
        setCpuHistory(hist => [...hist.slice(1), clamped]);
        return clamped;
      });

      setMemoryUsage(prev => {
        const next = prev + (Math.random() * 0.04 - 0.02);
        const clamped = Math.max(0.8, Math.min(3.8, parseFloat(next.toFixed(2))));
        setMemoryHistory(hist => [...hist.slice(1), clamped]);
        return clamped;
      });

      setApiLatency(prev => {
        const next = prev + (Math.random() * 40 - 20);
        return Math.max(120, Math.min(850, Math.round(next)));
      });

      setTokensRate(prev => {
        const next = prev + (Math.random() * 16 - 8);
        return Math.max(0, Math.min(450, Math.round(next)));
      });

      // Update progress of running workflows
      setWorkflows(prevWfs => 
        prevWfs.map(wf => {
          if (wf.status === 'running') {
            const nextProgress = Math.min(100, wf.progress + Math.round(Math.random() * 4 + 1));
            const completed = Math.min(wf.stepsCount, Math.floor((nextProgress / 100) * wf.stepsCount));
            const isFinished = nextProgress >= 100;
            const newLogs = [...wf.logs];
            
            if (nextProgress % 15 === 0 && !isFinished) {
              newLogs.push(`System worker checklist processing item #${completed + 1}...`);
            }
            if (isFinished && wf.progress < 100) {
              newLogs.push('Workflow run finished successfully. Output verified.');
            }

            return {
              ...wf,
              progress: nextProgress,
              completedSteps: completed,
              status: isFinished ? 'completed' : 'running',
              duration: wf.duration + 2,
              logs: newLogs
            };
          }
          return wf;
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  const handleAction = (id: string, action: 'pause' | 'resume' | 'cancel' | 'restart') => {
    setWorkflows(prev => 
      prev.map(wf => {
        if (wf.id === id) {
          if (action === 'pause') {
            return {
              ...wf,
              status: 'paused',
              logs: [...wf.logs, '[USER TRIGGER] Paused execution feed. Pending restart.']
            };
          }
          if (action === 'resume') {
            return {
              ...wf,
              status: 'running',
              logs: [...wf.logs, '[USER TRIGGER] Resumed live operations stream.']
            };
          }
          if (action === 'cancel') {
            return {
              ...wf,
              status: 'failed',
              error: 'Cancelled by administrator',
              logs: [...wf.logs, '[USER TRIGGER] Terminated process manually. Status set to failed.']
            };
          }
          if (action === 'restart') {
            return {
              ...wf,
              status: 'running',
              progress: 0,
              completedSteps: 0,
              duration: 0,
              error: undefined,
              logs: ['[USER TRIGGER] Restarting workflow sequence...']
            };
          }
        }
        return wf;
      })
    );
  };

  const createSimulatedWorkflow = () => {
    const categories: ('Compliance' | 'Marketing' | 'SLA' | 'Database')[] = ['Compliance', 'Marketing', 'SLA', 'Database'];
    const names = [
      'Interactive Reinsurance Ledger Reconciliation',
      'Agentic Prospect Match & Outbound Copywriting',
      'Real-time SLA Analytics Compilation',
      'Supabase Automated Table Audit & Backup'
    ];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const name = names[Math.floor(Math.random() * names.length)];
    const id = `wf-${Date.now()}`;

    const newWf: Workflow = {
      id,
      name,
      category,
      status: 'running',
      progress: 0,
      duration: 0,
      launchedAt: 'Just now',
      stepsCount: 6,
      completedSteps: 0,
      logs: [
        'Booting autonomous agent sandbox container...',
        'Authenticating credential tokens...',
        'Spawning main thread orchestration scheduler.'
      ]
    };

    setWorkflows(prev => [newWf, ...prev]);
    setSelectedWorkflowId(id);
  };

  const currentWorkflow = workflows.find(wf => wf.id === selectedWorkflowId) || workflows[0];

  // Draw responsive SVG line graphs
  const makePath = (data: number[], maxVal: number) => {
    const width = 160;
    const height = 40;
    const padding = 2;
    const pointsCount = data.length;
    
    return data.map((val, idx) => {
      const x = (idx / (pointsCount - 1)) * (width - padding * 2) + padding;
      const y = height - ((val / maxVal) * (height - padding * 2) + padding);
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  return (
    <div className="bg-white rounded-lg border border-[rgba(44,62,80,0.12)] shadow-sm overflow-hidden flex flex-col gap-4 p-4 md:p-5">
      {/* Title Bar & Configs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[rgba(44,62,80,0.08)] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#C49A6C]/10 flex items-center justify-center text-[#C49A6C]">
            <Activity className="animate-pulse" size={18} />
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-[#2C3E50] uppercase tracking-wider leading-none">Autonomous Operations Dashboard</h3>
            <p className="text-[10px] text-[#6b6b6b] mt-1">Real-time container metrics, active agents schedules & logs audit</p>
          </div>
        </div>

        {/* Live Sparkles Trigger & Time Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <button 
            onClick={createSimulatedWorkflow}
            className="text-[10.5px] font-bold text-white bg-[#C49A6C] hover:bg-[#b08557] px-3 py-1.5 rounded transition-all flex items-center gap-1.5 hover:scale-[1.02] active:scale-95 cursor-pointer shadow-sm"
          >
            <Plus size={12} /> Trigger Task
          </button>
          
          <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-md border border-[rgba(44,62,80,0.06)]">
            {(['1h', '24h', '7d'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`text-[9px] uppercase font-bold px-2 py-1 rounded transition-all cursor-pointer ${
                  timeRange === range 
                    ? 'bg-white text-[#2C3E50] shadow-sm' 
                    : 'text-slate-500 hover:text-[#2C3E50]'
                }`}
              >
                {range === '1h' ? 'Last Hour' : range === '24h' ? '24 Hours' : '7 Days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Active Workflows & Status */}
        <div className="bg-[#fcfbfa] border border-[rgba(44,62,80,0.1)] rounded-lg p-3.5 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-1.5">
            <span className="text-[10px] text-[#6b6b6b] font-bold uppercase tracking-wider">Live Channels</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[8px] font-mono font-bold text-emerald-600 uppercase">Online</span>
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-[#2C3E50]">
              {workflows.filter(w => w.status === 'running').length}
            </span>
            <span className="text-[10px] text-[#6b6b6b]">active / {workflows.length} total</span>
          </div>
          <p className="text-[9px] text-[#C49A6C] mt-2 font-medium">Uptime guarantee: {summary.uptime}</p>
          <div className="absolute top-0 right-0 w-8 h-8 opacity-[0.03] text-emerald-500 group-hover:scale-110 transition-transform">
            <CheckCircle size={32} />
          </div>
        </div>

        {/* Card 2: Task Completion Status Bar */}
        <div className="bg-[#fcfbfa] border border-[rgba(44,62,80,0.1)] rounded-lg p-3.5 relative overflow-hidden group">
          <span className="text-[10px] text-[#6b6b6b] font-bold uppercase tracking-wider block mb-1.5">Task Completeness</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-[#2C3E50]">
              {Math.round((summary.completedTasks / summary.totalTasks) * 100)}%
            </span>
            <span className="text-[10px] text-[#6b6b6b]">({summary.completedTasks} of {summary.totalTasks})</span>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-1 bg-slate-200 rounded-full mt-2.5 overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
              style={{ width: `${(summary.completedTasks / summary.totalTasks) * 100}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1 text-[8px] font-bold text-slate-400">
            <span>FAILURES: {summary.failedTasks}</span>
            <span className="text-emerald-600">SUCCESS</span>
          </div>
        </div>

        {/* Card 3: CPU Live sparkline */}
        <div className="bg-[#fcfbfa] border border-[rgba(44,62,80,0.1)] rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between text-[10px] text-[#6b6b6b] font-bold uppercase tracking-wider">
              <span>CPU Compute Node</span>
              <span className="text-[#C49A6C] font-mono">{cpuUsage}%</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[#2C3E50]">{cpuUsage}%</span>
              <span className="text-[9px] text-[#b37400] font-bold">FLUID</span>
            </div>
          </div>
          {/* SVG Sparkline */}
          <div className="h-8 mt-2 overflow-hidden flex items-end">
            <svg className="w-full" viewBox="0 0 160 40" preserveAspectRatio="none">
              <path 
                d={makePath(cpuHistory, 100)} 
                fill="none" 
                stroke="#C49A6C" 
                strokeWidth="1.5" 
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Card 4: Memory Live sparkline */}
        <div className="bg-[#fcfbfa] border border-[rgba(44,62,80,0.1)] rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between text-[10px] text-[#6b6b6b] font-bold uppercase tracking-wider">
              <span>Memory Heap load</span>
              <span className="text-[#2C3E50] font-mono">{Math.round((memoryUsage / 4.0) * 100)}%</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[#2C3E50]">{memoryUsage} GB</span>
              <span className="text-[8px] font-mono text-slate-400">/ 4.0 GB limit</span>
            </div>
          </div>
          {/* SVG Sparkline */}
          <div className="h-8 mt-2 overflow-hidden flex items-end">
            <svg className="w-full" viewBox="0 0 160 40" preserveAspectRatio="none">
              <path 
                d={makePath(memoryHistory, 4.0)} 
                fill="none" 
                stroke="#2C3E50" 
                strokeWidth="1.5" 
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Primary Row: Active Workflows Lists and Live Logs Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left pane: Active & Recent Workflows (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="flex items-center justify-between p-1 bg-[#f9f8f6] rounded border border-[rgba(44,62,80,0.06)] px-2">
            <span className="text-[10px] font-bold text-[#2C3E50] uppercase tracking-wider flex items-center gap-1">
              <Cpu size={12} className="text-[#C49A6C]" /> Orchestration Queue
            </span>
            <span className="text-[8.5px] font-mono text-slate-400">SELECT PROCESS TO REVEAL FULL AUDIT LOGS</span>
          </div>

          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {workflows.map((wf) => {
              const isActive = selectedWorkflowId === wf.id;
              return (
                <div 
                  key={wf.id}
                  onClick={() => setSelectedWorkflowId(wf.id)}
                  className={`border rounded-lg p-3 transitions cursor-pointer flex flex-col gap-2 relative ${
                    isActive 
                      ? 'bg-[#C49A6C]/5 border-[#C49A6C]/30 shadow-sm' 
                      : 'bg-white border-[rgba(44,62,80,0.1)] hover:border-[#C49A6C]/40 hover:bg-slate-50/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                        <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                          wf.category === 'Compliance' ? 'bg-amber-100 text-amber-800' :
                          wf.category === 'SLA' ? 'bg-blue-100 text-blue-800' :
                          wf.category === 'Marketing' ? 'bg-purple-100 text-purple-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {wf.category}
                        </span>
                        <span className="text-[9px] text-[#6b6b6b] font-medium flex items-center gap-1">
                          <Clock size={10} /> {wf.launchedAt}
                        </span>
                      </div>
                      <span className="font-semibold text-xs text-[#2C3E50] block truncate">
                        {wf.name}
                      </span>
                    </div>

                    {/* Badge status */}
                    <div className="flex items-center gap-1 shrink-0">
                      {wf.status === 'running' && (
                        <span className="text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/50 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                          <RefreshCw className="animate-spin" size={8} /> running
                        </span>
                      )}
                      {wf.status === 'paused' && (
                        <span className="text-[9px] font-bold bg-[#fff3d4] text-[#b37400] border border-amber-200/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Pause size={8} fill="currentColor" /> paused
                        </span>
                      )}
                      {wf.status === 'completed' && (
                        <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle size={8} /> completed
                        </span>
                      )}
                      {wf.status === 'failed' && (
                        <span className="text-[9px] font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <XCircle size={8} /> failed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[9px] leading-none text-slate-400">
                      <span>Step {wf.completedSteps} of {wf.stepsCount} complete</span>
                      <span className="font-semibold text-[#2C3E50]">{wf.progress}%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          wf.status === 'failed' ? 'bg-red-500' :
                          wf.status === 'paused' ? 'bg-amber-400' : 'bg-[#C49A6C]'
                        }`}
                        style={{ width: `${wf.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Admin controls row */}
                  <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-[rgba(44,62,80,0.04)]">
                    <div className="text-[8.5px] text-red-500 font-mono truncate max-w-[180px]">
                      {wf.error && `ERR: ${wf.error}`}
                    </div>
                    
                    <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                      {wf.status === 'running' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleAction(wf.id, 'pause'); }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[8.5px] uppercase font-bold flex items-center gap-0.5"
                          title="Pause"
                        >
                          <Pause size={8} /> Pause
                        </button>
                      )}
                      {wf.status === 'paused' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleAction(wf.id, 'resume'); }}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[8.5px] uppercase font-bold flex items-center gap-0.5"
                          title="Resume"
                        >
                          <Play size={8} /> Resume
                        </button>
                      )}
                      {(wf.status === 'running' || wf.status === 'paused') && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleAction(wf.id, 'cancel'); }}
                          className="bg-red-50 hover:bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-[8.5px] uppercase font-bold flex items-center gap-0.5"
                          title="Kill process"
                        >
                          Kill
                        </button>
                      )}
                      {(wf.status === 'completed' || wf.status === 'failed') && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleAction(wf.id, 'restart'); }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[8.5px] uppercase font-bold flex items-center gap-0.5"
                          title="Rerun Workflow"
                        >
                          <RefreshCw size={8} /> Retry
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right pane: Dedicated Console Logs Auditor (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex items-center justify-between p-1 bg-slate-900 rounded border border-slate-800 px-2">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1 font-mono">
              <Terminal size={11} className="text-[#C49A6C]" /> Sandbox Console
            </span>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setLogFilter(prev => prev === 'all' ? 'error' : 'all')}
                className={`text-[8px] font-mono px-1.5 py-0.5 rounded ${
                  logFilter === 'error' ? 'bg-red-950 text-red-400' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {logFilter === 'error' ? 'ERRORS ONLY' : 'ALL FILTERS'}
              </button>
            </div>
          </div>

          <div className="bg-[#111622] rounded-lg border border-slate-800 p-3.5 h-[360px] flex flex-col font-mono text-[10px] leading-relaxed relative overflow-hidden">
            <div className="border-b border-slate-800/80 pb-2 mb-2 flex items-center justify-between text-[8px] text-slate-500 font-bold">
              <span>TARGET CONTEXT: {currentWorkflow.category || 'Sandbox'}</span>
              <span className="text-emerald-500 animate-pulse">● FEED ONLINE</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 text-slate-300">
              <div className="text-[8.5px] text-slate-500 italic">--- System logs timeline matching current process: {currentWorkflow.name} ---</div>
              
              {currentWorkflow ? (
                currentWorkflow.logs
                  .filter(log => {
                    if (logFilter === 'all') return true;
                    if (logFilter === 'error') return log.toLowerCase().includes('error') || log.toLowerCase().includes('err');
                    return true;
                  })
                  .map((log, index) => {
                    const isErr = log.toLowerCase().includes('error') || log.toLowerCase().includes('err') || log.toLowerCase().includes('suspend');
                    const isUser = log.startsWith('[USER');
                    
                    return (
                      <div key={index} className="flex gap-2.5 items-start">
                        <span className="text-slate-600 select-none shrink-0">[{index + 1}]</span>
                        <div className={`flex-1 break-words leading-normal ${isErr ? 'text-red-400 font-medium' : isUser ? 'text-[#C49A6C] font-semibold' : 'text-emerald-400'}`}>
                          {log}
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="text-slate-500 italic text-center py-12">No workflow selected or available logs.</div>
              )}
            </div>

            {/* Simulated Live command shell prompt inside the console */}
            <div className="border-t border-slate-800/80 pt-2 mt-2 flex items-center gap-1.5">
              <span className="text-[#C49A6C] font-bold select-none">$</span>
              <input 
                type="text" 
                readOnly 
                value={`npm run dev --sandbox-scope=${currentWorkflow?.id || 'all'}`}
                className="bg-transparent border-none outline-none text-slate-500 flex-1 font-mono text-[9px] cursor-not-allowed select-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* alerts Section */}
      <AnimatePresence>
        {alerts.length > 0 && (
          <div className="border border-[rgba(44,62,80,0.1)] rounded-lg p-3.5 bg-amber-50/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-[#b37400] uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle size={12} /> Active Operations Alerts ({alerts.length})
              </span>
              <button 
                onClick={clearAllAlerts}
                className="text-[9px] font-bold text-[#b37400]/80 hover:text-[#b37400] underline flex items-center gap-1 cursor-pointer"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
              {alerts.map((al) => (
                <div 
                  key={al.id} 
                  className="bg-white/95 rounded border border-amber-200/40 p-2 text-[10px] text-slate-700 flex items-start gap-2.5"
                >
                  <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                    al.severity === 'critical' ? 'bg-red-500' :
                    al.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  
                  <div className="flex-1 leading-normal">
                    <span className="font-semibold uppercase text-[8px] text-slate-400 mr-2">[{al.timestamp}]</span>
                    {al.message}
                  </div>

                  <button 
                    onClick={() => dismissAlert(al.id)}
                    className="text-slate-400 hover:text-slate-600 font-bold hover:scale-105 cursor-pointer px-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
