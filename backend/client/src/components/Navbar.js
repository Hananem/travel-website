'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navbarClasses = `fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
    isHome && !scrolled ? 'bg-transparent text-white' : 'bg-white text-gray-800 shadow'
  }`;

  return (
    <nav className={navbarClasses}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Home
        </Link>
        <div className="space-x-6">
          <button
            onClick={() => router.push('/createitem')}
            className="hover:underline"
          >
            Create Item
          </button>
          <button
            onClick={() => router.push('/')}
            className="hover:underline"
          >
            Back to Items
          </button>
        </div>
      </div>
    </nav>
  );
}
