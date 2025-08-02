import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ProductionChart } from './ProductionChart';
import { ThinkingContainer } from './ThinkingContainer';
import { ChatHistory } from './ChatHistory';
import { AgentResponse, AgentStep } from '../types/agent';

interface ChatInterfaceProps {
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
  response: AgentResponse | null;
  sessionId: string;
  steps: AgentStep[];
  showChatHistory: boolean;
  onToggleChatHistory: () => void;
}

interface ChatMessage {
  id: string;
  userMessage: string;
  response: AgentResponse | null;
  steps: AgentStep[];
  streamingText: string;
  isStreaming: boolean;
  timestamp: Date;
}

export function ChatInterface({ onSendMessage, isProcessing, response, sessionId, steps, showChatHistory, onToggleChatHistory }: ChatInterfaceProps) {
  const [message, setMessage] = useState('Show me production trends for last 6 months');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState<ChatMessage | null>(null);
  const [isResponseVisible, setIsResponseVisible] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [sqlExpanded, setSqlExpanded] = useState(false);
  const [thinkingExpanded, setThinkingExpanded] = useState(true);
  const [currentFlow, setCurrentFlow] = useState(1);
  const [isFlowComplete, setIsFlowComplete] = useState(false);
  const streamingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const flowQueries = [
    {
      id: 1,
      query: 'Show me production trends for last 6 months',
      type: 'Descriptive',
      icon: 'fas fa-chart-line',
      color: 'text-blue-600'
    },
    {
      id: 2,
      query: 'Tell me the top 5 days which had low production',
      type: 'Diagnostic',
      icon: 'fas fa-search',
      color: 'text-green-600'
    },
    {
      id: 3,
      query: 'Tell me the main reason for low production and recommend how to improve it',
      type: 'Prescriptive',
      icon: 'fas fa-brain',
      color: 'text-purple-600'
    }
  ];

  const handleSendMessage = () => {
    if (!message.trim() || isProcessing) return;
    
    // Create new message entry
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      userMessage: message,
      response: null,
      steps: [],
      streamingText: '',
      isStreaming: false,
      timestamp: new Date()
    };
    
    setCurrentMessage(newMessage);
    setIsResponseVisible(true);
    setStreamingText('');
    setIsStreaming(false);
    
    // Clear any existing streaming interval
    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
    }
    
    onSendMessage(message);
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSampleQuery = (query: string) => {
    setMessage(query);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleNewChat = () => {
    // Save current message to history before resetting
    if (currentMessage) {
      setChatHistory(prev => [...prev, {
        ...currentMessage,
        response: response,
        steps: steps,
        streamingText: streamingText,
        isStreaming: false
      }]);
    }
    
    setIsResponseVisible(false);
    setCurrentMessage(null);
    setStreamingText('');
    setIsStreaming(false);
    setSqlExpanded(false);
    setThinkingExpanded(true);
    setCurrentFlow(1);
    setIsFlowComplete(false);
    setMessage('Show me production trends for last 6 months');
    
    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
    }
  };

  // Stream response text when response is received
  useEffect(() => {
    if (response?.response) {
      // Clear any existing streaming
      if (streamingIntervalRef.current) {
        clearInterval(streamingIntervalRef.current);
      }
      
      // Reset states
      setStreamingText('');
      setIsStreaming(true);
      
      const text = response.response;
      console.log('Streaming text:', text);
      let index = 0;
      // Fix: If the first character is missing, ensure we always start from index 0
      streamingIntervalRef.current = setInterval(() => {
        if (index < text.length) {
          // Always include the first character
          setStreamingText(prev => prev + text[index]);
          index++;
        } else {
          setIsStreaming(false);
          setIsFlowComplete(true);
          if (streamingIntervalRef.current) {
            clearInterval(streamingIntervalRef.current);
          }
        }
      }, 15);
    }
    
    return () => {
      if (streamingIntervalRef.current) {
        clearInterval(streamingIntervalRef.current);
      }
    };
  }, [response]);

  // Auto-suggest next flow question in input box after completion
  useEffect(() => {
    if (isFlowComplete && currentFlow < 3) {
      const timer = setTimeout(() => {
        const nextFlow = currentFlow + 1;
        const nextQuery = flowQueries.find(q => q.id === nextFlow);
        if (nextQuery) {
          setCurrentFlow(nextFlow);
          setIsFlowComplete(false);
          setMessage(nextQuery.query);
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isFlowComplete, currentFlow]);

  // Function to render a single message and response
  const renderMessage = (msg: ChatMessage, isCurrentMessage: boolean = false) => {
    const displayStreamingText = isCurrentMessage ? streamingText : msg.streamingText;
    const displayIsStreaming = isCurrentMessage ? isStreaming : msg.isStreaming;
    const displayResponse = isCurrentMessage ? response : msg.response;
    const displaySteps = isCurrentMessage ? steps : msg.steps;

    return (
      <div key={msg.id} className="space-y-6">
        {/* User Message - Right Aligned */}
        <div className="flex justify-end">
          <div className="flex items-start space-x-4 max-w-2xl">
            <div className="flex-1">
              <div className="bg-gradient-to-r from-white via-teal-50 to-teal-100 text-slate-800 rounded-2xl shadow p-4 ml-auto border border-teal-200">
                <p className="text-base font-medium">{msg.userMessage}</p>
              </div>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-blue-400 rounded-full flex items-center justify-center flex-shrink-0 shadow-md border border-teal-200">
              <i className="fas fa-comment-dots text-white"></i>
            </div>
          </div>
        </div>

        {/* AI Response - Left Aligned */}
        <div className="flex justify-start">
          <div className="flex items-start space-x-4 max-w-full w-full">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 border border-amber-200 shadow-sm">
              <i className="fas fa-robot text-amber-500"></i>
            </div>
            <div className="flex-1">
              <div className="bg-white/90 border border-slate-200 rounded-2xl shadow p-6">
                {/* Agent Thinking Section */}
                {displaySteps.length > 0 && (
                  <div className="mb-6">
                    <button
                      onClick={() => setThinkingExpanded(!thinkingExpanded)}
                      className="flex items-center space-x-2 text-slate-700 hover:text-slate-900 mb-4"
                    >
                      <i className={`fas ${thinkingExpanded ? 'fa-chevron-down' : 'fa-chevron-right'}`}></i>
                      <span className="font-medium">Agent Thinking Process</span>
                      <span className="text-sm text-slate-500">({displaySteps.length} steps)</span>
                    </button>
                    {thinkingExpanded && (
                      <div className="pl-6 border-l-2 border-slate-200">
                        <ThinkingContainer steps={displaySteps} />
                      </div>
                    )}
                  </div>
                )}

                {/* Streaming Response - First */}
                <div className="prose max-w-none mb-6">
                  <h4 className="font-medium text-slate-800 mb-3 flex items-center">
                    <i className="fas fa-comment-alt text-amber-500 mr-2"></i>
                    AI Analysis & Response
                  </h4>
                  <div className="text-slate-700 leading-relaxed text-base">
                    {displayStreamingText || (isCurrentMessage && isProcessing ? 'Generating response...' : '')}
                    {displayIsStreaming && <span className="animate-pulse text-amber-500 font-bold">|</span>}
                  </div>
                </div>

                {/* Chart Section - After streaming completes */}
                {!displayIsStreaming && displayResponse?.chartData && (
                  <div className="mb-6">
                    <h4 className="font-medium text-slate-800 mb-3 flex items-center">
                      <i className="fas fa-chart-line text-green-600 mr-2"></i>
                      {displayResponse.type === 'descriptive' ? 'Production Trends Analysis' : 
                        displayResponse.type === 'diagnostic' ? 'Low Production Analysis' : 
                        'Improvement Recommendations'}
                    </h4>
                    <ProductionChart 
                      data={displayResponse.chartData} 
                      type={displayResponse.type === 'descriptive' && displayResponse.response?.toLowerCase().includes('lowest production') ? 'bar' : 'line'} 
                    />
                  </div>
                )}

                {/* Recommendations Section - After chart */}
                {!displayIsStreaming && displayResponse?.recommendations && displayResponse.recommendations.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-slate-800 mb-3 flex items-center">
                      <i className="fas fa-brain text-purple-600 mr-2"></i>
                      Recommendations
                    </h4>
                    <div className="space-y-3">
                      {displayResponse.recommendations.map((rec, index) => (
                        <div key={index} className="bg-purple-50 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <i className="fas fa-check text-purple-600"></i>
                            <span className="font-medium text-purple-600">Recommendation {index + 1}</span>
                          </div>
                          <p className="text-sm text-slate-600">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Insights Section - At the end */}
                {!displayIsStreaming && displayResponse?.insights && displayResponse.insights.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-slate-800 mb-3 flex items-center">
                      <i className="fas fa-lightbulb text-amber-500 mr-2"></i>
                      Key Insights
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {displayResponse.insights.map((insight, index) => (
                        <div key={index} className="bg-blue-50 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <i className="fas fa-arrow-up text-blue-600"></i>
                            <span className="font-medium text-blue-600">Insight {index + 1}</span>
                          </div>
                          <p className="text-sm text-slate-600">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Auto-scroll to bottom when response updates or steps change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [response, steps, streamingText, isStreaming]);

  // Save current message to history when response is complete
  useEffect(() => {
    if (currentMessage && response && !isStreaming && !isProcessing) {
      // Add delay to ensure streaming is complete
      const timer = setTimeout(() => {
        setChatHistory(prev => [...prev, {
          ...currentMessage,
          response: response,
          steps: steps,
          streamingText: streamingText,
          isStreaming: false
        }]);
        setCurrentMessage(null);
        setIsFlowComplete(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [currentMessage, response, isStreaming, isProcessing, steps, streamingText]);

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-industry text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-800">Bhaiya & Company</h1>
              <p className="text-sm text-slate-500">Manufacturing Analytics AI</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>AI System Active</span>
            </div>
            <Button 
              onClick={onToggleChatHistory}
              variant="outline"
              size="sm"
              className="text-slate-600 hover:text-slate-800"
            >
              <i className={`fas ${showChatHistory ? 'fa-eye-slash' : 'fa-eye'} mr-2`}></i>
              {showChatHistory ? 'Hide' : 'Show'} History
            </Button>
            <Button onClick={handleNewChat} className="bg-blue-600 hover:bg-blue-700">
              <i className="fas fa-plus mr-2"></i>New Chat
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Chat History */}
        {showChatHistory && (
          <div className="w-1/4 border-r border-slate-200 p-4 overflow-y-auto">
            <ChatHistory currentSessionId={sessionId} />
          </div>
        )}

        {/* Right Panel - Chat Messages */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {!isResponseVisible && chatHistory.length === 0 ? (
          <div className="max-w-7xl mx-auto">
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-lightbulb text-amber-500"></i>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-800">Sample Analytics Queries</h3>
                    <p className="text-sm text-slate-600">Try these example queries to explore your manufacturing data</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {flowQueries.map((sample, index) => (
                    <button
                      key={index}
                      onClick={() => handleSampleQuery(sample.query)}
                      className="text-left p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <i className={`${sample.icon} ${sample.color}`}></i>
                        <span className="text-sm font-medium text-slate-700">{sample.type}</span>
                      </div>
                      <p className="text-sm text-slate-600">{sample.query}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Render previous chat history */}
            {chatHistory.map((msg) => renderMessage(msg))}
            
            {/* Render current message if exists */}
            {currentMessage && renderMessage(currentMessage, true)}
          </div>
        )}
        </div>
      </div>

      {/* Chat Input */}
      <div className="border-t border-slate-200 bg-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your manufacturing data..."
                className="w-full"
                disabled={isProcessing}
              />
            </div>
            <Button 
              onClick={handleSendMessage}
              disabled={isProcessing || !message.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <i className="fas fa-paper-plane"></i>
            </Button>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Press Enter to send, or try one of the sample queries above
          </div>
        </div>
      </div>
    </div>
  );
}
