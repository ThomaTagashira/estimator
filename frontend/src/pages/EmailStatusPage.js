import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EmailStatusPage = ({ apiUrl, userEmail }) => {
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/check-verification-status/`);
        if (response.data.is_verified) {
          setIsVerified(true);
          clearInterval(interval); 
        }
      } catch (error) {
        console.error('Error checking email verification status:', error);
      }
    }, 10000);

    return () => clearInterval(interval); 
  }, [apiUrl]);


  const resendVerificationEmail = async () => {
    try {
      await axios.post(`${apiUrl}/api/resend-verification-email/`, { email: userEmail });
      alert('Verification email has been resent. Please check your inbox.');
    } catch (error) {
      console.error('Error resending verification email:', error);
      alert('Failed to resend verification email. Please try again later.');
    }
  };

  return (
    <div>
      {isVerified ? (
        <div>
          <h1>Email Verified Successfully</h1>
          <p>
            Thank you for verifying your email address! Your account is now active.
          </p>

        </div>
      ) : (
        <div>
          <h1>Verify Your Email Address</h1>
          <p>
            We've sent a verification email to your inbox. Please check your email and click the
            verification link to activate your account. You cannot proceed until your email is verified.
          </p>
          <button onClick={resendVerificationEmail}>Resend Verification Email</button>
        </div>
      )}
    </div>
  );
};

export default EmailStatusPage;
