"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams?.get("error") || "";
  
  let errorMessage = "發生未知錯誤";
  let errorDescription = "請稍後再試或聯繫管理員";
  
  if (error === "AccessDenied") {
    errorMessage = "訪問被拒絕";
    errorDescription = "您沒有權限訪問此資源";
  } else if (error === "Configuration") {
    errorMessage = "配置錯誤";
    errorDescription = "認證服務配置有誤，請聯繫管理員";
  } else if (error === "Verification") {
    errorMessage = "驗證失敗";
    errorDescription = "無法驗證您的身份，請重新嘗試";
  } else if (error === "OAuthSignin") {
    errorMessage = "登入失敗";
    errorDescription = "無法啟動 OAuth 登入流程，請重新嘗試";
  } else if (error === "OAuthCallback") {
    errorMessage = "回調錯誤";
    errorDescription = "OAuth 回調處理失敗，請重新嘗試";
  } else if (error === "OAuthCreateAccount") {
    errorMessage = "帳戶創建失敗";
    errorDescription = "無法創建關聯的帳戶，請聯繫管理員";
  } else if (error === "EmailCreateAccount") {
    errorMessage = "帳戶創建失敗";
    errorDescription = "無法使用電子郵件創建帳戶，請聯繫管理員";
  } else if (error === "Callback") {
    errorMessage = "回調錯誤";
    errorDescription = "認證回調處理失敗，請重新嘗試";
  } else if (error === "OAuthAccountNotLinked") {
    errorMessage = "帳戶未關聯";
    errorDescription = "此電子郵件已使用不同的登入方式註冊，請使用原始登入方式";
  } else if (error === "EmailSignin") {
    errorMessage = "電子郵件登入失敗";
    errorDescription = "無法發送驗證電子郵件，請檢查您的電子郵件地址";
  } else if (error === "CredentialsSignin") {
    errorMessage = "憑證錯誤";
    errorDescription = "登入失敗，請檢查您的憑證";
  } else if (error === "SessionRequired") {
    errorMessage = "需要登入";
    errorDescription = "請先登入後再訪問此頁面";
  }
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            {errorMessage}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {errorDescription}
          </p>
        </div>
        <div className="mt-8 text-center">
          <Link href="/auth/signin" className="text-indigo-600 hover:text-indigo-500">
            返回登入頁面
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>載入中...</p>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
} 