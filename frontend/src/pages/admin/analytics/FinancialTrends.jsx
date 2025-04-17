import { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faCalendar, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const FinancialTrends = () => {
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
        const result = await fetchWeeklyPayments(startDate, endDate);
        setChartData({
          labels: result.labels,
          datasets: [{
            label: 'Weekly Payment Amount',
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
    if (!startDate || !endDate) return;

    setLoading(true);
    try {
      const fetchFunction = activeTab === 'monthly' ? fetchMonthlyPayments : fetchWeeklyPayments;
      const result = await fetchFunction(startDate, endDate);

      const newChartData = {
        labels: result.labels,
        datasets: [{
          label: `${activeTab === 'monthly' ? 'Monthly' : 'Weekly'} Payment Total`,
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
      const result = await fetchWeeklyPayments(monthStart, monthEnd);
      setChartData({
        labels: result.labels,
        datasets: [{
          label: `Weekly Payment Totals - ${monthStart.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
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

  const fetchMonthlyPayments = async (start, end) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/analytics/finance-trends`, {
        startDate: start,
        endDate: end
      });

      // Extract and format monthly data from response
      const monthlyData = response.data.monthly;
      return {
        labels: monthlyData.map(item => item.label),
        data: monthlyData.map(item => item.amount)
      };
    } catch (error) {
      console.error('Error fetching monthly payment data:', error);
      throw error;
    }
  };

  const fetchWeeklyPayments = async (start, end) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/analytics/finance-trends`, {
        startDate: start,
        endDate: end
      });

      // Extract and format weekly data from response
      const weeklyData = response.data.weekly;
      return {
        labels: weeklyData.map(item => item.label),
        data: weeklyData.map(item => item.amount)
      };
    } catch (error) {
      console.error('Error fetching weekly payment data:', error);
      throw error;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
          <FontAwesomeIcon icon={faChartBar} className="mr-3" />
          Patient Payment Trends
        </h2>

        {/* Form section */}
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-0 md:flex md:gap-4 mb-6">
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
        ) : chartData ? (
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
        ) : (
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-gray-500">Select date range to view payment data</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialTrends;