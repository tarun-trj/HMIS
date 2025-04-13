import mongoose from 'mongoose';
import seq from 'mongoose-sequence';
const AutoIncrement = seq(mongoose);
const { Schema } = mongoose;

const MedicineSchema = new Schema({
    _id: {type:Number}, // Auto-incremented field
  med_name: String,
  effectiveness: { type: String, enum: ["high", "medium", "low"] },
  dosage_form: { 
    type: String, 
    enum: ["tablet", "capsule", "syrup", "injection", "cream", "ointment", "other"] 
  },
  manufacturer: String,
  available: Boolean, //for availability
  order_status:{
    type: String,
    enum: ["requested", "ordered", "cancelled"],
    //requested : pharmacist places order for admin to see
    //ordered : admin places order to supplier
    //cancelled : admin cancels the order
  },
  inventory: [{
    quantity: Number,
    batch_no: String,
    expiry_date: Date,
    manufacturing_date: Date,
    unit_price: Number,
    supplier: String
  }] // Embedded inventory array
}, { timestamps: true , _id : false});

MedicineSchema.plugin(AutoIncrement, { inc_field: '_id',id: 'medicine_id_counter', start_seq: 10000, increment_by: 1 });

const Medicine = mongoose.model('Medicine', MedicineSchema);
export default Medicine;