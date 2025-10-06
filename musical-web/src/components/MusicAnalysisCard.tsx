'use client';

import React, { useState } from 'react';
import styles from './MusicAnalysisCard.module.css';

const MusicAnalysisCard: React.FC = () => {
  const [songInput, setSongInput] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const analyzeSong = async () => {
    if (!songInput.trim()) return;
    
    setIsLoading(true);
    setHasAnalyzed(false);
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "你是一位很酷的音樂理論老師,會用有趣的方式分析音樂。請分析用戶提到的歌曲,並:1)指出該曲子的關鍵音樂特色(如調性、節拍、和弦進行、曲式結構等)2)用具體的技術細節說明為什麼這首歌好聽(例如:藍調的12小節結構、流行歌的I-V-vi-IV進行、搖滾的power chord等)3)建議學習哪些樂理知識能讓用戶更懂這類音樂,並暗示用戶可能對什麼風格有偏好。語調要輕鬆但專業,像在跟朋友聊音樂。用繁體中文,200字內。"
            },
            {
              role: "user",
              content: `請分析這首歌曲:${songInput}`
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      setAnalysis(data.choices[0].message.content);
      setHasAnalyzed(true);
    } catch (error) {
      console.error('Error:', error);
      setAnalysis('抱歉,分析過程中發生錯誤。請稍後再試。');
      setHasAnalyzed(true);
    }
    
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      analyzeSong();
    }
  };

  const resetCard = () => {
    setSongInput('');
    setAnalysis('');
    setHasAnalyzed(false);
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3>🎵 音樂理論探索器</h3>
        <p>輸入你喜歡的歌曲,讓 AI 告訴你可以學習哪些樂理知識!</p>
      </div>
      
      <div className={styles.cardContent}>
        {!hasAnalyzed ? (
          <div className={styles.inputSection}>
            <div className={styles.inputGroup}>
              <input
                type="text"
                value={songInput}
                onChange={(e) => setSongInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="例如:Fly Me to the Moon、Smells Like Teen Spirit、茉莉花..."
                className={styles.songInput}
                disabled={isLoading}
              />
              <button 
                onClick={analyzeSong}
                disabled={isLoading || !songInput.trim()}
                className={styles.analyzeButton}
              >
                {isLoading ? (
                  <div className={styles.loadingSpinner}></div>
                ) : (
                  '分析'
                )}
              </button>
            </div>
            <div className={styles.suggestions}>
              <span>試試看:</span>
              <button onClick={() => setSongInput('Fly Me to the Moon')}>Fly Me to the Moon</button>
              <button onClick={() => setSongInput('Smells Like Teen Spirit')}>Smells Like Teen Spirit</button>
              <button onClick={() => setSongInput('茉莉花')}>茉莉花</button>
            </div>
          </div>
        ) : (
          <div className={styles.analysisSection}>
            <div className={styles.analysisHeader}>
              <h4>🎼 「{songInput}」樂理分析</h4>
            </div>
            <div className={styles.analysisContent}>
              <p>{analysis}</p>
            </div>
            <div className={styles.cardActions}>
              <button onClick={resetCard} className={styles.resetButton}>
                分析其他歌曲
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicAnalysisCard;