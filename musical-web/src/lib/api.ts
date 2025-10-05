import axios, { AxiosInstance, AxiosError } from 'axios';

const LOCAL_API = "http://localhost:5000";
const PRODUCTION_API = "https://musichub-2537.onrender.com";

let currentBaseURL: string | null = null;
let isChecking = false;
let checkPromise: Promise<string> | null = null;

const getBestBaseURL = async (): Promise<string> => {
  if (isChecking && checkPromise) {
    return checkPromise;
  }
  
  if (currentBaseURL && process.env.NODE_ENV === 'production') {
    return currentBaseURL;
  }
  
  isChecking = true;
  
  checkPromise = (async () => {
    try {
      const isLocalDev = 
        process.env.NODE_ENV === 'development' ||
        (typeof window !== 'undefined' && (
          window.location.hostname === 'localhost' || 
          window.location.hostname === '127.0.0.1'
        ));
      
      if (isLocalDev) {
        console.log('🏠 開發環境，使用本地後端');
        currentBaseURL = LOCAL_API;
        return currentBaseURL;
      }
      
      console.log('🌐 生產環境，使用生產服務器');
      currentBaseURL = PRODUCTION_API;
      return currentBaseURL;
    } finally {
      isChecking = false;
    }
  })();
  
  return checkPromise;
};

class SmartAPI {
  private instance: AxiosInstance | null = null;
  private initialized = false;
  
  async getAxiosInstance(): Promise<AxiosInstance> {
    if (!this.initialized) {
      const baseURL = await getBestBaseURL();
      
      this.instance = axios.create({
        baseURL,
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      // Request interceptor
      this.instance.interceptors.request.use((req) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('token');
          if (token) {
            req.headers.Authorization = `Bearer ${token}`;
            console.log('🎫 Token 添加到請求');
          }
        }
        
        console.log(`🚀 API Request: ${req.method?.toUpperCase()} ${req.baseURL}${req.url}`);
        return req;
      });
      
      // Response interceptor
      this.instance.interceptors.response.use(
        (response) => {
          console.log(`✅ API Success: ${response.config.method?.toUpperCase()} ${response.config.url}`);
          console.log('📄 Response Data:', response.data);
          return response;
        },
        async (error: AxiosError) => {
          console.error('❌ API Error:', {
            url: error.config?.url,
            method: error.config?.method?.toUpperCase(),
            status: error.response?.status,
            message: error.message,
            responseData: error.response?.data
          });
          
          // 網絡錯誤時的智能回退
          if (
            (error.code === 'ERR_NETWORK' || 
             error.code === 'ECONNREFUSED' || 
             error.code === 'ECONNABORTED') &&
            currentBaseURL === LOCAL_API &&
            !(error.config as any)?._retry
          ) {
            console.log('🔄 本地後端連接失敗，嘗試回退到生產服務器');
            
            (error.config as any)._retry = true;
            currentBaseURL = PRODUCTION_API;
            
            this.instance = axios.create({
              baseURL: currentBaseURL,
              timeout: 15000,
              headers: {
                'Content-Type': 'application/json',
              }
            });
            
            if (typeof window !== 'undefined') {
              const token = localStorage.getItem('token');
              if (token && error.config) {
                error.config.headers.Authorization = `Bearer ${token}`;
              }
            }
            
            return this.instance!.request(error.config!);
          }
          
          return Promise.reject(error);
        }
      );
      
      this.initialized = true;
    }
    
    return this.instance!;
  }
  
  reset() {
    this.initialized = false;
    this.instance = null;
    currentBaseURL = null;
    isChecking = false;
    checkPromise = null;
    console.log('🔄 API 連接已重置');
  }
}

const smartAPI = new SmartAPI();

const makeRequest = async <T>(requestFn: (api: AxiosInstance) => Promise<T>): Promise<T> => {
  const api = await smartAPI.getAxiosInstance();
  return requestFn(api);
};

// API 方法
export const registerUser = (data: { username: string; password: string; email?: string }) => 
  makeRequest(api => api.post<ApiResponse<{ message: string; user: User }>>('/api/auth/register', data));

export const loginUser = (data: { username: string; password: string }) => 
  makeRequest(api => api.post<ApiResponse<LoginResponse>>('/api/auth/login', data));

export const getUserData = () => makeRequest(async (api) => {
  try {
    const response = await api.get<ApiResponse<User>>('/api/auth/profile');
    
    console.log('📡 getUserData 原始響應:', response.data);
    
    if (response.data && response.data.success && response.data.data) {
      console.log('✅ getUserData 解析成功:', response.data.data);
      
      return {
        ...response,
        data: response.data.data
      };
    } else {
      console.error('❌ getUserData 響應格式錯誤:', response.data);
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('❌ getUserData 錯誤:', error);
    throw error;
  }
});

export const verifyToken = () => 
  makeRequest(api => api.get<ApiResponse<{ valid: boolean; user: User }>>('/api/auth/verify'));

export const getForumTopic = () => 
  makeRequest(api => api.get<{ data: ForumTopic }>('/api/forum/topic'));

export const getForumPastTopics = () => 
  makeRequest(api => api.get<{ data: ForumTopic[] }>('/api/forum/past-topics'));

export const getForumComments = (topicId: string) => 
  makeRequest(api => api.get<ForumComment[]>('/api/forum/comments', { params: { topicId } }));

export const postForumComment = (data: { username: string; text: string; topicId: string }) => 
  makeRequest(api => api.post<ForumComment>('/api/forum/comments', data));

export const getCurrentAPIStatus = () => ({
  baseURL: currentBaseURL,
  isLocal: currentBaseURL === LOCAL_API,
  isProduction: currentBaseURL === PRODUCTION_API,
  environment: process.env.NODE_ENV
});

export const resetAPIConnection = () => {
  smartAPI.reset();
};

export const handleApiError = (error: any): string => {
  let errorMessage = '發生未知錯誤';
  
  if (error.response) {
    const status = error.response.status;
    const responseData = error.response.data;
    
    switch (status) {
      case 400:
        errorMessage = `請求無效: ${responseData.message || responseData.error || '參數錯誤'}`;
        break;
      case 401:
        errorMessage = '未授權: 請重新登入';
        break;
      case 403:
        errorMessage = '禁止訪問: 您沒有權限執行此操作';
        break;
      case 404:
        errorMessage = '找不到資源: API 端點不存在';
        break;
      case 500:
        errorMessage = '伺服器錯誤: 請稍後再試';
        break;
      default:
        errorMessage = `錯誤 (${status}): ${responseData.message || responseData.error || '請求失敗'}`;
    }
  } else if (error.request) {
    errorMessage = '伺服器未響應: 請檢查網絡連接';
  } else if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
    errorMessage = '無法連接到服務器: 請確認服務器是否運行';
  } else {
    errorMessage = `請求錯誤: ${error.message}`;
  }
  
  return errorMessage;
};

console.log('🔧 Smart API 已初始化');