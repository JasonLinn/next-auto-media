"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import OfflineLogoutButton from "./OfflineLogoutButton";

export default function LoginButton() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      setError(null);
      console.log("[Auth] 開始登出流程");
      
      // 添加超時處理
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("登出請求超時")), 10000)
      );
      
      const signOutPromise = signOut({ callbackUrl: "/" });
      
      await Promise.race([signOutPromise, timeoutPromise]);
      console.log("[Auth] 登出請求已發送");
    } catch (error) {
      console.error("[Auth] 登出時出錯:", error);
      setError(error instanceof Error ? error.message : "登出過程中發生錯誤");
      setIsLoggingOut(false);
    }
  };

  const handleSignIn = async () => {
    try {
      console.log("[Auth] 開始登入流程");
      await signIn("google", { callbackUrl: "/" });
      console.log("[Auth] 登入請求已發送");
    } catch (error) {
      console.error("[Auth] 登入時出錯:", error);
    }
  };

  if (isLoading) {
    return (
      <button
        className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-400"
        disabled
      >
        載入中...
      </button>
    );
  }

  if (session) {
    return (
      <div className="flex flex-col items-end space-y-2">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {session.user?.image && (
              <img
                src={session.user.image}
                alt={session.user.name || "用戶頭像"}
                className="h-8 w-8 rounded-full"
              />
            )}
            <span className="text-sm font-medium">{session.user?.name}</span>
          </div>
          <button
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className={`rounded-md ${
              isLoggingOut ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"
            } px-4 py-2 text-sm font-medium text-white`}
          >
            {isLoggingOut ? "登出中..." : "登出"}
          </button>
          <OfflineLogoutButton />
        </div>
        {error && (
          <div className="text-sm text-red-600">
            錯誤: {error} <span className="ml-2 text-gray-500">(嘗試使用離線登出)</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <button 
      onClick={handleSignIn}
      className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
    >
      登入
    </button>
  );
} 