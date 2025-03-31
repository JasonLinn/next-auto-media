"use client";

import { FacebookShare } from '@/components/social/FacebookShare';
import { YouTubeLogin } from '@/components/social/YouTubeLogin';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="w-full max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">社群媒體分享測試</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Facebook</h2>
            <FacebookShare 
              appId={process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || ''}
              content="這是一個測試貼文！#測試 #分享"
              link="https://your-website.com"
              onShare={() => console.log('分享成功！')}
              onError={(error) => console.error('分享失敗：', error)}
            />
          </div>

          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">YouTube</h2>
            <YouTubeLogin 
              onSuccess={() => console.log('YouTube 連結成功')}
              onError={(error) => console.error('YouTube 連結失敗：', error)}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
