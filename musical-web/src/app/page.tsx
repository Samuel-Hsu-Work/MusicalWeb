// ==========================================
// 3. Home Page
// src/app/page.tsx
// ==========================================

'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import MusicAnalysisCard from '@/components/MusicAnalysisCard';
import styles from './page.module.css';

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <>
      <Navbar />
      <main className={styles.musicLanding}>
        <div className={styles.wrapper}>
          <div className={styles.textContent}>
            <h1 className={styles.headline}>
              {isAuthenticated() ? (
                <>
                  Welcome back, <br/>
                  <span className={styles.highlight}>{user?.username}</span> <br/>
                  to 3muel Hub
                </>
              ) : (
                <>
                  Explore Your <br/>
                  Music <br/>
                  <span className={styles.highlight}>with 3muel Hub</span>
                </>
              )}
            </h1>
            <p className={styles.description}>
              Without music, your life will Bb
            </p>
            <div className={styles.buttons}>
              {isAuthenticated() ? (
                <div className={styles.welcomeActions}>
                  <Link 
                    href="/theory" 
                    className={`${styles.button} ${styles.buttonPrimary}`}
                  >
                    開始學習
                  </Link>
                  <Link 
                    href="/discussion" 
                    className={`${styles.button} ${styles.buttonSecondary}`}
                  >
                    加入討論
                  </Link>
                </div>
              ) : (
                <Link 
                  href="/account" 
                  className={`${styles.button} ${styles.buttonPrimary}`}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
          <div className={styles.cardContainer}>
            <MusicAnalysisCard />
          </div>
        </div>
      </main>
    </>
  );
}