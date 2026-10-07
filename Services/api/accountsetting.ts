import api from "../Interceptor/api";

export interface UpdateContactData {
  email?: string;
  phone?: string;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

export interface AccountManagementData {
  action: "deactivate" | "delete";
}

export const updateContactDetails = async (payload: UpdateContactData) => {
  const response = await api.put("/api/auth/update-contact", payload);
  return response.data;
};

export const changePassword = async (payload: ChangePasswordData) => {
  const response = await api.put("/api/auth/change-password", payload);
  return response.data;
};

export const manageAccount = async (payload: AccountManagementData) => {
  const response = await api.post("/api/auth/account-management", payload);
  return response.data;
};
