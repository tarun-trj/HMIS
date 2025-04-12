import React, { useState, useEffect, useRef } from 'react';
import { Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js';
import { FaFilter, FaHospital, FaUserMd, FaBuilding, FaChartLine } from 'react-icons/fa';
import { BiLineChart } from 'react-icons/bi';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

const BedOccupancyTrends = () => {
  // State variables
  const [activeTab, setActiveTab] = useState('doctor'); // 'doctor' or 'department'
  
  // Doctor view states
  const [doctorData, setDoctorData] = useState([]);
  const [filteredDoctorData, setFilteredDoctorData] = useState([]);
  const [doctorNameFilter, setDoctorNameFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [doctorQuadrantData, setDoctorQuadrantData] = useState({
    topRight: [],
    topLeft: [],
    bottomRight: [],
    bottomLeft: []
  });
  
  // Department view states
  const [departmentData, setDepartmentData] = useState([]);
  const [filteredDepartmentData, setFilteredDepartmentData] = useState([]);
  const [departmentNameFilter, setDepartmentNameFilter] = useState('');
  const [departmentQuadrantData, setDepartmentQuadrantData] = useState({
    topRight: [],
    topLeft: [],
    bottomRight: [],
    bottomLeft: []
  });
  
  // Common states
  const [loading, setLoading] = useState(true);
  const [xAxisDivider, setXAxisDivider] = useState(3); // Default rating divider
  const [yAxisDivider, setYAxisDivider] = useState(2); // Default consultation count divider
  
  // Refs for interactive dividers
  const chartRef = useRef(null);
  const isDraggingX = useRef(false);
  const isDraggingY = useRef(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchDoctorPerformanceData();
  }, []);

  // Update filtered doctor data when filters change
  useEffect(() => {
    filterDoctorData();
  }, [doctorData, doctorNameFilter, departmentFilter]);

  // Update filtered department data when filters change
  useEffect(() => {
    filterDepartmentData();
  }, [departmentData, departmentNameFilter]);

  // Update quadrant data when filtered data or dividers change
  useEffect(() => {
    if (activeTab === 'doctor') {
      categorizeDoctorsByQuadrant();
    } else {
      categorizeDepartmentsByQuadrant();
    }
  }, [filteredDoctorData, filteredDepartmentData, xAxisDivider, yAxisDivider, activeTab]);

  // Fetch doctor performance data
  const fetchDoctorPerformanceData = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would be an API call
      // const response = await fetch('/api/doctor-performance');
      // const data = await response.json();
      
      // Simulated data based on the database schema
      setTimeout(() => {
        const docData = generateMockDoctorData();
        setDoctorData(docData);
        setFilteredDoctorData(docData);
        
        // Generate department data by aggregating doctor data
        const deptData = generateDepartmentData(docData);
        setDepartmentData(deptData);
        setFilteredDepartmentData(deptData);
        
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error fetching doctor performance data:', error);
      setLoading(false);
    }
  };

  // Generate department data by aggregating doctor data
  const generateDepartmentData = (doctorData) => {
    const departments = {};
    
    doctorData.forEach(doctor => {
      if (!departments[doctor.departmentId]) {
        departments[doctor.departmentId] = {
          departmentId: doctor.departmentId,
          departmentName: doctor.departmentName,
          totalRating: 0,
          totalConsultations: 0,
          doctorCount: 0,
          doctors: []
        };
      }
      
      departments[doctor.departmentId].totalRating += doctor.avgRating;
      departments[doctor.departmentId].totalConsultations += doctor.consultationCount;
      departments[doctor.departmentId].doctorCount += 1;
      departments[doctor.departmentId].doctors.push(doctor);
    });
    
    // Calculate averages
    return Object.values(departments).map(dept => ({
      ...dept,
      avgRating: dept.totalRating / dept.doctorCount,
      consultationCount: dept.totalConsultations
    }));
  };

  // Filter doctor data based on doctor name and department
  const filterDoctorData = () => {
    let filtered = [...doctorData];
    
    if (doctorNameFilter) {
      filtered = filtered.filter(doctor => 
        doctor.name.toLowerCase().includes(doctorNameFilter.toLowerCase())
      );
    }
    
    if (departmentFilter) {
      filtered = filtered.filter(doctor => 
        doctor.departmentName.toLowerCase().includes(departmentFilter.toLowerCase())
      );
    }
    
    setFilteredDoctorData(filtered);
  };

  // Filter department data based on department name
  const filterDepartmentData = () => {
    let filtered = [...departmentData];
    
    if (departmentNameFilter) {
      filtered = filtered.filter(dept => 
        dept.departmentName.toLowerCase().includes(departmentNameFilter.toLowerCase())
      );
    }
    
    setFilteredDepartmentData(filtered);
  };

  // Categorize doctors by quadrant
  const categorizeDoctorsByQuadrant = () => {
    const topRight = filteredDoctorData.filter(
      doctor => doctor.avgRating >= xAxisDivider && doctor.consultationCount >= yAxisDivider
    );
    
    const topLeft = filteredDoctorData.filter(
      doctor => doctor.avgRating < xAxisDivider && doctor.consultationCount >= yAxisDivider
    );
    
    const bottomRight = filteredDoctorData.filter(
      doctor => doctor.avgRating >= xAxisDivider && doctor.consultationCount < yAxisDivider
    );
    
    const bottomLeft = filteredDoctorData.filter(
      doctor => doctor.avgRating < xAxisDivider && doctor.consultationCount < yAxisDivider
    );
    
    setDoctorQuadrantData({ topRight, topLeft, bottomRight, bottomLeft });
  };

  // Categorize departments by quadrant
  const categorizeDepartmentsByQuadrant = () => {
    const topRight = filteredDepartmentData.filter(
      dept => dept.avgRating >= xAxisDivider && dept.consultationCount >= yAxisDivider
    );
    
    const topLeft = filteredDepartmentData.filter(
      dept => dept.avgRating < xAxisDivider && dept.consultationCount >= yAxisDivider
    );
    
    const bottomRight = filteredDepartmentData.filter(
      dept => dept.avgRating >= xAxisDivider && dept.consultationCount < yAxisDivider
    );
    
    const bottomLeft = filteredDepartmentData.filter(
      dept => dept.avgRating < xAxisDivider && dept.consultationCount < yAxisDivider
    );
    
    setDepartmentQuadrantData({ topRight, topLeft, bottomRight, bottomLeft });
  };

  // Handle department click to switch to doctor view with department filter
  const handleDepartmentClick = (_, elements) => {
    if (elements && elements.length > 0) {
      const index = elements[0].index;
      const dept = filteredDepartmentData[index];
      
      setDepartmentFilter(dept.departmentName);
      setActiveTab('doctor');
    }
  };

  // Handle mouse down on dividers for dragging
  const handleDividerMouseDown = (axis) => {
    if (axis === 'x') {
      isDraggingX.current = true;
    } else {
      isDraggingY.current = true;
    }
  };

  // Handle mouse move for dragging dividers
  const handleChartMouseMove = (e) => {
    if (!chartRef.current || (!isDraggingX.current && !isDraggingY.current)) return;
    
    const chart = chartRef.current;
    if (!chart) return;
    
    const chartInstance = chart.chartInstance || chart;
    if (!chartInstance) return;
    
    const chartArea = chartInstance.chartArea;
    
    if (isDraggingX.current) {
      const xScale = chartInstance.scales.x;
      const mouseX = e.nativeEvent.offsetX;
      
      // Calculate new divider value based on mouse position
      if (mouseX >= chartArea.left && mouseX <= chartArea.right) {
        const pixelRatio = (mouseX - chartArea.left) / (chartArea.right - chartArea.left);
        const newValue = xScale.min + pixelRatio * (xScale.max - xScale.min);
        setXAxisDivider(Math.min(Math.max(newValue, 0), 5));
      }
    }
    
    if (isDraggingY.current) {
      const yScale = chartInstance.scales.y;
      const mouseY = e.nativeEvent.offsetY;
      
      // Calculate new divider value based on mouse position
      if (mouseY >= chartArea.top && mouseY <= chartArea.bottom) {
        const pixelRatio = 1 - (mouseY - chartArea.top) / (chartArea.bottom - chartArea.top);
        const newValue = yScale.min + pixelRatio * (yScale.max - yScale.min);
        setYAxisDivider(Math.max(newValue, 0));
      }
    }
  };

  // Handle mouse up to stop dragging
  const handleChartMouseUp = () => {
    isDraggingX.current = false;
    isDraggingY.current = false;
  };

  // Handle mouse leave to stop dragging
  const handleChartMouseLeave = () => {
    isDraggingX.current = false;
    isDraggingY.current = false;
  };

  // Prepare chart data for doctor view
  const doctorChartData = {
    datasets: [
      {
        data: filteredDoctorData.map(doctor => ({
          x: doctor.avgRating,
          y: doctor.consultationCount,
          doctor: doctor // Store the full doctor object for tooltip
        })),
        backgroundColor: filteredDoctorData.map(doctor => {
          // Color based on quadrant
          if (doctor.avgRating >= xAxisDivider && doctor.consultationCount >= yAxisDivider) {
            return 'rgba(0, 255, 0, 0.6)'; // Top Right - Green
          } else if (doctor.avgRating < xAxisDivider && doctor.consultationCount >= yAxisDivider) {
            return 'rgba(255, 255, 0, 0.6)'; // Top Left - Yellow
          } else if (doctor.avgRating >= xAxisDivider && doctor.consultationCount < yAxisDivider) {
            return 'rgba(0, 0, 255, 0.6)'; // Bottom Right - Blue
          } else {
            return 'rgba(255, 0, 0, 0.6)'; // Bottom Left - Red
          }
        }),
        pointRadius: 10,
        pointHoverRadius: 15,
      }
    ]
  };

  // Prepare chart data for department view
  const departmentChartData = {
    datasets: [
      {
        data: filteredDepartmentData.map(dept => ({
          x: dept.avgRating,
          y: dept.consultationCount,
          department: dept // Store the full department object for tooltip
        })),
        backgroundColor: filteredDepartmentData.map(dept => {
          // Color based on quadrant
          if (dept.avgRating >= xAxisDivider && dept.consultationCount >= yAxisDivider) {
            return 'rgba(0, 255, 0, 0.6)'; // Top Right - Green
          } else if (dept.avgRating < xAxisDivider && dept.consultationCount >= yAxisDivider) {
            return 'rgba(255, 255, 0, 0.6)'; // Top Left - Yellow
          } else if (dept.avgRating >= xAxisDivider && dept.consultationCount < yAxisDivider) {
            return 'rgba(0, 0, 255, 0.6)'; // Bottom Right - Blue
          } else {
            return 'rgba(255, 0, 0, 0.6)'; // Bottom Left - Red
          }
        }),
        pointRadius: 12,
        pointHoverRadius: 18,
      }
    ]
  };
  

  // Chart options for doctor view
  const doctorChartOptions = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Average Feedback Rating',
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        min: 0,
        max: 5,
        ticks: {
          stepSize: 0.5
        }
      },
      y: {
        title: {
          display: true,
          text: 'Number of Consultations',
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        min: 0,
        suggestedMax: Math.max(...filteredDoctorData.map(d => d.consultationCount), 10) + 1
      }
    },
    plugins: {
      datalabels: {
        display: false 
      },
      tooltip: {
        enabled : true,
        callbacks: {
          label: function(context) {
            const doctor = context.raw.doctor;
            return [
              `Doctor: ${doctor.name}`,
              `ID: ${doctor.doctorId}`,
              `Department: ${doctor.departmentName}`,
              `Rating: ${doctor.avgRating.toFixed(2)}`,
              `Consultations: ${doctor.consultationCount}`
            ];
          },
          title: () => ''
        }
      },
      legend: {
        display: false
      }
    },

    animation: {
      duration: 1000
    },
    maintainAspectRatio: false
  };

  // Chart options for department view
  const departmentChartOptions = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Average Feedback Rating',
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        min: 0,
        max: 5,
        ticks: {
          stepSize: 0.5
        }
      },
      y: {
        title: {
          display: true,
          text: 'Total Consultations',
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        min: 0,
        suggestedMax: Math.max(...filteredDepartmentData.map(d => d.consultationCount), 10) + 1
      }
    },
    plugins: {
      datalabels: {
        display: false 
      },
      tooltip: {
        enabled : true,
        callbacks: {
          label: function(context) {
            const dept = context.raw.department;
            return [
              `Department: ${dept.departmentName}`,
              `ID: ${dept.departmentId}`,
              `Avg Rating: ${dept.avgRating.toFixed(2)}`,
              `Total Consultations: ${dept.consultationCount}`,
              `Doctor Count: ${dept.doctorCount}`
            ];
          },
          title: () => ''
        }
      },
      legend: {
        display: false
      }
    },
    animation: {
      duration: 1000
    },
    maintainAspectRatio: false,
    onClick: handleDepartmentClick
  };

  // Render quadrant data table for doctors
  const renderDoctorQuadrantTable = (quadrantName, doctors, colorClass) => {
    return (
      <div className={`p-4 rounded-lg ${colorClass}`}>
        <h3 className="font-semibold text-lg mb-2">{quadrantName} ({doctors.length})</h3>
        {doctors.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consultations</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doctor, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-2 py-1 whitespace-nowrap text-sm">{doctor.name}</td>
                    <td className="px-2 py-1 whitespace-nowrap text-sm">{doctor.departmentName}</td>
                    <td className="px-2 py-1 whitespace-nowrap text-sm">{doctor.avgRating.toFixed(2)}</td>
                    <td className="px-2 py-1 whitespace-nowrap text-sm">{doctor.consultationCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No doctors in this quadrant</p>
        )}
      </div>
    );
  };

  // Render quadrant data table for departments
