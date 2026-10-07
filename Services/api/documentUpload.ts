import api from "../Interceptor/api";

export interface VerificationResponse {
  message: string;
  verification: {
    selfieStatus: string;
    govtIdStatus: string;
    trustScore: number;
    selfieUrl: string;
    govtIdUrl: string;
  };
}

export const uploadVerificationDocuments = async (
  userId: string,
  selfie: File,
  govtId: File,
): Promise<VerificationResponse> => {
  const formData = new FormData();
  formData.append("selfie", selfie);
  formData.append("govtId", govtId);

  const { data } = await api.post<VerificationResponse>(
    `/api/verification/upload/${userId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return data;
};

export const getVerificationStatus = async (
  id: string,
): Promise<VerificationResponse> => {
  try {
    const response = await api.get(`/api/verification/status/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
