import Patient from '../models/patient.js';
import bcrypt from 'bcrypt';
// const {BedLog} = require('../models/logs.js'); // Ensure the correct path to the BedLog model
import  BedLog  from '../models/logs.js'; // Ensure the correct path to the BedLog model    
import Bill from '../models/bill.js'; // Ensure the correct path to the Bill model
// import mongoose from 'mongoose';
import crypto from 'crypto';
import { sendPasswordEmail } from "../config/sendMail.js"; // adjust the path
import Insurances from '../models/insurance.js'; // Ensure the correct path to the Insurances model
// Controller for new patient registration
export const registerNewPatient = async (req, res) => {
    try {
        const {
            patientName,
            aadharId,
            dob,
            gender,
            bloodGroup,
            email,
            height,
            weight,
            address,
            emergencyNumber,
            mobile,
        } = req.body;

        // // Validate required fields
        // if (height || !aadharId || !dob || !gender || !email || !mobile || !password) {
        //     return res.status(400).json({ message: 'All gay fields must be filled.' });
        // }

        // const requiredFields = {
        //     patientName,
        //     aadharId,
        //     dob,
        //     gender,
        //     email,
        //     mobile
        // };

        // const emptyFields = Object.keys(requiredFields).filter(field => !requiredFields[field]);

        // if (emptyFields.length > 0) {
        //     return res.status(400).json({ 
        //         message: `The following fields are missing: ${emptyFields.join(', ')}` 
        //     });
        // }

        // Check if email or Aadhar ID already exists
        const existingPatient = await Patient.findOne({ $or: [{ email }, { aadhar_number: aadharId }] });
        if (existingPatient) {
            return res.status(400).json({ message: 'Email or Aadhar ID already exists.' });
        }

        // Hash the password
        let PlainPassword=crypto.randomBytes(8).toString('base64').slice(0, 8);
        const hashedPassword = await bcrypt.hash(PlainPassword, 10);

        // Create a new patient instance
        const newPatient = new Patient({
            patient_username: email,
            password: hashedPassword,
            name: patientName,
            phone_number: mobile,
            emergency_contact: emergencyNumber,
            email,
            date_of_birth: dob,
            aadhar_number: aadharId,
            gender: gender.toLowerCase(),
            address,
            patient_info: {
                bloodGrp: bloodGroup,
                height,
                weight
            }
        });

        // Save the patient to the database
        const savedPatient = await newPatient.save();
        // Send email with password
        await sendPasswordEmail(email,PlainPassword,);

        res.status(201).json({
            message: 'Patient registered successfully.',
            patient: savedPatient
        });
    } catch (error) {
        console.error('Error registering patient:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Controller for fetching all patients
export const getAllPatients = async (req, res) => {
    try {
        const patients = await Patient.find({}, {
            password: 0 // Exclude password field from results
        });
        
        res.status(200).json({
            count: patients.length,
            patients: patients
        });
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};



// Controller for fetching all bed information
export const getAllBedInfo = async (req, res) => {
    try {
        // BedLog.
        const bedLogs = await BedLog.BedLog.find().populate('bed_id').populate('patient_id');
        res.status(200).json(bedLogs);
    } catch (error) {
        console.error('Error fetching bed information:', error);
        console.log('BedLog model:', BedLog);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Controller for bed assignment
export const assignBed = async (req, res) => {
    try {
        const { patient_id, bed_id, bed_type } = req.body;

        // Validate required fields
        if (!patient_id || !bed_id || !bed_type) {
            return res.status(400).json({ message: 'Patient ID, Bed ID, and Bed Type are required fields' });
        }

        // Check if patient exists
        const patient = await Patient.findById(patient_id);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Check if bed is already occupied
        const existingAssignment = await BedLog.BedLog.findOne({
            bed_id: bed_id,
            status: "occupied"
        });

        if (existingAssignment) {
            return res.status(400).json({ message: 'Bed is already occupied' });
        }

        // Create new bed assignment
        const newAssignment = new BedLog.BedLog({
            patient_id,
            bed_id,
            bed_type,
            status: "occupied",
            time: new Date()
        });

        const savedAssignment = await newAssignment.save();

        res.status(201).json({
            message: 'Bed assigned successfully',
            assignment: savedAssignment
        });
    } catch (error) {
        console.error('Error assigning bed:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Controller for discharging patient from bed
export const dischargeBed = async (req, res) => {
    try {
        const { assignment_id } = req.body;

        // Validate required fields
        if (!assignment_id) {
            return res.status(400).json({ message: 'Assignment ID is required' });
        }

        // Find the assignment
        const assignment = await BedLog.BedLog.findById(assignment_id);
        
        if (!assignment) {
            return res.status(404).json({ message: 'Bed assignment not found' });
        }

        if (assignment.status === "vacated") {
            return res.status(400).json({ message: 'Patient already discharged from this bed' });
        }

        // Update the status to vacated and set current time
        assignment.status = "vacated";
        assignment.time = new Date();
        const updatedAssignment = await assignment.save();

        res.status(200).json({
            message: 'Patient discharged successfully',
            assignment: updatedAssignment
        });
    } catch (error) {
        console.error('Error discharging patient:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
// Function to apply insurance discount
const applyInsuranceDiscount = (totalAmount, insuranceDetails, date) => {
    if (!insuranceDetails) {
        return totalAmount; // No discount if insurance details are not provided or coverage percentage is missing
    }
    if (date > insuranceDetails.policy_end_date) {
        return totalAmount; // No discount if policy is expired
    }

    // Validate insurance_number and paid_amount
    const insuranceNumber = parseFloat(insuranceDetails.insurance_number) || 0;
    const paidAmount = parseFloat(insuranceDetails.paid_amount) || 0;

    const maxCoverage = Math.min((insuranceNumber * 100000) - paidAmount, totalAmount);
    insuranceDetails.paid_amount = paidAmount + maxCoverage;
    totalAmount -= maxCoverage;
    console.log('Discount applied. Remaining total amount:', totalAmount);
    return totalAmount;
};
// Controller for adding new bills
export const addBill = async (req, res) => {
    try {
        const {
            patient_id,
            generation_date,
            total_amount,
            payment_status,
            services, 
            insurance_provider
        } = req.body;
        // Example Postman query body for adding a new bill
       
        // Validate required fields
        if (!patient_id || !total_amount || !payment_status) {
            return res.status(400).json({
                message: 'Patient ID, total amount, and payment status are required fields'
            });
        }
        // Sample Postman query body for adding a new bill
      
        // return res.status(400).json({generation_date, total_amount, payment_status, services, insurance_provider});
        // Fetch insurance details if insurance_provider is provided
        let insuranceDetails = null;
        if (insurance_provider) {
            insuranceDetails = await Insurances.findOne({
                insurance_provider: insurance_provider,
                'patients.patient_id': patient_id
            }, {
                'patients.$': 1 // Fetch only the matching patient object from the patients array
            });

            if (!insuranceDetails || insuranceDetails.patients.length === 0) {
            return res.status(404).json({ message: 'Insurance provider or patient not found' });
            }

            insuranceDetails = insuranceDetails.patients[0]; // Extract the matching patient object
        }
        let datee = generation_date; 
        let tot = applyInsuranceDiscount(total_amount, insuranceDetails, datee);
        // Create a new bill instance
        // Validate and format generation_date
        if(!insuranceDetails){
           return res.status(400).json({ message: 'Insurance details are required' });
        }
        // const formattedDate = new Date(datee);
        // if (isNaN(formattedDate)) {
        //     return res.status(400).json({ message: 'Invalid generation_date format' });
        // }

        // Validate total_amount
        if (isNaN(tot) || tot < 0) {
            return res.status(400).json({ message: 'Invalid total_amount value' });
        }

        // Validate item_type against allowed enum values
        const allowedItemTypes = ['consultation', 'medication', 'surgery', 'diagnostic'];
        const validatedItems = services.map(service => {
            // if (!allowedItemTypes.includes(service.item_type)) {
            //     throw new Error(`Invalid item_type: ${service.item_type}`);
            // }
            return {
                item_type: service.item_type,
                item_description: service.item_description,
                price: service.price,
                consult_id: service.consult_id,
                report_id: service.report_id,
                prescription_id: service.prescription_id,
                room_id: service.room_id
            };
        });

        const newBill = new Bill.Bill({
            patient_id,
            generation_date: datee,
            total_amount: tot,
            payment_status,
            items: validatedItems
        });

        // Save the bill to the database
        const savedBill = await newBill.save();

        res.status(201).json({
            message: 'Bill created successfully',
            bill: savedBill
        });
    } catch (error) {
        console.error('Error adding bill:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const fetchPatientInsurance = async (req, res) => {
    try {
        const { patient_id } = req.body;
        
        if (!patient_id) {
            return res.status(400).json({ message: 'Patient ID is required' });
        }

        // Fetch insurances where the patient_id matches
        const insurances = await Insurances.find({
            'patients.patient_id': patient_id
        }).populate('patients.patient_id');

        res.status(200).json({
            count: insurances.length,
            insurances: insurances
        });
    } catch (error) {
        console.error('Error fetching insurance data:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};


// module.exports = {
//     registerNewPatient
// };




