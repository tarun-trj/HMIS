import mongoose from 'mongoose';
import seq from 'mongoose-sequence';
const AutoIncrement = seq(mongoose);
const { Schema } = mongoose;

const DoctorSchema = new Schema({
  _id: {type:Number}, // Auto-incremented field
  employee_id: { type: Number, ref: 'Employee' }, // THIS IS AUTOGEN BY MONGO
  department_id: { type: mongoose.Types.ObjectId, ref: 'Department' },
  specialization: String,
  qualification: String,
  experience: Number,
  room_num: Number,
  rating: Number,
  num_ratings: Number,
},{ _id:false }); // Disable automatic _id generation);

const NurseSchema = new Schema({
  _id: {type:Number}, // Auto-incremented field
  employee_id: { type: Number, ref: 'Employee' },
  assigned_dept: { type: mongoose.Types.ObjectId, ref: 'Department' },
  location: { type: String, enum: ["ward", "icu", "ot", "emergency"] },
  assigned_room: { type: Schema.Types.ObjectId, ref: 'Room' },
  assigned_bed: { type: Schema.Types.ObjectId, ref: 'Bed' },
  assigned_amb: { type: Schema.Types.ObjectId, ref: 'Ambulance' }
},{_id:false});

const PharmacistSchema = new Schema({
  employee_id: { type: Number, ref: 'Employee' }
});

const ReceptionistSchema = new Schema({
  employee_id: { type: Number, ref: 'Employee' },
  assigned_dept: { type: mongoose.Types.ObjectId, ref: 'Department' }
});

const AdminSchema = new Schema({
  employee_id: { type: Number, ref: 'Employee' }
});

const PathologistSchema = new Schema({
  employee_id: { type: Number, ref: 'Employee' },
  lab_id: { type: Schema.Types.ObjectId, ref: 'Lab' }
});

const DriverSchema = new Schema({
  employee_id: { type: Number, ref: 'Employee' }
});

DoctorSchema.plugin(AutoIncrement, { inc_field: '_id',id: 'doctor_id_counter',  start_seq: 10000, increment_by: 1 });
NurseSchema.plugin(AutoIncrement, { inc_field: '_id', id: 'nurse_id_counter', start_seq: 10000, increment_by: 1 });

const Doctor = mongoose.model('Doctor', DoctorSchema);
const Nurse = mongoose.model('Nurse', NurseSchema);
const Pharmacist = mongoose.model('Pharmacist', PharmacistSchema);
const Receptionist = mongoose.model('Receptionist', ReceptionistSchema);
const Admin = mongoose.model('Admin', AdminSchema);
const Pathologist = mongoose.model('Pathologist', PathologistSchema);
const Driver = mongoose.model('Driver', DriverSchema);

export { Doctor, Nurse, Pharmacist, Receptionist, Admin, Pathologist, Driver};