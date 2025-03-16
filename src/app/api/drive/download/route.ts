import { NextRequest, NextResponse } from 'next/server';
import { getDriveClient, getFile, getDownloadLink } from '@/lib/google-drive';
import { Readable } from 'stream';

// 處理 GET 請求
export async function GET(req: NextRequest) {
  try {
    // 獲取查詢參數
    const url = new URL(req.url);
    const fileId = url.searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json(
        { error: '缺少文件 ID' },
        { status: 400 }
      );
    }

    // 獲取 Google Drive 客戶端
    const drive = await getDriveClient(req);
    
    if (!drive) {
      return NextResponse.json(
        { error: '未授權，請先登入' },
        { status: 401 }
      );
    }

    // 獲取文件詳情
    const file = await getFile(drive, fileId);
    if (!file) {
      return NextResponse.json(
        { error: '文件未找到' },
        { status: 404 }
      );
    }

    // 如果是文件夾，返回錯誤
    if (file.isFolder) {
      return NextResponse.json(
        { error: '無法下載文件夾' },
        { status: 400 }
      );
    }

    // 獲取下載鏈接
    const downloadUrl = await getDownloadLink(drive, fileId);
    if (!downloadUrl) {
      return NextResponse.json(
        { error: '無法獲取下載鏈接' },
        { status: 500 }
      );
    }

    // 獲取文件內容
    try {
      // 使用 fetch 獲取文件內容
      const response = await fetch(downloadUrl);
      
      if (!response.ok) {
        throw new Error(`下載失敗: ${response.status} ${response.statusText}`);
      }

      // 獲取文件數據
      const data = await response.arrayBuffer();
      
      // 創建響應
      const headers = new Headers();
      headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(file.name)}"`);
      headers.set('Content-Type', file.mimeType || 'application/octet-stream');
      
      if (file.size) {
        headers.set('Content-Length', file.size);
      }

      // 返回文件
      return new NextResponse(data, {
        status: 200,
        headers,
      });
    } catch (error) {
      console.error('下載文件時出錯:', error);
      return NextResponse.json(
        { error: '下載文件時出錯' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('處理下載請求時出錯:', error);
    return NextResponse.json(
      { error: '處理請求時發生錯誤' },
      { status: 500 }
    );
  }
}

// 配置響應選項
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; 