export interface User {
  id: string;
  username: string;
  email?: string;
  createdAt?: string;
  role?: string;
  bio?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  initialized: boolean;
  login: (userData: User, authToken: string) => Promise<{ success: boolean; error?: any }>;
  logout: () => void;
  isAuthenticated: () => boolean;
  getAuthHeader: () => { Authorization?: string };
  updateUser: (newUserData: Partial<User>) => void;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ForumTopic {
  _id: string;
  title: string;
  content: string;
  date: string;
  topic?: string; // 舊格式兼容
}

export interface ForumComment {
  _id: string;
  username: string;
  text: string;
  topicId: string;
  createdAt: string;
}