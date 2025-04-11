import mongoose from 'mongoose';
const { Schema } = mongoose;

const LabSchema = new Schema({
  lab_name: String
});

const DepartmentSchema = new Schema({
  dept_name: { type: String, unique: true },
  labs: [LabSchema] // Embedded array of labs
}, { timestamps: true });

const Department = mongoose.model('Department', DepartmentSchema);
export default Department;