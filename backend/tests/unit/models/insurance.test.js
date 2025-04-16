// tests/unit/models/insurance.test.js
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import mongoose from 'mongoose'
import Insurance from '../../../models/insurance.js'
import { connectDB, disconnectDB, syncIndexes } from '../../helpers/db.js'

describe('Insurance Model', () => {
  beforeAll(async () => {
    await connectDB()
    // Wait for indexes to be completely built
    await mongoose.connection.createCollection('insurances'); // Force collection creation
    await mongoose.connection.syncIndexes();  })
    Insurance.deleteMany({});
  afterAll(async () => {
    await disconnectDB()
  })

  beforeEach(async () => {
    // Clear the database between tests
    await Insurance.deleteMany({})
  })

  // Test basic insurance creation
  it('should create a new insurance provider successfully', async () => {
    const insuranceData = {
      insurance_provider: 'Health Shield'
    }
    
    const insurance = new Insurance(insuranceData)
    const savedInsurance = await insurance.save()
    
    expect(savedInsurance._id).toBeDefined()
    expect(savedInsurance.insurance_provider).toBe('Health Shield')
    expect(savedInsurance.patients).toHaveLength(0)
  })
  
  // Test unique constraint on insurance provider
  it('should enforce uniqueness of insurance provider names', async () => {
    // Create first insurance provider
    const firstInsurance = new Insurance({
      insurance_provider: 'MediCare Plus'
    })
    await firstInsurance.save()
    syncIndexes()
    
    // Try to create a second with the same name
    const duplicateInsurance = new Insurance({
      insurance_provider: 'MediCare Plus'
    })
    
    await expect(duplicateInsurance.save()).rejects.toThrow()
  })
  
  // Test adding a patient to an insurance provider
  it('should add a patient to an insurance provider', async () => {
    const insurance = new Insurance({
      insurance_provider: 'Global Health'
    })
    await insurance.save()
    
    // Add a patient
    insurance.patients.push({
      patient_id: 12345,
      amount_paid: 5000,
      policy_number: 987654,
      policy_end_date: new Date('2026-12-31')
    })
    
    const updatedInsurance = await insurance.save()
    
    expect(updatedInsurance.patients).toHaveLength(1)
    expect(updatedInsurance.patients[0].patient_id).toBe(12345)
    expect(updatedInsurance.patients[0].amount_paid).toBe(5000)
  })
  
  // Test adding multiple patients
  it('should add multiple patients to an insurance provider', async () => {
    const insurance = new Insurance({
      insurance_provider: 'Family Care',
      patients: [
        {
          patient_id: 1001,
          amount_paid: 3000,
          policy_number: 100101,
          policy_end_date: new Date('2026-05-15')
        },
        {
          patient_id: 1002,
          amount_paid: 4500,
          policy_number: 100202,
          policy_end_date: new Date('2026-06-20')
        }
      ]
    })
    
    const savedInsurance = await insurance.save()
    
    expect(savedInsurance.patients).toHaveLength(2)
    expect(savedInsurance.patients[0].policy_number).toBe(100101)
    expect(savedInsurance.patients[1].policy_number).toBe(100202)
  })
  
  // Test updating patient details
  it('should update a patient\'s insurance details', async () => {
    // Create insurance with a patient
    const insurance = new Insurance({
      insurance_provider: 'Senior Care',
      patients: [{
        patient_id: 2001,
        amount_paid: 2500,
        policy_number: 200101,
        policy_end_date: new Date('2026-03-10')
      }]
    })
    
    await insurance.save()
    
    // Update the patient's details
    const patientToUpdate = insurance.patients[0]
    patientToUpdate.amount_paid = 3500
    patientToUpdate.policy_end_date = new Date('2027-03-10')
    
    await insurance.save()
    
    // Retrieve updated insurance
    const updatedInsurance = await Insurance.findOne({ insurance_provider: 'Senior Care' })
    
    expect(updatedInsurance.patients[0].amount_paid).toBe(3500)
    expect(updatedInsurance.patients[0].policy_end_date.getFullYear()).toBe(2027)
  })
  
  // Test removing a patient
  it('should remove a patient from an insurance provider', async () => {
    // Create insurance with two patients
    const insurance = new Insurance({
      insurance_provider: 'Child Care',
      patients: [
        {
          patient_id: 3001,
          amount_paid: 1800,
          policy_number: 300101,
          policy_end_date: new Date('2026-07-25')
        },
        {
          patient_id: 3002,
          amount_paid: 2200,
          policy_number: 300202,
          policy_end_date: new Date('2026-08-15')
        }
      ]
    })
    
    await insurance.save()
    
    // Remove the first patient
    insurance.patients.pull(insurance.patients[0]._id)
    await insurance.save()
    
    expect(insurance.patients).toHaveLength(1)
    expect(insurance.patients[0].patient_id).toBe(3002)
  })
  
  // Test finding insurance by patient ID
  it('should find insurance providers by patient ID', async () => {
    // Create multiple insurance providers with patients
    await Insurance.create([
      {
        insurance_provider: 'Provider A',
        patients: [{ patient_id: 5001, amount_paid: 2000, policy_number: 500101 }]
      },
      {
        insurance_provider: 'Provider B',
        patients: [{ patient_id: 5002, amount_paid: 3000, policy_number: 500201 }]
      }
    ])
    
    // Find insurance by patient ID
    const insurance = await Insurance.findOne({ 'patients.patient_id': 5001 })
    
    expect(insurance).toBeDefined()
    expect(insurance.insurance_provider).toBe('Provider A')
  })
  
  // Test finding expired policies
  it('should identify expired insurance policies', async () => {
    const now = new Date()
    const pastDate = new Date(now)
    pastDate.setFullYear(pastDate.getFullYear() - 1) // 1 year ago
    
    const futureDate = new Date(now)
    futureDate.setFullYear(futureDate.getFullYear() + 1) // 1 year in future
    
    // Create insurance with both expired and active policies
    await Insurance.create({
      insurance_provider: 'Mixed Policies',
      patients: [
        {
          patient_id: 6001,
          amount_paid: 2500,
          policy_number: 600101,
          policy_end_date: pastDate // Expired
        },
        {
          patient_id: 6002,
          amount_paid: 3000,
          policy_number: 600201,
          policy_end_date: futureDate // Active
        }
      ]
    })
    
    // Find insurance with expired policies
    const expiredPolicies = await Insurance.findOne({
      'patients.policy_end_date': { $lt: now }
    })
    
    expect(expiredPolicies).toBeDefined()
    
    // Find the specific expired policy within the returned insurance
    const expiredPatient = expiredPolicies.patients.find(
      patient => patient.policy_end_date < now
    )
    
    expect(expiredPatient).toBeDefined()
    expect(expiredPatient.patient_id).toBe(6001)
  })
  
  // Test batch updating of policies
  it('should batch update policy end dates', async () => {
    // Create insurance with multiple patients
    const insurance = new Insurance({
      insurance_provider: 'Group Policy',
      patients: [
        {
          patient_id: 7001,
          amount_paid: 2000,
          policy_number: 700101,
          policy_end_date: new Date('2026-01-01')
        },
        {
          patient_id: 7002,
          amount_paid: 2000,
          policy_number: 700201,
          policy_end_date: new Date('2026-01-01')
        }
      ]
    })
    
    await insurance.save()
    
    // Extend all policies by one year
    const newEndDate = new Date('2027-01-01')
    
    insurance.patients.forEach(patient => {
      patient.policy_end_date = newEndDate
    })
    
    await insurance.save()
    
    // Check if all policies were updated
    const updatedInsurance = await Insurance.findOne({ insurance_provider: 'Group Policy' })
    
    expect(updatedInsurance.patients.every(
      patient => patient.policy_end_date.getFullYear() === 2027
    )).toBe(true)
  })
  
  // Test data type validation
  it('should validate data types for insurance fields', async () => {
    // Test with invalid data types
    const invalidInsurance = new Insurance({
      insurance_provider: 123, // Should be string
      patients: [{
        patient_id: 'invalid', // Should be number
        amount_paid: 'invalid', // Should be number
        policy_number: 'invalid', // Should be number
        policy_end_date: 'invalid-date' // Should be date
      }]
    })
    
    try {
      await invalidInsurance.validate()
      // If validate passes, fail the test
      expect(true).toBe(false)
    } catch (error) {
      // Validation should fail
      expect(error).toBeDefined()
    }
  })
  
  // Test finding and updating in single operation
  it('should find and update an insurance provider atomically', async () => {
    // Create initial insurance
    await Insurance.create({
      insurance_provider: 'Update Test',
      patients: []
    })
    
    // Find and update in one operation
    const updatedInsurance = await Insurance.findOneAndUpdate(
      { insurance_provider: 'Update Test' },
      { $push: { patients: {
        patient_id: 8001,
        amount_paid: 5000,
        policy_number: 800101,
        policy_end_date: new Date('2026-12-31')
      }}},
      { new: true } // Return updated document
    )
    
    expect(updatedInsurance.patients).toHaveLength(1)
    expect(updatedInsurance.patients[0].patient_id).toBe(8001)
  })
  
  // Test bulk operations
  it('should perform bulk operations on insurance data', async () => {
    // Create multiple insurance records
    await Insurance.insertMany([
      { insurance_provider: 'Bulk A', patients: [] },
      { insurance_provider: 'Bulk B', patients: [] },
      { insurance_provider: 'Bulk C', patients: [] }
    ])
    
    // Add a patient to all insurance providers
    await Insurance.updateMany(
      { insurance_provider: { $in: ['Bulk A', 'Bulk B', 'Bulk C'] }},
      { $push: { patients: {
        patient_id: 9001,
        amount_paid: 1000,
        policy_number: 900101,
        policy_end_date: new Date('2026-10-15')
      }}}
    )
    
    // Check if all were updated
    const count = await Insurance.countDocuments({
      'patients.patient_id': 9001
    })
    
    expect(count).toBe(3)
  })
})
