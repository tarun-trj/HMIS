# Mongoose Schema Documentation: Department System

## Lab Schema

The `Lab` schema represents individual laboratories associated with a department.

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| `lab_name` | String | Name of the laboratory | None |

## Department Schema

The `Department` schema represents departments within a medical facility.

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| `dept_id` | String | Department identifier | Unique: true |
| `dept_name` | String | Name of the department | None |
| `labs` | Array | List of laboratories | Embedded Lab documents |
| `createdAt` | Date | Auto-generated timestamp | Added by timestamps option |
| `updatedAt` | Date | Auto-updated timestamp | Added by timestamps option |

### Options
- `timestamps: true`: Automatically adds and manages `createdAt` and `updatedAt` fields

### Relationships
- Embeds multiple `Lab` documents in the `labs` array

## Model
- `Department`: Mongoose model for departments

## Usage Examples

```javascript
// Creating a new department with labs
const newDepartment = new Department({
  dept_id: "CARDIO-001",
  dept_name: "Cardiology",
  labs: [
    { lab_name: "ECG Laboratory" },
    { lab_name: "Echocardiography Laboratory" }
  ]
});

await newDepartment.save();

// Adding a new lab to an existing department
existingDepartment.labs.push({ lab_name: "Cardiac Catheterization Laboratory" });
await existingDepartment.save();

// Finding a department by ID
const department = await Department.findOne({ dept_id: "CARDIO-001" });

// Updating a department name
await Department.updateOne(
  { dept_id: "CARDIO-001" },
  { $set: { dept_name: "Cardiology & Cardiac Surgery" }}
);

// Removing a lab from a department
existingDepartment.labs = existingDepartment.labs.filter(
  lab => lab.lab_name !== "ECG Laboratory"
);
await existingDepartment.save();
```

## Notes
- The department system uses a custom string identifier (`dept_id`) rather than relying on MongoDB's ObjectId
- Laboratories are stored as embedded documents within departments rather than as separate collections
- The schema includes timestamp fields to track creation and modification dates