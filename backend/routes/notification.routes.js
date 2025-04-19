import express from 'express';
import { 
  createNotification, 
  getUserNotifications
} from '../controllers/notification.controller.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create a new notification (future/recurring optional)
router.post('/create', authenticateUser, createNotification);

// Get all notifications for the authenticated user
router.get('/user', authenticateUser, getUserNotifications);

export default router;