const renderDepartmentQuadrantTable = (quadrantName, departments, colorClass) => {
  return (
    <div className={`p-4 rounded-lg ${colorClass}`}>
      <h3 className="font-semibold text-lg mb-2">{quadrantName} ({departments.length})</h3>
      {departments.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Rating</th>
                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consultations</th>
                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor Count</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-2 py-1 whitespace-nowrap text-sm">{dept.departmentName}</td>
                  <td className="px-2 py-1 whitespace-nowrap text-sm">{dept.avgRating.toFixed(2)}</td>
                  <td className="px-2 py-1 whitespace-nowrap text-sm">{dept.consultationCount}</td>
                  <td className="px-2 py-1 whitespace-nowrap text-sm">{dept.doctorCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-gray-500">No departments in this quadrant</p>
      )}
    </div>
  );
};

// Completing the component's return statement
return (
  <div className="flex flex-col w-full p-6 bg-gray-50 min-h-screen">
    <h1 className="flex items-center text-3xl font-bold text-gray-800 mb-6">
      <BiLineChart className="mr-3 text-blue-500" />
      Doctor Performance Analysis
    </h1>
    
    {/* Tab navigation */}
    <div className="mb-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex">
          <button
            onClick={() => setActiveTab('doctor')}
            className={`${
              activeTab === 'doctor'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-lg`}
          >
            <FaUserMd className="inline mr-2" />
            Doctor-wise View
          </button>
          <button
            onClick={() => setActiveTab('department')}
            className={`${
              activeTab === 'department'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-lg`}
          >
            <FaHospital className="inline mr-2" />
            Department-wise View
          </button>
        </nav>
      </div>
    </div>
    
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      {activeTab === 'doctor' ? (
        <>
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Doctor view filters */}
            <div className="flex flex-col flex-grow max-w-xs">
              <label className="text-sm text-gray-600 mb-1 flex items-center">
                <FaUserMd className="mr-1 text-blue-500" />
                Doctor Name:
              </label>
              <input
                type="text"
                value={doctorNameFilter}
                onChange={(e) => setDoctorNameFilter(e.target.value)}
                placeholder="Start typing doctor's name..."
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex flex-col flex-grow max-w-xs">
              <label className="text-sm text-gray-600 mb-1 flex items-center">
                <FaHospital className="mr-1 text-blue-500" />
                Department:
              </label>
              <input
                type="text"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                placeholder="Start typing department name..."
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            {/* Divider sliders */}
            <div className="flex flex-col flex-grow">
              <label className="text-sm text-gray-600 mb-1 flex items-center">
                <FaFilter className="mr-1 text-blue-500" />
                Rating Divider: {xAxisDivider}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                step="0.1"
                value={xAxisDivider}
                onChange={(e) => setXAxisDivider(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div className="flex flex-col flex-grow">
              <label className="text-sm text-gray-600 mb-1 flex items-center">
                <FaFilter className="mr-1 text-blue-500" />
                Consultation Count Divider: {yAxisDivider}
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={yAxisDivider}
                onChange={(e) => setYAxisDivider(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Doctor Chart */}
          <div 
            className="relative h-96 mb-6"
            onMouseMove={handleChartMouseMove}
            onMouseUp={handleChartMouseUp}
            onMouseLeave={handleChartMouseLeave}
          >
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredDoctorData.length > 0 ? (
              <>
                <Scatter 
                  ref={chartRef}
                  data={doctorChartData} 
                  options={doctorChartOptions} 
                />
                
                {/* Quadrant dividers */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Vertical divider */}
                  <div 
                    className="absolute top-0 bottom-0 w-px bg-gray-400 border-dashed cursor-ew-resize"
                    style={{ 
                      left: `${(xAxisDivider / 5) * 100}%`,
                    }}
                    onMouseDown={() => handleDividerMouseDown('x')}
                  ></div>
                  
                  {/* Horizontal divider */}
                  <div 
                    className="absolute left-0 right-0 h-px bg-gray-400 border-dashed cursor-ns-resize"
                    style={{ 
                      top: `${100 - ((yAxisDivider / (Math.max(...filteredDoctorData.map(d => d.consultationCount)) + 1)) * 100)}%`,
                    }}
                    onMouseDown={() => handleDividerMouseDown('y')}
                  ></div>
                  
                  {/* Quadrant labels */}
                  <div className="absolute top-2 left-2 bg-yellow-100 bg-opacity-70 p-1 text-xs rounded">
                    High Consultations, Low Rating
                  </div>
                  <div className="absolute top-2 right-2 bg-green-100 bg-opacity-70 p-1 text-xs rounded">
                    High Consultations, High Rating
                  </div>
                  <div className="absolute bottom-2 left-2 bg-red-100 bg-opacity-70 p-1 text-xs rounded">
                    Low Consultations, Low Rating
                  </div>
                  <div className="absolute bottom-2 right-2 bg-blue-100 bg-opacity-70 p-1 text-xs rounded">
                    Low Consultations, High Rating
                  </div>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                No data matches your filters
              </div>
            )}
          </div>

          {/* Doctor Quadrant tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderDoctorQuadrantTable("High Consultations, High Rating", doctorQuadrantData.topRight, "bg-green-50")}
            {renderDoctorQuadrantTable("High Consultations, Low Rating", doctorQuadrantData.topLeft, "bg-yellow-50")}
            {renderDoctorQuadrantTable("Low Consultations, High Rating", doctorQuadrantData.bottomRight, "bg-blue-50")}
            {renderDoctorQuadrantTable("Low Consultations, Low Rating", doctorQuadrantData.bottomLeft, "bg-red-50")}
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Department view filters */}
            <div className="flex flex-col flex-grow max-w-xs">
              <label className="text-sm text-gray-600 mb-1 flex items-center">
                <FaHospital className="mr-1 text-blue-500" />
                Department:
              </label>
              <input
                type="text"
                value={departmentNameFilter}
                onChange={(e) => setDepartmentNameFilter(e.target.value)}
                placeholder="Start typing department name..."
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            {/* Divider sliders */}
            <div className="flex flex-col flex-grow">
              <label className="text-sm text-gray-600 mb-1 flex items-center">
                <FaFilter className="mr-1 text-blue-500" />
                Rating Divider: {xAxisDivider}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                step="0.1"
                value={xAxisDivider}
                onChange={(e) => setXAxisDivider(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div className="flex flex-col flex-grow">
              <label className="text-sm text-gray-600 mb-1 flex items-center">
                <FaFilter className="mr-1 text-blue-500" />
                Consultation Count Divider: {yAxisDivider}
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={yAxisDivider}
                onChange={(e) => setYAxisDivider(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Department Chart */}
          <div 
            className="relative h-96 mb-6"
            onMouseMove={handleChartMouseMove}
            onMouseUp={handleChartMouseUp}
            onMouseLeave={handleChartMouseLeave}
          >
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredDepartmentData.length > 0 ? (
              <>
                <Scatter 
                  ref={chartRef}
                  data={departmentChartData} 
                  options={departmentChartOptions} 
                />
                
                {/* Quadrant dividers */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Vertical divider */}
                  <div 
                    className="absolute top-0 bottom-0 w-px bg-gray-400 border-dashed cursor-ew-resize"
                    style={{ 
                      left: `${(xAxisDivider / 5) * 100}%`,
                    }}
                    onMouseDown={() => handleDividerMouseDown('x')}
                  ></div>
                  
                  {/* Horizontal divider */}
                  <div 
                    className="absolute left-0 right-0 h-px bg-gray-400 border-dashed cursor-ns-resize"
                    style={{ 
                      top: `${100 - ((yAxisDivider / (Math.max(...filteredDepartmentData.map(d => d.consultationCount)) + 1)) * 100)}%`,
                    }}
                    onMouseDown={() => handleDividerMouseDown('y')}
                  ></div>
                  
                  {/* Quadrant labels */}
                  <div className="absolute top-2 left-2 bg-yellow-100 bg-opacity-70 p-1 text-xs rounded">
                    High Consultations, Low Rating
                  </div>
                  <div className="absolute top-2 right-2 bg-green-100 bg-opacity-70 p-1 text-xs rounded">
                    High Consultations, High Rating
                  </div>
                  <div className="absolute bottom-2 left-2 bg-red-100 bg-opacity-70 p-1 text-xs rounded">
                    Low Consultations, Low Rating
                  </div>
                  <div className="absolute bottom-2 right-2 bg-blue-100 bg-opacity-70 p-1 text-xs rounded">
                    Low Consultations, High Rating
                  </div>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                No data matches your filters
              </div>
            )}
          </div>

          {/* Department Quadrant tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderDepartmentQuadrantTable("High Consultations, High Rating", departmentQuadrantData.topRight, "bg-green-50")}
            {renderDepartmentQuadrantTable("High Consultations, Low Rating", departmentQuadrantData.topLeft, "bg-yellow-50")}
            {renderDepartmentQuadrantTable("Low Consultations, High Rating", departmentQuadrantData.bottomRight, "bg-blue-50")}
            {renderDepartmentQuadrantTable("Low Consultations, Low Rating", departmentQuadrantData.bottomLeft, "bg-red-50")}
          </div>
        </>
      )}
    </div>
  </div>
);
};


// Mock data generation function
const generateMockDoctorData = () => {
  // Sample doctor data
  return [
    {
      doctorId: 101,
      name: "Dr. Smith",
      departmentId: "D001",
      departmentName: "Cardiology",
      avgRating: 4.3,
      consultationCount: 3
    },
    {
      doctorId: 102,
      name: "Dr. Johnson",
      departmentId: "D002",
      departmentName: "Neurology",
      avgRating: 4.0,
      consultationCount: 2
    },
    {
      doctorId: 103,
      name: "Dr. Brown",
      departmentId: "D003",
      departmentName: "Orthopedics",
      avgRating: 2.5,
      consultationCount: 2
    },
    {
      doctorId: 104,
      name: "Dr. Davis",
      departmentId: "D001",
      departmentName: "Cardiology",
      avgRating: 4.8,
      consultationCount: 5
    },
    {
      doctorId: 105,
      name: "Dr. Wilson",
      departmentId: "D004",
      departmentName: "Pediatrics",
      avgRating: 3.7,
      consultationCount: 4
    },
    {
      doctorId: 106,
      name: "Dr. Martinez",
      departmentId: "D005",
      departmentName: "Dermatology",
      avgRating: 4.5,
      consultationCount: 1
    },
    {
      doctorId: 107,
      name: "Dr. Anderson",
      departmentId: "D002",
      departmentName: "Neurology",
      avgRating: 3.2,
      consultationCount: 3
    },
    {
      doctorId: 108,
      name: "Dr. Taylor",
      departmentId: "D006",
      departmentName: "Psychiatry",
      avgRating: 4.1,
      consultationCount: 6
    },
    {
      doctorId: 109,
      name: "Dr. Thomas",
      departmentId: "D003",
      departmentName: "Orthopedics",
      avgRating: 2.9,
      consultationCount: 1
    },
    {
      doctorId: 110,
      name: "Dr. Jackson",
      departmentId: "D007",
      departmentName: "Oncology",
      avgRating: 4.7,
      consultationCount: 4
    }
  ];
};

export default BedOccupancyTrends;
