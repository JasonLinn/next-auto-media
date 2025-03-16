"use client";

import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

export default function OfflineLogoutButton() {
  const { data: session, status, update } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOfflineLogout = async () => {
    try {
      setIsLoggingOut(true);
      setError(null);
      console.log("[Auth] 開始離線登出流程");

      // 手動清除 NextAuth 相關 cookie
      document.cookie = "next-auth.session-token=; Max-Age=0; path=/; samesite=lax";
      document.cookie = "next-auth.csrf-token=; Max-Age=0; path=/; samesite=lax";
      document.cookie = "next-auth.callback-url=; Max-Age=0; path=/; samesite=lax";
      // Secure 域名下的 cookie
      document.cookie = "__Secure-next-auth.session-token=; Max-Age=0; path=/; secure; samesite=lax";
      document.cookie = "__Secure-next-auth.csrf-token=; Max-Age=0; path=/; secure; samesite=lax";
      document.cookie = "__Secure-next-auth.callback-url=; Max-Age=0; path=/; secure; samesite=lax";
      
      // 強制更新會話狀態
      await update();
      
      console.log("[Auth] 離線登出完成");
      
      // 重新導向到首頁
      window.location.href = "/";
    } catch (err) {
      console.error("[Auth] 離線登出時出錯:", err);
      setError(err instanceof Error ? err.message : "登出過程中發生錯誤");
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="flex flex-col items-end space-y-2">
      <div className="flex items-center space-x-4">
        <button
          onClick={handleOfflineLogout}
          disabled={isLoggingOut}
          className={`rounded-md ${
            isLoggingOut ? "bg-gray-400" : "bg-orange-600 hover:bg-orange-700"
          } px-4 py-2 text-sm font-medium text-white`}
        >
          {isLoggingOut ? "登出中..." : "離線登出"}
        </button>
      </div>
      {error && (
        <div className="text-sm text-red-600">
          錯誤: {error}
        </div>
      )}
    </div>
  );
} 