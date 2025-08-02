import { storage } from '../storage';
import { ProductionData, MaintenanceLog } from '@shared/schema';

export interface AgentStep {
  agent: string;
  action: string;
  delay: number;
  status: 'processing' | 'complete' | 'waiting';
}

export interface AgentResponse {
  sqlQuery?: string;
  data?: any[];
  chartData?: any;
  insights?: string[];
  recommendations?: string[];
  response?: string;
}

export class AgentService {
  
  async orchestrateQuery(query: string): Promise<{ type: 'descriptive' | 'diagnostic' | 'prescriptive', steps: AgentStep[] }> {
    const lowerQuery = query.toLowerCase();
    
    // Classify query type
    let type: 'descriptive' | 'diagnostic' | 'prescriptive';
    
    if (
      lowerQuery.includes('top 5 days') ||
      lowerQuery.includes('trend') ||
      lowerQuery.includes('show me') ||
      lowerQuery.includes('last')
    ) {
      type = 'descriptive';
    } else if (
      lowerQuery.includes('why') ||
      lowerQuery.includes('reason') ||
      lowerQuery.includes('cause') ||
      (lowerQuery.includes('low production') && !lowerQuery.includes('top 5 days'))
    ) {
      type = 'diagnostic';
    } else if (
      lowerQuery.includes('recommend') ||
      lowerQuery.includes('improve') ||
      lowerQuery.includes('should') ||
      lowerQuery.includes('what to do')
    ) {
      type = 'prescriptive';
    } else {
      type = 'descriptive'; // default
    }
    
    // Generate workflow steps based on query type
    let steps: AgentStep[] = [
      { agent: 'orchestrator', action: 'Analyzing query structure and intent...', delay: 1000, status: 'processing' },
      { agent: 'orchestrator', action: `Classification: ${type.charAt(0).toUpperCase() + type.slice(1)} Analytics`, delay: 1500, status: 'processing' },
      { agent: 'orchestrator', action: `Routing to ${type.charAt(0).toUpperCase() + type.slice(1)} Agent...`, delay: 800, status: 'processing' },
    ];
    
    if (type === 'descriptive') {
      if (lowerQuery.includes('low production') && lowerQuery.includes('top 5 days')) {
        // Flow 2: Top 5 days with low production
        steps = [
          { agent: 'orchestrator', action: 'Analyzing query structure and intent...', delay: 1000, status: 'processing' },
          { agent: 'orchestrator', action: 'Classification: Descriptive Analytics', delay: 1000, status: 'processing' },
          { agent: 'orchestrator', action: 'Routing to Descriptive Agent...', delay: 800, status: 'processing' },
          { agent: 'descriptive', action: 'Generating SQL query for analysis...', delay: 3000, status: 'processing' },
          { agent: 'descriptive', action: 'Executing query using Tool sql_query_execution_tool...', delay: 2000, status: 'processing' },
          { agent: 'descriptive', action: 'Query executed successfully. Processing results...', delay: 1500, status: 'processing' },
          { agent: 'descriptive', action: 'Sending results to Response Generation Agent...', delay: 1000, status: 'processing' },
          { agent: 'response', action: 'Analyzing results and patterns...', delay: 1800, status: 'processing' },
          { agent: 'response', action: 'Generating data visualization...', delay: 2000, status: 'processing' },
          { agent: 'response', action: 'Preparing streaming response...', delay: 1500, status: 'processing' }
        ];
        return { type, steps };
      } else {
        // Flow 1: Production trends
        steps.push(
          { agent: 'descriptive', action: 'Generating SQL query for analysis...', delay: 3000, status: 'processing' },
          { agent: 'descriptive', action: 'Executing query using Tool sql_query_execution_tool...', delay: 2000, status: 'processing' },
          { agent: 'descriptive', action: 'Query executed successfully. Processing results...', delay: 1500, status: 'processing' },
          { agent: 'descriptive', action: 'Sending results to Response Generation Agent...', delay: 1000, status: 'processing' },
        );
      }
    } else if (type === 'diagnostic' || type === 'prescriptive') {
      // Use the same 5 low production days for the diagnostic agent's question
      const allData = await storage.getProductionData();
      const lowProductionDays = allData
        .sort((a, b) => a.productionVolume - b.productionVolume)
        .slice(0, 5);
      const lowProductionDates = lowProductionDays.map(d => d.date.toISOString().split('T')[0]);
      steps = [
        { agent: 'orchestrator', action: 'Analyzing query structure and intent...', delay: 1000, status: 'processing' },
        { agent: 'orchestrator', action: 'Classification: Diagnostic and Prescriptive Analytics', delay: 1000, status: 'processing' },
        { agent: 'orchestrator', action: 'Routing to Diagnostic Agent...', delay: 800, status: 'processing' },
        { agent: 'diagnostic', action: `Diagnostic Agent calling Descriptive agent for Data with question (For the dates ${lowProductionDates.join(', ')}, provide data on total production, machine downtime (with machine IDs and failure types), operator presence and skill levels, raw material availability and delays, defective bottle counts with rejection reasons, and environmental conditions like temperature and humidity.) ...`, delay: 2500, status: 'processing' },
        { agent: 'descriptive', action: 'Executing query using Tool sql_query_execution_tool...', delay: 3000, status: 'processing' },
        { agent: 'descriptive', action: 'Query executed successfully. Processing results...', delay: 1500, status: 'processing' },
        { agent: 'descriptive', action: 'Saving data using Tool data_saving_tool...', delay: 1800, status: 'processing' },
        { agent: 'diagnostic', action: 'Performing root cause analysis using Tool python_interpreter_tool...', delay: 3500, status: 'processing' },
        { agent: 'prescriptive', action: 'Prescriptive Agent calling Descriptive agent for Data with question (Get maintenance logs or frequent downtime machines over last 6 months) ...', delay: 2200, status: 'processing' },
        { agent: 'descriptive', action: 'Executing query using Tool sql_query_execution_tool...', delay: 3000, status: 'processing' },
        { agent: 'descriptive', action: 'Query executed successfully. Processing results...', delay: 1500, status: 'processing' },
        { agent: 'descriptive', action: 'Saving data using Tool data_saving_tool...', delay: 1800, status: 'processing' },
        { agent: 'prescriptive', action: 'Generating recommendations using Tool python_interpreter_tool...', delay: 3500, status: 'processing' },
        { agent: 'response', action: 'Analyzing results and patterns...', delay: 1800, status: 'processing' },
        { agent: 'response', action: 'Preparing streaming response...', delay: 1500, status: 'processing' }
      ];
      return { type, steps };
    }
    
    steps.push(
      { agent: 'response', action: 'Analyzing results and patterns...', delay: 1800, status: 'processing' },
      { agent: 'response', action: 'Generating data visualization...', delay: 2000, status: 'processing' },
      { agent: 'response', action: 'Preparing streaming response...', delay: 1500, status: 'processing' }
    );
    
    return { type, steps };
  }
  
