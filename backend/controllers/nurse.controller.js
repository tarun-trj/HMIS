import Patient from '../models/patient.js';

// function to search for the patient info
export const searchPatientInfo = async (req, res) => {
    try {
        const { searchQuery } = req.query;

        if (!searchQuery) {
            return res.status(400).json({ message: "Search query is required." });
        }

        let query = {};

        if (/^\d{10}$/.test(searchQuery)) {  
            query.phone_number = searchQuery;
        } 
        else if (/^\d+$/.test(searchQuery)) {
            query._id = parseInt(searchQuery);  
        } 
        else {
            query.name = { $regex: searchQuery, $options: 'i' };
        }

        const patients = await Patient.find(query).select(
            "_id name phone_number vitals patient_info.roomNo"
        );

        const result = patients.map(patient => {
            let status = "Admitted";
            if (!patient.patient_info.roomNo) status = "Discharged";

            if (patient.vitals.length > 0) {
                const latestVitals = patient.vitals[patient.vitals.length - 1];
                if (latestVitals.bloodPressure > 180 || latestVitals.bodyTemp > 104) {
                    status = "Critical";
                }
            }
            return {
                _id: patient._id,
                name: patient.name,
                phone_number: patient.phone_number,
                status,
                roomNo: patient.patient_info.roomNo || "N/A"
            };
        });

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Function to add new vitals for a patient
export const addPatientVitals = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { bloodPressure, bodyTemp, pulseRate, breathingRate } = req.body;
    
    // Find the patient
    const patient = await Patient.findById(parseInt(patientId));
    
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    
    // Create new vitals object
    const newVitals = {
      date: new Date().toLocaleDateString('en-IN', { 
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: new Date().toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'Asia/Kolkata' 
      }),
      bloodPressure,
      bodyTemp,
      pulseRate,
      breathingRate
    };
    
    // Add to patient's vitals array
    patient.vitals.push(newVitals);
    await patient.save();
    
    res.status(201).json({
      success: true,
      message: "Vitals recorded successfully",
      data: newVitals
    });
  } catch (error) {
    console.error('Error adding patient vitals:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while adding vitals',
      error: error.message
    });
  }
};

// Function to update existing vitals for a patient
export const updatePatientVitals = async (req, res) => {
  try {
    const { patientId, vitalId } = req.params;
    const { bloodPressure, bodyTemp, pulseRate, breathingRate } = req.body;
    
    // Find the patient
    const patient = await Patient.findById(parseInt(patientId));
    
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    
    // Find the specific vital record
    const vitalRecord = patient.vitals.id(vitalId);
    
    if (!vitalRecord) {
      return res.status(404).json({ message: "Vital record not found" });
    }
    
    // Update fields
    if (bloodPressure) vitalRecord.bloodPressure = bloodPressure;
    if (bodyTemp) vitalRecord.bodyTemp = bodyTemp;
    if (pulseRate) vitalRecord.pulseRate = pulseRate;
    if (breathingRate) vitalRecord.breathingRate = breathingRate;
    
    // Update time and date to current values
    vitalRecord.date = new Date().toLocaleDateString('en-IN', { 
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    vitalRecord.time = new Date().toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'Asia/Kolkata' 
    });
    
    // Save the patient document
    await patient.save();
    
    res.status(200).json({
      success: true,
      message: "Vitals updated successfully",
      data: vitalRecord
    });
  } catch (error) {
    console.error('Error updating patient vitals:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while updating vitals',
      error: error.message
    });
  }
};