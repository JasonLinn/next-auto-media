'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaGoogle, FaFolder, FaFile, FaVideo, FaImage, FaArrowLeft, FaSearch, FaCheck } from 'react-icons/fa';

type DriveItem = {
  id: string;
  name: string;
  type: 'folder' | 'video' | 'image' | 'document';
  modifiedTime: string;
  size?: string;
  thumbnail?: string;
};

export default function GoogleDrive() {
  const [isConnected, setIsConnected] = useState(false);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // 模擬 Google Drive 數據
  const driveItems: { [key: string]: DriveItem[] } = {
    'root': [
      { id: 'folder1', name: '視頻', type: 'folder', modifiedTime: '2025-03-10T11:00:00Z' },
      { id: 'folder2', name: '圖片', type: 'folder', modifiedTime: '2025-03-08T09:30:00Z' },
      { id: 'folder3', name: '文檔', type: 'folder', modifiedTime: '2025-03-05T14:15:00Z' },
      { id: 'video1', name: '公司介紹.mp4', type: 'video', modifiedTime: '2025-03-01T16:45:00Z', size: '24.5 MB', thumbnail: 'https://via.placeholder.com/100x60/2563eb/ffffff?text=視頻' },
    ],
    'folder1': [
      { id: 'video2', name: '產品演示.mp4', type: 'video', modifiedTime: '2025-02-28T10:20:00Z', size: '18.2 MB', thumbnail: 'https://via.placeholder.com/100x60/f59e0b/ffffff?text=視頻' },
      { id: 'video3', name: '用戶見證.mp4', type: 'video', modifiedTime: '2025-02-25T13:10:00Z', size: '12.7 MB', thumbnail: 'https://via.placeholder.com/100x60/10b981/ffffff?text=視頻' },
      { id: 'video4', name: '教學視頻.mp4', type: 'video', modifiedTime: '2025-02-20T15:30:00Z', size: '32.1 MB', thumbnail: 'https://via.placeholder.com/100x60/8b5cf6/ffffff?text=視頻' },
    ],
    'folder2': [
      { id: 'image1', name: '產品照片.jpg', type: 'image', modifiedTime: '2025-02-18T09:45:00Z', size: '3.5 MB', thumbnail: 'https://via.placeholder.com/100x60/ef4444/ffffff?text=圖片' },
      { id: 'image2', name: '公司標誌.png', type: 'image', modifiedTime: '2025-02-15T14:20:00Z', size: '1.2 MB', thumbnail: 'https://via.placeholder.com/100x60/ec4899/ffffff?text=圖片' },
      { id: 'image3', name: '團隊合照.jpg', type: 'image', modifiedTime: '2025-02-10T11:30:00Z', size: '4.8 MB', thumbnail: 'https://via.placeholder.com/100x60/3b82f6/ffffff?text=圖片' },
    ],
    'folder3': [
      { id: 'doc1', name: '產品說明書.pdf', type: 'document', modifiedTime: '2025-02-08T16:15:00Z', size: '2.3 MB' },
      { id: 'doc2', name: '市場分析.docx', type: 'document', modifiedTime: '2025-02-05T10:40:00Z', size: '1.5 MB' },
      { id: 'doc3', name: '財務報告.xlsx', type: 'document', modifiedTime: '2025-02-01T13:25:00Z', size: '0.8 MB' },
    ],
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getCurrentItems = () => {
    const pathKey = currentPath.length === 0 ? 'root' : currentPath[currentPath.length - 1];
    return driveItems[pathKey] || [];
  };

  const navigateToFolder = (folderId: string, folderName: string) => {
    setCurrentPath([...currentPath, folderId]);
  };

  const navigateBack = () => {
    setCurrentPath(currentPath.slice(0, -1));
  };

  const toggleSelectItem = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'folder':
        return <FaFolder className="text-yellow-500" />;
      case 'video':
        return <FaVideo className="text-blue-500" />;
      case 'image':
        return <FaImage className="text-green-500" />;
      case 'document':
        return <FaFile className="text-red-500" />;
      default:
        return <FaFile className="text-gray-500" />;
    }
  };

  const filteredItems = getCurrentItems().filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConnect = () => {
    // 模擬 Google Drive 連接
    setIsConnected(true);
  };

  const handleImport = () => {
    // 模擬導入選中的文件
    alert(`已選擇 ${selectedItems.length} 個文件進行導入`);
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Google Drive</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto text-center">
          <FaGoogle className="text-6xl text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">連接您的 Google Drive</h2>
          <p className="text-gray-600 mb-6">
            連接您的 Google Drive 帳戶以瀏覽和選擇媒體文件。我們只會讀取您的文件，不會進行任何修改。
          </p>
          <button 
            onClick={handleConnect}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg flex items-center justify-center mx-auto"
          >
            <FaGoogle className="mr-2" />
            連接 Google Drive
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Google Drive</h1>
        <button 
          onClick={handleImport}
          disabled={selectedItems.length === 0}
          className={`px-4 py-2 rounded-lg flex items-center ${
            selectedItems.length > 0 
              ? 'bg-blue-500 hover:bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          導入選中的文件 ({selectedItems.length})
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center">
            {currentPath.length > 0 && (
              <button 
                onClick={navigateBack}
                className="mr-4 text-blue-500 hover:text-blue-700"
              >
                <FaArrowLeft />
              </button>
            )}
            <div className="text-lg font-medium">
              {currentPath.length === 0 ? '我的 Google Drive' : `我的 Google Drive / ${currentPath.map(id => {
                const folder = Object.values(driveItems).flat().find(item => item.id === id);
                return folder ? folder.name : id;
              }).join(' / ')}`}
            </div>
          </div>
          
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="搜索文件..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  名稱
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  修改日期
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  大小
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map(item => (
                <tr 
                  key={item.id} 
                  className={`hover:bg-gray-50 ${item.type !== 'folder' && selectedItems.includes(item.id) ? 'bg-blue-50' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.type !== 'folder' && (
                      <button 
                        onClick={() => toggleSelectItem(item.id)}
                        className={`w-6 h-6 rounded-md flex items-center justify-center ${
                          selectedItems.includes(item.id) 
                            ? 'bg-blue-500 text-white' 
                            : 'border border-gray-300'
                        }`}
                      >
                        {selectedItems.includes(item.id) && <FaCheck className="text-xs" />}
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {item.thumbnail ? (
                        <img src={item.thumbnail} alt={item.name} className="w-10 h-6 mr-3 rounded" />
                      ) : (
                        <div className="mr-3">
                          {getItemIcon(item.type)}
                        </div>
                      )}
                      {item.type === 'folder' ? (
                        <button 
                          className="font-medium text-blue-600 hover:text-blue-800"
                          onClick={() => navigateToFolder(item.id, item.name)}
                        >
                          {item.name}
                        </button>
                      ) : (
                        <span className="font-medium">{item.name}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(item.modifiedTime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.size || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">沒有找到符合條件的文件</p>
          </div>
        )}
      </div>
    </div>
  );
} 