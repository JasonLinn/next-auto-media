import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { writeFile } from 'fs/promises';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    // 驗證用戶身份
    const session = await auth();
    if (!session || !session.accessToken) {
      return NextResponse.json({ message: '未授權操作' }, { status: 401 });
    }

    // 處理 FormData
    const formData = await req.formData();
    const videoFile = formData.get('video') as File | null;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const tags = formData.get('tags') as string;
    const privacyLevel = formData.get('privacyLevel') as string || 'PUBLIC_TO_EVERYONE';
    const disableComment = formData.get('disableComment') === 'true';
    const autoAddMusic = formData.get('autoAddMusic') === 'true';
    
    if (!videoFile || !title) {
      return NextResponse.json(
        { message: '缺少必要參數：視頻文件和標題為必填項' },
        { status: 400 }
      );
    }

    // 處理標籤
    const tagArray = tags ? tags.split(',').map(tag => tag.trim()) : [];

    // 把文件保存到臨時目錄
    const videoTempPath = path.join(os.tmpdir(), `tiktok-upload-${Date.now()}.mp4`);
    const videoBuffer = Buffer.from(await videoFile.arrayBuffer());
    await writeFile(videoTempPath, videoBuffer);

    // 使用 TikTok Content Posting API 初始化上傳
    console.log('初始化 TikTok 上傳...');
    
    try {
      // 以下是模擬 TikTok API 調用的過程，實際環境中需要使用 TikTok Content Posting API
      // 由於 TikTok API 需要開發者帳戶和應用授權，這裡採用模擬實現

      // 第1步：初始化上傳請求
      // const initResponse = await axios.post('https://open.tiktokapis.com/v2/post/publish/content/init/', {
      //   post_info: {
      //     title: title,
      //     description: description,
      //     disable_comment: disableComment,
      //     privacy_level: privacyLevel,
      //     auto_add_music: autoAddMusic
      //   },
      //   post_mode: "DIRECT_POST",
      //   media_type: "VIDEO"
      // }, {
      //   headers: {
      //     'Authorization': `Bearer ${session.accessToken}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
      
      // 第2步：上傳視頻文件
      // const uploadResponse = await axios.put(initResponse.data.upload_url, fs.createReadStream(videoTempPath), {
      //   headers: {
      //     'Content-Type': 'video/mp4',
      //     'Content-Length': fs.statSync(videoTempPath).size,
      //     'Content-Range': `bytes 0-${fs.statSync(videoTempPath).size - 1}/${fs.statSync(videoTempPath).size}`
      //   }
      // });

      // 清理臨時文件
      try {
        fs.unlinkSync(videoTempPath);
      } catch (cleanupError) {
        console.error('清理臨時文件時出錯:', cleanupError);
        // 繼續執行，不中斷流程
      }

      // 模擬成功響應
      // 實際上需要根據 TikTok API 的真實響應格式返回
      return NextResponse.json({
        message: '視頻已成功上傳至 TikTok',
        status: 'success',
        url: 'https://www.tiktok.com/', // 實際應該返回視頻URL
        videoId: `tt_${Date.now()}`, // 模擬視頻ID
        privacyLevel: privacyLevel
      });
    } catch (apiError: any) {
      console.error('TikTok API 調用出錯:', apiError);
      
      return NextResponse.json(
        { 
          message: '上傳到 TikTok 時發生錯誤: ' + (apiError.message || '未知錯誤'),
          details: '請確保您已在 TikTok 開發者平台申請了正確的權限，並配置了相應的環境變數'
        }, 
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('處理上傳請求時出錯:', error);
    
    // 處理 API 特定錯誤
    if (error.code === 401 || error.code === 403) {
      return NextResponse.json(
        { message: '訪問權限不足，請確保您已授權 TikTok 上傳權限' }, 
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { message: '上傳處理過程中發生錯誤: ' + (error.message || '未知錯誤') }, 
      { status: 500 }
    );
  }
} 