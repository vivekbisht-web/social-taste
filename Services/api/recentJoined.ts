import api from '../Interceptor/api';

interface RishteyData {
  id: string;
  name: string;
  age: number;
}

export const getRecentJoins = async (): Promise<any> => {
  try {
    const response = await api.get('/api/match/recent-joins');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getRishteyOfTheDay = async (): Promise<RishteyData[]> => {
  try {
    const response = await api.get('/api/match/rishtey-of-the-day');
    return response.data;
  } catch (error) {
    throw error;
  }
};