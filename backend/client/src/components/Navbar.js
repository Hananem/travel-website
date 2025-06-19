'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Bell, MessageSquare } from 'lucide-react';
import { useGetNotificationsQuery } from '@/store/notificationSlice';
import { useGetConversationsQuery } from '@/store/messageSlice';
import { socket } from '@/store/messageSlice';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  
  // Fetch notifications and conversations
  const { data: notifications } = useGetNotificationsQuery({ limit: 5 });
  const { data: conversations } = useGetConversationsQuery();
  
  // Count unread notifications and messages
  const unreadNotifications = notifications?.notifications?.filter(n => !n.read).length || 0;
  const unreadMessages = conversations?.conversations?.reduce(
    (total, conv) => total + (conv.unreadCount || 0), 0
  ) || 0;

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
        <div className="flex items-center gap-6">
          {/* Notification Icon */}
          <div className="relative">
            <button
              onClick={() => router.push('/notifications')}
              className="hover:opacity-80 transition-opacity p-1"
              aria-label="Notifications"
            >
              <Bell className="h-6 w-6" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </button>
          </div>

          {/* Messages Icon */}
          <div className="relative">
            <button
              onClick={() => router.push('/messages')}
              className="hover:opacity-80 transition-opacity p-1"
              aria-label="Messages"
            >
              <MessageSquare className="h-6 w-6" />
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={() => router.push('/createitem')}
            className="hover:underline hidden md:inline-block"
          >
            Create Item
          </button>
          {!isHome && (
            <button
              onClick={() => router.push('/')}
              className="hover:underline hidden md:inline-block"
            >
              Browse Items
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
 