"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function LoginButton() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      console.log("[Auth] 開始登出流程");
      await signOut({ callbackUrl: "/" });
      console.log("[Auth] 登出請求已發送");
    } catch (error) {
      console.error("[Auth] 登出時出錯:", error);
      setIsLoggingOut(false);
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
      </div>
    );
  }

  return (
    <Link href="/auth/signin">
      <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
        登入
      </button>
    </Link>
  );
} 