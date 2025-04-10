import express from 'express';
import { fetchAppointments, updateAppointments, fetchPatientConsultations } from '../controllers/doctor.controller.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// TODO: Add routes for doctor

router.get('/appointments', authenticateUser, fetchAppointments);
router.put('/appointments', authenticateUser, updateAppointments);
router.get('/consultations/:patientId', authenticateUser, fetchPatientConsultations);

export default router;
