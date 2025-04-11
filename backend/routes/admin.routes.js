import express from 'express';
import { generatePayslip, searchEmployees, updateInventory, addStaff, updateSalary } from '../controllers/adminController.js';

import bodyParser from 'body-parser';

const router = express.Router();

router.post('/generate-payslip', generatePayslip);
router.get('/search-employees', searchEmployees);
router.post('/update-inventory', updateInventory);
router.post('/add-staff', addStaff);
router.post('/update-salary', updateSalary);
export default router;
