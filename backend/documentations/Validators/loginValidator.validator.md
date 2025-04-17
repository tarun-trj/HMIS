# Joi Validation Documentation: Login System

This document describes the validation rules applied to the Login system's API endpoints using Joi.

## Login Validation Schema

| Field | Validation Rules | Error Message |
|-------|------------------|---------------|
| `email` | Required string in valid email format | Default Joi error messages |
| `password` | Required string, minimum 6 characters | Default Joi error messages |

## Usage Examples

```javascript
// Validating login credentials
router.post('/login', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = LoginJoiSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    
    // Proceed with login logic
    
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

- Both fields are required for login validation
- Email format is validated using Joi's built-in email validator
- Password must be at least 6 characters long
- This schema is simple but effective for basic authentication
- For security reasons, error messages don't specify which field is incorrect
- Consider adding rate limiting to prevent brute force attacks on this endpoint