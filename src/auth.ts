import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { supabase } from '@/lib/supabase';

// Google Drive 範圍
const DriveScope = 'https://www.googleapis.com/auth/drive.readonly';

// 擴展會話類型，添加訪問令牌
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    error?: string;
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    };
  }
  
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    error?: string;
  }
}

// 配置 NextAuth
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: `https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile ${DriveScope}`,
          access_type: "offline",
          prompt: "consent",
          response_type: "code"
        }
      }
    }),
  ],
  debug: process.env.NODE_ENV === 'development',
  callbacks: {
    async jwt({ token, account, profile }) {
      // 如果有賬戶信息，將訪問令牌添加到 token 中
      if (account) {
        console.log('JWT 回調 - 有賬戶信息:', { 
          hasAccessToken: !!account.access_token,
          hasRefreshToken: !!account.refresh_token,
          tokenType: account.token_type,
          scope: account.scope
        });
        
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      
      // 記錄 token 信息，用於調試
      console.log('JWT 回調 - 返回 token:', { 
        hasAccessToken: !!token.accessToken,
        hasRefreshToken: !!token.refreshToken,
        expiresAt: token.expiresAt
      });
      
      return token;
    },
    async session({ session, token }) {
      // 將訪問令牌從 token 添加到會話中
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      
      // 記錄會話信息，用於調試
      console.log('Session 回調:', { 
        hasAccessToken: !!session.accessToken,
        hasRefreshToken: !!session.refreshToken,
        tokenDetails: token
      });
      
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
    async signIn({ user, account, profile }) {
      try {
        // 確保有必要的信息
        if (!account || !profile || !user.email) {
          console.error('登入回調缺少必要信息:', { account, profile, user });
          return false;
        }

        // 記錄 OAuth 信息，用於調試
        console.log('OAuth 信息:', { 
          provider: account.provider,
          hasAccessToken: !!account.access_token,
          hasRefreshToken: !!account.refresh_token,
          tokenType: account.token_type,
          scope: account.scope
        });

        // 檢查用戶是否已存在
        try {
          const { data: existingUser, error } = await supabase
            .from("users")
            .select("*")
            .eq("email", user.email)
            .single();

          if (error && error.code !== "PGRST116") {
            // PGRST116 表示沒有找到記錄，這是正常的
            console.error("檢查用戶時出錯:", error);
          }

          // 如果用戶不存在，創建新用戶
          if (!existingUser) {
            const { error: insertError } = await supabase.from("users").insert({
              id: user.id || crypto.randomUUID(),
              email: user.email,
              name: user.name,
              avatar_url: user.image,
              provider: account.provider,
              provider_id: account.providerAccountId,
              role: "user",
              created_at: new Date().toISOString(),
              last_sign_in: new Date().toISOString(),
            });

            if (insertError) {
              console.error("創建用戶時出錯:", insertError);
              // 如果是表不存在的錯誤 (42P01)，允許繼續
              if (insertError.code !== "42P01") {
                throw insertError;
              }
            }
          } else {
            // 更新用戶的最後登入時間
            const { error: updateError } = await supabase
              .from("users")
              .update({
                last_sign_in: new Date().toISOString(),
                name: user.name || existingUser.name,
                avatar_url: user.image || existingUser.avatar_url,
              })
              .eq("email", user.email);

            if (updateError) {
              console.error("更新用戶時出錯:", updateError);
              // 如果是表不存在的錯誤 (42P01)，允許繼續
              if (updateError.code !== "42P01") {
                throw updateError;
              }
            }
          }
        } catch (dbError) {
          console.error("處理用戶數據時出錯:", dbError);
          // 如果是表不存在的錯誤 (42P01)，允許繼續
          if (typeof dbError === 'object' && dbError !== null && 'code' in dbError && dbError.code === "42P01") {
            console.warn("用戶表不存在，但允許繼續登入");
          } else {
            throw dbError;
          }
        }

        return true;
      } catch (error) {
        console.error("登入回調出錯:", error);
        return false;
      }
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
}); 