import React, { useState, useEffect, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { AgentWorkflow } from '../components/AgentWorkflow';
import { ChatInterface } from '../components/ChatInterface';
import { useWebSocket } from '../hooks/useWebSocket';
import { AgentStep, AgentResponse } from '../types/agent';
import { useToast } from '../hooks/use-toast';

export default function Chat() {
  const [sessionId] = useState(() => nanoid());
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [activeAgents, setActiveAgents] = useState<Set<string>>(new Set());
  const [response, setResponse] = useState<AgentResponse | null>(null);
  const [showChatHistory, setShowChatHistory] = useState(true);
  const { toast } = useToast();

  const handleAgentStep = useCallback((step: AgentStep) => {
    setSteps(prev => {
      const newSteps = [...prev];
      const existingIndex = newSteps.findIndex(s => s.stepIndex === step.stepIndex);
      
      if (existingIndex >= 0) {
        newSteps[existingIndex] = step;
      } else {
        newSteps.push(step);
      }
      
      return newSteps;
    });

    // Update active agents
    setActiveAgents(prev => {
      const newActiveAgents = new Set(prev);
      
      if (step.status === 'processing') {
        newActiveAgents.add(step.agent);
      } else if (step.status === 'complete') {
        newActiveAgents.delete(step.agent);
      }
      
      return newActiveAgents;
    });
  }, []);

  const handleResponse = useCallback((agentResponse: AgentResponse) => {
    setResponse(agentResponse);
    setActiveAgents(new Set()); // Clear all active agents
  }, []);

  const handleError = useCallback((error: string) => {
    toast({
      title: "Error",
      description: error,
      variant: "destructive"
    });
    setActiveAgents(new Set()); // Clear all active agents on error
  }, [toast]);

  const { isConnected, isProcessing, sendQuery } = useWebSocket({
    onAgentStep: handleAgentStep,
    onResponse: handleResponse,
    onError: handleError
  });

  const handleSendMessage = useCallback((message: string) => {
    if (!isConnected) {
      toast({
        title: "Connection Error",
        description: "Not connected to server. Please refresh the page.",
        variant: "destructive"
      });
      return;
    }

    // Reset state for new query
    setSteps([]);
    setActiveAgents(new Set());
    setResponse(null);
    
    sendQuery(message, sessionId);
  }, [isConnected, sendQuery, sessionId, toast]);

  useEffect(() => {
    if (!isConnected) {
      toast({
        title: "Connection Status",
        description: "Connecting to AI system...",
      });
    }
  }, [isConnected, toast]);

  return (
    <div className="flex h-screen bg-slate-50">
      <AgentWorkflow steps={steps} activeAgents={activeAgents} />
      <ChatInterface 
        onSendMessage={handleSendMessage}
        isProcessing={isProcessing}
        response={response}
        sessionId={sessionId}
        steps={steps}
        showChatHistory={showChatHistory}
        onToggleChatHistory={() => setShowChatHistory(!showChatHistory)}
      />
    </div>
  );
}
