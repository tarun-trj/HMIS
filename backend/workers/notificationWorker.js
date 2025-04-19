import { Worker } from 'bullmq';
import { addDays, addWeeks, addMonths, format, parseISO } from 'date-fns';
import dotenv from 'dotenv';
import Notification from '../models/notification.js';
import { sendMessage } from '../config/sendMail.js';

dotenv.config();

// Helper function to calculate next occurrence based on frequency
const calculateNextDate = (currentDate, frequency) => {
  try {
    const [valueStr, unit] = frequency.split(' ');
    const value = parseInt(valueStr, 10);
    
    if (isNaN(value) || value <= 0) {
      throw new Error(`Invalid frequency value: ${valueStr}`);
    }

    switch (unit?.toLowerCase()) {
      case 'day':
      case 'days':
        return addDays(currentDate, value);
      case 'week':
      case 'weeks':
        return addWeeks(currentDate, value);
      case 'month':
      case 'months':
        return addMonths(currentDate, value);
      default:
        throw new Error(`Unsupported frequency unit: ${unit}`);
    }
  } catch (error) {
    console.error('Error calculating next date:', error);
    return null;
  }
};

// Create the worker with proper Redis connection
const worker = new Worker('notification-email', 
  async (job) => {
    try {
      const { 
        notificationId, 
        senderEmail, 
        receiverEmail, 
        content, 
        recurring, 
        frequency,
        date,
        time,
        scheduleIndex
      } = job.data;

      console.log(`Processing notification job ${job.id} to ${receiverEmail}`);

      // Format the email body with sender info
      const emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <h2 style="color: #333;">HMIS Notification</h2>
          <p><strong>From:</strong> ${senderEmail}</p>
          <div style="padding: 15px; border-left: 4px solid #0066cc; background-color: #f8f9fa; margin: 20px 0;">
            ${content}
          </div>
          <p style="color: #777; font-size: 12px;">This is an automated message from the HMIS system.</p>
        </div>
      `;

      // Send the email using your existing sendMessage utility
      await sendMessage(
        'HMIS Notification', 
        emailBody,
        senderEmail,
        receiverEmail  // Assuming this parameter is used as additional info
      );

      console.log(`Email sent successfully from ${senderEmail} to ${receiverEmail}`);
      
      // Update notification status in database
      if (notificationId) {
        // If we have a scheduleIndex, update the specific futureSchedules entry
        if (scheduleIndex) {
          await Notification.updateOne(
            { _id: notificationId, "futureSchedules._id": scheduleIndex },
            { $set: { "futureSchedules.$.status": "sent" } }
          );
        } else {
          // Otherwise update the main notification
          await Notification.findByIdAndUpdate(
            notificationId,
            { $set: { "futureSchedules.$[elem].status": "sent" } },
            { arrayFilters: [{ "elem.status": "pending" }], multi: false }
          );
        }
      }

      // Handle recurring notifications
      if (recurring && frequency) {
        // Get the base date for calculation
        let baseDate = date ? new Date(date) : new Date();
        
        // If time is provided, parse it properly
        if (time) {
          const [hours, minutes] = time.split(':').map(num => parseInt(num, 10));
          baseDate.setHours(hours, minutes, 0, 0);
        }

        // Calculate next occurrence
        const nextDate = calculateNextDate(baseDate, frequency);
        
        if (nextDate) {
          // Format next date/time
          const nextDateStr = format(nextDate, 'yyyy-MM-dd');
          const nextTimeStr = format(nextDate, 'HH:mm');
          
          // Calculate delay (milliseconds until next occurrence)
          const delay = Math.max(0, nextDate.getTime() - Date.now());
          
          // Import queue here to avoid circular dependencies
          const { default: notificationQueue } = await import('../queues/notificationQueue.js');
          
          // Add a new job to the queue for the next occurrence
          const jobData = {
            ...job.data,
            date: nextDateStr,
            time: nextTimeStr
          };
          
          // Add to queue with appropriate delay
          await notificationQueue.add('send-email', jobData, {
            delay,
            jobId: `${notificationId || 'recurring'}-${Date.now()}`
          });
          
          console.log(`Scheduled recurring notification for ${nextDateStr} at ${nextTimeStr}`);
          
          // If we have a notification ID, update the database by adding to futureSchedules
          if (notificationId) {
            await Notification.findByIdAndUpdate(notificationId, {
              $push: {
                futureSchedules: {
                  scheduledDateTime: nextDate,
                  priority: 1,
                  status: "pending"
                }
              }
            });
          }
        }
      }
      
      return { success: true };
      
    } catch (error) {
      console.error(`Error processing notification job ${job.id}:`, error);
      throw error; // Rethrow to trigger Bull's retry mechanism
    }
  }, 
  { 
    connection: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      username: 'default',
      password: process.env.REDIS_PASSWORD,
      // These options are important to prevent the blocking error
      enableReadyCheck: false,
      maxRetriesPerRequest: null
    },
    concurrency: 5,
    autorun: true
  }
);

// Handle worker events
worker.on('completed', job => {
  console.log(`Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed with error:`, err.message);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  await worker.close();
});

process.on('SIGINT', async () => {
  await worker.close();
});

console.log('Notification worker started');

export default worker;