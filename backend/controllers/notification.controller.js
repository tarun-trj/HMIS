import Notification from '../models/notification.js';
import { parseISO } from 'date-fns';
import Employee from '../models/employee.js';
import Patient from '../models/patient.js';

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
        message: 'Sender, receiver and content are required'
      });
    }

    // Create basic notification object
    const notification = new Notification({
      senderEmail,
      receiverEmail,
      content,
      future: future || false,
      recurring: recurring || false,
      date: future ? parseISO(date) : new Date(),
      time: future ? time : new Date().toTimeString().split(' ')[0],
      frequency: recurring ? frequency : null
    });

    console.log(notification);

    // TODO: Any new notification that does not have a future schedule should be sent immediately and hence it needs to be added to the redis queue immediately here
    
    // Handle future schedules
    // TODO 1: For recurring cases we need to create a worker that will go through all notifications at a fixed time interval, find recurring notifications and add them to future schedule if not already present
    // TODO 2: The above worker will also go through the future scheduled notifications and send them to redis queue for sending if its time has come
    if (future) {
        if (!recurring){
            const scheduledDateTime = parseISO(`${date}T${time}`);
            notification.futureSchedules = [{
              scheduledDateTime,
              priority: 1,
              status: 'pending'
            }];      
        }
    }
    
    await notification.save();
    
    res.status(201).json({
      success: true,
      message: 'Notification scheduled successfully',
      notification
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
export const getUserNotifications = async (req, res) => {
  try {
    const userEmail = req.user.email;
    
    const notifications = await Notification.find({
      receiverEmail: userEmail
    }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications
    });
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};