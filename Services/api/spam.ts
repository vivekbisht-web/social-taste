import api from '../Interceptor/api';

export interface SpamReportData {
  targetId: string;
  reason: string;
}

export const reportSpam = async (payload: SpamReportData): Promise<any> => {
  try {
    const response = await api.post('/api/spam/report', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};