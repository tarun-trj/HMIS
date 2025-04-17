// tests/integration/routes/routes.test.js
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach, importOriginal } from 'vitest';
import express from 'express';
import request from 'supertest';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../../helpers/db.js';

// Import all routers
import adminRoutes from '../../../routes/admin.routes.js';
import analyticsRoutes from '../../../routes/analytics.routes.js';
import authRoutes from '../../../routes/auth.routes.js';
import billingRoutes from '../../../routes/billing.routes.js';
import commonPageRoutes from '../../../routes/commonPages.routes.js';
import consultationRoutes from '../../../routes/consultation.routes.js';
import doctorRoutes from '../../../routes/doctor.routes.js';
import employeeRoutes from '../../../routes/employee.routes.js';
import facilityRoutes from '../../../routes/facility.routes.js';
import geminiRoutes from '../../../routes/gemini.routes.js';
import insuranceRoutes from '../../../routes/insurance.routes.js';
import inventoryRoutes from '../../../routes/inventory.routes.js';
import nurseRoutes from '../../../routes/nurse.routes.js';
import pathologistRoutes from '../../../routes/pathologist.routes.js';
import patientRoutes from '../../../routes/patient.routes.js';
import pharmacyRoutes from '../../../routes/pharmacy.routes.js';
import publicRoutes from '../../../routes/public.routes.js';
import receptionistRoutes from '../../../routes/receptionist.routes.js';

// Mock all controllers
vi.mock('../../../controllers/adminController.js', () => ({
  generatePayslip: vi.fn((req, res) => res.status(200).json({ message: 'Payslip generated' })),
  searchEmployees: vi.fn((req, res) => res.status(200).json({ employees: [] })),
  updateInventory: vi.fn((req, res) => res.status(200).json({ message: 'Inventory updated' })),
  addStaff: vi.fn((req, res) => res.status(201).json({ message: 'Staff added' })),
  updateSalary: vi.fn((req, res) => res.status(200).json({ message: 'Salary updated' })),
  processPayroll: vi.fn((req, res) => res.status(200).json({ message: 'Payroll processed' })),
  updateOrderStatus: vi.fn((req, res) => res.status(200).json({ message: 'Order status updated' })),
  getUniqueDepartments: vi.fn((req, res) => res.status(200).json({ departments: [] }))
}));

vi.mock('../../../controllers/analytics.controller.js', () => ({
  addRatingAndReview: vi.fn((req, res) => res.status(201).json({ message: 'Rating added' })),
  calculateOverallRating: vi.fn((req, res) => res.status(200).json({ rating: 4.5 })),
  calculateDepartmentRating: vi.fn((req, res) => res.status(200).json({ rating: 4.2 })),
  getAllFeedbacks: vi.fn((req, res) => res.status(200).json({ feedbacks: [] })),
  getMedicineInventoryTrends: vi.fn((req, res) => res.status(200).json({ trends: [] })),
  getMedicinePrescriptionTrends: vi.fn((req, res) => res.status(200).json({ trends: [] })),
  addMedicine: vi.fn((req, res) => res.status(201).json({ message: 'Medicine added' })),
  addInventoryLog: vi.fn((req, res) => res.status(201).json({ message: 'Inventory log added' })),
  createPrescription: vi.fn((req, res) => res.status(201).json({ prescription: {} })),
  createBill: vi.fn((req, res) => res.status(201).json({ bill: {} })),
  addItemToBill: vi.fn((req, res) => res.status(200).json({ message: 'Item added to bill' })),
  addPrescriptionEntry: vi.fn((req, res) => res.status(200).json({ message: 'Prescription entry added' })),
  getBedOccupancyTrends: vi.fn((req, res) => res.status(200).json({ trends: [] })),
  getFacilityStatistics: vi.fn((req, res) => res.status(200).json({ stats: {} })),
  getDoctorRatingDistribution: vi.fn((req, res) => res.status(200).json({ distribution: {} })),
  getAllConsultations: vi.fn((req, res) => res.status(200).json({ consultations: [] })),
  getFeedbacksByRating: vi.fn((req, res) => res.status(200).json({ feedbacks: [] })),
  getDoctorQuadrantData: vi.fn((req, res) => res.status(200).json({ data: {} })),
  getDepartmentQuadrantData: vi.fn((req, res) => res.status(200).json({ data: {} })),
  getAllDoctorsData: vi.fn((req, res) => res.status(200).json({ doctors: [] })),
  getDoctorWorkingTrends: vi.fn((req, res) => res.status(200).json({ trends: [] })),
  getFinanceTrends: vi.fn((req, res) => res.status(200).json({ trends: [] })),
  getTopKDiseases: vi.fn((req, res) => res.status(200).json({ diseases: [] })),
  getDiseaseTrends: vi.fn((req, res) => res.status(200).json({ trends: [] })),
  getDashboardKPIs: vi.fn((req, res) => res.status(200).json({ kpis: {} })),
  getRatingDistribution: vi.fn((req, res) => res.status(200).json({ distribution: {} })),
  getMedicines: vi.fn((req, res) => res.status(200).json({ medicines: [] }))
}));

