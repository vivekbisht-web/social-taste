import api from "../Interceptor/api";

export interface LoginActivity {
  _id: string;
  deviceName: string;
  os: string;
  location: string;
  ip: string;
  time: string;
  isCurrentDevice: boolean;
}

export const getMyLoginActivities = async (): Promise<LoginActivity[]> => {
  try {
    const response = await api.get("/api/activity/my-logins");
    return response.data;
  } catch (error) {
    throw error;
  }
};
