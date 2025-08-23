// Mock data service for athlete dashboard

export interface GaitMetric {
  date: string;
  walkingSpeed: number;
  cadence: number;
  strideLength: number;
  equilibriumScore: number;
  stepWidth: number;
  strideFrequency: number;
}

export interface SessionData {
  id: string;
  date: string;
  duration: number; // in minutes
  status: 'Good' | 'Needs Attention';
  walkingSpeed: number;
  cadence: number;
  notes?: string;
}

export interface KPIData {
  walkingSpeed: {
    current: number;
    change: number;
    sparkline: number[];
    unit: 'm/s';
    definition: 'Average walking speed measured over the analysis period';
  };
  cadence: {
    current: number;
    change: number;
    sparkline: number[];
    unit: 'steps/min';
    definition: 'Number of steps taken per minute during walking';
  };
  strideLength: {
    current: number;
    change: number;
    sparkline: number[];
    unit: 'cm';
    definition: 'Distance covered in a single stride from heel strike to heel strike';
  };
  equilibriumScore: {
    current: number;
    change: number;
    sparkline: number[];
    unit: '/100';
    definition: 'Balance and stability score based on gait symmetry and consistency';
  };
}

// Generate random data within realistic ranges
function generateRandomValue(min: number, max: number, decimals: number = 1): number {
  const value = Math.random() * (max - min) + min;
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

// Generate sparkline data (7 points for mini chart)
function generateSparkline(baseValue: number, variance: number = 0.1): number[] {
  return Array.from({ length: 7 }, () => {
    const variation = (Math.random() - 0.5) * variance * baseValue;
    return Math.max(0, baseValue + variation);
  });
}

// Generate historical gait metrics
export function generateGaitMetrics(days: number = 30): GaitMetric[] {
  const metrics: GaitMetric[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    metrics.push({
      date: date.toISOString().split('T')[0],
      walkingSpeed: generateRandomValue(1.0, 1.8, 2),
      cadence: generateRandomValue(90, 130, 0),
      strideLength: generateRandomValue(60, 85, 1),
      equilibriumScore: generateRandomValue(70, 95, 1),
      stepWidth: generateRandomValue(8, 15, 1),
      strideFrequency: generateRandomValue(0.8, 1.2, 2)
    });
  }

  return metrics;
}

// Generate session history data
export function generateSessionHistory(): SessionData[] {
  const sessions: SessionData[] = [];
  const today = new Date();
  
  for (let i = 0; i < 5; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - (i * 2 + 1));
    
    const walkingSpeed = generateRandomValue(1.0, 1.8, 2);
    const cadence = generateRandomValue(90, 130, 0);
    
    sessions.push({
      id: `session-${Date.now()}-${i}`,
      date: date.toISOString().split('T')[0],
      duration: generateRandomValue(15, 45, 0),
      status: Math.random() > 0.3 ? 'Good' : 'Needs Attention',
      walkingSpeed,
      cadence,
      notes: Math.random() > 0.5 ? 'Regular gait pattern observed' : undefined
    });
  }
  
  return sessions.reverse(); // Most recent first
}

// Generate current KPI data with sparklines
export function generateKPIData(): KPIData {
  const walkingSpeed = generateRandomValue(1.2, 1.6, 2);
  const cadence = generateRandomValue(100, 120, 0);
  const strideLength = generateRandomValue(65, 80, 1);
  const equilibriumScore = generateRandomValue(75, 90, 1);
  
  return {
    walkingSpeed: {
      current: walkingSpeed,
      change: generateRandomValue(-5, 8, 1),
      sparkline: generateSparkline(walkingSpeed, 0.15),
      unit: 'm/s',
      definition: 'Average walking speed measured over the analysis period'
    },
    cadence: {
      current: cadence,
      change: generateRandomValue(-3, 6, 1),
      sparkline: generateSparkline(cadence, 0.1),
      unit: 'steps/min',
      definition: 'Number of steps taken per minute during walking'
    },
    strideLength: {
      current: strideLength,
      change: generateRandomValue(-4, 7, 1),
      sparkline: generateSparkline(strideLength, 0.12),
      unit: 'cm',
      definition: 'Distance covered in a single stride from heel strike to heel strike'
    },
    equilibriumScore: {
      current: equilibriumScore,
      change: generateRandomValue(-2, 5, 1),
      sparkline: generateSparkline(equilibriumScore, 0.08),
      unit: '/100',
      definition: 'Balance and stability score based on gait symmetry and consistency'
    }
  };
}

// Main mock data class
export class MockDataService {
  private static instance: MockDataService;
  private gaitMetrics: GaitMetric[] = [];
  private sessionHistory: SessionData[] = [];
  private kpiData: KPIData = {} as KPIData;
  
  private constructor() {
    this.refreshData();
  }
  
  public static getInstance(): MockDataService {
    if (!MockDataService.instance) {
      MockDataService.instance = new MockDataService();
    }
    return MockDataService.instance;
  }
  
  public refreshData(): void {
    this.gaitMetrics = generateGaitMetrics(90); // 90 days of data
    this.sessionHistory = generateSessionHistory();
    this.kpiData = generateKPIData();
  }
  
  public getGaitMetrics(days: number = 30): GaitMetric[] {
    return this.gaitMetrics.slice(-days);
  }
  
  public getSessionHistory(): SessionData[] {
    return this.sessionHistory;
  }
  
  public getKPIData(): KPIData {
    return this.kpiData;
  }
  
  public getChartData(metric: keyof GaitMetric, days: number = 30) {
    const data = this.getGaitMetrics(days);
    return data.map(item => ({
      date: item.date,
      value: item[metric]
    }));
  }
  
  public getMultiLineChartData(days: number = 30) {
    const data = this.getGaitMetrics(days);
    return data.map(item => ({
      date: item.date,
      cadence: item.cadence,
      strideFrequency: item.strideFrequency,
      stepWidth: item.stepWidth
    }));
  }
}

// Export singleton instance
export const mockDataService = MockDataService.getInstance();