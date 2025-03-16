"use client";

import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";

interface Provider {
  id: string;
  name: string;
}

interface SignInFormProps {
  providers: Record<string, Provider> | null;
}

export default function SignInForm({ providers }: SignInFormProps) {
  return (
    <div className="mt-8 space-y-6">
      {providers &&
        Object.values(providers).map((provider) => (
          <div key={provider.id}>
            <button
              onClick={() => signIn(provider.id, { callbackUrl: "/" })}
              className="group relative flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {provider.id === "google" && (
                <span className="mr-2">
                  <FcGoogle className="h-5 w-5" />
                </span>
              )}
              使用 {provider.name} 登入
            </button>
          </div>
        ))}
    </div>
  );
} 