export interface HealthOverviewResponse {
  data: {
    overviewDateRange: {
      startDate: string;
      endDate: string;
      period: "day" | "week" | "month";
    };
    heartRate: {
      avgValue: number | null;
      minValue: number | null;
      maxValue: number | null;
      data: Array<any>;
    };
    sleep: {
      avgSleepTime: number | null;
      avgDeepSleep: number | null;
      avgLightSleep: number | null;
      avgREM: number | null;
      avgWakeupCount: number | null;
      data: Array<any>;
    };
    spo2: {
      avgValue: number | null;
      minValue: number | null;
      maxValue: number | null;
      data: Array<any>;
    };
    sport: {
      totalSteps: number;
      totalCalories: number;
      avgStepsPerDay: number;
      avgCaloriesPerDay: number;
      data: Array<any>;
    };
    bloodPressure: {
      avgSbp: number | null;
      avgDbp: number | null;
      minSbp: number | null;
      maxSbp: number | null;
      minDbp: number | null;
      maxDbp: number | null;
      data: Array<any>;
    };
    otherData: {
      avgHrvValue: number | null;
      avgCvrValue: number | null;
      avgRespiratoryRateValue: number | null;
      data: Array<any>;
    };
  };
  statusCode: number;
}

// Interface cho API mới: /health/get-summary-overview/:patientId
export interface SummaryOverviewResponse {
  data: {
    overviewDateRange: {
      startDate: string;
      endDate: string;
      period: "day" | "week" | "month";
    };
    heartRate: {
      avgValue: number | null;
      minValue: number | null;
      maxValue: number | null;
      data: Array<HeartRateData>;
    };
    sleep: {
      avgSleepTime: number | null;
      avgDeepSleep: number | null;
      avgLightSleep: number | null;
      avgREM: number | null;
      avgWakeupCount: number | null;
      data: Array<SleepRecord>;
    };
    spo2: {
      avgValue: number | null;
      minValue: number | null;
      maxValue: number | null;
      data: Array<SpO2Data>;
    };
    sport: {
      totalSteps: number;
      totalCalories: number;
      avgStepsPerDay: number;
      avgCaloriesPerDay: number;
      data: Array<SportData>;
    };
    bloodPressure: {
      avgSbp: number | null;
      avgDbp: number | null;
      minSbp: number | null;
      maxSbp: number | null;
      minDbp: number | null;
      maxDbp: number | null;
      data: Array<BloodPressureData>;
    };
    otherData: {
      avgHrvValue: number | null;
      avgCvrValue: number | null;
      avgRespiratoryRateValue: number | null;
      data: Array<OtherHealthData>;
    };
    userInfo: {
      id: string;
      phoneNumber: string;
      fullName: string;
      role: string;
      status: string;
      majorDoctor: string;
    };
  };
  statusCode: number;
}

// Các interface hỗ trợ cho SummaryOverviewResponse
interface HeartRateData {
  id?: string;
  userId?: string;
  value: number;
  date: string;
  type?: string;
  min?: number;
  max?: number;
  types?: string[];
  dateKey?: string;
}

interface BloodPressureData {
  id?: string;
  userId?: string;
  type?: string;
  sbp: number;
  dbp: number;
  date: string;
  minSbp?: number;
  maxSbp?: number;
  minDbp?: number;
  maxDbp?: number;
  dateKey?: string;
}

interface SpO2Data {
  id?: string;
  userId?: string;
  value: number;
  date: string;
  type?: string;
  dateKey?: string;
}

interface SportData {
  id?: string;
  userId?: string;
  date: string;
  totalDistance: number;
  totalStep: number;
  totalCalories: number;
}

interface OtherHealthData {
  id?: string;
  userId?: string;
  date: string;
  hrvValueAvg: number;
  cvrValueAvg: number;
  respiratoryRateValueAvg: number;
}

export interface HeartRateRecord {
  id: string;
  userId: string;
  value: number;
  date: string;
  type: string;
}

export interface HeartRateResponse {
  data: {
    heartRateRecord: HeartRateRecord[];
    dateRangeQuery: {
      startDate: string;
      endDate: string;
      period: "day" | "week" | "month";
    };
  };
  statusCode: number;
}

export interface HealthOverviewParams {
  date: string; // YYYY-MM-DD or MM/DD/YYYY
  period: "day" | "week" | "month";
  patientId?: string; // ID của bệnh nhân (optional)
}

export interface SleepRecord {
  id: string;
  userId: string;
  date: string;
  wakeupCount: number | null;
  startDate: string;
  endDate: string;
  totalDeepSleep: number; // minutes
  totalLightSleep: number; // minutes
  totalREM: number; // minutes
  totalSleepTime: number; // minutes
}

export interface SleepResponse {
  data: {
    sleepRecord: SleepRecord[];
    dateRangeQuery: {
      startDate: string;
      endDate: string;
      period: "day" | "week" | "month";
    };
  };
  statusCode: number;
}

export interface SpO2Record {
  id: string;
  userId: string;
  value: number;
  date: string;
}

export interface SpO2Response {
  data: {
    spo2Record: SpO2Record[];
    dateRangeQuery: {
      startDate: string;
      endDate: string;
      period: "day" | "week" | "month";
    };
  };
  statusCode: number;
}
