"use client";

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaTimes, FaSignInAlt, FaInfoCircle, FaImage, FaPlus } from 'react-icons/fa';
import { signIn } from 'next-auth/react';

export default function ThreadsDirectPost() {
  const { data: session, status } = useSession();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [postSuccess, setPostSuccess] = useState(false);
  const [postUrl, setPostUrl] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_IMAGES = 4; // Threads 最多支持 4 張圖片

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
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFiles: File[] = [];
      const newUrls: string[] = [];
      let hasError = false;
      
      // 計算可添加的圖片數量
      const remainingSlots = MAX_IMAGES - selectedFiles.length;
      const filesToProcess = Math.min(files.length, remainingSlots);
      
      for (let i = 0; i < filesToProcess; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          newFiles.push(file);
          newUrls.push(URL.createObjectURL(file));
        } else {
          hasError = true;
        }
      }
      
      if (hasError) {
        setPostError('部分文件不是圖片，已被忽略');
      } else {
        setPostError(null);
      }
      
      if (files.length > remainingSlots) {
        setPostError(`超過最大圖片數量限制，只添加了前 ${remainingSlots} 張圖片`);
      }
      
      if (newFiles.length > 0) {
        setSelectedFiles([...selectedFiles, ...newFiles]);
        setPreviewUrls([...previewUrls, ...newUrls]);
      }
    }
  };

  // 處理文件拖放
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const newFiles: File[] = [];
      const newUrls: string[] = [];
      let hasError = false;
      
      // 計算可添加的圖片數量
      const remainingSlots = MAX_IMAGES - selectedFiles.length;
      const filesToProcess = Math.min(files.length, remainingSlots);
      
      for (let i = 0; i < filesToProcess; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          newFiles.push(file);
          newUrls.push(URL.createObjectURL(file));
        } else {
          hasError = true;
        }
      }
      
      if (hasError) {
        setPostError('部分文件不是圖片，已被忽略');
      } else {
        setPostError(null);
      }
      
      if (files.length > remainingSlots) {
        setPostError(`超過最大圖片數量限制，只添加了前 ${remainingSlots} 張圖片`);
      }
      
      if (newFiles.length > 0) {
        setSelectedFiles([...selectedFiles, ...newFiles]);
        setPreviewUrls([...previewUrls, ...newUrls]);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  // 移除選中的圖片
  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles];
    const newUrls = [...previewUrls];
    
    // 釋放 URL 對象
    URL.revokeObjectURL(newUrls[index]);
    
    newFiles.splice(index, 1);
    newUrls.splice(index, 1);
    
    setSelectedFiles(newFiles);
    setPreviewUrls(newUrls);
  };

  // 處理登入
  const handleSignIn = async () => {
    await signIn('instagram', { // Threads 使用 Instagram 的 OAuth
      callbackUrl: window.location.href
    });
  };

  // 強制重新授權
  const handleForceReauth = async () => {
    await signIn('instagram', {
      callbackUrl: window.location.href,
      prompt: 'consent'
    });
  };

  // 處理發布到 Threads
  const handlePost = async () => {
    // 檢查用戶是否已經登入
    if (status !== 'authenticated') {
      setPostError('請先登入您的Threads/Instagram帳戶');
      return;
    }

    // 檢查是否有內容
    if (!content.trim() && selectedFiles.length === 0) {
      setPostError('請輸入文字內容或選擇圖片');
      return;
    }

    setPosting(true);
    setPostError(null);
    setPostSuccess(false);

    // 創建 FormData 對象
    const formData = new FormData();
    formData.append('content', content);
    formData.append('imageCount', selectedFiles.length.toString());
    selectedFiles.forEach((file, index) => {
      formData.append(`image${index}`, file);
    });

    try {
      // 發送到我們的 API 端點
      const response = await fetch('/api/threads/post', {
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
          setPostError(`授權問題: ${errorData.message || '請重新授權Threads訪問'}`);
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
    // 釋放所有 URL 對象
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    
    setSelectedFiles([]);
    setPreviewUrls([]);
    setContent('');
    setPostError(null);
    setPosting(false);
    setPostSuccess(false);
    setPostUrl('');
  };

  // 計算剩餘字數
  const MAX_CHARS = 500;
  const remainingChars = MAX_CHARS - content.length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center text-gray-800">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-2">
          <path d="M14.258 10.152L23.176 0h-2.113l-7.747 8.813L7.133 0H0l9.352 13.328L0 23.973h2.113l8.176-9.309 6.531 9.309h7.133zm-2.895 3.293l-.949-1.328L2.875 1.56h3.246l6.086 8.523.945 1.328 7.91 11.078h-3.246z" />
        </svg>
        發布到 Threads
      </h2>
      
      {/* 會話信息 - 僅作調試用途 */}
      {sessionInfo && (
        <div className="mb-4 text-sm flex items-center text-gray-600 bg-gray-100 p-2 rounded">
          <FaInfoCircle className="mr-2" /> {sessionInfo}
        </div>
      )}

      {/* 未登入狀態提示 */}
      {status !== 'authenticated' && status !== 'loading' && (
        <div className="text-center py-4 mb-4 bg-gray-50 rounded-lg">
          <p className="text-gray-700 mb-2">您需要登入並授權才能發布到Threads</p>
          <button
            onClick={handleSignIn}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center mx-auto"
          >
            <FaSignInAlt className="mr-2" /> 使用Instagram帳戶登入
          </button>
        </div>
      )}

      {/* 重新授權按鈕 */}
      {status === 'authenticated' && (
        <div className="text-right mb-2">
          <button
            onClick={handleForceReauth}
            className="text-sm text-gray-600 hover:underline flex items-center ml-auto"
          >
            <FaSignInAlt className="mr-1" /> 重新授權 Threads 權限
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
          </div>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            發布新貼文
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 文字內容輸入 */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">文字內容</label>
              <span className={`text-xs ${remainingChars < 50 ? 'text-red-500' : 'text-gray-500'}`}>
                {remainingChars}
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border rounded-md h-32"
              placeholder="分享您的想法..."
              disabled={status !== 'authenticated' || posting}
              maxLength={MAX_CHARS}
            />
          </div>

          {/* 圖片上傳區域 */}
          <div>
            <p className="block text-sm font-medium text-gray-700 mb-2">
              添加圖片 <span className="text-gray-500">(選填，最多 {MAX_IMAGES} 張)</span>
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {/* 已上傳圖片預覽 */}
              {previewUrls.map((url, index) => (
                <div key={index} className="relative aspect-square border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                  <img 
                    src={url} 
                    alt={`預覽圖片 ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 shadow-sm"
                    disabled={posting}
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              ))}
              
              {/* 添加新圖片按鈕 */}
              {selectedFiles.length < MAX_IMAGES && (
                <div 
                  className={`aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center ${status !== 'authenticated' ? 'opacity-75 pointer-events-none' : 'cursor-pointer hover:border-gray-500'} transition-colors`}
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
                    multiple
                    disabled={status !== 'authenticated'}
                  />
                  <FaPlus className="text-gray-400 mb-1" size={20} />
                  <p className="text-xs text-gray-500">添加圖片</p>
                </div>
              )}
            </div>
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
                  className="bg-black h-2 rounded-full animate-pulse" 
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
              className="px-3 py-1.5 text-white bg-black rounded-md hover:bg-gray-800 focus:outline-none flex items-center"
              disabled={posting || (!content.trim() && selectedFiles.length === 0) || status !== 'authenticated'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1">
                <path d="M14.258 10.152L23.176 0h-2.113l-7.747 8.813L7.133 0H0l9.352 13.328L0 23.973h2.113l8.176-9.309 6.531 9.309h7.133zm-2.895 3.293l-.949-1.328L2.875 1.56h3.246l6.086 8.523.945 1.328 7.91 11.078h-3.246z" />
              </svg>
              立即發布
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 