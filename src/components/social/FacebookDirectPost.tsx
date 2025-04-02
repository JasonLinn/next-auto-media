"use client";

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaFacebookSquare, FaUpload, FaTimes, FaLock, FaEye, FaUsers, FaSignInAlt, FaInfoCircle, FaImage, FaCheckCircle } from 'react-icons/fa';
import { signIn } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Send } from "lucide-react";
import { toast } from "sonner";

type PrivacyLevel = 'PUBLIC' | 'FRIENDS' | 'ONLY_ME';

// Facebook 頁面介面
interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category?: string;
  picture?: {
    data: {
      url: string;
    };
  };
  selected?: boolean;
}

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

  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState<string>('');
  
  // 載入用戶可管理的粉絲專頁
  useEffect(() => {
    if (session?.accessToken) {
      fetchUserPages(session.accessToken);
    }
  }, [session]);

  // 獲取用戶的 Facebook 粉絲專頁
  const fetchUserPages = async (accessToken: string) => {
    setIsLoadingPages(true);
    setErrorMessage(null);
    try {
      console.log('正在嘗試獲取 Facebook 粉絲專頁...');
      console.log('使用的 Access Token:', accessToken ? `${accessToken.substring(0, 10)}...` : '無');
      
      const response = await fetch(
        `https://graph.facebook.com/v19.0/me/accounts?fields=name,access_token,category,picture&access_token=${accessToken}`
      );
      
      console.log('API 回應狀態:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('獲取頁面失敗，錯誤詳情:', errorData);
        throw new Error('無法獲取您的 Facebook 粉絲專頁');
      }
      
      const data = await response.json();
      console.log('獲取到的粉絲專頁資料:', data);
      
      if (data.data && data.data.length > 0) {
        console.log(`成功獲取 ${data.data.length} 個粉絲專頁`);
        setPages(data.data);
        // 預設選擇第一個頁面
        setSelectedPageId(data.data[0].id);
      } else {
        console.log('未找到粉絲專頁');
        setErrorMessage('未找到您可管理的 Facebook 粉絲專頁。請確保您的帳號連結了至少一個粉絲專頁，並授權應用程式存取。');
      }
    } catch (error: any) {
      console.error('獲取粉絲專頁出錯:', error);
      setErrorMessage(error.message || '無法載入您的 Facebook 粉絲專頁');
    } finally {
      setIsLoadingPages(false);
    }
  };

  // 選擇頁面
  const handleSelectPage = (pageId: string) => {
    setSelectedPageId(pageId);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // 建立預覽圖
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message && !file) {
      toast.error("請輸入訊息或上傳圖片");
      return;
    }

    if (!selectedPageId) {
      toast.error("請選擇要發布到的粉絲專頁");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      const formData = new FormData();
      if (message) formData.append('message', message);
      if (file) formData.append('file', file);
      formData.append('pageId', selectedPageId);

      const response = await fetch('/api/facebook/post', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '發文失敗');
      }

      toast.success("成功發布到 Facebook！");
      // 重置表單
      setMessage('');
      setFile(null);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Facebook 發文錯誤:', error);
      const errorMsg = error.message || '發文失敗，請稍後再試';
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
      
      // 如果錯誤訊息包含特定關鍵詞，提供更詳細的指導
      if (errorMsg.includes('未找到您可管理的Facebook頁面')) {
        setErrorMessage('未找到您可管理的Facebook頁面。請確保：\n1. 您的Facebook帳號管理至少一個粉絲專頁\n2. 您已授權應用程式存取您的粉絲專頁\n3. 您的應用程式已啟用適當的權限');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
          <div className="text-xs text-gray-500 mt-1">
            如果無法載入您的粉絲專頁或發布失敗，請點擊上方按鈕重新授權，並確保同意所有權限請求。
          </div>
        </div>
      )}

      {status === 'loading' && (
        <div className="text-center py-4">
          <p className="text-gray-600">正在檢查登入狀態...</p>
        </div>
      )}

      {isLoadingPages && (
        <div className="text-center py-4">
          <p className="text-gray-600">正在載入您的 Facebook 粉絲專頁...</p>
        </div>
      )}

      {pages.length > 0 && status === 'authenticated' && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">選擇要發布到的粉絲專頁:</h3>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
            {pages.map(page => (
              <div 
                key={page.id}
                onClick={() => handleSelectPage(page.id)}
                className={`p-3 border rounded-md flex items-center cursor-pointer ${selectedPageId === page.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
              >
                <div className="flex-shrink-0 mr-3">
                  {page.picture ? (
                    <img 
                      src={page.picture.data.url} 
                      alt={page.name} 
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <FaFacebookSquare className="text-blue-600" />
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <p className="font-medium text-gray-800">{page.name}</p>
                  <p className="text-xs text-gray-500">{page.category || '粉絲專頁'}</p>
                </div>
                {selectedPageId === page.id && (
                  <FaCheckCircle className="text-blue-500 ml-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {pages.length === 0 && status === 'authenticated' && !isLoadingPages && (
        <div className="bg-yellow-50 p-4 rounded-lg text-yellow-800 mb-4">
          <h3 className="font-bold text-sm">未找到可管理的粉絲專頁</h3>
          <p className="mt-1 text-sm">
            要使用此功能，您需要：
          </p>
          <ol className="list-decimal pl-5 mt-1 text-sm space-y-1">
            <li>確保您的 Facebook 帳號管理至少一個粉絲專頁</li>
            <li>允許應用程式存取您的粉絲專頁（需重新授權並勾選所有權限）</li>
            <li>確保您的粉絲專頁未受到 Meta 平台的限制</li>
          </ol>
          <button
            onClick={handleForceReauth}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
          >
            <FaSignInAlt className="mr-2" /> 重新授權 Facebook
          </button>
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 border rounded-lg">
            <Textarea
              placeholder="輸入您想發布到 Facebook 的訊息..."
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setErrorMessage(null);
              }}
              className="min-h-[100px] resize-none border-none focus-visible:ring-0 p-0"
            />
            
            {preview && (
              <div className="relative mt-2">
                <img src={preview} alt="預覽" className="max-h-64 rounded-md object-contain" />
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  X
                </button>
              </div>
            )}
            
            {errorMessage && (
              <div className="mt-2 text-red-500 text-sm whitespace-pre-line">
                {errorMessage}
              </div>
            )}
          </div>
          
          <div className="flex justify-between">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="fb-file-upload"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="h-4 w-4 mr-2" />
                添加圖片
              </Button>
            </div>
            
            <Button type="submit" disabled={isSubmitting || !selectedPageId} size="sm">
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? '發布中...' : `發布到${selectedPageId ? ' ' + (pages.find(p => p.id === selectedPageId)?.name || 'Facebook') : 'Facebook'}`}
            </Button>
          </div>
          
          <div className="text-sm text-gray-500 mt-2">
            {pages.length > 0 
              ? `您選擇的發布目標：${pages.find(p => p.id === selectedPageId)?.name || '請選擇粉絲專頁'}` 
              : '未找到可發布的粉絲專頁。請確保您已授權應用程式存取您的 Facebook 頁面。'}
          </div>
        </form>
      )}
    </div>
  );
} 