vi.mock('../../../controllers/authController.js', () => ({
  forgotPassword: vi.fn((req, res) => res.status(200).json({ message: 'Reset email sent' })),
  resetPassword: vi.fn((req, res) => res.status(200).json({ message: 'Password reset successful' })),
  login: vi.fn((req, res) => res.status(200).json({ token: 'fake-token' })),
  refreshToken: vi.fn((req, res) => res.status(200).json({ token: 'new-fake-token' })),
  logout: vi.fn((req, res) => res.status(200).json({ message: 'Logged out successfully' }))
}));

vi.mock('../../../controllers/billController.js', () => ({
  getBillsByPatientId: vi.fn((req, res) => res.status(200).json({ bills: [] })),
  getBillDetails: vi.fn((req, res) => res.status(200).json({ bill: {} })),
  getPaymentsByBillId: vi.fn((req, res) => res.status(200).json({ payments: [] })),
  addPayment: vi.fn((req, res) => res.status(201).json({ payment: {} })),
  addBillingItem: vi.fn((req, res) => res.status(201).json({ item: {} })),
  createBill: vi.fn((req, res) => res.status(201).json({ bill: {} }))
}));

vi.mock('../../../controllers/commonPagesController.js', () => ({
  findPayrollById: vi.fn((req, res) => res.status(200).json({ payroll: {} })),
  getPatientCalendar: vi.fn((req, res) => res.status(200).json({ calendar: [] })),
  getDoctorCalendar: vi.fn((req, res) => res.status(200).json({ calendar: [] })),
  fetchProfile: vi.fn((req, res) => res.status(200).json({ profile: {} })),
  updateProfile: vi.fn((req, res) => res.status(200).json({ profile: {} })),
  uploadEmployeePhoto: vi.fn((req, res) => res.status(200).json({ url: 'photo-url' })),
  searchInventory: vi.fn((req, res) => res.status(200).json({ inventory: [] }))
}));

vi.mock('../../../controllers/consultation.controller.js', () => ({
  bookConsultation: vi.fn((req, res) => res.status(201).json({ consultation: {} })),
  rescheduleConsultation: vi.fn((req, res) => res.status(200).json({ consultation: {} })),
  fetchConsultationById: vi.fn((req, res) => res.status(200).json({ consultation: {} })),
  fetchBillByConsultationId: vi.fn((req, res) => res.status(200).json({ bill: {} })),
  fetchPrescriptionByConsultationId: vi.fn((req, res) => res.status(200).json({ prescription: {} })),
  fetchDiagnosisByConsultationId: vi.fn((req, res) => res.status(200).json({ diagnosis: {} })),
  updateConsultation: vi.fn((req, res) => res.status(200).json({ consultation: {} }))
}));

vi.mock('../../../controllers/doctor.controller.js', () => ({
  fetchAppointments: vi.fn((req, res) => res.status(200).json({ appointments: [] })),
  updateAppointments: vi.fn((req, res) => res.status(200).json({ appointments: [] })),
  fetchPatientConsultations: vi.fn((req, res) => res.status(200).json({ consultations: [] })),
  fetchPatientProgress: vi.fn((req, res) => res.status(200).json({ progress: [] })),
  addDiagnosis: vi.fn((req, res) => res.status(201).json({ diagnosis: {} })),
  addRemarks: vi.fn((req, res) => res.status(201).json({ remark: {} })),
  addPrescription: vi.fn((req, res) => res.status(201).json({ prescription: {} })),
  updateAllDiagnosis: vi.fn((req, res) => res.status(200).json({ diagnosis: [] })),
  updateDiagnosisById: vi.fn((req, res) => res.status(200).json({ diagnosis: {} })),
  updateRemark: vi.fn((req, res) => res.status(200).json({ remark: {} })),
  updateAllPrescription: vi.fn((req, res) => res.status(200).json({ prescription: [] })),
  updatePrescriptionById: vi.fn((req, res) => res.status(200).json({ prescription: {} }))
}));

vi.mock('../../../controllers/facility.controller.js', () => ({
  addAmbulance: vi.fn((req, res) => res.status(201).json({ ambulance: {} })),
  getAmbulanceByVehicleNumber: vi.fn((req, res) => res.status(200).json({ ambulance: {} })),
  decommissionAmbulance: vi.fn((req, res) => res.status(200).json({ message: 'Ambulance decommissioned' })),
  getAllAmbulances: vi.fn((req, res) => res.status(200).json({ ambulances: [] }))
}));

vi.mock('../../../controllers/nurse.controller.js', () => ({
  searchPatientInfo: vi.fn((req, res) => res.status(200).json({ patients: [] })),
  addPatientVitals: vi.fn((req, res) => res.status(201).json({ vitals: {} })),
  updatePatientVitals: vi.fn((req, res) => res.status(200).json({ vitals: {} }))
}));

