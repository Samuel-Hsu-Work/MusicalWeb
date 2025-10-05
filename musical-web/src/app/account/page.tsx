// ==========================================
// 7. Account Page
// src/app/account/page.tsx
// ==========================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { loginUser, registerUser, handleApiError } from '@/lib/api';
import styles from './account.module.css';

export default function AccountPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // 登入
        const response = await loginUser({
          username: formData.username,
          password: formData.password
        });

        if (response.data.success && response.data.data) {
          await login(response.data.data.user, response.data.data.token);
          router.push('/');
        }
      } else {
        // 註冊
        const response = await registerUser({
          username: formData.username,
          password: formData.password,
          email: formData.email
        });

        if (response.data.success) {
          setError('註冊成功！請登入');
          setIsLogin(true);
          setFormData({ username: '', password: '', email: '' });
        }
      }
    } catch (err: any) {
      console.error('錯誤:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated()) {
    router.push('/');
    return null;
  }

  return (
    <>
      <Navbar />
      <main className={styles.container}>
        <div className={styles.formWrapper}>
          <h1>{isLogin ? '登入' : '註冊'}</h1>
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label>用戶名</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                minLength={3}
                disabled={loading}
              />
            </div>

            {!isLogin && (
              <div className={styles.formGroup}>
                <label>電子郵件 (選填)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={loading}
                />
              </div>
            )}

            <div className={styles.formGroup}>
              <label>密碼</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                disabled={loading}
              />
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? '處理中...' : (isLogin ? '登入' : '註冊')}
            </button>
          </form>

          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFormData({ username: '', password: '', email: '' });
            }}
            className={styles.toggleBtn}
          >
            {isLogin ? '還沒有帳號？註冊' : '已有帳號？登入'}
          </button>
        </div>
      </main>
    </>
  );
}
