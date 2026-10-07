import api from '../Interceptor/api';

interface QueryParams {
  page?: number;
  limit?: number;
}

interface ActionData {
  interestId: string;
}

interface HandleInterestData {
  targetId: string;
  action: 'accept' | 'reject';
}

export const handleInterest = async (data: HandleInterestData): Promise<any> => {
  const response = await api.post('/api/match/handle-interest', data);
  return response.data;
};

export const getReceivedInterests = async (params?: QueryParams): Promise<any> => {
  const response = await api.get('/api/match/received-interests', { params });
  return response.data;
};

export const acceptInterest = async (data: ActionData): Promise<any> => {
  const response = await api.post('/api/match/accept-interest', data);
  return response.data;
};

export const rejectInterest = async (data: ActionData): Promise<any> => {
  const response = await api.post('/api/match/reject-interest', data);
  return response.data;
};

// 1. Sent Interests API (Ye pehle se tha, par yaha check karlo)
export const getSentInterests = async (params?: QueryParams): Promise<any> => {
  const response = await api.get('/api/match/sent-interests', { params });
  return response.data;
};

// 2. Accepted Interests API (Naya function)
export const getAcceptedInterests = async (params?: QueryParams): Promise<any> => {
  const response = await api.get('/api/match/accepted-interests', { params });
  return response.data;
};