import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Download, IndianRupee } from 'lucide-react';
import { downloadPayslip } from '../../utils/downloadUtils';

const PayrollInfo = () => {
  const [payrollHistory, setPayrollHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null); // Track which slip is being downloaded

  // Get employeeId from localStorage
  const employeeId = localStorage.getItem('user_id');

  useEffect(() => {
    const fetchPayrollData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/common/findPayroll`, {
          params: { employeeId }
        });

        if (response.data.payrolls) {
          // Sort payrolls by date in descending order
          const sortedPayrolls = response.data.payrolls.sort((a, b) =>
            new Date(b.month_year) - new Date(a.month_year)
          );
          setPayrollHistory(sortedPayrolls);
        }
      } catch (error) {
        console.error('Error fetching payroll data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) {
      fetchPayrollData();
    }
  }, [employeeId]);

  const calculateTotals = () => {
    return payrollHistory.reduce((totals, record) => ({
      basic: totals.basic + (record.basic_salary || 0),
      allowance: totals.allowance + (record.allowance || 0),
      deduction: totals.deduction + (record.deduction || 0),
      net: totals.net + (record.net_salary || 0)
    }), { basic: 0, allowance: 0, deduction: 0, net: 0 });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'partially_paid':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleDownload = async (record) => {
    try {
      downloadPayslip(record, setDownloadingId);
    } catch (error) {
      alert('Failed to generate payslip. Please try again.');
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <IndianRupee className="w-6 h-6" />
            My Payroll History
          </h2>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <span className="text-gray-600">
              Showing {payrollHistory.length} payment records
            </span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading payroll data...</p>
          </div>
        ) : payrollHistory.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pay Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Basic Salary
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Allowance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deduction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Net Salary
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payrollHistory.map((record, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatDate(record.month_year)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatCurrency(record.basic_salary)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatCurrency(record.allowance)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-red-600">
                        -{formatCurrency(record.deduction)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {formatCurrency(record.net_salary)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(record.payment_status)}`}>
                          {record.payment_status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.payment_status === 'paid' ? (
                          <button
                            className={`text-teal-600 hover:text-teal-900 flex items-center gap-1 ${downloadingId === record._id ? 'opacity-50 cursor-wait' : ''
                              }`}
                            onClick={() => handleDownload(record)}
                            disabled={downloadingId === record._id}
                          >
                            {downloadingId === record._id ? (
                              <div className="w-4 h-4 border-2 border-t-2 border-teal-600 rounded-full animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                            {downloadingId === record._id ? 'Downloading...' : 'Download Slip'}
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">Not yet generated</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                {payrollHistory.length > 1 && (
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">Total</td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {formatCurrency(calculateTotals().basic)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {formatCurrency(calculateTotals().allowance)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-red-600">
                        -{formatCurrency(calculateTotals().deduction)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {formatCurrency(calculateTotals().net)}
                      </td>
                      <td colSpan="2"></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <IndianRupee className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No payroll records found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayrollInfo;
