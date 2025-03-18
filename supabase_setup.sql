-- 創建 users 表格
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  provider TEXT,
  provider_id TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_sign_in TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 創建 oauth_accounts 表格
CREATE TABLE IF NOT EXISTS public.oauth_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT NOT NULL REFERENCES public.users(email) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  access_token TEXT,
  token_type TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT,
  id_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider, provider_account_id)
);

-- 設置 RLS 策略
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_accounts ENABLE ROW LEVEL SECURITY;

-- 創建 users 表格的 RLS 策略
CREATE POLICY "允許用戶讀取自己的資料" ON public.users
  FOR SELECT USING (auth.uid()::text = id::text OR auth.jwt() ->> 'email' = email);

CREATE POLICY "允許用戶更新自己的資料" ON public.users
  FOR UPDATE USING (auth.uid()::text = id::text OR auth.jwt() ->> 'email' = email);

-- 允許匿名用戶插入資料 (重要: 解決註冊問題)
CREATE POLICY "允許所有用戶插入資料" ON public.users
  FOR INSERT WITH CHECK (true);

-- 創建 oauth_accounts 表格的 RLS 策略
CREATE POLICY "允許用戶讀取自己的 OAuth 帳戶" ON public.oauth_accounts
  FOR SELECT USING (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "允許所有用戶插入 OAuth 帳戶" ON public.oauth_accounts
  FOR INSERT WITH CHECK (true);

-- 允許 anon 和 authenticated 角色訪問這些表格
GRANT SELECT, INSERT, UPDATE ON public.users TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.oauth_accounts TO anon, authenticated;

-- 允許使用序列
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated; 