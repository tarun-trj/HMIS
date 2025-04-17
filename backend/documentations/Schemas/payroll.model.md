# Mongoose Schema Documentation: Payroll System

## Payroll Schema

The `Payroll` schema represents employee salary records and payment tracking.

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| `employee_id` | Number | Reference to the employee | References 'Employee' model |
| `basic_salary` | Number | Base salary amount | None |
| `payment_proof` | String | Document or reference to payment confirmation | None |
| `allowance` | Number | Additional compensation beyond base salary | None |
| `deduction` | Number | Amount withheld from salary | None |
| `net_salary` | Number | Final payment after deductions and allowances | None |
| `month_year` | Date | Month and year for which salary is paid | None |
| `payment_status` | String | Current status of salary payment | Enum: "paid", "pending", "partially_paid" |
| `generation_date` | Date | When the payroll record was created | None |
| `createdAt` | Date | Auto-generated timestamp | Added by timestamps option |
| `updatedAt` | Date | Auto-updated timestamp | Added by timestamps option |

### Options
- `timestamps: true`: Automatically adds and manages `createdAt` and `updatedAt` fields

### Relationships
- References `Employee` model through `employee_id`

## Model
- `Payroll`: Mongoose model for payroll records

## Usage Examples

```javascript
// Creating a new payroll record
const newPayroll = new Payroll({
  employee_id: employeeId,
  basic_salary: 70000,
  allowance: 5000,
  deduction: 2500,
  net_salary: 72500, // basic + allowance - deduction
  month_year: new Date('2025-04-01'), // For April 2025
  payment_status: "pending",
  generation_date: new Date()
});

await newPayroll.save();

// Updating payment status after processing
await Payroll.updateOne(
  { 
    employee_id: employeeId,
    month_year: new Date('2025-04-01')
  },
  { 
    $set: { 
      payment_status: "paid",
      payment_proof: "TXN123456789"
    }
  }
);

// Finding unpaid salaries
const pendingSalaries = await Payroll.find({
  payment_status: "pending"
})
.populate('employee_id')
.sort({ generation_date: 1 });

// Getting salary history for an employee
const salaryHistory = await Payroll.find({
  employee_id: employeeId
})
.sort({ month_year: -1 });

// Calculating total salary expenditure for a month
const april2025 = new Date('2025-04-01');
const startOfMonth = new Date(april2025.getFullYear(), april2025.getMonth(), 1);
const endOfMonth = new Date(april2025.getFullYear(), april2025.getMonth() + 1, 0);

const monthlyExpenditure = await Payroll.aggregate([
  {
    $match: {
      payment_status: "paid",
      month_year: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    }
  },
  {
    $group: {
      _id: null,
      totalSalary: { $sum: "$net_salary" },
      employeeCount: { $sum: 1 }
    }
  }
]);
```

## Notes
- The schema tracks individual salary components (basic, allowance, deduction)
- Payment status monitoring helps finance teams track pending payroll obligations
- The `month_year` field enables organizing salary records by pay period
- Payment proof field can store transaction IDs or references to external documents
- This model supports payroll history queries and financial reporting