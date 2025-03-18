'use client';

import { useState, useEffect } from 'react';
import { DriveFile } from '@/lib/google-drive';
import { useRouter, useSearchParams } from 'next/navigation';
import { Folder, File, ChevronLeft, Search, Download, ExternalLink, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { formatFileSize, formatDate } from '@/lib/utils';
import { useSession } from 'next-auth/react';

export default function FileBrowser() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const folderId = searchParams?.get('folderId') || 'root';
  const query = searchParams?.get('query') || '';
  const { data: session, status } = useSession();

  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string; name: string }[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // 加載文件列表
  useEffect(() => {
    async function loadFiles() {
      // 如果用戶未登入，不加載文件
      if (status === 'unauthenticated') {
        setError('請先登入以訪問您的 Google Drive');
        setLoading(false);
        return;
      }

      // 如果正在檢查登入狀態，保持加載狀態
      if (status === 'loading') {
        setLoading(true);
        return;
      }

      // 檢查是否有訪問令牌
      if (!session?.accessToken) {
        console.error('[FileBrowser] 缺少訪問令牌');
        setError('缺少訪問令牌，請重新登入');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let url;
        if (query) {
          // 搜索模式
          url = `/api/drive?action=search&query=${encodeURIComponent(query)}`;
          setIsSearching(true);
        } else {
          // 瀏覽模式
          url = `/api/drive?action=list&folderId=${encodeURIComponent(folderId)}`;
          setIsSearching(false);
          
          // 如果不是根目錄，加載麵包屑
          if (folderId !== 'root') {
            await loadBreadcrumbs(folderId);
          } else {
            setBreadcrumbs([{ id: 'root', name: '我的雲端硬碟' }]);
          }
        }

        console.log(`[FileBrowser] 請求文件: ${url}`);
        const response = await fetch(url);
        
        if (!response.ok) {
          console.error(`[FileBrowser] API 響應錯誤: ${response.status}`);
          const errorData = await response.json();
          throw new Error(errorData.error || '加載文件時出錯');
        }

        const data = await response.json();
        console.log(`[FileBrowser] 收到 ${data.files?.length || 0} 個文件`);
        setFiles(data.files || []);
      } catch (err) {
        console.error('[FileBrowser] 載入文件時出錯:', err);
        setError(err instanceof Error ? err.message : '未知錯誤');
      } finally {
        setLoading(false);
      }
    }

    loadFiles();
  }, [folderId, query, status, session?.accessToken]);

  // 加載麵包屑
  async function loadBreadcrumbs(fileId: string) {
    try {
      const breadcrumbsPath: { id: string; name: string }[] = [];
      let currentId = fileId;
      
      while (currentId && currentId !== 'root') {
        const response = await fetch(`/api/drive?action=get&fileId=${encodeURIComponent(currentId)}`);
        
        if (!response.ok) {
          break;
        }
        
        const file = await response.json();
        breadcrumbsPath.unshift({ id: file.id, name: file.name });
        
        // 獲取父文件夾
        if (file.parents && file.parents.length > 0) {
          currentId = file.parents[0];
        } else {
          break;
        }
      }
      
      // 添加根目錄
      breadcrumbsPath.unshift({ id: 'root', name: '我的雲端硬碟' });
      setBreadcrumbs(breadcrumbsPath);
    } catch (err) {
      console.error('加載麵包屑時出錯:', err);
    }
  }

  // 處理搜索
  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/drive?query=${encodeURIComponent(searchInput.trim())}`);
    }
  }

  // 清除搜索
  function clearSearch() {
    setSearchInput('');
    router.push('/drive');
  }

  // 處理文件點擊
  function handleFileClick(file: DriveFile) {
    if (file.isFolder) {
      router.push(`/drive?folderId=${encodeURIComponent(file.id)}`);
    } else {
      // 對於非文件夾，可以預覽或下載
      if (file.webViewLink) {
        window.open(file.webViewLink, '_blank');
      } else {
        // 如果沒有預覽鏈接，嘗試下載
        downloadFile({ stopPropagation: () => {} } as React.MouseEvent, file);
      }
    }
  }

  // 下載文件
  function downloadFile(e: React.MouseEvent, file: DriveFile) {
    e.stopPropagation();
    window.open(`/api/drive/download?fileId=${encodeURIComponent(file.id)}`, '_blank');
  }

  // 處理錯誤顯示
  function ErrorDisplay() {
    if (!error) return null;
    
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-red-50 rounded-lg border border-red-200">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">出錯了</h2>
        <p className="text-gray-600 mb-4 text-center">{error}</p>
        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          重試
        </button>
        
        {error.includes('未認證') || error.includes('登入') ? (
          <Link
            href="/auth/signin?callbackUrl=/drive"
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            重新登入
          </Link>
        ) : null}
      </div>
    );
  }

  // 重新加載
  function handleRetry() {
    setLoading(true);
    setError(null);
    router.refresh();
  }

  // 如果正在加載，顯示加載中
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 text-blue-500 mb-4 animate-spin" />
        <h2 className="text-xl font-semibold">載入中...</h2>
        <p className="text-gray-500 mt-2">正在獲取您的檔案列表</p>
      </div>
    );
  }

  // 如果有錯誤，顯示錯誤信息
  if (error) {
    return <ErrorDisplay />;
  }

  // 如果文件列表為空
  if (files.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="max-w-md mx-auto">
          <p className="text-lg mb-4">
            {isSearching 
              ? `沒有找到與 "${query}" 匹配的文件` 
              : folderId === 'root' 
                ? '您的雲端硬碟中沒有文件' 
                : '此文件夾中沒有文件'}
          </p>
          
          {isSearching && (
            <button
              onClick={clearSearch}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              清除搜索
            </button>
          )}
        </div>
      </div>
    );
  }

  // 主要視圖
  return (
    <div className="container mx-auto p-4">
      {/* 搜索欄 */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="搜索文件..."
              className="w-full p-2 pl-10 border rounded-md"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            搜索
          </button>
          {isSearching && (
            <button
              type="button"
              onClick={clearSearch}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              清除
            </button>
          )}
        </form>
      </div>

      {/* 麵包屑導航 */}
      {!isSearching && breadcrumbs.length > 0 && (
        <div className="flex items-center mb-4 text-sm overflow-x-auto whitespace-nowrap pb-2">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.id} className="flex items-center">
              {index > 0 && <span className="mx-2 text-gray-400">/</span>}
              <Link
                href={`/drive?folderId=${encodeURIComponent(crumb.id)}`}
                className={`hover:text-blue-500 ${
                  index === breadcrumbs.length - 1 ? 'font-semibold' : ''
                }`}
              >
                {crumb.name}
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* 返回按鈕 (搜索模式或非根目錄) */}
      {(isSearching || folderId !== 'root') && (
        <button
          onClick={() => router.push('/drive')}
          className="flex items-center mb-4 text-blue-500 hover:text-blue-700"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          返回我的雲端硬碟
        </button>
      )}

      {/* 搜索結果標題 */}
      {isSearching && (
        <h2 className="text-xl font-semibold mb-4">
          搜索結果: &quot;{query}&quot;
        </h2>
      )}

      {/* 文件列表 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {files.map((file) => (
          <div
            key={file.id}
            onClick={() => handleFileClick(file)}
            className="border rounded-md p-4 cursor-pointer hover:bg-gray-50 transition-colors flex flex-col"
          >
            <div className="flex items-center mb-2">
              {file.isFolder ? (
                <Folder className="h-6 w-6 text-yellow-500 mr-2" />
              ) : (
                <File className="h-6 w-6 text-blue-500 mr-2" />
              )}
              <span className="font-medium truncate" title={file.name}>
                {file.name}
              </span>
            </div>
            
            {file.thumbnailLink && (
              <div className="mb-2 w-full">
                <img
                  src={file.thumbnailLink}
                  alt={file.name}
                  className="w-full h-32 object-contain rounded"
                />
              </div>
            )}
            
            <div className="mt-auto pt-2 text-sm text-gray-500">
              {file.size && (
                <div className="flex justify-between">
                  <span>大小:</span>
                  <span>{formatFileSize(Number(file.size))}</span>
                </div>
              )}
              {file.modifiedTime && (
                <div className="flex justify-between">
                  <span>修改時間:</span>
                  <span>{formatDate(file.modifiedTime)}</span>
                </div>
              )}
            </div>
            
            {!file.isFolder && (
              <div className="flex mt-2 pt-2 border-t">
                <button
                  onClick={(e) => downloadFile(e, file)}
                  className="flex items-center text-sm text-blue-500 hover:text-blue-700 mr-4"
                >
                  <Download className="h-4 w-4 mr-1" />
                  下載
                </button>
                {file.webViewLink && (
                  <a
                    href={file.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-blue-500 hover:text-blue-700"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    預覽
                  </a>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 