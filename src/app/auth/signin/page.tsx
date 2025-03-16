import { redirect } from "next/navigation";
import { getProviders } from "next-auth/react";
import SignInForm from "@/components/auth/SignInForm";
import { auth } from "@/auth";

export default async function SignInPage() {
  const session = await auth();

  // 如果用戶已登入，重定向到首頁
  if (session) {
    redirect("/");
  }

  const providers = await getProviders();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            登入您的帳戶
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            使用您的 Google 帳戶登入
          </p>
        </div>
        <SignInForm providers={providers} />
      </div>
    </div>
  );
} 