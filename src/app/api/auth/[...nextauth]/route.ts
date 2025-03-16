import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { supabase } from "@/lib/supabase";
import type { NextAuthConfig } from "next-auth";
import type { User, Account, Profile } from "next-auth";
import type { Session } from "next-auth";

// 擴展 Session 類型
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    };
  }
}

export const authOptions: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) {
        return false;
      }

      try {
        // 檢查用戶是否已存在
        const { data: existingUser, error: fetchError } = await supabase
          .from("users")
          .select("*")
          .eq("email", user.email)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          console.error("查詢用戶時出錯:", fetchError);
          return false;
        }

        if (!existingUser) {
          // 創建新用戶
          const { error: insertError } = await supabase.from("users").insert([
            {
              email: user.email,
              name: user.name,
              avatar_url: user.image,
              provider: account?.provider,
              provider_id: account?.providerAccountId,
            },
          ]);

          if (insertError) {
            console.error("創建用戶時出錯:", insertError);
            return false;
          }
        } else {
          // 更新現有用戶
          const { error: updateError } = await supabase
            .from("users")
            .update({
              name: user.name,
              avatar_url: user.image,
              last_sign_in: new Date().toISOString(),
            })
            .eq("email", user.email);

          if (updateError) {
            console.error("更新用戶時出錯:", updateError);
            return false;
          }
        }

        // 保存 OAuth 帳戶資訊
        if (account) {
          const { error: accountError } = await supabase
            .from("oauth_accounts")
            .upsert(
              {
                user_email: user.email,
                provider: account.provider,
                provider_account_id: account.providerAccountId,
                access_token: account.access_token,
                token_type: account.token_type,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at
                  ? new Date(account.expires_at * 1000).toISOString()
                  : null,
                scope: account.scope,
                id_token: account.id_token,
              },
              { onConflict: "provider, provider_account_id" }
            );

          if (accountError) {
            console.error("保存 OAuth 帳戶資訊時出錯:", accountError);
            return false;
          }
        }

        return true;
      } catch (error) {
        console.error("登入過程中出錯:", error);
        return false;
      }
    },
    async session({ session }) {
      if (session.user?.email) {
        // 從 Supabase 獲取用戶資訊
        const { data } = await supabase
          .from("users")
          .select("*")
          .eq("email", session.user.email)
          .single();

        // 將 Supabase 用戶資訊添加到 session
        if (data) {
          session.user.id = data.id;
          session.user.role = data.role;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 