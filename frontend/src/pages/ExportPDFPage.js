import React, { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useExportPDF from '../hooks/useExportPDF';
import './pages_css/ExportPDF.css';

const ExportPDFPage = () => {
  const { state } = useLocation();
  const { exportData } = state || {};
  const pdfRef = useRef();
  const { exportToPDF, isExporting } = useExportPDF();
  const navigate = useNavigate(); 


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
    totalLaborCost,
    totalMaterialCost,
    combinedTotal,
    discountPercent,
    totalDiscount,
    salesTaxPercent,
    totalSalesTax,
    grandTotal,
    applyDiscount,
  } = exportData;

  const prevButton = (estimateId) => {
    navigate(`/search?estimateId=${estimateId}&tab=table`);
  };

  return (
    <div className='body'>
      <div ref={pdfRef} className="pdf-container">
        <div className="pdf-header">
          <h2>Estimate</h2>
          <p>{companyName} | {address} | {phone}</p>
        </div>
        <hr className="divider" />

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

          <table className='pdf-table'>
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

            <tbody className='pdf-table-totals'>
                <tr>
                  <td colSpan={4}>
                    <hr className="divider" />
                  </td>
                </tr>

                <tr>
                  <td colSpan={2}><strong>Total Labor and Material Costs</strong></td>
                  <td><strong>${totalLaborCost}</strong></td>
                  <td><strong>${totalMaterialCost}</strong></td>
                </tr>

                <tr>
                  <td colSpan={3}><strong>Subtotal</strong></td>
                  <td><strong>${combinedTotal}</strong></td>
                </tr>

                {applyDiscount &&
                  <tr>
                    <td colSpan={2}><strong>Discount</strong></td>
                    <td>{discountPercent}%</td>
                    <td><strong>-${totalDiscount}</strong></td>
                  </tr>
                }

                <tr>
                  <td colSpan={2}><strong>Tax</strong></td>
                  <td>{salesTaxPercent}%</td>
                  <td><strong>${totalSalesTax}</strong></td>
                </tr>

                <tr>
                  <td colSpan={3}><strong>Total</strong></td>
                  <td><strong>${grandTotal}</strong></td>
                </tr>                            
             </tbody>
          </table>
          <hr className="divider" />
        </div>

        <div className='disclaimer-section'>
          <p><strong>Disclaimer: This estimate is for informational purposes only and is not a contract or agreement. Final costs and terms will be determined upon the approval of a formal contract. All prices are subject to change based on material availability, labor rates, and project modifications.</strong></p>
        </div>
        
        <div className='export-btn-container'>
          <button 
            className='export-btn' 
            onClick={() => prevButton(estimateId)}
          >
            Previous
          </button>

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
    </div>
  );
};

export default ExportPDFPage;
