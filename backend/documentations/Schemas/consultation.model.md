# Mongoose Schema Documentation: Consultation System

## PrescriptionEntry Schema

The `PrescriptionEntry` schema represents individual medicine entries within a prescription.

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| `medicine_id` | Number | Reference to a medicine | References 'Medicine' model |
| `dosage` | String | Medicine dosage instructions | None |
| `frequency` | String | How often to take the medicine | None |
| `duration` | String | How long to take the medicine | None |
| `quantity` | Number | Total quantity prescribed | None |
| `dispensed_qty` | Number | Quantity already dispensed | Default: 0 |

### Relationships
- References `Medicine` model through `medicine_id`

## Prescription Schema

The `Prescription` schema represents a complete medical prescription with multiple medicine entries.

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| `_id` | Number | Auto-incremented prescription ID | None |
| `prescriptionDate` | Date | When prescription was created | Default: Current date/time |
| `status` | String | Current status of prescription | Enum: "pending", "dispensed", "partially_dispensed", "cancelled" |
| `entries` | Array | List of prescribed medications | Embedded PrescriptionEntry documents |

### Options
- `_id: false`: Disables automatic generation of Object ID
- Uses AutoIncrement plugin for `_id` field starting at 10000

### Relationships
- Embeds multiple `PrescriptionEntry` documents in the `entries` array

## Report Schema

The `Report` schema represents medical test reports or clinical documentation.

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| `status` | String | Current status of the report | Enum: "pending", "completed" |
| `reportText` | String | Content of the report | None |
| `title` | String | Title of the report | Required: true |
| `description` | String | Description of the report | None |
| `createdBy` | ObjectId | ID of creator (doctor/staff) | None |
| `createdAt` | Date | When the report was created | Default: Current date/time |
| `updatedAt` | Date | When the report was last updated | Default: Current date/time |

## Feedback Schema

The `Feedback` schema represents patient feedback for a consultation.

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| `rating` | Number | Numeric rating of the consultation | Enum: |
| `comments` | String | Textual feedback from patient | None |
| `created_at` | Date | When feedback was submitted | Default: Current date/time |

## Consultation Schema

The main `Consultation` schema represents a patient-doctor consultation session.

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| `patient_id` | Number | Reference to the patient | References 'Patient' model |
| `doctor_id` | Number | Reference to the doctor | References 'Doctor' model |
| `booked_date_time` | Date | Scheduled date/time | None |
| `status` | String | Current status of consultation | Enum: "scheduled", "ongoing", "completed", "cancelled" |
| `reason` | String | Symptoms or reason for visit | None |
| `created_by` | ObjectId | ID of receptionist who created appointment | References 'Receptionist' model |
| `appointment_type` | String | Type of appointment | Enum: "regular", "follow-up", "emergency", "consultation" |
| `actual_start_datetime` | Date | When consultation actually started | None |
| `remark` | String | Doctor's remarks | None |
| `additional_info` | String | Transcript data (speech to text) | None |
| `diagnosis` | Array | List of diagnosis IDs | References 'Diagnosis' model |
| `prescription` | Array | List of prescription IDs | References 'Prescription' model |
| `reports` | Array | List of medical reports | Embedded Report documents |
| `bill_id` | ObjectId | Reference to associated bill | References 'Bill' model |
| `recordedAt` | Date | When consultation was recorded | None |
| `feedback` | Object | Patient feedback | Embedded Feedback document |
| `createdAt` | Date | Auto-generated timestamp | Added by timestamps option |
| `updatedAt` | Date | Auto-updated timestamp | Added by timestamps option |

### Relationships
- References `Patient` model through `patient_id`
- References `Doctor` model through `doctor_id`
- References `Receptionist` model through `created_by`
- References multiple `Diagnosis` models through `diagnosis` array
- References multiple `Prescription` models through `prescription` array
- References `Bill` model through `bill_id`
- Embeds multiple `Report` documents in the `reports` array
- Embeds a single `Feedback` document

### Options
- `timestamps: true`: Automatically adds and manages `createdAt` and `updatedAt` fields

## Models
- `Prescription`: Mongoose model for prescriptions
- `PrescriptionEntry`: Mongoose model for prescription entries
- `Consultation`: Mongoose model for consultations
- `Feedback`: Mongoose model for feedback
- `Report`: Mongoose model for reports

## Usage Examples

```javascript
// Creating a new consultation
const newConsultation = new Consultation({
  patient_id: patientId,
  doctor_id: doctorId,
  booked_date_time: new Date('2025-04-20T10:30:00'),
  status: "scheduled",
  reason: "Persistent headache and dizziness",
  created_by: receptionistId,
  appointment_type: "regular"
});

// Adding a prescription to a consultation
const prescription = new Prescription({
  prescriptionDate: new Date(),
  status: "pending",
  entries: [
    {
      medicine_id: medicineId,
      dosage: "10mg",
      frequency: "Twice daily",
      duration: "7 days",
      quantity: 14
    }
  ]
});

await prescription.save();
newConsultation.prescription.push(prescription._id);
await newConsultation.save();

// Adding a report to an existing consultation
existingConsultation.reports.push({
  status: "completed",
  reportText: "Blood pressure normal. Heart rate slightly elevated.",
  title: "Initial Assessment",
  description: "Physical examination report",
  createdBy: doctorId
});
await existingConsultation.save();

// Adding feedback after consultation
existingConsultation.feedback = {
  rating: 5,
  comments: "Doctor was very thorough and explained everything clearly."
};
await existingConsultation.save();
```

## Notes
- The consultation system tracks the entire patient journey from appointment to prescription
- Prescriptions have auto-incremented IDs starting from 10000
- Feedback is stored as an embedded document within the consultation
- Reports can be added directly to consultations as embedded documents
- The system supports multiple types of appointments and consultation statuses