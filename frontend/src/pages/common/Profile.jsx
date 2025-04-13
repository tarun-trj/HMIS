import { useParams, Navigate } from "react-router-dom";
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
        await new Promise((resolve) => setTimeout(resolve, 500));

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

    // Only fetch data if the user has an authorized role
    if (authorizedRoles.includes(currentUserRole.toLowerCase())) {
      fetchUserData();
    }
  }, [currentUserRole]);

  const handleProfilePicChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const previewURL = URL.createObjectURL(file);
    setPreviewImage(previewURL);

    const formData = new FormData();
    formData.append("profile_pic", file);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setUserData((prevData) => ({ ...prevData, profile_pic: previewURL }));
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }
  };

  const handleEditClick = () => {
    fileInputRef.current.click();
  };

  // // Check if user has access
  // if (!authorizedRoles.includes(currentUserRole.toLowerCase())) {
  //   return <Navigate to="/unauthorized" replace />;
  // }

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
    <div className="bg-gray-100 h-full">
      <div className="mx-auto p-4">
        {/* Main content title */}
        <div className="text-center my-4">
          {/* <h1 className="text-2xl font-bold">{ role }'s profile</h1> */}
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto bg-white rounded shadow">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : userData ? (
            <div>
              {/* Profile Header with Blue Bar */}
              <div className="bg-blue-500 text-white p-6 rounded-t flex justify-center items-center">
                {/* <div className="text-xl font-bold">{ role }'s profile</div> */}
              </div>

              {/* Profile Photo */}
              <div className="relative flex justify-center -mt-12">
                <div 
                  className="w-24 h-24 rounded-full bg-white flex items-center justify-center border-4 border-white overflow-hidden cursor-pointer"
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

              {/* Name and Title */}
              <div className="text-center mt-2 mb-6">
                <h2 className="text-xl font-bold">{userData.name}</h2>
                <p className="text-gray-500">{userData.role}</p>
              </div>

              {/* Information Sections */}
              <div className="px-8 pb-8">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Personal Information */}
                  <div className="flex-1">
                    <h3 className="text-blue-500 text-lg font-medium border-b border-blue-500 pb-2 mb-4">
                      Personal Information
                    </h3>
                    <div className="space-y-3">
                      {personalInfo.map((item) => (
                        <div key={item.key} className="flex">
                          <div className="font-medium w-32">{item.key}:</div>
                          <div>{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Employment Details */}
                  <div className="flex-1">
                    <h3 className="text-blue-500 text-lg font-medium border-b border-blue-500 pb-2 mb-4">
                      Employment Details
                    </h3>
                    <div className="space-y-3">
                      {employmentDetails.map((item) => (
                        <div key={item.key} className="flex">
                          <div className="font-medium w-32">{item.key}:</div>
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
    </div>
  );
};

export default ProfileDashboard;