vi.mock('../../../controllers/pathologist.controller.js', () => ({
  searchEquipment: vi.fn((req, res) => res.status(200).json({ equipment: [] })),
  searchPatientInfoAndTest: vi.fn((req, res) => res.status(200).json({ patient: {}, tests: [] })),
  getPatientPendingTests: vi.fn((req, res) => res.status(200).json({ tests: [] })),
  uploadTestResults: vi.fn((req, res) => res.status(201).json({ result: {} })),
  uploadStandaloneReport: vi.fn((req, res) => res.status(201).json({ report: {} }))
}));

vi.mock('../../../controllers/patientController.js', () => ({
  FetchPatientProfile: vi.fn((req, res) => res.status(200).json({ profile: {} })),
  fetchConsultationsByPatientId: vi.fn((req, res) => res.status(200).json({ consultations: [] })),
  getAllDoctors: vi.fn((req, res) => res.status(200).json({ doctors: [] })),
  sendFeedback: vi.fn((req, res) => res.status(201).json({ feedback: {} })),
  rescheduleConsultation: vi.fn((req, res) => res.status(200).json({ consultation: {} })),
  cancelConsultation: vi.fn((req, res) => res.status(200).json({ message: 'Consultation cancelled' })),
  registerPatient: vi.fn((req, res) => res.status(201).json({ patient: {} })),
  getDoctorById: vi.fn((req, res) => res.status(200).json({ doctor: {} })),
  getLatestPatientVital: vi.fn((req, res) => res.status(200).json({ vital: {} })),
  getPatientVitals: vi.fn((req, res) => res.status(200).json({ vitals: [] })),
  getPatientVitalById: vi.fn((req, res) => res.status(200).json({ vital: {} })),
  updatePatientProfile: vi.fn((req, res) => res.status(200).json({ profile: {} })),
  uploadProfilePhoto: vi.fn((req, res) => res.status(200).json({ url: 'photo-url' }))
}));

vi.mock('../../../controllers/pharmacist.controller.js', () => ({
  searchPatientPrescriptions: vi.fn((req, res) => res.status(200).json({ prescriptions: [] }))
}));

vi.mock('../../../controllers/publicDataController.js', () => ({
  downloadZip: vi.fn((req, res) => res.status(200).send('zip-file')),
  getDiagonses: vi.fn((req, res) => res.status(200).json({ diagnoses: [] }))
}));

vi.mock('../../../controllers/receptionistController.js', async (importOriginal) => {
  const actual = await importOriginal()
  return {
  ...actual,
  registerNewPatient: vi.fn((req, res) => res.status(201).json({ patient: {} })),
  getAllBedInfo: vi.fn((req, res) => res.status(200).json({ beds: [] })),
  getAllBeds: vi.fn((req, res) => res.status(200).json({ rooms: [] })),
  assignBed: vi.fn((req, res) => res.status(200).json({ message: 'Bed assigned' })),
  dischargeBed: vi.fn((req, res) => res.status(200).json({ message: 'Bed discharged' })),
  getAllPatients: vi.fn((req, res) => res.status(200).json({ patients: [] })),
  addBill: vi.fn((req, res) => res.status(201).json({ bill: {} })),
  fetchPatientInsurance: vi.fn((req, res) => res.status(200).json({ insurance: {} }))
}});

// Mock middleware
vi.mock('../../../middleware/authMiddleware.js', () => ({
  authenticateUser: vi.fn((req, res, next) => {
    req.user = { id: 'test-user-id', role: 'admin' };
    next();
  })
}));

vi.mock('../../../middleware/multer.js', () => ({
  default: {
    single: vi.fn(() => (req, res, next) => {
      req.file = { 
        filename: 'test-file.jpg', 
        path: '/uploads/test-file.jpg' 
      };
      next();
    })
  }
}));

// Mock models used directly in routes
vi.mock('../../../models/employee.js', () => ({
  default: {
    find: vi.fn().mockResolvedValue([])
  }
}));

vi.mock('../../../models/insurance.js', () => ({
  default: {
    find: vi.fn().mockResolvedValue([]),
    findOne: vi.fn().mockResolvedValue(null)
  }
}));

vi.mock('../../../models/patient.js', () => ({
  default: {
    findById: vi.fn().mockResolvedValue({ 
      insurance_details: [], 
      save: vi.fn().mockResolvedValue({})
    })
  }
}));

// Create test app
let app;

