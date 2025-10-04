import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
// import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '3muel Hub - Music Learning Platform',
  description: 'Explore your music with 3muel Hub',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body className={inter.className}>
        {/* <AuthProvider> */}
          <div className="App">
            <Navbar />
            <main className="main-content">
              {children}
            </main>
          </div>
        {/* </AuthProvider> */}
      </body>
    </html>
  );
}