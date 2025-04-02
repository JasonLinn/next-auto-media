import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';

// Facebook 頁面接口定義
interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category?: string;
}

export const dynamic = 'force-dynamic';

// 處理 FormData 的輔助函數
async function parseFormData(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const message = formData.get('message') as string;
  const pageId = formData.get('pageId') as string;
  
  return { file, message, pageId };
}

// 從 FB Graph API 獲取用戶頁面的輔助函數
async function getUserPages(accessToken: string): Promise<FacebookPage[]> {
  try {
    console.log('正在獲取用戶頁面...');
    console.log('使用的 Access Token:', accessToken ? `${accessToken.substring(0, 20)}...` : '無');
    
    const response = await fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`);
    
    console.log('API 回應狀態:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('獲取頁面失敗:', errorData);
      throw new Error(`獲取頁面失敗: ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    console.log('獲取到的頁面數量:', data.data?.length || 0);
    console.log('頁面列表:', data.data?.map((page: any) => ({ id: page.id, name: page.name })) || []);
    
    if (!data.data || data.data.length === 0) {
      throw new Error('未找到您可管理的Facebook頁面，請確保您的Facebook帳號擁有頁面管理權限');
    }
    
    return data.data;
  } catch (error) {
    console.error('獲取用戶頁面時出錯:', error);
    throw error;
  }
}

// 將圖片上傳到 Facebook 的輔助函數
async function uploadPhotoToFacebook(pageId: string, pageAccessToken: string, filePath: string, message: string) {
  try {
    console.log(`正在上傳圖片到頁面 ${pageId}...`);
    const formData = new FormData();
    formData.append('source', new Blob([fs.readFileSync(filePath)]));
    formData.append('message', message);
    
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${pageId}/photos?access_token=${pageAccessToken}`,
      {
        method: 'POST',
        body: formData
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('上傳圖片失敗:', errorData);
      throw new Error(`上傳圖片失敗: ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    console.log('上傳圖片成功:', data);
    return data;
  } catch (error) {
    console.error('上傳圖片時出錯:', error);
    throw error;
  }
}

// 將文字發布到 Facebook 的輔助函數
async function postToFacebookPage(pageId: string, pageAccessToken: string, message: string) {
  try {
    console.log(`正在發布文字到頁面 ${pageId}...`);
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${pageId}/feed?message=${encodeURIComponent(message)}&access_token=${pageAccessToken}`,
      {
        method: 'POST'
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('發布文字失敗:', errorData);
      throw new Error(`發布文字失敗: ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    console.log('發布文字成功:', data);
    return data;
  } catch (error) {
    console.error('發布文字時出錯:', error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('開始處理 Facebook 發文請求...');
    // 獲取用戶會話
    const session = await auth();
    
    console.log('會話資訊:', {
      hasSession: !!session,
      hasAccessToken: !!session?.accessToken,
      userId: session?.user?.id,
      userEmail: session?.user?.email
    });
    
    if (!session?.accessToken) {
      console.error('未授權: 缺少訪問令牌');
      return NextResponse.json(
        { error: '未授權: 請先登入Facebook' },
        { status: 401 }
      );
    }
    
    console.log('已獲取會話, 訪問令牌是否存在:', !!session.accessToken);
    console.log('訪問令牌:', session.accessToken ? `${session.accessToken.substring(0, 20)}...` : '無');
    
    // 解析表單數據
    const { file, message, pageId } = await parseFormData(req);
    
    if (!message && !file) {
      console.error('請求錯誤: 缺少訊息或檔案');
      return NextResponse.json(
        { error: '請提供訊息或圖片' },
        { status: 400 }
      );
    }
    
    // 獲取用戶的 Facebook 頁面
    let pages;
    try {
      pages = await getUserPages(session.accessToken);
      console.log(`找到 ${pages.length} 個頁面`);
    } catch (error: any) {
      console.error('獲取頁面失敗:', error.message);
      return NextResponse.json(
        { error: error.message || '獲取Facebook頁面失敗' },
        { status: 400 }
      );
    }
    
    if (!pages || pages.length === 0) {
      console.error('找不到頁面');
      return NextResponse.json(
        { error: '未找到您可管理的Facebook頁面，請確保您的Facebook帳號擁有頁面管理權限' },
        { status: 400 }
      );
    }
    
    // 使用指定的頁面，或默認使用第一個頁面
    let selectedPage: FacebookPage | undefined;
    if (pageId) {
      selectedPage = pages.find((p: FacebookPage) => p.id === pageId);
      if (!selectedPage) {
        console.error('找不到指定的頁面:', pageId);
        return NextResponse.json(
          { error: '找不到指定的Facebook頁面，可能權限已變更' },
          { status: 400 }
        );
      }
    } else {
      // 如果沒有指定頁面，使用第一個頁面
      selectedPage = pages[0];
    }
    
    const page = selectedPage;
    const pageAccessToken = page.access_token;
    
    console.log(`將使用頁面: ${page.name} (ID: ${page.id})`);
    
    let result;
    
    // 如果有檔案，處理圖片上傳
    if (file) {
      const tempDir = os.tmpdir();
      const fileId = uuidv4();
      const fileExtension = path.extname(file.name);
      const fileName = `facebook-upload-${fileId}${fileExtension}`;
      const filePath = path.join(tempDir, fileName);
      
      console.log(`準備處理上傳的文件，暫存於: ${filePath}`);
      
      // 轉換 File 對象並寫入臨時文件
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(filePath, buffer);
      
      try {
        // 上傳圖片到 Facebook
        result = await uploadPhotoToFacebook(page.id, pageAccessToken, filePath, message || '');
        // 清理臨時文件
        fs.unlinkSync(filePath);
      } catch (error: any) {
        // 確保清理臨時文件
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        console.error('上傳圖片失敗:', error);
        return NextResponse.json(
          { error: error.message || '上傳圖片到Facebook失敗' },
          { status: 500 }
        );
      }
    } else {
      // 只發布文字內容
      try {
        result = await postToFacebookPage(page.id, pageAccessToken, message);
      } catch (error: any) {
        console.error('發布文字失敗:', error);
        return NextResponse.json(
          { error: error.message || '發布文字到Facebook失敗' },
          { status: 500 }
        );
      }
    }
    
    console.log('Facebook發布完成, 結果:', result);
    return NextResponse.json({ 
      success: true, 
      result,
      page: {
        id: page.id,
        name: page.name
      }
    });
  } catch (error: any) {
    console.error('處理請求時出現意外錯誤:', error);
    return NextResponse.json(
      { error: error.message || '處理Facebook發布請求失敗' },
      { status: 500 }
    );
  }
} 