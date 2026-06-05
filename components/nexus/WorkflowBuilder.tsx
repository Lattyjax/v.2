'use client'

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Plus, 
  Save, 
  FolderOpen, 
  Settings2, 
  Check, 
  X, 
  Layers, 
  RotateCcw, 
  ChevronRight, 
  Clock, 
  CheckSquare, 
  Search, 
  MousePointer2, 
  Type, 
  Terminal, 
  Sliders,
  Sparkles,
  HelpCircle,
  Brain,
  Upload,
  Code
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface WorkflowStep {
  id: string;
  type: 'BROWSER_NAVIGATE' | 'BROWSER_CLICK' | 'BROWSER_TYPE' | 'TERMINAL_COMMAND' | 'WAIT' | 'AI_AGENT_PROMPT';
  description: string;
  payload: string;
  requiresConfirmation: boolean;
  status?: 'idle' | 'running' | 'completed' | 'failed';
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  category: 'Compliance' | 'Marketing' | 'SLA' | 'Database' | 'Custom';
  description: string;
  steps: WorkflowStep[];
  createdAt: string;
  triggerType?: 'FORM_SUBMIT' | 'CRON_SCHEDULE' | 'STAGE_CHANGE' | 'MANUAL';
  triggerValue?: string;
}

// Predefined high-quality templates including the GPT-Chain 3.3.0 Loop
const PRESET_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'tpl-drip-campaign',
    name: '30-Day Email Drip Campaign Engine',
    category: 'Marketing',
    description: 'Source-tagged 6-stage 30-day nurture workflow for insurance prospects. Produces email drafts, SMS companions, automation rules, KPI targets, and a paste-ready marketing plan addendum.',
    createdAt: 'GPT-Chain 3.3.0 — Latimore OS',
    triggerType: 'FORM_SUBMIT',
    triggerValue: '/api/lead',
    steps: [
      { id: 'drip-1', type: 'AI_AGENT_PROMPT', requiresConfirmation: false, description: '🧠 Business + Plan Context Lock', payload: 'Build the Email Drip Campaign System addendum for Latimore Life & Legacy LLC. Owner: Jackson Latimore Sr. Offers: Life insurance, living benefits, mortgage protection, retirement income planning, annuity education, legacy planning. Service area: Coal Region and surrounding communities (Schuylkill, Luzerne, Northumberland Counties PA). Voice: Plain English, no pressure, clarity-first, trust-building, local community tone. Booking link: {{booking_link}}. CRM: Your CRM. Output: (1) A short "Why this drip exists" paragraph, (2) the 6-stage framework labels (welcome, education, social proof, soft ask, urgency nudge, re-engagement), (3) the 30-day cadence (Day 0, 2, 5, 10, 17, 30) with a one-line goal for each touch.' },
      { id: 'drip-2', type: 'AI_AGENT_PROMPT', requiresConfirmation: false, description: '🏷 Source Tagging + Sequence Assignment Map', payload: 'Create the Trigger Sources section with: Lead Source, Assigned Sequence Name, Primary intent, CRM tags, Entry criteria, Exit criteria. Map these sources: PAHS QR code → Family Protection/Community Trust; Website consultation form → General Protection Review; Ethos quote request → Fast Term/Living Benefits; Retirement inquiry → Annuity/Safe Money; Facebook DM "PROTECT" → Life Insurance Education; Google Business Profile → Local Trust/Policy Review.' },
      { id: 'drip-3', type: 'AI_AGENT_PROMPT', requiresConfirmation: false, description: '🗓 30-Day Drip Blueprint', payload: 'Build the 30-Day Lead Nurture Sequence as a table. Columns: Day, Stage, Channel (email/text/both), Theme/subject angle, Primary goal, CTA, Personalization tokens. Rules: Day 0 confirms receipt; Education teaches coverage needs framework; Social proof uses local community credibility; Soft ask invites low-pressure review; Urgency explains risk without fearmongering; Re-engagement adds fresh value.' },
      { id: 'drip-4', type: 'AI_AGENT_PROMPT', requiresConfirmation: false, description: '✉️ Six Email Drafts (Plug-and-Play)', payload: 'Write full copy for 6 emails: Day 0 Welcome, Day 2 Education, Day 5 Social Proof, Day 10 Soft Ask, Day 17 Urgency Nudge, Day 30 Re-engagement. Each: Subject line + body + clear CTA with {{booking_link}}. Use {{first_name}} in greeting. Short paragraphs. Voice: plain English, no pressure, clarity-first. Signature: Jackson Latimore | Founder | Protection & Retirement Advisor | Latimore Life & Legacy LLC. Include compliance footer: unsubscribe option, business address, TCPA/CAN-SPAM compliant.' },
      { id: 'drip-5', type: 'AI_AGENT_PROMPT', requiresConfirmation: false, description: '📲 Text Message Companions', payload: 'Create matching SMS messages for Day 0, 2, 5, 10, 17, 30. Max 240 characters each. Friendly, professional, local-trust tone. One CTA per message (reply keyword or book via {{booking_link}}). Use {{first_name}}. Include opt-out language: "Reply STOP to unsubscribe."' },
      { id: 'drip-6', type: 'AI_AGENT_PROMPT', requiresConfirmation: false, description: '🤖 Automation Rules + Manual Task Logic', payload: 'Write automation rules for the CRM: (1) Trigger on new lead + source captured; (2) Entry: apply tags, send Day 0, create timeline; (3) Branches: book → stop+move to Booked+create task, reply → pause+move to Engaged, opt-out → stop all+tag Opted Out; (4) No-response after Day 10 → create manual call task for Jackson; (5) Day 30 no-engagement → tag Cold. Include numbered rules list and pseudo-flow diagram.' },
      { id: 'drip-7', type: 'AI_AGENT_PROMPT', requiresConfirmation: false, description: '📊 KPI Targets + Reporting Loop', payload: 'Create KPI tracking table: Email open rate (target 35%+), Click-through rate (3-8%), Reply rate (5%+), Booking conversion (10-20%), Sequence completion (80%+), Cold lead revival (5-10%). For each KPI: target, how to measure, weekly action if below target. Add 10-min weekly review checklist and two A/B tests to run (subject lines and CTA phrasing).' },
      { id: 'drip-8', type: 'AI_AGENT_PROMPT', requiresConfirmation: true, description: '🧩 Paste-Ready Marketing Plan Addendum', payload: 'Compile everything into a single Email Drip Campaign System addendum paste-ready for the Business + Marketing Plan. Structure: Overview → 6-stage framework → Trigger Sources → 30-Day Table → Email Drafts → Text Companions → Automation Rules → KPIs → Bottom Line (lead → tag → drip → booking → task → pipeline). Clean, skimmable, implementation-ready.' },
    ]
  },
  {
    id: 'tpl-gpt-chain',
    name: 'Always-Updated Audit & Fix Loop',
    category: 'SLA',
    description: 'A recurring GPT-Chain workflow that audits a codebase, detects recent changes, fixes issues by priority, verifies fixes, and updates a running fix log.',
    createdAt: 'GPT-Chain 3.3.0',
    triggerType: 'CRON_SCHEDULE',
    triggerValue: '0 0 * * *',
    steps: [
      {
        id: 's4-1',
        type: 'AI_AGENT_PROMPT',
        description: '🧠 Codebase Context Loader',
        payload: 'Analyze repository context for Latimore Hub OS. Create or update running log titled "CODEBASE FIX LOG - latimore-hub". Track timestamps, unresolved risks, and fixes attempted.',
        requiresConfirmation: false
      },
      {
        id: 's4-2',
        type: 'AI_AGENT_PROMPT',
        description: '🔍 Recent Change Detector',
        payload: 'Review latest codebase context and identify recent changes. Look for modified architecture, configuration changes, or security-sensitive edits.',
        requiresConfirmation: false
      },
      {
        id: 's4-3',
        type: 'AI_AGENT_PROMPT',
        description: '🧪 Full Codebase Audit',
        payload: 'Perform a complete audit of Latimore Hub OS. Check code quality, security risks, database pool connection, and release blocking bugs.',
        requiresConfirmation: false
      },
      {
        id: 's4-4',
        type: 'AI_AGENT_PROMPT',
        description: '🛠 Fix Plan Generator',
        payload: 'Convert the audit findings into practical fix batches. Prioritize critical blockers and secure customer API pathways.',
        requiresConfirmation: false
      },
      {
        id: 's4-5',
        type: 'AI_AGENT_PROMPT',
        description: '🚨 Apply Critical Fixes',
        payload: 'Apply exact fixes for critical issues automatically or provide concise patch guides.',
        requiresConfirmation: true
      },
      {
        id: 's4-6',
        type: 'TERMINAL_COMMAND',
        description: '✅ Verify Critical Fixes',
        payload: 'npm run build && npm run lint',
        requiresConfirmation: false
      },
      {
        id: 's4-7',
        type: 'WAIT',
        description: 'Sleep cooldown period for node execution',
        payload: '1000',
        requiresConfirmation: false
      },
      {
        id: 's4-8',
        type: 'AI_AGENT_PROMPT',
        description: '🔥 Apply High-Priority Fixes',
        payload: 'Resolve key customer experience bugs and minor security warning validations.',
        requiresConfirmation: true
      },
      {
        id: 's4-9',
        type: 'TERMINAL_COMMAND',
        description: '🧾 Verify High-Priority Fixes',
        payload: 'npm run lint',
        requiresConfirmation: false
      },
      {
        id: 's4-10',
        type: 'AI_AGENT_PROMPT',
        description: '📋 Final Fix Report',
        payload: 'Summarize audited areas, modules resolved, and status of verification table.',
        requiresConfirmation: false
      }
    ]
  },
  {
    id: 'tpl-1',
    name: 'Latimore Brand Compliance Audit',
    category: 'Compliance',
    description: 'Scans the regional workspace folders, reads draft copy, and compares with marketing regulations.',
    createdAt: 'System Built-In',
    triggerType: 'STAGE_CHANGE',
    triggerValue: 'Stage: Follow Up',
    steps: [
      {
        id: 's1-1',
        type: 'BROWSER_NAVIGATE',
        description: 'Navigate to regional compliance regulations portal',
        payload: 'https://compliance.latimore.internal/rules/pa-underwriting',
        requiresConfirmation: false
      },
      {
        id: 's1-2',
        type: 'BROWSER_CLICK',
        description: 'Locate and accept terms dialog button',
        payload: '#agree-and-continue',
        requiresConfirmation: false
      },
      {
        id: 's1-3',
        type: 'BROWSER_TYPE',
        description: 'Type draft review payload',
        payload: 'Scan brand assets inside "documents/outbound_draft.txt" for brand voice violation',
        requiresConfirmation: true
      },
      {
        id: 's1-4',
        type: 'TERMINAL_COMMAND',
        description: 'Produce clean audit JSON parameters report',
        payload: 'npm run audit:brand -- --file=documents/outbound_draft.txt --output=docs/compliance_report.json',
        requiresConfirmation: false
      }
    ]
  },
  {
    id: 'tpl-2',
    name: 'SLA Underwriting Automated verification',
    category: 'SLA',
    description: 'Syncs dynamic inbound queue documents with PA regulations databases to check coverage compliance.',
    createdAt: 'System Built-In',
    triggerType: 'STAGE_CHANGE',
    triggerValue: 'Stage: Qualified',
    steps: [
      {
        id: 's2-1',
        type: 'TERMINAL_COMMAND',
        description: 'Clean staging records backup and clear temporary buffers',
        payload: 'supabase db pull db-staging --schema=public',
        requiresConfirmation: false
      },
      {
        id: 's2-2',
        type: 'BROWSER_NAVIGATE',
        description: 'Navigate to central policy rules depository',
        payload: 'https://sla-validation.internal/underwriting/verify-pa',
        requiresConfirmation: false
      },
      {
        id: 's2-3',
        type: 'BROWSER_TYPE',
        description: 'Input underwriting security token credentials',
        payload: 'LATIMORE-UNDERWRITING-SLA-TOKEN-2026',
        requiresConfirmation: true
      },
      {
        id: 's2-4',
        type: 'WAIT',
        description: 'Pause for rules validator calculations engine',
        payload: '4000',
        requiresConfirmation: false
      },
      {
        id: 's2-5',
        type: 'TERMINAL_COMMAND',
        description: 'Notify sales channels of verification outcome',
        payload: 'slack-bot-dispatched-message "Policies approved and SLA checks green."',
        requiresConfirmation: false
      }
    ]
  },
  {
    id: 'tpl-3',
    name: 'Lead Enrichment Stream',
    category: 'Marketing',
    description: 'Pulls prospective customer rows from Drive tables and matches metadata in public sources.',
    createdAt: 'System Built-In',
    triggerType: 'FORM_SUBMIT',
    triggerValue: 'https://latimorelifelegacy.com/api/fillout',
    steps: [
      {
        id: 's3-1',
        type: 'BROWSER_NAVIGATE',
        description: 'Load active contacts spreadsheet link',
        payload: 'https://docs.google.com/spreadsheets/d/latimore-lead-prospects-2026',
        requiresConfirmation: false
      },
      {
        id: 's3-2',
        type: 'BROWSER_CLICK',
        description: 'Click Export CSV tab element',
        payload: '#export-menu-csv-download-button',
        requiresConfirmation: false
      },
      {
        id: 's3-3',
        type: 'TERMINAL_COMMAND',
        description: 'Run Python database profile mapping helper',
        payload: 'python3 scripts/profile_enrichment.py --file=~/Downloads/prospects.csv',
        requiresConfirmation: false
      }
    ]
  }
];

