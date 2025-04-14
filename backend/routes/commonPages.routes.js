import express from "express";
import {findPayrollById, getPatientCalendar,getDoctorCalendar, fetchProfile, updateProfile} from "../controllers/commonPagesController.js";

const router = express.Router();

router.get("/findPayroll",findPayrollById );

router.get('/profile/:userType/:id', fetchProfile);
router.put('/profile/:userType/:id', updateProfile);

router.get('/calendar/doctor', getDoctorCalendar);
router.get('/calendar/patient', getPatientCalendar);

export default router;
