'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import UploadBlock from '@/components/upload/UploadBlock';

export default function CreatePage() {
  const { data: session, status } = useSession();
  const [uploadedVideo, setUploadedVideo] = useState<any>(null);

  const handleUploadComplete = (videoData: any) => {
    setUploadedVideo(videoData);
    // 顯示成功通知或其他操作
  };

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="w-full text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-8">
          <h2 className="text-xl font-semibold text-yellow-700 mb-2">需要登入</h2>
          <p className="text-yellow-600">請先登入以使用上傳功能。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">創建新內容</h1>

      {/* 上傳成功通知 */}
      {uploadedVideo && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-8">
          <h2 className="text-xl font-semibold text-green-700 mb-2">上傳成功！</h2>
          <p className="text-green-600 mb-2">
            您的視頻「{uploadedVideo.title}」已成功上傳到 YouTube。
          </p>
          {uploadedVideo.url && (
            <a 
              href={uploadedVideo.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              在 YouTube 上查看
            </a>
          )}
        </div>
      )}

      {/* 上傳區塊 */}
      <UploadBlock onUploadComplete={handleUploadComplete} />

      {/* 提示與說明 */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-8">
        <h2 className="text-lg font-semibold text-blue-700 mb-2">使用提示</h2>
        <ul className="list-disc list-inside space-y-2 text-blue-600">
          <li>確保已授權應用程序訪問您的 YouTube 帳戶</li>
          <li>上傳的視頻默認設為私人，您可以稍後在 YouTube 工作室中修改隱私設置</li>
          <li>描述中可以使用格式化文本，支持換行和空格</li>
          <li>標籤之間請使用逗號分隔</li>
          <li>為獲得更好的影片曝光率，建議添加縮略圖和詳細的描述</li>
        </ul>
      </div>
    </div>
  );
} 