import { NextRequest, NextResponse } from 'next/server';
import { getDriveClient, listFiles, getFile, searchFiles } from '@/lib/google-drive';

// 處理 GET 請求
export async function GET(req: NextRequest) {
  try {
    // 獲取查詢參數
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const folderId = url.searchParams.get('folderId') || 'root';
    const fileId = url.searchParams.get('fileId');
    const query = url.searchParams.get('query');
    const pageToken = url.searchParams.get('pageToken') || undefined;
    const pageSize = url.searchParams.get('pageSize') ? parseInt(url.searchParams.get('pageSize')!) : undefined;

    // 獲取 Google Drive 客戶端
    const drive = await getDriveClient(req);
    
    if (!drive) {
      return NextResponse.json(
        { error: '未授權，請先登入' },
        { status: 401 }
      );
    }

    // 根據操作類型處理請求
    switch (action) {
      case 'list':
        // 列出文件和文件夾
        const result = await listFiles(drive, folderId, pageSize, pageToken);
        return NextResponse.json(result);

      case 'get':
        // 獲取單個文件詳情
        if (!fileId) {
          return NextResponse.json(
            { error: '缺少文件 ID' },
            { status: 400 }
          );
        }
        const file = await getFile(drive, fileId);
        if (!file) {
          return NextResponse.json(
            { error: '文件未找到' },
            { status: 404 }
          );
        }
        return NextResponse.json(file);

      case 'search':
        // 搜索文件
        if (!query) {
          return NextResponse.json(
            { error: '缺少搜索關鍵詞' },
            { status: 400 }
          );
        }
        const searchResult = await searchFiles(drive, query, pageSize, pageToken);
        return NextResponse.json(searchResult);

      default:
        return NextResponse.json(
          { error: '無效的操作' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('處理 Google Drive API 請求時出錯:', error);
    return NextResponse.json(
      { error: '處理請求時發生錯誤' },
      { status: 500 }
    );
  }
} 