beforeAll(async () => {
  await connectDB();
  
  app = express();
  app.use(express.json());
  
  // Mount all routers
  app.use('/api/admin', adminRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/billing', billingRoutes);
  app.use('/api/common', commonPageRoutes);
  app.use('/api/consultations', consultationRoutes);
  app.use('/api/doctors', doctorRoutes);
  app.use('/api/employees', employeeRoutes);
  app.use('/api/facility', facilityRoutes);
  app.use('/api/gemini', geminiRoutes);
  app.use('/api/insurance', insuranceRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/nurses', nurseRoutes);
  app.use('/api/pathologists', pathologistRoutes);
  app.use('/api/patients', patientRoutes);
  app.use('/api/pharmacists', pharmacyRoutes);
  app.use('/api/public-data', publicRoutes);
  app.use('/api/reception', receptionistRoutes);
});

afterEach(() => {
  vi.clearAllMocks();
});

beforeEach(() => {
  // Reset mocks before each test
});

afterAll(async () => {
  await disconnectDB();
});

// Admin Routes Tests
describe('Admin Routes', () => {
  it('POST /api/admin/generate-payslip should call generatePayslip controller', async () => {
    const res = await request(app)
      .post('/api/admin/generate-payslip')
      .send({ employee_id: '123' });
    
    expect(res.status).toBe(200);
    const adminController = await import('../../../controllers/adminController.js');
    expect(adminController.generatePayslip).toHaveBeenCalled();
  });

  it('GET /api/admin/search-employees should call searchEmployees controller', async () => {
    const res = await request(app)
      .get('/api/admin/search-employees')
      .query({ name: 'John' });
    
    expect(res.status).toBe(200);
    const adminController = await import('../../../controllers/adminController.js');
    expect(adminController.searchEmployees).toHaveBeenCalled();
  });

  it('POST /api/admin/update-inventory should call updateInventory controller', async () => {
    const res = await request(app)
      .post('/api/admin/update-inventory')
      .send({ item_id: '123', quantity: 10 });
    
    expect(res.status).toBe(200);
    const adminController = await import('../../../controllers/adminController.js');
    expect(adminController.updateInventory).toHaveBeenCalled();
  });

  it('POST /api/admin/add-staff should call addStaff controller with file upload', async () => {
    const res = await request(app)
      .post('/api/admin/add-staff')
      .field('name', 'John Doe')
      .field('role', 'doctor')
      .attach('profile_pic', Buffer.from('fake image'), 'test.jpg');
    
    expect(res.status).toBe(201);
    const adminController = await import('../../../controllers/adminController.js');
    expect(adminController.addStaff).toHaveBeenCalled();
  });

  it('POST /api/admin/update-salary should call updateSalary controller', async () => {
    const res = await request(app)
      .post('/api/admin/update-salary')
      .send({ employee_id: '123', salary: 5000 });
    
    expect(res.status).toBe(200);
    const adminController = await import('../../../controllers/adminController.js');
    expect(adminController.updateSalary).toHaveBeenCalled();
  });

  it('POST /api/admin/process-payroll should call processPayroll controller', async () => {
    const res = await request(app)
      .post('/api/admin/process-payroll')
      .send({ month: 'April', year: 2025 });
    
    expect(res.status).toBe(200);
    const adminController = await import('../../../controllers/adminController.js');
    expect(adminController.processPayroll).toHaveBeenCalled();
  });

  it('POST /api/admin/update-order-status should call updateOrderStatus controller', async () => {
    const res = await request(app)
      .post('/api/admin/update-order-status')
      .send({ order_id: '123', status: 'completed' });
    
    expect(res.status).toBe(200);
    const adminController = await import('../../../controllers/adminController.js');
    expect(adminController.updateOrderStatus).toHaveBeenCalled();
  });

  it('GET /api/admin/get-departments should call getUniqueDepartments controller', async () => {
    const res = await request(app)
      .get('/api/admin/get-departments');
    
    expect(res.status).toBe(200);
    const adminController = await import('../../../controllers/adminController.js');
    expect(adminController.getUniqueDepartments).toHaveBeenCalled();
  });
});

// Auth Routes Tests
describe('Auth Routes', () => {
  it('POST /api/auth/forgot-password should call forgotPassword controller', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'test@example.com' });
    
    expect(res.status).toBe(200);
    const authController = await import('../../../controllers/authController.js');
    expect(authController.forgotPassword).toHaveBeenCalled();
  });

  it('POST /api/auth/reset-password/:token should call resetPassword controller', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password/test-token')
      .send({ password: 'newPassword123' });
    
    expect(res.status).toBe(200);
    const authController = await import('../../../controllers/authController.js');
    expect(authController.resetPassword).toHaveBeenCalled();
  });

  it('POST /api/auth/login should call login controller', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    
    expect(res.status).toBe(200);
    const authController = await import('../../../controllers/authController.js');
    expect(authController.login).toHaveBeenCalled();
  });

  it('POST /api/auth/refresh should call refreshToken controller', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'oldtoken' });
    
    expect(res.status).toBe(200);
    const authController = await import('../../../controllers/authController.js');
    expect(authController.refreshToken).toHaveBeenCalled();
  });

  it('POST /api/auth/logout should call logout controller', async () => {
    const res = await request(app)
      .post('/api/auth/logout');
    
    expect(res.status).toBe(200);
    const authController = await import('../../../controllers/authController.js');
    expect(authController.logout).toHaveBeenCalled();
  });
});

