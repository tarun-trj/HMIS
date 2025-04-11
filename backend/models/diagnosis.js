import mongoose from 'mongoose';
const { Schema } = mongoose;

const DiagnosisSchema = new Schema({
  name: { type: String, unique: true }
});

const Diagnosis = mongoose.model('Diagnosis', DiagnosisSchema);
export default Diagnosis;