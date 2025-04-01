'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import { FaUpload, FaUserCircle, FaSignOutAlt, FaSignInAlt, FaVideo, FaFolder } from 'react-icons/fa';
import { MdDashboard, MdPhoto } from 'react-icons/md';

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const navItems = [
    { name: '儀表板', href: '/dashboard', icon: <MdDashboard className="mr-2" /> },
    { name: '媒體庫', href: '/media', icon: <MdPhoto className="mr-2" /> },
    { name: '檔案庫', href: '/drive', icon: <FaFolder className="mr-2" /> },
    { name: '上傳影片', href: '/create', icon: <FaUpload className="mr-2" /> },
  ];

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <FaVideo className="text-blue-600 text-2xl mr-2" />
            <span className="text-xl font-bold">媒體平台</span>
          </Link>

          {/* 桌面導航 */}
          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-md hover:bg-gray-100 transition-colors ${
                  pathname === item.href ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>

          {/* 用戶菜單 */}
          <div className="relative">
            {status === 'authenticated' ? (
              <div>
                <button
                  onClick={toggleMenu}
                  className="flex items-center text-gray-700 hover:text-blue-600"
                >
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || '用戶'}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                  ) : (
                    <FaUserCircle className="text-2xl mr-2" />
                  )}
                  <span className="hidden md:inline">{session.user?.name}</span>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      {session.user?.email}
                    </div>
                    <Link
                      href="/create"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      onClick={() => setMenuOpen(false)}
                    >
                      <FaUpload className="mr-2" /> 上傳新影片
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                    >
                      <FaSignOutAlt className="mr-2" /> 登出
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <FaSignInAlt className="mr-2" /> 登入
              </button>
            )}
          </div>

          {/* 移動端漢堡菜單 */}
          <button
            className="md:hidden text-gray-600 hover:text-gray-900 focus:outline-none"
            onClick={toggleMenu}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              )}
            </svg>
          </button>
        </div>

        {/* 移動端菜單 */}
        {menuOpen && (
          <div className="md:hidden mt-4 border-t pt-4">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md ${
                    pathname === item.href ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
              {status === 'authenticated' && (
                <button
                  onClick={() => {
                    signOut();
                    setMenuOpen(false);
                  }}
                  className="flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  <FaSignOutAlt className="mr-2" /> 登出
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 