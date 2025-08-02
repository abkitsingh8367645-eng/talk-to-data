import React from 'react';
import { AgentStep } from '../types/agent';

interface AgentWorkflowProps {
  steps: AgentStep[];
  activeAgents: Set<string>;
}

export function AgentWorkflow({ steps, activeAgents }: AgentWorkflowProps) {
  const agents = [
    {
      id: 'orchestrator',
      name: 'Orchestrator Agent',
      description: 'Routes queries to appropriate analytics workflows',
      icon: 'fas fa-brain'
    },
    {
      id: 'descriptive',
      name: 'Descriptive Agent',
      description: 'Generates & executes SQL queries with error handling',
      icon: 'fas fa-database'
    },
    {
      id: 'diagnostic',
      name: 'Diagnostic Agent',
      description: 'Root cause analysis with Python code execution',
      icon: 'fas fa-search'
    },
    {
      id: 'prescriptive',
      name: 'Prescriptive Agent',
      description: 'Recommendations and action plans',
      icon: 'fas fa-lightbulb'
    },
    {
      id: 'response',
      name: 'Response Generation',
      description: 'Creates user-friendly final responses',
      icon: 'fas fa-comment'
    }
  ];

  const getAgentStatus = (agentId: string) => {
    if (activeAgents.has(agentId)) {
      return 'Processing';
    }
    
    const hasCompleted = steps.some(step => step.agent === agentId && step.status === 'complete');
    return hasCompleted ? 'Complete' : 'Waiting';
  };

  const getAgentCardClass = (agentId: string) => {
    const status = getAgentStatus(agentId);
    
    if (status === 'Processing') {
      return 'bg-blue-50 border-blue-200';
    } else if (status === 'Complete') {
      return 'bg-green-50 border-green-200';
    }
    return 'bg-slate-50 border-slate-200';
  };

  const getAgentStatusClass = (agentId: string) => {
    const status = getAgentStatus(agentId);
    
    if (status === 'Processing') {
      return 'text-blue-600';
    } else if (status === 'Complete') {
      return 'text-green-600';
    }
    return 'text-slate-500';
  };

  const getAgentIndicatorClass = (agentId: string) => {
    const status = getAgentStatus(agentId);
    
    if (status === 'Processing') {
      return 'bg-blue-500 animate-pulse';
    } else if (status === 'Complete') {
      return 'bg-green-500';
    }
    return 'bg-slate-400';
  };

  return (
    <div className="w-80 bg-white border-r border-slate-200 overflow-y-auto">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Agent Workflow</h2>
        
        <div className="space-y-3">
          {agents.map((agent) => (
            <div key={agent.id} className={`p-4 rounded-lg border transition-all duration-300 ${getAgentCardClass(agent.id)}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getAgentIndicatorClass(agent.id)}`}></div>
                  <span className="text-sm font-medium text-slate-700">{agent.name}</span>
                </div>
                <span className={`text-xs ${getAgentStatusClass(agent.id)}`}>
                  {getAgentStatus(agent.id)}
                </span>
              </div>
              <p className="text-xs text-slate-600">{agent.description}</p>
              
              {activeAgents.has(agent.id) && (
                <div className="mt-2 text-xs text-blue-600 flex items-center">
                  <i className="fas fa-cog animate-spin mr-1"></i>
                  Processing...
                </div>
              )}
            </div>
          ))}
        </div>


      </div>
    </div>
  );
}
