import React, { useState, useEffect } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaPills, FaChartLine, FaCalendarAlt, FaClipboardList } from "react-icons/fa";
import axios from 'axios';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MedicineTrends = () => {
  // Common state variables
  const [activeTab, setActiveTab] = useState("inventory"); // "inventory" or "prescription"
  const [loading, setLoading] = useState(false);
  const [medicines, setMedicines] = useState([]);

  // Inventory Analysis states
  const [selectedMedicineInventory, setSelectedMedicineInventory] = useState("");
  const [inventoryStartDate, setInventoryStartDate] = useState(new Date(new Date().getFullYear(), 0, 1)); // Jan 1st of current year
  const [inventoryEndDate, setInventoryEndDate] = useState(new Date());
  const [inventoryData, setInventoryData] = useState(null);
  const [inventoryView, setInventoryView] = useState("monthly");
  const [selectedInventoryMonth, setSelectedInventoryMonth] = useState(null);

  // Prescription Analysis states
  const [selectedMedicinePrescription, setSelectedMedicinePrescription] = useState("");
  const [prescriptionStartDate, setPrescriptionStartDate] = useState(new Date(new Date().getFullYear(), 0, 1)); // Jan 1st of current year
  const [prescriptionEndDate, setPrescriptionEndDate] = useState(new Date());
  const [prescriptionData, setPrescriptionData] = useState(null);
  const [prescriptionView, setPrescriptionView] = useState("monthly");
  const [selectedPrescriptionMonth, setSelectedPrescriptionMonth] = useState(null);

  // Fetch medicines list from backend on component mount
  useEffect(() => {
    fetchMedicines();
  }, []);

  // Set initial selected medicine when list loads
  useEffect(() => {
    if (medicines.length > 0) {
      setSelectedMedicineInventory(medicines[0].id);
      setSelectedMedicinePrescription(medicines[0].id);
    }
  }, [medicines]);

  // Fetch inventory data when parameters change
  useEffect(() => {
    if (selectedMedicineInventory) {
      fetchMedicineInventoryData();
    }
  }, [selectedMedicineInventory, inventoryStartDate, inventoryEndDate]);

  // Fetch prescription data when parameters change
  useEffect(() => {
    if (selectedMedicinePrescription) {
      fetchMedicinePrescriptionData();
    }
  }, [selectedMedicinePrescription, prescriptionStartDate, prescriptionEndDate]);


  // Update fetchMedicines function in your React component
  const fetchMedicines = async () => {
    try {
      setLoading(true);

      // Make API call to fetch medicines
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/analytics/medicines`);

      // Set medicines state with response data
      setMedicines(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching medicines:", error);
      setLoading(false);
    }
  };

  // Fetch medicine inventory data
  const fetchMedicineInventoryData = async () => {
    try {
      setLoading(true);

      // Prepare request data
      const requestData = {
        medicineId: selectedMedicineInventory,
        startDate: inventoryStartDate.toISOString(),
        endDate: inventoryEndDate.toISOString()
      };

      // Make API call to backend
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/analytics/medicine-trends`,
        requestData
      );

      // Update state with the response data
      setInventoryData(response.data);
      setSelectedInventoryMonth(null);
      setInventoryView("monthly");
      setLoading(false);
    } catch (error) {
      console.error("Error fetching medicine inventory data:", error);
      setLoading(false);
    }
  };

  // Fetch medicine prescription data
  const fetchMedicinePrescriptionData = async () => {
    try {
      setLoading(true);

      // Prepare request data
      const requestData = {
        medicineId: selectedMedicinePrescription,
        startDate: prescriptionStartDate.toISOString(),
        endDate: prescriptionEndDate.toISOString()
      };

      // Make API call to backend
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/analytics/medicine-prescription-trends`,
        requestData
      );

      // Update state with the response data
      setPrescriptionData(response.data);
      setSelectedPrescriptionMonth(null);
      setPrescriptionView("monthly");
      setLoading(false);
    } catch (error) {
      console.error("Error fetching medicine prescription data:", error);
      setLoading(false);
    }
  };

  // Handle bar click to show weekly trend for inventory
  const handleInventoryBarClick = (_, elements) => {
    if (elements && elements.length > 0) {
      const monthIndex = elements[0].index;
      const monthName = inventoryData.monthlyData.labels[monthIndex];
      setSelectedInventoryMonth(monthName);
      setInventoryView("weekly");
    }
  };

  // Handle bar click to show weekly trend for prescriptions
  const handlePrescriptionBarClick = (_, elements) => {
    if (elements && elements.length > 0) {
      const monthIndex = elements[0].index;
      const monthName = prescriptionData.monthlyData.labels[monthIndex];
      setSelectedPrescriptionMonth(monthName);
      setPrescriptionView("weekly");
    }
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        padding: 10,
        cornerRadius: 6,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
    },
  };

  // Prepare inventory monthly chart data
  const inventoryMonthlyChartData = {
    labels: inventoryData?.monthlyData.labels || [],
    datasets: [
      {
        label: `${inventoryData?.medicine?.name || 'Medicine'} Orders (Monthly)`,
        data: inventoryData?.monthlyData.values || [],
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 2,
      },
    ],
  };

  // Prepare inventory weekly chart data
  const inventoryWeeklyChartData = selectedInventoryMonth ? {
    labels: inventoryData?.weeklyDataByMonth[selectedInventoryMonth]?.labels || [],
    datasets: [
      {
        label: `${inventoryData?.medicine?.name || 'Medicine'} Orders (${selectedInventoryMonth})`,
        data: inventoryData?.weeklyDataByMonth[selectedInventoryMonth]?.values || [],
        backgroundColor: "rgba(139, 92, 246, 0.5)",
        borderColor: "rgba(139, 92, 246, 1)",
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  } : null;

  // Prepare prescription monthly chart data
  const prescriptionMonthlyChartData = {
    labels: prescriptionData?.monthlyData.labels || [],
    datasets: [
      {
        label: `${prescriptionData?.medicine?.name || 'Medicine'} Prescriptions (Monthly)`,
        data: prescriptionData?.monthlyData.values || [],
        backgroundColor: "rgba(16, 185, 129, 0.5)",
        borderColor: "rgba(16, 185, 129, 1)",
        borderWidth: 2,
      },
    ],
  };

  // Prepare prescription weekly chart data
  const prescriptionWeeklyChartData = selectedPrescriptionMonth ? {
    labels: prescriptionData?.weeklyDataByMonth[selectedPrescriptionMonth]?.labels || [],
    datasets: [
      {
        label: `${prescriptionData?.medicine?.name || 'Medicine'} Prescriptions (${selectedPrescriptionMonth})`,
        data: prescriptionData?.weeklyDataByMonth[selectedPrescriptionMonth]?.values || [],
        backgroundColor: "rgba(251, 191, 36, 0.5)",
        borderColor: "rgba(251, 191, 36, 1)",
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  } : null;

  // Loader component
  const Loader = () => (
    <div className="flex items-center justify-center h-40">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="flex flex-col w-full p-6 bg-gray-50 min-h-screen">
      <h1 className="flex items-center text-3xl font-bold text-gray-800 mb-6">
        <FaPills className="mr-3 text-blue-500" />
        Medicine Trends Analysis
      </h1>

      {/* Main tabs */}
      <div className="border-b border-gray-200 mb-6">
        <ul className="flex -mb-px">
          <li className="mr-1">
            <button
              className={`inline-block py-2 px-4 text-lg ${activeTab === "inventory"
                  ? "text-blue-600 border-b-2 border-blue-600 font-medium"
                  : "text-gray-500 hover:text-gray-700"
                }`}
              onClick={() => setActiveTab("inventory")}
            >
              Medicine Inventory Analysis
            </button>
          </li>
          <li className="mr-1">
            <button
              className={`inline-block py-2 px-4 text-lg ${activeTab === "prescription"
                  ? "text-blue-600 border-b-2 border-blue-600 font-medium"
                  : "text-gray-500 hover:text-gray-700"
                }`}
              onClick={() => setActiveTab("prescription")}
            >
              Medicine Prescription Analysis
            </button>
          </li>
        </ul>
      </div>

      {/* Medicine Inventory Analysis */}
      {activeTab === "inventory" && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 pb-17">
          <h2 className="flex items-center text-xl font-semibold text-gray-700 mb-6">
            <FaChartLine className="mr-2 text-blue-500" />
            Medicine Inventory Trend Analysis
          </h2>

          <div className="flex flex-wrap gap-4 mb-6">
            {/* Medicine selector */}
            <div className="flex flex-col flex-grow max-w-xs">
              <label className="text-sm text-gray-600 mb-1 flex items-center">
                <FaPills className="mr-1 text-blue-500" />
                Select Medicine:
              </label>
              <div className="relative">
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={selectedMedicineInventory}
                  onChange={(e) => setSelectedMedicineInventory(e.target.value)}
                  disabled={loading || medicines.length === 0}
                >
                  {medicines.map(medicine => (
                    <option key={medicine.id} value={medicine.id}>
                      {medicine.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Date range selector */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1 flex items-center">
                <FaCalendarAlt className="mr-1 text-blue-500" />
                Start Date:
              </label>
              <DatePicker
                selected={inventoryStartDate}
                onChange={date => setInventoryStartDate(date)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                dateFormat="MMMM d, yyyy"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1 flex items-center">
                <FaCalendarAlt className="mr-1 text-blue-500" />
                End Date:
              </label>
              <DatePicker
                selected={inventoryEndDate}
                onChange={date => setInventoryEndDate(date)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                dateFormat="MMMM d, yyyy"
                minDate={inventoryStartDate}
              />
            </div>
          </div>

          {/* Trend tabs */}
          <div className="border-b border-gray-200 mb-4">
            <ul className="flex -mb-px">
              <li className="mr-1">
                <button
                  className={`inline-block py-2 px-4 ${inventoryView === "monthly"
                      ? "text-blue-600 border-b-2 border-blue-600 font-medium"
                      : "text-gray-500 hover:text-gray-700"
                    }`}
                  onClick={() => setInventoryView("monthly")}
                >
                  Monthly Trend
                </button>
              </li>
              <li className="mr-1">
                <button
                  className={`inline-block py-2 px-4 ${inventoryView === "weekly"
                      ? "text-blue-600 border-b-2 border-blue-600 font-medium"
                      : "text-gray-500 hover:text-gray-700"
                    }`}
                  onClick={() => setInventoryView("weekly")}
                  disabled={!selectedInventoryMonth}
                >
                  Weekly Trend {selectedInventoryMonth ? `(${selectedInventoryMonth})` : ""}
                </button>
              </li>
            </ul>
          </div>

          {/* Inventory info card */}
          {!loading && inventoryData && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-100">
              <div className="flex items-center">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {inventoryData.medicine.name}
                  </h3>
                  <p className="text-gray-600">
                    Total of <span className="font-bold text-blue-600">{inventoryData.totalOrders}</span> units ordered between{" "}
                    {inventoryStartDate.toLocaleDateString()} and {inventoryEndDate.toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Charts */}
          <div className="h-80">
            {loading ? (
              <Loader />
            ) : (
              <>
                {inventoryView === "monthly" ? (
                  <>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Monthly Inventory Orders</h3>
                    <p className="text-sm text-gray-500 mb-2">Click on a bar to see weekly breakdown</p>
                    <Bar
                      data={inventoryMonthlyChartData}
                      options={{
                        ...chartOptions,
                        onClick: handleInventoryBarClick
                      }}
                    />
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-medium text-gray-700">Weekly Inventory Orders</h3>
                      <button
                        className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-2 rounded"
                        onClick={() => setInventoryView("monthly")}
                      >
                        Back to Monthly View
                      </button>
                    </div>
                    {inventoryWeeklyChartData ? (
                      <Line data={inventoryWeeklyChartData} options={chartOptions} />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        Select a month from the bar chart to view weekly data
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Medicine Prescription Analysis */}
      {activeTab === "prescription" && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 pb-17">
          <h2 className="flex items-center text-xl font-semibold text-gray-700 mb-6">
            <FaClipboardList className="mr-2 text-green-500" />
            Medicine Prescription Trend Analysis
          </h2>

          <div className="flex flex-wrap gap-4 mb-6">
            {/* Medicine selector */}
            <div className="flex flex-col flex-grow max-w-xs">
              <label className="text-sm text-gray-600 mb-1 flex items-center">
                <FaPills className="mr-1 text-green-500" />
                Select Medicine:
              </label>
              <div className="relative">
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                  value={selectedMedicinePrescription}
                  onChange={(e) => setSelectedMedicinePrescription(e.target.value)}
                  disabled={loading || medicines.length === 0}
                >
                  {medicines.map(medicine => (
                    <option key={medicine.id} value={medicine.id}>
                      {medicine.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Date range selector */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1 flex items-center">
                <FaCalendarAlt className="mr-1 text-green-500" />
                Start Date:
              </label>
              <DatePicker
                selected={prescriptionStartDate}
                onChange={date => setPrescriptionStartDate(date)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                dateFormat="MMMM d, yyyy"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1 flex items-center">
                <FaCalendarAlt className="mr-1 text-green-500" />
                End Date:
              </label>
              <DatePicker
                selected={prescriptionEndDate}
                onChange={date => setPrescriptionEndDate(date)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                dateFormat="MMMM d, yyyy"
                minDate={prescriptionStartDate}
              />
            </div>
          </div>

          {/* Trend tabs */}
          <div className="border-b border-gray-200 mb-4">
            <ul className="flex -mb-px">
              <li className="mr-1">
                <button
                  className={`inline-block py-2 px-4 ${prescriptionView === "monthly"
                      ? "text-green-600 border-b-2 border-green-600 font-medium"
                      : "text-gray-500 hover:text-gray-700"
                    }`}
                  onClick={() => setPrescriptionView("monthly")}
                >
                  Monthly Trend
                </button>
              </li>
              <li className="mr-1">
                <button
                  className={`inline-block py-2 px-4 ${prescriptionView === "weekly"
                      ? "text-green-600 border-b-2 border-green-600 font-medium"
                      : "text-gray-500 hover:text-gray-700"
                    }`}
                  onClick={() => setPrescriptionView("weekly")}
                  disabled={!selectedPrescriptionMonth}
                >
                  Weekly Trend {selectedPrescriptionMonth ? `(${selectedPrescriptionMonth})` : ""}
                </button>
              </li>
            </ul>
          </div>

          {/* Prescription info card */}
          {!loading && prescriptionData && (
            <div className="bg-green-50 rounded-lg p-4 mb-6 border border-green-100">
              <div className="flex items-center">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {prescriptionData.medicine.name}
                  </h3>
                  <p className="text-gray-600">
                    Total of <span className="font-bold text-green-600">{prescriptionData.totalPrescriptionsQuantity}</span> units prescribed between{" "}
                    {prescriptionStartDate.toLocaleDateString()} and {prescriptionEndDate.toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Charts */}
          <div className="h-80">
            {loading ? (
              <Loader />
            ) : (
              <>
                {prescriptionView === "monthly" ? (
                  <>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Monthly Prescription Quantities</h3>
                    <p className="text-sm text-gray-500 mb-2">Click on a bar to see weekly breakdown</p>
                    <Bar
                      data={prescriptionMonthlyChartData}
                      options={{
                        ...chartOptions,
                        onClick: handlePrescriptionBarClick
                      }}
                    />
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-medium text-gray-700">Weekly Prescription Quantities</h3>
                      <button
                        className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-2 rounded"
                        onClick={() => setPrescriptionView("monthly")}
                      >
                        Back to Monthly View
                      </button>
                    </div>
                    {prescriptionWeeklyChartData ? (
                      <Line data={prescriptionWeeklyChartData} options={chartOptions} />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        Select a month from the bar chart to view weekly data
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineTrends;
