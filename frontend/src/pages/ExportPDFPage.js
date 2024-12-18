import React, { useRef } from 'react';
import { useLocation } from 'react-router-dom';
import useExportPDF from '../hooks/useExportPDF';
import './pages_css/ExportPDF.css';

const ExportPDFPage = () => {
  const { state } = useLocation();
  const { exportData } = state || {};
  const pdfRef = useRef();
  const { exportToPDF, isExporting } = useExportPDF();

  function getTodayDate() {
    const today = new Date();
    const options = { month: '2-digit', day: '2-digit', year: 'numeric' };
    return today.toLocaleDateString('en-US', options);
}

    const todayDate = getTodayDate();

  if (!exportData) {
    return <p>No data to display. Please generate the preview first.</p>;
  }

  const {
    companyName,
    address,
    phone,
    estimateId,
    clientName,
    clientAddress,
    clientPhone,
    clientEmail,
    projectName,
    projectLocation,
    startDate,
    endDate,
    tableData,
    // totalLaborCost,
    // totalMaterialCost,
    combinedTotal,
    discountPercent,
    totalDiscount,
    salesTaxPercent,
    totalSalesTax,
    grandTotal,
    applyDiscount,
  } = exportData;

  return (
    <div className='body'>
      <div ref={pdfRef} className="pdf-container">
        <div className="pdf-header">
          <h2>Estimate</h2>
          <p>{companyName} | {address} | {phone}</p>
        </div>

        <div className="sub-container">
          <div className="pdf-info-container">
            <div className='pdf-info-wrapper'>
              <div className="pdf-info-section">
                <h3>Project Information</h3>
                <div className="pdf-information">
                  <p>Project Name: {projectName}</p>
                  <p>Project Location: {projectLocation}</p>
                  <p>Start Date: {startDate}</p>
                  <p>End Date: {endDate}</p>
                </div>
              </div>

              <div className="pdf-info-section">
                <h3>Client Information</h3>
                <div className="pdf-information">
                  <p>Full Name: {clientName}</p>
                  <p>Address: {clientAddress}</p>
                  <p>Phone: {clientPhone}</p>
                  <p>Email: {clientEmail}</p>
                </div>
              </div>
            </div>
            <div>
              <div className='estimate-info-wrapper'>
                <div className="estimate-info">
                  <p>Estimate Number: {estimateId}</p>
                  <p>Date: {todayDate}</p>
                </div>
              </div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th></th>
                <th>Job</th>
                <th>Labor</th>
                <th>Material</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.job}</td>
                  <td>{item.laborCost}</td>
                  <td>{item.materialCost}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Totals</h3>
          <p>Subtotal: ${combinedTotal}</p>
          {applyDiscount && <p>Discount ({discountPercent}%): -${totalDiscount}</p>}
          <p>Tax ({salesTaxPercent}%): ${totalSalesTax}</p>
          <p><strong>Grand Total: ${grandTotal}</strong></p>
        </div>

        {!isExporting && (
          <button
            className="export-btn"
            onClick={() => exportToPDF(pdfRef, `Estimate_${estimateId}.pdf`)}
          >
            Export to PDF
          </button>
        )}
      </div>
    </div>
  );
};

export default ExportPDFPage;
