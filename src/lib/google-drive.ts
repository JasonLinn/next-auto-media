import { google, drive_v3 } from 'googleapis';
import { auth } from '@/auth';
import { NextRequest } from 'next/server';

// 定義文件類型
export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string | null;
  webViewLink?: string | null;
  iconLink?: string | null;
  size?: string | null;
  modifiedTime?: string | null;
  createdTime?: string | null;
  parents?: string[] | null;
  isFolder: boolean;
}

// 創建 Google Drive 客戶端
export async function getDriveClient(): Promise<drive_v3.Drive | null> {
  try {
    // 從 auth() 獲取會話
    const session = await auth();
    
    if (!session?.accessToken) {
      console.error('未找到訪問令牌');
      return null;
    }

    console.log('創建 Drive 客戶端:', { 
      hasAccessToken: !!session.accessToken,
      hasRefreshToken: !!session.refreshToken
    });

    // 創建 OAuth2 客戶端
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    // 設置訪問令牌
    oauth2Client.setCredentials({
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
    });

    // 創建 Drive 客戶端
    const drive = google.drive({
      version: 'v3',
      auth: oauth2Client,
    });

    return drive;
  } catch (error) {
    console.error('創建 Google Drive 客戶端時出錯:', error);
    return null;
  }
}

// 列出文件和文件夾
export async function listFiles(
  drive: drive_v3.Drive,
  folderId: string = 'root',
  pageSize: number = 100,
  pageToken?: string
): Promise<{ files: DriveFile[]; nextPageToken?: string | null }> {
  try {
    // 查詢參數
    const query = folderId === 'root'
      ? "'root' in parents and trashed = false"
      : `'${folderId}' in parents and trashed = false`;

    // 獲取文件列表
    const response = await drive.files.list({
      q: query,
      pageSize,
      pageToken,
      fields: 'nextPageToken, files(id, name, mimeType, thumbnailLink, webViewLink, iconLink, size, modifiedTime, createdTime, parents)',
      orderBy: 'folder,name',
    });

    // 轉換為我們的文件類型
    const files: DriveFile[] = (response.data.files || []).map((file) => ({
      id: file.id || '',
      name: file.name || '',
      mimeType: file.mimeType || '',
      thumbnailLink: file.thumbnailLink,
      webViewLink: file.webViewLink,
      iconLink: file.iconLink,
      size: file.size,
      modifiedTime: file.modifiedTime,
      createdTime: file.createdTime,
      parents: file.parents,
      isFolder: file.mimeType === 'application/vnd.google-apps.folder',
    }));

    return {
      files,
      nextPageToken: response.data.nextPageToken,
    };
  } catch (error) {
    console.error('列出文件時出錯:', error);
    return { files: [] };
  }
}

// 獲取文件詳情
export async function getFile(
  drive: drive_v3.Drive,
  fileId: string
): Promise<DriveFile | null> {
  try {
    const response = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, thumbnailLink, webViewLink, iconLink, size, modifiedTime, createdTime, parents',
    });

    const file = response.data;
    return {
      id: file.id || '',
      name: file.name || '',
      mimeType: file.mimeType || '',
      thumbnailLink: file.thumbnailLink,
      webViewLink: file.webViewLink,
      iconLink: file.iconLink,
      size: file.size,
      modifiedTime: file.modifiedTime,
      createdTime: file.createdTime,
      parents: file.parents,
      isFolder: file.mimeType === 'application/vnd.google-apps.folder',
    };
  } catch (error) {
    console.error('獲取文件詳情時出錯:', error);
    return null;
  }
}

// 搜索文件
export async function searchFiles(
  drive: drive_v3.Drive,
  query: string,
  pageSize: number = 30,
  pageToken?: string
): Promise<{ files: DriveFile[]; nextPageToken?: string | null }> {
  try {
    // 構建查詢
    const searchQuery = `name contains '${query}' and trashed = false`;

    // 執行搜索
    const response = await drive.files.list({
      q: searchQuery,
      pageSize,
      pageToken,
      fields: 'nextPageToken, files(id, name, mimeType, thumbnailLink, webViewLink, iconLink, size, modifiedTime, createdTime, parents)',
    });

    // 轉換為我們的文件類型
    const files: DriveFile[] = (response.data.files || []).map((file) => ({
      id: file.id || '',
      name: file.name || '',
      mimeType: file.mimeType || '',
      thumbnailLink: file.thumbnailLink,
      webViewLink: file.webViewLink,
      iconLink: file.iconLink,
      size: file.size,
      modifiedTime: file.modifiedTime,
      createdTime: file.createdTime,
      parents: file.parents,
      isFolder: file.mimeType === 'application/vnd.google-apps.folder',
    }));

    return {
      files,
      nextPageToken: response.data.nextPageToken,
    };
  } catch (error) {
    console.error('搜索文件時出錯:', error);
    return { files: [] };
  }
}

// 獲取文件下載鏈接
export async function getDownloadLink(
  drive: drive_v3.Drive,
  fileId: string
): Promise<string | null> {
  try {
    // 獲取文件詳情
    const file = await getFile(drive, fileId);
    
    if (!file) {
      return null;
    }

    // 如果是 Google 文檔類型，需要導出
    if (file.mimeType.startsWith('application/vnd.google-apps')) {
      // 根據文件類型選擇導出格式
      let mimeType = 'application/pdf'; // 默認導出為 PDF
      
      if (file.mimeType === 'application/vnd.google-apps.spreadsheet') {
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'; // Excel
      } else if (file.mimeType === 'application/vnd.google-apps.document') {
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'; // Word
      } else if (file.mimeType === 'application/vnd.google-apps.presentation') {
        mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'; // PowerPoint
      }

      // 獲取導出鏈接
      const response = await drive.files.export({
        fileId,
        mimeType,
      }, { responseType: 'stream' });

      // 返回導出鏈接
      const url = response.config.url;
      return url ? url.toString() : null;
    } else {
      // 普通文件直接獲取下載鏈接
      const response = await drive.files.get({
        fileId,
        alt: 'media',
      }, { responseType: 'stream' });

      // 返回下載鏈接
      const url = response.config.url;
      return url ? url.toString() : null;
    }
  } catch (error) {
    console.error('獲取下載鏈接時出錯:', error);
    return null;
  }
} 