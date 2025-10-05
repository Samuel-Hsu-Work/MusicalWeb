'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import PersonaChat from './components/Persona';

export default function TheoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, loading } = useAuth();
  const [showPersonaChat, setShowPersonaChat] = useState(false);

  // 如果還在加載認證狀態
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
      {/* 如果用戶未登入，顯示提示訊息 */}
      {!isAuthenticated() && (
        <div className="auth-notice">
          <div className="auth-notice__content">
            <h3>🎵 想要完整體驗音樂理論學習？</h3>
            <p>登入後可以保存學習進度、參與討論，享受更多功能！</p>
            <Link href="/MyAccount" className="auth-notice__btn">
              立即登入
            </Link>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-[16rem_1fr] min-h-screen">
        {/* Navbar */}
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
        <div className="theory-content relative">
          {/* 右上角的 Voice Coach 按鈕 */}
          {isAuthenticated() && (
            <button
              onClick={() => setShowPersonaChat(true)}
              className="fixed top-4 right-4 z-40 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-medium shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              Start Voice Coach
            </button>
          )}
          
          {/* 子頁面內容 */}
          {children}
        </div>
      </div>
      
      {/* PersonaChat 浮層模態框 */}
      {isAuthenticated() && showPersonaChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 遮罩層 */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setShowPersonaChat(false)}
          />
          
          {/* 模態框容器 */}
          <div className="relative bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] mx-4 overflow-hidden">
            {/* 模態框頭部 */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-800">🎵 AI Voice Coach</h2>
              <button
                onClick={() => setShowPersonaChat(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* PersonaChat 組件容器 */}
            <div className="overflow-y-auto max-h-[calc(90vh-5rem)]">
              <PersonaChat />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}