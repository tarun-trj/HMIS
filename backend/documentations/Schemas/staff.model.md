# Mongoose Schema Documentation: Staff Roles System

This documentation covers the specialized staff role schemas that extend the base `Employee` model.

## Doctor Schema

The `Doctor` schema represents medical practitioners with specialized qualifications.

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| `_id` | Number | Auto-incremented doctor ID | None |
| `employee_id` | Number | Reference to base employee record | References 'Employee' model |
| `department_id` | ObjectId | Department association | References 'Department' model |
| `specialization` | String | Medical specialty | None |
| `qualification` | String | Degrees and certifications | None |
| `experience` | Number | Years of professional experience | None |
| `room_num` | Number | Consultation room number | None |
| `rating` | Number | Average patient rating | None |
| `num_ratings` | Number | Total number of ratings received | None |

### Options
- `_id: false`: Disables automatic generation of MongoDB ObjectId
- Uses AutoIncrement plugin for `_id` field starting at 10000

### Relationships
- References `Employee` model through `employee_id`
- References `Department` model through `department_id`

## Nurse Schema

The `Nurse` schema represents nursing staff with specific assignments.

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| `_id` | Number | Auto-incremented nurse ID | None |
| `employee_id` | Number | Reference to base employee record | References 'Employee' model |
| `assigned_dept` | ObjectId | Department assignment | References 'Department' model |
| `location` | String | Work area within hospital | Enum: "ward", "icu", "ot", "emergency" |
| `assigned_room` | ObjectId | Specific room assignment | References 'Room' model |
| `assigned_bed` | ObjectId | Specific bed assignment | References 'Bed' model |
| `assigned_amb` | ObjectId | Ambulance assignment | References 'Ambulance' model |

### Options
- `_id: false`: Disables automatic generation of MongoDB ObjectId
- Uses AutoIncrement plugin for `_id` field starting at 10000

### Relationships
- References `Employee` model through `employee_id`
- References `Department` model through `assigned_dept`
- References `Room` model through `assigned_room`
- References `Bed` model through `assigned_bed`
- References `Ambulance` model through `assigned_amb`

## Pharmacist Schema

The `Pharmacist` schema represents pharmacy staff.

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| `employee_id` | Number | Reference to base employee record | References 'Employee' model |

### Relationships
- References `Employee` model through `employee_id`

## Receptionist Schema

The `Receptionist` schema represents front desk staff.

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| `employee_id` | Number | Reference to base employee record | References 'Employee' model |
| `assigned_dept` | ObjectId | Department assignment | References 'Department' model |

### Relationships
- References `Employee` model through `employee_id`
- References `Department` model through `assigned_dept`

## Admin Schema

The `Admin` schema represents administrative staff with system privileges.

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| `employee_id` | Number | Reference to base employee record | References 'Employee' model |

### Relationships
- References `Employee` model through `employee_id`

## Pathologist Schema

The `Pathologist` schema represents laboratory staff.

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| `employee_id` | Number | Reference to base employee record | References 'Employee' model |
| `lab_id` | ObjectId | Laboratory assignment | References 'Lab' model |

### Relationships
- References `Employee` model through `employee_id`
- References `Lab` model through `lab_id`

## Driver Schema

The `Driver` schema represents ambulance drivers.

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| `employee_id` | Number | Reference to base employee record | References 'Employee' model |

### Relationships
- References `Employee` model through `employee_id`

## Models
- `Doctor`: Mongoose model for doctors
- `Nurse`: Mongoose model for nurses
- `Pharmacist`: Mongoose model for pharmacists
- `Receptionist`: Mongoose model for receptionists
- `Admin`: Mongoose model for administrators
- `Pathologist`: Mongoose model for pathologists
- `Driver`: Mongoose model for drivers

## Usage Examples

```javascript
// Creating a new doctor from an existing employee
const newDoctor = new Doctor({
  employee_id: employeeId,
  department_id: cardiologyDeptId,
  specialization: "Interventional Cardiology",
  qualification: "MBBS, MD (Cardiology)",
  experience: 12,
  room_num: 305,
  rating: 4.8,
  num_ratings: 56
});

await newDoctor.save();

// Creating a new nurse from an existing employee
const newNurse = new Nurse({
  employee_id: employeeId,
  assigned_dept: generalMedicineDeptId,
  location: "ward",
  assigned_room: roomId
});

await newNurse.save();

// Finding doctors by department
const cardiologists = await Doctor.find({
  department_id: cardiologyDeptId
})
.populate('employee_id')
.populate('department_id')
.sort({ experience: -1 });

// Finding nurses assigned to ICU
const icuNurses = await Nurse.find({
  location: "icu"
})
.populate('employee_id');

// Updating doctor's rating after a new review
const doctor = await Doctor.findOne({ _id: doctorId });
const newRatingCount = doctor.num_ratings + 1;
const newRatingValue = ((doctor.rating * doctor.num_ratings) + newRating) / newRatingCount;

await Doctor.updateOne(
  { _id: doctorId },
  { 
    $set: { 
      rating: newRatingValue,
      num_ratings: newRatingCount
    }
  }
);

// Reassigning a nurse to a different bed
await Nurse.updateOne(
  { _id: nurseId },
  { $set: { assigned_bed: newBedId }}
);
```

## Notes
- The staff role schemas extend the base Employee model with role-specific attributes
- Doctors and Nurses use auto-incremented IDs while other roles rely on the Employee ID
- The system supports tracking various assignments for nursing staff
- Doctor performance is tracked through ratings from patients
- Each role has specific relations to other parts of the system (rooms, departments, etc.)
- This schema design follows a specialization pattern for employee roles