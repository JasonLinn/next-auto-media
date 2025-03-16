'use client';

import LoginButton from "@/components/auth/LoginButton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Next Auto Media
          </h1>
          <LoginButton />
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
} 