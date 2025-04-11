import express from 'express';

const router = express.Router();

// TODO: Add routes for patient
import {
    FetchPatientProfile,
    fetchConsultations,
    getAllDoctors,
    sendFeedback,
} from '../controllers/patientController.js';

import {
    getConsultationById
} from '../controllers/consultation.controller.js';

router.get('/profile/:patientId', FetchPatientProfile);
router.get('/consultations/:patientId', fetchConsultations);
router.get('/doctors', getAllDoctors)
router.post('/:patientId/consultations/:consultationId/feedback', sendFeedback);
router.get("/consultations/:id", getConsultationById);

export default router;
