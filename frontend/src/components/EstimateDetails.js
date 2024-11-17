import React from 'react';

const EstimateDetails = ({ estimate }) => {
  if (!estimate) return <p>No estimate found</p>;

  return (
    <div>
      <h2>Estimate Details</h2>
      <p><strong>Project Name:</strong> {estimate.project_name}</p>
      <p><strong>Estimate Number:</strong> {estimate.estimate_id}</p>
      <p><strong>Date Created:</strong> {new Date(estimate.date_created).toLocaleDateString()}</p>
      <p><strong>Last Modified:</strong> {new Date(estimate.last_modified).toLocaleDateString()}</p>
    </div>
  );
};

export default EstimateDetails;
