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
            setBreadcrumbs([]);
          }
        }

        const response = await fetch(url);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '加載文件時出錯');
        }

        const data = await response.json();
        setFiles(data.files || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : '未知錯誤');
        console.error('加載文件時出錯:', err);
      } finally {
        setLoading(false);
      }
    }

    loadFiles();
  }, [folderId, query, status]);

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

  // 重新加載
  function handleRetry() {
    setLoading(true);
    setError(null);
    router.refresh();
  }

  // 如果用戶未登入，顯示登入提示
  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">需要登入</h2>
        <p className="text-gray-600 mb-4">請先登入以訪問您的 Google Drive 文件</p>
        <Link
          href="/auth/signin?callbackUrl=/drive"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          登入
        </Link>
      </div>
    );
  }

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
      {!isSearching && (
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

      {/* 錯誤訊息 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
          <button 
            onClick={handleRetry}
            className="flex items-center text-blue-500 hover:text-blue-700"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            重試
          </button>
        </div>
      )}

      {/* 加載中 */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-lg">加載中...</span>
        </div>
      )}

      {/* 文件列表 */}
      {!loading && !error && files.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {isSearching ? '沒有找到符合條件的文件' : '此文件夾為空'}
        </div>
      )}

      {!loading && !error && files.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  名稱
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  修改日期
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  大小
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {files.map((file) => (
                <tr
                  key={file.id}
                  onClick={() => handleFileClick(file)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {file.isFolder ? (
                        <Folder className="h-5 w-5 text-yellow-500 mr-3" />
                      ) : (
                        <File className="h-5 w-5 text-blue-500 mr-3" />
                      )}
                      <div className="text-sm font-medium text-gray-900">
                        {file.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {file.modifiedTime ? formatDate(file.modifiedTime) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {file.size ? formatFileSize(file.size) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      {!file.isFolder && (
                        <>
                          <button
                            onClick={(e) => downloadFile(e, file)}
                            className="text-blue-500 hover:text-blue-700"
                            title="下載"
                          >
                            <Download className="h-5 w-5" />
                          </button>
                          <a
                            href={file.webViewLink || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-blue-500 hover:text-blue-700"
                            title="在 Google Drive 中打開"
                          >
                            <ExternalLink className="h-5 w-5" />
                          </a>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 