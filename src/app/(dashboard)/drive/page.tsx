import { Metadata } from 'next';
import FileBrowser from '@/components/drive/FileBrowser';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: '我的雲端硬碟 | 自動媒體',
  description: '瀏覽您的 Google Drive 文件',
};

export default async function DrivePage() {
  // 獲取用戶會話
  const session = await auth();

  // 確保用戶已登入且有訪問令牌
  if (!session || !session.user) {
    // 添加日誌以幫助調試
    console.log('[Drive Page] 未登入，重定向到登入頁面');
    return redirect('/auth/signin?callbackUrl=/drive');
  }

  // 檢查是否有訪問令牌
  if (!session.accessToken) {
    console.log('[Drive Page] 缺少訪問令牌，重定向到登入頁面');
    return redirect('/auth/signin?callbackUrl=/drive&error=missing_token');
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">我的雲端硬碟</h1>
        <p className="text-gray-600 mb-6">
          瀏覽您的 Google Drive 文件和文件夾，輕鬆管理和獲取內容。
        </p>
        
        {/* 文件瀏覽器組件 */}
        <FileBrowser />
      </div>
    </div>
  );
} 