// ==========================================
// 2. Navbar Component
// src/components/Navbar.tsx
// ==========================================

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Navbar.module.css';

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout, isAuthenticated, loading } = useAuth();
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  const closeMenu = () => {
    if (menuOpen) setMenuOpen(false);
  };
  
  const handleLogout = () => {
    logout();
    closeMenu();
  };
  
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [menuOpen]);

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <div className={styles.logoCircle}></div>
        <span className={styles.logoText}>3muel Hub</span>
      </div>
      
      <div 
        className={`${styles.menuIcon} ${menuOpen ? styles.menuOpen : ''}`} 
        onClick={toggleMenu}
      >
        <div className={styles.bar1}></div>
        <div className={styles.bar2}></div>
        <div className={styles.bar3}></div>
      </div>
      
      <div 
        className={`${styles.overlay} ${menuOpen ? styles.active : ''}`} 
        onClick={closeMenu}
      ></div>
      
      <ul className={`${styles.navLinks} ${menuOpen ? styles.active : ''}`}>
        <li><Link href="/" onClick={closeMenu}>Home</Link></li>
        <li><Link href="/theory" onClick={closeMenu}>Music Theory</Link></li>
        <li><Link href="/discussion" onClick={closeMenu}>Discussion</Link></li>
        <li><Link href="/account" onClick={closeMenu}>MyAccount</Link></li>
        <li><Link href="/contact" onClick={closeMenu}>Contact</Link></li>
      </ul>
      
      <div className={styles.authSection}>
        {loading ? (
          <div className={styles.loadingSpinner}></div>
        ) : isAuthenticated() ? (
          <div className={styles.userMenu}>
            <span className={styles.username}>👤 {user?.username}</span>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              登出
            </button>
          </div>
        ) : (
          <Link href="/account" className={styles.signInBtn}>
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
