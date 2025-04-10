import express from 'express';
import { 
  fetchAppointments, 
  updateAppointments, 
  fetchPatientConsultations,
  fetchPatientProgress 
} from '../controllers/doctor.controller.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// Existing routes
router.get('/appointments', authenticateUser, fetchAppointments);
router.put('/appointments', authenticateUser, updateAppointments);
router.get('/consultations/:patientId', authenticateUser, fetchPatientConsultations);

// New route for patient progress (vitals)
router.get('/progress/:patientId', authenticateUser, fetchPatientProgress);

export default router;