import express from 'express';
import { registerNewPatient, getAllBedInfo, assignBed, dischargeBed, getAllPatients } from '../controllers/receptionistController.js';
import {addBill} from '../controllers/receptionistController.js'; // Assuming you have a billController for handling bills

const router = express.Router();

// TODO: Add routes for receptionist
router.post('/register-patient', registerNewPatient);
router.get('/beds', getAllBedInfo);
router.post('/add-bill', addBill);
// Routes for bed management
router.post('/assign-bed', assignBed);
router.post('/discharge-bed', dischargeBed);


// Route to get all patients information  FOR TESTING
router.get('/patients', getAllPatients);

export default router;


