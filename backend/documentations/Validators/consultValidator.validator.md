# Joi Validation Documentation: Consultation System

This document describes the validation rules applied to the Consultation system's API endpoints using Joi.

### Validation Rules

| Field | Validation Rules | Error Message |
|-------|------------------|---------------|
| `patient_id` | Optional integer | Default Joi error messages |
| `doctor_id` | Optional integer | Default Joi error messages |
| `booked_date_time` | Optional date | Default Joi error messages |
| `status` | Optional enum: "scheduled", "ongoing", "completed", "cancelled" | Default Joi error messages |
| `reason` | Optional string, empty allowed | Default Joi error messages |
| `created_by` | Optional string matching MongoDB ObjectId pattern | "created_by must be a valid ObjectId" |
| `appointment_type` | Optional enum: "regular", "follow-up", "emergency", "consultation" | Default Joi error messages |
| `actual_start_datetime` | Optional date | Default Joi error messages |
| `remark` | Optional string, empty allowed | Default Joi error messages |
| `diagnosis` | Optional array of strings | Default Joi error messages |
| `prescription` | Optional array of integers | Default Joi error messages |
| `reports` | Optional array of Report objects (using ReportJoiSchema) | See Report validation |
| `bill_id` | Optional string matching MongoDB ObjectId pattern | Default Joi error messages |
| `recordedAt` | Optional date | Default Joi error messages |

## Dependencies

The schema imports and uses `ReportJoiSchema` from a separate validation file:

## Usage Examples

```javascript
// Validating consultation data in an API route handler
router.post('/consultations', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = ConsultationJoiSchema.validate(req.body);
    
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

// Validating consultation update
router.put('/consultations/:id', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = ConsultationJoiSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    
    // Update consultation with validated data
    
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

- All fields are optional to support partial updates in PUT/PATCH requests
- The schema supports validation of nested report objects using the imported ReportJoiSchema
- MongoDB ObjectId fields are validated using a regex pattern for 24-character hexadecimal strings
- The `reason` and `remark` fields allow empty strings to support clearing these fields
- The schema is designed to be reusable across create and update endpoints
- Patient and doctor IDs are expected to be integers (due to auto-increment in their respective schemas)
- The nested reports array validation relies on a separate validation schema (ReportJoiSchema)
