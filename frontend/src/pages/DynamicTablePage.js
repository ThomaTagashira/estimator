import React from 'react';
import useDynamicTable from '../hooks/useDynamicTable'; // Make sure this is correctly imported
import '../components/DynamicTable/DynamicTable.css';
import { exportPDF } from '../components/utils/exportPDF';

const DynamicTablePage = ({ selectedString }) => {
    const {
      inputFields,
      tableData,
      editIndex,
      editValues,
      salesTaxPercent,
      discountPercent,
      applyDiscount,
      applyMargin,
      marginPercent,
      logo,
      companyName,
      address,
      phone,
      estimateNumber,
      clientName,
      clientAddress,
      clientPhone,
      clientEmail,
      projectName,
      projectLocation,
      startDate,
      endDate,
      totalLaborCost,
      totalMaterialCost,
      combinedTotal,
      totalDiscount,
      totalSalesTax,
      grandTotal,
      handleAddAllRows,
      handleAddCustomRow,
      handleSalesTaxChange,
      handleDiscountChange,
      handleLogoUpload,
      handleMarginChange,
      toggleDiscount,
      toggleMargin,
      handleInputChange,
      handleRemoveField,
      handleDeleteRow,
      handleEditClick,
      handleEditChange,
      handleUpdateClick,
      calculateTotals,
      splitTaskIntoColumns,
      applyMarginToLaborCost,
      setCompanyName,
      setAddress,
      setPhone,
      setEstimateNumber,
      setClientName,
      setClientAddress,
      setClientPhone,
      setClientEmail,
      setProjectName,
      setProjectLocation,
      setStartDate,
      setEndDate,
      exportTablePDF,
      tableRef,

    } = useDynamicTable(selectedString);



    return (
      <div>
        {inputFields.map((value, index) => (
          <div key={index}>
            <input
              type="text"
              value={value}
              onChange={(e) => handleInputChange(index, e.target.value)}
              placeholder="Enter a task"
            />
            <button onClick={() => handleRemoveField(index)}>Remove Line</button>
          </div>
        ))}
        <button onClick={handleAddAllRows}>Add All Tasks</button>
        <button onClick={handleAddCustomRow}>Add Custom</button>

        <div className="info-container">
          <div className="info-section">
            <h3>Company Information</h3>
            <div>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Company Name"
              />
            </div>
            <div>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Address"
              />
            </div>
            <div>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone"
              />
            </div>
            <div>
              <input
                type="text"
                value={estimateNumber}
                onChange={(e) => setEstimateNumber(e.target.value)}
                placeholder="Estimate Number"
              />
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
              />
            </div>
          </div>

          <div className="info-section">
            <h3>Client Information</h3>
            <div>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Client Name"
              />
            </div>
            <div>
              <input
                type="text"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                placeholder="Client Address"
              />
            </div>
            <div>
              <input
                type="text"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="Client Phone"
              />
            </div>
            <div>
              <input
                type="text"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="Client Email"
              />
            </div>
          </div>

          <div className="info-section">
            <h3>Project Information</h3>
            <div>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Project Name"
              />
            </div>
            <div>
              <input
                type="text"
                value={projectLocation}
                onChange={(e) => setProjectLocation(e.target.value)}
                placeholder="Project Location"
              />
            </div>
            <div>
              <input
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start Date"
              />
            </div>
            <div>
              <input
                type="text"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="End Date"
              />
            </div>
          </div>
        </div>

        <div>
          <button onClick={toggleDiscount}>
            {applyDiscount ? 'Remove Discount' : 'Apply Discount'}
          </button>
        </div>
        <div>
          <button onClick={toggleMargin}>
            {applyMargin ? 'Remove Margin' : 'Add Margin %'}
          </button>
          {applyMargin && (
            <div>
              <span>Enter Margin Percentage</span>
              <input
                type="number"
                value={marginPercent}
                onChange={handleMarginChange}
                style={{ width: '50px' }}
                placeholder="0"
              />
            </div>
          )}
        </div>

        <div ref={tableRef}>
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Job</th>
                <th>Labor Cost</th>
                <th>Material Cost</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((item, index) => {
                const { job, laborCost, materialCost } = splitTaskIntoColumns(item);
                const adjustedLaborCost = applyMargin ? applyMarginToLaborCost(laborCost) : laborCost;
                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      {editIndex === index ? (
                        <textarea
                          name="job"
                          value={editValues.job}
                          onChange={handleEditChange}
                          rows="3"
                          style={{ width: '100%' }}
                        />
                      ) : (
                        job
                      )}
                    </td>
                    <td>
                      {editIndex === index ? (
                        <input
                          type="text"
                          name="laborCost"
                          value={editValues.laborCost}
                          onChange={handleEditChange}
                          placeholder="0.00"
                        />
                      ) : (
                        `$${adjustedLaborCost}`
                      )}
                    </td>
                    <td>
                      {editIndex === index ? (
                        <input
                          type="text"
                          name="materialCost"
                          value={editValues.materialCost}
                          onChange={handleEditChange}
                          placeholder="0.00"
                        />
                      ) : (
                        `$${materialCost}`
                      )}
                    </td>
                    <td>
                      {editIndex === index ? (
                        <button onClick={() => handleUpdateClick(index)}>Update</button>
                      ) : (
                        <>
                          <button onClick={() => handleEditClick(index)}>Edit</button>
                          <button onClick={() => handleDeleteRow(index)}>Delete</button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
              <tr>
                <td colSpan="2"><strong></strong></td>
                <td><strong>${totalLaborCost}</strong></td>
                <td><strong>${totalMaterialCost}</strong></td>
                <td></td>
              </tr>
              <tr>
                <td colSpan="3"><strong>Subtotal</strong></td>
                <td><strong>${combinedTotal}</strong></td>
                <td></td>
              </tr>
              {applyDiscount && (
                <tr>
                  <td colSpan="2"><strong>Discount</strong></td>
                  <td>
                    <input
                      type="number"
                      value={discountPercent}
                      onChange={handleDiscountChange}
                      style={{ width: '50px' }}
                      placeholder="0"
                    />
                  </td>
                  <td><strong>${totalDiscount}</strong></td>
                  <td></td>
                </tr>
              )}
              <tr>
                <td colSpan="2"><strong>Tax</strong></td>
                <td>
                  <input
                    type="number"
                    value={salesTaxPercent}
                    onChange={handleSalesTaxChange}
                    style={{ width: '50px' }}
                    placeholder="0"
                  />
                </td>
                <td><strong>${totalSalesTax}</strong></td>
                <td></td>
              </tr>
              <tr>
                <td colSpan="3"><strong>Total</strong></td>
                <td><strong>${grandTotal}</strong></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
        <button onClick={exportTablePDF}>Generate Estimate</button>
    </div>
  );
};

export default DynamicTablePage;
