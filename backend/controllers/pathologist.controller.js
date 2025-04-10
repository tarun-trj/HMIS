import Equipment from '../models/equipment.js';
import { Consultation } from '../models/consultation.js';
import Patient from '../models/patient.js';

export const searchEquipment = async(req, res) => {
    try {
        const { searchBy } = req.query;

        if (!searchBy) {
            return res.status(400).json({ message: "Search query is required." });
        }
        
        let searchFilter = {};

        if (!isNaN(searchBy)) {
            searchFilter = { _id: Number(searchBy) };
        } else {
            searchFilter = {
                equipment_name: { $regex: searchBy, $options: 'i' }
            };
        }

        const equipmentDetails = await Equipment.find(searchFilter).select(
            'equipment_name last_service_date quantity'
        );

        res.status(200).json(equipmentDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });   
    }
}

export const searchPatientInfoAndTest = async (req, res) => {
    try {
        const { searchById } = req.query;
        
        if (!searchById) {
            return res.status(400).json({ message: "Search query is required." });
        }

        // if the given id is not a valid numeric id
        if (isNaN(searchById)) {
            return res.status(400).json({ message: "Invalid patient ID format." });
        }

        const patientDetails = await Patient.findOne({ _id : Number(searchById) }).select(
            'name patient_info.age patient_info.bloodGrp phone_number'
        );

        if (!patientDetails) {
            return res.status(404).json({ message: "Patient not found." });
        }

        // we pick the most recent consultations for the patient
        const consultation = await Consultation.findOne({ patient_id: Number(searchById) })
            .sort({ actual_start_datetime: -1 });

        if (!consultation) {
            return res.status(404).json({ message: "No consultations found for this patient." });
        }

        // getting the test that was recommended in the consultation and it's status
        const tests = consultation.reports.map(report => ({
            title: report.title,
            status: report.status
        }));

        res.status(200).json({
            patient: patientDetails,
            tests
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


// Additional functions for pathologist.controller.js

// Get available tests for a specific patient and upload them
export const getPatientPendingTests = async (req, res) => {
    try {
        const { patientId } = req.params;
        
        if (!patientId || isNaN(patientId)) {
            return res.status(400).json({ message: "Valid patient ID is required." });
        }

        // First check if patient exists
        const patient = await Patient.findOne({ _id: Number(patientId) });
        
        if (!patient) {
            return res.status(404).json({ message: "Patient not found." });
        }

        // Find the most recent consultation for this patient
        const consultation = await Consultation.findOne({ patient_id: Number(patientId) })
            .sort({ actual_start_datetime: -1 });
            
        if (!consultation) {
            return res.status(404).json({ message: "No consultations found for this patient." });
        }

        // Filter for only pending tests
        const pendingTests = consultation.reports
            .filter(report => report.status === "pending")
            .map(report => ({
                _id: report._id,
                title: report.title,
                description: report.description
            }));
            
        if (pendingTests.length === 0) {
            return res.status(404).json({ message: "No pending tests found for this patient." });
        }

        res.status(200).json({
            patientName: patient.name,
            patientId: patient._id,
            pendingTests
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Upload test results for a specific test
export const uploadTestResults = async (req, res) => {
    try {
        const { patientId, testId, consultationId } = req.body;
        
        // Basic validation
        if (!patientId || !testId || !consultationId) {
            return res.status(400).json({ 
                message: "Patient ID, test ID, and consultation ID are required." 
            });
        }
        
        if (!req.file) {
            return res.status(400).json({ message: "Test result file is required." });
        }

        // Find the consultation
        const consultation = await Consultation.findById(consultationId);
        
        if (!consultation) {
            return res.status(404).json({ message: "Consultation not found." });
        }
        
        // Find the specific report within the consultation
        const reportIndex = consultation.reports.findIndex(
            report => report._id.toString() === testId
        );
        
        if (reportIndex === -1) {
            return res.status(404).json({ message: "Test not found in this consultation." });
        }
        
        // Update the report status and add the report text
        consultation.reports[reportIndex].status = "completed";
        consultation.reports[reportIndex].reportText = req.file.path; // Store file path
        consultation.reports[reportIndex].updatedAt = new Date();
        
        await consultation.save();
        
        res.status(200).json({ 
            message: "Test results uploaded successfully.",
            updatedReport: consultation.reports[reportIndex]
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
