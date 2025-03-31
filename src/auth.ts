import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

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

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith("https://");
const cookiePrefix = useSecureCookies ? "__Secure-" : "";
const hostName = new URL(process.env.NEXTAUTH_URL ?? "http://localhost:3000").hostname;

// 配置 NextAuth
export const authOptions: NextAuthConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.upload',
          prompt: "consent",
          access_type: "offline",
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
        domain: hostName === 'localhost' ? hostName : '.' + hostName,
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
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken as string;
        session.refreshToken = token.refreshToken as string;
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
        }
      }

      return session;
    },
    async signIn({ user, account }) {
      if (!user.email) return false;

      try {
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email)
          .single();

        if (!existingUser) {
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
            return false;
          }
        } else {
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
            return false;
          }
        }

        return true;
      } catch (error) {
        console.error('處理用戶數據時出錯：', error);
        return false;
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