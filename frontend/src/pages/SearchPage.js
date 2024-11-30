import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import SearchForm from '../components/Form/SearchForm';
import PhotoUploadForm from '../components/Form/PhotoUploadForm';
import useSearch from '../hooks/useSearch';  
import usePhotoUpload from '../hooks/usePhotoUpload';
import DynamicTablePage from '../pages/DynamicTablePage'; 

const SearchPage = ({ apiUrl }) => {
  const [activeTab, setActiveTab] = useState('search');
  const [tableData, setTableData] = useState([]);  
  const [searchParams] = useSearchParams();
  const [inputFields, setInputFields] = useState([]);

  const estimateId = searchParams.get('estimateId');

  useEffect(() => {
    console.log('Estimate ID:', estimateId);
  }, [estimateId]);

  useEffect(() => {
    const fetchEstimateData = async () => {
      if (!estimateId) return;
      try {
        const accessToken = localStorage.getItem('access_token');  
        const response = await fetch(`${apiUrl}/api/saved-estimates/${estimateId}/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          if (response.ok) {
            setTableData(data.tasks || []);  
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
  } = useSearch(apiUrl);  

  const {
    selectedFile,
    data,
    uploadError,
    handleFileChange,
    handleSubmit,
    handleLineChange,
    handleRemoveLine,
    handleAllSearches,
  } = usePhotoUpload();  


  const handleTabSwitch = (tab) => {
    console.log('Switching to tab:', tab);
    setActiveTab(tab);
  
    if (tab === 'table') {
      const savedStrings = JSON.parse(localStorage.getItem('selectedStrings')) || [];
      const sanitizedStrings = savedStrings.filter((str) => str.trim() !== '');
      console.log('Before sanitization:', savedStrings);
      console.log('After sanitization:', sanitizedStrings);
      setInputFields((prev) => {
        console.log('Previous inputFields:', prev);
        console.log('New inputFields:', sanitizedStrings);
        return sanitizedStrings;
      });
  
      if (tableData.length === 0) {
        fetchTableData();
      }
    }
  };

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
      setTableData(data?.tasks || []);  
    } catch (error) {
      console.error('Failed to fetch estimate data:', error);
    }
  };


  return (
    <div className="App">
      <div className="tab-buttons">
        <button onClick={() => handleTabSwitch('search')}>Search Tasks</button>
        <button onClick={() => handleTabSwitch('table')}>Estimate</button>
      </div>

      {activeTab === 'search' && (
        <div className="search-tab">
          <SearchForm onTextSubmit={fetchTextData} onScopeSubmit={fetchScopeData} />
          <h1>Photo Upload Form</h1>
          <PhotoUploadForm
            onSearch={handleSearch}  
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
