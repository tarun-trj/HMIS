import mongoose from 'mongoose';
import { Consultation, Prescription } from '../models/consultation.js';
import Diagnosis from '../models/diagnosis.js'; 
import Patient from '../models/patient.js';

// Utility to format a 30-min time slot
const formatTimeSlot = (start) => {
  const startTime = new Date(start);
  const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);
  const format = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return `${format(startTime)} - ${format(endTime)}`;
};

// GET /doctor/appointments
export const fetchAppointments = async (req, res) => {
  try {
    const doctorId = req.user?.doctor_id;
    if (!doctorId) {
      return res.status(400).json({ error: "Doctor ID missing in token" });
    }

    const consultations = await Consultation.find({
      doctor_id: doctorId,
      status: { $in: ['scheduled', 'ongoing', 'completed'] }
    }).populate('patient_id', 'name').sort({ booked_date_time: 1 });

    if (!consultations.length) {
      return res.status(404).json({ message: "No appointments found" });
    }

    const appointments = consultations.map((c) => ({
      id: c._id,
      patientName: c.patient_id?.name || 'Unknown',
      timeSlot: formatTimeSlot(c.booked_date_time),
      isDone: c.status === 'completed'
    }));

    res.json(appointments);
  } catch (err) {
    console.error("Error in fetchAppointments:", err);
    res.status(500).json({ error: "Server error while fetching appointments" });
  }
};

// PUT /doctor/appointments
export const updateAppointments = async (req, res) => {
  try {
    const doctorId = req.user?.doctor_id;
    if (!doctorId) {
      return res.status(400).json({ error: "Doctor ID missing in token" });
    }

    const { id, isDone } = req.body;

    if (!id || typeof isDone !== 'boolean') {
      return res.status(400).json({ error: "Missing or invalid 'id' or 'isDone' field" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid consultation ID format" });
    }

    const consultation = await Consultation.findOne({ _id: id, doctor_id: doctorId });
    if (!consultation) {
      return res.status(404).json({ error: "Consultation not found for this doctor" });
    }

    consultation.status = isDone ? "completed" : "ongoing";
    await consultation.save();

    res.json({ message: "Appointment status updated successfully" });
  } catch (err) {
    console.error("Error in updateAppointments:", err);
    res.status(500).json({ error: "Server error while updating appointment" });
  }
};

export const fetchPatientConsultations = async (req, res) => {
  try {
    const doctor_id = req.user?.doctor_id;
    const { patientId } = req.params;
    
    if (!doctor_id) {
      return res.status(400).json({ error: "Doctor ID missing in token" });
    }
    
    if (!patientId) {
      return res.status(400).json({
        error: 'Patient ID is required'
      });
    }
    
    const query = { 
      patient_id: parseInt(patientId) 
    };
    
    const consultations = await Consultation.find(query)
      .populate('doctor_id', 'name specialization')
      .populate('prescription')
      .sort({ booked_date_time: -1 });
    
    if (!consultations.length) {
      return res.status(404).json({ message: "No consultations found for this patient" });
    }
    
    res.json(consultations);
  } catch (error) {
    console.error('Error fetching patient consultations:', error);
    res.status(500).json({
      error: 'Server error while fetching consultations',
      message: error.message
    });
  }
};

export const fetchPatientProgress = async (req, res) => {
  try {
    const doctor_id = req.user?.doctor_id;
    const { patientId } = req.params;
    
    if (!doctor_id) {
      return res.status(400).json({ error: "Doctor ID missing in token" });
    }
    
    if (!patientId) {
      return res.status(400).json({
        error: 'Patient ID is required'
      });
    }

    // First verify this doctor has access to this patient (has consultations)
    const hasConsultation = await Consultation.findOne({
      doctor_id: doctor_id,
      patient_id: parseInt(patientId)
    });

    if (!hasConsultation) {
      return res.status(403).json({ 
        error: "Unauthorized: No consultations found for this patient under your care" 
      });
    }
    
    // Fetch the patient with vitals
    const patient = await Patient.findById(parseInt(patientId))
      .select('name vitals');
    
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }
    
    // Sort vitals by date (most recent first)
    const sortedVitals = patient.vitals.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
    
    res.status(200).json({
      success: true,
      patientName: patient.name,
      data: sortedVitals
    });
  } catch (error) {
    console.error('Error fetching patient progress:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching patient progress',
      error: error.message
    });
  }
};

