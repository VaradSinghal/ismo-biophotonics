import * as admin from 'firebase-admin';
import { env } from '../../config/env';
import { todayInTimezone, addDays, toDbDate } from '../../lib/dates';
import { prisma } from '../../lib/prisma';
import { logger } from '../../lib/logger';

let firebaseApp: admin.app.App | undefined;

function getFirebase() {
  if (firebaseApp) return firebaseApp;
  if (!env.FIREBASE_SERVICE_ACCOUNT_BASE64) return undefined;
  try {
    const creds = JSON.parse(Buffer.from(env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8'));
    firebaseApp = admin.initializeApp({ credential: admin.credential.cert(creds) });
    return firebaseApp;
  } catch (err) {
    logger.error({ err }, 'Failed to initialize Firebase Admin');
    return undefined;
  }
}

export async function sendDueTomorrowNotifications() {
  const fb = getFirebase();
  if (!fb) {
    logger.warn('FCM notifications requested but Firebase is not configured');
    return;
  }

  // Process devices in batches
  const batchSize = 100;
  let skip = 0;
  let processed = 0;
  let sent = 0;

  while (true) {
    const devices = await prisma.deviceToken.findMany({
      skip,
      take: batchSize,
      include: { user: { select: { id: true } } },
    });
    if (devices.length === 0) break;

    const messages: admin.messaging.Message[] = [];
    const updateIds: string[] = [];
    const deleteTokens: string[] = [];

    for (const device of devices) {
      const today = todayInTimezone(device.timezone);
      const tomorrowStr = addDays(today, 1);
      const tomorrowDb = toDbDate(tomorrowStr);
      
      // Prevent spam: only one notification per device per local day
      if (device.lastNotifiedOn && device.lastNotifiedOn.toISOString().slice(0, 10) === today) {
        continue;
      }

      // Count tasks due tomorrow for this user
      const dueTasksCount = await prisma.task.count({
        where: {
          project: { userId: device.userId },
          status: { not: 'COMPLETED' },
          dueDate: tomorrowDb,
        },
      });

      if (dueTasksCount > 0) {
        messages.push({
          token: device.token,
          notification: {
            title: 'Tasks Due Tomorrow',
            body: `You have ${dueTasksCount} task${dueTasksCount > 1 ? 's' : ''} due tomorrow. Open the app to view them.`,
          },
        });
        updateIds.push(device.id);
      }
    }

    if (messages.length > 0) {
      const result = await fb.messaging().sendEach(messages);
      
      // Check for invalid tokens to clean up
      result.responses.forEach((resp, idx) => {
        if (!resp.success && resp.error?.code === 'messaging/registration-token-not-registered') {
          deleteTokens.push(messages[idx]!.token);
        } else if (resp.success) {
          sent++;
        }
      });

      const todayDb = toDbDate(todayInTimezone('UTC')); // Value doesn't matter much as long as it's a DATE
      if (updateIds.length > 0) {
        await prisma.deviceToken.updateMany({
          where: { id: { in: updateIds } },
          data: { lastNotifiedOn: todayDb },
        });
      }
      if (deleteTokens.length > 0) {
        await prisma.deviceToken.deleteMany({
          where: { token: { in: deleteTokens } },
        });
      }
    }

    processed += devices.length;
    skip += batchSize;
  }

  logger.info({ processed, sent }, 'Due-tomorrow notifications completed');
}
