import Joi from 'joi';

// Embedded Inventory Schema
const InventoryItemJoiSchema = Joi.object({
    quantity: Joi.number().integer().min(0).required(),
    batch_no: Joi.string().required(),
    expiry_date: Joi.date().greater('now').required()
        .messages({
            'date.greater': 'Expiry date must be in the future'
        }),
    manufacturing_date: Joi.date().less('now').required()
        .messages({
            'date.less': 'Manufacturing date must be in the past',
        }),
    unit_price: Joi.number().min(0).required(),
    supplier: Joi.string().min(2).required()
});

// Main Medicine Schema
const MedicineJoiSchema = Joi.object({
    _id: Joi.number().integer().optional(), // Auto-incremented
    med_name: Joi.string().min(1).optional(),
    effectiveness: Joi.string()
        .valid("high", "medium", "low")
        .optional(),
    dosage_form: Joi.string()
        .valid("tablet", "capsule", "syrup", "injection", "cream", "ointment", "other")
        .optional(),
    manufacturer: Joi.string().min(1).optional(),
    available: Joi.boolean().optional(),
    inventory: Joi.array().items(InventoryItemJoiSchema).optional() // Allow empty or omitted if no stock yet
});


export {
    MedicineJoiSchema,
    InventoryItemJoiSchema
}