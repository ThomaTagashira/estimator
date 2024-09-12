import { useState } from 'react';
import axios from 'axios';

const useSearch = (apiUrl) => {
  const [textResults, setTextResults] = useState({});
  const [scopeResults, setScopeResults] = useState(null);
  const [handymanScopeResults, setHandymanScopeResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedString, setSelectedString] = useState('');
  const [searchResult, setSearchResult] = useState(null);

  const fetchTextData = (inputText) => {
    setLoading(true);
    setError(null);

    axios.post(`${apiUrl}/api/index/`, { input_text: inputText })
      .then(response => {
        setTextResults(response.data);
        setScopeResults(null);
        setHandymanScopeResults(null);
      })
      .catch(error => {
        setError('Error fetching text data: ' + error.message);
      })
      .finally(() => setLoading(false));
  };

  const fetchScopeData = (jobScope) => {
    setLoading(true);
    setError(null);

    axios.post(`${apiUrl}/api/scope/`, { job_scope: jobScope })
      .then(response => {
        setScopeResults(response.data);
        setTextResults({});
        setHandymanScopeResults(null);

        const context = response.data.response;
        const startIndex = context.indexOf(':') + 1;
        let endIndex = context.indexOf('Total Cost:');
        if (endIndex === -1) {
          endIndex = context.length;
        }
        const selectedString = context.substring(startIndex, endIndex).trim();
        setSelectedString(selectedString);
      })
      .catch(error => {
        setError('Error fetching scope data: ' + error.message);
      })
      .finally(() => setLoading(false));
  };

  const handleSearch = async (lines) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${apiUrl}/api/line/`, { Line: lines });
      setSearchResult(response.data);

      const context = response.data.response;
      const startIndex = context.indexOf(':') + 1;
      let endIndex = context.indexOf('Total Cost:');
      if (endIndex === -1) {
        endIndex = context.length;
      }
      const selectedString = context.substring(startIndex, endIndex).trim();
      setSelectedString(selectedString);
    } catch (error) {
      setError('Error performing search: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    textResults,
    scopeResults,
    handymanScopeResults,
    loading,
    error,
    selectedString,
    searchResult,
    fetchTextData,
    fetchScopeData,
    handleSearch,
  };
};

export default useSearch;
