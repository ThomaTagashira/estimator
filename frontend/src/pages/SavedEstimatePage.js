import React from 'react';
import { useParams } from 'react-router-dom';
import useSavedEstimate from '../hooks/useSavedEstimate';
import EstimateDetails from '../components/EstimateDetails';

const SavedEstimatePage = ({ apiUrl }) => {
  const { estimateId } = useParams();
  const { estimateData, loading, error } = useSavedEstimate(apiUrl, estimateId);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <EstimateDetails estimateData={estimateData} />
    </div>
  );
};

export default SavedEstimatePage;
