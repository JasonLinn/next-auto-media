"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import FacebookDirectPost from "@/components/social/FacebookDirectPost";
import InstagramDirectPost from "@/components/social/InstagramDirectPost";
import ThreadsDirectPost from "@/components/social/ThreadsDirectPost";
import TikTokDirectUpload from "@/components/social/TikTokDirectUpload";
import YouTubeDirectUpload from "@/components/social/YouTubeDirectUpload";
import { FaFacebookSquare, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";

export default function SocialMediaPage() {
  const [activeTab, setActiveTab] = useState<string>("facebook");

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">社交媒體發文</h1>
      
      <Tabs defaultValue="facebook" onValueChange={setActiveTab} value={activeTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-8 bg-white">
          <TabsTrigger value="facebook" className="flex flex-col items-center py-3">
            <FaFacebookSquare className="text-blue-600 text-xl mb-1" />
            <span>Facebook</span>
          </TabsTrigger>
          <TabsTrigger value="instagram" className="flex flex-col items-center py-3">
            <FaInstagram className="text-pink-600 text-xl mb-1" />
            <span>Instagram</span>
          </TabsTrigger>
          <TabsTrigger value="threads" className="flex flex-col items-center py-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mb-1">
              <path d="M14.258 10.152L23.176 0h-2.113l-7.747 8.813L7.133 0H0l9.352 13.328L0 23.973h2.113l8.176-9.309 6.531 9.309h7.133zm-2.895 3.293l-.949-1.328L2.875 1.56h3.246l6.086 8.523.945 1.328 7.91 11.078h-3.246z" />
            </svg>
            <span>Threads</span>
          </TabsTrigger>
          <TabsTrigger value="tiktok" className="flex flex-col items-center py-3">
            <FaTiktok className="text-xl mb-1" />
            <span>TikTok</span>
          </TabsTrigger>
          <TabsTrigger value="youtube" className="flex flex-col items-center py-3">
            <FaYoutube className="text-red-600 text-xl mb-1" />
            <span>YouTube</span>
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="facebook">
            <FacebookDirectPost />
          </TabsContent>
          
          <TabsContent value="instagram">
            <InstagramDirectPost />
          </TabsContent>
          
          <TabsContent value="threads">
            <ThreadsDirectPost />
          </TabsContent>
          
          <TabsContent value="tiktok">
            <TikTokDirectUpload />
          </TabsContent>
          
          <TabsContent value="youtube">
            <YouTubeDirectUpload />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
} 