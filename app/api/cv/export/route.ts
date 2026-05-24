import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    
    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const cvData = body.cvData ?? body.cv;
    const hasContent = cvData?.sections?.length || cvData?.fullName;

    const mockPDF = Buffer.from(
      hasContent
        ? `SmartCV Export for ${user.email}\nGenerated at ${new Date().toISOString()}`
        : 'Mock PDF content'
    );
    
    return new NextResponse(mockPDF, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="my-resume.pdf"'
      }
    });
  } catch (error) {
    console.error('Error exporting CV:', error);
    return NextResponse.json({ error: 'Failed to export CV' }, { status: 500 });
  }
}
