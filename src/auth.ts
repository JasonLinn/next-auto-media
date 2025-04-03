import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import InstagramProvider from "next-auth/providers/instagram";
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

// Google API 範圍
const YOUTUBE_SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.force-ssl'
];
const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly'
];

// Facebook API 範圍
const FACEBOOK_SCOPES = [
  'email',
  'public_profile',
  'pages_show_list',
  'pages_read_engagement',
  'pages_manage_posts',
  'pages_manage_metadata',
  'business_management',
  'instagram_basic',
  'instagram_content_publish',
  'instagram_manage_comments',
  'instagram_manage_insights'
];

// Instagram API 範圍
const INSTAGRAM_SCOPES = [
  'instagram_basic',
  'instagram_content_publish'
];

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

// 添加調試日誌
const logger = {
  error: (code: string, ...message: any[]) => {
    console.error(`[NextAuth][Error][${code}]`, ...message);
  },
  warn: (code: string, ...message: any[]) => {
    console.warn(`[NextAuth][Warn][${code}]`, ...message);
  },
  debug: (code: string, ...message: any[]) => {
    console.log(`[NextAuth][Debug][${code}]`, ...message);
  }
};

// 創建 Supabase 客戶端 - 使用簡單的錯誤處理
let supabaseClient;
try {
  supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
} catch (error) {
  console.error("[NextAuth] 創建 Supabase 客戶端失敗:", error);
  // 仍然創建一個空客戶端以避免引用錯誤
  supabaseClient = { from: () => ({ select: () => {} }) } as any;
}

const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith("https://");
const cookiePrefix = useSecureCookies ? "__Secure-" : "";
const hostName = new URL(process.env.NEXTAUTH_URL ?? "http://localhost:3000").hostname;

// 合併所有需要的 Google API 範圍
const allScopes = ['openid', 'email', 'profile', ...YOUTUBE_SCOPES, ...DRIVE_SCOPES];

