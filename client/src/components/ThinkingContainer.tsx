import React, { useEffect, useRef } from 'react';
import { AgentStep } from '../types/agent';

interface ThinkingContainerProps {
  steps: AgentStep[];
}

// Tool icons mapping
const getToolIcon = (action: string) => {
  if (action.includes('sql_query_execution_tool')) return 'fas fa-database';
  if (action.includes('data_saving_tool')) return 'fas fa-save';
  if (action.includes('python_interpreter_tool')) return 'fab fa-python';
  return 'fas fa-cog';
};

export function ThinkingContainer({ steps }: ThinkingContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new steps are added
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [steps]);
  
  if (steps.length === 0) return null;
  
  const getAgentColor = (agent: string) => {
    const colors = {
      'orchestrator': 'text-blue-600',
      'descriptive': 'text-green-600',
      'diagnostic': 'text-purple-600',
      'prescriptive': 'text-amber-600',
      'response': 'text-indigo-600'
    };
    return colors[agent as keyof typeof colors] || 'text-blue-600';
  };

  const getAgentBadgeColor = (agent: string) => {
    const colors = {
      'orchestrator': 'bg-blue-500',
      'descriptive': 'bg-green-500',
      'diagnostic': 'bg-purple-500',
      'prescriptive': 'bg-amber-500',
      'response': 'bg-indigo-500'
    };
    return colors[agent as keyof typeof colors] || 'bg-blue-500';
  };

  return (
    <div ref={containerRef} className="space-y-3 max-h-96 overflow-y-auto">
      {steps.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <i className="fas fa-brain text-2xl mb-2"></i>
          <p>Waiting for agent workflow to begin...</p>
        </div>
      ) : (
        <div className="space-y-2 text-sm">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start space-x-3 opacity-0 animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className={`w-3 h-3 ${getAgentBadgeColor(step.agent)} rounded-full mt-1 flex-shrink-0`}></div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className={`font-medium ${getAgentColor(step.agent)} capitalize`}>
                    {step.agent === 'orchestrator' ? 'Orchestrator Agent' :
                     step.agent === 'descriptive' ? 'Descriptive Agent' :
                     step.agent === 'diagnostic' ? 'Diagnostic Agent' :
                     step.agent === 'prescriptive' ? 'Prescriptive Agent' :
                     step.agent === 'response' ? 'Response Agent' : step.agent}
                  </span>
                  {step.status === 'processing' && (
                    <i className="fas fa-spinner fa-spin text-slate-400"></i>
                  )}
                  {step.status === 'complete' && (
                    <i className="fas fa-check text-green-500"></i>
                  )}
                </div>
                <p className="text-slate-600 mt-1">{step.action}</p>
                {/* Show tool icon and name if action contains tool usage */}
                {step.action.includes('using Tool') && (
                  <div className="mt-1 flex items-center space-x-1 text-xs text-blue-600">
                    <i className={getToolIcon(step.action)}></i>
                    <span>{step.action.match(/using Tool ([a-zA-Z_-]+)/)?.[1] || 'Tool'}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
