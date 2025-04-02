import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import axios from 'axios';

// Facebook Graph API版本
const FB_API_VERSION = 'v18.0';

export async function POST(request: NextRequest) {
  try {
    // 獲取用戶會話
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ message: '未授權' }, { status: 401 });
    }
    
    // 檢查是否有Facebook訪問令牌
    const accessToken = session.accessToken;
    
    if (!accessToken) {
      return NextResponse.json({ message: '缺少Facebook訪問令牌' }, { status: 403 });
    }
    
    // 獲取表單數據
    const formData = await request.formData();
    const content = formData.get('content') as string;
    const link = formData.get('link') as string;
    const privacyLevel = formData.get('privacyLevel') as string;
    const image = formData.get('image') as File | null;
    
    // 驗證輸入
    if (!content && !image && !link) {
      return NextResponse.json({ message: '需要提供內容或圖片或鏈結' }, { status: 400 });
    }

    // 記錄請求信息
    console.log('Facebook發文請求:', {
      hasContent: !!content,
      hasImage: !!image,
      hasLink: !!link,
      privacyLevel,
      hasAccessToken: !!accessToken,
    });

    try {
      // 獲取用戶的Facebook頁面
      console.log('獲取用戶的Facebook頁面...');
      const userPagesResponse = await axios.get(
        `https://graph.facebook.com/${FB_API_VERSION}/me/accounts`,
        { params: { access_token: accessToken } }
      );

      console.log('獲取頁面結果:', userPagesResponse.data);

      if (!userPagesResponse.data.data || userPagesResponse.data.data.length === 0) {
        return NextResponse.json({ message: '未找到您可管理的Facebook頁面' }, { status: 400 });
      }

      // 使用第一個頁面（可以改為讓用戶選擇）
      const page = userPagesResponse.data.data[0];
      const pageId = page.id;
      const pageAccessToken = page.access_token;

      console.log('使用頁面:', { pageId, hasPageToken: !!pageAccessToken });

      // 準備隱私設置
      const privacyObject: any = {};
      if (privacyLevel === 'FRIENDS') {
        privacyObject.value = 'FRIENDS';
      } else if (privacyLevel === 'ONLY_ME') {
        privacyObject.value = 'SELF';
      } else {
        privacyObject.value = 'EVERYONE';
      }

      let postId = '';
      let postUrl = '';
      
      if (image) {
        console.log('處理帶圖片的貼文...');
        // 將文件轉換為Buffer
        const imageBuffer = Buffer.from(await image.arrayBuffer());
        
        // 首先上傳圖片到Facebook
        const formDataImage = new FormData();
        formDataImage.append('source', new Blob([imageBuffer]), image.name);
        formDataImage.append('published', 'false'); // 先不發布
        
        const uploadResponse = await axios.post(
          `https://graph.facebook.com/${FB_API_VERSION}/${pageId}/photos`,
          formDataImage,
          {
            params: {
              access_token: pageAccessToken
            },
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        console.log('上傳圖片結果:', uploadResponse.data);
        
        // 獲取圖片ID
        const photoId = uploadResponse.data.id;
        
        // 發布帶圖片的貼文
        const postData: any = {
          message: content,
          attached_media: [{ media_fbid: photoId }],
          privacy: privacyObject
        };
        
        if (link) {
          postData.link = link;
        }
        
        console.log('發布最終貼文...');
        const postResponse = await axios.post(
          `https://graph.facebook.com/${FB_API_VERSION}/${pageId}/feed`,
          null,
          {
            params: {
              ...postData,
              access_token: pageAccessToken
            }
          }
        );
        
        console.log('貼文發布結果:', postResponse.data);
        postId = postResponse.data.id;
      } else {
        console.log('處理純文字或帶鏈結的貼文...');
        // 發布純文字或帶鏈結的貼文
        const postData: any = {
          message: content,
          privacy: privacyObject
        };
        
        if (link) {
          postData.link = link;
        }
        
        const postResponse = await axios.post(
          `https://graph.facebook.com/${FB_API_VERSION}/${pageId}/feed`,
          null,
          {
            params: {
              ...postData,
              access_token: pageAccessToken
            }
          }
        );
        
        console.log('貼文發布結果:', postResponse.data);
        postId = postResponse.data.id;
      }
      
      // 生成貼文URL
      postUrl = `https://facebook.com/${postId}`;
      
      console.log('發布成功:', { postId, postUrl });
      
      return NextResponse.json({ 
        success: true, 
        message: '成功發布到Facebook',
        id: postId,
        url: postUrl
      });
    } catch (error: any) {
      console.error('Facebook發布錯誤:', error.response?.data || error);
      
      // 處理各種錯誤情況
      if (error.response?.data?.error?.type === 'OAuthException') {
        return NextResponse.json({ 
          message: '授權已過期或無效，請重新授權Facebook訪問',
          error: error.response.data.error.message
        }, { status: 403 });
      }
      
      return NextResponse.json({ 
        message: '發布到Facebook時出錯',
        error: error.response?.data?.error?.message || error.message
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('處理Facebook發布請求錯誤:', error);
    return NextResponse.json({ 
      message: '處理請求時發生錯誤',
      error: error.message 
    }, { status: 500 });
  }
} 