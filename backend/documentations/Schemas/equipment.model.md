# Mongoose Schema Documentation: Equipment System

## Equipment Schema

The `Equipment` schema represents medical and hospital equipment tracked within the facility.

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| `_id` | Number | Auto-incremented equipment ID | None |
| `equipment_name` | String | Name of the equipment | None |
| `owner_id` | ObjectId | Department that owns the equipment | References 'Department' model |
| `quantity` | Number | Available quantity (0 means unavailable) | None |
| `order_status` | String | Current ordering status | Enum: "requested", "ordered", "cancelled" |
| `installation_date` | Date | When the equipment was installed | None |
| `last_service_date` | Date | Date of most recent service | None |
| `next_service_date` | Date | Scheduled date for next service | None |
| `createdAt` | Date | Auto-generated timestamp | Added by timestamps option |
| `updatedAt` | Date | Auto-updated timestamp | Added by timestamps option |

### Options
- `timestamps: true`: Automatically adds and manages `createdAt` and `updatedAt` fields
- `_id: false`: Disables automatic generation of MongoDB ObjectId
- Uses AutoIncrement plugin for `_id` field starting at 10000

### Relationships
- References `Department` model through `owner_id`

### Order Status Definitions
- `requested`: Equipment has been requested by department staff for admin approval
- `ordered`: Admin has placed an order with supplier
- `cancelled`: Admin has cancelled the order

## Model
- `Equipment`: Mongoose model for equipment

## Usage Examples

```javascript
// Creating a new equipment record
const newEquipment = new Equipment({
  equipment_name: "MRI Machine",
  owner_id: radiologyDeptId,
  quantity: 1,
  installation_date: new Date('2023-05-15'),
  last_service_date: new Date('2025-01-10'),
  next_service_date: new Date('2025-07-10')
});

await newEquipment.save();

// Requesting new equipment
const equipmentRequest = new Equipment({
  equipment_name: "Ultrasound Scanner",
  owner_id: obgynDeptId,
  quantity: 2,
  order_status: "requested"
});

await equipmentRequest.save();

// Finding equipment by ID
const equipment = await Equipment.findById(10002);

// Finding all equipment for a department
const departmentEquipment = await Equipment.find({ owner_id: radiologyDeptId })
  .sort({ equipment_name: 1 });

// Updating equipment status after admin places order
await Equipment.updateOne(
  { _id: 10003 },
  { $set: { order_status: "ordered" }}
);

// Updating equipment after maintenance service
await Equipment.updateOne(
  { _id: 10001 },
  { 
    $set: { 
      last_service_date: new Date(),
      next_service_date: new Date(new Date().setMonth(new Date().getMonth() + 6))
    }
  }
);

// Marking equipment as unavailable (quantity = 0)
await Equipment.updateOne(
  { _id: 10001 },
  { $set: { quantity: 0 }}
);
```

## Notes
- Equipment IDs are auto-incremented starting from 10000
- The `quantity` field can be used to track availability status (0 means unavailable)
- The schema supports tracking of maintenance schedules
- Equipment can be linked to specific departments through the owner reference
- The order status field helps track the procurement workflow