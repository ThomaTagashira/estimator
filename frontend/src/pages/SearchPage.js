import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import SearchForm from '../components/Form/SearchForm';
import PhotoUploadForm from '../components/Form/PhotoUploadForm';
import useSearch from '../hooks/useSearch';
import usePhotoUpload from '../hooks/usePhotoUpload';
import DynamicTablePage from '../pages/DynamicTablePage';
import './pages_css/SearchPage.css';

const SearchPage = ({ apiUrl }) => {
  const [activeTab, setActiveTab] = useState('search');
  const [tableData, setTableData] = useState([]);
  const [searchParams] = useSearchParams();
  const [refreshKey, setRefreshKey] = useState(0);

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
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          if (response.ok) {
            setTableData(data.tasks || []);
          } else {
            console.error('Failed to fetch estimate data:', data);
          }
        } else {
          console.error('Expected JSON, but received HTML:', await response.text());
        }
      } catch (error) {
        console.error('Error fetching estimate data:', error);
      }
    };

    fetchEstimateData();
  }, [estimateId, apiUrl]);

  const {
    selectedString,
    setSelectedString,
    fetchScopeData,
    handleSearch,
  } = useSearch(apiUrl, estimateId);

  const {
    selectedFile,
    data,
    uploadError,
    handleFileChange,
    handleSubmit,
    handleLineChange,
    handleRemoveLine,
    handleAllSearches,
    handleRemovePhoto,
    isUploading
  } = usePhotoUpload();

const handleTabSwitch = async (tab) => {
    setActiveTab(tab);
    if (tableData.length === 0) {
            fetchTableData();
    }
};

  const fetchTableData = async () => {
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
      setTableData(data?.tasks || []);
    } catch (error) {
      console.error('Failed to fetch estimate data:', error);
    }
  };


  return (
<div className="search-page-container">
  <div className="tab-container">
    <button
      className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
      onClick={() => handleTabSwitch('search')}
    >
      Search Tasks
    </button>
    <button
      className={`tab-button ${activeTab === 'table' ? 'active' : ''}`}
      onClick={() => handleTabSwitch('table')}
    >
      Estimate
    </button>
  </div>

  {activeTab === 'search' && (
    <div className="search-tab">
      <SearchForm onScopeSubmit={fetchScopeData} />
      <PhotoUploadForm
        onSearch={(query) => handleSearch(query, estimateId, setRefreshKey)}
        selectedFile={selectedFile}
        data={data}
        error={uploadError}
        isUploading={isUploading} 
        handleFileChange={handleFileChange}
        handleRemovePhoto={handleRemovePhoto} 
        handleSubmit={handleSubmit}
        handleLineChange={handleLineChange}
        handleAllSearches={(queries) => handleAllSearches(queries, estimateId)}
        handleRemoveLine={handleRemoveLine}
      />
    </div>
  )}

  {activeTab === 'table' && (
    <div className="table-tab">
      <DynamicTablePage
        selectedString={selectedString}
        setSelectedString={setSelectedString}
        apiUrl={apiUrl}
        estimateId={estimateId}
        refreshKey={refreshKey}
      />
    </div>
  )}
</div>

  );
};

export default SearchPage;
