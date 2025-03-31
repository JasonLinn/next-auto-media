'use client';

import { useState, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { FaUpload, FaYoutube, FaEdit, FaSave, FaTimes } from 'react-icons/fa';

interface UploadBlockProps {
  onUploadComplete?: (videoData: {
    title: string;
    description: string;
    tags: string[];
    url?: string;
    thumbnailUrl?: string;
  }) => void;
}

export default function UploadBlock({ onUploadComplete }: UploadBlockProps) {
  const { data: session } = useSession();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

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

  // 處理縮略圖選擇
  const handleThumbnailSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedThumbnail(file);
        const imageUrl = URL.createObjectURL(file);
        setThumbnailUrl(imageUrl);
        setUploadError(null);
      } else {
        setUploadError('請選擇有效的圖片文件作為縮略圖');
      }
    }
  };

  // 處理文件拖放
  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
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
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  // 處理上傳到 YouTube
  const handleYouTubeUpload = async () => {
    if (!selectedFile || !session?.accessToken) {
      setUploadError('請選擇視頻文件並確保已登入');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    // 創建 FormData 對象
    const formData = new FormData();
    formData.append('video', selectedFile);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('tags', tags);
    
    if (selectedThumbnail) {
      formData.append('thumbnail', selectedThumbnail);
    }

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
        headers: {
          'Authorization': `Bearer ${session.accessToken}`
        }
      });

      clearInterval(progressInterval);

      if (response.ok) {
        const data = await response.json();
        setUploadProgress(100);
        
        if (onUploadComplete) {
          onUploadComplete({
            title,
            description,
            tags: tags.split(',').map(tag => tag.trim()),
            url: data.url,
            thumbnailUrl: data.thumbnailUrl
          });
        }
        
        // 重置表單
        setTimeout(() => {
          setUploading(false);
          setUploadProgress(0);
          setSelectedFile(null);
          setSelectedThumbnail(null);
          setPreviewUrl(null);
          setThumbnailUrl(null);
          setTitle('');
          setDescription('');
          setTags('');
        }, 2000);
      } else {
        const errorData = await response.json();
        setUploadError(errorData.message || '上傳失敗');
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

  // 切換編輯模式
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  // 處理編輯區域的按鍵事件，支持 Tab 鍵
  const handleTabKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // 插入 Tab 字符，通常是 2-4 個空格
      const newValue = textarea.value.substring(0, start) + '    ' + textarea.value.substring(end);
      
      setDescription(newValue);
      
      // 重新設置光標位置
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <FaUpload className="mr-2" /> 上傳視頻
      </h2>

      {/* 上傳區塊 */}
      {!selectedFile ? (
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center cursor-pointer hover:border-blue-500 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            className="hidden" 
            accept="video/*"
          />
          <FaUpload className="mx-auto text-4xl text-gray-400 mb-4" />
          <p className="text-gray-500 mb-2">點擊或拖放視頻文件到此處上傳</p>
          <p className="text-sm text-gray-400">支持 MP4, WebM, MOV 等格式</p>
        </div>
      ) : (
        <div className="mb-6">
          {/* 視頻預覽 */}
          <div className="mb-6">
            {previewUrl && (
              <video 
                src={previewUrl} 
                controls 
                className="w-full rounded-lg shadow-md max-h-[400px]"
              ></video>
            )}
          </div>

          {/* 縮略圖上傳 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">縮略圖</h3>
            
            <div className="flex items-center space-x-4">
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors w-40 h-24 flex items-center justify-center"
                onClick={() => thumbnailInputRef.current?.click()}
              >
                {thumbnailUrl ? (
                  <img src={thumbnailUrl} alt="縮略圖" className="max-w-full max-h-full object-contain" />
                ) : (
                  <>
                    <input 
                      type="file" 
                      ref={thumbnailInputRef} 
                      onChange={handleThumbnailSelect} 
                      className="hidden" 
                      accept="image/*"
                    />
                    <span className="text-sm text-gray-500">上傳縮略圖</span>
                  </>
                )}
              </div>
              
              <div className="text-sm text-gray-500">
                <p>建議使用 1280x720 像素的圖片</p>
                <p>支持 JPG, PNG 等格式</p>
              </div>
            </div>
          </div>

          {/* 視頻信息表單 */}
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                標題 <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="視頻標題"
                  disabled={uploading}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-gray-700 font-semibold">
                  描述
                </label>
                <button 
                  type="button" 
                  onClick={toggleEditMode}
                  className="text-blue-500 hover:text-blue-700 flex items-center text-sm"
                  disabled={uploading}
                >
                  {isEditing ? (
                    <>
                      <FaSave className="mr-1" /> 保存格式
                    </>
                  ) : (
                    <>
                      <FaEdit className="mr-1" /> 進階編輯
                    </>
                  )}
                </button>
              </div>
              
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                onKeyDown={handleTabKey}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] ${isEditing ? 'font-mono' : ''}`}
                placeholder="描述您的視頻內容..."
                disabled={uploading}
                style={isEditing ? { whiteSpace: 'pre', fontFamily: 'monospace' } : {}}
              ></textarea>
              
              {isEditing && (
                <div className="mt-2 text-xs text-gray-500">
                  進階編輯模式：保留空格和換行，支持 Tab 鍵。
                </div>
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                標籤 (逗號分隔)
              </label>
              <input 
                type="text" 
                value={tags} 
                onChange={(e) => setTags(e.target.value)} 
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例如: 教程, 科技, 產品展示"
                disabled={uploading}
              />
            </div>

            {uploadError && (
              <div className="text-red-500 text-sm font-medium py-2">
                {uploadError}
              </div>
            )}

            {/* 上傳進度條 */}
            {uploading && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  上傳中... {uploadProgress}%
                </p>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setSelectedThumbnail(null);
                  setPreviewUrl(null);
                  setThumbnailUrl(null);
                  setTitle('');
                  setDescription('');
                  setTags('');
                  setUploadError(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none flex items-center"
                disabled={uploading}
              >
                <FaTimes className="mr-2" /> 取消
              </button>

              <button
                type="button"
                onClick={handleYouTubeUpload}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none flex items-center"
                disabled={uploading || !title || !selectedFile}
              >
                <FaYoutube className="mr-2" /> 上傳到 YouTube
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 