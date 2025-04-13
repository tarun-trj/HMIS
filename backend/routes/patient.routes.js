import express from 'express';

const router = express.Router();

// TODO: Add routes for patient
import {
    FetchPatientProfile,
    fetchConsultationsByPatientId,
    getAllDoctors,
    sendFeedback,
    rescheduleConsultation,
    cancelConsultation,
    registerPatient,getDoctorById,
    getLatestPatientVital,
    getPatientVitals,
    getPatientVitalById
} from '../controllers/patientController.js';

// GETs
router.get('/doctors', getAllDoctors); // No params, safest to be first
router.get('/profile/:patientId', FetchPatientProfile); // Single param
router.get('/:patientId/consultations', fetchConsultationsByPatientId);
router.post('/:patientId/consultations/:consultationId/feedback', sendFeedback);
router.post('/register', registerPatient);
router.get('/doctors/:id',getDoctorById );

// Patient vitals routes
router.get('/:patientId/vitals', getPatientVitals);
router.get('/:patientId/vitals/latest', getLatestPatientVital);
router.get('/:patientId/vitals/:vitalId', getPatientVitalById);

// PUTs
router.put('/:consultationId/reschedule', rescheduleConsultation);
export default router;

// DELETE
router.delete("/:consultationId/cancel", cancelConsultation);

