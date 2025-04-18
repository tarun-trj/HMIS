import express from 'express';
import {
  searchPatientPrescriptions,
  updatePrescriptionEntry,
  deletePrescriptionEntry
} from '../controllers/pharmacist.controller.js';

const router = express.Router();

router.get('/prescriptions/search', searchPatientPrescriptions);
router.put('/prescription/:prescriptionId/entry/:entryId', updatePrescriptionEntry);
router.delete('/prescription/:prescriptionId/entry/:entryId', deletePrescriptionEntry);

export default router;
