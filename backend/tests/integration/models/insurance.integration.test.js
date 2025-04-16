// tests/integration/models/insurance.integration.test.js
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import mongoose from 'mongoose'
import Insurance from '../../../models/insurance.js'
import { connectDB, disconnectDB } from '../../helpers/db.js'
import supertest from 'supertest'
import express from 'express'

let app
let server
let port

// Setup express app for integration testing
beforeAll(async () => {
  await connectDB()
  await Insurance.init();
  
  // Setup Express app
  app = express()
  app.use(express.json())
  
  // Sample insurance routes for testing
  app.get('/api/insurance', async (req, res) => {
    try {
      const insuranceProviders = await Insurance.find({})
      res.json(insuranceProviders)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })
  
  app.get('/api/insurance/:provider', async (req, res) => {
    try {
      const insurance = await Insurance.findOne({
        insurance_provider: req.params.provider
      })
      if (!insurance) {
        return res.status(404).json({ message: 'Insurance provider not found' })
      }
      res.json(insurance)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })
  
  app.post('/api/insurance', async (req, res) => {
    try {
      const insurance = new Insurance(req.body)
      const savedInsurance = await insurance.save()
      res.status(201).json(savedInsurance)
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  })
  
  app.put('/api/insurance/:provider/patient', async (req, res) => {
    try {
      const insurance = await Insurance.findOne({
        insurance_provider: req.params.provider
      })
      
      if (!insurance) {
        return res.status(404).json({ message: 'Insurance provider not found' })
      }
      
      insurance.patients.push(req.body)
      const updatedInsurance = await insurance.save()
      res.json(updatedInsurance)
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  })
  
  // Start server
  server = app.listen(0);
  port = server.address().port;
})

afterAll(async () => {
  await new Promise(resolve => server?.close(resolve));
  await disconnectDB()
})

beforeEach(async () => {
  await Insurance.deleteMany({})
})

describe('Insurance API Integration', () => {
  it('should create a new insurance provider via API', async () => {
    const response = await supertest(app)
      .post('/api/insurance')
      .send({
        insurance_provider: 'API Insurance Co'
      })
    
    expect(response.status).toBe(201)
    expect(response.body.insurance_provider).toBe('API Insurance Co')
  })
  
  it('should not allow duplicate insurance provider names', async () => {
    // Create first provider
    await supertest(app)
      .post('/api/insurance')
      .send({
        insurance_provider: 'Unique Insurance'
      })
    
    // Try to create duplicate
    const response = await supertest(app)
      .post('/api/insurance')
      .send({
        insurance_provider: 'Unique Insurance'
      })
    
    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('error')
  })
  
  it('should add a patient to an insurance provider via API', async () => {
    // Create insurance provider
    await supertest(app)
      .post('/api/insurance')
      .send({
        insurance_provider: 'Patient API Insurance'
      })
    
    // Add a patient
    const response = await supertest(app)
      .put('/api/insurance/Patient API Insurance/patient')
      .send({
        patient_id: 10001,
        amount_paid: 3500,
        policy_number: 1000101,
        policy_end_date: new Date('2026-11-30')
      })
    
    expect(response.status).toBe(200)
    expect(response.body.patients).toHaveLength(1)
    expect(response.body.patients[0].patient_id).toBe(10001)
  })
  
  it('should retrieve all insurance providers', async () => {
    // Create multiple providers
    await Insurance.insertMany([
      { insurance_provider: 'Provider X' },
      { insurance_provider: 'Provider Y' }
    ])
    
    const response = await supertest(app).get('/api/insurance')
    
    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(2)
    expect(response.body.map(i => i.insurance_provider)).toContain('Provider X')
    expect(response.body.map(i => i.insurance_provider)).toContain('Provider Y')
  })
  
  it('should retrieve a specific insurance provider', async () => {
    // Create insurance with a patient
    await Insurance.create({
      insurance_provider: 'SpecificProvider',
      patients: [{
        patient_id: 11001,
        amount_paid: 4000,
        policy_number: 1100101,
        policy_end_date: new Date('2026-09-20')
      }]
    })
    
    const response = await supertest(app).get('/api/insurance/SpecificProvider')
    
    expect(response.status).toBe(200)
    expect(response.body.insurance_provider).toBe('SpecificProvider')
    expect(response.body.patients).toHaveLength(1)
    expect(response.body.patients[0].patient_id).toBe(11001)
  })
  
  it('should return 404 for non-existent insurance provider', async () => {
    const response = await supertest(app).get('/api/insurance/NonExistentProvider')
    
    expect(response.status).toBe(404)
  })
})
