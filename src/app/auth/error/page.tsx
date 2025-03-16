"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams?.get("error") || "";

  let errorMessage = "發生未知錯誤";
  if (error === "AccessDenied") {
    errorMessage = "您沒有權限訪問此頁面";
  } else if (error === "Configuration") {
    errorMessage = "認證配置錯誤";
  } else if (error === "Verification") {
    errorMessage = "驗證鏈接已過期或已被使用";
  } else if (error === "OAuthSignin") {
    errorMessage = "OAuth 登入過程中發生錯誤";
  } else if (error === "OAuthCallback") {
    errorMessage = "OAuth 回調過程中發生錯誤";
  } else if (error === "OAuthCreateAccount") {
    errorMessage = "創建 OAuth 帳戶時發生錯誤";
  } else if (error === "EmailCreateAccount") {
    errorMessage = "創建電子郵件帳戶時發生錯誤";
  } else if (error === "Callback") {
    errorMessage = "回調處理過程中發生錯誤";
  } else if (error === "OAuthAccountNotLinked") {
    errorMessage = "此電子郵件已使用不同的登入方式";
  } else if (error === "EmailSignin") {
    errorMessage = "電子郵件發送失敗";
  } else if (error === "CredentialsSignin") {
    errorMessage = "登入失敗。請檢查您提供的詳細信息";
  } else if (error === "SessionRequired") {
    errorMessage = "此頁面需要登入";
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            登入錯誤
          </h2>
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">錯誤</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{errorMessage}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/auth/signin"
              className="text-indigo-600 hover:text-indigo-500"
            >
              返回登入頁面
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 