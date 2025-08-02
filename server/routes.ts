import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { agentService } from "./services/agentService";
import { nanoid } from "nanoid";

interface WebSocketMessage {
  type: 'query' | 'agent_step' | 'response' | 'error';
  data: any;
  sessionId?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time agent communication
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store active connections
  const connections = new Map<string, WebSocket>();
  
  wss.on('connection', (ws: WebSocket) => {
    const connectionId = nanoid();
    connections.set(connectionId, ws);
    
    console.log(`WebSocket connection established: ${connectionId}`);
    
    ws.on('message', async (message: string) => {
      try {
        const parsedMessage: WebSocketMessage = JSON.parse(message);
        
        if (parsedMessage.type === 'query') {
          const { query, sessionId } = parsedMessage.data;
          
          // Create or get chat session
          let session = await storage.getChatSession(sessionId);
          if (!session) {
            session = await storage.createChatSession(sessionId);
          }
          
          // Save user message
          await storage.createChatMessage({
            sessionId,
            message: query,
            isUser: true,
            agentType: null,
            sqlQuery: null,
            chartData: null,
          });
          
          // Process query through agent system
          const { type, steps } = await agentService.orchestrateQuery(query);
          
          // Send workflow steps to client
          for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            
            // Send step start
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'agent_step',
                data: {
                  ...step,
                  status: 'processing',
                  stepIndex: i
                }
              }));
            }
            
            // Wait for step delay
            await new Promise(resolve => setTimeout(resolve, step.delay));
            
            // Send step complete
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'agent_step',
                data: {
                  ...step,
                  status: 'complete',
                  stepIndex: i
                }
              }));
            }
          }
          
          // Process the actual query
          let agentResponse;
          if (type === 'descriptive') {
            agentResponse = await agentService.processDescriptiveQuery(query);
          } else if (type === 'diagnostic') {
            agentResponse = await agentService.processDiagnosticQuery(query);
          } else if (type === 'prescriptive') {
            agentResponse = await agentService.processPrescriptiveQuery(query);
          }
          
          // Save agent response
          await storage.createChatMessage({
            sessionId,
            message: agentResponse?.response || 'Analysis complete',
            isUser: false,
            agentType: type,
            sqlQuery: agentResponse?.sqlQuery || null,
            chartData: agentResponse?.chartData ? JSON.stringify(agentResponse.chartData) : null,
          });
          
          // Send final response with streaming
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'response',
              data: {
                ...agentResponse,
                type,
                sessionId
              }
            }));
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'error',
            data: { message: 'An error occurred processing your request' }
          }));
        }
      }
    });
    
    ws.on('close', () => {
      connections.delete(connectionId);
      console.log(`WebSocket connection closed: ${connectionId}`);
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      connections.delete(connectionId);
    });
  });
  
  // REST API endpoints
  app.get('/api/sessions/:sessionId/messages', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const messages = await storage.getChatMessages(sessionId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });
  
  app.post('/api/sessions', async (req, res) => {
    try {
      const sessionId = nanoid();
      const session = await storage.createChatSession(sessionId);
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create session' });
    }
  });
  
  app.get('/api/production/trends', async (req, res) => {
    try {
      const months = parseInt(req.query.months as string) || 6;
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);
      
      const data = await storage.getProductionData(startDate, new Date());
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch production trends' });
    }
  });

  return httpServer;
}
