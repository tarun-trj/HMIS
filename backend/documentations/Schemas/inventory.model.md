# Mongoose Schema Documentation: Medicine System

## Medicine Schema

The `Medicine` schema represents pharmaceutical products stocked in the hospital pharmacy.

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| `_id` | Number | Auto-incremented medicine ID | None |
| `med_name` | String | Name of the medicine | None |
| `effectiveness` | String | Efficacy rating | Enum: "high", "medium", "low" |
| `dosage_form` | String | Form of medication | Enum: "tablet", "capsule", "syrup", "injection", "cream", "ointment", "other" |
| `manufacturer` | String | Company that produces the medicine | None |
| `available` | Boolean | Current availability status | None |
| `order_status` | String | Current ordering status | Enum: "requested", "ordered", "cancelled" |
| `inventory` | Array | List of stock batches | Embedded inventory items |
| `createdAt` | Date | Auto-generated timestamp | Added by timestamps option |
| `updatedAt` | Date | Auto-updated timestamp | Added by timestamps option |

### Inventory Entry Fields (Subdocument)

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| `quantity` | Number | Amount in stock | None |
| `batch_no` | String | Manufacturer's batch number | None |
| `expiry_date` | Date | Date when medicine expires | None |
| `manufacturing_date` | Date | Date when medicine was produced | None |
| `unit_price` | Number | Cost per unit | None |
| `supplier` | String | Supplier name | None |

### Options
- `timestamps: true`: Automatically adds and manages `createdAt` and `updatedAt` fields
- `_id: false`: Disables automatic generation of MongoDB ObjectId
- Uses AutoIncrement plugin for `_id` field starting at 10000

### Order Status Definitions
- `requested`: Medicine has been requested by pharmacist for admin approval
- `ordered`: Admin has placed an order with supplier
- `cancelled`: Admin has cancelled the order

## Model
- `Medicine`: Mongoose model for medicines

## Usage Examples

```javascript
// Creating a new medicine
const newMedicine = new Medicine({
  med_name: "Paracetamol",
  effectiveness: "high",
  dosage_form: "tablet",
  manufacturer: "Generic Pharma",
  available: true,
  inventory: [
    {
      quantity: 500,
      batch_no: "B12345",
      expiry_date: new Date('2026-05-15'),
      manufacturing_date: new Date('2025-01-15'),
      unit_price: 2.5,
      supplier: "MedSupply Ltd."
    }
  ]
});

await newMedicine.save();

// Requesting more stock
await Medicine.updateOne(
  { _id: 10001 },
  { $set: { order_status: "requested" }}
);

// Adding new inventory batch
await Medicine.updateOne(
  { _id: 10001 },
  { 
    $push: { 
      inventory: {
        quantity: 1000,
        batch_no: "B12346",
        expiry_date: new Date('2026-08-15'),
        manufacturing_date: new Date('2025-02-15'),
        unit_price: 2.3,
        supplier: "MedSupply Ltd."
      }
    }
  }
);

// Updating inventory quantity after dispensing
await Medicine.updateOne(
  { _id: 10001, "inventory.batch_no": "B12345" },
  { $inc: { "inventory.$.quantity": -50 }}
);

// Checking for soon-to-expire medications
const threeMonthsFromNow = new Date();
threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

const expiringMeds = await Medicine.find({
  "inventory.expiry_date": { $lt: threeMonthsFromNow }
});

// Marking medicine as unavailable
await Medicine.updateOne(
  { _id: 10001 },
  { $set: { available: false }}
);
```

## Notes
- Medicine IDs are auto-incremented starting from 10000
- The system tracks multiple inventory batches with different expiry dates
- The `available` field provides quick status checks for prescription filling
- The order status field helps track the procurement workflow
- Different dosage forms are categorized to assist with prescription matching
- The schema tracks both creation and modification timestamps