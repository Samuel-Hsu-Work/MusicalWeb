// ==========================================
// 6. Discussion Page
// src/app/discussion/page.tsx
// ==========================================

'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getForumTopic, 
  getForumComments, 
  postForumComment,
  handleApiError 
} from '@/lib/api';
import type { ForumTopic, ForumComment } from '@/types';
import styles from './discussion.module.css';

export default function DiscussionPage() {
  const { user, isAuthenticated } = useAuth();
  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTopicAndComments();
  }, []);

  const loadTopicAndComments = async () => {
    try {
      setLoading(true);
      const topicResponse = await getForumTopic();
      const topicData = topicResponse.data.data;
      setTopic(topicData);

      if (topicData._id) {
        const commentsResponse = await getForumComments(topicData._id);
        setComments(commentsResponse.data);
      }
    } catch (err) {
      console.error('載入失敗:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated() || !user) {
      setError('請先登入才能發表評論');
      return;
    }

    if (!newComment.trim()) {
      setError('評論內容不能為空');
      return;
    }

    if (!topic?._id) {
      setError('主題 ID 不存在');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const response = await postForumComment({
        username: user.username,
        text: newComment.trim(),
        topicId: topic._id
      });

      setComments([response.data, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error('發表評論失敗:', err);
      setError(handleApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className={styles.container}>
          <div className={styles.loading}>載入中...</div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className={styles.container}>
        <div className={styles.discussionWrapper}>
          <h1 className={styles.pageTitle}>今日討論主題</h1>
          
          {topic && (
            <div className={styles.topicCard}>
              <h2 className={styles.topicTitle}>{topic.title}</h2>
              <p className={styles.topicContent}>{topic.content}</p>
              <div className={styles.topicMeta}>
                <span>📅 {topic.date}</span>
              </div>
            </div>
          )}

          <div className={styles.commentsSection}>
            <h3>💬 討論區</h3>
            
            {isAuthenticated() ? (
              <form onSubmit={handleSubmitComment} className={styles.commentForm}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="分享你的想法..."
                  className={styles.commentTextarea}
                  disabled={submitting}
                  rows={4}
                />
                {error && <div className={styles.error}>{error}</div>}
                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={submitting || !newComment.trim()}
                >
                  {submitting ? '發表中...' : '發表評論'}
                </button>
              </form>
            ) : (
              <div className={styles.loginPrompt}>
                <p>請先登入才能發表評論</p>
              </div>
            )}

            <div className={styles.commentsList}>
              {comments.length === 0 ? (
                <p className={styles.noComments}>還沒有評論，來當第一個發言的人吧！</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} className={styles.commentCard}>
                    <div className={styles.commentHeader}>
                      <span className={styles.commentAuthor}>👤 {comment.username}</span>
                      <span className={styles.commentDate}>
                        {new Date(comment.createdAt).toLocaleString('zh-TW')}
                      </span>
                    </div>
                    <p className={styles.commentText}>{comment.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}