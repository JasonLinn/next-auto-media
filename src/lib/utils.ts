/**
 * 格式化文件大小
 * @param sizeInBytes 文件大小（字節）
 * @returns 格式化後的文件大小
 */
export function formatFileSize(sizeInBytes: string | number): string {
  const size = typeof sizeInBytes === 'string' ? parseInt(sizeInBytes, 10) : sizeInBytes;
  
  if (isNaN(size) || size === 0) {
    return '0 B';
  }
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const digitGroups = Math.floor(Math.log10(size) / Math.log10(1024));
  
  return `${(size / Math.pow(1024, digitGroups)).toFixed(2)} ${units[digitGroups]}`;
}

/**
 * 格式化日期
 * @param dateString ISO 格式的日期字符串
 * @returns 格式化後的日期
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return '-';
  }
  
  // 格式化為 YYYY-MM-DD HH:MM
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
} 