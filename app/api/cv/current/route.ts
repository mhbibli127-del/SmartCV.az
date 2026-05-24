import { NextRequest, NextResponse } from 'next/server';
import { DatabaseOperations } from '@/lib/models';
import { getAuthenticatedUser } from '@/lib/session';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    
    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('Fetching current CV for user', 'cv-api', { userId: user.email });

    try {
      const cv = await DatabaseOperations.getUserCV(user.email);

      if (cv) {
        const cvData = {
          id: cv._id?.toString(),
          templateId: cv.templateId,
          templateName: cv.data?.templateName,
          sections: cv.data?.sections || [],
          metadata: cv.data?.metadata || { version: 1 },
          generatorData: cv.data?.generatorData,
          status: cv.status,
        };

        logger.info('CV loaded successfully', 'cv-api', { cvId: cv._id, userId: user.email });

        return NextResponse.json({ cvData });
      }

      logger.info('No CV found for user, returning empty state', 'cv-api', { userId: user.email });
      return NextResponse.json({ cvData: null });
    } catch (dbError) {
      logger.warn('Database unavailable, returning empty state', 'cv-api', dbError as Error);
      return NextResponse.json({ cvData: null });
    }
  } catch (error) {
    logger.error('Error fetching CV:', 'cv-api', error as Error);
    return NextResponse.json({ error: 'Failed to fetch CV' }, { status: 500 });
  }
}
