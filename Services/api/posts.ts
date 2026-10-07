import api from "../Interceptor/api";

export interface PostUser {
  _id: string;
  name: string;
  email: string;
  primaryPhoto: string;
}

export interface PostComment {
  _id: string;
  user: string;
  text: string;
  createdAt: string;
}

export interface PostItem {
  _id: string;
  caption: string;
  location: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  likes: string[];
  dislikes: string[];
  comments: PostComment[];
  user: PostUser;
}

export interface GetPostsResponse {
  success: boolean;
  count: number;
  data: PostItem[];
}

export interface CreatePostResponse {
  success: boolean;
  data: PostItem;
}

export interface DeletePostResponse {
  success: boolean;
  message: string;
}

export interface ReactPostResponse {
  success: boolean;
  message: string;
  data: PostItem;
}

export interface CommentPostResponse {
  success: boolean;
  message?: string;
  data: PostItem;
}

export interface CreatePostPayload {
  caption: string;
  location: string;
  images: File[];
}

export interface ReactPostPayload {
  action: "like" | "dislike";
}

export interface CommentPostPayload {
  text: string;
}

export const getMyPosts = async (): Promise<GetPostsResponse> => {
  const response = await api.get("/api/post/get-my-posts");

  return response.data;
};

export const getPosts = async (): Promise<GetPostsResponse> => {
  const response = await api.get("/api/post/get-posts");

  return response.data;
};

export const createPost = async (
  payload: CreatePostPayload,
): Promise<CreatePostResponse> => {
  const formData = new FormData();

  formData.append("caption", payload.caption);
  formData.append("location", payload.location);

  payload.images.forEach((image) => {
    formData.append("images", image);
  });

  const response = await api.post("/api/post/create-post", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const deletePost = async (
  postId: string,
): Promise<DeletePostResponse> => {
  const response = await api.delete(`/api/post/delete-post/${postId}`);

  return response.data;
};

export const reactToPost = async (
  postId: string,
  payload: ReactPostPayload,
): Promise<ReactPostResponse> => {
  const response = await api.put(`/api/post/react/${postId}`, payload);

  return response.data;
};

export const commentOnPost = async (
  postId: string,
  payload: CommentPostPayload,
): Promise<CommentPostResponse> => {
  const response = await api.post(`/api/post/comment/${postId}`, payload);

  return response.data;
};
