import React, { useState } from 'react';
import './MusicAnalysisCard.css';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const MusicAnalysisCard: React.FC = () => {
  const [songInput, setSongInput] = useState<string>('');
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasAnalyzed, setHasAnalyzed] = useState<boolean>(false);

  const analyzeSong = async (): Promise<void> => {
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
              content: "你是一位很酷的音樂理論老師，會用有趣的方式分析音樂。請分析用戶提到的歌曲，並：1)指出該曲子的關鍵音樂特色（如調性、節拍、和弦進行、曲式結構等）2)用具體的技術細節說明為什麼這首歌好聽（例如：藍調的12小節結構、流行歌的I-V-vi-IV進行、搖滾的power chord等）3)建議學習哪些樂理知識能讓用戶更懂這類音樂，並暗示用戶可能對什麼風格有偏好。語調要輕鬆但專業，像在跟朋友聊音樂。用繁體中文，200字內。"
            },
            {
              role: "user",
              content: `請分析這首歌曲：${songInput}`
            }
          ] as OpenAIMessage[],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data: OpenAIResponse = await response.json();
      setAnalysis(data.choices[0].message.content);
      setHasAnalyzed(true);
    } catch (error) {
      console.error('Error:', error);
      setAnalysis('抱歉，分析過程中發生錯誤。請稍後再試。');
      setHasAnalyzed(true);
    }
    
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      analyzeSong();
    }
  };

  const resetCard = (): void => {
    setSongInput('');
    setAnalysis('');
    setHasAnalyzed(false);
  };

  const setSuggestion = (song: string): void => {
    setSongInput(song);
  };

  return (
    <div className="music-analysis-card">
      <div className="card-header">
        <h3>🎵 音樂理論探索器</h3>
        <p>輸入你喜歡的歌曲，讓 AI 告訴你可以學習哪些樂理知識！</p>
      </div>
      
      <div className="card-content">
        {!hasAnalyzed ? (
          <div className="input-section">
            <div className="input-group">
              <input
                type="text"
                value={songInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSongInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="例如：Fly Me to the Moon、Smells Like Teen Spirit、茉莉花..."
                className="song-input"
                disabled={isLoading}
              />
              <button 
                onClick={analyzeSong}
                disabled={isLoading || !songInput.trim()}
                className="analyze-button"
                type="button"
              >
                {isLoading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  '分析'
                )}
              </button>
            </div>
            <div className="suggestions">
              <span>試試看：</span>
              <button 
                onClick={() => setSuggestion('Fly Me to the Moon')}
                type="button"
              >
                Fly Me to the Moon
              </button>
              <button 
                onClick={() => setSuggestion('Smells Like Teen Spirit')}
                type="button"
              >
                Smells Like Teen Spirit
              </button>
              <button 
                onClick={() => setSuggestion('茉莉花')}
                type="button"
              >
                茉莉花
              </button>
            </div>
          </div>
        ) : (
          <div className="analysis-section">
            <div className="analysis-header">
              <h4>🎼 「{songInput}」樂理分析</h4>
            </div>
            <div className="analysis-content">
              <p>{analysis}</p>
            </div>
            <div className="card-actions">
              <button 
                onClick={resetCard} 
                className="reset-button"
                type="button"
              >
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