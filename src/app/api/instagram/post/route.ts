import { NextRequest, NextResponse } from 'next/server';
// 從 next-auth 中直接導入 auth 處理函數
import { auth } from '@/auth';
import axios from 'axios';

// Instagram Graph API版本
const IG_API_VERSION = 'v18.0';

export async function POST(request: NextRequest) {
  try {
    // 獲取用戶會話
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ message: '未授權' }, { status: 401 });
    }
    
    // 檢查是否有Instagram訪問令牌
    const accessToken = session.accessToken;
    
    if (!accessToken) {
      return NextResponse.json({ message: '缺少Instagram訪問令牌' }, { status: 403 });
    }
    
    // 獲取表單數據
    const formData = await request.formData();
    const caption = formData.get('caption') as string;
    const hashtags = formData.get('hashtags') as string;
    const imageCountStr = formData.get('imageCount') as string;
    const imageCount = parseInt(imageCountStr || '0', 10);
    
    // 驗證輸入
    if (imageCount <= 0) {
      return NextResponse.json({ message: 'Instagram需要至少一張圖片' }, { status: 400 });
    }
    
    // 收集所有圖片
    const images: File[] = [];
    for (let i = 0; i < imageCount; i++) {
      const image = formData.get(`image${i}`) as File;
      if (image) {
        images.push(image);
      }
    }
    
    if (images.length === 0) {
      return NextResponse.json({ message: '未找到有效的圖片' }, { status: 400 });
    }
    
    // 處理標籤
    let processedCaption = caption || '';
    if (hashtags) {
      const hashtagsArray = hashtags.split(/\s+/).filter(tag => tag.trim());
      if (hashtagsArray.length > 0) {
        const hashtagsText = hashtagsArray.map(tag => `#${tag}`).join(' ');
        processedCaption = `${processedCaption}\n\n${hashtagsText}`;
      }
    }
    
    console.log('Instagram發文請求:', {
      caption: processedCaption,
      imageCount: images.length,
      hasAccessToken: !!accessToken
    });
    
    try {
      // 1. 首先需要獲取用戶的Facebook頁面
      console.log('獲取用戶的Facebook頁面...');
      const accountsResponse = await axios.get(
        `https://graph.facebook.com/${IG_API_VERSION}/me/accounts`,
        { params: { access_token: accessToken } }
      );
      
      console.log('獲取頁面結果:', accountsResponse.data);
      
      if (!accountsResponse.data.data || accountsResponse.data.data.length === 0) {
        return NextResponse.json({ message: '未找到您可管理的Facebook頁面' }, { status: 400 });
      }
      
      // 使用第一個頁面（可以改為讓用戶選擇）
      const page = accountsResponse.data.data[0];
      const pageId = page.id;
      const pageAccessToken = page.access_token;
      
      console.log('使用頁面:', { pageId, hasPageToken: !!pageAccessToken });
      
      // 2. 獲取與該頁面關聯的Instagram商業帳戶
      console.log('獲取Instagram商業帳戶...');
      const igAccountResponse = await axios.get(
        `https://graph.facebook.com/${IG_API_VERSION}/${pageId}`,
        { 
          params: { 
            fields: 'instagram_business_account',
            access_token: pageAccessToken 
          } 
        }
      );
      
      console.log('Instagram帳戶結果:', igAccountResponse.data);
      
      if (!igAccountResponse.data.instagram_business_account) {
        return NextResponse.json({ 
          message: '未找到與您的Facebook頁面關聯的Instagram商業帳戶，請在Facebook頁面設置中關聯您的Instagram帳戶' 
        }, { status: 400 });
      }
      
      const igAccountId = igAccountResponse.data.instagram_business_account.id;
      console.log('使用Instagram帳戶:', { igAccountId });
      
      let mediaId;
      
      if (images.length === 1) {
        // 單張圖片發布流程
        console.log('處理單張圖片發布...');
        const image = images[0];
        const imageBuffer = Buffer.from(await image.arrayBuffer());
        
        // 3a. 上傳單張圖片到Instagram
        console.log('創建媒體容器...');
        
        // 將圖片轉換為 Base64 格式
        const base64Image = Buffer.from(imageBuffer).toString('base64');
        
        const createMediaResponse = await axios.post(
          `https://graph.facebook.com/${IG_API_VERSION}/${igAccountId}/media`,
          null,
          {
            params: {
              image_url: `data:${image.type};base64,${base64Image}`,
              caption: processedCaption,
              access_token: pageAccessToken
            }
          }
        );
        
        console.log('媒體容器創建結果:', createMediaResponse.data);
        mediaId = createMediaResponse.data.id;
      } else {
        // 多張圖片（輪播）發布流程
        console.log('處理多張圖片（輪播）發布...');
        // 3b. 上傳多張圖片並獲取媒體ID
        const childrenMediaIds = [];
        
        for (const image of images) {
          const imageBuffer = Buffer.from(await image.arrayBuffer());
          
          // 將圖片轉換為 Base64 格式
          const base64Image = Buffer.from(imageBuffer).toString('base64');
          
          console.log(`上傳輪播圖片 ${childrenMediaIds.length + 1}/${images.length}...`);
          const uploadResponse = await axios.post(
            `https://graph.facebook.com/${IG_API_VERSION}/${igAccountId}/media`,
            null,
            {
              params: {
                image_url: `data:${image.type};base64,${base64Image}`,
                is_carousel_item: 'true',
                access_token: pageAccessToken
              }
            }
          );
          
          console.log('輪播圖片上傳結果:', uploadResponse.data);
          childrenMediaIds.push(uploadResponse.data.id);
        }
        
        // 4b. 創建輪播媒體容器
        console.log('創建輪播媒體容器...');
        const carouselResponse = await axios.post(
          `https://graph.facebook.com/${IG_API_VERSION}/${igAccountId}/media`,
          null,
          {
            params: {
              media_type: 'CAROUSEL',
              caption: processedCaption,
              children: childrenMediaIds.join(','),
              access_token: pageAccessToken
            }
          }
        );
        
        console.log('輪播媒體容器創建結果:', carouselResponse.data);
        mediaId = carouselResponse.data.id;
      }
      
      // 5. 發布媒體
      console.log('發布媒體...');
      const publishResponse = await axios.post(
        `https://graph.facebook.com/${IG_API_VERSION}/${igAccountId}/media_publish`,
        null,
        {
          params: {
            creation_id: mediaId,
            access_token: pageAccessToken
          }
        }
      );
      
      console.log('媒體發布結果:', publishResponse.data);
      
      const postId = publishResponse.data.id;
      
      // 6. 獲取更多貼文信息（可選）
      console.log('獲取貼文信息...');
      const postInfoResponse = await axios.get(
        `https://graph.facebook.com/${IG_API_VERSION}/${postId}`,
        {
          params: {
            fields: 'id,permalink',
            access_token: pageAccessToken
          }
        }
      );
      
      console.log('貼文信息結果:', postInfoResponse.data);
      
      // 使用獲取到的 permalink 或構建一個預估的 URL
      const postUrl = postInfoResponse.data.permalink || 
                      `https://www.instagram.com/p/${postId.split('_')[0]}/`;
      
      console.log('發布成功:', { postId, postUrl });
      
      return NextResponse.json({ 
        success: true, 
        message: '成功發布到Instagram',
        id: postId,
        url: postUrl
      });
    } catch (error: any) {
      console.error('Instagram發布錯誤:', error.response?.data || error);
      
      if (error.response?.data?.error?.type === 'OAuthException') {
        return NextResponse.json({ 
          message: '授權已過期或無效，請重新授權Instagram訪問',
          error: error.response.data.error.message
        }, { status: 403 });
      }
      
      return NextResponse.json({ 
        message: '發布到Instagram時出錯',
        error: error.response?.data?.error?.message || error.message
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('處理Instagram發布請求錯誤:', error);
    return NextResponse.json({ 
      message: '處理請求時發生錯誤',
      error: error.message 
    }, { status: 500 });
  }
} 