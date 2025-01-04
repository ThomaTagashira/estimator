import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './components_css/Components.css';

const ProfileButton = ({ handleLogout, header }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

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

        <Link to="/change-subscription-tier" className="dropdown-link" onClick={() => setIsMenuOpen(false)}>
            <button className="upload-btn">Change Subscription</button>
        </Link>

        <Link to="/cancel-subscription" className="dropdown-link" onClick={() => setIsMenuOpen(false)}>
            <button className="upload-btn">Cancel Subscription</button>
        </Link>

        {/* <Link to="/cancel-subscription" className="dropdown-link" onClick={() => setIsMenuOpen(false)}>
            <button className="upload-btn">Cancel Subscription</button>
        </Link> */}
        
        <div className="dropdown-link" onClick={() => { handleLogout(); setIsMenuOpen(false); }}>
            <button className="logout"><strong>Logout</strong></button>
        </div>

      </div>
    </div> 
  );
};

export default ProfileButton;
