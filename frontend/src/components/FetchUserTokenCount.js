import React, { useState, useEffect } from 'react';
import Header from './Header';
import axios from 'axios';

const UserTokenCount = () => {
    const [tokenCount, setTokenCount] = useState(0);

  useEffect(() => {
    const fetchTokenCount = async () => {
      try {
        const response = await axios.get('/api/get-user-token-count/'); 
        setTokenCount(response.data.tokenCount);
      } catch (error) {
        console.error('Error fetching token count:', error);
      }
    };

    fetchTokenCount();
  }, []);

  return (
    <Header tokenCount={tokenCount} />
  );
};

export default UserTokenCount;
