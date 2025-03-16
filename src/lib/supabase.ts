import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('缺少 Supabase 環境變數');
  // 在開發環境中，我們可以使用一個模擬的 Supabase 客戶端
  if (process.env.NODE_ENV === 'development') {
    console.warn('使用模擬的 Supabase 客戶端');
  } else {
    throw new Error('缺少 Supabase 環境變數');
  }
}

// 創建 Supabase 客戶端
export const supabase = createClient(
  supabaseUrl || 'https://example.com',
  supabaseAnonKey || 'example-key',
  {
    auth: {
      persistSession: false,
    },
  }
);

// 如果在開發環境中且沒有 Supabase 環境變數，使用模擬的方法
if (process.env.NODE_ENV === 'development' && (!supabaseUrl || !supabaseAnonKey)) {
  // 覆蓋 supabase 方法
  const mockData: {
    users: Array<Record<string, any>>;
    oauth_accounts: Array<Record<string, any>>;
  } = {
    users: [],
    oauth_accounts: [],
  };

  // @ts-ignore - 覆蓋方法用於開發環境
  supabase.from = (table: string) => {
    return {
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null }),
        }),
      }),
      insert: async (data: Record<string, any>[]) => {
        if (table === 'users') {
          mockData.users.push(data[0]);
        }
        return { error: null };
      },
      update: async (data: Record<string, any>) => ({
        eq: async () => ({ error: null }),
      }),
      upsert: async (data: Record<string, any>) => {
        if (table === 'oauth_accounts') {
          mockData.oauth_accounts.push(data);
        }
        return { error: null };
      },
    };
  };
} 