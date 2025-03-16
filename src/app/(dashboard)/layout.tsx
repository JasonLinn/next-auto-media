'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LoginButton from "@/components/auth/LoginButton";
import { Home, HardDrive, Menu, X } from 'lucide-react';
import { SessionProvider } from 'next-auth/react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 導航項目
  const navItems = [
    { name: '首頁', href: '/', icon: Home },
    { name: '雲端硬碟', href: '/drive', icon: HardDrive },
  ];

  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 mr-10">
                Next Auto Media
              </h1>
              
              {/* 桌面導航 */}
              <nav className="hidden md:flex space-x-8">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center ${
                        isActive
                          ? 'text-blue-600 font-medium'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-1" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* 移動端菜單按鈕 */}
            <div className="flex items-center">
              <button
                type="button"
                className="md:hidden -m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">打開主菜單</span>
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="h-6 w-6" aria-hidden="true" />
                )}
              </button>
              <LoginButton />
            </div>
          </div>

          {/* 移動端菜單 */}
          {mobileMenuOpen && (
            <div className="md:hidden">
              <div className="space-y-1 px-4 py-3 sm:px-6">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center py-2 ${
                        isActive
                          ? 'text-blue-600 font-medium'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="h-5 w-5 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </header>
        <main>{children}</main>
      </div>
    </SessionProvider>
  );
} 