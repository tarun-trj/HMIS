// models/insurance.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

// const InsuranceSchema = new Schema({
//   patient_id: { type: Number, ref: 'Patient' },
//   insurance_provider: String,
//   amount_paid: Number,
//   policy_number: Number,
//   coverage_details: String,
//   policy_end_date: Date,
//   verification_status: Boolean
// }, { timestamps: true });

const InsuranceSchema = new Schema({
  insurance_provider: {type:String, unique: true},
  patients: [{
    patient_id: { type: Number, ref: 'Patient' },
    amount_paid: Number,
    policy_number: Number,
    policy_end_date: Date
  }]
})

const Insurance = mongoose.model('Insurance', InsuranceSchema);
export default Insurance;