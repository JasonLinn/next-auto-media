"use client";

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaInstagram, FaTimes, FaSignInAlt, FaInfoCircle, FaImage, FaPlus } from 'react-icons/fa';
import { signIn } from 'next-auth/react';

export default function InstagramDirectPost() {
  const { data: session, status } = useSession();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
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
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFiles: File[] = [];
      const newUrls: string[] = [];
      let hasError = false;
      
      for (let i = 0; i < files.length; i++) {
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
      
      for (let i = 0; i < files.length; i++) {
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
    await signIn('instagram', {
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

  // 處理發布到 Instagram
  const handlePost = async () => {
    // 檢查用戶是否已經登入
    if (status !== 'authenticated') {
      setPostError('請先登入您的Instagram帳戶');
      return;
    }

    // 檢查是否有選擇圖片
    if (selectedFiles.length === 0) {
      setPostError('請至少選擇一張圖片上傳');
      return;
    }

    setPosting(true);
    setPostError(null);
    setPostSuccess(false);

    // 創建 FormData 對象
    const formData = new FormData();
    selectedFiles.forEach((file, index) => {
      formData.append(`image${index}`, file);
    });
    formData.append('caption', caption);
    formData.append('hashtags', hashtags);
    formData.append('imageCount', selectedFiles.length.toString());

    try {
      // 發送到我們的 API 端點
      const response = await fetch('/api/instagram/post', {
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
          setPostError(`授權問題: ${errorData.message || '請重新授權Instagram訪問'}`);
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
    setCaption('');
    setHashtags('');
    setPostError(null);
    setPosting(false);
    setPostSuccess(false);
    setPostUrl('');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center text-pink-600">
        <FaInstagram className="mr-2" /> 發布到 Instagram
      </h2>
      
      {/* 會話信息 - 僅作調試用途 */}
      {sessionInfo && (
        <div className="mb-4 text-sm flex items-center text-gray-600 bg-gray-100 p-2 rounded">
          <FaInfoCircle className="mr-2" /> {sessionInfo}
        </div>
      )}

      {/* 未登入狀態提示 */}
      {status !== 'authenticated' && status !== 'loading' && (
        <div className="text-center py-4 mb-4 bg-pink-50 rounded-lg">
          <p className="text-pink-700 mb-2">您需要登入並授權才能發布到Instagram</p>
          <button
            onClick={handleSignIn}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors flex items-center mx-auto"
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
            className="text-sm text-pink-600 hover:underline flex items-center ml-auto"
          >
            <FaSignInAlt className="mr-1" /> 重新授權 Instagram 權限
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
                  className="text-pink-500 hover:underline"
                >
                  點擊此處查看您的貼文
                </a>
              </p>
            )}
          </div>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
          >
            發布新貼文
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 圖片上傳區域 */}
          <div>
            <p className="block text-sm font-medium text-gray-700 mb-2">
              選擇圖片 <span className="text-gray-500">(必須)</span>
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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
                  <span className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </span>
                </div>
              ))}
              
              {/* 添加新圖片按鈕 */}
              {selectedFiles.length < 10 && (
                <div 
                  className={`aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center ${status !== 'authenticated' ? 'opacity-75 pointer-events-none' : 'cursor-pointer hover:border-pink-500'} transition-colors`}
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
            
            <p className="text-xs text-gray-500 mt-1">
              最多可上傳10張圖片。支持 JPG, PNG 格式。
            </p>
          </div>

          {/* 說明文字輸入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">說明文字</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-3 py-2 border rounded-md h-24"
              placeholder="為您的貼文添加說明..."
              disabled={status !== 'authenticated' || posting}
              maxLength={2200}
            />
            <p className="text-xs text-gray-500 text-right mt-1">
              {caption.length}/2200
            </p>
          </div>

          {/* 標籤輸入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              標籤 <span className="text-gray-500">(用空格分隔，不用輸入 #)</span>
            </label>
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="例如: photography nature travel"
              disabled={status !== 'authenticated' || posting}
            />
            <div className="flex flex-wrap gap-1 mt-2">
              {hashtags.split(/\s+/).filter(tag => tag.trim()).map((tag, index) => (
                <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {postError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md">
              {postError}
              {(postError.includes('授權') || postError.includes('權限')) && (
                <button
                  onClick={handleForceReauth}
                  className="mt-2 text-sm text-pink-600 hover:text-pink-800 underline block"
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
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full animate-pulse" 
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
              className="px-3 py-1.5 text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-md hover:from-purple-600 hover:to-pink-600 focus:outline-none flex items-center"
              disabled={posting || selectedFiles.length === 0 || status !== 'authenticated'}
            >
              <FaInstagram className="mr-1" /> 立即發布
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 