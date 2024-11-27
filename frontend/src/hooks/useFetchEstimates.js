import { useState, useEffect } from 'react';
import axios from 'axios';

const useFetchEstimates = (apiUrl) => {
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEstimates = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/saved-estimates/`);
        setEstimates(response.data);
      } catch (error) {
        setError('Failed to fetch estimates');
      } finally {
        setLoading(false);
      }
    };

    fetchEstimates();
  }, [apiUrl]);

const handleDeleteEstimate = (estimateId) => {
    setEstimates(estimates.filter((e) => e.estimate_id !== estimateId));
  };

  return { 
    estimates, 
    loading, 
    error,
    handleDeleteEstimate
  };
};

export default useFetchEstimates;
