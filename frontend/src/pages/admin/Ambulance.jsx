


import React, { useState, useEffect } from 'react';
import axios from 'axios';
const ManageAmbulance = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filteredAmbulances, setFilteredAmbulances] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const [newAmbulance, setNewAmbulance] = useState({
    vehicle_number: '',
    driver: '',
    nurse_id: '',
    status: 'active'
  });


  const [ambulances, setAmbulances] = useState([]);


  useEffect(() => {
    const fetchAmbulances = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/facility/ambulances`);
        for (let i = 0; i < response.data.length; i++) {
          const ambulance = response.data[i];
          ambulance.driver = ambulance.driver.employee_id;
          ambulance.id = `AMB${String(i + 1).padStart(3, '0')}`; // Generate ID
        }
        setAmbulances(response.data);
        setFilteredAmbulances(response.data);
        console.log('Fetched ambulances:', response.data);
      } catch (error) {
        console.error('Error fetching ambulances:', error);
      }

    };

    fetchAmbulances();
  }, []);


  // Filter ambulances as user types in search bar
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredAmbulances(ambulances);
      setNoResults(false);
    } else {
      const filtered = ambulances.filter(amb =>
        amb.vehicle_number.toLowerCase().startsWith(searchQuery.toLowerCase())
      );
      setFilteredAmbulances(filtered);
      setNoResults(filtered.length === 0);
    }
  }, [searchQuery, ambulances]);

  const handleAddAmbulance = () => {
    setShowAddForm(true);
    setSelectedAmbulance(null);
  };

  const handleAddFormSubmit = (e) => {
    e.preventDefault();

    // Create a new ambulance with generated ID
    const newId = `AMB${String(ambulances.length + 1).padStart(3, '0')}`;
    const ambulanceToAdd = {
      id: newId,
      ...newAmbulance
    };

    //call API to add ambulance
    axios.post(`${import.meta.env.VITE_API_URL}/facility/ambulance`, ambulanceToAdd).then((response) => {
      // Add to the list
      const updatedAmbulances = [...ambulances, ambulanceToAdd];
      setAmbulances(updatedAmbulances);
      // Reset form and hide it
      setNewAmbulance({
        vehicle_number: '',
        driver: '',
        nurse_id: '',
        status: 'active'
      });
      setShowAddForm(false);
    }
    ).catch((error) => {
      console.error('Error adding ambulance:', error.response.data.message);
      alert('Error adding ambulance: ' + error.response.data.message);
      return;
    });


  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewAmbulance(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setNewAmbulance({
      vehicle_number: '',
      driver: '',
      nurse_id: '',
      status: 'active'
    });
  };

  const handleMakeActive = () => {
    if (selectedAmbulance) {
      // Update selected ambulance status
      const updatedAmbulances = ambulances.map(amb =>
        amb.id === selectedAmbulance.id ? { ...amb, status: 'active' } : amb
      );
      setAmbulances(updatedAmbulances);
      setSelectedAmbulance({ ...selectedAmbulance, status: 'active' });
    }
  };

  const handleMakeInactive = () => {
    if (selectedAmbulance) {
      // Update selected ambulance status
      const updatedAmbulances = ambulances.map(amb =>
        amb.id === selectedAmbulance.id ? { ...amb, status: 'inactive' } : amb
      );
      setAmbulances(updatedAmbulances);
      setSelectedAmbulance({ ...selectedAmbulance, status: 'inactive' });
    }
  };

  const handleDecommission = () => {
    if (selectedAmbulance) {
      const updatedAmbulances = ambulances.filter(amb => amb.id !== selectedAmbulance.id);

      // Call API to decommission the ambulance
      axios.delete(`${import.meta.env.VITE_API_URL}/facility/ambulance/decommission`,
        {
          data: {
            vehicle_number: selectedAmbulance.vehicle_number
          }
        }
      )
        .then(() => {
          setAmbulances(updatedAmbulances);
          setSelectedAmbulance(null);
          alert('Ambulance decommissioned successfully.');
        })
        .catch(error => {
          console.error('Error decommissioning ambulance:', error.response?.data?.message || error.message);
          alert('Error decommissioning ambulance: ' + (error.response?.data?.message || error.message));
        });
    }
  }

  // Toggle ambulance status directly from the list
  const handleToggleStatus = (e, ambulanceId) => {
    e.stopPropagation(); // Prevent selecting the ambulance

    const ambulanceToUpdate = ambulances.find(amb => amb.id === ambulanceId);
    const newStatus = ambulanceToUpdate.status === 'active' ? 'inactive' : 'active';

    // Update the ambulance status
    const updatedAmbulances = ambulances.map(amb =>
      amb.id === ambulanceId ? { ...amb, status: newStatus } : amb
    );

    setAmbulances(updatedAmbulances);

    // If this was the selected ambulance, update that too
    if (selectedAmbulance && selectedAmbulance.id === ambulanceId) {
      setSelectedAmbulance({ ...selectedAmbulance, status: newStatus });
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Manage Ambulance</h2>

      <div className="max-w-3xl mx-auto">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="bg-gray-200 p-3 flex items-center justify-center">
            <input
              type="text"
              placeholder="Search for Ambulance by Vehicle Number"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-lg px-4 py-2 border border-gray-300 rounded text-center"
            />
            <button
              className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => setSearchQuery('')}
              disabled={!searchQuery}
            >
              Clear
            </button>
          </div>

          {/* No Results Message */}
          {noResults && (
            <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 p-2 mt-2 rounded-md text-center text-sm">
              No such ambulance found
            </div>
          )}
        </div>

        {/* Table Header */}
        <div className="bg-gray-300 p-3 mb-4">
          <div className="grid grid-cols-5 gap-4">
            <div className="font-medium text-center">Ambulance ID</div>
            <div className="font-medium text-center">Vehicle Number</div>
            <div className="font-medium text-center">Driver ID</div>
            <div className="font-medium text-center">Nurse ID</div>
            <div className="font-medium text-center">Status</div>
          </div>
        </div>

        {/* Selected Ambulance Details */}
        {selectedAmbulance && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Selected Ambulance</h3>
            <div className="bg-white border p-4 rounded-md">
              <div className="grid grid-cols-5 gap-4">
                <div className="text-center">{selectedAmbulance.id}</div>
                <div className="text-center">{selectedAmbulance.vehicle_number}</div>
                <div className="text-center">{selectedAmbulance.driver}</div>
                <div className="text-center">{selectedAmbulance.nurse_id}</div>
                <div className="text-center">{selectedAmbulance.status}</div>
              </div>
              <div className="mt-4 flex justify-center space-x-4">
                <button
                  onClick={handleMakeActive}
                  disabled={selectedAmbulance.status === 'active'}
                  className={`bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm ${selectedAmbulance.status === 'active' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                  Make Active
                </button>
                <button
                  onClick={handleMakeInactive}
                  disabled={selectedAmbulance.status === 'inactive'}
                  className={`bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm ${selectedAmbulance.status === 'inactive' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                  Make Inactive
                </button>
                <button
                  onClick={handleDecommission}
                  className={`bg-red-900 hover:bg-red-950 text-white px-3 py-1 rounded text-sm `}
                >
                  Decommission
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Ambulance Form */}
        {showAddForm && (
          <div className="mb-8 bg-gray-100 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Add New Ambulance</h3>
            <form onSubmit={handleAddFormSubmit}>
              <div className="grid grid-cols-1 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Number
                  </label>
                  <input
                    type="text"
                    name="vehicle_number"
                    value={newAmbulance.vehicle_number}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Driver ID
                  </label>
                  <input
                    type="text"
                    name="driver"
                    value={newAmbulance.driver}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nurse ID
                  </label>
                  <input
                    type="text"
                    name="nurse_id"
                    value={newAmbulance.nurse_id}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={newAmbulance.status}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancelAdd}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded"
                >
                  Save Ambulance
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Ambulances List */}
        {!showAddForm && (
          <div className="mb-6">
            <div className="space-y-2">
              {filteredAmbulances.map(ambulance => (
                <div
                  key={ambulance.id}
                  className={`bg-white border p-3 rounded grid grid-cols-5 gap-4 hover:bg-gray-50 cursor-pointer ${selectedAmbulance && selectedAmbulance.id === ambulance.id ? 'bg-blue-50 border-blue-300' : ''
                    }`}
                  onClick={() => setSelectedAmbulance(ambulance)}
                >
                  <div className="text-center">{ambulance.id}</div>
                  <div className="text-center">{ambulance.vehicle_number}</div>
                  <div className="text-center">{ambulance.driver}</div>
                  <div className="text-center">{ambulance.nurse_id}</div>
                  <div className="text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer hover:opacity-80 ${ambulance.status === 'active'
                          ? 'bg-green-100 text-green-800 hover:bg-red-100 hover:text-red-800'
                          : 'bg-red-100 text-red-800 hover:bg-green-100 hover:text-green-800'
                        }`}
                      onClick={(e) => handleToggleStatus(e, ambulance.id)}
                      title={`Click to ${ambulance.status === 'active' ? 'deactivate' : 'activate'}`}
                    >
                      {ambulance.status}
                      <span className="ml-1 text-xs">
                        {ambulance.status === 'active' ? '▼' : '▲'}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Ambulance Button - Moved to bottom */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleAddAmbulance}
                className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded"
              >
                Add Ambulance
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageAmbulance;