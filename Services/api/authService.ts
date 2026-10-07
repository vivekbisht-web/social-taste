import { Platform } from "react-native";
import api from "../Interceptor/api";

export const registerUser = async (userData: any): Promise<any> => {
  const formData = new FormData();
  const keyMapping: Record<string, string> = {
    edu: "education",
    job: "occupation",
    income: "annualIncome",
    eating: "eatingHabits",
  };

  Object.keys(userData).forEach((key) => {
    const apiKey = keyMapping[key] || key;
    const value = userData[key];
    if (value === null || value === undefined) return;

    if (apiKey === "additionalPhotos" && Array.isArray(value)) {
      value.forEach((file: any, index: number) => {
        if (file?.uri) {
          formData.append("additionalPhotos", {
            uri:
              Platform.OS === "ios"
                ? file.uri.replace("file://", "")
                : file.uri,
            name: file.fileName || `photo_${index}_${Date.now()}.jpg`,
            type: file.mimeType || "image/jpeg",
          } as any);
        }
      });
    } else if (apiKey === "primaryPhoto" && value?.uri) {
      formData.append("primaryPhoto", {
        uri:
          Platform.OS === "ios" ? value.uri.replace("file://", "") : value.uri,
        name: value.fileName || `primary_${Date.now()}.jpg`,
        type: value.mimeType || "image/jpeg",
      } as any);
    } else {
      formData.append(apiKey, String(value));
    }
  });

  try {
    const response = await api.post("/api/auth/user/register", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      transformRequest: (data) => data,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (credentials: {
  emailOrPhone: string;
  password: string;
}): Promise<any> => {
  try {
    const response = await api.post("/api/auth/login", credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserDetails = async (userId: string): Promise<any> => {
  try {
    const response = await api.get(`/api/auth/user/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUserProfile = async (
  userId: string,
  updateData: any,
): Promise<any> => {
  const formData = new FormData();

  Object.keys(updateData).forEach((key) => {
    const value = updateData[key];
    if (value === undefined || value === null) return;

    if (key === "primaryPhoto") {
      if (typeof value === "string") {
        formData.append("primaryPhoto", value);
      } else if (value?.uri) {
        formData.append("primaryPhoto", {
          uri:
            Platform.OS === "android"
              ? value.uri
              : value.uri.replace("file://", ""),
          name: value.name || `primary_${Date.now()}.jpg`,
          type: value.type || "image/jpeg",
        } as any);
      }
    } else if (key === "additionalPhotos" && Array.isArray(value)) {
      value.forEach((item: any, index: number) => {
        if (typeof item === "string") {
          formData.append("additionalPhotos", item);
        } else if (item?.uri) {
          formData.append("additionalPhotos", {
            uri:
              Platform.OS === "android"
                ? item.uri
                : item.uri.replace("file://", ""),
            name: item.name || `additional_${index}_${Date.now()}.jpg`,
            type: item.type || "image/jpeg",
          } as any);
        }
      });
    } else {
      formData.append(key, String(value));
    }
  });

  try {
    const response = await api.put(`/api/auth/user/${userId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      // Important: React Native mein transformRequest aksar FormData ko kharab kar deta hai
      // Agar error aaye toh 'transformRequest' wali line hata kar dekhein
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
