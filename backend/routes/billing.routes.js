import express from 'express';
import { 
  getBillsByPatientId, 
  getBillDetails, 
  getPaymentsByBillId,
  addPayment,
  addBillingItem,
  createBill
} from '../controllers/billController.js';

const router = express.Router();

// Get all bills for a patient
router.get('/patient/:patientId', getBillsByPatientId);

// Get detailed bill information
router.get('/:billId', getBillDetails);

// Get payments for a bill
router.get('/:billId/payments', getPaymentsByBillId);

// Add a payment to a bill
router.post('/:billId/payments', addPayment);

// Add a billing item to a bill
router.post('/:billId/items', addBillingItem);

// Create a new bill
router.post('/', createBill);

export default router;