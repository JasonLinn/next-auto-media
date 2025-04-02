import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log('處理會話請求...');
    const session = await auth();
    
    console.log('會話狀態:', {
      hasSession: !!session,
      user: session?.user?.email,
      hasToken: !!session?.accessToken
    });
    
    return NextResponse.json({
      authenticated: !!session,
      session
    });
  } catch (error) {
    console.error('獲取會話時發生錯誤:', error);
    return NextResponse.json(
      { error: '獲取會話時發生錯誤', details: error },
      { status: 500 }
    );
  }
} 