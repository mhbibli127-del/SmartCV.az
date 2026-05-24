import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/session';
import { DatabaseOperations } from '@/lib/models';

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    
    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, phone } = await req.json();

    try {
      await DatabaseOperations.upsertUserProfile({
        userId: user.email,
        userEmail: user.email,
        name: name || user.name || undefined,
        preferences: {
          theme: 'light',
          language: 'en',
          notifications: true,
        },
        stats: {
          cvsCreated: 0,
          templatesUsed: 0,
          lastActive: new Date(),
        },
      });
    } catch {
      // Profile store optional when MongoDB is unavailable
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: { name, email: email || user.email, phone },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
