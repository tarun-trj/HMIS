import React, { useState, useEffect } from 'react';

const fetchConsultationsByPatientId = async (patientId) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/patients/${patientId}/consultations`);
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error("Failed to fetch consultations");
    }

    // Check if we received dummy data or actual consultations
    if (data.dummy) {
      return data.consultations; // Return the dummy data as is
    }

    // Handle actual data
    // Get current date to compare
    const now = new Date();

    // Filter only past consultations
    const pastConsultations = Array.isArray(data)
      ? data.filter((c) => {
        const consultDate = new Date(c.booked_date_time);
        return consultDate < now;
      })
      : [];

    return pastConsultations;
  } catch (err) {
    console.error("Error fetching consultations:", err);
    return []; // fallback return
  }
};

// Fetch bills for a patient
const fetchPatientBills = async (patientId) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/billing/detailed/patient/${patientId}`);
    const data = await res.json();
    console.log(data)
    if (!res.ok) {
      throw new Error("Failed to fetch bills");
    }
    
    return data.data || [];
  } catch (err) {
    console.error("Error fetching bills:", err);
    return [];
  }
};

const AddBills = () => {
  const [formData, setFormData] = useState({
    patient_id: '',
    generation_date: new Date().toISOString().split('T')[0],
    total_amount: '',
    payment_status: 'pending',
    services: []
  });

  const [currentService, setCurrentService] = useState({
    item_type: 'consultation',
    item_description: '',
    consult_id: '',
    report_id: '',
    prescription_id: '',
    room_id: '',
    price: '',
    quantity: 1
  });

  const [patientConsultations, setPatientConsultations] = useState([]);
  const [patientBills, setPatientBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [billableItems, setBillableItems] = useState({
    consultations: [],
    reports: [],
    prescriptions: []
  });

  // Fetch patient consultations and bills when patient ID changes
  useEffect(() => {
    if (formData.patient_id) {
      fetchPatientData(formData.patient_id);
    }
  }, [formData.patient_id]);

  // Process consultations to identify billable items
  useEffect(() => {
    if (patientConsultations.length > 0) {
      processBillableItems();
    }
  }, [patientConsultations, patientBills]);

  const fetchPatientData = async (patientId) => {
    setLoading(true);
    try {
      const consultationsData = await fetchConsultationsByPatientId(patientId);
      const billsData = await fetchPatientBills(patientId);
      
      setPatientConsultations(consultationsData);
      setPatientBills(billsData);
    } catch (error) {
      console.error("Error fetching patient data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Process consultations to identify billable items
  const processBillableItems = () => {
    // Create a set of billed item IDs for quick lookup
    const billedConsultations = new Set();
    const billedReports = new Set();
    const billedPrescriptions = new Set();
    
    patientBills.forEach(bill => {
      if (!bill.items) return;
      
      
      bill.items.forEach(item => {
        console.log(item)
        if (item.consultation_details) billedConsultations.add(item.consultation_details.id);
        if (item.test_details) billedReports.add(item.test_details.id);
        if (item.prescription_id) billedPrescriptions.add(item.prescription_id);
      });
    });
    
    // Filter consultations that haven't been billed
    const unbilledConsultations = patientConsultations.filter(
      consultation => !billedConsultations.has(consultation._id) && consultation.status === "completed"
    );
    
    // Gather all reports and prescriptions from consultations
    const allReports = [];
    const allPrescriptions = [];
    
    patientConsultations.forEach(consultation => {
      // Add reports
      if (consultation.reports && consultation.reports.length) {
        consultation.reports.forEach(report => {
          if (!billedReports.has(report._id)) {
            allReports.push({
              ...report,
              consultationId: consultation._id,
              consultationDate: consultation.booked_date_time
            });
          }
        });
      }
      
      // Add prescriptions - Handle the nested prescription structure
      if (consultation.prescription && consultation.prescription.length) {
        consultation.prescription.forEach(prescriptionObj => {
          // Extract the actual prescription ID from the nested structure
          let prescriptionId;
          if (typeof prescriptionObj === 'object' && prescriptionObj._id ) {
            // The format is {_id: {_id: 10376, ...}}
            prescriptionId = prescriptionObj._id;
          } else if (typeof prescriptionObj === 'number') {
            // Simple ID format
            prescriptionId = prescriptionObj;
          } else {
            console.warn("Unexpected prescription format:", prescriptionObj);
            return; // Skip this prescription
          }
          
          if (!billedPrescriptions.has(prescriptionId)) {
            allPrescriptions.push({
              _id: prescriptionId,
              consultationId: consultation._id,
              consultationDate: consultation.booked_date_time,
              prescriptionData: prescriptionObj, // Store the full data
              displayId: prescriptionId // For display purposes
            });
          }
        });
      }
    });
    
    setBillableItems({
      consultations: unbilledConsultations,
      reports: allReports,
      prescriptions: allPrescriptions
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServiceChange = (e) => {
    const { name, value } = e.target;
    setCurrentService(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addService = () => {
    if (!currentService.item_description || !currentService.price) {
      alert('Please enter service description and price');
      return;
    }

    // Calculate running total
    const servicePrice = parseFloat(currentService.price) * parseInt(currentService.quantity || 1);
    const newTotal = (parseFloat(formData.total_amount) || 0) + servicePrice;

    setFormData(prev => ({
      ...prev,
      services: [...prev.services, {...currentService, price: servicePrice.toFixed(2)}],
      total_amount: newTotal.toFixed(2)
    }));

    // Reset service form for next entry
    setCurrentService({
      item_type: 'consultation',
      item_description: '',
      consult_id: '',
      report_id: '',
      prescription_id: '',
      room_id: '',
      price: '',
      quantity: 1
    });
  };

  const removeService = (index) => {
    const removedPrice = parseFloat(formData.services[index].price) || 0;
    const newTotal = (parseFloat(formData.total_amount) || 0) - removedPrice;

    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
      total_amount: newTotal.toFixed(2)
    }));
  };

  const handleConsultationSelect = (consultation) => {
    setSelectedConsultation(consultation);
    
    // Set consultation as a service item
    const consultationService = {
      item_type: 'consultation',
      item_description: `Consultation on ${new Date(consultation.booked_date_time).toLocaleDateString()} - ${consultation.reason || 'General'}`,
      consult_id: consultation._id,
      price: '100.00', // You might want to get this from your pricing configuration
      quantity: 1
    };
    
    // Add consultation service
    addServiceToForm(consultationService);
  };

  const handleReportSelect = (report) => {
    const reportService = {
      item_type: 'test',
      item_description: `Report: ${report.title || 'Medical Test'}`,
      report_id: report._id,
      price: '50.00', // Example price
      quantity: 1
    };
    
    addServiceToForm(reportService);
  };

  const handlePrescriptionSelect = (prescription) => {
    // Get prescription details for a better description
    let prescriptionDetails = '';
    
    // Check if we have prescription data with entries
    if (prescription.prescriptionData && prescription.prescriptionData.entries && prescription.prescriptionData.entries.length > 0) {
      const medicineCount = prescription.prescriptionData.entries.length;
      const firstMedicine = prescription.prescriptionData.entries[0];
      
      if (medicineCount === 1 && firstMedicine.medicine_name) {
        prescriptionDetails = `Medicine: ${firstMedicine.medicine_name}`;
      } else {
        prescriptionDetails = `${medicineCount} medications`;
      }
    }
    
    const prescriptionService = {
      item_type: 'medication',
      item_description: `Prescription #${prescription.displayId}${prescriptionDetails ? ` (${prescriptionDetails})` : ''}`,
      prescription_id: prescription._id,
      price: '75.00', // Example price
      quantity: 1
    };
    
    addServiceToForm(prescriptionService);
  };

  // Helper function to add a service to the form
  const addServiceToForm = (service) => {
    const servicePrice = parseFloat(service.price);
    const newTotal = (parseFloat(formData.total_amount) || 0) + servicePrice;
    
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, service],
      total_amount: newTotal.toFixed(2)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.services.length === 0) {
      alert('Please add at least one service to the bill');
      return;
    }
    
    // Prepare the bill data
    const billData = {
      patient_id: formData.patient_id
    };
    
    try {
      // Create the bill
      const response = await fetch(`${import.meta.env.VITE_API_URL}/billing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(billData),
      });
      
      const data = await response.json();

      if (data.success) {
        // Prepare billing items
        const billItems = {
          items: formData.services.map(service => ({
            item_type: service.item_type,
            consult_id: service.consult_id || null,
            report_id: service.report_id || null,
            prescription_id: service.prescription_id || null,
            room_id: service.room_id || null,
            item_description: service.item_description,
            item_amount: parseFloat(service.price) / parseInt(service.quantity || 1),
            quantity: parseInt(service.quantity || 1)
          })),
        };
        
        // Add items to the bill
        const itemsResponse = await fetch(`${import.meta.env.VITE_API_URL}/billing/${data.data.bill_id}/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(billItems),
        });
        
        const itemsData = await itemsResponse.json();
        
        if (itemsData.success) {
          // Update bill_id in consultations if needed
          if (selectedConsultation) {
            await fetch(`${import.meta.env.VITE_API_URL}/consultations/update/${selectedConsultation._id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ bill_id: data.data.bill_id }),
            });
          }
          
          alert('Bill added successfully!');
          
          // Reset form
          setFormData({
            patient_id: '',
            generation_date: new Date().toISOString().split('T')[0],
            total_amount: '',
            payment_status: 'pending',
            services: []
          });
          setSelectedConsultation(null);
          
          // Refresh patient data if needed
          if (formData.patient_id) {
            fetchPatientData(formData.patient_id);
          }
        } else {
          alert('Failed to add bill items: ' + (itemsData.message || 'Unknown error'));
        }
      } else {
        alert('Failed to create bill: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error("Error adding bill:", error);
      alert('Error adding bill. Please try again.');
    }
  };

  // Show relevant fields based on item type
  const renderDynamicFields = () => {
    switch(currentService.item_type) {
      case 'consultation':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Consultation ID:</label>
            <input
              type="text"
              name="consult_id"
              value={currentService.consult_id}
              onChange={handleServiceChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        );
      case 'medication':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Prescription ID:</label>
            <input
              type="text"
              name="prescription_id"
              value={currentService.prescription_id}
              onChange={handleServiceChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        );
      case 'test':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Report ID:</label>
            <input
              type="text"
              name="report_id"
              value={currentService.report_id}
              onChange={handleServiceChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        );
      case 'room_charge':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Room ID:</label>
            <input
              type="text"
              name="room_id"
              value={currentService.room_id}
              onChange={handleServiceChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-white w-full h-full">
      <h2 className="text-xl font-semibold mb-6">Add Bills</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Patient ID:</label>
            <input
              type="text"
              name="patient_id"
              value={formData.patient_id}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Generation Date:</label>
            <input
              type="date"
              name="generation_date"
              value={formData.generation_date}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Total Amount:</label>
            <input
              type="number"
              name="total_amount"
              value={formData.total_amount}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Payment Status:</label>
            <select
              name="payment_status"
              value={formData.payment_status}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="partially_paid">Partially Paid</option>
            </select>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center my-6">
            <div className="animate-pulse text-gray-500">Loading patient data...</div>
          </div>
        )}

        {/* Billable Items Section */}
        {formData.patient_id && !loading && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">Billable Items</h3>
            
            {/* Unbilled Consultations */}
            {billableItems.consultations.length > 0 && (
              <div className="mb-4">
                <h4 className="text-md font-medium mb-2">Unbilled Consultations:</h4>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-1 gap-4">
                    {billableItems.consultations.map(consultation => (
                      <div 
                        key={consultation._id} 
                        className="p-4 border rounded-lg bg-white cursor-pointer hover:bg-blue-50"
                        onClick={() => handleConsultationSelect(consultation)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">
                              {new Date(consultation.booked_date_time).toLocaleDateString()} - {consultation.doctor?.name || 'Doctor'}
                            </h4>
                            <p className="text-sm text-gray-600">Reason: {consultation.reason || 'General consultation'}</p>
                            <p className="text-sm text-gray-600">Status: {consultation.status}</p>
                          </div>
                          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            Unbilled
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Unbilled Reports */}
            {billableItems.reports.length > 0 && (
              <div className="mb-4">
                <h4 className="text-md font-medium mb-2">Unbilled Reports:</h4>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {billableItems.reports.map(report => (
                      <div 
                        key={report._id} 
                        className="p-4 border rounded-lg bg-white cursor-pointer hover:bg-blue-50"
                        onClick={() => handleReportSelect(report)}
                      >
                        <h4 className="font-medium">{report.title || 'Medical Test'}</h4>
                        <p className="text-sm text-gray-600">
                          From consultation on {new Date(report.consultationDate).toLocaleDateString()}
                        </p>
                        <span className="mt-2 inline-block bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          Unbilled
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Unbilled Prescriptions */}
            {billableItems.prescriptions.length > 0 && (
              <div className="mb-4">
                <h4 className="text-md font-medium mb-2">Unbilled Prescriptions:</h4>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {billableItems.prescriptions.map(prescription => (
                      <div 
                        key={prescription._id} 
                        className="p-4 border rounded-lg bg-white cursor-pointer hover:bg-blue-50"
                        onClick={() => handlePrescriptionSelect(prescription)}
                      >
                        <h4 className="font-medium">Prescription #{prescription.displayId}</h4>
                        <p className="text-sm text-gray-600">
                          From consultation on {new Date(prescription.consultationDate).toLocaleDateString()}
                        </p>
                        {prescription.prescriptionData && prescription.prescriptionData.status && (
                          <p className="text-sm text-gray-600">
                            Status: {prescription.prescriptionData.status}
                          </p>
                        )}
                        {prescription.prescriptionData && prescription.prescriptionData.entries && (
                          <p className="text-sm text-gray-600">
                            Medications: {prescription.prescriptionData.entries.length}
                          </p>
                        )}
                        <span className="mt-2 inline-block bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          Unbilled
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* No billable items message */}
            {!loading && billableItems.consultations.length === 0 && 
             billableItems.reports.length === 0 && 
             billableItems.prescriptions.length === 0 && (
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <p className="text-gray-600">No unbilled items found for this patient.</p>
              </div>
            )}
          </div>
        )}
        
        {/* Add Custom Services Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Add Custom Services</h3>
          
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Item Type:</label>
                <select
                  name="item_type"
                  value={currentService.item_type}
                  onChange={handleServiceChange}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="consultation">Consultation</option>
                  <option value="medication">Medication</option>
                  <option value="procedure">Procedure</option>
                  <option value="room_charge">Room Charge</option>
                  <option value="test">Test</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Price:</label>
                <input
                  type="number"
                  name="price"
                  value={currentService.price}
                  onChange={handleServiceChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Quantity:</label>
                <input
                  type="number"
                  name="quantity"
                  value={currentService.quantity}
                  onChange={handleServiceChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  min="1"
                />
              </div>
            </div>

            {renderDynamicFields()}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Item Description:</label>
              <textarea
                name="item_description"
                value={currentService.item_description}
                onChange={handleServiceChange}
                className="w-full p-2 border border-gray-300 rounded h-24"
                placeholder="Enter service details here..."
              />
            </div>

            <div className="flex justify-end">
              <button 
                type="button"
                onClick={addService}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Add Service
              </button>
            </div>
          </div>

          {/* Display added services */}
          {formData.services.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-medium mb-2">Added Services:</h4>
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-2 text-left">Type</th>
                      <th className="p-2 text-left">Description</th>
                      <th className="p-2 text-center">Quantity</th>
                      <th className="p-2 text-right">Price</th>
                      <th className="p-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.services.map((service, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{service.item_type}</td>
                        <td className="p-2">{service.item_description}</td>
                        <td className="p-2 text-center">{service.quantity || 1}</td>
                        <td className="p-2 text-right">${parseFloat(service.price).toFixed(2)}</td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeService(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center md:justify-start">
          <button 
            type="submit" 
            className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-2 rounded transition duration-200"
            disabled={formData.services.length === 0}
          >
            Save Bill
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBills;