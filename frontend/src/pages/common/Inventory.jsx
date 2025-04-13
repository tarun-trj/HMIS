import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Search, ChevronLeft, ChevronRight, X, Plus } from 'lucide-react';

const Inventory = () => {
  const { role } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [inventoryType, setInventoryType] = useState('medicine');
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [modalMode, setModalMode] = useState('update'); // 'update' or 'add'
  const [updateForm, setUpdateForm] = useState({
    med_name: '',
    effectiveness: 'medium',
    dosage_form: 'tablet',
    manufacturer: '',
    quantity: '',
    batch_no: '',
    expiry_date: '',
    manufacturing_date: '',
    unit_price: '',
    supplier: ''
  });
  
  const showToggle = ['doctor', 'admin', 'nurse'].includes(role);

  // Initialize inventory type based on role
  useEffect(() => {
    if (role === 'pharmacist') setInventoryType('medicine');
    else if (role === 'pathologist') setInventoryType('equipment');
  }, [role]);

  // Fetch inventory data
  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('http://localhost:5000/api/inventory/search', {
        params: {
          searchQuery: searchTerm.trim(),
          page: pagination.page,
          limit: 10,
          type: inventoryType
        }
      });

      setInventory(response.data.items);
      setPagination({
        page: response.data.page,
        totalPages: response.data.totalPages,
        hasNextPage: response.data.hasNextPage,
        hasPrevPage: response.data.hasPrevPage
      });
    } catch (err) {
      setError('Failed to fetch inventory data');
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when search term, page or inventory type changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchInventory();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, pagination.page, inventoryType]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on new search
  };

  const handleToggleInventory = () => {
    setInventoryType(prev => prev === 'medicine' ? 'equipment' : 'medicine');
    setSearchTerm('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleModalOpen = (mode, medicine = null) => {
    setModalMode(mode);
    if (mode === 'update' && medicine) {
      setSelectedMedicine(medicine);
      setUpdateForm(prev => ({
        ...prev,
        med_name: medicine.name,
        manufacturer: medicine.manufacturer
      }));
    } else {
      setSelectedMedicine(null);
      setUpdateForm({
        med_name: '',
        effectiveness: 'medium',
        dosage_form: 'tablet',
        manufacturer: '',
        quantity: '',
        batch_no: '',
        expiry_date: '',
        manufacturing_date: '',
        unit_price: '',
        supplier: ''
      });
    }
    setShowUpdateModal(true);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
        
      const payload = {
        ...updateForm,
        ...(modalMode === 'update' && { medicineId: selectedMedicine.id }),
        available: true
      };

      const response = await axios.post(`http://localhost:5000/api/admin/update-inventory`, payload);

      if (response.status === 200 || response.status === 201) {
        fetchInventory();
        setShowUpdateModal(false);
        setSelectedMedicine(null);
        setUpdateForm({
          med_name: '',
          effectiveness: 'medium',
          dosage_form: 'tablet',
          manufacturer: '',
          quantity: '',
          batch_no: '',
          expiry_date: '',
          manufacturing_date: '',
          unit_price: '',
          supplier: ''
        });
      }
    } catch (err) {
      setError(`Failed to ${modalMode} medicine`);
      console.error(`Error ${modalMode}ing medicine:`, err);
    } finally {
      setLoading(false);
    }
  };

  const paginationControls = (
    <div className="flex justify-center items-center gap-4 mt-6">
      <button
        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
        disabled={!pagination.hasPrevPage}
        className="p-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <span>
        Page {pagination.page} of {pagination.totalPages}
      </span>
      <button
        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
        disabled={!pagination.hasNextPage}
        className="p-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );

  const medicineColumns = (
    <tr className="bg-gray-100">
      <th className="p-3 text-left">ID</th>
      <th className="p-3 text-left">Medicine Name</th>
      <th className="p-3 text-left">Manufacturer</th>
      <th className="p-3 text-left">Available Quantity</th>
      <th className="p-3 text-left">Status</th>
      {role === 'admin' && <th className="p-3 text-left">Actions</th>}
    </tr>
  );

  const medicineRow = (item) => (
    <tr key={item.id} className="bg-gray-800 text-white rounded-md">
      <td className="p-3 rounded-l-md">{item.id}</td>
      <td className="p-3">{item.name}</td>
      <td className="p-3">{item.manufacturer}</td>
      <td className="p-3">{item.quantity}</td>
      <td className={`p-3 ${
        !item.available ? 'text-red-300' : 'text-green-300'
      }`}>
        {item.available ? 'Available' : `Expected: ${item.next_availability}`}
      </td>
      {role === 'admin' && (
        <td className="p-3 rounded-r-md">
          <button
            onClick={() => handleModalOpen('update', item)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
          >
            Update
          </button>
        </td>
      )}
    </tr>
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return dateString.split('T')[0];
  };

  const equipmentRow = (item) => (
    <tr key={item.id} className="bg-gray-800 text-white rounded-md">
      <td className="p-3 rounded-l-md">{item.id}</td>
      <td className="p-3">{item.name}</td>
      <td className="p-3">{item.quantity}</td>
      <td className="p-3">{formatDate(item.last_service_date)}</td>
      <td className="p-3">{formatDate(item.next_service_date)}</td>
      <td className={`p-3 rounded-r-md ${
        item.service_status === 'Overdue' ? 'text-red-300' :
        item.service_status === 'Due Soon' ? 'text-yellow-300' :
        'text-green-300'
      }`}>
        {item.service_status}
      </td>
    </tr>
  );

  const renderModal = () => (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[800px] relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setShowUpdateModal(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
        <h2 className="text-2xl font-semibold mb-6">
          {modalMode === 'update' ? 'Update Medicine' : 'Add New Medicine'}
        </h2>
        <div className="space-y-6">
          {/* New fields for Add mode */}
          {modalMode === 'add' && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name</label>
                <input
                  type="text"
                  value={updateForm.med_name}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, med_name: e.target.value }))}
                  className="p-2 w-full border rounded focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                <input
                  type="text"
                  value={updateForm.manufacturer}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, manufacturer: e.target.value }))}
                  className="p-2 w-full border rounded focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Effectiveness</label>
                <select
                  value={updateForm.effectiveness}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, effectiveness: e.target.value }))}
                  className="p-2 w-full border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dosage Form</label>
                <select
                  value={updateForm.dosage_form}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, dosage_form: e.target.value }))}
                  className="p-2 w-full border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="tablet">Tablet</option>
                  <option value="capsule">Capsule</option>
                  <option value="syrup">Syrup</option>
                  <option value="injection">Injection</option>
                  <option value="cream">Cream</option>
                  <option value="ointment">Ointment</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          )}
          
          {/* Inventory fields in grid */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
              <input
                type="text"
                value={updateForm.batch_no}
                onChange={(e) => setUpdateForm(prev => ({ ...prev, batch_no: e.target.value }))}
                className="p-2 w-full border rounded focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                value={updateForm.quantity}
                onChange={(e) => setUpdateForm(prev => ({ ...prev, quantity: e.target.value }))}
                className="p-2 w-full border rounded focus:ring-2 focus:ring-blue-500"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturing Date</label>
              <input
                type="date"
                value={updateForm.manufacturing_date}
                onChange={(e) => setUpdateForm(prev => ({ ...prev, manufacturing_date: e.target.value }))}
                className="p-2 w-full border rounded focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <input
                type="date"
                value={updateForm.expiry_date}
                onChange={(e) => setUpdateForm(prev => ({ ...prev, expiry_date: e.target.value }))}
                className="p-2 w-full border rounded focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
              <input
                type="number"
                value={updateForm.unit_price}
                onChange={(e) => setUpdateForm(prev => ({ ...prev, unit_price: e.target.value }))}
                className="p-2 w-full border rounded focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
              <input
                type="text"
                value={updateForm.supplier}
                onChange={(e) => setUpdateForm(prev => ({ ...prev, supplier: e.target.value }))}
                className="p-2 w-full border rounded focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-medium mt-6"
          >
            {modalMode === 'update' ? 'Update Medicine' : 'Add Medicine'}
          </button>
        </div>
      </div>
    </div>
  );

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
  
          {/* Admin: Add Medicine */}
          {role === 'admin' && inventoryType === 'medicine' && (
            <button
              onClick={() => handleModalOpen('add')}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center gap-2"
            >
              <Plus size={20} />
              Add Medicine
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
        <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
      </div>
  
      {/* Loading and Error States */}
      {loading && (
        <div className="text-center py-4">
          <p>Loading inventory...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-4 text-red-500">
          <p>{error}</p>
        </div>
      )}

      {/* Tables with updated data mapping */}
      {!loading && !error && (
        <>
          {inventoryType === 'medicine' ? (
            <div className="overflow-x-auto">
              <table className="w-3/4 mx-auto border-separate border-spacing-y-2">
                <thead>
                  {medicineColumns}
                </thead>
                <tbody>
                  {inventory.map(medicineRow)}
                </tbody>
              </table>
            </div>
          ) : (
            // Equipment table with similar updates
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
                  {inventory.map(equipmentRow)}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {paginationControls}
        </>
      )}

      {/* Update Quantity Modal */}
      {showUpdateModal && renderModal()}
    </div>
  );
};

export default Inventory;