// 配置 NextAuth
export const authOptions: NextAuthConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: allScopes.join(' '),
          prompt: "consent",
          access_type: "offline",
        }
      }
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_APP_ID!,
      clientSecret: process.env.FACEBOOK_APP_SECRET!,
      authorization: {
        params: {
          scope: FACEBOOK_SCOPES.join(','),
          display: 'popup',
          auth_type: 'rerequest'
        }
      },
      profile(profile) {
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          image: profile.picture?.data?.url
        }
      }
    }),
    InstagramProvider({
      clientId: process.env.INSTAGRAM_CLIENT_ID!,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: INSTAGRAM_SCOPES.join(' ')
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
        domain: hostName === 'localhost' ? undefined : '.' + hostName, // 修改為 undefined 以解決 localhost 問題
      },
    },
    callbackUrl: {
      name: `${cookiePrefix}next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
    csrfToken: {
      name: `${cookiePrefix}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
  },
  callbacks: {
    async jwt({ token, account }) {
      try {
        if (account) {
          console.log('[NextAuth][Debug][JWT-Account] 提供者:', account.provider);
          console.log('[NextAuth][Debug][JWT-Account] 訪問令牌:', account.access_token ? `${account.access_token.substring(0, 20)}...` : '無');
          console.log('[NextAuth][Debug][JWT-Account] 授權範圍:', account.scope);
          console.log('[NextAuth][Debug][JWT-Account] 令牌類型:', account.token_type);
          console.log('[NextAuth][Debug][JWT-Account] 完整帳號資訊:', JSON.stringify(account, null, 2));
          
          token.accessToken = account.access_token;
          token.refreshToken = account.refresh_token;
          token.expiresAt = account.expires_at;
        }
        return token;
      } catch (error) {
        console.error("[NextAuth][Error][JWT]", error);
        return token;
      }
    },
    async session({ session, token }) {
      try {
        if (token) {
          session.accessToken = token.accessToken as string;
          session.refreshToken = token.refreshToken as string;
          
          // 添加調試日誌
          console.log('[NextAuth][Debug][Session-Token] 訪問令牌:', session.accessToken ? `${session.accessToken.substring(0, 20)}...` : '無');
          console.log('[NextAuth][Debug][Session-Token] 刷新令牌:', session.refreshToken ? '存在' : '不存在');
        }

        if (session?.user?.email) {
          try {
            const { data: userData } = await supabase
              .from('users')
              .select('*')
              .eq('email', session.user.email)
              .single();

            if (userData) {
              session.user.id = userData.id;
              session.user.role = userData.role;
            }
          } catch (error) {
            console.error('獲取用戶會話數據時出錯：', error);
            // 錯誤時不要阻止返回會話
          }
        }

        return session;
      } catch (error) {
        console.error("[NextAuth][Error][Session]", error);
        return session; // 錯誤時仍返回原始會話
      }
    },
    async redirect({ url, baseUrl }) {
      try {
        // 確保我們總是使用完整的 URL 進行重定向
        console.log('[NextAuth][Debug][Redirect]', { url, baseUrl });
        
        // 如果 URL 是相對路徑，轉換為絕對路徑
        if (url.startsWith('/')) {
          return `${baseUrl}${url}`;
        }
        // 如果它已經是絕對路徑並且域名匹配，則允許
        else if (url.startsWith(baseUrl)) {
          return url;
        }
        // 默認返回首頁
        return baseUrl;
      } catch (error) {
        console.error("[NextAuth][Error][Redirect]", error);
        return baseUrl; // 錯誤時返回基礎 URL
      }
    },
    async signIn({ user, account }) {
      // 即使 Supabase 出錯也允許登入
      if (!user.email) return false;

      try {
        // 添加調試日誌
        console.log('[NextAuth][Debug][SignIn]', { email: user.email, provider: account?.provider });
        
        // 嘗試在 Supabase 中查詢用戶
        try {
          const { data: existingUser, error: queryError } = await supabase
            .from('users')
            .select('*')
            .eq('email', user.email)
            .single();

          if (queryError) {
            console.warn('查詢用戶時出錯，但將繼續處理登入:', queryError);
          }

          if (!existingUser) {
            // 嘗試創建用戶
            try {
              const { error: insertError } = await supabase
                .from('users')
                .insert([{
                  email: user.email,
                  name: user.name,
                  avatar_url: user.image,
                  provider: account?.provider,
                  provider_id: account?.providerAccountId,
                }]);

              if (insertError && insertError.code !== '42P01') {
                console.error('創建用戶失敗：', insertError);
                // 創建失敗不應阻止登入
              }
            } catch (insertCatchError) {
              console.error('創建用戶過程中捕獲到異常：', insertCatchError);
              // 即使創建用戶失敗，仍然允許登入
            }
          } else {
            // 嘗試更新用戶
            try {
              const { error: updateError } = await supabase
                .from('users')
                .update({
                  name: user.name,
                  avatar_url: user.image,
                  last_sign_in: new Date().toISOString(),
                })
                .eq('email', user.email);

              if (updateError && updateError.code !== '42P01') {
                console.error('更新用戶失敗：', updateError);
                // 更新失敗不應阻止登入
              }
            } catch (updateCatchError) {
              console.error('更新用戶過程中捕獲到異常：', updateCatchError);
              // 即使更新用戶失敗，仍然允許登入
            }
          }
        } catch (supabaseError) {
          console.error('Supabase 操作過程中捕獲到異常：', supabaseError);
          // 不要讓 Supabase 錯誤阻止登入
        }

        // 無論 Supabase 操作是否成功，都允許登入
        return true;
      } catch (error) {
        console.error('處理用戶數據時出錯：', error);
        // 即使出現異常，仍然允許登入
        return true;
      }
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
  logger: {
    error: (code, ...message) => {
      console.error(`[Auth][Error][${code}]`, ...message);
    },
    warn: (code, ...message) => {
      console.warn(`[Auth][Warn][${code}]`, ...message);
    },
    debug: (code, ...message) => {
      console.log(`[Auth][Debug][${code}]`, ...message);
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions); 