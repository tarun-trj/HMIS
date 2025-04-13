import mongoose from 'mongoose';
import seq from 'mongoose-sequence';
const AutoIncrement = seq(mongoose);
const { Schema } = mongoose;

const EquipmentSchema = new Schema({
  _id: Number, // Auto-incremented field
  equipment_name: String,
  owner_id: { type: mongoose.Types.ObjectId, ref: 'Department' },
  quantity: Number, // can be used for availability status (==0 or not)
  order_status:{
    type: String,
    enum: ["requested", "ordered", "cancelled"],
    //requested : someone places order for admin to see
    //ordered : admin places order to supplier
    //cancelled : admin cancels the order
  },
  installation_date: Date,
  last_service_date: Date,
  next_service_date: Date
}, { timestamps: true, _id: false });

EquipmentSchema.plugin(AutoIncrement, { inc_field: '_id',id: 'equipment_id_counter',  start_seq: 10000, increment_by: 1 });

const Equipment = mongoose.model('Equipment', EquipmentSchema);
export default Equipment;