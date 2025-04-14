import express from 'express';
import { addAmbulance, getAmbulanceByVehicleNumber, decommissionAmbulance, getAllAmbulances } from '../controllers/facility.controller.js';

const router = express.Router();

// Add ambulance
router.post('/ambulance', addAmbulance);

// Get ambulance by vehicle number
router.get('/ambulance/:vehicle_number', getAmbulanceByVehicleNumber);

// Decommission ambulance
router.delete('/ambulance/decommission', decommissionAmbulance);

// Get all ambulances
router.get('/ambulances', getAllAmbulances);

export default router;
