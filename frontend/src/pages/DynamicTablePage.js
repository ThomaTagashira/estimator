import React, { useState, useEffect } from 'react';
import '../components/DynamicTable/DynamicTable.css';
import useDynamicTable from '../hooks/useDynamicTable';
import axios from 'axios';

const DynamicTablePage = ({ apiUrl, estimateId, selectedString, setSelectedString }) => {
    const {
        // textResults,
        // scopeResults,
        // searchResult,
        // handleSearch,
        // fetchScopeData,
        inputFields,
        editIndex,
        editValues,
        salesTaxPercent,
        discountPercent,
        applyDiscount,
        applyMargin,
        marginPercent,
        // logo,
        handleLogoUpload,
        totalLaborCost,
        totalMaterialCost,
        combinedTotal,
        totalDiscount,
        totalSalesTax,
        grandTotal,
        setInputFields,
        handleAddAllRows,
        handleAddCustomRow,
        handleSalesTaxChange,
        handleDiscountChange,
        handleMarginChange,
        toggleDiscount,
        toggleMargin,
        handleInputChange,
        handleRemoveField,
        handleDeleteRow,
        handleEditClick,
        handleEditChange,
        handleUpdateClick,
        splitTaskIntoColumns,
        applyMarginToLaborCost,
        exportTablePDF,
        setTableData,
        tableRef,
        tableData,
    } = useDynamicTable(apiUrl, estimateId, selectedString, setSelectedString);

  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isEditable, setIsEditable] = useState(false);
  const [originalClientInfo, setOriginalClientInfo] = useState({});
  const [originalProjectInfo, setOriginalProjectInfo] = useState({});


  useEffect(() => {
    const fetchEstimateData = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        const response = await fetch(`${apiUrl}/api/saved-estimates/${estimateId}/`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (data.client_data && data.project_data) {
          setClientName(data.client_data[0]?.client_name || '');
          setClientAddress(data.client_data[0]?.client_address || '');
          setClientPhone(data.client_data[0]?.client_phone || '');
          setClientEmail(data.client_data[0]?.client_email || '');

          setProjectName(data.project_data[0]?.project_name || '');
          setProjectLocation(data.project_data[0]?.project_location || '');

          const formatDate = (dateString) => dateString ? dateString.split('T')[0] : '';

          setStartDate(formatDate(data.project_data[0]?.start_date));
          setEndDate(formatDate(data.project_data[0]?.end_date));

          setOriginalClientInfo(data.client_data[0]);
          setOriginalProjectInfo(data.project_data[0]);

        } else {
          console.error('Client or project data is missing');
        }
      } catch (error) {
        console.error('Failed to fetch estimate data:', error);
      }
    };

    fetchEstimateData();
  }, [apiUrl, estimateId]);

  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        const response = await fetch(`${apiUrl}/api/get-saved-business-info/`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
              if (response.ok) {
                const businessData = await response.json();
                console.log(businessData)

                
                if (businessData.length > 0) {
                  const businessInfo = businessData[0];
                  setCompanyName(businessInfo.business_name);
                  setAddress(businessInfo.business_address);
                  setPhone(businessInfo.business_phone);
              } else {
                  console.error('No business data found');
              }
          } else {
              console.error('Failed to fetch business data: Status', response.status);
          }
      } catch (error) {
          console.error('Failed to fetch business data:', error);
      }
  };

  fetchBusinessData();
}, [apiUrl]);

  useEffect(() => {
    const fetchSavedEstimateItems = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axios.get(`${apiUrl}/api/fetch-estimate-items/${estimateId}/`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (response.status === 200) {
                const savedItems = response.data.map(item => ({
                    task_number: item.task_number,
                    task_description: item.task_description
                }));

                setTableData(savedItems);
                localStorage.setItem('dynamicTableData', JSON.stringify(savedItems));
            }
        } catch (error) {
            console.error('Error fetching estimate items:', error);
        }
    };

    fetchSavedEstimateItems();
}, [apiUrl, estimateId, setTableData]);


//   console.log("DynamicTablePage - selectedString:", selectedString);

