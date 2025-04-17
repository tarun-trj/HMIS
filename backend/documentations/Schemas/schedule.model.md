# Mongoose Schema Documentation: Doctor Scheduling System

## DoctorSchedule Schema

The `DoctorSchedule` schema represents the regular weekly schedule for doctors.

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| `doctor_id` | Number | Reference to the doctor | References 'Doctor' model |
| `day_of_week` | String | Day of the week for schedule | Enum: "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday" |
| `start_time` | String | Starting time of availability | None |
| `end_time` | String | Ending time of availability | None |
| `slot_duration_minutes` | Number | Length of each appointment slot | None |
| `max_appointments_per_slot` | Number | How many patients per time slot | Default: 1 |
| `is_active` | Boolean | Whether this schedule is currently active | Default: true |

### Relationships
- References `Doctor` model through `doctor_id`

## DoctorBusy Schema

The `DoctorBusy` schema represents exceptions to the regular schedule when a doctor is unavailable.

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| `doctor_id` | Number | Reference to the doctor | References 'Doctor' model |
| `exception_type` | String | Reason for unavailability | Enum: "time_off", "surgery", "meeting", "emergency", "other" |
| `start_datetime` | Date | Start of unavailable period | None |
| `end_datetime` | Date | End of unavailable period | None |
| `createdAt` | Date | Auto-generated timestamp | Added by timestamps option |
| `updatedAt` | Date | Auto-updated timestamp | Added by timestamps option |

### Options
- `timestamps: true`: Automatically adds and manages `createdAt` and `updatedAt` fields

### Relationships
- References `Doctor` model through `doctor_id`

## Models
- `DoctorSchedule`: Mongoose model for regular schedules
- `DoctorBusy`: Mongoose model for schedule exceptions

## Usage Examples

```javascript
// Setting up a doctor's regular schedule
const mondaySchedule = new DoctorSchedule({
  doctor_id: doctorId,
  day_of_week: "monday",
  start_time: "09:00",
  end_time: "17:00",
  slot_duration_minutes: 30,
  max_appointments_per_slot: 1
});

await mondaySchedule.save();

// Adding a busy exception for a doctor
const surgeryException = new DoctorBusy({
  doctor_id: doctorId,
  exception_type: "surgery",
  start_datetime: new Date('2025-04-20T10:00:00'),
  end_datetime: new Date('2025-04-20T13:00:00')
});

await surgeryException.save();

// Finding a doctor's weekly schedule
const doctorSchedule = await DoctorSchedule.find({
  doctor_id: doctorId,
  is_active: true
}).sort({ day_of_week: 1 });

// Checking if a doctor is available at a specific time
const appointmentTime = new Date('2025-04-20T11:30:00');
const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][appointmentTime.getDay()];
const timeString = appointmentTime.toTimeString().substring(0, 5); // "11:30"

// First check regular schedule
const regularSchedule = await DoctorSchedule.findOne({
  doctor_id: doctorId,
  day_of_week: dayOfWeek,
  is_active: true,
  start_time: { $lte: timeString },
  end_time: { $gte: timeString }
});

// Then check for exceptions
const busyException = await DoctorBusy.findOne({
  doctor_id: doctorId,
  start_datetime: { $lte: appointmentTime },
  end_datetime: { $gte: appointmentTime }
});

const isAvailable = regularSchedule && !busyException;

// Deactivating a schedule
await DoctorSchedule.updateOne(
  { 
    doctor_id: doctorId,
    day_of_week: "sunday"
  },
  { $set: { is_active: false }}
);

// Finding all doctors available on a specific day and time
const availableDoctors = await DoctorSchedule.find({
  day_of_week: "monday",
  start_time: { $lte: "14:00" },
  end_time: { $gte: "14:00" },
  is_active: true
})
.distinct('doctor_id');

// Filter out doctors with exceptions
const busyDoctors = await DoctorBusy.find({
  start_datetime: { $lte: new Date('2025-04-21T14:00:00') },
  end_datetime: { $gte: new Date('2025-04-21T14:00:00') }
})
.distinct('doctor_id');

const finalAvailableDoctors = availableDoctors.filter(
  doctorId => !busyDoctors.includes(doctorId)
);
```

## Notes
- The system combines regular weekly schedules with exceptions for comprehensive availability tracking
- Regular schedules use string time representation while exceptions use full datetime objects
- Multiple appointments per slot can be configured for group sessions or overlapping consultations
- The schema supports different types of unavailability to better organize doctor calendars
- Schedules can be deactivated rather than deleted to maintain historical records