import React, { useState, useEffect, useRef } from 'react';
import { Pencil } from 'lucide-react';

// Mock data function
const fetchEmployeeDetails = () => {
  // In a real app, this would be an API call
  return {
    name: "John Doe",
    email: "john@example.com",
    employee_id: "220101008",
    phone: "123-456-7890",
    department: "xyz",
    specialization: "cardiology",
    profile_pic: ""
  };
};

const PharmacistPage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const employeeData = fetchEmployeeDetails();
      setUserData(employeeData);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleProfilePicChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const previewURL = URL.createObjectURL(file);
    setPreviewImage(previewURL);

    const formData = new FormData();
    formData.append("profile_pic", file);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // In a real app, you would update the server here
      // and get back the new profile pic URL
      
      setUserData((prevData) => ({ ...prevData, profile_pic: previewURL }));
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }
  };

  const handleEditClick = () => {
    fileInputRef.current.click();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 p-6 md:p-10">
        {/* Header */}
        <div className="flex justify-between items-center bg-gray-800 text-white p-4 rounded-lg">
          <h1 className="text-xl font-semibold">Pharmacist's Profile</h1>
        </div>

        {/* Profile section */}
        <div className="mt-10 flex flex-col md:flex-row items-start gap-10">
          {/* Profile Photo */}
          <div className="relative w-48 h-64 border border-gray-300 flex items-center justify-center bg-white shadow-md overflow-hidden rounded-lg">
            {previewImage ? (
              <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
            ) : userData?.profile_pic ? (
              <img src={userData.profile_pic} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-semibold">Profile Photo</span>
            )}
            <button
              onClick={handleEditClick}
              className="absolute bottom-2 right-2 bg-gray-800 text-white p-2 rounded-full shadow-md hover:bg-gray-700"
            >
              <Pencil size={18} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleProfilePicChange}
            />
          </div>

          {/* Profile Fields */}
          <div className="flex-1 w-full space-y-4">
            {userData && Object.entries(userData).map(([key, value]) =>
              key !== "profile_pic" ? (
                <div key={key} className="flex items-center gap-4">
                  {/* Label */}
                  <div className="bg-gray-300 w-1/4 p-3 rounded text-right font-semibold capitalize text-gray-700 flex items-center justify-end h-14">
                    {key.replace(/_/g, " ")}:
                  </div>

                  {/* Value */}
                  <div className="bg-gray-300 flex-1 p-3 rounded text-lg text-gray-800 flex items-center h-14">
                    {Array.isArray(value) ? value.join(", ") : value}
                  </div>
                </div>
              ) : null
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacistPage;