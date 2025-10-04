'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '@/types';
import { getUserData } from '@/services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    const initializeAuth = async (): Promise<void> => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUsername = localStorage.getItem('username');
        
        console.log('🔍 初始化認證狀態:', {
          hasToken: !!storedToken,
          tokenLength: storedToken ? storedToken.length : 0,
          tokenPreview: storedToken ? storedToken.substring(0, 20) + '...' + storedToken.substring(storedToken.length - 10) : 'none',
          hasUsername: !!storedUsername,
          username: storedUsername
        });
        
        if (storedToken && storedUsername) {
          const tokenParts = storedToken.split('.');
          if (tokenParts.length !== 3) {
            console.error('❌ 存儲的 token 格式錯誤:', {
              parts: tokenParts.length,
              token: storedToken.substring(0, 50) + '...'
            });
            logout();
            return;
          }
          
          setToken(storedToken);
          setUser({ username: storedUsername, id: '' });
          
          console.log('🔐 嘗試驗證存儲的 token...');
          
          try {
            const response = await getUserData();
            if (response && response.data) {
              console.log('✅ Token 驗證成功，用戶資料已載入:', {
                userId: response.data.id,
                username: response.data.username
              });
              setUser(response.data);
            }
          } catch (error: any) {
            console.error('❌ Token 驗證失敗:', {
              error: error.message,
              status: error.response?.status,
              data: error.response?.data
            });
            
            if (error.response?.status === 401 || error.response?.status === 403) {
              console.log('🚪 認證失敗，執行登出');
              logout();
            } else if (error.code === 'ERR_NETWORK' || !error.response) {
              console.log('⚠️ 網路錯誤或伺服器不可達，保持登入狀態');
            } else {
              console.log('⚠️ 其他錯誤，保持登入狀態:', error.response?.status);
            }
          }
        } else {
          console.log('ℹ️ 未找到儲存的認證資訊');
        }
      } catch (error) {
        console.error('❌ 認證初始化錯誤:', error);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  const login = async (userData: User, authToken: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🔐 執行登入:', { 
        username: userData.username,
        tokenLength: authToken ? authToken.length : 0,
        tokenPreview: authToken ? authToken.substring(0, 20) + '...' + authToken.substring(authToken.length - 10) : 'none'
      });
      
      if (authToken) {
        const tokenParts = authToken.split('.');
        if (tokenParts.length !== 3) {
          console.error('❌ 接收到的 token 格式錯誤:', {
            parts: tokenParts.length,
            token: authToken.substring(0, 50) + '...'
          });
          return { success: false, error: 'Invalid token format' };
        }
        
        console.log('✅ Token 格式檢查通過:', {
          headerLength: tokenParts[0].length,
          payloadLength: tokenParts[1].length,
          signatureLength: tokenParts[2].length
        });
      }
      
      localStorage.setItem('token', authToken);
      localStorage.setItem('username', userData.username);
      
      console.log('💾 Token 已保存到 localStorage');
      
      setToken(authToken);
      setUser(userData);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const savedToken = localStorage.getItem('token');
      if (savedToken !== authToken) {
        console.error('❌ Token 保存失敗或被修改:', {
          original: authToken.substring(0, 20) + '...',
          saved: savedToken ? savedToken.substring(0, 20) + '...' : 'null'
        });
        return { success: false, error: 'Token storage failed' };
      }
      
      console.log('✅ Token 保存驗證成功');
      
      try {
        console.log('📡 嘗試獲取完整用戶資料...');
        const response = await getUserData();
        if (response && response.data) {
          console.log('✅ 完整用戶資料獲取成功:', response.data);
          setUser(response.data);
        }
      } catch (error: any) {
        console.error('❌ 登入後獲取用戶資料失敗:', {
          error: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
      }
      
      console.log('✅ 登入流程完成');
      return { success: true };
    } catch (error) {
      console.error('❌ 登入錯誤:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = (): void => {
    console.log('🚪 執行登出');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = (): boolean => {
    const result = !!(token && user);
    console.log('🔍 檢查認證狀態:', {
      hasToken: !!token,
      hasUser: !!user,
      isAuthenticated: result
    });
    return result;
  };

  const getAuthHeader = (): { Authorization?: string } => {
    const header = token ? { Authorization: `Bearer ${token}` } : {};
    console.log('🎫 獲取認證標頭:', {
      hasToken: !!token,
      headerKeys: Object.keys(header)
    });
    return header;
  };

  const updateUser = (newUserData: Partial<User>): void => {
    console.log('📝 更新用戶資料:', newUserData);
    setUser(prevUser => prevUser ? { ...prevUser, ...newUserData } : null);
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    initialized,
    login,
    logout,
    isAuthenticated,
    getAuthHeader,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// HOC for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) {
      return (
        <div className="auth-loading">
          <div className="loading-spinner"></div>
          <p>驗證身份中...</p>
        </div>
      );
    }
    
    if (!isAuthenticated()) {
      return (
        <div className="auth-required">
          <h2>需要登入</h2>
          <p>請先登入以訪問此頁面。</p>
          <a href="/account">前往登入</a>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
}