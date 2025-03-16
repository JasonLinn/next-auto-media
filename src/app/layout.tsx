import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  fallback: ['system-ui', 'sans-serif']
});

export const metadata: Metadata = {
  title: "AutoMedia - 社交媒體管理平台",
  description: "一站式社交媒體管理平台，輕鬆連接 Google Drive、上傳視頻、排程發布到不同社交媒體平台。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const bodyClassName = inter?.className || '';
  
  return (
    <html lang="zh-TW">
      <body className={bodyClassName}>{children}</body>
    </html>
  );
}
