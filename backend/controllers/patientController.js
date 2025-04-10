import Patient from '../models/patient.js';
import { Doctor } from '../models/staff.js';
import Employee from '../models/employee.js'; 
import Diagnosis from '../models/diagnosis.js';
import Bill from '../models/bill.js';
import { Consultation, Prescription, Feedback } from '../models/consultation.js';


// @desc Get full patient profile
export const FetchPatientProfile = async (req, res) => {
  try {
    const { patientId } = req.params;
    let patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Populate insurance only if not empty
    if (patient.insurance_details && patient.insurance_details.length > 0) {
      patient = await patient.populate('insurance_details');
    }

    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


export const fetchConsultations = async (req, res) => {
  try {
    const { patientId } = req.params;

    let consultations = await Consultation.find({ patient_id: patientId }).sort({ booked_date_time: -1 });

    if (!consultations.length) {
      return res.status(404).json({ message: 'No consultations found' });
    }

    // Populate fields conditionally if not empty
    consultations = await Consultation.populate(consultations, [
      { path: 'doctor_id', select: 'name specialization' },
      { path: 'created_by', select: 'name role' },
      { path: 'diagnosis', strictPopulate: false },
      { path: 'prescription', strictPopulate: false },
      { path: 'bill_id', strictPopulate: false }
    ]);

    res.status(200).json(consultations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// @route   GET /api/doctors
const getAllDoctors = async (req, res) => {
  try {
    // Find all documents in the Doctor collection
    // Populate the 'employee_id' field to get associated employee details
    const doctors = await Doctor.find({}).populate({
      path: 'employee_id',
      model: Employee, // Specify the Employee model
      select: 'name email phone_number address' 
    });

    if (doctors.length === 0) {
      return res.status(404).json({ message: 'No doctors found' });
    }

    res.status(200).json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Server error fetching doctors' });
  }
};

export {
  getAllDoctors,
};