// Billing Routes Tests
describe('Billing Routes', () => {
  it('GET /api/billing/patient/:patientId should call getBillsByPatientId controller', async () => {
    const res = await request(app)
      .get('/api/billing/patient/123');
    
    expect(res.status).toBe(200);
    const billController = await import('../../../controllers/billController.js');
    expect(billController.getBillsByPatientId).toHaveBeenCalled();
  });

  it('GET /api/billing/:billId should call getBillDetails controller', async () => {
    const res = await request(app)
      .get('/api/billing/123');
    
    expect(res.status).toBe(200);
    const billController = await import('../../../controllers/billController.js');
    expect(billController.getBillDetails).toHaveBeenCalled();
  });

  it('GET /api/billing/:billId/payments should call getPaymentsByBillId controller', async () => {
    const res = await request(app)
      .get('/api/billing/123/payments');
    
    expect(res.status).toBe(200);
    const billController = await import('../../../controllers/billController.js');
    expect(billController.getPaymentsByBillId).toHaveBeenCalled();
  });

  it('POST /api/billing/:billId/payments should call addPayment controller', async () => {
    const res = await request(app)
      .post('/api/billing/123/payments')
      .send({ amount: 100, payment_method: 'cash' });
    
    expect(res.status).toBe(201);
    const billController = await import('../../../controllers/billController.js');
    expect(billController.addPayment).toHaveBeenCalled();
  });

  it('POST /api/billing/:billId/items should call addBillingItem controller', async () => {
    const res = await request(app)
      .post('/api/billing/123/items')
      .send({ item_type: 'consultation', amount: 500 });
    
    expect(res.status).toBe(201);
    const billController = await import('../../../controllers/billController.js');
    expect(billController.addBillingItem).toHaveBeenCalled();
  });

  it('POST /api/billing/ should call createBill controller', async () => {
    const res = await request(app)
      .post('/api/billing')
      .send({ patient_id: 123, total_amount: 1000 });
    
    expect(res.status).toBe(201);
    const billController = await import('../../../controllers/billController.js');
    expect(billController.createBill).toHaveBeenCalled();
  });
});

// Common Pages Routes Tests
describe('Common Pages Routes', () => {
  it('GET /api/common/findPayroll should call findPayrollById controller', async () => {
    const res = await request(app)
      .get('/api/common/findPayroll')
      .query({ payroll_id: '123' });
    
    expect(res.status).toBe(200);
    const commonPagesController = await import('../../../controllers/commonPagesController.js');
    expect(commonPagesController.findPayrollById).toHaveBeenCalled();
  });

  it('GET /api/common/profile/:userType/:id should call fetchProfile controller', async () => {
    const res = await request(app)
      .get('/api/common/profile/doctor/123');
    
    expect(res.status).toBe(200);
    const commonPagesController = await import('../../../controllers/commonPagesController.js');
    expect(commonPagesController.fetchProfile).toHaveBeenCalled();
  });

  it('PUT /api/common/profile/:userType/:id should call updateProfile controller', async () => {
    const res = await request(app)
      .put('/api/common/profile/doctor/123')
      .send({ name: 'John Doe', email: 'john@example.com' });
    
    expect(res.status).toBe(200);
    const commonPagesController = await import('../../../controllers/commonPagesController.js');
    expect(commonPagesController.updateProfile).toHaveBeenCalled();
  });

  it('GET /api/common/calendar/doctor should call getDoctorCalendar controller', async () => {
    const res = await request(app)
      .get('/api/common/calendar/doctor')
      .query({ doctor_id: '123' });
    
    expect(res.status).toBe(200);
    const commonPagesController = await import('../../../controllers/commonPagesController.js');
    expect(commonPagesController.getDoctorCalendar).toHaveBeenCalled();
  });

  it('GET /api/common/calendar/patient should call getPatientCalendar controller', async () => {
    const res = await request(app)
      .get('/api/common/calendar/patient')
      .query({ patient_id: '123' });
    
    expect(res.status).toBe(200);
    const commonPagesController = await import('../../../controllers/commonPagesController.js');
    expect(commonPagesController.getPatientCalendar).toHaveBeenCalled();
  });

  it('POST /api/common/upload-photo/:employeeId should call uploadEmployeePhoto controller', async () => {
    const res = await request(app)
      .post('/api/common/upload-photo/123')
      .attach('profile_pic', Buffer.from('fake image'), 'test.jpg');
    
    expect(res.status).toBe(200);
    const commonPagesController = await import('../../../controllers/commonPagesController.js');
    expect(commonPagesController.uploadEmployeePhoto).toHaveBeenCalled();
  });
});

