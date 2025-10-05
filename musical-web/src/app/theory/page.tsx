// ==========================================
// 5. Theory Page
// src/app/theory/page.tsx
// ==========================================

'use client';

import Navbar from '@/components/Navbar';
import styles from './theory.module.css';

export default function TheoryPage() {
  return (
    <>
      <Navbar />
      <main className={styles.container}>
        <h1>Music Theory</h1>
        <p>音樂理論課程即將推出...</p>
      </main>
    </>
  );
}
