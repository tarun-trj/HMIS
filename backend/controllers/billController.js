// controllers/billController.js
import models from '../models/bill.js';
const { Bill } = models;

/**
 * Get all bills for a specific patient
 * @param {Request} req - Express request object with patientId in params
 * @param {Response} res - Express response object
 */
export const getBillsByPatientId = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!patientId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Patient ID is required' 
      });
    }

    const bills = await Bill.find({ patient_id: patientId })
      .select('_id generation_date total_amount payment_status')
      .sort({ generation_date: -1 }); // Sort by date, newest first

    // Format the response to match frontend requirements
    const formattedBills = bills.map((bill, index) => ({
      bill_id: bill._id,
      date: bill.generation_date.toISOString().split('T')[0],
      bill_number: index + 1, // Or use a more meaningful number if available
      total_amount: bill.total_amount,
      payment_status: bill.payment_status
    }));

    return res.status(200).json({
      success: true,
      data: formattedBills
    });
  } catch (error) {
    console.error('Error fetching bills:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch bills',
      error: error.message
    });
  }
};

/**
 * Get detailed information for a specific bill including all items and payments
 * @param {Request} req - Express request object with billId in params
 * @param {Response} res - Express response object
 */
export const getBillDetails = async (req, res) => {
  try {
    const { billId } = req.params;

    if (!billId) {
      return res.status(400).json({
        success: false,
        message: 'Bill ID is required'
      });
    }

    // Find the bill and populate any referenced fields
    const bill = await Bill.findById(billId)
      .populate({
        path: 'items.consult_id',
        select: 'doctor_id diagnosis -_id'
      })
      .populate({
        path: 'items.report_id',
        select: 'name result -_id'
      })
      .populate({
        path: 'items.prescription_id',
        select: 'medications -_id'
      })
      .populate({
        path: 'items.room_id',
        select: 'room_number type -_id'
      });

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    // Format the bill items to match frontend requirements
    const bill_items = bill.items.map(item => ({
      bill_item_id: item._id,
      item_type: {
        type: "String",
        enum: item.item_type
      },
      consult_id: item.consult_id?._id || "", 
      report_id: item.report_id?._id || "",
      prescription_id: item.prescription_id?._id || "",
      room_id: item.room_id?._id || "",
      item_description: item.item_description,
      item_amount: item.item_amount,
      quantity: item.quantity || 1
    }));

    // Calculate remaining amount based on payments
    const paidAmount = bill.payments.reduce((sum, payment) => {
      if (payment.status === "success") {
        return sum + payment.amount;
      }
      return sum;
    }, 0);

    const remainingAmount = bill.total_amount - paidAmount;

    // Format the bill to match frontend requirements
    const formattedBill = {
      _id: bill._id,
      bill_id: bill._id,
      patient_id: bill.patient_id,
      generation_date: bill.generation_date.toISOString().split('T')[0],
      total_amount: bill.total_amount,
      remaining_amount: remainingAmount,
      payment_status: {
        type: "String",
        enum: bill.payment_status
      },
      bill_items: bill_items,
      referredBy: "Dr. HMIS", // Default value, replace with actual referred doctor if available
      timestamp: bill.createdAt
    };

    return res.status(200).json({
      success: true,
      data: formattedBill
    });
  } catch (error) {
    console.error('Error fetching bill details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch bill details',
      error: error.message
    });
  }
};

/**
 * Get all payments for a specific bill
 * @param {Request} req - Express request object with billId in params
 * @param {Response} res - Express response object
 */
export const getPaymentsByBillId = async (req, res) => {
  try {
    const { billId } = req.params;

    if (!billId) {
      return res.status(400).json({
        success: false,
        message: 'Bill ID is required'
      });
    }

    const bill = await Bill.findById(billId);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    // Format payments to match frontend requirements
    const formattedPayments = bill.payments.map(payment => ({
      _id: payment._id,
      payment_id: payment._id,
      bill_id: billId,
      amount: payment.amount,
      insurance_id: payment.insurance_id || "",
      payment_date: payment.payment_date.toISOString().split('T')[0],
      payment_gateway_id: payment.payment_gateway_id || "",
      transaction_id: payment.transaction_id,
      status: {
        type: "String",
        enum: payment.status
      },
      payment_method: {
        type: "String",
        enum: payment.payment_method
      }
    }));

    return res.status(200).json({
      success: true,
      data: formattedPayments
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: error.message
    });
  }
};

