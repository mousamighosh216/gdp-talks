'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

function ScrollManager() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollManager />
      <Navbar />
      <main>
        {children}
      </main>
      <Footer />
    </>
  );
}
