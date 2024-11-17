
import { useState } from 'react';
import axios from 'axios';

const useSearch = (apiUrl, tokenApiUrl) => {
    const [textResults, setTextResults] = useState({});
    const [scopeResults, setScopeResults] = useState(null);
    const [handymanScopeResults, setHandymanScopeResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedString, setSelectedString] = useState([]);
    const [searchResult, setSearchResult] = useState(null);

    const fetchTokenBalance = async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/get-user-token-count/`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
            });
            return response.data.token_balance || 0;
        } catch (error) {
            console.error('Error fetching token balance:', error.message);
            return 0;
        }
    };

    const deductTokens = async (tokensToDeduct) => {
        try {
            await axios.post(`${apiUrl}/api/deduct-tokens/`, 
                { tokens: tokensToDeduct },
                { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } }
            );
        } catch (error) {
            console.error('Error deducting tokens:', error.message);
        }
    };

    const fetchTextData = async (inputText) => {
        setLoading(true);
        setError(null);

        try {
            const tokenBalance = await fetchTokenBalance();
            if (tokenBalance < 1) {
                setError('Insufficient tokens to perform this search.');
                return;
            }

            const response = await axios.post(`${apiUrl}/api/index/`, { input_text: inputText })
            setTextResults(response.data);
            setScopeResults(null);
            setHandymanScopeResults(null);

            await deductTokens(1); // number of tokens to deduct here (1)
        } catch (error) {
            setError('Error fetching text data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchScopeData = async (jobScope) => {
        setLoading(true);
        setError(null);

        try {
            const tokenBalance = await fetchTokenBalance();
            if (tokenBalance < 1) {
                setError('Insufficient tokens to perform this search.');
                return;
            }

            const response = await axios.post(`${apiUrl}/api/scope/`, { job_scope: jobScope });
            setScopeResults(response.data);
            setTextResults({});
            setHandymanScopeResults(null);

            const context = response.data.response;
            const startIndex = context.indexOf(':') + 1;
            let endIndex = context.indexOf('Total Cost:');
            if (endIndex === -1) {
                endIndex = context.length;
            }
            const newSelectedString = context.substring(startIndex, endIndex).trim();

            setSelectedString((prev) => [...prev, newSelectedString]);

            await deductTokens(1); // number of tokens to deduct here (1)
        } catch (error) {
            setError('Error fetching scope data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query) => {
      setLoading(true);
      setError(null);
  
      try {
          const tokenBalance = await fetchTokenBalance();
  
          const tokensRequiredPerSearch = 1; // number of tokens to deduct here (1)
          if (tokenBalance < tokensRequiredPerSearch) {
              setError('Insufficient tokens to perform this search.');
              return;
          }
  
          const response = await axios.post(`${apiUrl}/api/line/`, { Line: query });
  
          await deductTokens(tokensRequiredPerSearch);
  
          const context = response.data.response;
          const startIndex = context.indexOf(':') + 1;
          let endIndex = context.indexOf('Total Cost:');
          if (endIndex === -1) {
              endIndex = context.length;
          }
          const newSelectedString = context.substring(startIndex, endIndex).trim();
  
          setSelectedString((prev) => {
              const updatedStrings = [...prev, newSelectedString];
  
              localStorage.setItem('selectedStrings', JSON.stringify(updatedStrings));
  
              return updatedStrings;
          });
  
          setSearchResult(response.data);
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
      setSelectedString,
      searchResult,
      fetchTextData,
      fetchScopeData,
      handleSearch,
    };
};

export default useSearch;
