import React, { useState } from 'react';
import SearchForm from '../components/Form/SearchForm';
import PhotoUploadForm from '../components/Form/PhotoUploadForm';
import useSearch from '../hooks/useSearch';  // Import the custom hook
import usePhotoUpload from '../hooks/usePhotoUpload';
import DynamicTablePage from '../pages/DynamicTablePage';  // Assuming you have DynamicTablePage as a component

const SearchPage = ({ apiUrl }) => {
  const [activeTab, setActiveTab] = useState('search');  // State to manage active tab
  const {
    textResults,
    scopeResults,
    handymanScopeResults,
    selectedString,
    searchResult,
    fetchTextData,
    fetchScopeData,
    handleSearch,
  } = useSearch(apiUrl);  // Use the hook for search

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

  const combinedResults = `${scopeResults?.response || ''}\n\n${searchResult?.response || ''}`.trim();

  return (
    <div className="App">
      {/* Tabs for toggling between Search and Dynamic Table */}
      <div className="tab-buttons">
        <button onClick={() => setActiveTab('search')}>Search Tasks</button>
        <button onClick={() => setActiveTab('table')}>Estimate</button>
      </div>

      {/* Conditional rendering based on active tab */}
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
          {/* Pass search results (e.g., selectedString) to DynamicTablePage */}
          <DynamicTablePage selectedString={selectedString} />
        </div>
      )}
    </div>
  );
};

export default SearchPage;
