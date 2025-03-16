import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AutoMedia - 社交媒體管理平台",
  description: "一站式社交媒體管理平台，輕鬆連接 Google Drive、上傳視頻、排程發布到不同社交媒體平台。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className="font-sans">{children}</body>
    </html>
  );
}
