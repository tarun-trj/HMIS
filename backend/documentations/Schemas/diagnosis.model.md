# Mongoose Schema Documentation: Diagnosis System

## Diagnosis Schema

The `Diagnosis` schema represents medical diagnoses or conditions that can be assigned to patients during consultations.

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| `name` | String | Name of the diagnosis or condition | Unique: true |

### Constraints
- The `name` field has a unique constraint, ensuring that each diagnosis in the system has a unique name

## Model
- `Diagnosis`: Mongoose model for diagnoses

## Usage Examples

```javascript
// Creating a new diagnosis
const newDiagnosis = new Diagnosis({
  name: "Type 2 Diabetes Mellitus"
});

await newDiagnosis.save();

// Finding a diagnosis by name
const diagnosis = await Diagnosis.findOne({ name: "Type 2 Diabetes Mellitus" });

// Updating a diagnosis name
await Diagnosis.updateOne(
  { name: "Type 2 Diabetes Mellitus" },
  { $set: { name: "Diabetes Mellitus Type 2" }}
);

// Creating multiple diagnoses at once
await Diagnosis.insertMany([
  { name: "Hypertension" },
  { name: "Hyperlipidemia" },
  { name: "Asthma" }
]);

// Finding all diagnoses (useful for dropdown menus)
const allDiagnoses = await Diagnosis.find({}).sort({ name: 1 });
```

## Notes
- The Diagnosis schema is intentionally simple, serving primarily as a reference table or lookup list
- The unique constraint on the `name` field prevents duplicate diagnoses in the system
- This model is typically referenced by other schemas like `Consultation` to associate diagnoses with patients
- The schema does not include timestamps, indicating that diagnosis records are not expected to change frequently