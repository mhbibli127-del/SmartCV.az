import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { templateId } = await req.json();

    // In production, save template selection to database
    console.log('User selected template:', templateId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error using template:', error);
    return NextResponse.json({ error: 'Failed to use template' }, { status: 500 });
  }
}
