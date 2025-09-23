// Mocked statistics API for FE-only flow

export interface StatisticsOverview {
  todayRevenue: number;
  monthlyRevenue: number;
  todayMeetings: number;
  totalDoctors: number;
  totalPatients: number;
  monthlyOrders: number;
}

export interface StatisticsResponse {
  data: StatisticsOverview;
  statusCode: number;
}

export const statisticsApi = {
  getOverview: async (): Promise<StatisticsResponse> => {
    return Promise.resolve({
      data: {
        todayRevenue: 1500000,
        monthlyRevenue: 45000000,
        todayMeetings: 5,
        totalDoctors: 12,
        totalPatients: 240,
        monthlyOrders: 120,
      },
      statusCode: 200,
    });
  },
}; 