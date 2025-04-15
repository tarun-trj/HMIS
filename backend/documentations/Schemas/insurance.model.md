# Mongoose Schema Documentation: Insurance System

## Insurance Schema

The `Insurance` schema represents insurance providers and their associated patient policies.

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| `insurance_provider` | String | Name of the insurance company | Unique: true |
| `patients` | Array | List of insured patients and policy details | None |

### Patient Entry Fields (Subdocument)

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| `patient_id` | Number | Reference to the patient | References 'Patient' model |
| `amount_paid` | Number | Amount paid through insurance | None |
| `policy_number` | Number | Insurance policy identifier | None |
| `policy_end_date` | Date | Date when policy expires | None |

### Relationships
- References multiple `Patient` models through `patients.patient_id`

## Model
- `Insurance`: Mongoose model for insurance providers

## Usage Examples

```javascript
// Creating a new insurance provider
const newInsurance = new Insurance({
  insurance_provider: "Health Assurance Ltd.",
  patients: []
});

await newInsurance.save();

// Adding a patient to an insurance provider
await Insurance.updateOne(
  { insurance_provider: "Health Assurance Ltd." },
  { 
    $push: { 
      patients: {
        patient_id: patientId,
        amount_paid: 50000,
        policy_number: 12345678,
        policy_end_date: new Date('2026-03-31')
      }
    }
  }
);

// Finding an insurance provider
const insurance = await Insurance.findOne({ insurance_provider: "Health Assurance Ltd." });

// Finding all patients covered by a specific insurance
const coveredPatients = await Insurance.findOne(
  { insurance_provider: "Health Assurance Ltd." }
).populate('patients.patient_id');

// Finding insurance providers for a specific patient
const patientInsurance = await Insurance.find(
  { "patients.patient_id": patientId }
);

// Updating a patient's policy details
await Insurance.updateOne(
  { 
    insurance_provider: "Health Assurance Ltd.",
    "patients.patient_id": patientId 
  },
  { 
    $set: { 
      "patients.$.policy_end_date": new Date('2027-03-31'),
      "patients.$.amount_paid": 75000
    }
  }
);

// Removing a patient from insurance coverage
await Insurance.updateOne(
  { insurance_provider: "Health Assurance Ltd." },
  { $pull: { patients: { patient_id: patientId } } }
);
```

## Notes
- The schema uses a unique constraint on the insurance provider name
- Each insurance provider can cover multiple patients
- Patient policy details are stored as an array of subdocuments
- The system tracks policy expiration dates and coverage amounts
- This model is typically referenced by the Payment schema to process insurance payments