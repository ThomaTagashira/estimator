import { useState } from 'react';
import axios from 'axios';


const useSearch = (apiUrl) => {
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

    const saveSearchResponse = async (task, estimateId, setRefreshKey) => {
        console.log('estimateID:', estimateId);
        try {
            const payload = {
                search_responses: [{ task }],
            };
            console.log('Payload being sent:', payload);
    
            const accessToken = localStorage.getItem('access_token');
            const response = await fetch(`${apiUrl}/api/save-search-responses/${estimateId}/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
    
            if (!response.ok) {
                throw new Error('Failed to save search response');
            }
    
            console.log('Search response saved successfully');
            
            setRefreshKey((prevKey) => prevKey + 1);
        } catch (error) {
            console.error('Error saving search response:', error);
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

            const response = await axios.post(`${apiUrl}/api/index/`, { input_text: inputText });
            setTextResults(response.data);
            setScopeResults(null);
            setHandymanScopeResults(null);

            await saveSearchResponse([response.data]);

            await deductTokens(1); 
        } catch (error) {
            setError('Error fetching text data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query, estimateId, setRefreshKey) => {
        setLoading(true);
        setError(null);
    
        try {
            const tokenBalance = await fetchTokenBalance();
            if (tokenBalance < 1) {
                setError('Insufficient tokens to perform this search.');
                return;
            }
    
            const response = await axios.post(`${apiUrl}/api/line/`, { Line: query });
    
            await deductTokens(1);
    
            const context = response.data.response;
            const startIndex = context.indexOf(':') + 1;
            let endIndex = context.indexOf('Total Cost:');
            if (endIndex === -1) {
                endIndex = context.length;
            }
    
            const newSelectedString = context.substring(startIndex, endIndex).trim();
    
            await saveSearchResponse(newSelectedString, estimateId, setRefreshKey);
    
            setSearchResult([{ task: newSelectedString, saved_response_id: response.data.saved_response_id }]);
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
        handleSearch,
    };
};

export default useSearch;
