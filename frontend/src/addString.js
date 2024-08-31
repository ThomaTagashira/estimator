import React, { useState, useEffect, useRef } from 'react';
import { exportPDF } from './exportPDF';
import { resizeImage } from './logoResize';
import './DynamicTable.css';

function DynamicTable({ selectedString }) {
  const [inputFields, setInputFields] = useState([]); // State to hold dynamic input fields
  const [tableData, setTableData] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editValues, setEditValues] = useState({ job: '', laborCost: '', materialCost: '' });
  const [salesTaxPercent, setSalesTaxPercent] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [applyDiscount, setApplyDiscount] = useState(false);
  const [marginPercent, setMarginPercent] = useState(0);
  const [applyMargin, setApplyMargin] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [estimateNumber, setEstimateNumber] = useState('');
  const [logo, setLogo] = useState(null);
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const tableRef = useRef();

  useEffect(() => {
    // Whenever a new selectedString is provided, add it as a new input field
    if (selectedString) {
      setInputFields((prevFields) => [...prevFields, selectedString]);
    }
  }, [selectedString]);

  const handleInputChange = (index, value) => {
    const updatedFields = [...inputFields];
    updatedFields[index] = value;
    setInputFields(updatedFields);
  };

  const handleAddAllRows = () => {
    const newTasks = inputFields.filter((value) => value.trim() !== ''); // Get non-empty values
    setTableData([...tableData, ...newTasks]); // Add all tasks to table data
    setInputFields([]); // Clear all input fields
  };

  const handleAddCustomRow = () => {
    const customRow = 'Custom Job Labor Cost: $0.00 Material Cost: $0.00';
    setTableData([...tableData, customRow]);
  };

  const handleRemoveField = (index) => {
    // Remove the field at the specified index
    const updatedFields = inputFields.filter((_, i) => i !== index);
    setInputFields(updatedFields);
  };

  const handleDeleteRow = (index) => {
    const newTableData = tableData.filter((_, i) => i !== index);
    setTableData(newTableData);
  };

  const handleEditClick = (index) => {
    setEditIndex(index);
    const { job, laborCost, materialCost } = splitTaskIntoColumns(tableData[index]);
    setEditValues({ job, laborCost: laborCost.replace('$', ''), materialCost: materialCost.replace('$', '') });
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditValues({ ...editValues, [name]: value });
  };

  const handleUpdateClick = (index) => {
    const { job, laborCost, materialCost } = splitTaskIntoColumns(tableData[index]);

    const updatedJob = editValues.job || job;
    const updatedLaborCost = editValues.laborCost !== '' ? parseFloat(editValues.laborCost).toFixed(2) : laborCost.replace('$', '');
    const updatedMaterialCost = editValues.materialCost !== '' ? parseFloat(editValues.materialCost).toFixed(2) : materialCost.replace('$', '');

    const updatedTask = `${updatedJob} Labor Cost: $${updatedLaborCost} Material Cost: $${updatedMaterialCost}`;
    const newTableData = tableData.map((item, i) => (i === index ? updatedTask : item));
    setTableData(newTableData);
    setEditIndex(null);
  };

  const handleSalesTaxChange = (event) => {
    const value = event.target.value;
    setSalesTaxPercent(value ? parseFloat(value) : 0);
  };

  const handleDiscountChange = (event) => {
    const value = event.target.value;
    setDiscountPercent(value ? parseFloat(value) : 0);
  };

  const toggleDiscount = () => {
    setApplyDiscount(!applyDiscount);
  };

  const handleMarginChange = (event) => {
    const value = event.target.value;
    setMarginPercent(value ? parseFloat(value) : 0);
  };

  const toggleMargin = () => {
    setApplyMargin(!applyMargin);
  };

  const splitTaskIntoColumns = (task) => {
    const laborCostIndex = task.indexOf('Labor Cost:');
    const materialCostIndex = task.indexOf('Material Cost:');

    const job = task.substring(0, Math.min(
        laborCostIndex !== -1 ? laborCostIndex : task.length,
        materialCostIndex !== -1 ? materialCostIndex : task.length
    )).trim();

    let laborCost = '';
    if (laborCostIndex !== -1) {
        const laborCostMatch = task.substring(laborCostIndex).match(/Labor Cost: \$([\d.]+)/);
        if (laborCostMatch) {
            laborCost = parseFloat(laborCostMatch[1]).toFixed(2); // Removed the $ sign
        }
    }

    let materialCost = '';
    if (materialCostIndex !== -1) {
        const materialCostMatch = task.substring(materialCostIndex).match(/Material Cost: \$([\d.]+)/);
        if (materialCostMatch) {
            materialCost = parseFloat(materialCostMatch[1]).toFixed(2); // Removed the $ sign
        }
    }

    return {
        job,
        laborCost: laborCost || '0.00',
        materialCost: materialCost || '0.00'
    };
};

  const applyMarginToLaborCost = (laborCost) => {
    const cost = parseFloat(laborCost.replace('$', '')) || 0;
    const marginAmount = cost * (marginPercent / 100);
    return (cost + marginAmount).toFixed(2);
  };

  const calculateTotals = () => {
    let totalLaborCost = 0;
    let totalMaterialCost = 0;

    tableData.forEach(item => {
      const { laborCost, materialCost } = splitTaskIntoColumns(item);
      const adjustedLaborCost = applyMargin ? applyMarginToLaborCost(laborCost) : laborCost.replace('$', '');
      totalLaborCost += parseFloat(adjustedLaborCost || 0);
      totalMaterialCost += parseFloat(materialCost.replace('$', '') || 0);
    });

    const combinedTotal = totalLaborCost + totalMaterialCost;
    const totalDiscount = applyDiscount ? combinedTotal * (discountPercent / 100) : 0;
    const totalSalesTax = (combinedTotal - totalDiscount) * (salesTaxPercent / 100);
    const grandTotal = combinedTotal - totalDiscount + totalSalesTax;

    return {
      totalLaborCost: totalLaborCost.toFixed(2),
      totalMaterialCost: totalMaterialCost.toFixed(2),
      combinedTotal: combinedTotal.toFixed(2),
      totalDiscount: totalDiscount.toFixed(2),
      totalSalesTax: totalSalesTax.toFixed(2),
      grandTotal: grandTotal.toFixed(2)
    };
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    resizeImage(file, 50, 50, (resizedImage) => {
      setLogo(resizedImage);
    });
  };

  const exportTablePDF = () => {
    const {
      totalLaborCost,
      totalMaterialCost,
      combinedTotal,
      totalDiscount,
      totalSalesTax,
      grandTotal
    } = calculateTotals();

    exportPDF(
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
      discountPercent,
      totalDiscount,
      salesTaxPercent,
      totalSalesTax,
      grandTotal,
      tableData.map((item, index) => {
        const { job, laborCost, materialCost } = splitTaskIntoColumns(item);
        const adjustedLaborCost = applyMargin ? applyMarginToLaborCost(laborCost) : laborCost.replace('$', '');
        return { job, laborCost: `$${adjustedLaborCost}`, materialCost };
      }),
      applyDiscount // Pass the applyDiscount state
    );
  };

  const { totalLaborCost, totalMaterialCost, combinedTotal, totalDiscount, totalSalesTax, grandTotal } = calculateTotals();

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
            <span>Enter Margin in Percents</span>
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
            `$${adjustedLaborCost}` // Add $ sign here for display
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
            `$${materialCost}` // Add $ sign here for display
          )}
        </td>
        <td>
          {editIndex === index ? (
            <button onClick={() => handleUpdateClick(index)}>Update</button>
          ) : (
            <>
              <button className="no-print" onClick={() => handleEditClick(index)}>Edit</button>
              <button className="no-print" onClick={() => handleDeleteRow(index)}>Delete</button>
            </>
          )}
        </td>
      </tr>
    );
  })}
</tbody>
        </table>
      </div>
      <button onClick={exportTablePDF}>Generate Estimate</button>
    </div>
  );
}

export default DynamicTable;