export const addDiagnosis = async (req, res) => {
  try {
    const doctor_id = req.user?.doctor_id;
    const { consultationId } = req.params;
    const { diagnosis } = req.body; // Single diagnosis string
    
    if (!doctor_id) {
      return res.status(400).json({ error: "Doctor ID missing in token" });
    }
    
    if (!consultationId || !diagnosis || typeof diagnosis !== 'string') {
      return res.status(400).json({ error: "Consultation ID and diagnosis string are required" });
    }
    
    // Find the consultation and verify doctor has permission
    const consultation = await Consultation.findOne({
      _id: consultationId,
      doctor_id: doctor_id
    });
    
    if (!consultation) {
      return res.status(404).json({ error: "Consultation not found or access denied" });
    }
    
    // Create new diagnosis object
    const newDiagnosis = new Diagnosis({ name: diagnosis });
    const savedDiagnosis = await newDiagnosis.save();
    
    // Update consultation with new diagnosis ID
    const updatedConsultation = await Consultation.findByIdAndUpdate(
      consultationId,
      { $addToSet: { diagnosis: savedDiagnosis._id } },
      { new: true }
    ).populate('diagnosis');
    
    res.status(200).json({
      success: true,
      data: updatedConsultation
    });
  } catch (error) {
    console.error('Error adding diagnosis:', error);
    res.status(500).json({
      error: 'Server error while adding diagnosis',
      message: error.message
    });
  }
};

export const addRemarks = async (req, res) => {
  try {
    const doctor_id = req.user?.doctor_id;
    const { consultationId } = req.params;
    const { remark } = req.body;
    
    if (!doctor_id) {
      return res.status(400).json({ error: "Doctor ID missing in token" });
    }
    
    if (!consultationId || !remark) {
      return res.status(400).json({ error: "Consultation ID and remark are required" });
    }
    
    // Find the consultation and verify doctor has permission
    const consultation = await Consultation.findOne({
      _id: consultationId,
      doctor_id: doctor_id
    });
    
    if (!consultation) {
      return res.status(404).json({ error: "Consultation not found or access denied" });
    }
    
    // Update consultation with new remark
    const updatedConsultation = await Consultation.findByIdAndUpdate(
      consultationId,
      { remark: remark },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      data: updatedConsultation
    });
  } catch (error) {
    console.error('Error adding remark:', error);
    res.status(500).json({
      error: 'Server error while adding remark',
      message: error.message
    });
  }
};

export const addPrescription = async (req, res) => {
  try {
    const doctor_id = req.user?.doctor_id;
    const { consultationId } = req.params;
    const { prescriptionData } = req.body;
    
    if (!doctor_id) {
      return res.status(400).json({ error: "Doctor ID missing in token" });
    }
    
    if (!consultationId || !prescriptionData || !prescriptionData.entries) {
      return res.status(400).json({ error: "Consultation ID and prescription data are required" });
    }
    
    // Find the consultation and verify doctor has permission
    const consultation = await Consultation.findOne({
      _id: consultationId,
      doctor_id: doctor_id
    });
    
    if (!consultation) {
      return res.status(404).json({ error: "Consultation not found or access denied" });
    }
    
    // Create a new prescription
    const newPrescription = new Prescription({
      prescriptionDate: new Date(),
      status: "pending",
      entries: prescriptionData.entries
    });
    
    const savedPrescription = await newPrescription.save();
    
    // Update consultation with new prescription
    const updatedConsultation = await Consultation.findByIdAndUpdate(
      consultationId,
      { $push: { prescription: savedPrescription._id } },
      { new: true }
    ).populate('prescription');
    
    res.status(200).json({
      success: true,
      data: updatedConsultation
    });
  } catch (error) {
    console.error('Error adding prescription:', error);
    res.status(500).json({
      error: 'Server error while adding prescription',
      message: error.message
    });
  }
};