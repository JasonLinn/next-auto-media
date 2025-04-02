// 導入 clsx 和 tailwind-merge
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 格式化文件大小
 * @param bytes 文件大小（位元組）
 * @returns 格式化後的大小字符串
 */
export function formatFileSize(bytes: number): string {
  if (!bytes || isNaN(bytes)) return '未知大小';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * 組合 CSS 類名
 * 基於 clsx 和 tailwind-merge 工具
 * @param inputs 要組合的類名
 * @returns 組合後的類名
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * 格式化日期時間
 * @param dateString ISO日期字符串
 * @returns 格式化後的日期時間字符串
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '未知時間';
  
  try {
    const date = new Date(dateString);
    
    // 檢查日期是否有效
    if (isNaN(date.getTime())) {
      return '無效日期';
    }
    
    // 格式化為 YYYY-MM-DD HH:MM
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch (error) {
    console.error('格式化日期時出錯:', error);
    return '日期錯誤';
  }
} 