"use client";

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaFacebookSquare, FaUpload, FaTimes, FaLock, FaEye, FaUsers, FaSignInAlt, FaInfoCircle, FaImage } from 'react-icons/fa';
import { signIn } from 'next-auth/react';

type PrivacyLevel = 'PUBLIC' | 'FRIENDS' | 'ONLY_ME';

export default function FacebookDirectPost() {
  const { data: session, status } = useSession();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [link, setLink] = useState('');
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyLevel>('PUBLIC');
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [postSuccess, setPostSuccess] = useState(false);
  const [postUrl, setPostUrl] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 檢查用戶登入狀態
  useEffect(() => {
    console.log('Session Status:', status);
    console.log('Session Data:', session);
    
    if (status === 'loading') {
      setSessionInfo('正在檢查登入狀態...');
      return;
    }
    
    if (status === 'authenticated') {
      // 設置會話信息，方便調試
      setSessionInfo(`已登入: ${session?.user?.email || '未知用戶'}`);
      
      setIsAuthenticated(true);
      setPostError(null);
    } else {
      setIsAuthenticated(false);
      setSessionInfo('未登入');
    }
  }, [session, status]);

  // 處理文件選擇
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        const imageUrl = URL.createObjectURL(file);
        setPreviewUrl(imageUrl);
        setPostError(null);
      } else {
        setPostError('請選擇有效的圖片文件');
      }
    }
  };

  // 處理文件拖放
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.dataTransfer.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        const imageUrl = URL.createObjectURL(file);
        setPreviewUrl(imageUrl);
        setPostError(null);
      } else {
        setPostError('請選擇有效的圖片文件');
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  // 獲取隱私設置圖標
  const getPrivacyIcon = (level: PrivacyLevel) => {
    switch (level) {
      case 'PUBLIC':
        return <FaEye className="mr-1" />;
      case 'FRIENDS':
        return <FaUsers className="mr-1" />;
      case 'ONLY_ME':
        return <FaLock className="mr-1" />;
      default:
        return null;
    }
  };

  // 獲取隱私設置文字說明
  const getPrivacyDescription = (level: PrivacyLevel) => {
    switch (level) {
      case 'PUBLIC':
        return '所有人都可以看到';
      case 'FRIENDS':
        return '只有朋友可以看到';
      case 'ONLY_ME':
        return '只有自己可以看到';
      default:
        return '';
    }
  };

  // 處理登入
  const handleSignIn = async () => {
    await signIn('facebook', {
      callbackUrl: window.location.href
    });
  };

  // 強制重新授權
  const handleForceReauth = async () => {
    await signIn('facebook', {
      callbackUrl: window.location.href,
      prompt: 'consent'
    });
  };

  // 處理發布到 Facebook
  const handlePost = async () => {
    // 檢查用戶是否已經登入
    if (status !== 'authenticated') {
      setPostError('請先登入您的Facebook帳戶');
      return;
    }

    // 檢查是否有內容
    if (!content.trim() && !selectedFile) {
      setPostError('請輸入貼文內容或上傳圖片');
      return;
    }

    setPosting(true);
    setPostError(null);
    setPostSuccess(false);

    // 創建 FormData 對象
    const formData = new FormData();
    if (selectedFile) {
      formData.append('image', selectedFile);
    }
    formData.append('content', content);
    if (link) {
      formData.append('link', link);
    }
    formData.append('privacyLevel', privacyLevel);

    try {
      // 發送到我們的 API 端點
      const response = await fetch('/api/facebook/post', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setPostSuccess(true);
        setPostUrl(data.url || '');
        
        // 重置表單（延遲2秒以顯示成功狀態）
        setTimeout(() => {
          if (!data.url) {
            // 如果沒有獲取到貼文URL，則顯示錯誤
            setPostError('無法獲取貼文URL');
          }
        }, 2000);
      } else {
        const errorData = await response.json();
        
        // 處理授權問題
        if (response.status === 401 || response.status === 403) {
          setPostError(`授權問題: ${errorData.message || '請重新授權Facebook訪問'}`);
        } else {
          setPostError(errorData.message || '發布失敗');
        }
      }
    } catch (error) {
      console.error('發布過程中發生錯誤:', error);
      setPostError('發布過程中發生錯誤');
    } finally {
      setPosting(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setContent('');
    setLink('');
    setPrivacyLevel('PUBLIC');
    setPostError(null);
    setPosting(false);
    setPostSuccess(false);
    setPostUrl('');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center text-blue-600">
        <FaFacebookSquare className="mr-2" /> 發布到 Facebook
      </h2>
      
      {/* 會話信息 - 僅作調試用途 */}
      {sessionInfo && (
        <div className="mb-4 text-sm flex items-center text-gray-600 bg-gray-100 p-2 rounded">
          <FaInfoCircle className="mr-2" /> {sessionInfo}
        </div>
      )}

      {/* 未登入狀態提示 */}
      {status !== 'authenticated' && status !== 'loading' && (
        <div className="text-center py-4 mb-4 bg-blue-50 rounded-lg">
          <p className="text-blue-700 mb-2">您需要登入並授權才能發布到Facebook</p>
          <button
            onClick={handleSignIn}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
          >
            <FaSignInAlt className="mr-2" /> 使用Facebook帳戶登入
          </button>
        </div>
      )}

      {/* 重新授權按鈕 */}
      {status === 'authenticated' && (
        <div className="text-right mb-2">
          <button
            onClick={handleForceReauth}
            className="text-sm text-blue-600 hover:underline flex items-center ml-auto"
          >
            <FaSignInAlt className="mr-1" /> 重新授權 Facebook 權限
          </button>
        </div>
      )}

      {status === 'loading' && (
        <div className="text-center py-4">
          <p className="text-gray-600">正在檢查登入狀態...</p>
        </div>
      )}

      {postSuccess ? (
        <div className="text-center py-8">
          <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-4">
            <p className="font-semibold">發布成功！</p>
            {postUrl && (
              <p className="mt-2">
                <a 
                  href={postUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-500 hover:underline"
                >
                  點擊此處查看您的貼文
                </a>
              </p>
            )}
            <p className="text-sm mt-2 flex items-center justify-center">
              {getPrivacyIcon(privacyLevel)}
              <span>貼文設置為: <strong>{getPrivacyDescription(privacyLevel)}</strong></span>
            </p>
          </div>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            發布新貼文
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 貼文內容輸入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">貼文內容</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border rounded-md h-32"
              placeholder="分享您的想法..."
              disabled={status !== 'authenticated' || posting}
            />
          </div>

          {/* 鏈結輸入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">鏈結 (選填)</label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="https://example.com"
              disabled={status !== 'authenticated' || posting}
            />
          </div>

          {/* 圖片上傳區域 */}
          {!selectedFile ? (
            <div 
              className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center ${status !== 'authenticated' ? 'opacity-75 pointer-events-none' : 'cursor-pointer hover:border-blue-500'} transition-colors`}
              onClick={() => status === 'authenticated' && fileInputRef.current?.click()}
              onDrop={status === 'authenticated' ? handleDrop : undefined}
              onDragOver={status === 'authenticated' ? handleDragOver : undefined}
              >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="hidden" 
                accept="image/*"
                disabled={status !== 'authenticated'}
              />
              <FaImage className="mx-auto text-3xl text-gray-400 mb-3" />
              <p className="text-gray-500 mb-1">點擊或拖放圖片文件到此處</p>
              <p className="text-sm text-gray-400">支持 JPG, PNG, GIF 等格式</p>
            </div>
          ) : (
            <div className="relative border border-gray-300 rounded-lg overflow-hidden">
              <img 
                src={previewUrl || ''} 
                alt="預覽圖片" 
                className="w-full h-auto max-h-60 object-contain"
              />
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                disabled={posting}
              >
                <FaTimes />
              </button>
            </div>
          )}

          {/* 隱私設置 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">隱私設置</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button" 
                onClick={() => setPrivacyLevel('PUBLIC')}
                className={`px-3 py-2 rounded-md text-sm flex items-center justify-center ${
                  privacyLevel === 'PUBLIC' 
                    ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
                disabled={status !== 'authenticated' || posting}
              >
                <FaEye className="mr-1" /> 公開
              </button>
              <button
                type="button" 
                onClick={() => setPrivacyLevel('FRIENDS')}
                className={`px-3 py-2 rounded-md text-sm flex items-center justify-center ${
                  privacyLevel === 'FRIENDS' 
                    ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
                disabled={status !== 'authenticated' || posting}
              >
                <FaUsers className="mr-1" /> 朋友
              </button>
              <button
                type="button" 
                onClick={() => setPrivacyLevel('ONLY_ME')}
                className={`px-3 py-2 rounded-md text-sm flex items-center justify-center ${
                  privacyLevel === 'ONLY_ME' 
                    ? 'bg-gray-700 text-white' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
                disabled={status !== 'authenticated' || posting}
              >
                <FaLock className="mr-1" /> 僅自己
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">{getPrivacyDescription(privacyLevel)}</p>
          </div>

          {postError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md">
              {postError}
              {(postError.includes('授權') || postError.includes('權限')) && (
                <button
                  onClick={handleForceReauth}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline block"
                >
                  點擊此處重新授權
                </button>
              )}
            </div>
          )}

          {posting && (
            <div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full animate-pulse" 
                  style={{ width: '100%' }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                正在發布...
              </p>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none flex items-center"
              disabled={posting}
            >
              <FaTimes className="mr-1" /> 清除
            </button>

            <button
              type="button"
              onClick={handlePost}
              className="px-3 py-1.5 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none flex items-center"
              disabled={posting || (!content.trim() && !selectedFile) || status !== 'authenticated'}
            >
              <FaFacebookSquare className="mr-1" /> 立即發布
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 