import React from 'react';
import { Link } from 'react-router-dom';

const EstimateList = ({ estimates, loading, error }) => {
    if (loading) {
      return <p>Loading estimates...</p>;
    }

    if (error) {
      return <p>{error}</p>;
    }

    if (estimates.length === 0) {
      return <p>No estimates available</p>;
    }
  return (
    <table>
      <thead>
        <tr>
          <th>Project Name</th>
          <th>Estimate Number</th>
          <th>Date Created</th>
          <th>Last Modified</th>
        </tr>
      </thead>
      <tbody>
        {estimates.map(estimate => (
          <tr key={estimate.estimateId}>
            <td>
              <Link to={`/search?estimateId=${estimate.estimate_id}`}>
                {estimate.project_name || 'Unnamed Project'}
              </Link>
            </td>
            <td>{estimate.estimate_id}</td>
            <td>{new Date(estimate.date_created).toLocaleDateString()}</td>
            <td>{new Date(estimate.last_modified).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default EstimateList;
