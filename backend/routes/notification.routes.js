import express from 'express';
import { 
  createNotification, 
  deleteNotification
  // getUserNotifications
} from '../controllers/notification.controller.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create a new notification (future/recurring optional)
router.post('/create', authenticateUser, createNotification);
router.delete('/:id', authenticateUser, deleteNotification);

// Get all notifications for the authenticated user
// router.get('/user', authenticateUser, getUserNotifications);

export default router;