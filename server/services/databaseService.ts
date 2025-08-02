import { storage } from '../storage';
import { ProductionData, MaintenanceLog } from '@shared/schema';

export class DatabaseService {
  
  async executeQuery(query: string): Promise<any[]> {
    // Simulate SQL execution by parsing and executing against our in-memory storage
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('production_data')) {
      if (lowerQuery.includes('last 6 months') || lowerQuery.includes('6 month')) {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        return await storage.getProductionData(sixMonthsAgo, new Date());
      }
      
      if (lowerQuery.includes('order by production_volume asc')) {
        const allData = await storage.getProductionData();
        return allData.sort((a, b) => a.productionVolume - b.productionVolume);
      }
      
      return await storage.getProductionData();
    }
    
    if (lowerQuery.includes('maintenance_logs')) {
      return await storage.getMaintenanceLogs();
    }
    
    return [];
  }
  
  async getProductionTrends(months: number = 6): Promise<any[]> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    const data = await storage.getProductionData(startDate, new Date());
    
    // Group by month
    const monthlyData = new Map<string, { total: number, count: number, avg: number }>();
    
    data.forEach(item => {
      const month = item.date.toISOString().substring(0, 7);
      if (!monthlyData.has(month)) {
        monthlyData.set(month, { total: 0, count: 0, avg: 0 });
      }
      const current = monthlyData.get(month)!;
      current.total += item.productionVolume;
      current.count++;
    });
    
    // Calculate averages
    monthlyData.forEach(stats => {
      stats.avg = Math.round(stats.total / stats.count);
    });
    
    return Array.from(monthlyData.entries()).map(([month, stats]) => ({
      month,
      total_production: stats.total,
      avg_daily_production: stats.avg
    })).sort((a, b) => a.month.localeCompare(b.month));
  }
  
  async getLowProductionDays(limit: number = 5): Promise<ProductionData[]> {
    const allData = await storage.getProductionData();
    return allData
      .sort((a, b) => a.productionVolume - b.productionVolume)
      .slice(0, limit);
  }
  
  async getMaintenanceAnalysis(): Promise<any[]> {
    const logs = await storage.getMaintenanceLogs();
    
    const machineStats = new Map<string, { downtime: number, incidents: number }>();
    
    logs.forEach(log => {
      if (!machineStats.has(log.machineId)) {
        machineStats.set(log.machineId, { downtime: 0, incidents: 0 });
      }
      const stats = machineStats.get(log.machineId)!;
      stats.downtime += log.downtimeMinutes;
      stats.incidents++;
    });
    
    return Array.from(machineStats.entries()).map(([machineId, stats]) => ({
      machine_id: machineId,
      incidents: stats.incidents,
      total_downtime: stats.downtime
    })).sort((a, b) => b.total_downtime - a.total_downtime);
  }
}

export const databaseService = new DatabaseService();