// Consultation Routes Tests
describe('Consultation Routes', () => {
  it('POST /api/consultations/book should call bookConsultation controller', async () => {
    const res = await request(app)
      .post('/api/consultations/book')
      .send({ patient_id: 123, doctor_id: 456, date: '2025-05-01' });
    
    expect(res.status).toBe(201);
    const consultationController = await import('../../../controllers/consultation.controller.js');
    expect(consultationController.bookConsultation).toHaveBeenCalled();
  });

  it('PUT /api/consultations/reschedule/:consultationId should call rescheduleConsultation controller', async () => {
    const res = await request(app)
      .put('/api/consultations/reschedule/123')
      .send({ date: '2025-05-15' });
    
    expect(res.status).toBe(200);
    const consultationController = await import('../../../controllers/consultation.controller.js');
    expect(consultationController.rescheduleConsultation).toHaveBeenCalled();
  });

  it('PUT /api/consultations/update/:consultationId should call updateConsultation controller', async () => {
    const res = await request(app)
      .put('/api/consultations/update/123')
      .send({ status: 'completed' });
    
    expect(res.status).toBe(200);
    const consultationController = await import('../../../controllers/consultation.controller.js');
    expect(consultationController.updateConsultation).toHaveBeenCalled();
  });

  it('GET /api/consultations/:consultationId/view should call fetchConsultationById controller', async () => {
    const res = await request(app)
      .get('/api/consultations/123/view');
    
    expect(res.status).toBe(200);
    const consultationController = await import('../../../controllers/consultation.controller.js');
    expect(consultationController.fetchConsultationById).toHaveBeenCalled();
  });
});

// Doctor Routes Tests
describe('Doctor Routes', () => {
  it('GET /api/doctors/appointments should call fetchAppointments controller', async () => {
    const res = await request(app)
      .get('/api/doctors/appointments');
    
    expect(res.status).toBe(200);
    const doctorController = await import('../../../controllers/doctor.controller.js');
    expect(doctorController.fetchAppointments).toHaveBeenCalled();
  });

  it('PUT /api/doctors/appointments should call updateAppointments controller', async () => {
    const res = await request(app)
      .put('/api/doctors/appointments')
      .send({ appointment_id: '123', status: 'completed' });
    
    expect(res.status).toBe(200);
    const doctorController = await import('../../../controllers/doctor.controller.js');
    expect(doctorController.updateAppointments).toHaveBeenCalled();
  });

  it('GET /api/doctors/consultations/:patientId should call fetchPatientConsultations controller', async () => {
    const res = await request(app)
      .get('/api/doctors/consultations/123');
    
    expect(res.status).toBe(200);
    const doctorController = await import('../../../controllers/doctor.controller.js');
    expect(doctorController.fetchPatientConsultations).toHaveBeenCalled();
  });

  it('GET /api/doctors/progress/:patientId should call fetchPatientProgress controller', async () => {
    const res = await request(app)
      .get('/api/doctors/progress/123');
    
    expect(res.status).toBe(200);
    const doctorController = await import('../../../controllers/doctor.controller.js');
    expect(doctorController.fetchPatientProgress).toHaveBeenCalled();
  });

  it('POST /api/doctors/updateConsultations/:consultationId/adddiagnosis should call addDiagnosis controller', async () => {
    const res = await request(app)
      .post('/api/doctors/updateConsultations/123/adddiagnosis')
      .send({ diagnosis: ['Fever', 'Cold'] });
    
    expect(res.status).toBe(201);
    const doctorController = await import('../../../controllers/doctor.controller.js');
    expect(doctorController.addDiagnosis).toHaveBeenCalled();
  });

  it('PUT /api/doctors/updateConsultations/:consultationId/updatediagnosis/:diagnosisId should call updateDiagnosisById controller', async () => {
    const res = await request(app)
      .put('/api/doctors/updateConsultations/123/updatediagnosis/456')
      .send({ diagnosis: 'Updated diagnosis' });
    
    expect(res.status).toBe(200);
    const doctorController = await import('../../../controllers/doctor.controller.js');
    expect(doctorController.updateDiagnosisById).toHaveBeenCalled();
  });
});

// Employee Routes Tests
describe('Employee Routes', () => {
  it('GET /api/employees should fetch all employees', async () => {
    const res = await request(app)
      .get('/api/employees');
    
    expect(res.status).toBe(200);
  });
});

// Facility Routes Tests
describe('Facility Routes', () => {
  it('POST /api/facility/ambulance should call addAmbulance controller', async () => {
    const res = await request(app)
      .post('/api/facility/ambulance')
      .send({ vehicle_number: 'AMB001', model: 'Toyota' });
    
    expect(res.status).toBe(201);
    const facilityController = await import('../../../controllers/facility.controller.js');
    expect(facilityController.addAmbulance).toHaveBeenCalled();
  });

  it('GET /api/facility/ambulance/:vehicle_number should call getAmbulanceByVehicleNumber controller', async () => {
    const res = await request(app)
      .get('/api/facility/ambulance/AMB001');
    
    expect(res.status).toBe(200);
    const facilityController = await import('../../../controllers/facility.controller.js');
    expect(facilityController.getAmbulanceByVehicleNumber).toHaveBeenCalled();
  });

  it('DELETE /api/facility/ambulance/decommission should call decommissionAmbulance controller', async () => {
    const res = await request(app)
      .delete('/api/facility/ambulance/decommission')
      .send({ vehicle_number: 'AMB001' });
    
    expect(res.status).toBe(200);
    const facilityController = await import('../../../controllers/facility.controller.js');
    expect(facilityController.decommissionAmbulance).toHaveBeenCalled();
  });

  it('GET /api/facility/ambulances should call getAllAmbulances controller', async () => {
    const res = await request(app)
      .get('/api/facility/ambulances');
    
    expect(res.status).toBe(200);
    const facilityController = await import('../../../controllers/facility.controller.js');
    expect(facilityController.getAllAmbulances).toHaveBeenCalled();
  });
});

