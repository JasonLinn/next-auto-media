'use client';

import { useState } from 'react';
import { FaFolder, FaFile, FaFileImage, FaFileVideo, FaFilePdf, FaFileAlt, FaEllipsisV, FaPlus } from 'react-icons/fa';

export default function Drive() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [currentFolder, setCurrentFolder] = useState('/');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  // 模擬文件數據
  const files = [
    { id: 1, name: '營銷視頻', type: 'folder', updatedAt: '2025-03-10T10:30:00Z', size: null },
    { id: 2, name: '產品照片', type: 'folder', updatedAt: '2025-03-08T14:15:00Z', size: null },
    { id: 3, name: '公司簡介.pdf', type: 'file', fileType: 'pdf', updatedAt: '2025-03-05T09:45:00Z', size: 2.4 },
    { id: 4, name: '產品演示.mp4', type: 'file', fileType: 'video', updatedAt: '2025-03-01T16:20:00Z', size: 15.8 },
    { id: 5, name: 'logo.png', type: 'file', fileType: 'image', updatedAt: '2025-02-28T11:10:00Z', size: 0.5 },
    { id: 6, name: '市場分析.docx', type: 'file', fileType: 'document', updatedAt: '2025-02-25T13:40:00Z', size: 1.2 },
  ];
  
  // 獲取文件圖標
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'folder':
        return <FaFolder className="text-yellow-500" />;
      case 'image':
        return <FaFileImage className="text-blue-500" />;
      case 'video':
        return <FaFileVideo className="text-purple-500" />;
      case 'pdf':
        return <FaFilePdf className="text-red-500" />;
      default:
        return <FaFileAlt className="text-gray-500" />;
    }
  };
  
  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  
  // 格式化文件大小
  const formatFileSize = (size: number | null) => {
    if (size === null) return '';
    return `${size} MB`;
  };
  
  // 創建新文件夾
  const createNewFolder = () => {
    // 這裡只是模擬創建文件夾，實際應用中需要與後端 API 交互
    console.log(`創建新文件夾: ${newFolderName} 在 ${currentFolder}`);
    setShowCreateModal(false);
    setNewFolderName('');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Google Drive</h1>
        <div className="flex space-x-4">
          <button 
            className="bg-white border border-gray-300 rounded-md px-3 py-1 text-sm"
            onClick={() => setView('grid')}
          >
            網格視圖
          </button>
          <button 
            className="bg-white border border-gray-300 rounded-md px-3 py-1 text-sm"
            onClick={() => setView('list')}
          >
            列表視圖
          </button>
          <button 
            className="bg-blue-500 text-white rounded-md px-3 py-1 text-sm flex items-center"
            onClick={() => setShowCreateModal(true)}
          >
            <FaPlus className="mr-1" /> 新建
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <span className="cursor-pointer hover:text-blue-500" onClick={() => setCurrentFolder('/')}>我的雲端硬碟</span>
          {currentFolder !== '/' && (
            <>
              <span className="mx-2">/</span>
              <span>{currentFolder.replace('/', '')}</span>
            </>
          )}
        </div>
        
        {view === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {files.map(file => (
              <div 
                key={file.id} 
                className="bg-gray-50 rounded-lg p-4 flex flex-col items-center cursor-pointer hover:bg-gray-100"
                onClick={() => file.type === 'folder' ? setCurrentFolder(`/${file.name}`) : null}
              >
                <div className="text-3xl mb-2">
                  {getFileIcon(file.type === 'folder' ? 'folder' : file.fileType || '')}
                </div>
                <p className="text-sm font-medium text-center truncate w-full">{file.name}</p>
                <p className="text-xs text-gray-500 mt-1">{formatDate(file.updatedAt)}</p>
                {file.size !== null && (
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="py-3 px-4 text-left">名稱</th>
                <th className="py-3 px-4 text-left">上次修改</th>
                <th className="py-3 px-4 text-left">大小</th>
                <th className="py-3 px-4 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {files.map(file => (
                <tr key={file.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <span className="mr-2">
                        {getFileIcon(file.type === 'folder' ? 'folder' : file.fileType || '')}
                      </span>
                      <span 
                        className="cursor-pointer hover:text-blue-500"
                        onClick={() => file.type === 'folder' ? setCurrentFolder(`/${file.name}`) : null}
                      >
                        {file.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">{formatDate(file.updatedAt)}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{formatFileSize(file.size)}</td>
                  <td className="py-3 px-4">
                    <button className="text-gray-500 hover:text-gray-700">
                      <FaEllipsisV />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* 存儲統計 */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-medium mb-4">存儲空間</h2>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
        </div>
        <p className="text-sm text-gray-500">已使用 9.2 GB，共 20 GB</p>
      </div>
      
      {/* 創建新文件夾模態框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium mb-4">創建新文件夾</h3>
            <input
              type="text"
              placeholder="文件夾名稱"
              className="w-full border rounded-md px-3 py-2 mb-4"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <button 
                className="px-4 py-2 border rounded-md"
                onClick={() => setShowCreateModal(false)}
              >
                取消
              </button>
              <button 
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
                onClick={createNewFolder}
              >
                創建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 