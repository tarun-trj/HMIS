import { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faCalendar, faUser } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DoctorWorkingTrends = () => {
  const [doctorName, setDoctorName] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [activeTab, setActiveTab] = useState('monthly');
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedMonthData, setSelectedMonthData] = useState(null);

  const handleTabChange = async (tab) => {
    setActiveTab(tab);
    setLoading(true);

    try {
      if (tab === 'monthly') {
        // Restore the original monthly data
        setChartData(selectedMonthData);
      } else {
        // Fetch weekly data for the entire date range
        const result = await fetchWeeklyConsultations(doctorName, startDate, endDate);
        setChartData({
          labels: result.labels,
          datasets: [{
            label: 'Weekly Patient Count',
            data: result.data,
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
          }],
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!doctorName || !startDate || !endDate) return;

    setLoading(true);
    try {
      const fetchFunction = activeTab === 'monthly' ? fetchMonthlyConsultations : fetchWeeklyConsultations;
      const result = await fetchFunction(doctorName, startDate, endDate);

      const newChartData = {
        labels: result.labels,
        datasets: [{
          label: `${activeTab === 'monthly' ? 'Monthly' : 'Weekly'} Patient Count`,
          data: result.data,
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        }],
      };

      setChartData(newChartData);
      if (activeTab === 'monthly') {
        setSelectedMonthData(newChartData);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChartClick = async (_, elements) => {
    if (!elements.length || activeTab !== 'monthly') return;

    const clickedMonthIndex = elements[0].index;
    const monthStart = new Date(startDate);
    monthStart.setMonth(monthStart.getMonth() + clickedMonthIndex);

    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);

    setActiveTab('weekly');
    setLoading(true);

    try {
      const result = await fetchWeeklyConsultations(doctorName, monthStart, monthEnd);
      setChartData({
        labels: result.labels,
        datasets: [{
          label: `Weekly Patient Count - ${result.labels[0]}`,
          data: result.data,
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        }],
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyConsultations = async (doctorName, start, end) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/analytics/doctor-working`, {
        params: {
          doctorName,
          startDate: start.toISOString(),
          endDate: end.toISOString()
        }
      });

      // Format the data for the chart
      const labels = response.data.monthly.map(item => item.label);
      const data = response.data.monthly.map(item => item.count);

      return { labels, data };
    } catch (error) {
      console.error('Error fetching monthly data:', error);
      throw error;
    }
  };

  const fetchWeeklyConsultations = async (doctorName, start, end) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/analytics/doctor-working`, {
        params: {
          doctorName,
          startDate: start.toISOString(),
          endDate: end.toISOString()
        }
      });

      // Format the data for the chart
      const labels = response.data.weekly.map(item => item.label);
      const data = response.data.weekly.map(item => item.count);

      return { labels, data };
    } catch (error) {
      console.error('Error fetching weekly data:', error);
      throw error;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
          <FontAwesomeIcon icon={faChartBar} className="mr-3" />
          Doctor Working Trends
        </h2>

        {/* Form section */}
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-0 md:flex md:gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <FontAwesomeIcon icon={faUser} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Doctor Name"
                required
              />
            </div>
          </div>

          <div className="flex-1">
            <div className="relative">
              <FontAwesomeIcon icon={faCalendar} className="absolute left-3 top-3 text-gray-400 z-10" />
              <DatePicker
                selected={startDate}
                onChange={setStartDate}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholderText="Start Date"
                required
              />
            </div>
          </div>

          <div className="flex-1">
            <div className="relative">
              <FontAwesomeIcon icon={faCalendar} className="absolute left-3 top-3 text-gray-400 z-10" />
              <DatePicker
                selected={endDate}
                onChange={setEndDate}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholderText="End Date"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Generate Report
          </button>
        </form>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {['monthly', 'weekly'].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`
                  py-2 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} View
              </button>
            ))}
          </nav>
        </div>

        {/* Chart section */}
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : chartData && (
          <div className="h-[400px]">
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                onClick: handleChartClick,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: false
                  }
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorWorkingTrends;