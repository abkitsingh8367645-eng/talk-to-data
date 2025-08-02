export interface AgentStep {
  agent: string;
  action: string;
  delay: number;
  status: 'processing' | 'complete' | 'waiting';
  stepIndex?: number;
}

export interface AgentResponse {
  sqlQuery?: string;
  data?: any[];
  chartData?: any;
  insights?: string[];
  recommendations?: string[];
  response?: string;
  type?: 'descriptive' | 'diagnostic' | 'prescriptive';
  sessionId?: string;
}

export interface ChatMessage {
  id: number;
  sessionId: string;
  message: string;
  isUser: boolean;
  timestamp: Date;
  agentType?: string;
  sqlQuery?: string;
  chartData?: string;
}

export interface ChatSession {
  id: number;
  sessionId: string;
  createdAt: Date;
  isActive: boolean;
}

export interface WebSocketMessage {
  type: 'query' | 'agent_step' | 'response' | 'error';
  data: any;
  sessionId?: string;
}
