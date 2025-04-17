# Joi Validation Documentation: Medicine System

This document describes the validation rules applied to the Medicine system's API endpoints using Joi.

## Inventory Item Validation Schema

| Field | Validation Rules | Error Message |
|-------|------------------|---------------|
| `quantity` | Required integer, minimum 0 | Default Joi error messages |
| `batch_no` | Required string | Default Joi error messages |
| `expiry_date` | Required date, must be in the future | "Expiry date must be in the future" |
| `manufacturing_date` | Required date, must be in the past | "Manufacturing date must be in the past" |
| `unit_price` | Required number, minimum 0 | Default Joi error messages |
| `supplier` | Required string, minimum 2 characters | Default Joi error messages |

## Medicine Validation Schema

| Field | Validation Rules | Error Message |
|-------|------------------|---------------|
| `_id` | Optional integer | Default Joi error messages |
| `med_name` | Optional string, minimum 1 character | Default Joi error messages |
| `effectiveness` | Optional enum: "high", "medium", "low" | Default Joi error messages |
| `dosage_form` | Optional enum: "tablet", "capsule", "syrup", "injection", "cream", "ointment", "other" | Default Joi error messages |
| `manufacturer` | Optional string, minimum 1 character | Default Joi error messages |
| `available` | Optional boolean | Default Joi error messages |
| `inventory` | Optional array of InventoryItemJoiSchema objects | See Inventory Item validation |

## Usage Examples

```javascript
// Validating a new medicine
router.post('/medicines', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = MedicineJoiSchema.validate(req.body);
    
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

// Adding new inventory batch
router.post('/medicines/:id/inventory', async (req, res) => {
  try {
    // Validate inventory data
    const { error, value } = InventoryItemJoiSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    
    // Add inventory to medicine record
    
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// Updating medicine information
router.put('/medicines/:id', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = MedicineJoiSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    
    // Update medicine with validated data
      
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

- The validation uses a hierarchical structure with a sub-schema for inventory items
- Inventory items require valid date ranges (manufacturing date in past, expiry date in future)
- Medicine fields are mostly optional to support partial updates
- Quantity and price values must be non-negative
- The medicine schema supports different dosage forms and effectiveness ratings
- Inventory validation is stricter than the main medicine validation
- The _id field is optional as it's auto-incremented by the system
- The available boolean can be used to quickly check stock status
