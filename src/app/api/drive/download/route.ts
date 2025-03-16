import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDriveClient, getDownloadLink } from '@/lib/google-drive';

// 處理 GET 請求
export async function GET(req: NextRequest) {
  try {
    // 檢查用戶是否已登入
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '未認證' },
        { status: 401 }
      );
    }

    // 檢查是否有訪問令牌
    if (!session.accessToken) {
      console.error('會話中沒有訪問令牌');
      return NextResponse.json(
        { error: '缺少訪問令牌，請重新登入' },
        { status: 401 }
      );
    }

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
    const drive = await getDriveClient();
    
    if (!drive) {
      return NextResponse.json(
        { error: '無法創建 Google Drive 客戶端' },
        { status: 500 }
      );
    }

    // 獲取下載鏈接
    const downloadLink = await getDownloadLink(drive, fileId);

    if (!downloadLink) {
      return NextResponse.json(
        { error: '無法獲取下載鏈接' },
        { status: 404 }
      );
    }

    // 重定向到下載鏈接
    return NextResponse.redirect(downloadLink);
  } catch (error) {
    console.error('處理下載請求時出錯:', error);
    return NextResponse.json(
      { error: '處理下載請求時發生錯誤' },
      { status: 500 }
    );
  }
}

// 配置響應選項
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; 