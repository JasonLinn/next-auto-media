import { Metadata } from 'next';
import FileBrowser from '@/components/drive/FileBrowser';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: '我的雲端硬碟 | 自動媒體',
  description: '瀏覽您的 Google Drive 文件',
};

export default async function DrivePage() {
  const session = await auth();
  
  // 檢查用戶是否已登入
  if (!session || !session.user) {
    redirect('/auth/signin?callbackUrl=/drive');
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">我的雲端硬碟</h1>
        <FileBrowser />
      </div>
    </div>
  );
} 