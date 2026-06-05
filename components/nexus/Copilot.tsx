'use client'


import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, X, MessageSquare, Loader2, User, Bot, ChevronUp, Maximize2, Minimize2, Activity, Zap } from 'lucide-react';
import { Message } from './types';
import { chatWithCopilot } from './nexusService';

interface CopilotProps {
  fileSystem: any;
  onFileRead: (path: string) => string;
  onFileWrite: (path: string, content: string, type?: 'file' | 'dir') => void;
}

interface WorkflowStep {
  name: string;
  type: string;
  payload: any;
  status: 'pending' | 'executing' | 'success' | 'failed';
  duration?: number;
}

interface WorkflowState {
  title: string;
  steps: WorkflowStep[];
  currentStepIndex: number;
  overallProgress: number;
  status: 'idle' | 'executing' | 'completed' | 'failed';
}

export const Copilot: React.FC<CopilotProps> = ({ fileSystem, onFileRead, onFileWrite }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'agent',
      content: 'Hello! I am your Latimore Hub Copilot. How can I help you manage your legacy today?',
      timestamp: Date.now()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [workflow, setWorkflow] = useState<WorkflowState | null>(null);
  const [showWorkflowDetails, setShowWorkflowDetails] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  const getActionDisplayName = (act: any): string => {
    if (!act) return 'Unknown operation';
    const type = act.type || 'EXECUTE';
    if (type === 'FILE_READ') {
      return `Read file "${act.payload}"`;
    }
    if (type === 'FILE_WRITE') {
      const p = typeof act.payload === 'object' ? (act.payload.path || 'file') : act.payload;
      return `Write file "${p}"`;
    }
    if (type === 'FILE_CREATE') {
      const p = typeof act.payload === 'object' ? (act.payload.path || 'item') : act.payload;
      const t = typeof act.payload === 'object' ? (act.payload.type || 'file') : 'item';
      return `Create ${t} "${p}"`;
    }
    return `${type} execution`;
  };

  const handleAction = async (action: any, currentMessages: Message[]): Promise<Message | null> => {
    try {
      if (action.type === 'FILE_READ') {
        const content = onFileRead(action.payload);
        // Automatically follow up with the content
        const observationMessage = `File content of "${action.payload}":\n\n${content}`;
        return await chatWithCopilot(observationMessage, currentMessages, fileSystem);
      } else if (action.type === 'FILE_WRITE') {
        const { path, content } = action.payload;
        onFileWrite(path, content);
        return {
          id: Date.now().toString(),
          role: 'agent',
          content: `Successfully wrote to ${path}`,
          timestamp: Date.now()
        };
      } else if (action.type === 'FILE_CREATE') {
        const { path, type } = action.payload;
        onFileWrite(path, '', type);
        return {
          id: Date.now().toString(),
          role: 'agent',
          content: `Successfully created ${type} at ${path}`,
          timestamp: Date.now()
        };
      }
    } catch (error: any) {
      return {
        id: Date.now().toString(),
        role: 'agent',
        content: `Error performing ${action.type}: ${error.message}`,
        timestamp: Date.now(),
        isError: true
      };
    }
    return null;
  };

  const triggerDemoWorkflow = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setInput('');

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: "Ensure compliance of active documents.",
      timestamp: Date.now()
    };
    
    const updatedMsgs = [...messages, userMessage];
    setMessages(updatedMsgs);

    const demoActions = [
      { type: 'FILE_READ', payload: 'readme.md' },
      { type: 'FILE_CREATE', payload: { path: 'docs/compliance_scan.json', type: 'file' } },
      { type: 'FILE_WRITE', payload: { path: 'docs/compliance_scan.json', content: '{\n  "status": "COMPLIANT",\n  "system": "Hub OS",\n  "auditDate": "2026-05-22",\n  "trustee": "Jackson Latimore Sr."\n}' } },
      { type: 'FILE_WRITE', payload: { path: 'readme.md', content: '# Latimore Hub OS\nStrategic revenue engine powered by Claude.\n\n- [x] Autumn compliance audit finished successfully (2026-05-22)' } }
    ];

    const initialSteps = demoActions.map((act) => ({
      name: getActionDisplayName(act),
      type: act.type,
      payload: act.payload,
      status: 'pending' as const
    }));

    setWorkflow({
      title: "Compliance & System Check",
      steps: initialSteps,
      currentStepIndex: 0,
      overallProgress: 0,
      status: 'executing'
    });
    setShowWorkflowDetails(true);

    try {
      let currentMsgs = [...updatedMsgs];

      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: "Understood. Initiating compliance audit pattern. I will read 'readme.md', initialize a structured file report at 'docs/compliance_scan.json', and confirm back on the root systems logs.",
        timestamp: Date.now()
      };
      currentMsgs = [...currentMsgs, agentMsg];
      setMessages(currentMsgs);

      await new Promise(resolve => setTimeout(resolve, 1000));

      for (let i = 0; i < demoActions.length; i++) {
        const action = demoActions[i];
        
        setWorkflow(prev => {
          if (!prev) return null;
          const stepsCopy = [...prev.steps];
          stepsCopy[i] = { ...stepsCopy[i], status: 'executing' };
          return {
            ...prev,
            steps: stepsCopy,
            currentStepIndex: i,
            overallProgress: Math.round((i / demoActions.length) * 105 / 1.1)
          };
        });

        const stepDelay = 1300;
        await new Promise(resolve => setTimeout(resolve, stepDelay));

        const actionResult = await handleAction(action, currentMsgs);
        if (actionResult) {
          currentMsgs = [...currentMsgs, actionResult];
          setMessages(currentMsgs);
        }

        setWorkflow(prev => {
          if (!prev) return null;
          const stepsCopy = [...prev.steps];
          stepsCopy[i] = { ...stepsCopy[i], status: 'success', duration: stepDelay };
          return {
            ...prev,
            steps: stepsCopy,
            overallProgress: Math.round(((i + 1) / demoActions.length) * 100)
          };
        });
      }

      setWorkflow(prev => prev ? { ...prev, status: 'completed', overallProgress: 100 } : null);

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'agent',
        content: "Autonomous system checks and audits completed successfully! Logs generated at compliance_scan.json and updated the local readme.md. #TheBeatGoesOn",
        timestamp: Date.now()
      }]);

    } catch (err: any) {
      setWorkflow(prev => prev ? { ...prev, status: 'failed' } : null);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'agent',
        content: `Error performing autonomous run: ${err.message}`,
        timestamp: Date.now(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setWorkflow(null);

    try {
      let response = await chatWithCopilot(input, messages, fileSystem);
      let updatedMessages = [...newMessages, { ...response, id: (Date.now() + 1).toString() }];
      setMessages(updatedMessages);

      // Handle actions sequentially to track progress
      if (response.actions && response.actions.length > 0) {
        const total = response.actions.length;
        const initialSteps = response.actions.map((act: any) => ({
          name: getActionDisplayName(act),
          type: act.type,
          payload: act.payload,
          status: 'pending' as const
        }));

        setWorkflow({
          title: `Action: ${input.slice(0, 20)}...`,
          steps: initialSteps,
          currentStepIndex: 0,
          overallProgress: 0,
          status: 'executing'
        });
        setShowWorkflowDetails(true);

        for (let i = 0; i < total; i++) {
          const action = response.actions[i];
          
          setWorkflow(prev => {
            if (!prev) return null;
            const stepsCopy = [...prev.steps];
            stepsCopy[i] = { ...stepsCopy[i], status: 'executing' };
            return {
              ...prev,
              steps: stepsCopy,
              currentStepIndex: i,
              overallProgress: Math.round((i / total) * 100)
            };
          });

          // Standard brief operational delay
          const stepDelay = 1200;
          await new Promise(resolve => setTimeout(resolve, stepDelay));

          const actionResult = await handleAction(action, updatedMessages);
          if (actionResult) {
            updatedMessages = [...updatedMessages, actionResult];
            setMessages(updatedMessages);
          }

          setWorkflow(prev => {
            if (!prev) return null;
            const stepsCopy = [...prev.steps];
            stepsCopy[i] = { ...stepsCopy[i], status: 'success', duration: stepDelay };
            return {
              ...prev,
              steps: stepsCopy,
              overallProgress: Math.round(((i + 1) / total) * 100)
            };
          });
        }

        setWorkflow(prev => prev ? { ...prev, status: 'completed', overallProgress: 100 } : null);
      }
    } catch (error: any) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'agent',
        content: `Error: ${error.message}. Please check your API configuration.`,
        timestamp: Date.now(),
        isError: true
      }]);
      setWorkflow(prev => prev ? { ...prev, status: 'failed' } : null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? 'auto' : '500px'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[380px] bg-white rounded-2xl shadow-2xl border border-[rgba(44,62,80,0.12)] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-[#2C3E50] p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#C49A6C] rounded-lg flex items-center justify-center">
                  <Sparkles size={16} className="text-[#2C3E50]" />
                </div>
                <div>
                  <h3 className="text-white text-sm font-bold leading-none">Hub Copilot</h3>
                  <p className="text-[#C49A6C] text-[10px] mt-1 font-medium italic">#TheBeatGoesOn</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Progress Tracking Panel */}
                {workflow && (
                  <div className="bg-[#f9f8f6] border-b border-[rgba(44,62,80,0.12)] p-3 space-y-2 shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[#2C3E50] font-bold text-[10.5px] uppercase tracking-wider">
                        <Activity size={11} className={workflow.status === 'executing' ? 'animate-pulse text-[#C49A6C]' : 'text-emerald-600'} />
                        <span className="truncate max-w-[200px]">{workflow.title}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button 
                          onClick={() => setShowWorkflowDetails(!showWorkflowDetails)}
                          className="text-[8.5px] font-bold text-[#6b6b6b] hover:text-[#2C3E50] underline cursor-pointer"
                        >
                          {showWorkflowDetails ? 'Hide Logs' : 'Show Logs'}
                        </button>
                        <button 
                          onClick={() => setWorkflow(null)}
                          className="text-[8.5px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>

                    {/* Progress Percentage & Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[8.5px] font-bold text-[#6b6b6b] leading-none">
                        <span>Overall Progress</span>
                        <span className="text-[#C49A6C]">{workflow.overallProgress}%</span>
                      </div>
                      <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#C49A6C] transition-all duration-300 rounded-full"
                          style={{ width: `${workflow.overallProgress}%` }}
                        />
                      </div>
                    </div>

                    {/* Current Step */}
                    {workflow.status === 'executing' && workflow.steps[workflow.currentStepIndex] && (
                      <div className="bg-white/90 p-1.5 px-2 rounded border border-[rgba(44,62,80,0.06)] flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[9.5px] truncate">
                          <Loader2 size={10} className="animate-spin text-[#C49A6C] shrink-0" />
                          <span className="text-[8px] font-mono text-slate-400">EXECUTING STEP {workflow.currentStepIndex + 1}:</span>
                          <span className="font-semibold text-slate-700 truncate">{workflow.steps[workflow.currentStepIndex].name}</span>
                        </div>
                      </div>
                    )}

                    {/* History of Completed steps logs */}
                    {showWorkflowDetails && (
                      <div className="text-[9px] max-h-[75px] overflow-y-auto space-y-1 bg-white/65 p-1.5 rounded border border-[rgba(44,62,80,0.04)] scrollbar-none">
                        <p className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Workflow Step Logs</p>
                        {workflow.steps.map((step, idx) => {
                          const isDone = step.status === 'success';
                          const isCurrent = step.status === 'executing';
                          return (
                            <div key={idx} className="flex items-center justify-between gap-2 text-[9px] leading-tight">
                              <div className="flex items-center gap-1 truncate">
                                <span className={`w-1 h-1 rounded-full shrink-0 ${isDone ? 'bg-emerald-500' : isCurrent ? 'bg-[#C49A6C] animate-pulse' : 'bg-slate-300'}`} />
                                <span className={`truncate ${isDone ? 'text-slate-400 line-through' : isCurrent ? 'text-[#2C3E50] font-bold' : 'text-slate-500'}`}>
                                  {step.name}
                                </span>
                              </div>
                              <span className="text-[7.5px] font-mono text-slate-400 shrink-0">
                                {isDone && step.duration ? `${(step.duration / 1000).toFixed(1)}s` : step.status}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#fdfcfa] scrollbar-thin scrollbar-thumb-[rgba(44,62,80,0.1)]">
                  {messages.map((m) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, x: m.role === 'user' ? 10 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-2 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                          m.role === 'user' ? 'bg-[#2C3E50]' : 'bg-[#C49A6C]'
                        }`}>
                          {m.role === 'user' ? <User size={12} className="text-white" /> : <Bot size={12} className="text-[#2C3E50]" />}
                        </div>
                        <div className={`p-3 rounded-2xl text-[12px] leading-relaxed ${
                          m.role === 'user' 
                            ? 'bg-[#2C3E50] text-white rounded-tr-none shadow-sm' 
                            : m.isError 
                              ? 'bg-red-50 text-red-600 border border-red-100 rounded-tl-none'
                              : 'bg-white text-[#1a1a1a] border border-[rgba(44,62,80,0.12)] rounded-tl-none shadow-sm'
                        }`}>
                          {m.content}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#C49A6C] flex items-center justify-center shrink-0 animate-pulse">
                          <Bot size={12} className="text-[#2C3E50]" />
                        </div>
                        <div className="bg-white border border-[rgba(44,62,80,0.12)] p-2 rounded-xl rounded-tl-none flex items-center gap-2">
                          <Loader2 size={14} className="animate-spin text-[#C49A6C]" />
                          <span className="text-[10px] text-[#6b6b6b] font-medium font-mono uppercase tracking-widest">Processing...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t border-[rgba(44,62,80,0.12)]">
                  <div className="relative">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Ask the Copilot anything..."
                      className="w-full bg-[#f9f8f6] border border-[rgba(44,62,80,0.12)] rounded-xl py-3 px-4 pr-12 text-[12px] outline-none focus:border-[#C49A6C] focus:ring-1 focus:ring-[#C49A6C]/20 transition-all resize-none h-13"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className="absolute right-2.5 bottom-2.5 w-8 h-8 bg-[#2C3E50] text-white rounded-lg flex items-center justify-center hover:bg-[#3d5166] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3 text-[9px] text-[#9a9a9a] font-medium uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <span>Marketing</span>
                      <span className="w-1 h-1 rounded-full bg-[#C49A6C]" />
                      <span>Legal</span>
                      <span className="w-1 h-1 rounded-full bg-[#C49A6C]" />
                      <span>Strategy</span>
                    </div>
                    <button
                      onClick={triggerDemoWorkflow}
                      disabled={isLoading}
                      className="text-[#C49A6C] hover:text-[#2C3E50] font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#C49A6C]/10 hover:bg-[#c49a6c]/20 transition-all flex items-center gap-1 hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                    >
                      <Zap size={9} /> Run Auto Logic
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all ${
          isOpen ? 'bg-[#2C3E50] text-[#C49A6C]' : 'bg-[#C49A6C] text-[#2C3E50]'
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-[#2C3E50] rounded-full border-2 border-white flex items-center justify-center"
          >
            <Sparkles size={10} className="text-[#C49A6C]" />
          </motion.div>
        )}
      </motion.button>
    </div>
  );
};
