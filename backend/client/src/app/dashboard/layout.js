'use client';
import { BookOpen, MapPin, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  
  // Define your navigation items
  const navItems = [
    {
      href: '/dashboard/guidesettings',
      icon: <BookOpen className="mr-2 h-5 w-5" />,
      label: 'Guides'
    },
    {
      href: '/dashboard/destinationsettings',
      icon: <MapPin className="mr-2 h-5 w-5" />,
      label: 'Destinations'
    },
    {
      href: '/dashboard/categorysettings',
      icon: <Users className="mr-2 h-5 w-5" />,
      label: 'Users'
    },
    {
      href: '/dashboard/bookingsettings',
      icon: <Calendar className="mr-2 h-5 w-5" />,
      label: 'Booking'
    }
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white flex flex-col p-4 fixed top-0 left-0 h-screen overflow-y-auto z-10 mt-16">
        <div className="mb-6 pt-4">
          <h2 className="text-2xl font-bold">Travel Dashboard</h2>
        </div>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <Link href={item.href} key={item.href} passHref legacyBehavior>
              <Button
                as="a"
                variant={pathname?.startsWith(item.href) ? 'default' : 'ghost'}
                className="justify-start text-left py-2 px-4 text-white hover:bg-gray-700 w-full"
              >
                {item.icon}
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 ml-64 mt-16 p-8 bg-gray-50 min-h-screen">
        {children}
      </main>
    </div>
  );
}