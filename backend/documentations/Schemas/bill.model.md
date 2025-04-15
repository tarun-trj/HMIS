# Mongoose Schema Documentation: Bill System

## BillItem Schema

The `BillItem` schema represents individual line items in a medical bill.

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| `item_type` | String | Category of the billing item | Enum: "consultation", "medication", "procedure", "room_charge", "test", "other" |
| `consult_id` | ObjectId | Reference to a consultation | References 'Consultation' model |
| `report_id` | ObjectId | Reference to a medical report | References 'Report' model |
| `prescription_id` | Number | Reference to a prescription | References 'Prescription' model |
| `room_id` | ObjectId | Reference to a hospital room | References 'Room' model |
| `item_description` | String | Description of the item | None |
| `item_amount` | Number | Cost per unit of the item | None |
| `quantity` | Number | Quantity of the item | None |

### Relationships
- References `Consultation` model through `consult_id`
- References `Report` model through `report_id`
- References `Prescription` model through `prescription_id`
- References `Room` model through `room_id`

## Payment Schema

The `PaymentSchema` represents individual payment transactions against a bill.

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| `amount` | Number | Payment amount | None |
| `insurance_id` | ObjectId | Reference to insurance | References 'Insurance' model |
| `payment_date` | Date | Date when payment was made | None |
| `payment_gateway_id` | ObjectId | Reference to payment processor | References 'PaymentGateway' model |
| `transaction_id` | String | Unique transaction identifier | None |
| `status` | String | Payment status | Enum: "success", "failed" |
| `payment_method` | String | Method of payment | Enum: "cash", "card", "bank_transfer", "insurance" |

### Relationships
- References `Insurance` model through `insurance_id`
- References `PaymentGateway` model through `payment_gateway_id`

## Bill Schema

The main `Bill` schema represents a complete bill for medical services.

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| `patient_id` | Number | Reference to the patient | References 'Patient' model |
| `generation_date` | Date | Date when bill was generated | None |
| `total_amount` | Number | Total bill amount | None |
| `remaining_amount` | Number | Amount still to be paid | None |
| `payment_status` | String | Overall payment status of bill | Enum: "paid", "pending", "partially_paid" |
| `items` | Array | List of billing items | Embedded BillItemSchema documents |
| `payments` | Array | List of payment transactions | Embedded PaymentSchema documents |
| `createdAt` | Date | Auto-generated timestamp | Added by timestamps option |
| `updatedAt` | Date | Auto-updated timestamp | Added by timestamps option |

### Relationships
- References `Patient` model through `patient_id`
- Embeds multiple `BillItem` documents in `items` array
- Embeds multiple `Payment` documents in `payments` array

### Options
- `timestamps: true`: Automatically adds and manages `createdAt` and `updatedAt` fields

## Models
- `Bill`: Mongoose model for bills
- `BillItem`: Mongoose model for bill items

## Usage Examples

```javascript
// Creating a new bill
const newBill = new Bill({
  patient_id: patientId,
  generation_date: new Date(),
  total_amount: 1500,
  remaining_amount: 1500,
  payment_status: "pending",
  items: [
    {
      item_type: "consultation",
      consult_id: consultationId,
      item_description: "Initial consultation",
      item_amount: 500,
      quantity: 1
    },
    {
      item_type: "test",
      report_id: reportId,
      item_description: "Blood test",
      item_amount: 1000,
      quantity: 1
    }
  ],
  payments: []
});

// Adding a payment to an existing bill
existingBill.payments.push({
  amount: 750,
  payment_date: new Date(),
  transaction_id: "TXN123456",
  status: "success",
  payment_method: "card"
});
existingBill.remaining_amount -= 750;
existingBill.payment_status = existingBill.remaining_amount > 0 ? "partially_paid" : "paid";
await existingBill.save();
```

## Notes
- The bill system supports multiple payment methods including insurance
- Bills can track partial payments and maintain a remaining balance
- Individual bill items can be categorized and linked to various medical services