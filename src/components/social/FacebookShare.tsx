"use client";

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

interface FacebookLoginResponse {
  status: string;
  authResponse?: {
    accessToken: string;
    userID: string;
  };
}

interface FacebookShareProps {
  appId: string;
  content?: string;
  link?: string;
  onShare?: () => void;
  onError?: (error: any) => void;
}

export const FacebookShare: React.FC<FacebookShareProps> = ({ 
  appId, 
  content = '分享測試內容',
  link,
  onShare, 
  onError 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  useEffect(() => {
    // 初始化 Facebook SDK
    window.fbAsyncInit = function() {
      window.FB.init({
        appId: appId,
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      });
      setIsSDKLoaded(true);
    };

    // 載入 Facebook SDK
    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s) as HTMLScriptElement;
      js.id = id;
      js.src = "https://connect.facebook.net/zh_TW/sdk.js";
      fjs.parentNode?.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  }, [appId]);

  const shareToFacebook = async () => {
    if (!isSDKLoaded) {
      onError?.('Facebook SDK 尚未載入完成');
      return;
    }

    setIsLoading(true);
    try {
      // 先檢查登入狀態
      const loginResponse = await new Promise<FacebookLoginResponse>((resolve) => {
        window.FB.getLoginStatus((response: FacebookLoginResponse) => {
          resolve(response);
        });
      });

      // 如果未登入，則請求登入
      if (loginResponse.status !== 'connected') {
        await new Promise((resolve, reject) => {
          window.FB.login(function(response: FacebookLoginResponse) {
            if (response.authResponse) {
              resolve(response);
            } else {
              reject('使用者取消登入');
            }
          }, { scope: 'public_profile,email,publish_actions' });
        });
      }

      // 發布貼文
      const shareResponse = await new Promise((resolve, reject) => {
        window.FB.api('/me/feed', 'POST', {
          message: content,
          link: link
        }, function(response: any) {
          if (!response || response.error) {
            reject(response?.error || '發布失敗');
          } else {
            resolve(response);
          }
        });
      });

      onShare?.();
      console.log('分享成功：', shareResponse);
    } catch (error) {
      console.error('分享失敗：', error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="facebook-share">
      <button 
        onClick={shareToFacebook}
        disabled={isLoading || !isSDKLoaded}
        className={`
          px-4 py-2 rounded font-bold text-white
          ${isLoading || !isSDKLoaded 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'}
        `}
      >
        {isLoading ? '分享中...' : '分享到 Facebook'}
      </button>
    </div>
  );
}; 