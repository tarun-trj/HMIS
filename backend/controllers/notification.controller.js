import Notification from '../models/notification.js';
import { parseISO, addMilliseconds } from 'date-fns';
import Employee from '../models/employee.js';
import Patient from '../models/patient.js';
import notificationQueue from '../queues/notificationQueue.js';

/**
 * Create a new notification
 * Can be immediate, future scheduled or recurring
 */
export const createNotification = async (req, res) => {
  try {
    const { 
      receiverEmail, 
      content, 
      future, 
      date, 
      time, 
      recurring, 
      frequency 
    } = req.body;

    // Get user ID from the token
    const userId = req.user.id;
    
    // Get user email from database using the ID
    let senderEmail = 'hmis.iitg@gmail.com'; // Default fallback
    
    if (userId) {
      // Check if user is patient or employee based on role
      const userType = req.user.role === 'patient' ? 'patient' : 'employee';
      const userModel = userType === 'patient' ? Patient : Employee;
      
      const user = await userModel.findById(userId);
      if (user && user.email) {
        senderEmail = user.email;
        console.log("Found sender email:", senderEmail);
      }
    }
    
    if(!senderEmail || !receiverEmail || !content) {
      return res.status(400).json({
        success: false,
        message: 'Sender email, receiver email, and content are required fields'
      });
    }

    console.log(`Future: ${future} Date: ${date} Time: ${time}`);

    // Create notification record in database
    const notification = new Notification({
      senderEmail,
      receiverEmail,
      content,
      date: future ? new Date(date) : new Date(),
      time: future ? time : new Date().toTimeString().split(' ')[0].substring(0, 5), // Format as HH:MM
      future: future || false,
      recurring: recurring || false,
      frequency: recurring ? frequency : null,
      futureSchedules: []
    });
    
    // Add first schedule to futureSchedules if it's a future notification
    if (future && date && time) {
      try {
        // Fix time format - make sure it has the expected format HH:MM:SS
        // If time has seconds, use it as is; if not, add :00 for seconds
        const formattedTime = time.includes(':') && time.split(':').length === 2 
          ? `${time}:00` 
          : time;
        
        // Build ISO date string and parse
        const dateTimeString = `${date}T${formattedTime}`;
        console.log(`Attempting to parse: ${dateTimeString}`);
        
        const scheduledDateTime = new Date(dateTimeString);
        
        // Verify it's a valid date
        if (!isNaN(scheduledDateTime.getTime())) {
          console.log(`Parsed scheduled date/time: ${scheduledDateTime.toISOString()}`);
          
          notification.futureSchedules.push({
            scheduledDateTime,
            priority: 1,
            status: 'pending'
          });
        } else {
          throw new Error(`Invalid date result: ${scheduledDateTime}`);
        }
      } catch (error) {
        console.error('Error parsing scheduled date/time:', error);
      }
    }
    
    // Save notification to database
    const savedNotification = await notification.save();
    
    // Prepare job data for the queue
    const jobData = {
      notificationId: savedNotification._id.toString(),
      senderEmail,
      receiverEmail,
      content,
      recurring: recurring || false,
      frequency: frequency || null,
      date: future ? date : new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
      time: future ? time : new Date().toTimeString().split(' ')[0].substring(0, 5), // Format as HH:MM
      
      // If we have a futureSchedules entry, include its ID for reference
      scheduleIndex: savedNotification.futureSchedules.length > 0 
        ? savedNotification.futureSchedules[0]._id 
        : undefined
    };

    // Calculate delay for future notifications
    let delay = 0;
    
    if (future && date && time) {
      try {
        // Build a proper Date object directly
        // First split the time into hours, minutes, and seconds
        const [hours, minutes, seconds = '00'] = time.split(':').map(Number);
        
        // Create a date object from the date string
        const scheduledDate = new Date(date);
        
        // Set the time components
        scheduledDate.setHours(hours, minutes, Number(seconds), 0);
        
        // Calculate difference from now
        delay = scheduledDate.getTime() - Date.now();
        
        console.log(`Calculated delay: ${delay}ms for scheduled time: ${scheduledDate.toString()}`);
        
        if (isNaN(delay)) {
          throw new Error('Invalid date calculation result');
        }
        
        // Don't allow negative delays - minimum 0ms (immediate execution)
        delay = Math.max(0, delay);
      } catch (error) {
        console.error('Error calculating delay:', error);
        // Continue with immediate sending if date parsing fails
        delay = 0;
      }
    }

    // Add job to queue with appropriate delay
    const job = await notificationQueue.add('send-email', jobData, {
      delay,
      jobId: `notification-${savedNotification._id}-${Date.now()}`
    });

    console.log(`Added notification job ${job.id} to queue with delay: ${delay}ms`);
    
    res.status(201).json({
      success: true,
      message: future ? 'Notification scheduled successfully' : 'Notification sent successfully',
      notification: savedNotification
    });
    
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule notification',
      error: error.message
    });
  }
};

/**
 * Get all notifications for a specific user
 */
export const getNotifications = async (req, res) => {
  try {
    const { email } = req.query;
    
    const query = email ? { receiverEmail: email } : {};
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

/**
 * Delete notification by ID
 */
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    await notification.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};