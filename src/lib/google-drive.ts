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
  webContentLink?: string | null;
  iconLink?: string | null;
  size?: string | null;
  modifiedTime?: string | null;
  createdTime?: string | null;
  parents?: string[];
  isFolder?: boolean;
}

/**
 * 獲取 Google Drive 客戶端
 * 使用當前用戶的訪問令牌創建 Google Drive API 客戶端
 */
export async function getDriveClient(): Promise<drive_v3.Drive> {
  // 獲取當前用戶的會話
  const session = await auth();
  
  if (!session || !session.accessToken) {
    console.error('獲取 Drive 客戶端: 缺少訪問令牌');
    throw new Error('訪問令牌缺失或無效，請重新登入');
  }
  
  // 創建 OAuth2 客戶端
  const oauth2Client = new google.auth.OAuth2();
  
  // 設置訪問令牌
  oauth2Client.setCredentials({
    access_token: session.accessToken,
    refresh_token: session.refreshToken
  });
  
  // 創建 Drive 客戶端
  const drive = google.drive({
    version: 'v3',
    auth: oauth2Client
  });
  
  return drive;
}

/**
 * 獲取文件詳情
 * @param drive Google Drive 客戶端
 * @param fileId 文件 ID
 */
export async function getFile(drive: drive_v3.Drive, fileId: string): Promise<DriveFile | null> {
  try {
    const response = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, size, modifiedTime, createdTime, thumbnailLink, webViewLink, webContentLink, iconLink, parents'
    });
    
    if (!response.data) {
      return null;
    }
    
    const file = response.data as DriveFile;
    file.isFolder = file.mimeType === 'application/vnd.google-apps.folder';
    
    return file;
  } catch (error) {
    console.error('獲取文件詳情時出錯:', error);
    return null;
  }
}

/**
 * 列出文件夾中的文件
 * @param drive Google Drive 客戶端
 * @param folderId 文件夾 ID，默認為 'root'
 * @param pageSize 每頁數量
 * @param pageToken 分頁令牌
 */
export async function listFiles(
  drive: drive_v3.Drive, 
  folderId: string = 'root', 
  pageSize: number = 100, 
  pageToken?: string
): Promise<{ files: DriveFile[], nextPageToken?: string | null }> {
  try {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      pageSize,
      pageToken,
      fields: 'nextPageToken, files(id, name, mimeType, size, modifiedTime, thumbnailLink, webViewLink, webContentLink, iconLink, parents)'
    });
    
    const files = (response.data.files || []) as DriveFile[];
    
    // 標記文件夾
    files.forEach(file => {
      file.isFolder = file.mimeType === 'application/vnd.google-apps.folder';
    });
    
    return {
      files,
      nextPageToken: response.data.nextPageToken
    };
  } catch (error) {
    console.error('列出文件時出錯:', error);
    return { files: [] };
  }
}

/**
 * 搜索文件
 * @param drive Google Drive 客戶端
 * @param query 搜索查詢
 * @param pageSize 每頁數量
 * @param pageToken 分頁令牌
 */
export async function searchFiles(
  drive: drive_v3.Drive, 
  query: string, 
  pageSize: number = 100, 
  pageToken?: string
): Promise<{ files: DriveFile[], nextPageToken?: string | null }> {
  try {
    // 構建搜索查詢
    const searchQuery = `name contains '${query}' and trashed = false`;
    
    const response = await drive.files.list({
      q: searchQuery,
      pageSize,
      pageToken,
      fields: 'nextPageToken, files(id, name, mimeType, size, modifiedTime, thumbnailLink, webViewLink, webContentLink, iconLink, parents)'
    });
    
    const files = (response.data.files || []) as DriveFile[];
    
    // 標記文件夾
    files.forEach(file => {
      file.isFolder = file.mimeType === 'application/vnd.google-apps.folder';
    });
    
    return {
      files,
      nextPageToken: response.data.nextPageToken
    };
  } catch (error) {
    console.error('搜索文件時出錯:', error);
    return { files: [] };
  }
}

/**
 * 獲取文件下載鏈接
 * @param drive Google Drive 客戶端
 * @param fileId 文件 ID
 */
export async function getDownloadLink(drive: drive_v3.Drive, fileId: string): Promise<string | null> {
  try {
    // 獲取文件詳情
    const file = await getFile(drive, fileId);

    if (!file) {
      return null;
    }

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

/**
 * 獲取文件的麵包屑路徑
 * @param drive Google Drive 客戶端
 * @param fileId 文件 ID
 */
export async function getFilePath(drive: drive_v3.Drive, fileId: string): Promise<{ id: string, name: string }[]> {
  try {
    const path: { id: string, name: string }[] = [];
    let currentId = fileId;
    
    // 最多追溯 10 層目錄，避免無限循環
    for (let i = 0; i < 10 && currentId && currentId !== 'root'; i++) {
      const file = await getFile(drive, currentId);
      
      if (!file) break;
      
      // 將當前文件/文件夾添加到路徑開頭
      path.unshift({ id: file.id, name: file.name });
      
      // 獲取父文件夾 ID
      if (file.parents && file.parents.length > 0) {
        currentId = file.parents[0];
      } else {
        break;
      }
    }
    
    // 添加根目錄
    path.unshift({ id: 'root', name: '我的雲端硬碟' });
    
    return path;
  } catch (error) {
    console.error('獲取文件路徑時出錯:', error);
    return [{ id: 'root', name: '我的雲端硬碟' }];
  }
}

/**
 * 獲取文件縮圖
 * @param drive Google Drive 客戶端
 * @param fileId 文件 ID
 */
export async function getThumbnail(drive: drive_v3.Drive, fileId: string): Promise<string | null> {
  try {
    const file = await getFile(drive, fileId);
    
    if (!file || !file.thumbnailLink) {
      return null;
    }
    
    return file.thumbnailLink;
  } catch (error) {
    console.error('獲取縮圖時出錯:', error);
    return null;
  }
} 