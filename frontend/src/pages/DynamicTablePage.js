import React, { useState, useEffect } from 'react';
import './pages_css/Pages.css';
import useDynamicTable from '../hooks/useDynamicTable';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faXmark, faCheck, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import EstimateList from '../components/EstimateList';


const DynamicTablePage = ({ apiUrl, estimateId, selectedString, setSelectedString, refreshKey, isLoading  }) => {
    const {
        inputFields,
        editIndex,
        editValues,
        salesTaxPercent,
        discountPercent,
        applyDiscount,
        applyMargin,
        marginPercent,
        // logo,
        // handleLogoUpload,
        totalLaborCost,
        totalMaterialCost,
        combinedTotal,
        totalDiscount,
        totalSalesTax,
        grandTotal,
        setInputFields,
        handleAddAllRows,
        handleAddCustomRow,
        handleDiscountChange,
        handleDiscountBlur,
        handleDiscountFocus,
        handleSalesTaxChange,
        handleSalesTaxBlur,
        handleSalesTaxFocus,
        handleMarginChange,
        handleMarginFocus,
        handleMarginBlur,
        toggleDiscount,
        toggleMargin,
        handleRemoveField,
        handleDeleteTask,
        handleEditClick,
        handleEditChange,
        handleUpdateClick,
        splitTaskIntoColumns,
        applyMarginToLaborCost,
        setTableData,
        handleCancelClick,
        isProjectEditable,
        setIsProjectEditable,
        tableRef,
        tableData,
        handleClientCancel,
        handleProjectCancel,
        isClientEditable,
        setIsClientEditable,
        setSalesTaxPercent,
        setDiscountPercent,
        setMarginPercent,
        confirmDelete,
        cancelDelete,
        handleDeleteEstimate,
        deletingEstimate
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
  const [originalClientInfo, setOriginalClientInfo] = useState(null);
  const [originalProjectInfo, setOriginalProjectInfo] = useState(null);
  
  const navigate = useNavigate();


  const handleGeneratePreview = async () => {
    const exportData = {
      totalLaborCost,
      totalMaterialCost,
      combinedTotal,
      totalDiscount,
      totalSalesTax,
      grandTotal,
      discountPercent,
      salesTaxPercent,
      applyDiscount,
      estimateId,
      companyName,
      address,
      phone,
      clientName,
      clientAddress,
      clientPhone,
      clientEmail,
      projectName,
      projectLocation,
      startDate,
      endDate,
      tableData: tableData.map((item) => {
        const { job, laborCost, materialCost } = splitTaskIntoColumns(item);
  
        const cleanLaborCost = parseFloat(laborCost.replace('$', '')) || 0;
        const adjustedLaborCost = applyMargin
          ? applyMarginToLaborCost(cleanLaborCost)
          : cleanLaborCost;
  
        const cleanMaterialCost = parseFloat(materialCost.replace('$', '')) || 0;
        const validAdjustedLaborCost = parseFloat(adjustedLaborCost) || 0;
  
        return {
          job,
          laborCost: `$${validAdjustedLaborCost.toFixed(2)}`,
          materialCost: `$${cleanMaterialCost.toFixed(2)}`,
        };
      }),
    };
  
    const saveMarginData = async () => {
      const accessToken = localStorage.getItem('access_token');
      const marginData = {
        margin_percent: marginPercent,
        tax_percent: salesTaxPercent,
        discount_percent: discountPercent,
      };
  
      try {
        const response = await fetch(`${apiUrl}/api/save-estimate-margin/${estimateId}/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(marginData),
        });
  
        if (response.ok) {
          console.log('Margin info saved successfully');
        } else {
          console.error('Failed to save margin info');
        }
      } catch (error) {
        console.error('Error saving margin info:', error);
      }
    };
  
    await saveMarginData();
    navigate('/export-pdf', { state: { exportData } });
  };
  

  useEffect(() => {
    console.log('DynamicTablePage Refresh Key:', refreshKey);
  }, [refreshKey]);

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


useEffect(() => {
  const fetchSavedSearchResponses = async () => {
      try {
          const response = await axios.get(`${apiUrl}/api/get-search-responses/${estimateId}/`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
          });

          if (response.status === 200) {
              console.log('Retrieved search responses:', response.data);
              setInputFields(response.data.tasks);
          }
      } catch (error) {
          console.error('Failed to fetch search responses:', error.message);
      }
  };

  if (estimateId) {
      fetchSavedSearchResponses();
  }
}, [estimateId, apiUrl, setInputFields, refreshKey]); 


useEffect(() => {
  const fetchMarginData = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch(`${apiUrl}/api/get-estimate-margin/${estimateId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const marginData = await response.json();
        console.log('Fetched margin data:', marginData);

        if (marginData) {
          setMarginPercent(marginData.margin_percent || 0);
          setSalesTaxPercent(marginData.tax_percent || 0);
          setDiscountPercent(marginData.discount_percent || 0);
        } else {
          console.warn('No margin data found. Using default values.');
          setMarginPercent(0);
          setSalesTaxPercent(0);
          setDiscountPercent(0);
        }
      } else {
        console.error('Failed to fetch margin data: Status', response.status);
        setMarginPercent(0);
        setSalesTaxPercent(0);
        setDiscountPercent(0);
      }
    } catch (error) {
      console.error('Error fetching margin data:', error);
      setMarginPercent(0);
      setSalesTaxPercent(0);
      setDiscountPercent(0);
    }
  };

  fetchMarginData();
}, [apiUrl, estimateId, setMarginPercent, setSalesTaxPercent, setDiscountPercent]);



const handleClientSave = async () => {
  const accessToken = localStorage.getItem('access_token');
  const updatedClientInfo = {
    client_name: clientName,
    client_address: clientAddress,
    client_phone: clientPhone,
    client_email: clientEmail,
  };

  if (JSON.stringify(updatedClientInfo) !== JSON.stringify(originalClientInfo)) {
    try {
      const response = await fetch(`${apiUrl}/api/update-estimate/${estimateId}/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ client_data: updatedClientInfo }),
      });

      if (response.ok) {
        console.log('Client info updated successfully');
        setOriginalClientInfo(updatedClientInfo);
        setIsClientEditable(false);
      } else {
        console.error('Failed to update client info');
      }
    } catch (error) {
      console.error('Error saving client info:', error);
    }
  } else {
    console.log('No changes made to client info');
    setIsClientEditable(false);
  }
};

const handleProjectSave = async () => {
  const accessToken = localStorage.getItem('access_token');
  const updatedProjectInfo = {
    project_name: projectName,
    project_location: projectLocation,
    start_date: startDate,
    end_date: endDate,
  };

  if (JSON.stringify(updatedProjectInfo) !== JSON.stringify(originalProjectInfo)) {
    try {
      const response = await fetch(`${apiUrl}/api/update-estimate/${estimateId}/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ project_data: updatedProjectInfo }),
      });

      if (response.ok) {
        console.log('Project info updated successfully');
        setOriginalProjectInfo(updatedProjectInfo);
        setIsProjectEditable(false);
      } else {
        console.error('Failed to update project info');
      }
    } catch (error) {
      console.error('Error saving project info:', error);
    }
  } else {
    console.log('No changes made to project info');
    setIsProjectEditable(false);
  }
};


  
  return (
  <div className="DT-container">
    <div className='DT-header'>
      <h2>Estimate ID: {estimateId}</h2>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); 
                    confirmDelete(estimateId);
                  }}
                  className="DT-delete-button"
                >
                  <p>Delete Estimate</p>
                </button>
    </div>

    {deletingEstimate && (
        <div className="slide-out-panel">
          <p><strong>WARNING:</strong></p>
          <p>Are you sure you want to delete Estimate: <strong>{estimateId}</strong>?</p>
          <p>By selecting confirm, you will no longer have access to any records you have saved in:</p>
          <p>Project: <strong>{projectName || 'Unnamed Project'}</strong></p>
          <p>Estimate Number: <strong>{estimateId}</strong></p>
          
          <div className='slide-out-btn'>
            <button onClick={handleDeleteEstimate} className="confirm-button">Confirm</button>
            <button onClick={cancelDelete} className="cancel-button">Cancel</button>
          </div>
        </div>
      )}

      <hr className="divider" />

        <div className="DT-task-fields">
          <table className="dynamic-table">
            
            {/* <thead>
              <tr>
                <th></th>
                <th>Tasks to Add</th>
                <th></th>
              </tr>
            </thead> */}

            <tbody>
              {inputFields.map((field, index) => (
                <tr key={field.saved_response_id || index}>
                  <td>{index + 1}</td> 
                  <td>{field.task}</td> 
                  <td>
                    <button onClick={() => handleRemoveField(field.saved_response_id)} style={{float: 'right'}}>
                      <FontAwesomeIcon icon={faTrash} style={{ color: 'red', cursor: 'pointer'}} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div>
            <button 
              onClick={handleAddAllRows}
              disabled={isLoading}
              className="upload-btn"

            >
              {isLoading ? (
                <>
                  <div className="spinner"></div> Searching...
                </>
              ) : (
                'Add All Tasks to Estimate'
              )}                           
            </button>
          </div>
        </div>

      {/* <div>
        <input
          type="file"
          accept="image/*"
          onChange={handleLogoUpload}
        />
      </div> */}

  <hr className="divider" />
    
    <div className='info-section-container'>

      <div className="info-section">
        <div className="form-group">
          <label htmlFor="clientName">
            <span className="form-icon">👤</span> Client Name
          </label>
          <input
            id="clientName"
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            disabled={!isClientEditable}
            placeholder="Client Name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="clientAddress">
            <span className="form-icon">📍</span> Client Address
          </label>
          <input
            id="clientAddress"
            type="text"
            value={clientAddress}
            onChange={(e) => setClientAddress(e.target.value)}
            disabled={!isClientEditable}
            placeholder="Client Address"
          />
        </div>

        <div className="form-group">
          <label htmlFor="clientPhone">
            <span className="form-icon">📞</span> Client Phone
          </label>
          <input
            id="clientPhone"
            type="text"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            disabled={!isClientEditable}
            placeholder="Client Phone"
          />
        </div>

        <div className="form-group">
          <label htmlFor="clientEmail">
            <span className="form-icon">✉️</span> Client Email
          </label>
          <input
            id="clientEmail"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            disabled={!isClientEditable}
            placeholder="Client Email"
          />
        </div>

          <div className='edit'>
              {!isClientEditable ? (
              <button onClick={() => setIsClientEditable(true)}>Edit Client Info</button>
              ) : (
                <>  
                  <button onClick={handleClientSave}>Save</button>
                  <button onClick={handleClientCancel}>Cancel</button>
                </>
              )}
          </div>
      </div>

      <div className="info-section">
        <div className="form-group">
          <label htmlFor="projectName">
            <span className="form-icon">📋</span> Project Name
          </label>
          <input
            id="projectName"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            disabled={!isProjectEditable}
            placeholder="Project Name"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="projectLocation">
            <span className="form-icon">📍</span> Project Location
          </label>
          <input
            id="projectLocation"
            type="text"
            value={projectLocation}
            onChange={(e) => setProjectLocation(e.target.value)}
            disabled={!isProjectEditable}
            placeholder="Project Location"
          />
        </div>

        <div className="form-group">
          <label htmlFor="startDate">
            <span className="form-icon">📅</span> Start Date
          </label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={!isProjectEditable}
            placeholder="Start Date"
          />
        </div>

        <div className="form-group">
          <label htmlFor="endDate">
            <span className="form-icon">🛑</span> End Date
          </label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={!isProjectEditable}
            placeholder="End Date"
          />
        </div>

        <div className='edit'>
            {!isProjectEditable ? (
            <button onClick={() => setIsProjectEditable(true)}>Edit Project Info</button>
            ) : (
            <>  
              <button onClick={handleProjectSave}>Save</button>
              <button onClick={handleProjectCancel}>Cancel</button>
            </>
            )}
        </div>
      </div>
    </div>

  <hr className="divider" />

      <div className='buttons'>
        <button onClick={handleAddCustomRow}>
            Add New Task
        </button>  
      </div>

      <div className="dynamic-table">
        <div ref={tableRef}>
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Job</th>
                <th></th>
                <th>Labor</th>
                <th>Material</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {tableData && tableData.map((item, index) => {

                const { job, laborCost, materialCost } = splitTaskIntoColumns(item);
                const adjustedLaborCost = applyMargin ? applyMarginToLaborCost(laborCost) : laborCost;

                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td colSpan={2}>
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
                    <td className='DT-btn-group'>
                      {editIndex === index ? (
                        <>
                          <button onClick={() => handleUpdateClick(index)}>
                            <FontAwesomeIcon icon={faCheck} style={{ color: 'green', cursor: 'pointer' }} />
                          </button>

                          <button onClick={() => handleCancelClick(index)}>
                            < FontAwesomeIcon icon={faXmark} style={{ color: "red", cursor: "pointer" }} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEditClick(index)}>
                            <FontAwesomeIcon icon={faEdit} style={{ color: 'blue', cursor: 'pointer' }} />
                          </button>

                          <button onClick={() => handleDeleteTask(index)}>
                            <FontAwesomeIcon icon={faTrash} style={{ color: 'red', cursor: 'pointer' }} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}

              <tr>
                <td colSpan={2}><strong>Total Labor and Material</strong></td>
                <td></td>
                <td><strong>${totalLaborCost}</strong></td>
                <td><strong>${totalMaterialCost}</strong></td>
                <td></td>
              </tr>

              <tr>
                <td colSpan={3}><strong>Subtotal</strong></td>
                <td></td>
                <td><strong>${combinedTotal}</strong></td>
                <td></td>
              </tr>

              {applyDiscount && (
                <tr>
                  <td colSpan={3}><strong>Discount</strong></td>
                  <td className="center-input">
                  <input
                      type="number"
                      value={discountPercent}
                      onFocus={handleDiscountFocus}
                      onBlur={handleDiscountBlur}
                      onChange={handleDiscountChange}
                      placeholder="0%"
                      />
                  </td>
                  <td><strong>${totalDiscount}</strong></td>
                  <td></td>
                </tr>
              )}

              <tr>
                <td colSpan={3}><strong>Tax</strong></td>
                <td className="center-input">
                <input
                  type="number"
                  value={salesTaxPercent}
                  onFocus={handleSalesTaxFocus}
                  onBlur={handleSalesTaxBlur}
                  onChange={handleSalesTaxChange}
                  placeholder="0%"
                  />
                </td>
                <td><strong>${totalSalesTax}</strong></td>
                <td></td>
              </tr>

              <tr>
                <td colSpan={3}><strong>Total</strong></td>
                <td></td>
                <td><strong>${grandTotal}</strong></td>
                <td></td>
              </tr>

            </tbody>
          </table>
        </div>

        <div className='DT-margins-container'>
          <div className='buttons'>
            <button onClick={toggleMargin}>
              {applyMargin ? 'Remove Margin' : 'Add Margin %'}
            </button>       

            <button onClick={toggleDiscount}>
              {applyDiscount ? 'Remove Discount' : 'Apply Discount'}
            </button>        

              {applyMargin && (
                <div className='margin-input'>
                  <span>Enter Margin</span>
                  <input
                  type="number"
                  value={marginPercent}
                  onFocus={handleMarginFocus}
                  onBlur={handleMarginBlur}
                  onChange={handleMarginChange}
                  placeholder="0%"
                  />
                </div>
              )}
            </div>

            <div className='buttons'>
              <button onClick={handleGeneratePreview}>Generate Estimate Preview</button>
            </div>
          </div>
      </div>
    </div>
  );
};

export default DynamicTablePage;
