# Mongoose Schema Documentation: Payment Gateway System

## PaymentGateway Schema

The `PaymentGateway` schema represents payment processing services integrated with the medical facility's billing system.

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| `gateway_name` | String | Name of the payment service provider | None |
| `status` | String | Current operational status | Enum: "active", "inactive" |
| `gateway_url` | String | API endpoint URL | None |
| `api_key` | String | Authentication key for the service | None |

## Model
- `PaymentGateway`: Mongoose model for payment gateways

## Usage Examples

```javascript
// Creating a new payment gateway
const newGateway = new PaymentGateway({
  gateway_name: "Razorpay",
  status: "active",
  gateway_url: "https://api.razorpay.com/v1/",
  api_key: "some_api_key_here"
});

await newGateway.save();

// Finding all active payment gateways
const activeGateways = await PaymentGateway.find({ status: "active" });

// Finding a specific gateway
const gateway = await PaymentGateway.findOne({ gateway_name: "Razorpay" });

// Deactivating a payment gateway
await PaymentGateway.updateOne(
  { gateway_name: "Razorpay" },
  { $set: { status: "inactive" }}
);

// Updating API credentials
await PaymentGateway.updateOne(
  { gateway_name: "Razorpay" },
  { $set: { api_key: "some_other_api_key" }}
);
```

## Notes
- The schema stores sensitive API keys that should be properly secured in production
- Gateways can be activated or deactivated without removing them from the system
- The schema is intentionally simple to accommodate different payment service providers
- This model is typically referenced by the Payment schema to track payment methods
- Consider encrypting the `api_key` field for enhanced security