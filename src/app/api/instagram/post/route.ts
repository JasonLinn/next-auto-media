import { NextRequest, NextResponse } from 'next/server';
// 從 next-auth 中直接導入 auth 處理函數
import { auth } from '@/auth';
import axios from 'axios';

// Instagram Graph API版本
const IG_API_VERSION = 'v18.0';

// 解析表單數據的函數
async function parseFormData(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // 處理圖片文件
    const imageCount = parseInt(formData.get('imageCount') as string) || 0;
    const images: File[] = [];
    
    for (let i = 0; i < imageCount; i++) {
      const imageKey = `image${i}`;
      const image = formData.get(imageKey) as File;
      if (image) {
        images.push(image);
      }
    }
    
    // 獲取其他參數
    const caption = formData.get('caption') as string || '';
    const hashtags = formData.get('hashtags') as string || '';
    const instagramAccountId = formData.get('instagramAccountId') as string;
    const pageId = formData.get('pageId') as string;
    const pageAccessToken = formData.get('pageAccessToken') as string;
    
    return {
      images,
      caption,
      hashtags,
      instagramAccountId,
      pageId,
      pageAccessToken
    };
  } catch (error) {
    console.error('解析表單數據時出錯:', error);
    throw new Error('解析表單數據失敗');
  }
}

export async function POST(request: NextRequest) {
  try {
    // 獲取認證會話
    const session = await auth();
    
    if (!session?.accessToken) {
      console.error('未授權');
      return NextResponse.json({ message: '未授權: 請先登入' }, { status: 401 });
    }
    
    // 解析表單數據
    const { images, caption, hashtags, instagramAccountId, pageId, pageAccessToken } = await parseFormData(request);
    
    if (images.length === 0) {
      return NextResponse.json({ message: '請至少上傳一張圖片' }, { status: 400 });
    }
    
    // 處理標籤和描述
    const processedHashtags = hashtags
      .split(/[\s\n]+/)
      .filter(tag => tag.trim() !== '')
      .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
      .join(' ');
    
    const processedCaption = caption + (processedHashtags ? '\n\n' + processedHashtags : '');
    
    // 決定使用哪個訪問令牌和頁面 ID
    let accessToken = session.accessToken;
    let selectedPageId = '';
    let specificInstagramId = '';
    
    // 優先使用前端提供的特定 Instagram 帳號和頁面信息
    if (pageAccessToken && pageId && instagramAccountId) {
      accessToken = pageAccessToken;
      selectedPageId = pageId;
      specificInstagramId = instagramAccountId;
      console.log('使用前端提供的特定 Instagram 帳號:', specificInstagramId);
    }
    
    console.log('Instagram發文請求:', {
      caption: processedCaption,
      imageCount: images.length,
      hasAccessToken: !!accessToken,
      hasSpecificAccount: !!specificInstagramId
    });
    
    try {
      // 如果未指定特定頁面，則獲取用戶的Facebook頁面
      if (!selectedPageId || !specificInstagramId) {
        console.log('獲取用戶的Facebook頁面...');
        const accountsResponse = await axios.get(
          `https://graph.facebook.com/${IG_API_VERSION}/me/accounts`,
          { params: { access_token: accessToken } }
        );
        
        console.log('獲取頁面結果:', accountsResponse.data);
        
        if (!accountsResponse.data.data || accountsResponse.data.data.length === 0) {
          return NextResponse.json({ message: '未找到您可管理的Facebook頁面' }, { status: 400 });
        }
        
        // 使用第一個頁面
        const page = accountsResponse.data.data[0];
        selectedPageId = page.id;
        accessToken = page.access_token;
      }
      
      // 如果未指定特定的Instagram帳號，需要獲取關聯的Instagram商業帳戶
      let igAccountId = specificInstagramId;
      
      if (!igAccountId) {
        console.log('獲取Instagram商業帳戶...');
        const igAccountResponse = await axios.get(
          `https://graph.facebook.com/${IG_API_VERSION}/${selectedPageId}`,
          { 
            params: { 
              fields: 'instagram_business_account',
              access_token: accessToken 
            } 
          }
        );
        
        console.log('Instagram帳戶結果:', igAccountResponse.data);
        
        if (!igAccountResponse.data.instagram_business_account) {
          return NextResponse.json({ 
            message: '未找到與您的Facebook頁面關聯的Instagram商業帳戶，請在Facebook頁面設置中關聯您的Instagram帳戶' 
          }, { status: 400 });
        }
        
        igAccountId = igAccountResponse.data.instagram_business_account.id;
      }
      
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
              access_token: accessToken
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
                access_token: accessToken
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
              access_token: accessToken
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
            access_token: accessToken
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
            access_token: accessToken
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
    console.error('處理Instagram發文請求出錯:', error);
    return NextResponse.json({ 
      message: '處理請求時出錯',
      error: error.message
    }, { status: 500 });
  }
} 