// Inventory Routes Tests
describe('Inventory Routes', () => {
  it('GET /api/inventory/search should call searchInventory controller', async () => {
    const res = await request(app)
      .get('/api/inventory/search')
      .query({ query: 'medicine' });
    
    expect(res.status).toBe(200);
    const commonPagesController = await import('../../../controllers/commonPagesController.js');
    expect(commonPagesController.searchInventory).toHaveBeenCalled();
  });
});

// Nurse Routes Tests
describe('Nurse Routes', () => {
  it('GET /api/nurses/searchQuery should call searchPatientInfo controller', async () => {
    const res = await request(app)
      .get('/api/nurses/searchQuery')
      .query({ query: 'John' });
    
    expect(res.status).toBe(200);
    const nurseController = await import('../../../controllers/nurse.controller.js');
    expect(nurseController.searchPatientInfo).toHaveBeenCalled();
  });

  it('POST /api/nurses/patients/:patientId/vitals should call addPatientVitals controller', async () => {
    const res = await request(app)
      .post('/api/nurses/patients/123/vitals')
      .send({ bloodPressure: 120, bodyTemp: 98.6, pulseRate: 72, breathingRate: 16 });
    
    expect(res.status).toBe(201);
    const nurseController = await import('../../../controllers/nurse.controller.js');
    expect(nurseController.addPatientVitals).toHaveBeenCalled();
  });

  it('PUT /api/nurses/patients/:patientId/vitals/:vitalId should call updatePatientVitals controller', async () => {
    const res = await request(app)
      .put('/api/nurses/patients/123/vitals/456')
      .send({ bloodPressure: 118, bodyTemp: 98.2, pulseRate: 70, breathingRate: 15 });
    
    expect(res.status).toBe(200);
    const nurseController = await import('../../../controllers/nurse.controller.js');
    expect(nurseController.updatePatientVitals).toHaveBeenCalled();
  });
});

// Pathologist Routes Tests
describe('Pathologist Routes', () => {
  it('GET /api/pathologists/searchBy should call searchEquipment controller', async () => {
    const res = await request(app)
      .get('/api/pathologists/searchBy')
      .query({ equipment: 'microscope' });
    
    expect(res.status).toBe(200);
    const pathologistController = await import('../../../controllers/pathologist.controller.js');
    expect(pathologistController.searchEquipment).toHaveBeenCalled();
  });

  it('GET /api/pathologists/searchById should call searchPatientInfoAndTest controller', async () => {
    const res = await request(app)
      .get('/api/pathologists/searchById')
      .query({ patientId: '123' });
    
    expect(res.status).toBe(200);
    const pathologistController = await import('../../../controllers/pathologist.controller.js');
    expect(pathologistController.searchPatientInfoAndTest).toHaveBeenCalled();
  });

  it('GET /api/pathologists/pendingTests/:patientId should call getPatientPendingTests controller', async () => {
    const res = await request(app)
      .get('/api/pathologists/pendingTests/123');
    
    expect(res.status).toBe(200);
    const pathologistController = await import('../../../controllers/pathologist.controller.js');
    expect(pathologistController.getPatientPendingTests).toHaveBeenCalled();
  });

  it('POST /api/pathologists/uploadTestResults should call uploadTestResults controller', async () => {
    const res = await request(app)
      .post('/api/pathologists/uploadTestResults')
      .field('patientId', '123')
      .field('testId', '456')
      .attach('reportFile', Buffer.from('fake report'), 'test.pdf');
    
    expect(res.status).toBe(201);
    const pathologistController = await import('../../../controllers/pathologist.controller.js');
    expect(pathologistController.uploadTestResults).toHaveBeenCalled();
  });
});

