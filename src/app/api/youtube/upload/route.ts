import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { writeFile } from 'fs/promises';

// YouTube 分類 ID
const CATEGORY_IDS = {
  Entertainment: 24,
  Education: 27,
  ScienceTechnology: 28,
};

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
    const thumbnailFile = formData.get('thumbnail') as File | null;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const tags = formData.get('tags') as string;
    
    if (!videoFile || !title) {
      return NextResponse.json(
        { message: '缺少必要參數：視頻文件和標題為必填項' },
        { status: 400 }
      );
    }

    // 處理標籤
    const tagArray = tags ? tags.split(',').map(tag => tag.trim()) : [];

    // 把文件保存到臨時目錄
    const videoTempPath = path.join(os.tmpdir(), `youtube-upload-${Date.now()}.mp4`);
    const videoBuffer = Buffer.from(await videoFile.arrayBuffer());
    await writeFile(videoTempPath, videoBuffer);

    let thumbnailTempPath;
    if (thumbnailFile) {
      thumbnailTempPath = path.join(os.tmpdir(), `youtube-thumbnail-${Date.now()}.jpg`);
      const thumbnailBuffer = Buffer.from(await thumbnailFile.arrayBuffer());
      await writeFile(thumbnailTempPath, thumbnailBuffer);
    }

    // 設置 OAuth2 客戶端
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXTAUTH_URL + '/api/auth/callback/google'
    );

    // 設置請求的訪問令牌
    oauth2Client.setCredentials({
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
    });

    // 創建 YouTube 客戶端
    const youtube = google.youtube({
      version: 'v3',
      auth: oauth2Client,
    });

    console.log('開始上傳影片到 YouTube...');

    // 上傳視頻
    const videoRes = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title,
          description,
          tags: tagArray,
          categoryId: String(CATEGORY_IDS.Education), // 預設為教育類別
          defaultLanguage: 'zh-TW',
          defaultAudioLanguage: 'zh-TW',
        },
        status: {
          privacyStatus: 'private', // 預設為私人視頻
        },
      },
      media: {
        body: fs.createReadStream(videoTempPath),
      },
    });

    // 上傳縮略圖（如果有）
    if (thumbnailFile && thumbnailTempPath && videoRes.data.id) {
      console.log('開始上傳縮略圖...');
      await youtube.thumbnails.set({
        videoId: videoRes.data.id,
        media: {
          body: fs.createReadStream(thumbnailTempPath),
        },
      });
    }

    // 清理臨時文件
    try {
      fs.unlinkSync(videoTempPath);
      if (thumbnailTempPath) {
        fs.unlinkSync(thumbnailTempPath);
      }
    } catch (cleanupError) {
      console.error('清理臨時文件時出錯:', cleanupError);
      // 繼續執行，不中斷流程
    }

    // 返回成功結果
    const videoUrl = videoRes.data.id ? `https://www.youtube.com/watch?v=${videoRes.data.id}` : undefined;
    
    return NextResponse.json({
      message: '視頻上傳成功',
      videoId: videoRes.data.id,
      url: videoUrl,
      thumbnailUrl: videoRes.data.snippet?.thumbnails?.default?.url,
    });
  } catch (error: any) {
    console.error('上傳視頻時出錯:', error);
    
    // 處理 Google API 特定錯誤
    if (error.code === 401 || error.code === 403) {
      return NextResponse.json(
        { message: '訪問權限不足，請確保您已授權 YouTube 上傳權限' }, 
        { status: 403 }
      );
    }
    
    // 處理配額超限錯誤
    if (error.code === 403 && error.errors?.[0]?.reason === 'quotaExceeded') {
      return NextResponse.json(
        { message: 'YouTube API 配額已超出限制，請稍後再試' }, 
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { message: '上傳視頻時發生錯誤: ' + (error.message || '未知錯誤') }, 
      { status: 500 }
    );
  }
} 