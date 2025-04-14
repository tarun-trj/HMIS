import { jsPDF } from 'jspdf';

export const downloadPayslip = (record, setDownloadingId) => {
  try {
    setDownloadingId(record._id);

    const {
      employee_id = 'N/A',
      month_year = new Date(),
    } = record;

    const formatCurrency = (amount) => {
      const value = Number(amount) || 0;
      return `Rs. ${value.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    };

    // Format all currency values
    const basic_salary = formatCurrency(record.basic_salary);
    const allowance = formatCurrency(record.allowance);
    const deduction = formatCurrency(record.deduction);
    const net_salary = formatCurrency(record.net_salary);
    
    const doc = new jsPDF();
    let y = 20;
    const lineHeight = 10;
    
    // Add Hospital Header
    doc.setFontSize(16);
    doc.text('HMIS HOSPITAL', 105, y, { align: 'center' });
    y += lineHeight;
    doc.setFontSize(10);
    doc.text('IIT Guwahati, Assam - 781039', 105, y, { align: 'center' });
    y += lineHeight;
    doc.text('Phone: +91-XXX-XXX-XXXX | Email: hmis.iitg@gmail.com', 105, y, { align: 'center' });
    y += lineHeight * 2;

    // Payslip Title
    doc.setFillColor(230, 230, 230);
    doc.rect(0, y-5, 210, 10, 'F');
    doc.setFontSize(14);
    doc.text('SALARY SLIP', 105, y, { align: 'center' });
    y += lineHeight * 2;

    // Employee Details Section
    doc.setFontSize(11);
    doc.text(`Employee ID: ${employee_id}`, 20, y);
    doc.text(`Pay Period: ${new Date(month_year).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    })}`, 120, y);
    y += lineHeight;
    doc.text(`Generation Date: ${new Date().toLocaleDateString()}`, 20, y);
    doc.text(`Payment Status: ${record.payment_status || 'Pending'}`, 120, y);
    y += lineHeight * 2;

    // Earnings Section
    doc.setFillColor(240, 240, 240);
    doc.rect(15, y-5, 180, 10, 'F');
    doc.setFontSize(12);
    doc.text('EARNINGS', 20, y);
    doc.text('AMOUNT', 160, y);
    y += lineHeight * 1.5;
    
    doc.setFontSize(11);
    doc.text('Basic Salary:', 25, y);
    doc.text(basic_salary, 160, y, { align: 'left' });
    y += lineHeight;
    doc.text('Allowances:', 25, y);
    doc.text(allowance, 160, y, { align: 'left' });
    y += lineHeight * 2;

    // Deductions Section
    doc.setFillColor(240, 240, 240);
    doc.rect(15, y-5, 180, 10, 'F');
    doc.setFontSize(12);
    doc.text('DEDUCTIONS', 20, y);
    doc.text('AMOUNT', 160, y);
    y += lineHeight * 1.5;
    
    doc.setFontSize(11);
    doc.text('Total Deductions:', 25, y);
    doc.text(deduction, 160, y, { align: 'left' });
    y += lineHeight * 2;

    // Net Salary Section
    doc.setFillColor(230, 230, 230);
    doc.rect(15, y-5, 180, 10, 'F');
    doc.setFontSize(12);
    doc.text('NET SALARY:', 20, y);
    doc.setFont(undefined, 'bold');
    doc.text(net_salary, 160, y, { align: 'left' });
    doc.setFont(undefined, 'normal');

    // Footer
    y = 270;
    doc.setFontSize(9);
    doc.text('This is a computer generated payslip. No signature required.', 105, y, { align: 'center' });
    y += 5;
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, y, { align: 'center' });
    y += 5;
    doc.text('For any discrepancy, please contact the HR department within 7 days of generation.', 105, y, { align: 'center' });

    // Save PDF
    const month = new Date(month_year).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
    doc.save(`payslip_${employee_id}_${month}.pdf`);

    return true;
  } catch (error) {
    console.error('Error generating payslip:', error);
    throw error;
  } finally {
    setDownloadingId(null);
  }
};
