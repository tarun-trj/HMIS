# Mongoose Schema Documentation: Log Systems

This documentation covers various logging schemas used throughout the medical facility system.

## LoginLog Schema

The `LoginLog` schema tracks user authentication events.

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| `user_id` | Number | Reference to the employee | References 'Employee' model |
| `access_time` | Date | When the event occurred | Default: Current date/time |
| `task` | String | Type of authentication event | Enum: "login", "logout" |

### Relationships
- References `Employee` model through `user_id`

## BedLog Schema

The `BedLog` schema records patient bed allocation and vacancy events.

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| `bed_id` | ObjectId | Reference to the specific bed | References 'Bed' model |
| `bed_type` | String | Category of bed | Enum: "private", "general", "semi_private" |
| `status` | String | Change in occupancy status | Enum: "occupied", "vacated" |
| `time` | Date | When the event occurred | Default: Current date/time |
| `patient_id` | Number | Reference to the patient | References 'Patient' model |

### Relationships
- References `Bed` model through `bed_id`
- References `Patient` model through `patient_id`

## MedicineInventoryLog Schema

The `MedicineInventoryLog` schema tracks medicine inventory changes and orders.

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| `med_id` | Number | Reference to the medicine | References 'Medicine' model |
| `quantity` | Number | Amount ordered or received | None |
| `total_cost` | Number | Total cost of transaction | None |
| `order_date` | Date | When the order was placed | None |
| `supplier` | String | Name of medicine supplier | None |
| `status` | String | Current status of order | Enum: "ordered", "received", "cancelled" |

### Relationships
- References `Medicine` model through `med_id`

## FinanceLog Schema

The `FinanceLog` schema records financial transactions and salary payments.

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| `user_id` | Number | Reference to the employee | References 'Employee' model |
| `transaction_type` | String | Category of financial transaction | Enum: "income", "expense" |
| `amount` | Number | Total transaction amount | None |
| `date` | Date | When the transaction occurred | Default: Current date/time |
| `description` | String | Description of transaction | None |
| `allowance` | Number | Additional payment amount | None |
| `basic_salary` | Number | Base salary amount | None |
| `deduction` | Number | Amount withheld from payment | None |
| `net_salary` | Number | Final payment after deductions | None |

### Relationships
- References `Employee` model through `user_id`

## Models
- `LoginLog`: Mongoose model for authentication logs
- `BedLog`: Mongoose model for bed occupancy logs
- `MedicineInventoryLog`: Mongoose model for medicine inventory logs
- `FinanceLog`: Mongoose model for financial transaction logs

## Usage Examples

```javascript
// Recording user login
const loginEvent = new LoginLog({
  user_id: employeeId,
  task: "login"
});
await loginEvent.save();

// Recording bed occupancy
const bedOccupancy = new BedLog({
  bed_id: bedId,
  bed_type: "private",
  status: "occupied",
  patient_id: patientId
});
await bedOccupancy.save();

// Logging medicine order
const medicineOrder = new MedicineInventoryLog({
  med_id: medicineId,
  quantity: 1000,
  total_cost: 25000,
  order_date: new Date(),
  supplier: "PharmaCorp",
  status: "ordered"
});
await medicineOrder.save();

// Recording salary payment
const salaryPayment = new FinanceLog({
  user_id: employeeId,
  transaction_type: "expense",
  amount: 75000,
  description: "Monthly salary payment",
  allowance: 5000,
  basic_salary: 70000,
  deduction: 0,
  net_salary: 75000
});
await salaryPayment.save();

// Generating login activity report
const userActivity = await LoginLog.find({
  user_id: employeeId,
  access_time: {
    $gte: new Date(new Date().setDate(new Date().getDate() - 30))
  }
}).sort({ access_time: -1 });

// Tracking bed occupancy history
const bedHistory = await BedLog.find({
  bed_id: bedId
})
.populate('patient_id')
.sort({ time: -1 });

// Finding received medicine orders
const receivedOrders = await MedicineInventoryLog.find({
  status: "received",
  order_date: {
    $gte: new Date(new Date().setMonth(new Date().getMonth() - 3))
  }
})
.populate('med_id')
.sort({ order_date: -1 });
```

## Notes
- Log schemas are designed to provide audit trails for system activities
- Each log type focuses on a specific domain: authentication, resource allocation, inventory, and finance
- Logs typically include timestamps and references to relevant entities
- These models support reporting, compliance, and troubleshooting functions
- Log data may grow rapidly and should be considered for archiving strategies