  async processDescriptiveQuery(query: string): Promise<AgentResponse> {
    const lowerQuery = query.toLowerCase();
    
    let sqlQuery = '';
    let data: any[] = [];
    let chartData: any = null;
    let insights: string[] = [];
    let response = '';
    
    if (lowerQuery.includes('low production') && lowerQuery.includes('top 5 days')) {
      // Flow 2: Top 5 days with low production
      sqlQuery = `SELECT DATE(date) as date, production_volume, machine_id, 
                        operator_id, downtime_minutes, defective_count
                 FROM production_data
                 WHERE production_volume < 800
                 ORDER BY production_volume ASC
                 LIMIT 5`;
      
      const productionData = await storage.getProductionData();
      const lowProductionDays = productionData
        .filter(item => item.productionVolume < 800)
        .sort((a, b) => a.productionVolume - b.productionVolume)
        .slice(0, 5);
      
      data = lowProductionDays.map(item => ({
        date: item.date.toISOString().split('T')[0],
        production: item.productionVolume,
        machine: item.machineId,
        operator: item.operatorId,
        downtime: item.downtimeMinutes,
        defects: item.defectiveBottles // fixed property name
      }));
      
      if (data.length === 0) {
        chartData = null;
        insights = ["No low production days found in the data."];
        response = "There are no days with production volume below the threshold in your data.";
      } else {
        chartData = {
          labels: data.map(d => d.date),
          datasets: [{
            label: 'Production Volume',
            data: data.map(d => d.production),
            backgroundColor: 'rgba(239, 68, 68, 0.7)',
            borderColor: 'rgba(239, 68, 68, 1)',
            borderWidth: 2
          }]
        };
        insights = [
          `Lowest production day: ${data[0].date} with ${data[0].production} units`,
          `Average production on low days: ${Math.round(data.reduce((sum, d) => sum + d.production, 0) / data.length)} units`,
          `Most affected machine: ${data[0].machine}`,
          `Total downtime on worst day: ${data[0].downtime} minutes`
        ];
        response = `I I've identified the top 5 days with the lowest production levels in our manufacturing history. These dates show significantly reduced output compared to our average production capacity of 1,200 units per day. The analysis reveals that ${data[0].date} had the lowest production at just ${data[0].production} units, followed by ${data[1]?.date || ''} with ${data[1]?.production || ''} units.`;
      }
      
    } else if (lowerQuery.includes('trend') && lowerQuery.includes('6 months')) {
      sqlQuery = `SELECT DATE_FORMAT(date, '%Y-%m') as month,
                        SUM(production_volume) as total_production,
                        AVG(production_volume) as avg_daily_production
                 FROM production_data
                 WHERE date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
                 GROUP BY DATE_FORMAT(date, '%Y-%m')
                 ORDER BY month ASC`;
      
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const productionData = await storage.getProductionData(sixMonthsAgo, new Date());
      
      // Aggregate by month
      const monthlyData = new Map<string, { total: number, count: number }>();
      
      productionData.forEach(item => {
        const month = item.date.toISOString().substring(0, 7);
        if (!monthlyData.has(month)) {
          monthlyData.set(month, { total: 0, count: 0 });
        }
        const current = monthlyData.get(month)!;
        current.total += item.productionVolume;
        current.count++;
      });
      
      data = Array.from(monthlyData.entries()).map(([month, stats]) => ({
        month,
        total_production: stats.total,
        avg_daily_production: Math.round(stats.total / stats.count)
      })).sort((a, b) => a.month.localeCompare(b.month));
      
      chartData = {
        labels: data.map(d => {
          const date = new Date(d.month + '-01');
          return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        }),
        datasets: [{
          label: 'Production Volume (Units)',
          data: data.map(d => d.total_production),
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      };
      
      const maxMonth = data.reduce((max, curr) => curr.total_production > max.total_production ? curr : max, data[0]);
      const minMonth = data.reduce((min, curr) => curr.total_production < min.total_production ? curr : min, data[0]);
      
      insights = [
        `Peak Production: ${maxMonth.total_production.toLocaleString()} units in ${maxMonth.month}`,
        `Lowest Production: ${minMonth.total_production.toLocaleString()} units in ${minMonth.month}`,
        `Average Daily Production: ${Math.round(data.reduce((sum, d) => sum + d.avg_daily_production, 0) / data.length).toLocaleString()} units`
      ];
      
      response = `B Below is the production data for the last 6 months.`;
    } else if (lowerQuery.includes('top') && lowerQuery.includes('low production')) {
      sqlQuery = `SELECT date, production_volume, machine_id 
                 FROM production_data 
                 ORDER BY production_volume ASC 
                 LIMIT 5`;
      
      const allData = await storage.getProductionData();
      data = allData
        .sort((a, b) => a.productionVolume - b.productionVolume)
        .slice(0, 5)
        .map(item => ({
          date: item.date.toISOString().split('T')[0],
          production_volume: item.productionVolume,
          machine_id: item.machineId
        }));
      
      chartData = {
        labels: data.map(d => d.date),
        datasets: [{
          label: 'Production Volume (Units)',
          data: data.map(d => d.production_volume),
          backgroundColor: 'rgba(245, 158, 11, 0.8)',
          borderColor: '#f59e0b',
          borderWidth: 1
        }]
      };
      
      insights = [
        `Lowest production day: ${data[0].date} with ${data[0].production_volume} units`,
        `Most affected machine: ${data[0].machine_id}`,
        `Average low production: ${Math.round(data.reduce((sum, d) => sum + d.production_volume, 0) / data.length)} units`
      ];
      
      response = `H Here are the top 5 days with the lowest production volumes. These dates represent significant underperformance that may require further investigation to identify root causes and prevent future occurrences.`;
    }
    
    return {
      sqlQuery,
      data,
      chartData,
      insights,
      response
    };
  }
  
  async processDiagnosticQuery(query: string): Promise<AgentResponse> {
    const lowerQuery = query.toLowerCase();
    
    // Get low production days first
    const allData = await storage.getProductionData();
    const lowProductionDays = allData
      .sort((a, b) => a.productionVolume - b.productionVolume)
      .slice(0, 5);
    
    const lowProductionDates = lowProductionDays.map(d => d.date);
    
    // Analyze causes
    const causes = {
      machineDowntime: 0,
      materialDelays: 0,
      qualityIssues: 0,
      operatorIssues: 0
    };
    
    let totalAnalyzed = 0;
    
    lowProductionDays.forEach(day => {
      totalAnalyzed++;
      if (day.downtimeMinutes && day.downtimeMinutes > 60) causes.machineDowntime++;
      if (day.delayMinutes && day.delayMinutes > 0) causes.materialDelays++;
      if (day.defectiveBottles && day.defectiveBottles > 20) causes.qualityIssues++;
      if (day.operatorSkill === 'Novice') causes.operatorIssues++;
    });
    
    const primaryCause = Object.entries(causes).reduce((max, [key, value]) => 
      value > max.value ? { key, value } : max, { key: '', value: 0 });
    
    const insights = [
      `Machine downtime affected ${causes.machineDowntime} out of ${totalAnalyzed} low production days`,
      `Material delays contributed to ${causes.materialDelays} instances`,
      `Quality issues were present in ${causes.qualityIssues} cases`,
      `Operator skill level was a factor in ${causes.operatorIssues} instances`
    ];
    
    const response = `T Through detailed diagnostic analysis, I've identified the main contributing factors to low production days. The primary cause appears to be ${primaryCause.key.replace(/([A-Z])/g, ' $1').toLowerCase()} affecting ${primaryCause.value} out of ${totalAnalyzed} analyzed days. This represents a significant opportunity for improvement through targeted interventions.`;
    
    return {
      sqlQuery: `SELECT date, production_volume, machine_id, downtime_minutes, 
                        operator_skill, raw_material_status, defective_bottles 
                 FROM production_data 
                 WHERE date IN (${lowProductionDates.map(d => `'${d.toISOString().split('T')[0]}'`).join(',')})`,
      data: lowProductionDays,
      insights,
      response
    };
  }
  
  async processPrescriptiveQuery(query: string): Promise<AgentResponse> {
    // Get maintenance data
    const maintenanceLogs = await storage.getMaintenanceLogs();
    
    // Analyze machine performance
    const machineStats = new Map<string, { downtime: number, incidents: number }>();
    
    maintenanceLogs.forEach(log => {
      if (!machineStats.has(log.machineId)) {
        machineStats.set(log.machineId, { downtime: 0, incidents: 0 });
      }
      const stats = machineStats.get(log.machineId)!;
      stats.downtime += log.downtimeMinutes;
      stats.incidents++;
    });
    
    const recommendations = [
      "Implement predictive maintenance scheduling for high-downtime machines",
      "Increase operator training programs to reduce skill-related production issues",
      "Optimize raw material inventory management to prevent delays",
      "Establish quality control checkpoints to reduce defective output",
      "Consider equipment upgrades for machines with frequent failures"
    ];
    
    const insights = [
      `${machineStats.size} machines require maintenance attention`,
      `Average downtime per incident: ${Math.round(maintenanceLogs.reduce((sum, log) => sum + log.downtimeMinutes, 0) / maintenanceLogs.length)} minutes`,
      `Potential production increase: 15-25% through optimized maintenance`
    ];
    const response = `B Below is the production data for the last 6 months.`;
    return {
      sqlQuery: `SELECT machine_id, COUNT(*) as incidents, SUM(downtime_minutes) as total_downtime 
                 FROM maintenance_logs 
                 WHERE log_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH) 
                 GROUP BY machine_id 
                 ORDER BY total_downtime DESC`,
      data: Array.from(machineStats.entries()).map(([machine_id, stats]) => ({
        machine_id,
        incidents: stats.incidents,
        total_downtime: stats.downtime
      })),
      recommendations,
      insights,
      response
    };
  }
}

export const agentService = new AgentService();