import api from '../Interceptor/api';

interface RecommendationParams {
  page?: number;
  limit?: number;
}

interface SendInterestData {
  targetId: string;
}

// Interface for Filter Payload
interface FilterPayload {
  religion: string;
  caste: string;
  city: string;
  minAge: string;
  maxAge: string;
  minIncome: string;
}

export const getMatchRecommendations = async (params?: RecommendationParams): Promise<any> => {
  const response = await api.get('/api/match/recommendations', { params });
  return response.data;
};

export const sendMatchInterest = async (data: SendInterestData): Promise<any> => {
  const response = await api.post('/api/match/send-interest', data);
  return response.data;
};

export const getBestMatch = async (): Promise<any> => {
  const response = await api.get('/api/match/best-match');
  return response.data;
};

export const getMatchFilters = async (): Promise<any> => {
  const response = await api.get('/api/match/get-filters');
  return response.data;
};

// 1. Filter Apply karne ki API (POST)
export const applyMatchFilters = async (data: FilterPayload): Promise<any> => {
  const response = await api.post('/api/match/apply-filters', data);
  return response.data;
};


export const getFilteredResults = async (): Promise<any> => {
  const response = await api.get('/api/match/filtered-results');
  return response.data;
};