// Patient Routes Tests
describe('Patient Routes', () => {
  it('GET /api/patients/doctors should call getAllDoctors controller', async () => {
    const res = await request(app)
      .get('/api/patients/doctors');
    
    expect(res.status).toBe(200);
    const patientController = await import('../../../controllers/patientController.js');
    expect(patientController.getAllDoctors).toHaveBeenCalled();
  });

  it('GET /api/patients/profile/:patientId should call FetchPatientProfile controller', async () => {
    const res = await request(app)
      .get('/api/patients/profile/123');
    
    expect(res.status).toBe(200);
    const patientController = await import('../../../controllers/patientController.js');
    expect(patientController.FetchPatientProfile).toHaveBeenCalled();
  });

  it('GET /api/patients/:patientId/consultations should call fetchConsultationsByPatientId controller', async () => {
    const res = await request(app)
      .get('/api/patients/123/consultations');
    
    expect(res.status).toBe(200);
    const patientController = await import('../../../controllers/patientController.js');
    expect(patientController.fetchConsultationsByPatientId).toHaveBeenCalled();
  });

  it('POST /api/patients/:patientId/consultations/:consultationId/feedback should call sendFeedback controller', async () => {
    const res = await request(app)
      .post('/api/patients/123/consultations/456/feedback')
      .send({ rating: 5, comment: 'Excellent service' });
    
    expect(res.status).toBe(201);
    const patientController = await import('../../../controllers/patientController.js');
    expect(patientController.sendFeedback).toHaveBeenCalled();
  });

  it('PUT /api/patients/:consultationId/reschedule should call rescheduleConsultation controller', async () => {
    const res = await request(app)
      .put('/api/patients/123/reschedule')
      .send({ newDate: '2025-05-20' });
    
    expect(res.status).toBe(200);
    const patientController = await import('../../../controllers/patientController.js');
    expect(patientController.rescheduleConsultation).toHaveBeenCalled();
  });
});

// Pharmacy Routes Tests
describe('Pharmacy Routes', () => {
  it('GET /api/pharmacists/prescriptions should call searchPatientPrescriptions controller', async () => {
    const res = await request(app)
      .get('/api/pharmacists/prescriptions')
      .query({ patientId: '123' });
    
    expect(res.status).toBe(200);
    const pharmacistController = await import('../../../controllers/pharmacist.controller.js');
    expect(pharmacistController.searchPatientPrescriptions).toHaveBeenCalled();
  });
});

// Public Routes Tests
describe('Public Routes', () => {
  it('GET /api/public-data/download should call downloadZip controller', async () => {
    const res = await request(app)
      .get('/api/public-data/download');
    
    expect(res.status).toBe(200);
    const publicDataController = await import('../../../controllers/publicDataController.js');
    expect(publicDataController.downloadZip).toHaveBeenCalled();
  });

  it('GET /api/public-data/get-diagonses should call getDiagonses controller', async () => {
    const res = await request(app)
      .get('/api/public-data/get-diagonses');
    
    expect(res.status).toBe(200);
    const publicDataController = await import('../../../controllers/publicDataController.js');
    expect(publicDataController.getDiagonses).toHaveBeenCalled();
  });
});

// Receptionist Routes Tests
describe('Receptionist Routes', () => {
  it('POST /api/reception/register-patient should call registerNewPatient controller', async () => {
    const res = await request(app)
      .post('/api/reception/register-patient')
      .send({ name: 'John Doe', age: 30, gender: 'male' });
    
    expect(res.status).toBe(201);
    const receptionistController = await import('../../../controllers/receptionistController.js');
    expect(receptionistController.registerNewPatient).toHaveBeenCalled();
  });

  it('GET /api/reception/beds should call getAllBedInfo controller', async () => {
    const res = await request(app)
      .get('/api/reception/beds');
    
    expect(res.status).toBe(200);
    const receptionistController = await import('../../../controllers/receptionistController.js');
    expect(receptionistController.getAllBedInfo).toHaveBeenCalled();
  });

  it('POST /api/reception/add-bill should call addBill controller', async () => {
    const res = await request(app)
      .post('/api/reception/add-bill')
      .send({ patient_id: 123, total_amount: 1000 });
    
    expect(res.status).toBe(201);
    const receptionistController = await import('../../../controllers/receptionistController.js');
    expect(receptionistController.addBill).toHaveBeenCalled();
  });

  it('POST /api/reception/assign-bed should call assignBed controller', async () => {
    const res = await request(app)
      .post('/api/reception/assign-bed')
      .send({ patient_id: 123, bed_id: 456 });
    
    expect(res.status).toBe(200);
    const receptionistController = await import('../../../controllers/receptionistController.js');
    expect(receptionistController.assignBed).toHaveBeenCalled();
  });

  it('POST /api/reception/discharge-bed should call dischargeBed controller', async () => {
    const res = await request(app)
      .post('/api/reception/discharge-bed')
      .send({ patient_id: 123, bed_id: 456 });
    
    expect(res.status).toBe(200);
    const receptionistController = await import('../../../controllers/receptionistController.js');
    expect(receptionistController.dischargeBed).toHaveBeenCalled();
  });

  it('GET /api/reception/patients should call getAllPatients controller', async () => {
    const res = await request(app)
      .get('/api/reception/patients');
    
    expect(res.status).toBe(200);
    const receptionistController = await import('../../../controllers/receptionistController.js');
    expect(receptionistController.getAllPatients).toHaveBeenCalled();
  });
});
