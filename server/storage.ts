import { 
  users, 
  type User, 
  type InsertUser,
  productionData,
  type ProductionData,
  type InsertProductionData,
  maintenanceLogs,
  type MaintenanceLog,
  chatSessions,
  type ChatSession,
  chatMessages,
  type ChatMessage,
  type InsertChatMessage
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Production data methods
  getProductionData(startDate?: Date, endDate?: Date): Promise<ProductionData[]>;
  createProductionData(data: InsertProductionData): Promise<ProductionData>;
  
  // Maintenance logs
  getMaintenanceLogs(machineId?: string): Promise<MaintenanceLog[]>;
  
  // Chat sessions
  createChatSession(sessionId: string): Promise<ChatSession>;
  getChatSession(sessionId: string): Promise<ChatSession | undefined>;
  
  // Chat messages
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(sessionId: string): Promise<ChatMessage[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private productionData: Map<number, ProductionData>;
  private maintenanceLogs: Map<number, MaintenanceLog>;
  private chatSessions: Map<string, ChatSession>;
  private chatMessages: Map<number, ChatMessage>;
  
  private currentUserId: number;
  private currentProductionId: number;
  private currentMaintenanceId: number;
  private currentChatSessionId: number;
  private currentChatMessageId: number;

  constructor() {
    this.users = new Map();
    this.productionData = new Map();
    this.maintenanceLogs = new Map();
    this.chatSessions = new Map();
    this.chatMessages = new Map();
    
    this.currentUserId = 1;
    this.currentProductionId = 1;
    this.currentMaintenanceId = 1;
    this.currentChatSessionId = 1;
    this.currentChatMessageId = 1;
    
    this.seedData();
  }

  private seedData() {
    // Clear any existing data
    this.productionData.clear();
    this.maintenanceLogs.clear();

    // Fixed demo production data for all flows
    const fixedProduction = [
      // Low production days for 2nd flow
      { date: new Date('2025-01-21'), productionVolume: 62, machineId: 'M001', downtimeMinutes: 80, defectiveBottles: 25, operatorId: 'OP001', operatorSkill: 'Novice', rawMaterialStatus: 'Delayed', delayMinutes: 30, failureType: 'Mechanical', rejectionReason: 'Quality Issue', temperature: '22.5', humidity: '45.0' },
      { date: new Date('2025-03-14'), productionVolume: 92, machineId: 'M002', downtimeMinutes: 60, defectiveBottles: 10, operatorId: 'OP002', operatorSkill: 'Intermediate', rawMaterialStatus: 'Available', delayMinutes: 0, failureType: 'Electrical', rejectionReason: null, temperature: '23.0', humidity: '50.0' },
      { date: new Date('2025-02-10'), productionVolume: 95, machineId: 'M003', downtimeMinutes: 70, defectiveBottles: 15, operatorId: 'OP003', operatorSkill: 'Novice', rawMaterialStatus: 'Available', delayMinutes: 0, failureType: 'Mechanical', rejectionReason: null, temperature: '21.0', humidity: '48.0' },
      { date: new Date('2025-04-05'), productionVolume: 98, machineId: 'M004', downtimeMinutes: 90, defectiveBottles: 20, operatorId: 'OP004', operatorSkill: 'Expert', rawMaterialStatus: 'Delayed', delayMinutes: 20, failureType: 'Material', rejectionReason: 'Quality Issue', temperature: '24.0', humidity: '55.0' },
      { date: new Date('2025-05-01'), productionVolume: 99, machineId: 'M005', downtimeMinutes: 85, defectiveBottles: 18, operatorId: 'OP005', operatorSkill: 'Intermediate', rawMaterialStatus: 'Available', delayMinutes: 0, failureType: 'Software', rejectionReason: null, temperature: '20.0', humidity: '42.0' },
      // Normal production days for trend/other flows
      { date: new Date('2025-01-01'), productionVolume: 1300, machineId: 'M001', downtimeMinutes: 20, defectiveBottles: 5, operatorId: 'OP001', operatorSkill: 'Expert', rawMaterialStatus: 'Available', delayMinutes: 0, failureType: null, rejectionReason: null, temperature: '22.0', humidity: '40.0' },
      { date: new Date('2025-02-01'), productionVolume: 1400, machineId: 'M002', downtimeMinutes: 15, defectiveBottles: 3, operatorId: 'OP002', operatorSkill: 'Expert', rawMaterialStatus: 'Available', delayMinutes: 0, failureType: null, rejectionReason: null, temperature: '23.0', humidity: '41.0' },
      { date: new Date('2025-03-01'), productionVolume: 1350, machineId: 'M003', downtimeMinutes: 10, defectiveBottles: 2, operatorId: 'OP003', operatorSkill: 'Intermediate', rawMaterialStatus: 'Available', delayMinutes: 0, failureType: null, rejectionReason: null, temperature: '21.0', humidity: '39.0' },
      { date: new Date('2025-04-01'), productionVolume: 1450, machineId: 'M004', downtimeMinutes: 12, defectiveBottles: 4, operatorId: 'OP004', operatorSkill: 'Expert', rawMaterialStatus: 'Available', delayMinutes: 0, failureType: null, rejectionReason: null, temperature: '24.0', humidity: '43.0' },
      { date: new Date('2025-05-01'), productionVolume: 1500, machineId: 'M005', downtimeMinutes: 8, defectiveBottles: 1, operatorId: 'OP005', operatorSkill: 'Expert', rawMaterialStatus: 'Available', delayMinutes: 0, failureType: null, rejectionReason: null, temperature: '20.0', humidity: '38.0' },
    ];

    fixedProduction.forEach((data, idx) => {
      this.productionData.set(idx + 1, {
        id: idx + 1,
        ...data,
      });
    });

    // Optionally, add fixed maintenance logs for 3rd flow
    this.maintenanceLogs.set(1, {
      id: 1,
      machineId: 'M001',
      logDate: new Date('2025-01-21'),
      downtimeMinutes: 80,
      maintenanceType: 'Corrective',
      description: 'Machine M001 required maintenance due to Mechanical failure',
    });
    this.maintenanceLogs.set(2, {
      id: 2,
      machineId: 'M004',
      logDate: new Date('2025-04-05'),
      downtimeMinutes: 90,
      maintenanceType: 'Corrective',
      description: 'Machine M004 required maintenance due to Material failure',
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getProductionData(startDate?: Date, endDate?: Date): Promise<ProductionData[]> {
    const allData = Array.from(this.productionData.values());
    
    if (!startDate && !endDate) {
      return allData;
    }
    
    return allData.filter(data => {
      const dataDate = new Date(data.date);
      if (startDate && dataDate < startDate) return false;
      if (endDate && dataDate > endDate) return false;
      return true;
    });
  }

  async createProductionData(data: InsertProductionData): Promise<ProductionData> {
    const id = this.currentProductionId++;
    const productionData: ProductionData = { 
      ...data, 
      id,
      downtimeMinutes: data.downtimeMinutes || 0,
      delayMinutes: data.delayMinutes || 0,
      defectiveBottles: data.defectiveBottles || 0,
      failureType: data.failureType || null,
      operatorId: data.operatorId || null,
      operatorSkill: data.operatorSkill || null,
      rawMaterialStatus: data.rawMaterialStatus || null,
      rejectionReason: data.rejectionReason || null,
      temperature: data.temperature || null,
      humidity: data.humidity || null,
    };
    this.productionData.set(id, productionData);
    return productionData;
  }

  async getMaintenanceLogs(machineId?: string): Promise<MaintenanceLog[]> {
    const allLogs = Array.from(this.maintenanceLogs.values());
    
    if (!machineId) {
      return allLogs;
    }
    
    return allLogs.filter(log => log.machineId === machineId);
  }

  async createChatSession(sessionId: string): Promise<ChatSession> {
    const id = this.currentChatSessionId++;
    const session: ChatSession = {
      id,
      sessionId,
      createdAt: new Date(),
      isActive: true,
    };
    this.chatSessions.set(sessionId, session);
    return session;
  }

  async getChatSession(sessionId: string): Promise<ChatSession | undefined> {
    return this.chatSessions.get(sessionId);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentChatMessageId++;
    const chatMessage: ChatMessage = {
      ...message,
      id,
      timestamp: new Date(),
      agentType: message.agentType || null,
      sqlQuery: message.sqlQuery || null,
      chartData: message.chartData || null,
    };
    this.chatMessages.set(id, chatMessage);
    return chatMessage;
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(msg => msg.sessionId === sessionId)
      .sort((a, b) => a.timestamp!.getTime() - b.timestamp!.getTime());
  }
}

export const storage = new MemStorage();
