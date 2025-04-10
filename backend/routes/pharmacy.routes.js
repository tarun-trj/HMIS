import express from 'express';
import { searchPatientPrescriptions } from '../controllers/pharmacist.controller.js';

const router = express.Router();

// TODO: Add routes for pharmacy
router.get('/prescriptions', searchPatientPrescriptions);

export default router;