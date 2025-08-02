import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const productionData = pgTable("production_data", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  productionVolume: integer("production_volume").notNull(),
  machineId: text("machine_id").notNull(),
  downtimeMinutes: integer("downtime_minutes").default(0),
  failureType: text("failure_type"),
  operatorId: text("operator_id"),
  operatorSkill: text("operator_skill"),
  rawMaterialStatus: text("raw_material_status"),
  delayMinutes: integer("delay_minutes").default(0),
  defectiveBottles: integer("defective_bottles").default(0),
  rejectionReason: text("rejection_reason"),
  temperature: decimal("temperature", { precision: 5, scale: 2 }),
  humidity: decimal("humidity", { precision: 5, scale: 2 }),
});

export const maintenanceLogs = pgTable("maintenance_logs", {
  id: serial("id").primaryKey(),
  machineId: text("machine_id").notNull(),
  logDate: timestamp("log_date").notNull(),
  downtimeMinutes: integer("downtime_minutes").notNull(),
  maintenanceType: text("maintenance_type"),
  description: text("description"),
});

export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  message: text("message").notNull(),
  isUser: boolean("is_user").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  agentType: text("agent_type"),
  sqlQuery: text("sql_query"),
  chartData: text("chart_data"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProductionDataSchema = createInsertSchema(productionData).omit({
  id: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type ProductionData = typeof productionData.$inferSelect;
export type InsertProductionData = z.infer<typeof insertProductionDataSchema>;

export type MaintenanceLog = typeof maintenanceLogs.$inferSelect;
export type ChatSession = typeof chatSessions.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
