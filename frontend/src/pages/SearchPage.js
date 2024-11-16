import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import SearchForm from '../components/Form/SearchForm';
import PhotoUploadForm from '../components/Form/PhotoUploadForm';
import useSearch from '../hooks/useSearch';  // Import the custom hook
import usePhotoUpload from '../hooks/usePhotoUpload';
import DynamicTablePage from '../pages/DynamicTablePage';  // Assuming you have DynamicTablePage as a component

const SearchPage = ({ apiUrl }) => {
  const [activeTab, setActiveTab] = useState('search');
  const [tableData, setTableData] = useState([]);  // For dynamic table content
  const [searchParams] = useSearchParams();
  const [inputFields, setInputFields] = useState([]);

  const estimateId = searchParams.get('estimateId');

  useEffect(() => {
    console.log('Estimate ID:', estimateId);
  }, [estimateId]);

  // Fetch estimate data if `estimateId` is present
  useEffect(() => {
    const fetchEstimateData = async () => {
      if (!estimateId) return;
      try {
        const accessToken = localStorage.getItem('access_token');  // Fetch access token
        const response = await fetch(`${apiUrl}/api/saved-estimates/${estimateId}/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        // Check if the response is JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          if (response.ok) {
            setTableData(data.tasks || []);  // Assuming the estimate has tasks
          } else {
            console.error('Failed to fetch estimate data:', data);
          }
        } else {
          console.error("Expected JSON, but received HTML:", await response.text());
        }
      } catch (error) {
        console.error('Error fetching estimate data:', error);
      }
    };

    fetchEstimateData();
  }, [estimateId, apiUrl]);


  const {
    // textResults,
    // scopeResults,
    // handymanScopeResults,
    selectedString,
    setSelectedString,
    // searchResult,
    fetchTextData,
    fetchScopeData,
    handleSearch,
  } = useSearch(apiUrl);  // Use the custom search hook

  const {
    selectedFile,
    data,
    uploadError,
    handleFileChange,
    handleSubmit,
    handleLineChange,
    handleRemoveLine,
    handleAllSearches,
  } = usePhotoUpload();  // Use the photo upload hook

  // Update tableData with search results
//   useEffect(() => {
//     if (searchResult) {
//       console.log("SearchPage - API searchResult:", searchResult);
//         const extractedTasks = searchResult?.tasks || [];
//         setTableData((prevTableData) => {
//           console.log("Previous tableData:", prevTableData);
//           console.log("New extracted tasks:", extractedTasks);
//           return [...prevTableData, ...extractedTasks];  // Append new tasks to the table
//         });

//       // Extract selected string from the response
//       const context = searchResult?.response || '';
//       const startIndex = context.indexOf(':') + 1;
//       let endIndex = context.indexOf('Total Cost:');
//       if (endIndex === -1) {
//         endIndex = context.length;
//       }
//       const newSelectedString = context.substring(startIndex, endIndex).trim();
//       console.log("SearchPage - New selectedString:", newSelectedString);
//       setSelectedString(newSelectedString);
//     }
//   }, [searchResult]);



const handleTabSwitch = (tab) => {
  setActiveTab(tab);

  // Only handle when switching to the 'table' tab
  if (tab === 'table') {
    // Pull selectedStrings from local storage
    const savedStrings = JSON.parse(localStorage.getItem('selectedStrings')) || [];

    // Set the saved strings into the table data or input fields
    setInputFields(savedStrings);  // Assuming you are using `inputFields` for editable fields

    // Fetch the estimate data only the first time we switch to the table tab
    if (tableData.length === 0) {
      fetchTableData();  // Only fetch if data hasn't been loaded yet
    }
  }
};

// Fetch the estimate data for the table
const fetchTableData = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch(`${apiUrl}/api/saved-estimates/${estimateId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setTableData(data?.tasks || []);  // Assuming `tasks` is part of the estimate data
    } catch (error) {
      console.error('Failed to fetch estimate data:', error);
    }
  };


  return (
    <div className="App">
      {/* Tabs for toggling between Search and Dynamic Table */}
      <div className="tab-buttons">
        <button onClick={() => handleTabSwitch('search')}>Search Tasks</button>
        <button onClick={() => handleTabSwitch('table')}>Estimate</button>
      </div>

      {/* Conditional rendering based on active tab */}
      {activeTab === 'search' && (
        <div className="search-tab">
          <SearchForm onTextSubmit={fetchTextData} onScopeSubmit={fetchScopeData} />
          <h1>Photo Upload Form</h1>
          <PhotoUploadForm
            onSearch={handleSearch}  // Trigger handleSearch when file upload is done
            selectedFile={selectedFile}
            data={data}
            error={uploadError}
            handleFileChange={handleFileChange}
            handleSubmit={handleSubmit}
            handleLineChange={handleLineChange}
            handleAllSearches={handleAllSearches}
            handleRemoveLine={handleRemoveLine}
          />
        </div>
      )}

      {activeTab === 'table' && (
        <div className="table-tab">
          {/* Debugging reference to use inputFields */}
          {inputFields.length > 0 && (
            <div style={{ display: 'none' }}>
              {JSON.stringify(inputFields)}
            </div>
          )}
          <DynamicTablePage
            selectedString={selectedString}
            setSelectedString={setSelectedString}
            apiUrl={apiUrl}
            estimateId={estimateId}
          />
        </div>
      )}
    </div>
  );
};

export default SearchPage;
