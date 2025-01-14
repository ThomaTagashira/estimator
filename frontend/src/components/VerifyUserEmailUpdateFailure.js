import React from 'react';
import { useNavigate } from 'react-router-dom';

const VerifyUserEmailUpdateFailure = () => {
  const navigate = useNavigate();

  const handleRetry = () => {
    navigate('/update-email'); // Redirect the user to the email update page
  };

  return (
    <div className="page">
      <h1>Email Verification Failed</h1>
      <p>
        Unfortunately, we couldn't verify your email. This might be due to an expired or invalid link.
      </p>
      <p>
        If you believe this is an error, please try updating your email again or contact our support team.
      </p>
      <button className="retry-btn" onClick={handleRetry}>
        Try Again
      </button>
    </div>
  );
};

export default VerifyUserEmailUpdateFailure;
