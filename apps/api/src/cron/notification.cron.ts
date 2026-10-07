import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import * as admin from 'firebase-admin';

const prisma = new PrismaClient();

// Run every day at 8:00 AM
export const initCronJobs = () => {
  cron.schedule('0 8 * * *', async () => {
    console.log('Running daily task notification cron job...');
    
    // Check if Firebase is actually initialized
    if (!admin.apps.length) return;

    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const nextDay = new Date(tomorrow);
      nextDay.setDate(nextDay.getDate() + 1);

      // Find tasks due tomorrow
      const dueTasks = await prisma.task.findMany({
        where: {
          dueDate: {
            gte: tomorrow,
            lt: nextDay,
          },
          status: {
            not: 'COMPLETED'
          }
        },
        include: {
          project: {
            include: {
              user: true
            }
          }
        }
      });

      for (const task of dueTasks) {
        // Assuming we would have stored FCM device tokens for users in a DeviceToken table
        // For demonstration, we simply log it or send to a topic
        const topic = `user_${task.project.userId}`;
        
        await admin.messaging().send({
          topic: topic,
          notification: {
            title: 'Task Due Tomorrow!',
            body: `Your task "${task.name}" in project "${task.project.name}" is due tomorrow.`,
          },
        });
        console.log(`Sent notification for task: ${task.id}`);
      }
    } catch (error) {
      console.error('Error running notification cron job:', error);
    }
  });
};
