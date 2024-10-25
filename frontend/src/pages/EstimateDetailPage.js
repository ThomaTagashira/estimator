import React from 'react';
import { useParams } from 'react-router-dom';
import useFetchEstimateDetails from '../hooks/useFetchEstimateDetails';
import EstimateDetails from '../components/EstimateDetails';

const EstimateDetailPage = ({ apiUrl }) => {
  const { estimateId } = useParams();  // Get the estimateId from the URL params
  const { estimate, loading, error } = useFetchEstimateDetails(apiUrl, estimateId);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Estimate Detail</h2>
      <EstimateDetails estimate={estimate} />
    </div>
  );
};

export default EstimateDetailPage;
