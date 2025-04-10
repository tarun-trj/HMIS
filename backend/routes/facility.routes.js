import express from 'express';
import { addAmbulance, getAmbulanceByVehicleNumber, decommissionAmbulance } from '../controllers/facility.controller.js';

const router = express.Router();

// Add ambulance
router.post('/ambulance', addAmbulance);

// Get ambulance by vehicle number
router.get('/ambulance/:vehicle_number', getAmbulanceByVehicleNumber);

// Decommission ambulance
router.patch('/ambulance/:vehicle_number/decommission', decommissionAmbulance);

export default router;
