"use client";

import { signIn, useSession } from 'next-auth/react';
import { FaYoutube } from 'react-icons/fa';

interface YouTubeLoginProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const YouTubeLogin: React.FC<YouTubeLoginProps> = ({ onSuccess, onError }) => {
  const { data: session } = useSession();

  const handleLogin = async () => {
    try {
      const result = await signIn('google', {
        callbackUrl: '/dashboard',
        scope: 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.upload',
      });
      
      if (result?.error) {
        onError?.(result.error);
      } else {
        onSuccess?.();
      }
    } catch (error) {
      console.error('YouTube 登入失敗：', error);
      onError?.(error);
    }
  };

  return (
    <button
      onClick={handleLogin}
      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
    >
      <FaYoutube className="text-xl" />
      {session?.user ? '已連結 YouTube' : '連結 YouTube'}
    </button>
  );
}; 