/**
 * Add a new payment to a bill
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const addPayment = async (req, res) => {
  try {
    const { billId } = req.params;
    const paymentData = req.body;

    if (!billId) {
      return res.status(400).json({
        success: false,
        message: 'Bill ID is required'
      });
    }

    // Validate payment data
    if (!paymentData.amount || !paymentData.payment_method) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount and method are required'
      });
    }

    const bill = await Bill.findById(billId);
    
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    // Create new payment object
    const newPayment = {
      amount: paymentData.amount,
      insurance_id: paymentData.insurance_id,
      payment_date: paymentData.payment_date || new Date(),
      payment_gateway_id: paymentData.payment_gateway_id,
      transaction_id: paymentData.transaction_id || `tx${Date.now()}`,
      status: paymentData.status || "success",
      payment_method: paymentData.payment_method
    };

    // Add payment to bill
    bill.payments.push(newPayment);

    // Recalculate total paid amount
    const paidAmount = bill.payments.reduce((sum, payment) => {
      if (payment.status === "success") {
        return sum + payment.amount;
      }
      return sum;
    }, 0);

    // Update payment status
    if (paidAmount >= bill.total_amount) {
      bill.payment_status = "paid";
    } else if (paidAmount > 0) {
      bill.payment_status = "partially_paid";
    } else {
      bill.payment_status = "pending";
    }

    // Calculate and update remaining amount
    bill.remaining_amount = bill.total_amount - paidAmount;

    await bill.save();

    return res.status(200).json({
      success: true,
      message: 'Payment added successfully',
      data: {
        payment: bill.payments[bill.payments.length - 1],
        bill: {
          _id: bill._id,
          payment_status: bill.payment_status,
          remaining_amount: bill.remaining_amount
        }
      }
    });
  } catch (error) {
    console.error('Error adding payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add payment',
      error: error.message
    });
  }
};

/**
 * Add a new billing item to a bill
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const addBillingItem = async (req, res) => {
  try {
    const { billId } = req.params;
    const itemData = req.body;

    if (!billId) {
      return res.status(400).json({
        success: false,
        message: 'Bill ID is required'
      });
    }

    // Validate item data
    if (!itemData.item_type || !itemData.item_amount || !itemData.item_description) {
      return res.status(400).json({
        success: false,
        message: 'Item type, amount, and description are required'
      });
    }

    const bill = await Bill.findById(billId);
    
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    // Create new item object
    const newItem = {
      item_type: itemData.item_type,
      consult_id: itemData.consult_id,
      report_id: itemData.report_id,
      prescription_id: itemData.prescription_id,
      room_id: itemData.room_id,
      item_description: itemData.item_description,
      item_amount: itemData.item_amount,
      quantity: itemData.quantity || 1
    };

    // Add item to bill
    bill.items.push(newItem);

    // Recalculate total amount
    bill.total_amount = bill.items.reduce((sum, item) => {
      return sum + (item.item_amount * (item.quantity || 1));
    }, 0);

    // Recalculate total paid amount and update payment status
    const paidAmount = bill.payments.reduce((sum, payment) => {
      if (payment.status === "success") {
        return sum + payment.amount;
      }
      return sum;
    }, 0);

    if (paidAmount >= bill.total_amount) {
      bill.payment_status = "paid";
    } else if (paidAmount > 0) {
      bill.payment_status = "partially_paid";
    } else {
      bill.payment_status = "pending";
    }

    // Calculate and update remaining amount
    bill.remaining_amount = bill.total_amount - paidAmount;

    await bill.save();

    return res.status(200).json({
      success: true,
      message: 'Billing item added successfully',
      data: {
        item: bill.items[bill.items.length - 1],
        bill: {
          _id: bill._id,
          total_amount: bill.total_amount,
          payment_status: bill.payment_status,
          remaining_amount: bill.remaining_amount
        }
      }
    });
  } catch (error) {
    console.error('Error adding billing item:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add billing item',
      error: error.message
    });
  }
};

/**
 * Create a new bill
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const createBill = async (req, res) => {
  try {
    const { patient_id, items = [], referredBy } = req.body;

    if (!patient_id) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required'
      });
    }

    // Calculate total amount from items
    const total_amount = items.reduce((sum, item) => {
      return sum + (item.item_amount * (item.quantity || 1));
    }, 0);

    // Create new bill
    const newBill = new Bill({
      patient_id,
      generation_date: new Date(),
      total_amount,
      remaining_amount: total_amount,
      payment_status: "pending",
      items,
      payments: []
    });

    await newBill.save();

    return res.status(201).json({
      success: true,
      message: 'Bill created successfully',
      data: {
        bill_id: newBill._id,
        patient_id: newBill.patient_id,
        generation_date: newBill.generation_date,
        total_amount: newBill.total_amount,
        payment_status: newBill.payment_status
      }
    });
  } catch (error) {
    console.error('Error creating bill:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create bill',
      error: error.message
    });
  }
};