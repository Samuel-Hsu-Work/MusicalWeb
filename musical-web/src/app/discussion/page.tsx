'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getForumTopic, 
  getForumPastTopics,
  getForumComments, 
  postForumComment,
  handleApiError
} from '@/services/api';
import { ForumTopic, ForumComment } from '@/types';
import './discussion.css';

export default function DiscussionPage() {
  const { user, logout, isAuthenticated } = useAuth();
  
  const [currentTopic, setCurrentTopic] = useState<ForumTopic>({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    _id: ''
  });
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [todayTopicData, setTodayTopicData] = useState<ForumTopic | null>(null);
  const [pastTopics, setPastTopics] = useState<ForumTopic[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTopics, setFilteredTopics] = useState<ForumTopic[]>([]);
  const [selectedPastTopic, setSelectedPastTopic] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTodayTopic();
    fetchPastTopics();
  }, []);

  useEffect(() => {
    if (currentTopic._id) {
      fetchComments(currentTopic._id);
    }
  }, [currentTopic._id]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTopics(pastTopics);
    } else {
      const filtered = pastTopics.filter(topic => 
        (topic.title && topic.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (topic.content && topic.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (topic.topic && topic.topic.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredTopics(filtered);
    }
  }, [searchQuery, pastTopics]);

  const fetchTodayTopic = async () => {
    try {
      setLoading(true);
      const response: any = await getForumTopic();
      
      if (response.data && response.data.data) {
        const topicData = response.data.data;
        const newTopicData: ForumTopic = {
          title: topicData.title || '音樂理論討論',
          content: topicData.content || topicData.topic || '今日的音樂理論討論主題',
          date: topicData.date,
          _id: topicData._id
        };
        
        setCurrentTopic(newTopicData);
        setTodayTopicData(newTopicData);
      } else if (response.data && response.data.title) {
        const newTopicData: ForumTopic = {
          title: response.data.title,
          content: response.data.content || response.data.topic,
          date: response.data.date,
          _id: response.data._id
        };
        
        setCurrentTopic(newTopicData);
        setTodayTopicData(newTopicData);
      }
    } catch (error) {
      console.error('Error fetching topic:', error);
      setError(`無法加載今日主題：${handleApiError(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (topicId: string) => {
    if (!topicId) return;

    try {
      setLoading(true);
      const response: any = await getForumComments(topicId);
      
      if (Array.isArray(response.data)) {
        const sortedComments = response.data.sort((a: ForumComment, b: ForumComment) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setComments(sortedComments);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError(`無法加載評論：${handleApiError(error)}`);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPastTopics = async () => {
    try {
      const response: any = await getForumPastTopics();
      
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        const topicsWithColors = response.data.data.map((topic: ForumTopic, index: number) => ({
          ...topic,
          color: getTopicColor(index)
        }));
        
        setPastTopics(topicsWithColors);
        setFilteredTopics(topicsWithColors);
      }
    } catch (error) {
      console.error('Error fetching past topics:', error);
    }
  };

  const getTopicColor = (index: number): string => {
    const colors = [
      "#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444",
      "#06B6D4", "#84CC16", "#F97316", "#EC4899", "#6366F1"
    ];
    return colors[index % colors.length];
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!newComment.trim() || !isAuthenticated() || !currentTopic._id || !user) {
      setError('無法發表評論');
      return;
    }

    try {
      setLoading(true);
      
      const commentData = {
        username: user.username,
        text: newComment.trim(),
        topicId: currentTopic._id
      };
      
      const response: any = await postForumComment(commentData);
      setComments([response.data, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
      setError(`提交評論失敗：${handleApiError(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTodayTopicClick = () => {
    if (!selectedPastTopic || !todayTopicData) return;
    setSelectedPastTopic(null);
    setCurrentTopic(todayTopicData);
  };

  const handleTopicClick = (topicId: string) => {
    setSelectedPastTopic(topicId);
    const pastTopic = pastTopics.find(t => t._id === topicId);
    if (pastTopic) {
      const topicData: ForumTopic = {
        title: pastTopic.title || pastTopic.topic?.split('\n')[0] || '過去主題',
        content: pastTopic.content || pastTopic.topic || '過去主題內容',
        date: pastTopic.date,
        _id: pastTopic._id
      };
      setCurrentTopic(topicData);
    }
  };

  const formatDate = (dateString?: string): string => {
    const targetDate = dateString ? new Date(dateString) : new Date();
    return targetDate.toLocaleDateString('zh-TW', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      timeZone: 'UTC'
    }) + ' (UTC)';
  };

  const formatCommentTime = (timestamp: string): string => {
    if (!timestamp) return '剛剛';
    
    const commentDate = new Date(timestamp);
    const now = new Date();
    
    if (commentDate.toDateString() === now.toDateString()) {
      return `今天 ${commentDate.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (commentDate.toDateString() === yesterday.toDateString()) {
      return `昨天 ${commentDate.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return commentDate.toLocaleDateString('zh-TW', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderContent = (contentText: string) => {
    if (!contentText) return null;
    
    return contentText.split('\n').map((line, index) => (
      <p key={index} style={{
        marginBottom: line.trim() === '' ? '1em' : '0.5em',
        minHeight: line.trim() === '' ? '1em' : 'auto'
      }}>
        {line.trim() || '\u00A0'}
      </p>
    ));
  };

  const getSidebarTopicTitle = (topic: ForumTopic): string => {
    if (topic.title) return topic.title;
    if (topic.topic) return topic.topic.split('\n')[0];
    return '未命名主題';
  };

  return (
    <div className="discussion-container">
      <div className="discussion-sidebar">
        <div className="discussion-sidebar__search">
          <input
            type="text"
            placeholder="搜索主題..."
            className="discussion-sidebar__search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg className="discussion-sidebar__search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className='discussion-sidebar__today-topic'>
          <div 
            className={`discussion-sidebar__topic ${!selectedPastTopic ? 'discussion-sidebar__topic--active' : ''}`}
            onClick={handleTodayTopicClick}
          >
            <div className="discussion-sidebar__topic-indicator" style={{ backgroundColor: "#10B981" }} />
            <h3 className="discussion-sidebar__topic-title">今日主題</h3>
          </div>
        </div>
        
        <h3 className="discussion-sidebar__heading">過去主題</h3>
        <div className="discussion-sidebar__topics">
          {filteredTopics.length === 0 ? (
            <div className="discussion-sidebar__no-topics">
              {pastTopics.length === 0 ? '暫無過去主題' : '沒有找到匹配的主題'}
            </div>
          ) : (
            filteredTopics.map((pastTopic) => (
              <div 
                key={pastTopic._id} 
                className={`discussion-sidebar__topic ${selectedPastTopic === pastTopic._id ? 'discussion-sidebar__topic--active' : ''}`}
                onClick={() => handleTopicClick(pastTopic._id)}
              >
                <div className="discussion-sidebar__topic-indicator" style={{ backgroundColor: pastTopic.color }} />
                <span className="discussion-sidebar__topic-title">{getSidebarTopicTitle(pastTopic)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="discussion-content">
        <div className="discussion-content__inner">
          {error && (
            <div className="discussion__error">
              <p className="discussion__error-text">{error}</p>
              <button onClick={() => setError('')} className="discussion__error-close">✕</button>
            </div>
          )}
          
          <div className="discussion__daily-topic">
            <div className="discussion__topic-header">
              <h2 className="discussion__topic-title">每日討論主題</h2>
              <span className="discussion__topic-date">{formatDate(currentTopic.date)}</span>
            </div>
            
            <h3 className="discussion__topic-subject">
              {currentTopic.title}
              <span className={`discussion__topic-tag ${selectedPastTopic ? 'discussion__topic-tag--past' : 'discussion__topic-tag--today'}`}>
                {selectedPastTopic ? '過去主題' : '今日主題'}
              </span>
            </h3>
            
            {loading && !currentTopic._id ? (
              <div className="discussion__topic-loading">
                <div className="discussion__loading-spinner" />
                <span className="discussion__loading-text">正在加載主題...</span>
              </div>
            ) : (
              <div className="discussion__topic-description">{renderContent(currentTopic.content)}</div>
            )}
            
            <div className="discussion__topic-stats">
              <div className="discussion__stat">
                <svg className="discussion__stat-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-1.008c-.75.516-1.5.923-2.5 1.01A5.99 5.99 0 010 11.52v-.03c.01-.82.435-1.5.987-1.979.43-.44.854-.88 1.264-1.332A6.563 6.563 0 012 7c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9a1 1 0 11-2 0 1 1 0 012 0zm3 1a1 1 0 100-2 1 1 0 000 2zm3-1a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                </svg>
                <span>{comments.length} 個評論</span>
              </div>
              <a href="#comment-section" className="discussion__join-link">加入討論 →</a>
            </div>
          </div>

          <div id="comment-section" className="discussion__comments">
            <div className="discussion__comments-header">
              <h3 className="discussion__comments-title">評論區</h3>
              {isAuthenticated() && (
                <button className="discussion__logout-btn" onClick={logout}>
                  登出 ({user?.username})
                </button>
              )}
            </div>

            {isAuthenticated() ? (
              <form onSubmit={handleCommentSubmit} className="discussion__comment-form">
                <div className="discussion__comment-form--authenticated">
                  <div className="discussion__current-user">
                    目前登入為: <span className="discussion__current-user-name">{user?.username}</span>
                  </div>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="discussion__comment-textarea"
                    rows={4}
                    placeholder="分享您對此音樂理論主題的想法..."
                    disabled={loading}
                  />
                  <button 
                    type="submit" 
                    className="discussion__comment-submit"
                    disabled={loading || !newComment.trim() || !currentTopic._id}
                  >
                    {loading ? '發送中...' : '發表評論'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="discussion__login-warning">
                <p className="discussion__login-warning-text">您必須登入才能發表評論。</p>
                <div className="discussion__login-options">
                  <a href="/account" className="discussion__login-btn">前往登入頁面</a>
                </div>
              </div>
            )}

            <div className="discussion__comments-list">
              {loading && comments.length === 0 ? (
                <div className="discussion__comments-loading">
                  <div className="discussion__comments-loading-spinner" />
                  <p>正在加載評論...</p>
                </div>
              ) : comments.length === 0 ? (
                <p className="discussion__no-comments">目前還沒有評論，成為第一個發表評論的人！</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} className="discussion__comment">
                    <div className="discussion__comment-content">
                      <div className="discussion__comment-avatar">
                        {comment.username ? comment.username.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div className="discussion__comment-details">
                        <div className="discussion__comment-header">
                          <h4 className="discussion__comment-author">{comment.username}</h4>
                          <span className="discussion__comment-timestamp">{formatCommentTime(comment.createdAt)}</span>
                        </div>
                        <p className="discussion__comment-text">{comment.text}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}