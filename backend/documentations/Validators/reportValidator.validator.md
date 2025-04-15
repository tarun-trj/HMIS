# Joi Validation Documentation: Report System

This document describes the validation rules applied to the Report system's API endpoints using Joi.

## Report Validation Schema


| Field | Validation Rules | Error Message |
|-------|------------------|---------------|
| `status` | Required enum: "pending", "completed" | Default Joi error messages |
| `reportText` | Optional string, empty allowed | Default Joi error messages |
| `title` | Required string, minimum 3 characters | Default Joi error messages |
| `description` | Optional string, empty allowed | Default Joi error messages |
| `createdBy` | Required string | "createdBy must be a valid ObjectId" |

## Usage Examples

```javascript
// Validating a new report
router.post('/reports', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = ReportJoiSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    
    // Further processing with validated data
    
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// Updating a report
router.put('/reports/:id', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = ReportJoiSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    
    // Update report with validated data
    
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// Completing a report
router.patch('/reports/:id/complete', async (req, res) => {
  try {
    // Validate report text
    const { error, value } = Joi.object({
      reportText: Joi.string().min(1).required()
    }).validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    
    // Update report status and text
    
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

- The validation includes both required and optional fields
- Report title must be at least 3 characters long
- Status must be one of the defined enum values ("pending" or "completed")
- The `reportText` and `description` fields allow empty strings
- The `createdBy` field is required and should be a valid ObjectId, though the regex validation pattern is not explicitly included in this schema
- This validation schema is used for both creating new reports and updating existing ones
- When completing a report, a separate validation can be used to ensure report text is provided
