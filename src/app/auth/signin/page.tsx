"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") ?? "/dashboard";

  const handleGoogleSignIn = async () => {
    try {
      console.log(`正在嘗試使用Google登入，回調 URL: ${callbackUrl}`);
      await signIn("google", { 
        callbackUrl,
        redirect: true,
      });
    } catch (error) {
      console.error("Google登入失敗：", error);
    }
  };

  const handleInstagramSignIn = async () => {
    try {
      console.log(`正在嘗試使用Instagram登入，回調 URL: ${callbackUrl}`);
      await signIn("instagram", {
        callbackUrl,
        redirect: true,
      });
    } catch (error) {
      console.error("Instagram登入失敗：", error);
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          登入您的帳號
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          登入後將跳轉至: {callbackUrl}
        </p>
      </div>
      <div className="mt-8 space-y-6">
        <button
          onClick={handleGoogleSignIn}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 mb-4"
        >
          使用 Google 帳號登入
        </button>
        <button
          onClick={handleInstagramSignIn}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
        >
          使用 Instagram 帳號登入
        </button>
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Suspense fallback={<div className="p-4 text-center">載入中...</div>}>
        <SignInContent />
      </Suspense>
    </div>
  );
} 