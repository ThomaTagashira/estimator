import React from 'react';
import { Link } from 'react-router-dom';

const EstimateList = ({ estimates, loading, error, onDelete, apiUrl }) => {
  const handleDelete = async (estimateId) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch(`${apiUrl}/api/delete-estimate/${estimateId}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        onDelete(estimateId);
      } else {
        console.error('Failed to delete estimate:', response.statusText);
      }
    } catch (err) {
      console.error('Error deleting estimate:', err);
    }
  };
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
            <td>
              <button onClick={() => handleDelete(estimate.estimate_id)}>
                Delete Estimate
              </button>
            </td>
          </tr>
          
        ))}
      </tbody>
    </table>
  );
};

export default EstimateList;
