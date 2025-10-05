'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function TheoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="theory-loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="theory-container">
      {!isAuthenticated() && (
        <div className="auth-notice">
          <div className="auth-notice__content">
            <h3>🎵 想要完整體驗音樂理論學習？</h3>
            <p>登入後可以保存學習進度、參與討論，享受更多功能！</p>
            <Link href="/account" className="auth-notice__btn">
              立即登入
            </Link>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-[16rem_1fr] min-h-screen">
        {/* Sidebar Navigation */}
        <nav className="bg-gray-800 text-white h-screen w-64 left-0 top-0 flex flex-col">
          <ul className="flex-grow">
            <li className="p-4 font-bold">
              <Link href="/theory">Notations</Link>
            </li>
            <li className="p-4 font-bold">
              <Link href="/theory/scales">Scales</Link>
            </li>
          </ul>
        </nav>

        {/* Content Area */}
        <div className="theory-content">
          {children}
        </div>
      </div>
    </div>
  );
}