import Joi from 'joi';

const PrescriptionEntryJoiSchema = Joi.object({
    medicine_id: Joi.number().integer().required(),
    dosage: Joi.string().min(1).required(),
    frequency: Joi.string().min(1).required(),
    duration: Joi.string().min(1).required(),
    quantity: Joi.number().integer().min(1).optional(),
    dispensed_qty: Joi.number().integer().min(0).optional() // default will be handled in Mongoose
});

const PrescriptionJoiSchema = Joi.object({
    prescriptionDate: Joi.date().optional(),
    status: Joi.string()
        .valid("pending", "dispensed", "partially_dispensed", "cancelled")
        .required(),
    entries: Joi.array().items(PrescriptionEntryJoiSchema).min(1).required()
});

export  { PrescriptionEntryJoiSchema , PrescriptionJoiSchema }