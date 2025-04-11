import { Consultation } from '../models/consultation.js';
import Patient from '../models/patient.js';

// Book a new consultation
export const bookConsultation = async (req, res) => {
  try {
    const {
      patient_id,
      doctor_id,
      booked_date_time,
      reason,
      created_by,
      appointment_type
    } = req.body;

    // Check if patient exists
    const patient = await Patient.findById(patient_id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    // Create new consultation
    const newConsultation = new Consultation({
      patient_id,
      doctor_id,
      booked_date_time,
      reason,
      created_by,
      appointment_type,
      status: 'scheduled'
    });

    await newConsultation.save();

    res.status(201).json({
      message: 'Consultation booked successfully',
      consultation: newConsultation
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reschedule an existing consultation
export const rescheduleConsultation = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { new_booked_date_time } = req.body;

    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    consultation.booked_date_time = new Date(new_booked_date_time);
    consultation.status = 'scheduled';

    await consultation.save();

    res.json({
      message: 'Consultation rescheduled successfully',
      consultation
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/**
 * @desc    Get consultation by ID
 * @route   GET /api/patient/consultations/:id
 * @access  Protected (Patient)
 */
export const getConsultationById = async (req, res) => {
  try {
    const { id } = req.params;

    const consultation = await Consultation.findById(id)
      .populate("doctor_id", "name")
      .populate("diagnosis")
      .populate("prescription")
      .populate("reports");

    if (!consultation) {
      const dummy = {
        id: Number(id),
        date: "2025-04-07",
        doctor: "Dr. Williams",
        location: "Room 305",
        details: "Diagnosis",
        diagnosis: [],
        prescription: [],
        reports: [],
      };
      return res.status(200).json({ consultation: dummy, dummy: true });
    }

    const formatted = {
      id: consultation._id,
      date: consultation.booked_date_time.toISOString().split("T")[0],
      doctor: consultation.doctor_id.name,
      location: "Room 101", // Optional enhancement
      details: consultation.reason,
      diagnosis: consultation.diagnosis,
      prescription: consultation.prescription,
      reports: consultation.reports,
    };

    return res.status(200).json({ consultation: formatted });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};