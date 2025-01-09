import { useState, useEffect } from 'react';
import axios from 'axios';

const useSavedEstimate = (apiUrl, estimateId) => {
  const [estimateData, setEstimateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSavedEstimate = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/saved-estimates/${estimateId}/`);
        setEstimateData(response.data);
      } catch (err) {
        setError('Failed to fetch saved estimate');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedEstimate();
  }, [apiUrl, estimateId]);

  return { estimateData, loading, error };
};

export default useSavedEstimate;
