// ==========================================
// 8. Contact Page
// src/app/contact/page.tsx
// ==========================================

'use client';

import Navbar from '@/components/Navbar';
import styles from './contact.module.css';

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className={styles.container}>
        <h1>Contact Us</h1>
        <p>聯絡資訊即將推出...</p>
      </main>
    </>
  );
}