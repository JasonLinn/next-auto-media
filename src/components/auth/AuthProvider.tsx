"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider 
      refetchInterval={5 * 60} // 每5分鐘刷新一次會話
      refetchOnWindowFocus={true} // 當窗口獲得焦點時刷新會話
    >
      {children}
    </SessionProvider>
  );
} 