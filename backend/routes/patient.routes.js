import express from 'express';

const router = express.Router();

// TODO: Add routes for patient
import {
    FetchPatientProfile,
    fetchConsultationsByPatientId,
    getAllDoctors,
    sendFeedback,
} from '../controllers/patientController.js';

router.get('/:patientId/consultations', fetchConsultationsByPatientId);
router.post('/:patientId/consultations/:consultationId/feedback', sendFeedback);
router.get('/doctors', getAllDoctors)
router.get('/profile/:patientId', FetchPatientProfile);

export default router;
