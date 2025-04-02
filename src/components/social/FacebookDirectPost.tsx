"use client";

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaFacebookSquare, FaUpload, FaTimes, FaLock, FaEye, FaUsers, FaSignInAlt, FaInfoCircle, FaImage } from 'react-icons/fa';
import { signIn } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Send } from "lucide-react";
import { toast } from "sonner";

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

  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      const formData = new FormData();
      if (message) formData.append('message', message);
      if (file) formData.append('file', file);

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
            
            <Button type="submit" disabled={isSubmitting} size="sm">
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? '發布中...' : '發布到 Facebook'}
            </Button>
          </div>
          
          <div className="text-sm text-gray-500 mt-2">
            注意：發布內容將顯示在您管理的第一個 Facebook 頁面上。
            確保您已授權應用程式存取您的 Facebook 頁面。
          </div>
        </form>
      )}
    </div>
  );
} 