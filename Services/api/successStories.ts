import api from "../Interceptor/api";

interface SuccessStory {
  _id: string;
  partnerName: string;
  image: string;
  description: string;
  storyDate?: string;
}

interface SuccessStoriesParams {
  page?: number;
  limit?: number;
}

interface SuccessStoriesResponse {
  success: boolean;
  data: SuccessStory[];
  totalCount: number;
}

export const getSuccessStories = async (
  params?: SuccessStoriesParams,
): Promise<SuccessStoriesResponse> => {
  const response = await api.get("/api/success-stories", { params });
  return response.data;
};
