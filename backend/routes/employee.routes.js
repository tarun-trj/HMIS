import express from 'express';
import Employee from '../models/employee.js';
import { sendAdmin } from '../controllers/employeeController.js';

const router = express.Router();

// GET all employees
// api/employees
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/send', sendAdmin);

export default router;
