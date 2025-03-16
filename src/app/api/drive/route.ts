import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDriveClient, listFiles, searchFiles, getFile } from '@/lib/google-drive';

// 處理 GET 請求
export async function GET(req: NextRequest) {
  try {
    // 檢查用戶是否已認證
    const session = await auth();
    if (!session || !session.user) {
      console.error('API 路由: 用戶未認證');
      return NextResponse.json({ error: '未認證' }, { status: 401 });
    }

    // 檢查訪問令牌
    if (!session.accessToken) {
      console.error('API 路由: 缺少訪問令牌');
      return NextResponse.json({ error: '缺少訪問令牌，請重新登入' }, { status: 401 });    
    }

    // 獲取查詢參數
    const searchParams = req.nextUrl.searchParams;
    const action = searchParams.get('action');

    // 創建 Google Drive 客戶端
    const drive = await getDriveClient();

    // 根據操作執行不同的操作
    switch (action) {
      case 'list':
        return await listFilesHandler(drive, searchParams);
      case 'get':
        return await getFileHandler(drive, searchParams);
      case 'search':
        return await searchFilesHandler(drive, searchParams);
      default:
        return NextResponse.json({ error: '無效的操作' }, { status: 400 });
    }
  } catch (error) {
    console.error('處理 Drive API 請求時出錯:', error);
    
    // 檢查是否是訪問令牌錯誤
    if (error instanceof Error && error.message.includes('訪問令牌')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json({ error: '處理請求時出錯' }, { status: 500 });
  }
}

// 列出文件
async function listFilesHandler(drive: any, params: URLSearchParams) {
  try {
    const folderId = params.get('folderId') || 'root';
    const pageToken = params.get('pageToken') || undefined;
    const pageSize = Number(params.get('pageSize')) || 100;

    const result = await listFiles(drive, folderId, pageSize, pageToken);

    return NextResponse.json(result);
  } catch (error) {
    console.error('列出文件時出錯:', error);
    return NextResponse.json({ error: '列出文件時出錯' }, { status: 500 });
  }
}

// 獲取文件詳情
async function getFileHandler(drive: any, params: URLSearchParams) {
  try {
    const fileId = params.get('fileId');
    if (!fileId) {
      return NextResponse.json({ error: '缺少文件 ID' }, { status: 400 });
    }

    const file = await getFile(drive, fileId);
    
    if (!file) {
      return NextResponse.json({ error: '找不到文件' }, { status: 404 });
    }

    return NextResponse.json(file);
  } catch (error) {
    console.error('獲取文件詳情時出錯:', error);
    return NextResponse.json({ error: '獲取文件詳情時出錯' }, { status: 500 });
  }
}

// 搜索文件
async function searchFilesHandler(drive: any, params: URLSearchParams) {
  try {
    const query = params.get('query');
    if (!query) {
      return NextResponse.json({ error: '缺少搜索查詢' }, { status: 400 });
    }

    const pageToken = params.get('pageToken') || undefined;
    const pageSize = Number(params.get('pageSize')) || 100;

    const result = await searchFiles(drive, query, pageSize, pageToken);

    return NextResponse.json(result);
  } catch (error) {
    console.error('搜索文件時出錯:', error);
    return NextResponse.json({ error: '搜索文件時出錯' }, { status: 500 });
  }
}

// 配置響應選項
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; 