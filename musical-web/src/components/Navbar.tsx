'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// import { useAuth } from '@/contexts/AuthContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const pathname = usePathname();
  
  // const { user, logout, isAuthenticated, loading } = useAuth();
  
  const toggleMenu = (): void => {
    setMenuOpen(!menuOpen);
  };
  
  const closeMenu = (): void => {
    if (menuOpen) setMenuOpen(false);
  };
  
  // const handleLogout = (): void => {
  //   logout();
  //   closeMenu();
  // };
  
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

  // 當路徑改變時關閉菜單
  useEffect(() => {
    closeMenu();
  }, [pathname]);

  return (
    <nav className="navbar">
      <div className="logo">
        <div className="logo-circle"></div>
        <span className="logo-text">3muel Hub</span>
      </div>
      
      <div 
        className={`menu-icon ${menuOpen ? 'menu-open' : ''}`} 
        onClick={toggleMenu}
        role="button"
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        <div className="bar1"></div>
        <div className="bar2"></div>
        <div className="bar3"></div>
      </div>
      
      <div 
        className={`overlay ${menuOpen ? 'active' : ''}`} 
        onClick={closeMenu}
        aria-hidden={!menuOpen}
      ></div>
      
      <ul className={`nav-links ${menuOpen ? 'active' : ''}`}>
        <li>
          <Link href="/" onClick={closeMenu}>
            Home
          </Link>
        </li>
        <li>
          <Link href="/theory" onClick={closeMenu}>
            Music Theory
          </Link>
        </li>
        <li>
          <Link href="/discussion" onClick={closeMenu}>
            Discussion
          </Link>
        </li>
        <li>
          <Link href="/account" onClick={closeMenu}>
            MyAccount
          </Link>
        </li>
        <li>
          <Link href="/contact" onClick={closeMenu}>
            Contact
          </Link>
        </li>
      </ul>
      
      {/* <div className="auth-section">
        {loading ? (
          <div className="loading-spinner" aria-label="Loading"></div>
        ) : isAuthenticated() ? (
          <div className="user-menu">
            <span className="username">👤 {user?.username}</span>
            <button 
              className="logout-btn" 
              onClick={handleLogout}
              type="button"
            >
              登出
            </button>
          </div>
        ) : (
          <Link href="/account" className="sign-in-btn">
            Sign In
          </Link>
        )}
      </div> */}
    </nav>
  );
};

export default Navbar;