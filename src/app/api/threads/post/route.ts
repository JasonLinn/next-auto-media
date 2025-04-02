import { NextRequest, NextResponse } from 'next/server';
// 從 next-auth 中直接導入 auth 處理函數
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
  try {
    // 獲取用戶會話
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ message: '未授權' }, { status: 401 });
    }
    
    // 檢查是否有Instagram訪問令牌 (Threads使用Instagram API)
    const accessToken = session.accessToken;
    
    if (!accessToken) {
      return NextResponse.json({ message: '缺少訪問令牌' }, { status: 403 });
    }
    
    // 獲取表單數據
    const formData = await request.formData();
    const content = formData.get('content') as string;
    const imageCountStr = formData.get('imageCount') as string;
    const imageCount = parseInt(imageCountStr || '0', 10);
    
    // 驗證輸入
    if (!content && imageCount === 0) {
      return NextResponse.json({ message: '請提供文字內容或圖片' }, { status: 400 });
    }
    
    // 收集圖片（如果有）
    const images: File[] = [];
    if (imageCount > 0) {
      for (let i = 0; i < imageCount; i++) {
        const image = formData.get(`image${i}`) as File;
        if (image) {
          images.push(image);
        }
      }
    }
    
    try {
      // 處理Threads貼文
      if (images.length > 0) {
        console.log('發布帶圖片的Threads貼文', { 
          content, 
          imagesCount: images.length 
        });
      } else {
        console.log('發布純文字Threads貼文', { content });
      }
      
      // 這裡將使用Instagram/Threads API進行實際發布
      // 模擬成功回應
      const postId = 'th_' + Date.now();
      const postUrl = `https://threads.net/p/${postId}`;
      
      return NextResponse.json({ 
        success: true, 
        message: '成功發布到Threads',
        id: postId,
        url: postUrl
      });
    } catch (error: any) {
      console.error('Threads發布錯誤:', error);
      
      if (error.message.includes('auth') || error.message.includes('token')) {
        return NextResponse.json({ 
          message: '授權已過期或無效，請重新授權訪問',
          error: error.message
        }, { status: 403 });
      }
      
      return NextResponse.json({ 
        message: '發布到Threads時出錯',
        error: error.message
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('處理Threads發布請求錯誤:', error);
    return NextResponse.json({ 
      message: '處理請求時發生錯誤',
      error: error.message 
    }, { status: 500 });
  }
} 