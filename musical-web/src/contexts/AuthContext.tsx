// ==========================================
// 3. AuthContext (客戶端組件)
// src/contexts/AuthContext.tsx
// ==========================================

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserData } from '../lib/api';
import type { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUsername = localStorage.getItem('username');
        
        console.log('🔍 初始化認證狀態:', {
          hasToken: !!storedToken,
          tokenLength: storedToken ? storedToken.length : 0,
          hasUsername: !!storedUsername,
          username: storedUsername
        });
        
        if (storedToken && storedUsername) {
          const tokenParts = storedToken.split('.');
          if (tokenParts.length !== 3) {
            console.error('❌ 存儲的 token 格式錯誤');
            logout();
            return;
          }
          
          setToken(storedToken);
          setUser({ id: '', username: storedUsername });
          
          console.log('🔐 嘗試驗證存儲的 token...');
          
          try {
            const response = await getUserData();
            if (response && response.data) {
              console.log('✅ Token 驗證成功，用戶資料已載入');
              setUser(response.data);
            }
          } catch (error: any) {
            console.error('❌ Token 驗證失敗:', error);
            
            if (error.response?.status === 401 || error.response?.status === 403) {
              console.log('🚪 認證失敗，執行登出');
              logout();
            } else if (error.code === 'ERR_NETWORK' || !error.response) {
              console.log('⚠️ 網絡錯誤，保持登錄狀態');
            }
          }
        } else {
          console.log('ℹ️ 未找到儲存的認證信息');
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

  const login = async (userData: User, authToken: string) => {
    try {
      console.log('🔐 執行登入:', { username: userData.username });
      
      if (authToken) {
        const tokenParts = authToken.split('.');
        if (tokenParts.length !== 3) {
          console.error('❌ Token 格式錯誤');
          return { success: false, error: 'Invalid token format' };
        }
      }
      
      localStorage.setItem('token', authToken);
      localStorage.setItem('username', userData.username);
      
      console.log('💾 Token 已保存到 localStorage');
      
      setToken(authToken);
      setUser(userData);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const savedToken = localStorage.getItem('token');
      if (savedToken !== authToken) {
        console.error('❌ Token 保存失敗');
        return { success: false, error: 'Token storage failed' };
      }
      
      try {
        const response = await getUserData();
        if (response && response.data) {
          console.log('✅ 完整用戶資料獲取成功');
          setUser(response.data);
        }
      } catch (error) {
        console.error('❌ 獲取用戶資料失敗:', error);
      }
      
      console.log('✅ 登入流程完成');
      return { success: true };
    } catch (error) {
      console.error('❌ 登入錯誤:', error);
      return { success: false, error };
    }
  };

  const logout = () => {
    console.log('🚪 執行登出');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = () => {
    const result = !!(token && user);
    console.log('🔍 檢查認證狀態:', { hasToken: !!token, hasUser: !!user, isAuthenticated: result });
    return result;
  };

  const getAuthHeader = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const updateUser = (newUserData: Partial<User>) => {
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