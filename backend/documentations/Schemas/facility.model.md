# Mongoose Schema Documentation: Facility Management System

## Ambulance Schema

The `Ambulance` schema represents emergency vehicles in the hospital fleet.

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| `vehicle_number` | String | Registration number of the vehicle | None |
| `driver` | ObjectId | Reference to the assigned driver | References 'Driver' model |
| `status` | String | Current operational status | Enum: "active", "inactive" |
| `nurse_id` | Number | Reference to assigned nurse | References 'Nurse' model |

### Relationships
- References `Driver` model through `driver`
- References `Nurse` model through `nurse_id`

## Bed Schema

The `Bed` schema represents individual hospital beds within rooms.

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| `bed_number` | Number | Unique identifier for the bed | None |
| `nurse_id` | Number | Reference to assigned nurse | References 'Nurse' model |
| `patient_id` | Number | Reference to current patient | References 'Patient' model |
| `status` | String | Current occupancy status | Enum: "occupied", "vacant" |

### Relationships
- References `Nurse` model through `nurse_id`
- References `Patient` model through `patient_id`

## Room Schema

The `Room` schema represents patient rooms with multiple beds.

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| `room_number` | Number | Unique identifier for the room | None |
| `room_type` | String | Category of room | Enum: "general", "private", "semi_private" |
| `bed_count` | Number | Total number of beds in room | None |
| `dept_id` | ObjectId | Department the room belongs to | References 'Department' model |
| `beds` | Array | List of beds in the room | Embedded Bed documents |

### Relationships
- References `Department` model through `dept_id`
- Embeds multiple `Bed` documents in the `beds` array

## DailyOccupancy Schema

The `DailyOccupancy` schema tracks bed occupancy statistics on a daily basis.

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| `date` | Date | The date for which occupancy is recorded | Required: true, Unique: true |
| `occupiedBeds` | Array | List of occupied bed IDs | References 'Bed' model |
| `createdAt` | Date | Auto-generated timestamp | Added by timestamps option |
| `updatedAt` | Date | Auto-updated timestamp | Added by timestamps option |

### Options
- `timestamps: true`: Automatically adds and manages `createdAt` and `updatedAt` fields

### Relationships
- References multiple `Bed` models through `occupiedBeds` array

## Models
- `Ambulance`: Mongoose model for ambulances
- `Room`: Mongoose model for rooms
- `Bed`: Mongoose model for beds
- `DailyOccupancy`: Mongoose model for daily occupancy records

## Usage Examples

```javascript
// Creating a new room with beds
const newRoom = new Room({
  room_number: 101,
  room_type: "semi_private",
  bed_count: 2,
  dept_id: generalMedicineDeptId,
  beds: [
    {
      bed_number: 1,
      status: "vacant"
    },
    {
      bed_number: 2,
      status: "vacant"
    }
  ]
});

await newRoom.save();

// Adding an ambulance
const newAmbulance = new Ambulance({
  vehicle_number: "MH01-AB-1234",
  driver: driverId,
  status: "active",
  nurse_id: nurseId
});

await newAmbulance.save();

// Assigning a patient to a bed
const room = await Room.findOne({ room_number: 101 });
room.beds[0].patient_id = patientId;
room.beds[0].nurse_id = nurseId;
room.beds[0].status = "occupied";
await room.save();

// Recording daily occupancy
const today = new Date();
today.setHours(0, 0, 0, 0); // Set to beginning of day

const occupiedBedIds = [];
const rooms = await Room.find({});
rooms.forEach(room => {
  room.beds.forEach(bed => {
    if (bed.status === "occupied") {
      occupiedBedIds.push(bed._id);
    }
  });
});

const dailyOccupancy = new DailyOccupancy({
  date: today,
  occupiedBeds: occupiedBedIds
});

// Use updateOne with upsert to handle potential duplicate dates
await DailyOccupancy.updateOne(
  { date: today },
  { $set: { occupiedBeds: occupiedBedIds }},
  { upsert: true }
);

// Finding available beds in a specific department
const availableRooms = await Room.find({
  dept_id: cardiologyDeptId,
  "beds.status": "vacant"
});
```

## Notes
- The system tracks room and bed occupancy for patient management
- Ambulances can be assigned specific drivers and nurses
- Rooms are categorized by type, affecting pricing and amenities
- Daily occupancy records provide historical data for capacity planning
- Beds within rooms are tracked as embedded documents for efficiency