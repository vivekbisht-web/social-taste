import api from "../Interceptor/api";

export interface AcceptanceNotification {
  _id: string;
  name: string;
  gender: string;
  dob: string;
  city: string;
  primaryPhoto: string;
  occupation: string;
  religion: string;
  annualIncome: string;
  createdAt?: string;
}

export interface AcceptanceResponse {
  success: boolean;
  count: number;
  notifications: AcceptanceNotification[];
}

export interface ChatNotification {
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  senderId: string;
  senderName: string;
  senderPhoto: string;
}

export const getAcceptanceNotifications =
  async (): Promise<AcceptanceResponse> => {
    const response = await api.get("/api/match/notifications/acceptances");
    return response.data;
  };

export const getChatNotifications = async (): Promise<ChatNotification[]> => {
  const response = await api.get("/api/chat/notifications");
  return response.data;
};

export const clearChatNotifications = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  const response = await api.put("/api/chat/clear-notifications");
  return response.data;
};
