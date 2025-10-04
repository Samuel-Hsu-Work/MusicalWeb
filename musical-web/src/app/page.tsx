'use client';

import React from 'react';
import Link from 'next/link';
// import { useAuth } from '@/contexts/AuthContext';
// import MusicAnalysisCard from '@/components/MusicAnalysisCard';
import './Home.css';

export default function HomePage() {
  // const { user, isAuthenticated } = useAuth();

  return (
    <div className='music-landing'>
      <div className='music-landing__wrapper'>
        <div className='music-landing__text-content'>
          <h1 className='music-landing__headline'>
            {/* {isAuthenticated() ? (
              <>
                Welcome back, <br/>
                <span className='music-landing__highlight'>{user?.username}</span> <br/>
                to 3muel Hub
              </>
            ) : (
              <>
                Explore Your <br/>
                Music <br/>
                <span className='music-landing__highlight'>with 3muel Hub</span>
              </>
            )} */}
          </h1>
          <p className='music-landing__description'>
            Without music, your life will Bb
          </p>
          <div className='music-landing__buttons'>
            {/* {isAuthenticated() ? (
              <div className="welcome-actions">
                <Link 
                  href="/theory" 
                  className='music-landing__button music-landing__button--primary'
                >
                  開始學習
                </Link>
                <Link 
                  href="/discussion" 
                  className='music-landing__button music-landing__button--secondary'
                >
                  加入討論
                </Link>
              </div>
            ) : (
              <Link 
                href="/account" 
                className='music-landing__button music-landing__button--primary'
              >
                Sign In
              </Link>
            )} */}
          </div>
        </div>
        <div className='music-landing__card-container'>
          {/* <MusicAnalysisCard /> */}
        </div>
      </div>
    </div>
  );
}