import React, { useState, useEffect } from "react";

const DocConsultationBills = ({ consultationId }) => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data fetching function
  const fetchBillsByConsultationId = async (consultationId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            billNumber: "BILL-2025-001",
            date: "2025-04-03",
            amount: 120.00,
            status: "paid",
            items: [
              { description: "Consultation Fee", amount: 100.00 },
              { description: "Medicine", amount: 20.00 }
            ]
          }
        ]);
      }, 500);
    });
  };

  useEffect(() => {
    const loadBills = async () => {
      setLoading(true);
      try {
        const data = await fetchBillsByConsultationId(consultationId);
        setBills(data);
        setLoading(false);
      } catch (error) {
        console.error("Error loading bills:", error);
        setLoading(false);
      }
    };

    loadBills();
  }, [consultationId]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Bills</h2>
      
      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading bills...</p>
        </div>
      ) : bills.length > 0 ? (
        <div className="space-y-4">
          {bills.map((bill) => (
            <div key={bill.id} className="border rounded p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-semibold">Bill #{bill.billNumber}</h3>
                  <p className="text-sm text-gray-500">{bill.date}</p>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    bill.status === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {bill.status === 'paid' ? 'Paid' : 'Pending'}
                  </span>
                </div>
              </div>
              
              <div className="border-t border-b py-2 mb-4">
                <div className="flex justify-between text-sm text-gray-600 font-medium">
                  <span>Item</span>
                  <span>Amount</span>
                </div>
              </div>
              
              {bill.items.map((item, index) => (
                <div key={index} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                  <span>{item.description}</span>
                  <span>${item.amount.toFixed(2)}</span>
                </div>
              ))}
              
              <div className="mt-4 flex justify-between font-semibold">
                <span>Total</span>
                <span>${bill.amount.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-4">No bills available</p>
      )}
    </div>
  );
};

export default DocConsultationBills;
