import { api } from './client';

export interface ReportData {
  title: string;
  data: { label: string; value: number }[];
  columns: string[];
  colors?: string[];
}

export const reportsAdapter = {
  async getReport(type: string, timeFrame: string = 'all-time'): Promise<ReportData> {
    return api.get<ReportData>(`/reports?type=${type}&timeFrame=${timeFrame}`);
  },

  async exportReport(
    type: string,
    format: string = 'json',
    timeFrame: string = 'all-time'
  ): Promise<Response | ReportData> {
    return api.get(`/reports/export?type=${type}&format=${format}&timeFrame=${timeFrame}`);
  }
};
