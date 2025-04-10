import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const Inventory = () => {
  const { role } = useParams();
  
  // Dummy medicine data
  const dummyMedicineInventory = [
    { med_inv_id: 1001, med_id: 101, quantity: 250, batch_no: "A1234", expiry_date: "2025-12-31", manufacturing_date: "2024-01-15", unit_price: 0.75, supplier: "PharmSupply" },
    { med_inv_id: 1002, med_id: 102, quantity: 120, batch_no: "B5678", expiry_date: "2025-06-30", manufacturing_date: "2023-12-10", unit_price: 1.25, supplier: "MediSource" },
    { med_inv_id: 1003, med_id: 103, quantity: 500, batch_no: "C9123", expiry_date: "2026-03-15", manufacturing_date: "2024-03-05", unit_price: 0.50, supplier: "HealthDist" },
    { med_inv_id: 1004, med_id: 104, quantity: 0, batch_no: "D4567", expiry_date: "2025-08-22", manufacturing_date: "2023-10-12", unit_price: 2.00, supplier: "PharmSupply" },
    { med_inv_id: 1005, med_id: 105, quantity: 350, batch_no: "E7890", expiry_date: "2025-11-05", manufacturing_date: "2024-02-18", unit_price: 0.90, supplier: "MediSource" },
    { med_inv_id: 1006, med_id: 106, quantity: 80, batch_no: "F2345", expiry_date: "2024-07-10", manufacturing_date: "2023-09-25", unit_price: 25.50, supplier: "InsulinPlus" },
    { med_inv_id: 1007, med_id: 107, quantity: 200, batch_no: "G6789", expiry_date: "2026-01-20", manufacturing_date: "2024-01-10", unit_price: 1.80, supplier: "HealthDist" },
    { med_inv_id: 1008, med_id: 108, quantity: 150, batch_no: "H0123", expiry_date: "2025-05-15", manufacturing_date: "2023-11-25", unit_price: 3.25, supplier: "PharmSupply" },
    { med_inv_id: 1009, med_id: 109, quantity: 0, batch_no: "I4567", expiry_date: "2025-09-30", manufacturing_date: "2024-02-01", unit_price: 4.50, supplier: "MediSource" },
    { med_inv_id: 1010, med_id: 110, quantity: 100, batch_no: "J8901", expiry_date: "2024-12-05", manufacturing_date: "2023-12-28", unit_price: 2.75, supplier: "HealthDist" },
    { med_inv_id: 1011, med_id: 111, quantity: 300, batch_no: "K2345", expiry_date: "2026-02-28", manufacturing_date: "2024-03-15", unit_price: 1.15, supplier: "PharmSupply" },
    { med_inv_id: 1012, med_id: 112, quantity: 75, batch_no: "L6789", expiry_date: "2025-07-20", manufacturing_date: "2023-10-25", unit_price: 5.25, supplier: "MediSource" },
    { med_inv_id: 1013, med_id: 113, quantity: 0, batch_no: "M0123", expiry_date: "2024-10-10", manufacturing_date: "2023-11-01", unit_price: 3.50, supplier: "HealthDist" },
    { med_inv_id: 1014, med_id: 114, quantity: 225, batch_no: "N4567", expiry_date: "2025-04-25", manufacturing_date: "2024-01-05", unit_price: 0.65, supplier: "PharmSupply" },
    { med_inv_id: 1015, med_id: 115, quantity: 180, batch_no: "O8901", expiry_date: "2026-05-15", manufacturing_date: "2024-02-25", unit_price: 1.95, supplier: "MediSource" }
  ];

  // Dummy medicine data that would come from Medicine Collection
  const dummyMedicines = [
    { med_id: 101, med_name: "Amoxicillin", effectiveness: { type: "high" }, dosage_form: { type: "capsule" }, manufacturer: "PharmaCo", available: true },
    { med_id: 102, med_name: "Lisinopril", effectiveness: { type: "high" }, dosage_form: { type: "tablet" }, manufacturer: "MediLabs", available: true },
    { med_id: 103, med_name: "Ibuprofen", effectiveness: { type: "medium" }, dosage_form: { type: "tablet" }, manufacturer: "HealthPharm", available: true },
    { med_id: 104, med_name: "Azithromycin", effectiveness: { type: "high" }, dosage_form: { type: "tablet" }, manufacturer: "PharmaCo", available: false },
    { med_id: 105, med_name: "Loratadine", effectiveness: { type: "medium" }, dosage_form: { type: "tablet" }, manufacturer: "AllerCure", available: true },
    { med_id: 106, med_name: "Insulin", effectiveness: { type: "high" }, dosage_form: { type: "injection" }, manufacturer: "DiabeCare", available: true },
    { med_id: 107, med_name: "Atorvastatin", effectiveness: { type: "high" }, dosage_form: { type: "tablet" }, manufacturer: "HeartHealth", available: true },
    { med_id: 108, med_name: "Albuterol", effectiveness: { type: "high" }, dosage_form: { type: "inhaler" }, manufacturer: "RespiCare", available: true },
    { med_id: 109, med_name: "Metformin", effectiveness: { type: "medium" }, dosage_form: { type: "tablet" }, manufacturer: "DiabeCare", available: false },
    { med_id: 110, med_name: "Cetirizine", effectiveness: { type: "medium" }, dosage_form: { type: "tablet" }, manufacturer: "AllerCure", available: true },
    { med_id: 111, med_name: "Paracetamol", effectiveness: { type: "medium" }, dosage_form: { type: "tablet" }, manufacturer: "HealthPharm", available: true },
    { med_id: 112, med_name: "Omeprazole", effectiveness: { type: "high" }, dosage_form: { type: "capsule" }, manufacturer: "GastroHelp", available: true },
    { med_id: 113, med_name: "Amlodipine", effectiveness: { type: "high" }, dosage_form: { type: "tablet" }, manufacturer: "HeartHealth", available: false },
    { med_id: 114, med_name: "Aspirin", effectiveness: { type: "medium" }, dosage_form: { type: "tablet" }, manufacturer: "HealthPharm", available: true },
    { med_id: 115, med_name: "Metoprolol", effectiveness: { type: "high" }, dosage_form: { type: "tablet" }, manufacturer: "HeartHealth", available: true }
  ];

  // Dummy equipment data
  const dummyEquipment = [
    { _id: "e101", equipment_id: 201, equipment_name: "ECG Machine" },
    { _id: "e102", equipment_id: 202, equipment_name: "Defibrillator" },
    { _id: "e103", equipment_id: 203, equipment_name: "Ventilator" },
    { _id: "e104", equipment_id: 204, equipment_name: "Patient Monitor" },
    { _id: "e105", equipment_id: 205, equipment_name: "Infusion Pump" },
    { _id: "e106", equipment_id: 206, equipment_name: "Syringe Pump" },
    { _id: "e107", equipment_id: 207, equipment_name: "Ultrasound Machine" },
    { _id: "e108", equipment_id: 208, equipment_name: "X-ray Machine" },
    { _id: "e109", equipment_id: 209, equipment_name: "MRI Scanner" },
    { _id: "e110", equipment_id: 210, equipment_name: "CT Scanner" }
  ];

  // Dummy equipment inventory data
  const dummyEquipmentInventory = [
    { _id: "ei101", equipment_id: 201, quantity: 5, installation_date: "2023-05-15", last_service_date: "2024-01-10", next_service_date: "2024-07-10" },
    { _id: "ei102", equipment_id: 202, quantity: 8, installation_date: "2023-06-20", last_service_date: "2024-02-15", next_service_date: "2024-08-15" },
    { _id: "ei103", equipment_id: 203, quantity: 2, installation_date: "2023-09-05", last_service_date: "2024-03-01", next_service_date: "2024-09-01" },
    { _id: "ei104", equipment_id: 204, quantity: 15, installation_date: "2023-04-12", last_service_date: "2023-12-20", next_service_date: "2024-06-20" },
    { _id: "ei105", equipment_id: 205, quantity: 10, installation_date: "2023-08-25", last_service_date: "2024-02-28", next_service_date: "2024-08-28" },
    { _id: "ei106", equipment_id: 206, quantity: 12, installation_date: "2023-07-14", last_service_date: "2024-01-25", next_service_date: "2024-07-25" },
    { _id: "ei107", equipment_id: 207, quantity: 3, installation_date: "2023-10-30", last_service_date: "2024-04-15", next_service_date: "2024-10-15" },
    { _id: "ei108", equipment_id: 208, quantity: 1, installation_date: "2023-03-18", last_service_date: "2023-11-10", next_service_date: "2024-05-10" },
    { _id: "ei109", equipment_id: 209, quantity: 1, installation_date: "2023-11-22", last_service_date: "2024-05-01", next_service_date: "2024-11-01" },
    { _id: "ei110", equipment_id: 210, quantity: 1, installation_date: "2023-12-05", last_service_date: "2024-05-20", next_service_date: "2024-11-20" }
  ];

  // States for inventory management
  const [searchTerm, setSearchTerm] = useState('');
  const [inventoryType, setInventoryType] = useState('medicine'); // 'medicine' or 'equipment'
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [combinedMedicineInventory, setCombinedMedicineInventory] = useState([]);
  const [combinedEquipmentInventory, setCombinedEquipmentInventory] = useState([]);
  
  // Determine if toggle should be shown based on role
  const showToggle = ['doctor', 'admin', 'nurse'].includes(role);
  const showEquipmentOnly = role === 'pathologist';
  
  // Set initial inventory type based on role
  useEffect(() => {
    if (role === 'pharmacist') {
      setInventoryType('medicine');
    } else if (role === 'pathologist') {
      setInventoryType('equipment');
    }
  }, [role]);

  // Process medicine inventory data and combine with medicine details
  useEffect(() => {
    // Combine medicine details with inventory data
    const combinedMed = dummyMedicineInventory.map(invItem => {
      const medicine = dummyMedicines.find(med => med.med_id === invItem.med_id);
      return {
        ...invItem,
        med_name: medicine ? medicine.med_name : 'Unknown Medicine',
        available: medicine ? medicine.available : false,
        // Calculate next availability date (dummy data - 7 days from today if quantity is 0)
        nextAvailabilityDate: invItem.quantity === 0 ? getNextAvailabilityDate() : null,
        // Calculate expired quantity (dummy logic - 10% of quantity is expired if expiry date is this year)
        expiredQuantity: new Date(invItem.expiry_date).getFullYear() === new Date().getFullYear() 
          ? Math.round(invItem.quantity * 0.1) 
          : 0
      };
    });
    setCombinedMedicineInventory(combinedMed);
    
    // Combine equipment details with inventory data
    const combinedEquip = dummyEquipmentInventory.map(invItem => {
      const equipment = dummyEquipment.find(equip => equip.equipment_id === invItem.equipment_id);
      return {
        ...invItem,
        equipment_name: equipment ? equipment.equipment_name : 'Unknown Equipment',
        // Calculate days until next service
        daysUntilService: calculateDaysUntilService(invItem.next_service_date),
        // Service status based on days until next service
        serviceStatus: getServiceStatus(calculateDaysUntilService(invItem.next_service_date))
      };
    });
    setCombinedEquipmentInventory(combinedEquip);
  }, []);

  // Set initial filtered inventory based on role and inventory type
  useEffect(() => {
    if (inventoryType === 'medicine') {
      setFilteredInventory(combinedMedicineInventory);
    } else {
      setFilteredInventory(combinedEquipmentInventory);
    }
  }, [inventoryType, combinedMedicineInventory, combinedEquipmentInventory]);

  // Helper function to generate a random next availability date
  const getNextAvailabilityDate = () => {
    const today = new Date();
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + 7); // Add 7 days
    return nextDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };
  
  // Helper function to calculate days until next service
  const calculateDaysUntilService = (nextServiceDate) => {
    const today = new Date();
    const nextDate = new Date(nextServiceDate);
    const diffTime = nextDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  // Helper function to determine service status
  const getServiceStatus = (daysUntilService) => {
    if (daysUntilService < 0) return 'Overdue';
    if (daysUntilService <= 30) return 'Due Soon';
    return 'OK';
  };

  // Filter inventory based on search term and inventory type
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredInventory(inventoryType === 'medicine' ? combinedMedicineInventory : combinedEquipmentInventory);
    } else {
      if (inventoryType === 'medicine') {
        const filtered = combinedMedicineInventory.filter(item => 
          item.med_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          item.med_id.toString().includes(searchTerm) ||
          item.med_inv_id.toString().includes(searchTerm)
        );
        setFilteredInventory(filtered);
      } else {
        const filtered = combinedEquipmentInventory.filter(item => 
          item.equipment_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          item.equipment_id.toString().includes(searchTerm)
        );
        setFilteredInventory(filtered);
      }
    }
  }, [searchTerm, inventoryType, combinedMedicineInventory, combinedEquipmentInventory]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle toggle between medicine and equipment inventory
  const handleToggleInventory = () => {
    setInventoryType(prev => prev === 'medicine' ? 'equipment' : 'medicine');
    setSearchTerm(''); // Reset search when toggling
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {inventoryType === 'medicine' ? 'Medicine Inventory' : 'Equipment Inventory'}
        </h1>
  
        {/* Right-side buttons */}
        <div className="flex items-center space-x-4">
          {/* Toggle Button - Only shown for doctor, admin, nurse */}
          {showToggle && (
            <button
              onClick={handleToggleInventory}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            >
              Switch to {inventoryType === 'medicine' ? 'Equipment' : 'Medicine'} Inventory
            </button>
          )}
  
          {/* Pharmacist: Order Medicines */}
          {role === 'pharmacist' && (
            <button
              onClick={() => navigate('/pharmacist/inventory/order-medicine')}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            >
              Order Medicines
            </button>
          )}
  
          {/* Admin: Update Quantity */}
          {role === 'admin' && (
            <button
              onClick={() => navigate('/admin/inventory/update-quantity')}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            >
              Update Quantity
            </button>
          )}
        </div>
      </div>
  
      {/* Search Bar */}
      <div className="mb-6 relative mx-auto">
        <input
          type="text"
          placeholder={`Search by ${inventoryType === 'medicine' ? 'medicine' : 'equipment'} name or ID...`}
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full p-3 border border-gray-300 rounded-md pr-10"
        />
        <svg
          className="absolute right-3 top-3 h-5 w-5 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
  
      {/* Medicine Inventory Table */}
      {inventoryType === 'medicine' && (
        <div className="overflow-x-auto">
          <table className="w-3/4 mx-auto border-separate border-spacing-y-2">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Medicine Name</th>
                <th className="p-3 text-left">Available Quantity</th>
                <th className="p-3 text-left">Next Availability Date</th>
                <th className="p-3 text-left">Expired Quantity</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
                <tr key={item.med_inv_id} className="bg-gray-800 text-white rounded-md">
                  <td className="p-3 rounded-l-md">{item.med_id}</td>
                  <td className="p-3">{item.med_name}</td>
                  <td className="p-3">{item.quantity}</td>
                  <td className="p-3">{item.nextAvailabilityDate || 'In Stock'}</td>
                  <td className="p-3 rounded-r-md">{item.expiredQuantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
  
      {/* Equipment Inventory Table */}
      {inventoryType === 'equipment' && (
        <div className="overflow-x-auto">
          <table className="w-3/4 mx-auto border-separate border-spacing-y-2">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Equipment Name</th>
                <th className="p-3 text-left">Quantity</th>
                <th className="p-3 text-left">Last Service Date</th>
                <th className="p-3 text-left">Next Service Date</th>
                <th className="p-3 text-left">Service Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
                <tr key={item._id} className="bg-gray-800 text-white rounded-md">
                  <td className="p-3 rounded-l-md">{item.equipment_id}</td>
                  <td className="p-3">{item.equipment_name}</td>
                  <td className="p-3">{item.quantity}</td>
                  <td className="p-3">{item.last_service_date}</td>
                  <td className="p-3">{item.next_service_date}</td>
                  <td
                    className={`p-3 rounded-r-md ${
                      item.serviceStatus === 'Overdue'
                        ? 'text-red-300'
                        : item.serviceStatus === 'Due Soon'
                        ? 'text-yellow-300'
                        : 'text-green-300'
                    }`}
                  >
                    {item.serviceStatus}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
  
};

export default Inventory;