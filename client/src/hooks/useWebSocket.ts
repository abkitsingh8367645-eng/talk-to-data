import { useState, useEffect, useCallback, useRef } from 'react';
import { AgentStep, AgentResponse, WebSocketMessage } from '../types/agent';

interface UseWebSocketProps {
  onAgentStep: (step: AgentStep) => void;
  onResponse: (response: AgentResponse) => void;
  onError: (error: string) => void;
}

export function useWebSocket({ onAgentStep, onResponse, onError }: UseWebSocketProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }
    
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        setIsConnected(true);
        setIsProcessing(false);
        reconnectAttempts.current = 0;
        console.log('WebSocket connected');
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case 'agent_step':
              onAgentStep(message.data);
              break;
            case 'response':
              onResponse(message.data);
              setIsProcessing(false);
              break;
            case 'error':
              onError(message.data.message);
              setIsProcessing(false);
              break;
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
          onError('Failed to parse server response');
        }
      };
      
      wsRef.current.onclose = () => {
        setIsConnected(false);
        setIsProcessing(false);
        console.log('WebSocket disconnected');
        
        // Attempt to reconnect
        if (reconnectAttempts.current < 5) {
          reconnectAttempts.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, Math.pow(2, reconnectAttempts.current) * 1000);
        }
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        onError('Connection error occurred');
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      onError('Failed to connect to server');
    }
  }, [onAgentStep, onResponse, onError]);
  
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setIsProcessing(false);
  }, []);
  
  const sendQuery = useCallback((query: string, sessionId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      setIsProcessing(true);
      wsRef.current.send(JSON.stringify({
        type: 'query',
        data: { query, sessionId }
      }));
    } else {
      onError('Not connected to server');
    }
  }, [onError]);
  
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);
  
  return {
    isConnected,
    isProcessing,
    sendQuery,
    connect,
    disconnect
  };
}