//   console.log("DynamicTablePage - inputFields:", inputFields);

  useEffect(() => {
    const savedStrings = JSON.parse(localStorage.getItem('selectedStrings')) || [];
    if (savedStrings.length > 0) {
      setInputFields(savedStrings);
    }
  }, [setInputFields]);


  const handleSave = async () => {
    const accessToken = localStorage.getItem('access_token');
    const updatedClientInfo = {
      client_name: clientName,
      client_address: clientAddress,
      client_phone: clientPhone,
      client_email: clientEmail,
    };
    const updatedProjectInfo = {
      project_name: projectName,
      project_location: projectLocation,
      start_date: startDate,
      end_date: endDate,
    };

    const clientInfoChanged = JSON.stringify(updatedClientInfo) !== JSON.stringify(originalClientInfo);
    const projectInfoChanged = JSON.stringify(updatedProjectInfo) !== JSON.stringify(originalProjectInfo);

    if (clientInfoChanged || projectInfoChanged) {
      try {
        const response = await fetch(`${apiUrl}/api/update-estimate/${estimateId}/`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client_data: updatedClientInfo,
            project_data: updatedProjectInfo,
          }),
        });

        if (response.ok) {
          console.log('Estimate updated successfully');
          setOriginalClientInfo(updatedClientInfo);
          setOriginalProjectInfo(updatedProjectInfo);
          setIsEditable(false);
        } else {
          console.error('Failed to update estimate');
        }
      } catch (error) {
        console.error('Failed to save updated data:', error);
      }
    }
  };

  React.useEffect(() => {
    const initialFields = localStorage.getItem('selectedStrings');
    console.log('LocalStorage selectedStrings:', initialFields);
  }, []);

  
  return (
    <div>
      {/* Dynamic Input Fields */}
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

      <button onClick={handleAddAllRows}>Add All Tasks to Estimate</button>

        <div className="dynamic-table-page">
      <h2>Estimate ID: {estimateId}</h2>

      <div>
        <input
          type="file"
          accept="image/*"
          onChange={handleLogoUpload}
        />
      </div>

      <div className="info-section">
        <h3>Client Information</h3>
        <div>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            disabled={!isEditable}
            placeholder="Client Name"
          />
        </div>
        <div>
          <input
            type="text"
            value={clientAddress}
            onChange={(e) => setClientAddress(e.target.value)}
            disabled={!isEditable}
            placeholder="Client Address"
          />
        </div>
        <div>
          <input
            type="text"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            disabled={!isEditable}
            placeholder="Client Phone"
          />
        </div>
        <div>
          <input
            type="text"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            disabled={!isEditable}
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
            disabled={!isEditable}
            placeholder="Project Name"
          />
        </div>
        <div>
          <input
            type="text"
            value={projectLocation}
            onChange={(e) => setProjectLocation(e.target.value)}
            disabled={!isEditable}
            placeholder="Project Location"
          />
        </div>
        <div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={!isEditable}
            placeholder="Start Date"
          />
        </div>
        <div>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={!isEditable}
            placeholder="End Date"
          />
        </div>
      </div>

      <div className="edit-buttons">
        {!isEditable ? (
          <button onClick={() => setIsEditable(true)}>Edit Client and Project Info</button>
        ) : (
          <button onClick={handleSave}>Save</button>
        )}
      </div>

      <div className="info-section">
        <button onClick={handleAddCustomRow}>Add New Line</button>
      </div>
              {/* Dynamic Table */}
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
                    {tableData && tableData.map((item, index) => {
                    //   console.log("Item in tableData:", item);

                      const { job, laborCost, materialCost } = splitTaskIntoColumns(item);
                    //   console.log("Job:", job, "Labor Cost:", laborCost, "Material Cost:", materialCost);

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

                    {/* Totals */}
                    <tr>
                      <td colSpan="2"><strong>Total Labor</strong></td>
                      <td><strong>${totalLaborCost}</strong></td>
                      <td><strong>${totalMaterialCost}</strong></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td colSpan="3"><strong>Subtotal</strong></td>
                      <td><strong>${combinedTotal}</strong></td>
                      <td></td>
                    </tr>

                    {/* Discount & Sales Tax */}
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
              {/* Discount & Margin */}
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
              {/* Export to PDF */}
              <button
                onClick={() =>
                    exportTablePDF({
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
                    })
                }
            >
                Generate Estimate
              </button>
            </div>
    </div>
  );
};

export default DynamicTablePage;
