import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './components_css/Components.css';
import useUserProfileSettings from '../hooks/useUserProfileSettings';

const ProfileButton = ({ handleLogout, header, apiUrl }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const {
    userData,
    fetchUserData,
  } = useUserProfileSettings(apiUrl);

  useEffect(() => {
    fetchUserData(); 
  }, [fetchUserData]); 

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
      document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="hamburger-container" ref={dropdownRef}>

     <div className="hamburger" onClick={toggleMenu}>
        {header} 
      </div>

      <div className={`dropdown-menu ${isMenuOpen ? 'open' : ''}`}>

        {/* Display User's Name */}
        {userData && (
          <div className="user-name">
            {userData.firstName} {userData.lastName}
          </div>
        )}

        <Link to="/user-profile-settings" className="dropdown-link" onClick={() => setIsMenuOpen(false)}>
            <button className="upload-btn">Profile Settings</button>
        </Link>

        <Link to="/change-subscription-tier" className="dropdown-link" onClick={() => setIsMenuOpen(false)}>
            <button className="upload-btn">Change Subscription</button>
        </Link>
        
        <div className="dropdown-link" onClick={() => { handleLogout(); setIsMenuOpen(false); }}>
            <button className="logout"><strong>Logout</strong></button>
        </div>

      </div>
    </div> 
  );
};

export default ProfileButton;
