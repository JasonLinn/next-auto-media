"use client";

import { YouTubeLogin } from '@/components/social/YouTubeLogin';

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">社群媒體連結</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">YouTube</h2>
          <YouTubeLogin 
            onSuccess={() => console.log('YouTube 連結成功')}
            onError={(error) => console.error('YouTube 連結失敗：', error)}
          />
        </div>
      </div>
    </div>
  );
} 