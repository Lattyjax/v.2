
export enum AgentStatus {
  IDLE = 'idle',
  THINKING = 'thinking',
  PLANNING = 'planning',
  EXECUTING = 'executing',
  WAITING_FOR_USER = 'waiting',
  COMPLETED = 'completed',
  ERROR = 'error'
}

export type ActionType = 
  | 'BROWSER_NAVIGATE' 
  | 'BROWSER_CLICK' 
  | 'BROWSER_TYPE' 
  | 'TERMINAL_COMMAND' 
  | 'FILE_NAVIGATE'
  | 'FILE_READ'
  | 'FILE_WRITE'
  | 'FILE_EDIT' 
  | 'SLACK_MESSAGE' 
  | 'GITHUB_PR' 
  | 'ZAPIER_TRIGGER'
  | 'SCRAPE_CONTENT'
  | 'SUMMARIZE_PAGE';

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface BrowserElement {
  type: 'text' | 'button' | 'input' | 'heading' | 'link' | 'image';
  content?: string;
  label?: string;
  placeholder?: string;
}

export interface BrowserPage {
  url: string;
  title: string;
  elements: BrowserElement[];
}

export interface FileEntry {
  name: string;
  type: 'file' | 'folder';
  size?: string;
  lastModified?: string;
  content?: string;
  children?: FileEntry[];
}

export interface AgentAction {
  id: string;
  type: ActionType;
  description: string;
  payload: any;
  status: 'pending' | 'active' | 'success' | 'failed';
  timestamp: number;
}

export interface AgentStep {
  id: string;
  thought: string;
  action: AgentAction;
  requiresConfirmation?: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp: number;
  thought?: string;
  actions?: any[];
  steps?: AgentStep[];
  isThinking?: boolean;
  isAutonomous?: boolean;
  isError?: boolean;
  groundingSources?: GroundingChunk[];
}

export type ViewType = 'browser' | 'terminal' | 'filesystem';
