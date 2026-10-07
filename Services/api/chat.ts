import api from "../Interceptor/api";

export interface ChatListItem {
  isOnline: boolean;
  _id: string;
  name: string;
  primaryPhoto: string;
  lastSeen: string;
}

export const getChatList = async (): Promise<ChatListItem[]> => {
  const response = await api.get("/api/chat/list");
  return response.data;
};

export const sendMessage = async (receiverId: string, message: string) => {
  const response = await api.post("/api/chat/send", {
    receiverId,
    message,
  });
  return response.data;
};

export const getChatMessages = async (id: string) => {
  const response = await api.get(`/api/chat/${id}`);
  return response.data;
};

export const blockUser = async (userId: string) => {
  const response = await api.put(`/api/users/block/${userId}`);
  return response.data;
};

export const unblockUser = async (userId: string) => {
  const response = await api.put(`/api/users/unblock/${userId}`);
  return response.data;
};
