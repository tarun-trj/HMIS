import express from 'express';
import { 
  sendAdmin, 
  getRoleSpecificId,
  getEmployees,
  getEmployeeById,
  getEmployeesByDept,
  getEmployeesByRole} from '../controllers/employeeController.js';

const router = express.Router();
router.get('/get-role-id', getRoleSpecificId);

router.post('/send', sendAdmin);

// @route GET /api/employees
router.get('/', getEmployees);

// @route GET /api/employees/by-id/:id
router.get('/by-id/:id', getEmployeeById);

// @route GET /api/employees/by-dept/:deptId
router.get('/by-dept/:deptId', getEmployeesByDept);

// @route GET /api/employees/by-role/:role
router.get('/by-role/:role', getEmployeesByRole);
export default router;