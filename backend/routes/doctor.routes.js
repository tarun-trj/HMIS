import express from 'express';
import { 
  fetchAppointments, 
  updateAppointments, 
  fetchPatientConsultations,
  fetchPatientProgress,
  addDiagnosis,
  addRemarks,
  addPrescription
} from '../controllers/doctor.controller.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/appointments', authenticateUser, fetchAppointments);
router.put('/appointments', authenticateUser, updateAppointments);

//  Expects:
//  - req.params.patientId: String (Patient ID)
//  - Authentication token with doctor_id in req.user
router.get('/consultations/:patientId', authenticateUser, fetchPatientConsultations);

// Expects:
// - req.params.patientId: String (Patient ID)
// - Authentication token with doctor_id in req.user
// - Doctor must have previously had consultations with this patient
router.get('/progress/:patientId', authenticateUser, fetchPatientProgress);

// Expects:
// - req.params.consultationId: String (MongoDB ObjectId)
// - req.body.diagnosis: String
// - Authentication token with doctor_id in req.user
router.put('/updateConsultations/:consultationId/diagnosis', authenticateUser, addDiagnosis);

// Expects:
// - req.params.consultationId: String (MongoDB ObjectId)
// - req.body.remark: String
// - Authentication token with doctor_id in req.user
router.put('/updateConsultations/:consultationId/remarks', authenticateUser, addRemarks);

// Expects:
// - req.params.consultationId: String (MongoDB ObjectId)
// - req.body.prescriptionData: Object containing:
//   - entries: Array of prescription items, each with medication, dosage, frequency, etc.
// - Authentication token with doctor_id in req.user
router.put('/updateConsultations/:consultationId/prescriptions', authenticateUser, addPrescription);

export default router;