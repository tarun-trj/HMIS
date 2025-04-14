import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import axios from "axios";

// API base URL - adjust as needed
const API_BASE_URL = "http://localhost:5000/api/billing";

const Bills = () => {
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [billDetails, setBillDetails] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const patientId = "10013"; // This should come from authentication/context in a real app

  // Fetch all bills for the patient
  useEffect(() => {
    const fetchBills = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/patient/${patientId}`);
        if (response.data.success) {
          setBills(response.data.data);
        } else {
          setError("Failed to fetch bills");
        }
      } catch (err) {
        console.error("Error fetching bills:", err);
        setError("Failed to fetch bills. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, [patientId]);

  // Fetch bill details and payments when a bill is selected
  useEffect(() => {
    const fetchBillDetails = async () => {
      if (selectedBill) {
        try {
          setLoading(true);
          
          // Fetch bill details
          const detailsResponse = await axios.get(`${API_BASE_URL}/${selectedBill}`);
          
          // Fetch payments
          const paymentsResponse = await axios.get(`${API_BASE_URL}/${selectedBill}/payments`);
          
          if (detailsResponse.data.success && paymentsResponse.data.success) {
            setBillDetails(detailsResponse.data.data);
            setPayments(paymentsResponse.data.data);
          } else {
            setError("Failed to fetch bill details");
          }
        } catch (err) {
          console.error("Error fetching bill details:", err);
          setError("Failed to fetch bill details. Please try again later.");
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchBillDetails();
  }, [selectedBill]);

  const handleView = (billId) => {
    console.log(`Viewing bill details for bill: ${billId}`);
    setSelectedBill(billId);
  };

  const handleBack = () => {
    setSelectedBill(null);
    setBillDetails(null);
    setPayments([]);
    setError(null);
  };

  // Function to format amount with rupee symbol and 2 decimal places
  const formatAmount = (amount) => {
    return `₹${Number(amount).toFixed(2)}`;
  };

  const calculateSummary = () => {
    if (!billDetails || !payments) return { billed: 0, discount: 0, insurance: 0, paid: 0, refunds: 0, net: 0 };
    
    // Calculate total from bill items
    const billed = billDetails.bill_items?.reduce((sum, item) => 
      sum + (item.item_amount * (item.quantity || 1)), 0) || 0;
    
    // Calculate total payments
    const paid = payments.reduce((sum, payment) => {
      if (payment?.status?.enum === "success") {
        return sum + (Number(payment.amount) || 0);
      }
      return sum;
    }, 0);
  
    // Calculate insurance payments
    const insurance = payments.reduce((sum, payment) => {
      if (payment?.status?.enum === "success" && 
          payment?.payment_method?.enum === "insurance") {
        return sum + (Number(payment.amount) || 0);
      }
      return sum;
    }, 0);
  
    // For this example, assume no refunds and discount is a placeholder
    const discount = 0;
    const refunds = 0;
    
    // Net amount is billed minus paid
    const net = billed - paid - discount;

    return { billed, discount, insurance, paid, refunds, net };
  };

  const handleAddBillingItem = async () => {
    try {
      // You would typically open a modal to collect item details
      // This is a simplified example
      const newItem = {
        item_type: "consultation",
        item_description: "Follow-up Consultation",
        item_amount: 50.0,
        quantity: 1
      };

      const response = await axios.post(`${API_BASE_URL}/${selectedBill}/items`, newItem);
      
      if (response.data.success) {
        // Refresh bill details
        const updatedDetailsResponse = await axios.get(`${API_BASE_URL}/${selectedBill}`);
        setBillDetails(updatedDetailsResponse.data.data);
      } else {
        setError("Failed to add billing item");
      }
    } catch (err) {
      console.error("Error adding billing item:", err);
      setError("Failed to add billing item. Please try again.");
    }
  };

  const handleAddPayment = async () => {
    try {
      // You would typically open a modal to collect payment details
      // This is a simplified example
      const newPayment = {
        amount: 50.0,
        payment_method: "cash",
        payment_date: new Date().toISOString().split('T')[0],
        transaction_id: `tx${Date.now()}`,
        status: "success"
      };

      const response = await axios.post(`${API_BASE_URL}/${selectedBill}/payments`, newPayment);
      
      if (response.data.success) {
        // Refresh payments and bill details
        const updatedPaymentsResponse = await axios.get(`${API_BASE_URL}/${selectedBill}/payments`);
        const updatedDetailsResponse = await axios.get(`${API_BASE_URL}/${selectedBill}`);
        
        setPayments(updatedPaymentsResponse.data.data);
        setBillDetails(updatedDetailsResponse.data.data);
      } else {
        setError("Failed to add payment");
      }
    } catch (err) {
      console.error("Error adding payment:", err);
      setError("Failed to add payment. Please try again.");
    }
  };

  // Other handler functions remain similar but would make actual API calls
  const handleAddRegnChanges = () => {
    console.log("Adding registration changes");
    // Implementation would be added with actual API call
  };

  const handleAddDiscount = () => {
    console.log("Adding discount");
    // Implementation would be added with actual API call
  };

  const handleClearDiscount = () => {
    console.log("Clearing discount");
    // Implementation would be added with actual API call
  };

  const handleClearAll = () => {
    console.log("Clearing all");
    // Implementation would be added with actual API call
  };

  const handleSave = () => {
    console.log("Saving bill");
    // Implementation would make actual API call
  };

  const handleSaveAndPrint = () => {
    console.log("Saving and printing bill");
    // Implementation would make actual API call and trigger print
  };

  const handlePrint = () => {
    console.log("Printing bill");
    // Implementation would trigger print function
  };

  const handlePrintReceipt = () => {
    console.log("Printing receipt");
    // Implementation would trigger print receipt function
  };

  const summary = calculateSummary();

  if (loading && !selectedBill) {
    return (
      <div className="w-full h-full bg-white p-20">
        <div className="max-w-4xl mx-auto text-center py-8">
          Loading bills...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white p-20">
      <div className="max-w-4xl mx-auto">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {selectedBill ? (
          // Bill details page
          <div className="bg-white rounded shadow">
            <div className="py-4 px-6 bg-gray-100 rounded-t flex justify-between items-center">
              <h2 className="text-xl font-semibold">Bill Details</h2>
              <button 
                onClick={handleBack}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <Home className="h-4 w-4 mr-1" /> Back to Bills
              </button>
            </div>
            
            {loading ? (
              <p className="text-center py-8">Loading bill details...</p>
            ) : (
              <div className="p-6 space-y-6">
                {/* Bill header */}
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">Seen/Referred By</span>
                    <input 
                      type="text" 
                      placeholder="Scroller for Doc..." 
                      className="ml-2 border rounded px-2 py-1 text-sm"
                      value={billDetails?.referredBy || ""}
                      onChange={(e) => setBillDetails({...billDetails, referredBy: e.target.value})}
                    />
                  </div>
                  <div>
                    <span className="font-medium">Timestamp-Bill Date</span>
                    <input 
                      type="text" 
                      placeholder="Date / Time" 
                      className="ml-2 border rounded px-2 py-1 text-sm"
                      value={billDetails?.generation_date || ""}
                      readOnly
                    />
                  </div>
                </div>

                {/* Billing Items section */}
                <div>
                  <h3 className="font-medium mb-2">Billing items</h3>
                  <div className="flex space-x-2 mb-3">
                    <button 
                      className="bg-[#4C7E75] hover:bg-[#3d635c] text-white py-1 px-3 rounded text-sm"
                      onClick={handleAddBillingItem}
                    >
                      Add Billing Item
                    </button>
                    <button 
                      className="bg-[#4C7E75] hover:bg-[#3d635c] text-white py-1 px-3 rounded text-sm"
                      onClick={handleAddRegnChanges}
                    >
                      Add Regn. Changes
                    </button>
                    <button 
                      className="bg-[#4C7E75] hover:bg-[#3d635c] text-white py-1 px-3 rounded text-sm"
                      onClick={handleAddDiscount}
                    >
                      Add Discount
                    </button>
                    <button 
                      className="bg-[#4C7E75] hover:bg-[#3d635c] text-white py-1 px-3 rounded text-sm"
                      onClick={handleClearDiscount}
                    >
                      Clear Discount
                    </button>
                    <button 
                      className="bg-[#4C7E75] hover:bg-[#3d635c] text-white py-1 px-3 rounded text-sm"
                      onClick={handleClearAll}
                    >
                      Clear All
                    </button>
                  </div>
                  
                  {/* Billing items table */}
                  <div className="overflow-hidden rounded">
                    <div className="flex bg-[#1b2432] text-white py-2 rounded-t">
                      <div className="w-1/3 text-center">Date</div>
                      <div className="w-1/3 text-center">Item Description</div>
                      <div className="w-1/3 text-center">Amount</div>
                    </div>
                    {billDetails?.bill_items && billDetails.bill_items.length > 0 ? (
                      billDetails.bill_items.map((item) => (
                        <div key={item.bill_item_id} className="flex bg-[#1d2839] text-white py-2 border-t border-gray-700">
                          <div className="w-1/3 text-center">{billDetails.generation_date}</div>
                          <div className="w-1/3 text-center">{item.item_description}</div>
                          <div className="w-1/3 text-center">{formatAmount(item.item_amount * (item.quantity || 1))}</div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-[#1d2839] text-white py-4 text-center">
                        No billing items found
                      </div>
                    )}
                  </div>
                </div>

                {/* Payments section */}
                <div>
                  <div className="flex items-center mb-2">
                    <h3 className="font-medium">Payments</h3>
                    <button 
                      className="ml-4 bg-[#4C7E75] hover:bg-[#3d635c] text-white py-1 px-3 rounded text-sm"
                      onClick={handleAddPayment}
                    >
                      + Add Payment
                    </button>
                  </div>
                  
                  {/* Payments table */}
                  <div className="overflow-hidden rounded mb-4">
                    {/* Table header */}
                    <div className="flex bg-[#1b2432] text-white py-2 rounded-t">
                      <div className="w-1/4 truncate text-center px-1">Date</div>
                      <div className="w-1/4 truncate text-center px-1">Mode</div>
                      <div className="w-1/4 truncate text-center px-1">Amount</div>
                      <div className="w-1/4 truncate text-center px-1">Status + Proof (Trans...)</div>
                    </div>

                    {/* Table rows */}
                    {payments && payments.length > 0 ? (
                      payments.map((payment) => (
                        <div key={payment._id} className="flex bg-[#1d2839] text-white py-2 border-t border-gray-700">
                          <div className="w-1/4 truncate text-center px-1">{payment.payment_date}</div>
                          <div className="w-1/4 truncate text-center px-1">{payment.payment_method.enum}</div>
                          <div className="w-1/4 truncate text-center px-1">{formatAmount(payment.amount)}</div>
                          <div className="w-1/4 truncate text-center px-1">
                            {payment.status.enum} ({payment.transaction_id})
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-[#1d2839] text-white py-4 text-center">
                        No payments found
                      </div>
                    )}
                  </div>
                </div>

                {/* Billing summary */}
                <div className="text-center">
                  <p className="mb-4">
                    Billed: [{formatAmount(summary.billed)}] 
                    Discount / Insurance: [{formatAmount(summary.discount + summary.insurance)}] 
                    Paid: [{formatAmount(summary.paid)}]
                    Refunds: [{formatAmount(summary.refunds)}] 
                    Net: [{formatAmount(summary.net)}]
                  </p>
                </div>

              {/* Action buttons */}
              <div className="flex space-x-2 justify-start">
                  <button 
                    className="bg-[#4C7E75] hover:bg-[#3d635c] text-white py-2 px-4 rounded"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                  <button 
                    className="bg-[#4C7E75] hover:bg-[#3d635c] text-white py-2 px-4 rounded"
                    onClick={handleSaveAndPrint}
                  >
                    Save and Print
                  </button>
                  <button 
                    className="bg-[#4C7E75] hover:bg-[#3d635c] text-white py-2 px-4 rounded"
                    onClick={handlePrint}
                  >
                    Print
                  </button>
                  <button 
                    className="bg-[#4C7E75] hover:bg-[#3d635c] text-white py-2 px-4 rounded"
                    onClick={handlePrintReceipt}
                  >
                    Print Receipt
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Bills listing
          <>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Patient Bills</h2>
             
            </div>
            
            {bills.length > 0 ? (
              bills.map((bill) => (
                <div 
                  key={bill.bill_id} 
                  className="flex items-center justify-between bg-gray-900 text-white rounded mb-4 p-4"
                >
                  <div className="w-1/5 px-2 font-bold text-center text-white/80">
                    <p className="text-sm">Date</p>
                    <p className="mt-1 font-bold">{bill.date}</p>
                  </div>
                  <div className="w-1/5 px-2 font-bold text-center text-white/80">
                    <p className="text-sm">Bill Number</p>
                    <p className="mt-1">{bill.bill_number}</p>
                  </div>
                  <div className="w-1/5 px-2 font-bold text-center text-white/80">
                    <p className="text-sm">Total Amount</p>
                    <p className="mt-1">{formatAmount(bill.total_amount)}</p>
                  </div>
                  <div className="w-1/5 px-2 font-bold text-center text-white/80">
                    <p className="text-sm">Status</p>
                    <p className={`mt-1 ${
                      bill.payment_status === 'paid' ? 'text-green-400' : 
                      bill.payment_status === 'partially_paid' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {bill.payment_status === 'paid' ? 'Paid' : 
                       bill.payment_status === 'partially_paid' ? 'Partially Paid' : 'Pending'}
                    </p>
                  </div>
                  <div className="w-1/5 flex justify-end px-2">
                    <button 
                      onClick={() => handleView(bill.bill_id)}
                      className="bg-[#4C7E75] hover:bg-[#3d635c] text-white py-2 px-4 rounded"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8 bg-gray-100 rounded">
                <p className="mb-4">No Bills Available</p>
                <p className="text-sm">Create a new bill to get started</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Bills;