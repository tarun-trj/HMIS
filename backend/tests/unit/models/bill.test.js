// tests/unit/models/bill.test.js
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../../helpers/db.js';
import BillModels from '../../../models/bill.js';

const { Bill, BillItem } = BillModels;

// Setup and teardown
beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

beforeEach(async () => {
  // Clean up collections before each test
  await Bill.deleteMany({});
});

describe('Bill Model', () => {
  // Test basic bill creation
  it('should create a bill with valid fields', async () => {
    const billData = {
      patient_id: 12345,
      generation_date: new Date(),
      total_amount: 1500,
      remaining_amount: 1500,
      payment_status: 'pending',
      items: [],
      payments: []
    };
    
    const bill = new Bill(billData);
    const savedBill = await bill.save();
    
    expect(savedBill._id).toBeDefined();
    expect(savedBill.patient_id).toBe(12345);
    expect(savedBill.total_amount).toBe(1500);
    expect(savedBill.payment_status).toBe('pending');
    expect(savedBill.items).toHaveLength(0);
    expect(savedBill.payments).toHaveLength(0);
    expect(savedBill.createdAt).toBeDefined();
    expect(savedBill.updatedAt).toBeDefined();
  });
  
  // Test bill with items
  it('should create a bill with bill items', async () => {
    const consultId = new mongoose.Types.ObjectId();
    const billData = {
      patient_id: 12345,
      generation_date: new Date(),
      total_amount: 1500,
      remaining_amount: 1500,
      payment_status: 'pending',
      items: [
        {
          item_type: 'consultation',
          consult_id: consultId,
          item_description: 'Doctor consultation',
          item_amount: 500,
          quantity: 1
        },
        {
          item_type: 'medication',
          item_description: 'Antibiotics',
          item_amount: 200,
          quantity: 2
        }
      ]
    };
    
    const bill = new Bill(billData);
    const savedBill = await bill.save();
    
    expect(savedBill.items).toHaveLength(2);
    expect(savedBill.items[0].item_type).toBe('consultation');
    expect(savedBill.items[0].consult_id).toEqual(consultId);
    expect(savedBill.items[1].item_amount).toBe(200);
  });
  
  // Test bill with payments
  it('should create a bill with payment records', async () => {
    const insuranceId = new mongoose.Types.ObjectId();
    const paymentGatewayId = new mongoose.Types.ObjectId();
    
    const billData = {
      patient_id: 12345,
      generation_date: new Date(),
      total_amount: 1500,
      remaining_amount: 500,
      payment_status: 'partially_paid',
      payments: [
        {
          amount: 1000,
          payment_date: new Date(),
          status: 'success',
          payment_method: 'card',
          payment_gateway_id: paymentGatewayId,
          transaction_id: 'TXN123456'
        }
      ]
    };
    
    const bill = new Bill(billData);
    const savedBill = await bill.save();
    
    expect(savedBill.payments).toHaveLength(1);
    expect(savedBill.payments[0].amount).toBe(1000);
    expect(savedBill.payments[0].status).toBe('success');
    expect(savedBill.payments[0].payment_method).toBe('card');
  });
  
  // Test payment status validation
  it('should reject invalid payment status', async () => {
    const billData = {
      patient_id: 12345,
      generation_date: new Date(),
      total_amount: 1500,
      remaining_amount: 1500,
      payment_status: 'invalid_status', // Invalid value
      items: [],
      payments: []
    };
    
    const bill = new Bill(billData);
    
    await expect(bill.save()).rejects.toThrow();
  });
  
  // Test payment method validation
  it('should reject invalid payment method', async () => {
    const billData = {
      patient_id: 12345,
      generation_date: new Date(),
      total_amount: 1500,
      remaining_amount: 1500,
      payment_status: 'pending',
      payments: [
        {
          amount: 1000,
          payment_date: new Date(),
          status: 'success',
          payment_method: 'invalid_method' // Invalid value
        }
      ]
    };
    
    const bill = new Bill(billData);
    
    await expect(bill.save()).rejects.toThrow();
  });
  
  // Test item type validation
  it('should reject invalid item type', async () => {
    const billData = {
      patient_id: 12345,
      generation_date: new Date(),
      total_amount: 1500,
      remaining_amount: 1500,
      payment_status: 'pending',
      items: [
        {
          item_type: 'invalid_type', // Invalid value
          item_description: 'Test item',
          item_amount: 500,
          quantity: 1
        }
      ]
    };
    
    const bill = new Bill(billData);
    
    await expect(bill.save()).rejects.toThrow();
  });
  
  // Test updating a bill
  it('should update bill properties', async () => {
    const billData = {
      patient_id: 12345,
      generation_date: new Date(),
      total_amount: 1500,
      remaining_amount: 1500,
      payment_status: 'pending'
    };
    
    const bill = new Bill(billData);
    const savedBill = await bill.save();
    
    // Update bill
    savedBill.remaining_amount = 0;
    savedBill.payment_status = 'paid';
    const updatedBill = await savedBill.save();
    
    expect(updatedBill.remaining_amount).toBe(0);
    expect(updatedBill.payment_status).toBe('paid');
  });
  
  // Test adding an item to existing bill
  it('should add an item to an existing bill', async () => {
    const billData = {
      patient_id: 12345,
      generation_date: new Date(),
      total_amount: 1500,
      remaining_amount: 1500,
      payment_status: 'pending',
      items: []
    };
    
    const bill = new Bill(billData);
    const savedBill = await bill.save();
    
    // Add an item
    savedBill.items.push({
      item_type: 'test',
      item_description: 'Blood test',
      item_amount: 350,
      quantity: 1
    });
    
    const updatedBill = await savedBill.save();
    
    expect(updatedBill.items).toHaveLength(1);
    expect(updatedBill.items[0].item_description).toBe('Blood test');
  });
  
  // Test adding a payment to existing bill
  it('should add a payment to an existing bill', async () => {
    const billData = {
      patient_id: 12345,
      generation_date: new Date(),
      total_amount: 1500,
      remaining_amount: 1500,
      payment_status: 'pending',
      payments: []
    };
    
    const bill = new Bill(billData);
    const savedBill = await bill.save();
    
    // Add a payment
    savedBill.payments.push({
      amount: 500,
      payment_date: new Date(),
      status: 'success',
      payment_method: 'cash'
    });
    
    savedBill.remaining_amount = 1000;
    savedBill.payment_status = 'partially_paid';
    
    const updatedBill = await savedBill.save();
    
    expect(updatedBill.payments).toHaveLength(1);
    expect(updatedBill.payments[0].amount).toBe(500);
    expect(updatedBill.remaining_amount).toBe(1000);
    expect(updatedBill.payment_status).toBe('partially_paid');
  });
  
  // Test querying bills
  it('should find bills by patient ID', async () => {
    // Create multiple bills for different patients
    await new Bill({
      patient_id: 12345,
      generation_date: new Date(),
      total_amount: 1500,
      remaining_amount: 1500,
      payment_status: 'pending'
    }).save();
    
    await new Bill({
      patient_id: 67890,
      generation_date: new Date(),
      total_amount: 2000,
      remaining_amount: 2000,
      payment_status: 'pending'
    }).save();
    
    const patientBills = await Bill.find({ patient_id: 12345 });
    
    expect(patientBills).toHaveLength(1);
    expect(patientBills[0].patient_id).toBe(12345);
  });
});
