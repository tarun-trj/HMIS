import express from "express";
import {findPayrollById, getPatientCalendar,getDoctorCalendar, fetchProfile, updateProfile,uploadEmployeePhoto} from "../controllers/commonPagesController.js";
import upload from "../middleware/multer.js";
const router = express.Router();

router.get("/findPayroll",findPayrollById );

router.get('/profile/:userType/:id', fetchProfile);
router.put('/profile/:userType/:id', updateProfile);

router.get('/calendar/doctor', getDoctorCalendar);
router.get('/calendar/patient', getPatientCalendar);
router.post("/upload-photo/:employeeId", upload.single("profile_pic"), uploadEmployeePhoto);

export default router;
