import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
  const session = await auth();
  
  // 返回會話信息，但不包含敏感數據
  return NextResponse.json({
    user: session?.user || null,
    expires: session?.expires || null,
    authenticated: !!session?.user,
  });
} 