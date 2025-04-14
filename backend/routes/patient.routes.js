import express from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// TODO: Add routes for patient
import {
    FetchPatientProfile,
    fetchConsultationsByPatientId,
    getAllDoctors,
    sendFeedback,
    rescheduleConsultation,
    cancelConsultation,
    registerPatient
} from '../controllers/patientController.js';

// GETs
router.get('/doctors', getAllDoctors); // No params, safest to be first
router.get('/profile/:patientId', FetchPatientProfile); // Single param
// router.get('/:patientId/consultations', fetchConsultationsByPatientId);
router.get('/:patientId/consultations',authenticateUser, fetchConsultationsByPatientId);
router.post('/:patientId/consultations/:consultationId/feedback', sendFeedback);
router.post('/register', registerPatient);

// PUTs
router.put('/:consultationId/reschedule', rescheduleConsultation);
export default router;

// DELETE
router.delete("/:consultationId/cancel", cancelConsultation);