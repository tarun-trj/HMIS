# Joi Validation Documentation: Prescription System

This document describes the validation rules applied to the Prescription system's API endpoints using Joi.

## Prescription Entry Validation Schema


| Field | Validation Rules | Error Message |
|-------|------------------|---------------|
| `medicine_id` | Required integer | Default Joi error messages |
| `dosage` | Required string, minimum 1 character | Default Joi error messages |
| `frequency` | Required string, minimum 1 character | Default Joi error messages |
| `duration` | Required string, minimum 1 character | Default Joi error messages |
| `quantity` | Optional integer, minimum 1 | Default Joi error messages |
| `dispensed_qty` | Optional integer, minimum 0 | Default Joi error messages |

## Prescription Validation Schema


| Field | Validation Rules | Error Message |
|-------|------------------|---------------|
| `prescriptionDate` | Optional date | Default Joi error messages |
| `status` | Required enum: "pending", "dispensed", "partially_dispensed", "cancelled" | Default Joi error messages |
| `entries` | Required array of PrescriptionEntry objects, minimum 1 entry | Default Joi error messages |

## Usage Examples

```javascript
// Validating a new prescription
router.post('/prescriptions', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = PrescriptionJoiSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    
    // Process validated data
    
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// Updating prescription status
router.patch('/prescriptions/:id/status', async (req, res) => {
  try {
    // Validate status field
    const { error, value } = Joi.object({
      status: Joi.string()
        .valid("pending", "dispensed", "partially_dispensed", "cancelled")
        .required()
    }).validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    
    // Update prescription status
      
    
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// Updating dispensed quantity
router.patch('/prescriptions/:id/entries/:entryIndex', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = Joi.object({
      dispensed_qty: Joi.number().integer().min(0).required()
    }).validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    
    // Further code logic
    
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});
```

## Notes

- The validation uses a hierarchical structure with a sub-schema for prescription entries
- A prescription must have at least one entry to be valid
- Prescription status must be one of the defined enum values
- Medicine IDs are integers (matching the auto-increment in Medicine schema)
- Quantity must be at least 1, while dispensed quantity can be 0
- The prescription date is optional and will default to the current date in Mongoose
- Dosage, frequency, and duration are required strings with meaningful information
- The validation supports partial updates to track medication dispensation
- The examples show how status can be automatically updated based on dispensation progress
