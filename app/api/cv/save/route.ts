import { NextRequest, NextResponse } from 'next/server';
import { DatabaseOperations } from '@/lib/models';
import { createNotification, notificationMessages } from '@/lib/notifications';
import { getAuthenticatedUser } from '@/lib/session';
import { logger } from '@/lib/logger';
import { checkCanCreateCV } from '@/lib/plan-limits';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    
    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { cvData, status = 'draft', notify = true } = await req.json();

    logger.info('Saving CV for user', 'cv-api', { userId: user.email });

    const cvStatus = status === 'completed' ? 'completed' : 'draft';

    // Determine if this save will update an existing row or insert a new one.
    // The Mongo upsert keys on (userId, status), so any save against an
    // existing draft/completed row is an update — always allowed.
    let existingCvWillBeUpdated = false;
    try {
      const existing = await DatabaseOperations.getUserCVs(user.email);
      existingCvWillBeUpdated = existing.some((c) => c.status === cvStatus);
    } catch {
      // If Mongo is unavailable we can't tell — treat as insert (stricter).
    }

    const decision = await checkCanCreateCV(user.email, {
      existingCvWillBeUpdated,
    });
    if (!decision.ok) {
      logger.warn('CV creation blocked: plan limit reached', 'cv-api', {
        userId: user.email,
        plan: decision.plan,
        cvCount: decision.cvCount,
        cvLimit: decision.cvLimit,
      } as any);
      return NextResponse.json(
        {
          error:
            'You have reached the free plan limit of 1 CV. Upgrade to Pro to create more.',
          code: 'CV_LIMIT_REACHED',
          upgradeRequired: true,
          plan: decision.plan,
          cvCount: decision.cvCount,
          cvLimit: decision.cvLimit,
        },
        { status: 403 }
      );
    }

    try {
      const cvRecord = {
        userId: user.email,
        userEmail: user.email,
        templateId: cvData?.templateId || 1,
        data: {
          sections: cvData?.sections,
          templateName: cvData?.templateName,
          metadata: cvData?.metadata,
          generatorData: cvData?.generatorData,
        },
        status: cvStatus as 'draft' | 'completed',
      };

      const result = await DatabaseOperations.upsertUserCV(cvRecord);
      const cvId = result.insertedId?.toString();

      let notification = null;
      if (notify) {
        if (cvStatus === 'completed') {
          notification = await createNotification({
            userId: user.email,
            type: 'resume_complete',
            title: notificationMessages.resumeComplete.title,
            message: notificationMessages.resumeComplete.message,
          });
        } else {
          notification = await createNotification({
            userId: user.email,
            type: 'cv_saved',
            title: notificationMessages.cvSaved.title,
            message: notificationMessages.cvSaved.message,
          });
        }
      }

      logger.info('CV saved successfully', 'cv-api', { cvId, userId: user.email });

      return NextResponse.json({
        success: true,
        cvId,
        status: cvStatus,
        notification,
        message: 'CV saved successfully',
      });
    } catch (dbError) {
      logger.warn('Database unavailable, saving to localStorage fallback', 'cv-api', dbError as Error);
      return NextResponse.json({ success: true, message: 'CV saved (local fallback)' });
    }
  } catch (error) {
    logger.error('Error saving CV:', 'cv-api', error as Error);
    return NextResponse.json({ error: 'Failed to save CV' }, { status: 500 });
  }
}
