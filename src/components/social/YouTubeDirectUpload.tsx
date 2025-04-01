"use client";

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaYoutube, FaUpload, FaTimes, FaLock, FaEye, FaEyeSlash, FaSignInAlt, FaInfoCircle, FaMobileAlt } from 'react-icons/fa';
import { signIn } from 'next-auth/react';

type PrivacyStatus = 'public' | 'unlisted' | 'private';

export default function YouTubeDirectUpload() {
  const { data: session, status } = useSession();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [privacyStatus, setPrivacyStatus] = useState<PrivacyStatus>('public');
  const [isShorts, setIsShorts] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 檢查用戶登入狀態 - 修正版
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
      
      // 即使沒有accessToken也設置為已認證，讓用戶可以嘗試上傳
      // API端點會檢查實際的權限
      setIsAuthenticated(true);
      setUploadError(null);
    } else {
      setIsAuthenticated(false);
      setSessionInfo('未登入');
    }
  }, [session, status]);

  // 處理文件選擇
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setSelectedFile(file);
        setTitle(file.name.replace(/\.[^/.]+$/, "")); // 使用文件名作為標題
        const videoUrl = URL.createObjectURL(file);
        setPreviewUrl(videoUrl);
        setUploadError(null);
      } else {
        setUploadError('請選擇有效的視頻文件');
      }
    }
  };

  // 處理文件拖放
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.dataTransfer.files[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setSelectedFile(file);
        setTitle(file.name.replace(/\.[^/.]+$/, "")); // 使用文件名作為標題
        const videoUrl = URL.createObjectURL(file);
        setPreviewUrl(videoUrl);
        setUploadError(null);
      } else {
        setUploadError('請選擇有效的視頻文件');
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  // 獲取隱私設置圖標
  const getPrivacyIcon = (status: PrivacyStatus) => {
    switch (status) {
      case 'public':
        return <FaEye className="mr-1" />;
      case 'unlisted':
        return <FaEyeSlash className="mr-1" />;
      case 'private':
        return <FaLock className="mr-1" />;
      default:
        return null;
    }
  };

  // 獲取隱私設置文字說明
  const getPrivacyDescription = (status: PrivacyStatus) => {
    switch (status) {
      case 'public':
        return '所有人都可以搜索和觀看';
      case 'unlisted':
        return '只有知道連結的人可以觀看';
      case 'private':
        return '只有您可以觀看';
      default:
        return '';
    }
  };

  // 處理登入
  const handleSignIn = async () => {
    await signIn('google', {
      callbackUrl: window.location.href,
      scope: 'https://www.googleapis.com/auth/youtube.upload' // 確保包含YouTube上傳權限
    });
  };

  // 強制重新授權
  const handleForceReauth = async () => {
    await signIn('google', {
      callbackUrl: window.location.href,
      prompt: 'consent',
      scope: 'https://www.googleapis.com/auth/youtube.upload'
    });
  };

  // 處理上傳到 YouTube
  const handleUpload = async () => {
    // 檢查用戶是否已經登入
    if (status !== 'authenticated') {
      setUploadError('請先登入您的Google帳戶並授權YouTube訪問權限');
      return;
    }

    // 檢查是否有選擇文件
    if (!selectedFile) {
      setUploadError('請選擇視頻文件');
      return;
    }

    // 檢查是否有標題
    if (!title.trim()) {
      setUploadError('請輸入視頻標題');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccess(false);

    // 創建 FormData 對象
    const formData = new FormData();
    formData.append('video', selectedFile);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('tags', tags);
    formData.append('privacyStatus', privacyStatus);
    formData.append('isShorts', isShorts.toString());

    try {
      // 模擬上傳進度
      const progressInterval = setInterval(() => {
        setUploadProgress((prevProgress) => {
          const newProgress = prevProgress + 5;
          if (newProgress >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return newProgress;
        });
      }, 500);

      // 發送到我們的 API 端點
      const response = await fetch('/api/youtube/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (response.ok) {
        const data = await response.json();
        setUploadProgress(100);
        setUploadSuccess(true);
        setVideoUrl(data.url || '');
        
        // 重置表單（延遲2秒以顯示成功狀態）
        setTimeout(() => {
          if (!data.url) {
            // 如果沒有獲取到視頻URL，則顯示錯誤
            setUploadError('無法獲取視頻URL');
          }
        }, 2000);
      } else {
        const errorData = await response.json();
        
        // 處理授權問題
        if (response.status === 401 || response.status === 403) {
          setUploadError(`授權問題: ${errorData.message || '請重新授權YouTube訪問'}`);
        } else {
          setUploadError(errorData.message || '上傳失敗');
        }
        
        setUploading(false);
        setUploadProgress(0);
      }
    } catch (error) {
      console.error('上傳過程中發生錯誤:', error);
      setUploadError('上傳過程中發生錯誤');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setTitle('');
    setDescription('');
    setTags('');
    setPrivacyStatus('public');
    setIsShorts(false);
    setUploadError(null);
    setUploading(false);
    setUploadProgress(0);
    setUploadSuccess(false);
    setVideoUrl('');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center text-red-600">
        <FaYoutube className="mr-2" /> 快速上傳至YouTube
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
          <p className="text-blue-700 mb-2">您需要登入並授權才能上傳視頻到YouTube</p>
          <button
            onClick={handleSignIn}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
          >
            <FaSignInAlt className="mr-2" /> 使用Google帳戶登入
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
            <FaSignInAlt className="mr-1" /> 重新授權 YouTube 權限
          </button>
        </div>
      )}

      {status === 'loading' && (
        <div className="text-center py-4">
          <p className="text-gray-600">正在檢查登入狀態...</p>
        </div>
      )}

      {uploadSuccess ? (
        <div className="text-center py-8">
          <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-4">
            <p className="font-semibold">上傳成功！</p>
            {videoUrl && (
              <p className="mt-2">
                <a 
                  href={videoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-500 hover:underline"
                >
                  點擊此處查看您的視頻
                </a>
              </p>
            )}
            <p className="text-sm mt-2 flex items-center justify-center">
              {getPrivacyIcon(privacyStatus)}
              <span>視頻設置為: <strong>{privacyStatus}</strong></span>
            </p>
          </div>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            上傳另一個視頻
          </button>
        </div>
      ) : (
        <>
          {!selectedFile ? (
            <div 
              className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center ${status !== 'authenticated' ? 'opacity-75 pointer-events-none' : 'cursor-pointer hover:border-red-500'} transition-colors`}
              onClick={() => status === 'authenticated' && fileInputRef.current?.click()}
              onDrop={status === 'authenticated' ? handleDrop : undefined}
              onDragOver={status === 'authenticated' ? handleDragOver : undefined}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="hidden" 
                accept="video/*"
                disabled={status !== 'authenticated'}
              />
              <FaUpload className="mx-auto text-3xl text-gray-400 mb-3" />
              <p className="text-gray-500 mb-1">點擊或拖放視頻文件到此處</p>
              <p className="text-sm text-gray-400">支持 MP4, WebM, MOV 等格式</p>
            </div>
          ) : (
            <div>
              {/* 視頻預覽 */}
              {previewUrl && (
                <div className="mb-4">
                  <video 
                    src={previewUrl} 
                    controls 
                    className="w-full h-auto rounded-lg max-h-72 object-contain bg-black"
                  />
                </div>
              )}

              {/* 表單 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">標題 *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="視頻標題"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md h-20"
                    placeholder="視頻描述（可選）"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">標籤</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="以逗號分隔的標籤（可選）"
                  />
                  <p className="text-xs text-gray-500 mt-1">例如: 教學,產品演示,科技</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">隱私設置</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button" 
                      onClick={() => setPrivacyStatus('public')}
                      className={`px-3 py-2 rounded-md text-sm flex items-center justify-center ${
                        privacyStatus === 'public' 
                          ? 'bg-green-100 text-green-800 border border-green-300' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                      disabled={status !== 'authenticated'}
                    >
                      <FaEye className="mr-1" /> 公開
                    </button>
                    <button
                      type="button" 
                      onClick={() => setPrivacyStatus('unlisted')}
                      className={`px-3 py-2 rounded-md text-sm flex items-center justify-center ${
                        privacyStatus === 'unlisted' 
                          ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                      disabled={status !== 'authenticated'}
                    >
                      <FaEyeSlash className="mr-1" /> 不公開
                    </button>
                    <button
                      type="button" 
                      onClick={() => setPrivacyStatus('private')}
                      className={`px-3 py-2 rounded-md text-sm flex items-center justify-center ${
                        privacyStatus === 'private' 
                          ? 'bg-gray-700 text-white' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                      disabled={status !== 'authenticated'}
                    >
                      <FaLock className="mr-1" /> 私人
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{getPrivacyDescription(privacyStatus)}</p>
                </div>

                <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isShorts}
                      onChange={() => setIsShorts(!isShorts)}
                      className="form-checkbox h-4 w-4 text-red-600"
                      disabled={status !== 'authenticated'}
                    />
                    <span className="text-sm font-medium text-gray-700 flex items-center">
                      <FaMobileAlt className="mr-1 text-red-500" /> 
                      上傳為 YouTube Shorts
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-6">
                    Shorts 是垂直短影片格式，適合手機觀看，最長60秒
                  </p>
                </div>

                {uploadError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-md">
                    {uploadError}
                    {(uploadError.includes('授權') || uploadError.includes('權限')) && (
                      <button
                        onClick={handleForceReauth}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline block"
                      >
                        點擊此處重新授權
                      </button>
                    )}
                  </div>
                )}

                {uploading && (
                  <div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      上傳中... {uploadProgress}%
                    </p>
                  </div>
                )}

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-3 py-1.5 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none flex items-center"
                    disabled={uploading}
                  >
                    <FaTimes className="mr-1" /> 取消
                  </button>

                  <button
                    type="button"
                    onClick={handleUpload}
                    className={`px-3 py-1.5 text-white rounded-md focus:outline-none flex items-center ${
                      isShorts ? 'bg-red-500 hover:bg-red-600' : 'bg-red-600 hover:bg-red-700'
                    }`}
                    disabled={uploading || !title || !selectedFile || status !== 'authenticated'}
                  >
                    <FaYoutube className="mr-1" /> {isShorts ? '上傳為 Shorts' : '立即上傳'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 