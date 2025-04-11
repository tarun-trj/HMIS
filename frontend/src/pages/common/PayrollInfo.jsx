/*import React from 'react';

const PayrollInfo = () => {
  return (
    <div>
      <h1>PayrollInfo</h1>
    </div>
  );
};

export default PayrollInfo;
*/
import React, { useState, useEffect } from 'react';
import { Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const PayrollInfo = () => {
  const [inputValue, setInputValue] = useState(''); // User input for employee ID
  const [employeeId, setEmployeeId] = useState(''); // Final employee ID used for searching
  const [employeeDetails, setEmployeeDetails] = useState(null); // Fetched employee personal details
  const [payrollHistory, setPayrollHistory] = useState([]); // Fetched payroll history
  const [loading, setLoading] = useState(false); // Loader state for data fetch
  const [month, setMonth] = useState(''); // Month filter
  const [year, setYear] = useState(''); // Year filter



//  THERE ARE SOME MANUAL DATA I HAVE PUT HERE IN THE CODE 
  const fetchEmployeePayroll = async (empId, requestedMonth, requestedYear) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockPayrollDB = {
          "E001": {
            employee: {
              id: "E001",
              name: "John Smith",
              department: "Internal Medicine",
              designation: "Chief Physician",
              join_date: "01-04-2020",
              phone_number: "555-123-4567"
            },
            payroll_history: [
              {
                month: "January",
                year: "2025",
                basic_salary: 75000,
                allowances: 12000,
                overtime: 5000,
                deductions: 8000,
                net_salary: 84000,
                payment_status: "Paid"
              },
              {
                month: "February",
                year: "2025",
                basic_salary: 75000,
                allowances: 12000,
                overtime: 3500,
                deductions: 8000,
                net_salary: 82500,
                payment_status: "Paid"
              },
              {
                month: "March",
                year: "2025",
                basic_salary: 75000,
                allowances: 12000,
                overtime: 0,
                deductions: 8000,
                net_salary: 79000,
                payment_status: "Pending"
              }
            ]
          },
          "E002": {
            employee: {
              id: "E002",
              name: "Sarah Johnson",
              department: "Pediatrics",
              designation: "Senior Nurse",
              join_date: "15-06-2021",
              phone_number: "555-987-6543"
            },
            payroll_history: [
              {
                month: "January",
                year: "2025",
                basic_salary: 45000,
                allowances: 8000,
                overtime: 3000,
                deductions: 5000,
                net_salary: 51000,
                payment_status: "Paid"
              },
              {
                month: "February",
                year: "2025",
                basic_salary: 45000,
                allowances: 8000,
                overtime: 4500,
                deductions: 5000,
                net_salary: 52500,
                payment_status: "Paid"
              },
              {
                month: "March",
                year: "2025",
                basic_salary: 45000,
                allowances: 8000,
                overtime: 2000,
                deductions: 5000,
                net_salary: 50000,
                payment_status: "Pending"
              }
            ]
          },
          "E003": {
            employee: {
              id: "E003",
              name: "David Chen",
              department: "Radiology",
              designation: "Technician",
              join_date: "03-11-2022",
              phone_number: "555-222-3333"
            },
            payroll_history: [
              {
                month: "January",
                year: "2025",
                basic_salary: 40000,
                allowances: 6000,
                overtime: 2000,
                deductions: 4000,
                net_salary: 44000,
                payment_status: "Paid"
              },
              {
                month: "February",
                year: "2025",
                basic_salary: 40000,
                allowances: 6000,
                overtime: 3000,
                deductions: 4000,
                net_salary: 45000,
                payment_status: "Paid"
              },
              {
                month: "March",
                year: "2025",
                basic_salary: 40000,
                allowances: 6000,
                overtime: 0,
                deductions: 4000,
                net_salary: 42000,
                payment_status: "Processing"
              }
            ]
          }
        };

        const employeeData = mockPayrollDB[empId];
        
        if (!employeeData) {
          // If no data found, return empty
          resolve({ employee: null, payroll_history: [] });
          return;
        }

// Filter payroll records based on month/year if provided
        let filteredHistory = [...employeeData.payroll_history];
        if (requestedMonth) {
          filteredHistory = filteredHistory.filter(record => 
            record.month.toLowerCase() === requestedMonth.toLowerCase());
        }
        if (requestedYear) {
          filteredHistory = filteredHistory.filter(record => 
            record.year === requestedYear);
        }

        resolve({
          employee: employeeData.employee,
          payroll_history: filteredHistory
        });
      }, 500); // Simulated delay for fetching
    });
  };

                     useEffect(() => {
    const getEmployeeData = async () => {
      if (!employeeId) return;

      setLoading(true);
      try {
        // Fetch data from the mock function
        const data = await fetchEmployeePayroll(employeeId, month, year);
        setEmployeeDetails(data.employee);
        setPayrollHistory(data.payroll_history || []);
      } catch (error) {
        console.error("Error fetching employee payroll data:", error);
      } finally {
        setLoading(false);
      }
    };

    getEmployeeData();
  }, [employeeId, month, year]);
  const handleSearch = () => {
    const trimmedId = inputValue.trim();
    if (trimmedId) {
      setEmployeeId(trimmedId);
    }
  };

  const handleFilterChange = () => {
    if (employeeId) {
      const currentId = employeeId;
      setEmployeeId('');
      setTimeout(() => setEmployeeId(currentId), 10); // short delay to force state update
    }
  };

  const calculateTotals = () => {
    if (!payrollHistory.length) return { basic: 0, allowances: 0, overtime: 0, deductions: 0, net: 0 };

    return payrollHistory.reduce((totals, record) => {
      return {
        basic: totals.basic + record.basic_salary,
        allowances: totals.allowances + record.allowances,
        overtime: totals.overtime + record.overtime,
        deductions: totals.deductions + record.deductions,
        net: totals.net + record.net_salary
      };
    }, { basic: 0, allowances: 0, overtime: 0, deductions: 0, net: 0 });
  };

  const totals = calculateTotals(); // Get total of all visible records

  return (
    <div className='p-5 pt-10 flex flex-col justify-center items-center space-y-6'>
      {/* Header */}
      <div className='text-2xl font-bold ml-[3rem] self-start'>Payroll Information</div>
      
      {/* Input form for ID, Month, Year */}
      <div className='flex flex-col w-full max-w-4xl gap-4'>
        <div className='flex flex-wrap items-center gap-4 justify-between'>
          {/* Employee ID Search */}
          <div className='flex items-center'>
            <p className='mr-2 font-bold'>Employee ID:</p>
            <TextField
              size="small"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter ID (e.g., E001)"
              style={{ width: '200px' }}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
              style={{ marginLeft: '1rem', backgroundColor: '#4C7E75' }}
            >
              Search
            </Button>
          </div>

          {/* Month and Year Filters */}
          <div className='flex items-center gap-2'>
            <TextField
              size="small"
              label="Month"
              placeholder="e.g., March"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              style={{ width: '120px' }}
            />
            <TextField
              size="small"
              label="Year"
              placeholder="e.g., 2025"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              style={{ width: '100px' }}
            />
            <Button
              variant="outlined"
              onClick={handleFilterChange}
              style={{ color: '#4C7E75', borderColor: '#4C7E75' }}
            >
              Filter
            </Button>
          </div>
        </div>
      </div>

      {/* Loading message */}
      {loading && (
        <p className="text-blue-600 font-semibold">Loading payroll data...</p>
      )}

      {/* Employee details display */}
      <div className='border-t border-gray-300 w-full max-w-4xl pt-4'>
        <p className='font-bold pb-3'>Employee Details</p>
        {employeeDetails ? (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="space-y-2 text-black">
              <p><span className="font-medium text-black">Name:</span> {employeeDetails.name}</p>
              <p><span className="font-medium text-black">Department:</span> {employeeDetails.department}</p>
              <p><span className="font-medium text-black">Join Date:</span> {employeeDetails.join_date}</p>
            </div>
            <div className="space-y-2 text-black">
              <p><span className="font-medium text-black">Designation:</span> {employeeDetails.designation}</p>
              <p><span className="font-medium text-black">Phone Number:</span> {employeeDetails.phone_number}</p>
            </div>
          </div>
        ) : (
          <p className="mb-6">No employee selected or employee not found.</p>
        )}
      </div>

      {/* Payroll history table */}
      <div className='border-t border-gray-300 w-full max-w-4xl pt-4'>
        <p className='font-bold pb-3'>Payroll History</p>
        {payrollHistory.length > 0 ? (
          <TableContainer component={Paper} className="mb-6">
            <Table>
              {/* Table Header */}
              <TableHead style={{ backgroundColor: '#f3f4f6' }}>
                <TableRow>
                  <TableCell className='font-bold'>Month/Year</TableCell>
                  <TableCell className='font-bold' align="right">Basic Salary</TableCell>
                  <TableCell className='font-bold' align="right">Allowances</TableCell>
                  <TableCell className='font-bold' align="right">Overtime</TableCell>
                  <TableCell className='font-bold' align="right">Deductions</TableCell>
                  <TableCell className='font-bold' align="right">Net Salary</TableCell>
                  <TableCell className='font-bold' align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              
              {/* Table Body */}
              <TableBody>
                {payrollHistory.map((record, index) => (
                  <TableRow key={index}>
                    <TableCell>{`${record.month} ${record.year}`}</TableCell>
                    <TableCell align="right">₹{record.basic_salary.toLocaleString()}</TableCell>
                    <TableCell align="right">₹{record.allowances.toLocaleString()}</TableCell>
                    <TableCell align="right">₹{record.overtime.toLocaleString()}</TableCell>
                    <TableCell align="right">₹{record.deductions.toLocaleString()}</TableCell>
                    <TableCell align="right" className="font-semibold">₹{record.net_salary.toLocaleString()}</TableCell>
                    <TableCell align="center">
                      {/* Status badge with conditional color */}
                      <span className={`px-2 py-1 rounded-full text-sm font-semibold ${
                        record.payment_status === 'Paid' ? 'bg-green-100 text-green-800' : 
                        record.payment_status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {record.payment_status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}

                {/* Totals row (if more than one record) */}
                {payrollHistory.length > 1 && (
                  <TableRow style={{ backgroundColor: '#f3f4f6' }}>
                    <TableCell className="font-bold">Total</TableCell>
                    <TableCell align="right" className="font-bold">₹{totals.basic.toLocaleString()}</TableCell>
                    <TableCell align="right" className="font-bold">₹{totals.allowances.toLocaleString()}</TableCell>
                    <TableCell align="right" className="font-bold">₹{totals.overtime.toLocaleString()}</TableCell>
                    <TableCell align="right" className="font-bold">₹{totals.deductions.toLocaleString()}</TableCell>
                    <TableCell align="right" className="font-bold">₹{totals.net.toLocaleString()}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <p>No payroll data available for the selected filters.</p>
        )}
      </div>
    </div>
  );
};

export default PayrollInfo;
