import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { supabase } from "@/lib/supabase";

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

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  debug: true,
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("signIn callback called", { user, account, profile });
      
      if (!user.email) {
        console.error("用戶沒有提供電子郵件");
        return false;
      }

      try {
        // 檢查用戶是否已存在
        try {
          const { data: existingUser, error: fetchError } = await supabase
            .from("users")
            .select("*")
            .eq("email", user.email)
            .single();

          if (fetchError) {
            // 如果是表格不存在的錯誤，我們可以忽略它
            if (fetchError.code === '42P01') {
              console.warn("users 表格不存在，跳過 Supabase 操作");
              return true; // 允許登入，即使表格不存在
            } else if (fetchError.code !== "PGRST116") {
              console.error("查詢用戶時出錯:", fetchError);
              // 其他錯誤，但仍然允許登入
              return true;
            }
          }

          if (!existingUser) {
            // 創建新用戶
            try {
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
                // 允許登入，即使創建用戶失敗
              }
            } catch (insertErr) {
              console.error("創建用戶時發生異常:", insertErr);
              // 允許登入，即使創建用戶失敗
            }
          } else {
            // 更新現有用戶
            try {
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
                // 允許登入，即使更新用戶失敗
              }
            } catch (updateErr) {
              console.error("更新用戶時發生異常:", updateErr);
              // 允許登入，即使更新用戶失敗
            }
          }
        } catch (dbErr) {
          console.error("數據庫操作時發生異常:", dbErr);
          // 允許登入，即使數據庫操作失敗
        }

        // 保存 OAuth 帳戶資訊
        if (account) {
          try {
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
              // 允許登入，即使保存 OAuth 帳戶資訊失敗
            }
          } catch (accountErr) {
            console.error("保存 OAuth 帳戶資訊時發生異常:", accountErr);
            // 允許登入，即使保存 OAuth 帳戶資訊失敗
          }
        }

        console.log("登入成功");
        return true;
      } catch (error) {
        console.error("登入過程中出錯:", error);
        // 即使出錯，也允許登入
        return true;
      }
    },
    async session({ session }) {
      if (session.user?.email) {
        try {
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
        } catch (error) {
          console.error("獲取用戶資訊時出錯:", error);
          // 即使出錯，也返回原始 session
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
}); 