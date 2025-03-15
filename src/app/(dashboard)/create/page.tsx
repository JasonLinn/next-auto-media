'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FaFacebookSquare, FaYoutube, FaTiktok, FaCalendarAlt, FaClock, FaChevronLeft, FaChevronRight, FaCheck } from 'react-icons/fa';

export default function CreatePost() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedMedia, setSelectedMedia] = useState<{id: number, name: string, type: string, thumbnail: string} | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  
  const handlePlatformToggle = (platform: string) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };
  
  const handleMediaSelect = (media: {id: number, name: string, type: string, thumbnail: string}) => {
    setSelectedMedia(media);
  };
  
  const handleRemoveMedia = () => {
    setSelectedMedia(null);
  };
  
  const handleNextStep = () => {
    if (isStepComplete(step) && step < 3) {
      setStep((step + 1) as 1 | 2 | 3);
    }
  };
  
  const handlePrevStep = () => {
    if (step > 1) {
      setStep((step - 1) as 1 | 2 | 3);
    }
  };
  
  const handleSubmit = () => {
    // 模擬提交發布
    alert('發布已排程！');
    // 在實際應用中，這裡會將數據發送到後端
  };
  
  // 模擬媒體庫數據
  const mediaLibrary = [
    { id: 1, name: '產品演示.mp4', type: 'video', thumbnail: 'https://via.placeholder.com/150x100/2563eb/ffffff?text=產品演示' },
    { id: 2, name: '公司標誌.png', type: 'image', thumbnail: 'https://via.placeholder.com/150x100/10b981/ffffff?text=公司標誌' },
    { id: 3, name: '用戶見證.mp4', type: 'video', thumbnail: 'https://via.placeholder.com/150x100/f59e0b/ffffff?text=用戶見證' },
    { id: 4, name: '產品照片.jpg', type: 'image', thumbnail: 'https://via.placeholder.com/150x100/ef4444/ffffff?text=產品照片' },
  ];
  
  const isStepComplete = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return selectedMedia !== null;
      case 2:
        return title.trim() !== '' && selectedPlatforms.length > 0;
      case 3:
        return selectedDate !== '' && selectedTime !== '';
      default:
        return false;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">新建發布</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        {/* 步驟指示器 */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <div className={`w-20 h-1 ${step >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <div className={`w-20 h-1 ${step >= 3 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              3
            </div>
          </div>
        </div>

        {/* 步驟 1: 選擇媒體 */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">選擇媒體</h2>
            
            {selectedMedia ? (
              <div className="mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <div className="relative w-32 h-24 mr-4">
                      <Image
                        src={selectedMedia.thumbnail}
                        alt={selectedMedia.name}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{selectedMedia.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{selectedMedia.type === 'video' ? '視頻' : '圖片'}</p>
                      <button 
                        onClick={handleRemoveMedia}
                        className="text-red-500 text-sm mt-2 hover:underline"
                      >
                        移除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <p className="text-gray-500 mb-4">從您的媒體庫中選擇一個文件：</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {mediaLibrary.map(media => (
                    <div 
                      key={media.id}
                      className="bg-gray-50 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleMediaSelect(media)}
                    >
                      <div className="relative aspect-video">
                        <Image
                          src={media.thumbnail}
                          alt={media.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-2">
                        <p className="text-sm font-medium truncate">{media.name}</p>
                        <p className="text-xs text-gray-500">{media.type === 'video' ? '視頻' : '圖片'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 步驟 2: 內容和平台 */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">內容和平台</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">標題</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="輸入發布標題"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg h-32"
                placeholder="輸入發布描述（可選）"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">選擇平台</label>
              <div className="flex flex-wrap gap-3">
                <button
                  className={`flex items-center px-4 py-2 rounded-lg ${
                    selectedPlatforms.includes('YouTube') 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={() => handlePlatformToggle('YouTube')}
                >
                  <FaYoutube className="mr-2" />
                  YouTube
                </button>
                <button
                  className={`flex items-center px-4 py-2 rounded-lg ${
                    selectedPlatforms.includes('Facebook') 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={() => handlePlatformToggle('Facebook')}
                >
                  <FaFacebookSquare className="mr-2" />
                  Facebook
                </button>
                <button
                  className={`flex items-center px-4 py-2 rounded-lg ${
                    selectedPlatforms.includes('TikTok') 
                      ? 'bg-black text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={() => handlePlatformToggle('TikTok')}
                >
                  <FaTiktok className="mr-2" />
                  TikTok
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 步驟 3: 排程 */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">排程發布</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">發布日期</label>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg pl-10"
                />
                <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">發布時間</label>
              <div className="relative">
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg pl-10"
                />
                <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            
            <div className="mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">發布摘要</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-500">媒體：</span> {selectedMedia?.name}</p>
                  <p><span className="text-gray-500">標題：</span> {title}</p>
                  <p><span className="text-gray-500">平台：</span> {selectedPlatforms.join(', ')}</p>
                  <p><span className="text-gray-500">排程時間：</span> {selectedDate} {selectedTime}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 導航按鈕 */}
        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <button
              onClick={handlePrevStep}
              className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              <FaChevronLeft className="mr-2" />
              上一步
            </button>
          ) : (
            <div></div>
          )}
          
          {step < 3 ? (
            <button
              onClick={handleNextStep}
              disabled={!isStepComplete(step)}
              className={`flex items-center px-4 py-2 rounded-lg ${
                isStepComplete(step)
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              下一步
              <FaChevronRight className="ml-2" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!isStepComplete(step)}
              className={`flex items-center px-4 py-2 rounded-lg ${
                isStepComplete(step)
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <FaCheck className="mr-2" />
              確認排程
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 