import { useState, useEffect, useCallback } from 'react';

const useFetchEstimates = (apiUrl) => {
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchEstimates = useCallback(async ({ search = '', page = 1 } = {}) => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch(
        `${apiUrl}/api/saved-estimates/?search=${encodeURIComponent(search)}&limit=10&offset=${(page - 1) * 10}`, 
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
      if (!response.ok) throw new Error('Failed to fetch estimates');
      const data = await response.json();
      setEstimates(data.estimates);
      setTotalPages(Math.ceil(data.total / 10));
      setCurrentPage(page);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchEstimates();
  }, [fetchEstimates]);



  // const handleDeleteEstimate = async (estimateId) => {
  //   try {
  //     const accessToken = localStorage.getItem('access_token'); 

  //     if (!accessToken) {
  //       console.error('No access token found');
  //       return;
  //     }
  
  //     const response = await fetch(`${apiUrl}/api/delete-estimate/${estimateId}/`, {
  //       method: 'DELETE',
  //       headers: {
  //         Authorization: `Bearer ${accessToken}`, 
  //         'Content-Type': 'application/json',
  //       },
  //     });      
  //     if (!response.ok) {
  //       throw new Error(`Failed to delete estimate: ${response.status}`);
  //     }
  
  //     setEstimates((prev) => prev.filter((est) => est.estimate_id !== estimateId));
  //   } catch (err) {
  //     console.error('Failed to delete estimate:', err);
  //   }
  // };



  
  return {
    estimates,
    loading,
    error,
    // handleDeleteEstimate,
    fetchEstimates,
    currentPage,
    totalPages,
    setCurrentPage,
  };
};

export default useFetchEstimates;