export const WorkflowBuilder: React.FC = () => {
  // Workflow main metadata
  const [workflowName, setWorkflowName] = useState('My Custom Workflow');
  const [workflowCategory, setWorkflowCategory] = useState<'Compliance' | 'Marketing' | 'SLA' | 'Database' | 'Custom'>('Custom');
  const [workflowDescription, setWorkflowDescription] = useState('An automated queue of agent operations.');
  
  // Workflow trigger configuration
  const [workflowTrigger, setWorkflowTrigger] = useState<'FORM_SUBMIT' | 'CRON_SCHEDULE' | 'STAGE_CHANGE' | 'MANUAL'>('MANUAL');
  const [workflowTriggerValue, setWorkflowTriggerValue] = useState('Manual Run');
  
  // Current active workflow steps
  const [steps, setSteps] = useState<WorkflowStep[]>([
    {
      id: 'step-1',
      type: 'BROWSER_NAVIGATE',
      description: 'Navigate to Latimore client lookup dashboard',
      payload: 'https://crm.latimorelegacy.com/lookup',
      requiresConfirmation: false,
      status: 'idle'
    },
    {
      id: 'step-2',
      type: 'BROWSER_TYPE',
      description: 'Search for PA Schuylkill prospects directory',
      payload: 'Schuylkill County pre-retirees list',
      requiresConfirmation: false,
      status: 'idle'
    },
    {
      id: 'step-3',
      type: 'WAIT',
      description: 'AWait system database retrieval',
      payload: '2000',
      requiresConfirmation: false,
      status: 'idle'
    }
  ]);

  // Saved templates lists from LocalStorage
  const [savedTemplates, setSavedTemplates] = useState<WorkflowTemplate[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Simulated execution states
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentSimStepIdx, setCurrentSimStepIdx] = useState<number | null>(null);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);

  // Importer modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  // Load user saved templates on mount
  useEffect(() => {
    const saved = localStorage.getItem('latimore-user-workflows');
    if (saved) {
      try {
        setSavedTemplates(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved templates', e);
      }
    }
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const loadTemplate = (tpl: WorkflowTemplate) => {
    setWorkflowName(tpl.name);
    setWorkflowCategory(tpl.category);
    setWorkflowDescription(tpl.description);
    setWorkflowTrigger(tpl.triggerType || 'MANUAL');
    setWorkflowTriggerValue(tpl.triggerValue || 'Manual Run');
    setSteps(tpl.steps.map(step => ({ ...step, status: 'idle' })));
    triggerToast(`Loaded workflow template: ${tpl.name}`);
    
    // Reset simulation
    setIsSimulating(false);
    setCurrentSimStepIdx(null);
    setSimulationLogs([]);
  };

  const saveWorkflowAsTemplate = () => {
    if (!workflowName.trim()) {
      alert('Please define a workflow name before saving.');
      return;
    }

    const nextTemplate: WorkflowTemplate = {
      id: `saved-${Date.now()}`,
      name: workflowName,
      category: workflowCategory,
      description: workflowDescription,
      steps: steps.map(s => ({ ...s, status: 'idle' })),
      createdAt: new Date().toLocaleDateString(),
      triggerType: workflowTrigger,
      triggerValue: workflowTriggerValue
    };

    const updated = [nextTemplate, ...savedTemplates.filter(t => t.name !== workflowName)];
    setSavedTemplates(updated);
    localStorage.setItem('latimore-user-workflows', JSON.stringify(updated));
    triggerToast(`Workflow template "${workflowName}" saved successfully!`);
  };

  const deleteTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedTemplates.filter(t => t.id !== id);
    setSavedTemplates(updated);
    localStorage.setItem('latimore-user-workflows', JSON.stringify(updated));
    triggerToast('Workflow template deleted from saved cache.');
  };

  // Add a new blank step
  const addStep = () => {
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      type: 'BROWSER_NAVIGATE',
      description: 'New autonomous operation step',
      payload: '',
      requiresConfirmation: false,
      status: 'idle'
    };
    setSteps([...steps, newStep]);
  };

  const updateStepField = (id: string, field: keyof WorkflowStep, value: any) => {
    setSteps(prev => 
      prev.map(step => {
        if (step.id === id) {
          return { ...step, [field]: value };
        }
        return step;
      })
    );
  };

  const deleteStep = (id: string) => {
    setSteps(prev => prev.filter(step => step.id !== id));
  };

  // Step reordering logic (Move Up / Down)
  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === steps.length - 1) return;

    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...steps];
    // Swap
    const temp = reordered[index];
    reordered[index] = reordered[targetIdx];
    reordered[targetIdx] = temp;

    setSteps(reordered);
  };

  // Run/Execute a fully animated simulation of the created workflow
  const startSimulation = async () => {
    if (steps.length === 0) {
      alert('Please add at least one step to simulate.');
      return;
    }

    setIsSimulating(true);
    setSimulationLogs(['[ORCHESTRATOR] Initializing autonomous container instance...', `[CONTEXT] Sandbox loaded: "${workflowName}"`]);
    
    // Clear previous statuses
    const initializedSteps = steps.map(s => ({ ...s, status: 'idle' as const }));
    setSteps(initializedSteps);

    for (let i = 0; i < initializedSteps.length; i++) {
      setCurrentSimStepIdx(i);
      
      // Update step status to running
      setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'running' as const } : s));

      const activeStep = initializedSteps[i];
      setSimulationLogs(logs => [
        ...logs, 
        `[STEP ${i + 1}] Executing action ${activeStep.type} (${activeStep.description})...`
      ]);

      // If user confirmation is required, simulate authorization request
      if (activeStep.requiresConfirmation) {
        setSimulationLogs(logs => [...logs, `[PROMPT] Pending verification credentials for safety rules. Authorized!`]);
        await new Promise(res => setTimeout(res, 800));
      }

      // Simulate network request/delay based on type
      let delay = 1200;
      if (activeStep.type === 'WAIT') {
        const parsed = parseInt(activeStep.payload) || 2000;
        delay = Math.min(parsed, 3000); // Caps simulated delay to keep UI interactive
      }

      await new Promise(resolve => setTimeout(resolve, delay));

      // Check for success criteria (simulated success)
      const ranSuccessfully = Math.random() < 0.98;

      setSteps(prev => prev.map((s, idx) => {
        if (idx === i) {
          return { ...s, status: ranSuccessfully ? 'completed' as const : 'failed' as const };
        }
        return s;
      }));

      if (ranSuccessfully) {
        setSimulationLogs(logs => [
          ...logs, 
          `[OK] Step ${i + 1} completed: verified. Output parameters captured.`
        ]);
      } else {
        setSimulationLogs(logs => [
          ...logs, 
          `[ERR] Step ${i + 1} failed: Selector missing or agent exception triggered. Process halted.`
        ]);
        break; // Stop execution on failure
      }
    }

    setIsSimulating(false);
    setCurrentSimStepIdx(null);
    setSimulationLogs(logs => [...logs, '[ORCHESTRATOR] Thread shut down cleanly. Workflow state persists.']);
  };

  // Advanced Parser for both direct workflow step lists and gptcha.in graph nodes
  const handleJSONImport = () => {
    setImportError(null);
    if (!importJsonText.trim()) {
      setImportError('JSON payload text-area cannot be empty.');
      return;
    }

    try {
      const parsed = JSON.parse(importJsonText);
      let importedName = 'Imported Custom Workflow';
      let importedCategory: 'Compliance' | 'Marketing' | 'SLA' | 'Database' | 'Custom' = 'Custom';
      let importedDescription = 'Imported through custom JSON integrator parser.';
      let importedSteps: WorkflowStep[] = [];

      // Case A: Detect gptcha.in file format (contains metadata and workflow nodes)
      if (parsed.source === 'gptcha.in' || (parsed.workflow && parsed.workflow.nodes)) {
        if (parsed.metadata) {
          importedName = parsed.metadata.name || importedName;
          importedDescription = parsed.metadata.description || importedDescription;
        }
        
        const nodes = parsed.workflow.nodes;
        if (Array.isArray(nodes)) {
          nodes.forEach((node: any, idx: number) => {
            // Skip START & END nodes as they are control anchors, not logical tasks
            if (node.type === 'START' || node.type === 'END') {
              return;
            }

            const stepId = `import-${node.id || idx}-${Date.now()}`;
            const label = node.label || `Node Run ${node.id}`;
            const prompt = node.prompt || '';
            
            if (node.type === 'SLEEPY' || node.timeout) {
              importedSteps.push({
                id: stepId,
                type: 'WAIT',
                description: `Sleep delay timer (${node.timeout || 30} seconds)`,
                payload: String((node.timeout || 30) * 1000),
                requiresConfirmation: false,
                status: 'idle'
              });
            } else {
              // Map prompts and commands
              const isCommand = prompt.toLowerCase().includes('run ') || prompt.toLowerCase().includes('npm ') || prompt.toLowerCase().includes('python');
              const isVerification = label.toLowerCase().includes('verify') || label.toLowerCase().includes('check');
              
              importedSteps.push({
                id: stepId,
                type: isCommand ? 'TERMINAL_COMMAND' : 'AI_AGENT_PROMPT',
                description: label,
                payload: prompt || `Execute block task action: ${label}`,
                requiresConfirmation: isVerification || label.toLowerCase().includes('apply'),
                status: 'idle'
              });
            }
          });
        }
        
        importedCategory = 'SLA'; // Standard Category class for custom logic
      }
      // Case B: Detect our proprietary layout structure
      else if (parsed.steps && Array.isArray(parsed.steps)) {
        importedName = parsed.name || importedName;
        importedCategory = parsed.category || importedCategory;
        importedDescription = parsed.description || importedDescription;
        importedSteps = parsed.steps.map((s: any, idx: number) => ({
          id: s.id || `step-${idx}-${Date.now()}`,
          type: s.type || 'BROWSER_NAVIGATE',
          description: s.description || 'Custom loaded step',
          payload: s.payload || '',
          requiresConfirmation: !!s.requiresConfirmation,
          status: 'idle'
        }));
      }
      // Case C: Raw Array of steps
      else if (Array.isArray(parsed)) {
        importedSteps = parsed.map((s: any, idx: number) => ({
          id: s.id || `step-${idx}-${Date.now()}`,
          type: s.type || 'BROWSER_NAVIGATE',
          description: s.description || 'Custom loaded step',
          payload: s.payload || '',
          requiresConfirmation: !!s.requiresConfirmation,
          status: 'idle'
        }));
      } else {
        throw new Error('Unrecognized format. JSON structure must be a gptcha.in graph list, standard workflow layout, or steps array.');
      }

      if (importedSteps.length === 0) {
        throw new Error('Successfully parsed file but found zero executable steps.');
      }

      // Loaded successfully!
      setWorkflowName(importedName);
      setWorkflowCategory(importedCategory);
      setWorkflowDescription(importedDescription);
      setSteps(importedSteps);
      if (parsed.triggerType) {
        setWorkflowTrigger(parsed.triggerType);
        setWorkflowTriggerValue(parsed.triggerValue || '');
      } else if (parsed.source === 'gptcha.in') {
        setWorkflowTrigger('CRON_SCHEDULE');
        setWorkflowTriggerValue('0 */12 * * * (Every 12 hours)');
      } else {
        setWorkflowTrigger('MANUAL');
        setWorkflowTriggerValue('Manual Run');
      }

      triggerToast(`Successfully loaded: ${importedName} (${importedSteps.length} steps)`);
      setIsImportModalOpen(false);
      setImportJsonText('');
      setImportError(null);

    } catch (e: any) {
      setImportError(`Parsing Exception: ${e.message || e}`);
    }
  };

  const getStepIcon = (type: WorkflowStep['type']) => {
    switch (type) {
      case 'BROWSER_NAVIGATE': return <Search size={14} className="text-[#C49A6C]" />;
      case 'BROWSER_CLICK': return <MousePointer2 size={14} className="text-blue-500" />;
      case 'BROWSER_TYPE': return <Type size={14} className="text-purple-500" />;
      case 'TERMINAL_COMMAND': return <Terminal size={14} className="text-emerald-500" />;
      case 'WAIT': return <Clock size={14} className="text-amber-500" />;
      case 'AI_AGENT_PROMPT': return <Brain size={14} className="text-indigo-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-[rgba(44,62,80,0.12)] shadow-sm overflow-hidden flex flex-col gap-4 p-4 md:p-5">
      
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-[#2C3E50] text-[#E8D5B7] border border-[#C49A6C]/40 py-2 px-4 rounded-md shadow-xl text-xs font-semibold flex items-center gap-2"
          >
            <Sparkles size={13} className="text-[#C49A6C]" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* JSON Import Modal */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="bg-[#2C3E50] p-4 text-[#E8D5B7] flex justify-between items-center border-b border-[#C49A6C]/20">
                <div className="flex items-center gap-2">
                  <Upload size={16} className="text-[#C49A6C]" />
                  <span className="font-bold text-xs uppercase tracking-wider">Paste & Import gptcha.in JSON</span>
                </div>
                <button 
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setImportError(null);
                  }}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 flex flex-col gap-3">
                <span className="text-[10px] text-slate-500 leading-normal">
                  Paste the raw JSON configuration of your workflow. The integrator automatically detects whether the file follows standard list specifications or the nested <strong>gptcha.in</strong> node-edge graph structure (such as the Codebase Audit system).
                </span>

                <textarea
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder='For example: {"source": "gptcha.in", "version": "3.3.0", ...}'
                  rows={12}
                  className="w-full bg-slate-900 text-slate-100 font-mono text-[10px] p-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C49A6C] resize-none"
                  spellCheck={false}
                />

                {importError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 text-red-600 text-[10px] font-semibold rounded-md">
                    {importError}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 p-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setImportError(null);
                  }}
                  className="px-3 py-1.5 rounded text-xs font-semibold text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJSONImport}
                  className="px-4 py-1.5 rounded text-xs font-bold text-white bg-[#C49A6C] hover:bg-[#b08557] cursor-pointer transition-colors shadow-sm"
                >
                  Parse & Load Pipeline
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Title Grid */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[rgba(44,62,80,0.08)] pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#C49A6C]/10 flex items-center justify-center text-[#C49A6C]">
            <Layers size={18} />
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-[#2C3E50] uppercase tracking-wider leading-none">Autonomous Workflows Constructor</h3>
            <p className="text-[10px] text-[#6b6b6b] mt-1">Configure automated task sequences, steps selectors, wait nodes, and execution scripts</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 hover:scale-[1.02] active:scale-95 cursor-pointer shadow-sm"
          >
            <Upload size={12} /> Import JSON File
          </button>

          <button
            onClick={startSimulation}
            disabled={isSimulating}
            className={`text-[11px] font-extrabold uppercase px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
              isSimulating 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-[1.02] active:scale-95'
            }`}
          >
            <Play size={12} fill="currentColor" /> Simulated Run
          </button>

          <button
            onClick={saveWorkflowAsTemplate}
            className="text-[11px] font-bold text-white bg-[#C49A6C] hover:bg-[#b08557] px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 hover:scale-[1.02] active:scale-95 cursor-pointer shadow-sm"
          >
            <Save size={12} /> Save Template
          </button>
        </div>
      </div>

      {/* Two-Column Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        
        {/* Left Hand Sidebar: Templates Drawer & Quick Info (4 cols) */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          
          {/* Preset Standard Templates List */}
          <div className="bg-[#fcfbfa] rounded-lg border border-[rgba(44,62,80,0.1)] p-3">
            <span className="text-[10px] font-extrabold text-[#2C3E50] uppercase tracking-wider flex items-center gap-1 mb-2">
              <FolderOpen size={12} className="text-[#C49A6C]" /> Built-in Presets
            </span>
            <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
              {PRESET_TEMPLATES.map(tpl => (
                <div 
                  key={tpl.id}
                  onClick={() => loadTemplate(tpl)}
                  className="bg-white hover:bg-[#C49A6C]/5 hover:border-[#C49A6C]/50 border border-[rgba(44,62,80,0.06)] rounded-md p-2.5 cursor-pointer transition-all flex items-start gap-2 group"
                >
                  <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 text-[#2C3E50] font-bold text-[9px]">
                    {tpl.category[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-semibold text-xs text-[#2C3E50] group-hover:text-[#C49A6C] truncate">{tpl.name}</span>
                      <span className="text-[7.5px] uppercase font-bold text-slate-400">{tpl.category}</span>
                    </div>
                    <p className="text-[10px] text-[#6b6b6b] line-clamp-2 leading-normal">{tpl.description}</p>
                    {tpl.triggerType && (
                      <div className="mt-1.5 flex items-center gap-1 flex-wrap">
                        <span className="text-[7.5px] uppercase font-extrabold text-amber-600 bg-amber-50 border border-amber-100 shrink-0 px-1 py-0.5 rounded">
                          ⚡ {tpl.triggerType.replace('_', ' ')}
                        </span>
                        <span className="text-[7.5px] text-[#6b6b6b] truncate max-w-[150px]">
                          {tpl.triggerValue}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Custom Saved Templates List */}
          <div className="bg-[#fcfbfa] rounded-lg border border-[rgba(44,62,80,0.1)] p-3">
            <span className="text-[10px] font-extrabold text-[#2C3E50] uppercase tracking-wider flex items-center gap-1 mb-2">
              <Sparkles size={12} className="text-[#C49A6C]" /> My Templates ({savedTemplates.length})
            </span>
            {savedTemplates.length === 0 ? (
              <div className="text-[10px] text-slate-400 italic text-center py-4 bg-white rounded border border-dashed border-slate-200">
                No custom templates saved yet.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[180px] overflow-y-auto">
                {savedTemplates.map(tpl => (
                  <div 
                    key={tpl.id}
                    onClick={() => loadTemplate(tpl)}
                    className="bg-white hover:bg-slate-50 border border-[rgba(44,62,80,0.06)] rounded-md p-2.5 cursor-pointer transition-all flex items-center justify-between gap-1 group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-xs text-[#2C3E50] truncate">{tpl.name}</div>
                      <div className="text-[8.5px] text-slate-400">Created: {tpl.createdAt}</div>
                      {tpl.triggerType && (
                        <div className="mt-1 flex items-center gap-1">
                          <span className="text-[7.5px] uppercase font-extrabold text-amber-600 bg-amber-50 px-1 py-0.5 rounded">
                            ⚡ {tpl.triggerType.replace('_', ' ')}
                          </span>
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={(e) => deleteTemplate(tpl.id, e)}
                      className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-slate-100"
                      title="Delete saved workflow"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Core Guide help panel */}
          <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 flex items-start gap-2.5 text-[10px] leading-relaxed text-[#2C3E50]">
            <HelpCircle size={14} className="text-[#2C3E50] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase tracking-wider block mb-1">Configuration Helper</span>
              Define multi-step scripts that the autonomous robot handles in sandboxed environments. Click 
              <span className="font-semibold text-[#C49A6C]"> Simulated Run</span> to preview step-order highlights, delay processing, and sandbox logging feeds.
            </div>
          </div>
        </div>

        {/* Right Hand Constructor Layout Workspace (8 cols) */}
        <div className="xl:col-span-8 flex flex-col gap-4">
          
          {/* Metadata configurations card */}
          <div className="bg-[#fcfbfa] border border-[rgba(44,62,80,0.1)] rounded-lg p-3.5 flex flex-col gap-3">
            <span className="text-[10px] font-extrabold text-[#2C3E50] uppercase tracking-wider">Workflow Configuration Details</span>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
              {/* Name */}
              <div className="md:col-span-8 flex flex-col gap-1">
                <label className="text-[9px] font-extrabold text-[#6b6b6b] uppercase">Workflow Name</label>
                <input 
                  type="text"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  className="bg-white border border-[rgba(44,62,80,0.18)] p-2 rounded text-xs text-[#2C3E50] focus:ring-1 focus:ring-[#C49A6C] focus:outline-none"
                  placeholder="e.g. Outbound Campaign Audit"
                />
              </div>

              {/* Category selector */}
              <div className="md:col-span-4 flex flex-col gap-1">
                <label className="text-[9px] font-extrabold text-[#6b6b6b] uppercase">Process Category</label>
                <select
                  value={workflowCategory}
                  onChange={(e) => setWorkflowCategory(e.target.value as any)}
                  className="bg-white border border-[rgba(44,62,80,0.18)] p-2 rounded text-xs text-[#2C3E50] focus:ring-1 focus:ring-[#C49A6C] focus:outline-none cursor-pointer"
                >
                  <option value="Compliance">Compliance</option>
                  <option value="SLA">SLA Verification</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Database">Database backup</option>
                  <option value="Custom">Custom task</option>
                </select>
              </div>

              {/* Description */}
              <div className="md:col-span-12 flex flex-col gap-1">
                <label className="text-[9px] font-extrabold text-[#6b6b6b] uppercase">Operational Objective / Description</label>
                <textarea
                  value={workflowDescription}
                  onChange={(e) => setWorkflowDescription(e.target.value)}
                  rows={2}
                  className="bg-white border border-[rgba(44,62,80,0.18)] p-2 rounded text-xs text-[#2C3E50] focus:ring-1 focus:ring-[#C49A6C] focus:outline-none resize-none leading-relaxed"
                  placeholder="Describe the steps parameters..."
                />
              </div>

              {/* Automated Dispatch Trigger Config */}
              <div className="md:col-span-12 border-t border-slate-200 border-dashed pt-3.5 mt-1 flex flex-col gap-2.5">
                <div className="flex items-center gap-1.5 justify-between">
                  <span className="text-[10px] font-extrabold text-[#2C3E50] uppercase tracking-wider">Automated Dispatch Trigger Event</span>
                  <span className="text-[8px] bg-amber-50 text-amber-600 font-extrabold px-1.5 py-0.5 rounded border border-amber-200/80 uppercase tracking-wide">
                    {workflowTrigger === 'MANUAL' ? 'On-Demand Execution' : `Trigger Active: ${workflowTrigger.replace('_', ' ')}`}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-4 flex flex-col gap-1">
                    <label className="text-[9px] font-extrabold text-[#6b6b6b] uppercase">Trigger Type</label>
                    <select
                      value={workflowTrigger}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setWorkflowTrigger(val);
                        if (val === 'FORM_SUBMIT') {
                          setWorkflowTriggerValue('https://latimorelifelegacy.com/api/fillout');
                        } else if (val === 'CRON_SCHEDULE') {
                          setWorkflowTriggerValue('0 0 * * *');
                        } else if (val === 'STAGE_CHANGE') {
                          setWorkflowTriggerValue('Stage: Qualified');
                        } else {
                          setWorkflowTriggerValue('Manual Run');
                        }
                      }}
                      className="bg-white border border-[rgba(44,62,80,0.18)] p-2 rounded text-xs text-[#2C3E50] focus:ring-1 focus:ring-[#C49A6C] focus:outline-none cursor-pointer"
                    >
                      <option value="MANUAL">Manual Launch</option>
                      <option value="FORM_SUBMIT">webhook Form Submission</option>
                      <option value="CRON_SCHEDULE">Scheduled Clock (Cron)</option>
                      <option value="STAGE_CHANGE">CRM Stage Changed</option>
                    </select>
                  </div>

                  <div className="md:col-span-8 flex flex-col gap-1">
                    <label className="text-[9px] font-extrabold text-[#6b6b6b] uppercase">
                      {workflowTrigger === 'FORM_SUBMIT' && 'Webhook Endpoint URL'}
                      {workflowTrigger === 'CRON_SCHEDULE' && 'Cron Pattern Description'}
                      {workflowTrigger === 'STAGE_CHANGE' && 'Inquiry pipeline Trigger stage'}
                      {workflowTrigger === 'MANUAL' && 'Manual launch context'}
                    </label>
                    
                    {workflowTrigger === 'STAGE_CHANGE' ? (
                      <select
                        value={workflowTriggerValue}
                        onChange={(e) => setWorkflowTriggerValue(e.target.value)}
                        className="bg-white border border-[rgba(44,62,80,0.18)] p-2 rounded text-xs text-[#2C3E50] focus:ring-1 focus:ring-[#C49A6C] focus:outline-none cursor-pointer"
                      >
                        <option value="Stage: New">Stage: New Lead</option>
                        <option value="Stage: Attempted Contact">Stage: Attempted Contact</option>
                        <option value="Stage: Qualified">Stage: Qualified</option>
                        <option value="Stage: Booked">Stage: Booked</option>
                        <option value="Stage: Sold">Stage: Sold / Active policy</option>
                        <option value="Stage: Follow Up">Stage: Follow Up</option>
                        <option value="Stage: Lost">Stage: Lost Prospect</option>
                      </select>
                    ) : (
                      <input 
                        type="text"
                        value={workflowTriggerValue}
                        onChange={(e) => setWorkflowTriggerValue(e.target.value)}
                        className="bg-white border border-[rgba(44,62,80,0.18)] p-2 rounded text-xs text-[#2C3E50] focus:ring-1 focus:ring-[#C49A6C] focus:outline-none font-mono"
                        placeholder={
                          workflowTrigger === 'FORM_SUBMIT' ? 'e.g. https://latimorelifelegacy.com/api/fillout' :
                          workflowTrigger === 'CRON_SCHEDULE' ? 'e.g. 0 0 * * *' : 'Manual Run'
                        }
                      />
                    )}
                  </div>
                </div>

                <p className="text-[9.5px] text-slate-500 italic mt-0.5 leading-normal">
                  {workflowTrigger === 'FORM_SUBMIT' && '🚀 Integrated Fillout webhook matches signature keys and dispatches this workflow series instantly on inbound inquiries.'}
                  {workflowTrigger === 'CRON_SCHEDULE' && '⏰ Clock triggers this pipeline on a background loop runner container, tracking execution in the database audit logs.'}
                  {workflowTrigger === 'STAGE_CHANGE' && '🔄 Changing a contact to this stage in the kanban board will automatically fire this automated run.'}
                  {workflowTrigger === 'MANUAL' && '⚡ Manual triggers require authenticated admins to click the Run button to initiate operations in local testing.'}
                </p>
              </div>
            </div>
          </div>

          {/* Dynamic Interactive Step Builders Accordion/Queue */}
          <div className="bg-white border border-[rgba(44,62,80,0.1)] rounded-lg p-3.5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-[#2C3E50] uppercase tracking-wider flex items-center gap-1">
                <Sliders size={12} className="text-[#C49A6C]" /> Steps Layout Queue ({steps.length})
              </span>
              <button 
                onClick={addStep}
                className="text-[10px] font-bold text-white bg-[#2C3E50] hover:bg-[#3d566e] px-2.5 py-1.5 rounded transition-all flex items-center gap-1 cursor-pointer "
              >
                <Plus size={11} /> Add step
              </button>
            </div>

            {steps.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50 flex flex-col items-center justify-center p-6">
                <span className="text-xs text-slate-400 font-medium mb-2">No steps currently defined in this workflow.</span>
                <button 
                  onClick={addStep}
                  className="text-[10px] font-bold text-white bg-[#C49A6C] px-3 py-1.5 rounded"
                >
                  Create First step
                </button>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                <AnimatePresence initial={false}>
                  {steps.map((step, idx) => {
                    const isSimulatingThisNode = idx === currentSimStepIdx;
                    return (
                      <motion.div 
                        key={step.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`border rounded-lg p-3 bg-white transition-all flex flex-col gap-2.5 relative overflow-hidden ${
                          isSimulatingThisNode 
                            ? 'ring-2 ring-emerald-500 border-transparent shadow-md font-sans' 
                            : step.status === 'completed' 
                            ? 'border-emerald-200 bg-emerald-50/10'
                            : step.status === 'failed'
                            ? 'border-red-200 bg-red-50/10'
                            : step.type === 'AI_AGENT_PROMPT'
                            ? 'border-indigo-100 bg-slate-50/40 hover:border-indigo-200'
                            : 'border-[rgba(44,62,80,0.12)] hover:border-slate-300'
                        }`}
                      >
                        {/* Simulation Indicator Tag */}
                        {isSimulatingThisNode && (
                          <div className="absolute top-0 left-0 bg-emerald-500 text-white text-[8px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-br-md animate-pulse">
                            ACTIVE NODE RUNNING
                          </div>
                        )}

                        <div className="flex md:items-center justify-between gap-2.5 mt-1">
                          
                          {/* Step Number Badge and Selector type */}
                          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                            <span className="w-5 h-5 rounded-full bg-slate-150 font-mono text-[10px] text-slate-700 flex items-center justify-center font-bold">
                              {idx + 1}
                            </span>
                            
                            <select
                              value={step.type}
                              onChange={(e) => updateStepField(step.id, 'type', e.target.value as any)}
                              className="bg-[#fcfbfa] border border-[rgba(44,62,80,0.08)] p-1.5 rounded font-bold text-[9px] text-[#2C3E50] cursor-pointer"
                            >
                              <option value="BROWSER_NAVIGATE">🌐 Navigate URL</option>
                              <option value="BROWSER_CLICK">🖱️ click Element</option>
                              <option value="BROWSER_TYPE">✉️ Key-In Type</option>
                              <option value="TERMINAL_COMMAND">💻 Command Script</option>
                              <option value="WAIT">⏳ Wait Delay</option>
                              <option value="AI_AGENT_PROMPT">🧠 AI Prompt Instruction</option>
                            </select>
                          </div>

                          {/* Order Actions & Delete Menu */}
                          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded border border-slate-100/50">
                            <button
                              onClick={() => moveStep(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 text-slate-500 hover:text-[#2C3E50] disabled:opacity-30 rounded hover:bg-slate-200/60"
                              title="Move step up"
                            >
                              <ArrowUp size={11} />
                            </button>
                            <button
                              onClick={() => moveStep(idx, 'down')}
                              disabled={idx === steps.length - 1}
                              className="p-1 text-slate-500 hover:text-[#2C3E50] disabled:opacity-30 rounded hover:bg-slate-200/60"
                              title="Move step down"
                            >
                              <ArrowDown size={11} />
                            </button>
                            <div className="w-[1px] h-3 bg-slate-200 mx-1" />
                            <button
                              onClick={() => deleteStep(step.id)}
                              className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-slate-200/60"
                              title="Delete Step"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>

                        {/* Input configurations row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1 text-[11px]">
                          {/* description */}
                          <div className="flex flex-col gap-1">
                            <span className="text-[8.5px] font-extrabold text-[#6b6b6b] uppercase">Step Objective / Label</span>
                            <input 
                              type="text"
                              value={step.description}
                              onChange={(e) => updateStepField(step.id, 'description', e.target.value)}
                              className="bg-white border border-[rgba(44,62,80,0.14)] p-1.5 px-2 rounded font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#C49A6C]"
                              placeholder="e.g. Scrapes website header stats..."
                            />
                          </div>

                          {/* Parameter payload input */}
                          <div className="flex flex-col gap-1">
                            <span className="text-[8.5px] font-extrabold text-[#6b6b6b] uppercase">
                              {step.type === 'WAIT' ? 'Duration (milliseconds)' : 'Parameter / payload value'}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="shrink-0 p-1 rounded bg-slate-50 text-slate-400">
                                {getStepIcon(step.type)}
                              </span>
                              <input 
                                type="text"
                                value={step.payload}
                                onChange={(e) => updateStepField(step.id, 'payload', e.target.value)}
                                className="bg-white flex-1 border border-[rgba(44,62,80,0.14)] p-1.5 px-2 rounded font-mono text-[10.5px] text-[#2C3E50] focus:outline-none focus:ring-1 focus:ring-[#C49A6C]"
                                placeholder={
                                  step.type === 'WAIT' ? 'e.g. 2000' :
                                  step.type === 'BROWSER_NAVIGATE' ? 'e.g. https://google.com' :
                                  step.type === 'BROWSER_CLICK' ? 'CSS Selector (e.g. #submit-btn)' :
                                  step.type === 'TERMINAL_COMMAND' ? 'e.g. npm audit' :
                                  step.type === 'AI_AGENT_PROMPT' ? 'Enter AI prompt context pattern...' : 'Plain Text to type'
                                }
                              />
                            </div>
                          </div>
                        </div>

                        {/* Safety Toggle checklist */}
                        <div className="flex items-center justify-between border-t border-[rgba(44,62,80,0.03)] pt-1.5 mt-1">
                          <label className="flex items-center gap-1.5 cursor-pointer select-none text-[#6b6b6b] text-[9.5px]">
                            <input 
                              type="checkbox"
                              checked={step.requiresConfirmation}
                              onChange={(e) => updateStepField(step.id, 'requiresConfirmation', e.target.checked)}
                              className="rounded text-[#C49A6C] focus:ring-[#C49A6C]"
                            />
                            PAUSE ORCHESTRATION & REQUEST USER AUTHORIZATION BEFORE RUNNING THIS NODE
                          </label>

                          {/* Node Completed/Failed tag status */}
                          <div className="text-[9.5px] font-extrabold uppercase shrink-0 font-mono">
                            {step.status === 'completed' && <span className="text-emerald-500">Node Green</span>}
                            {step.status === 'failed' && <span className="text-red-500">Node failed</span>}
                            {step.status === 'running' && <span className="text-emerald-500 animate-pulse">Running...</span>}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Simulated Logging execution feedback console */}
          {simulationLogs.length > 0 && (
            <div className="bg-[#111622] rounded-lg border border-slate-800 p-3.5 flex flex-col font-mono text-[9.5px] leading-relaxed relative overflow-hidden">
              <div className="border-b border-slate-800/80 pb-2 mb-2 flex items-center justify-between text-[8px] text-slate-500 font-bold">
                <span>SIMULATOR CONSOLE AUDIT TRAIL</span>
                <span className="text-emerald-500 animate-pulse">● FEED ACTIVE</span>
              </div>
              <div className="space-y-2 max-h-[165px] overflow-y-auto custom-scrollbar text-slate-300">
                {simulationLogs.map((log, index) => {
                  const isErr = log.startsWith('[ERR]');
                  const isOk = log.startsWith('[OK]') || log.startsWith('[STEP');
                  const isPrompt = log.startsWith('[PROMPT');

                  return (
                    <div key={index} className="flex gap-2">
                      <span className="text-slate-600 select-none">[{index + 1}]</span>
                      <div className={`flex-1 break-all ${
                        isErr ? 'text-red-400 font-medium' :
                        isPrompt ? 'text-amber-400' :
                        isOk ? 'text-emerald-400' : 'text-slate-300'
                      }`}>
                        {log}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
