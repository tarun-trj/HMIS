import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Pencil } from "lucide-react";

const ProfileDashboard = () => {
  const { role } = useParams();
  const [userData, setUserData] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);
  
  // List of authorized roles
  const authorizedRoles = ["doctor", "receptionist", "nurse", "pathologist"];
  
  // Get current user role from localStorage or context
  const currentUserRole = role || localStorage.getItem("userRole") || "";

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
       
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulating API delay

        // Mock data for demonstration - would be replaced with actual API response
        const mockData = {
          name: "Dr. John Doe",
          role: "Doctor",
          employee_id: "1",
          email: "john.doe@example.com",
          phone: "+1 (555) 123-4567",
          address: "123 Main St, City, Country",
          gender: "Male",
          date_of_birth: "1980-01-15",
          department_id: "101",
          date_of_joining: "2020-05-01",
          salary: "$120,000",
          bank_details_id: "5001",
          payroll_id: "9001"
        };

        setUserData(mockData);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleProfilePicChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const previewURL = URL.createObjectURL(file);
    setPreviewImage(previewURL);

    const formData = new FormData();
    formData.append("profile_pic", file);

    try {
      
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulating API delay
      setUserData((prevData) => ({ ...prevData, profile_pic: previewURL }));
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }
  };

  const handleEditClick = () => {
    fileInputRef.current.click();
  };

  // Structure data for display
  const personalInfo = userData ? [
    { key: "Employee ID", value: userData.employee_id },
    { key: "Email", value: userData.email },
    { key: "Phone", value: userData.phone },
    { key: "Address", value: userData.address },
    { key: "Gender", value: userData.gender },
    { key: "Date of Birth", value: userData.date_of_birth }
  ] : [];

  const employmentDetails = userData ? [
    { key: "Department ID", value: userData.department_id },
    { key: "Date of Joining", value: userData.date_of_joining },
    { key: "Salary", value: userData.salary },
    { key: "Bank Details ID", value: userData.bank_details_id },
    { key: "Payroll ID", value: userData.payroll_id }
  ] : [];

  return (
    <div className="flex-1 bg-gray-100 min-h-screen">
      {/* Main content area - expanded to fill available space */}
      <div className="p-4 h-full">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : userData ? (
          <div className="bg-white rounded shadow h-full">
            {/* Profile Header with Blue Bar */}
            <div className="bg-blue-500 h-32 rounded-t relative">
              {/* Circle for profile pic */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                <div 
                  className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white overflow-hidden cursor-pointer"
                  onClick={handleEditClick}
                >
                  {previewImage ? (
                    <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Pencil size={16} className="text-blue-500" />
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePicChange}
                  />
                </div>
              </div>
            </div>

            {/* Name and Title */}
            <div className="text-center mt-16 mb-8">
              <h2 className="text-2xl font-bold">{userData.name}</h2>
              <p className="text-gray-500">{userData.role}</p>
            </div>

            {/* Information Sections - expanded to fill more space */}
            <div className="px-8 pb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div>
                  <h3 className="text-blue-500 text-lg pb-2 mb-6 border-b">
                    Personal Information
                  </h3>
                  <div className="space-y-4">
                    {personalInfo.map((item, index) => (
                      <div key={index} className="flex">
                        <div className="font-medium w-36">{item.key}:</div>
                        <div>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Employment Details */}
                <div>
                  <h3 className="text-blue-500 text-lg pb-2 mb-6 border-b">
                    Employment Details
                  </h3>
                  <div className="space-y-4">
                    {employmentDetails.map((item, index) => (
                      <div key={index} className="flex">
                        <div className="font-medium w-36">{item.key}:</div>
                        <div>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-red-500">
            No profile data available
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileDashboard;