import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './components_css/Components.css';
import ProfileButton from './ProfileButton';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


const Header = ({ handleLogout, hasActiveSubscription, tokenCount, userSubscriptionTier }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null); 

  const toggleNavMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  const userProfileHeader = (
    <FontAwesomeIcon icon={faUserCircle} className="user-icon" />
  );

  useEffect(() => {
    const handleClickOutsideNav = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

      document.addEventListener('mousedown', handleClickOutsideNav);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideNav);
    };
  }, []);

  return (
    <header className="header">

      <div className="nav-hamburger" onClick={toggleNavMenu}>
        <span></span>
        <span></span>
        <span></span>
      </div>   

      <div className='logo-container'>
        <div>
          <h2>FairBuild</h2>
        </div>

        {hasActiveSubscription && (
          <div className="subscription-info">
            <div>Tokens: {tokenCount}</div>
            <div>Current Subscription: {userSubscriptionTier}</div>
          </div>
        )}
      </div>

      <nav className='nav' ref={dropdownRef}>       
        <ul className={`nav-link ${menuOpen ? "open" : ""}`}>
          {hasActiveSubscription ? (
          <>
            <li>
              <Link to="/" className="dropdown-link" onClick={() => setMenuOpen(false)}>
                <button className="nav-link-button">Home</button>
              </Link>

              <Link to="/save-business-info" className="dropdown-link" onClick={() => setMenuOpen(false)}>
                <button className="nav-link-button">Business Info</button>
              </Link>

              <Link to="/buy-tokens" className="dropdown-link" onClick={() => setMenuOpen(false)}>
                <button className="nav-link-button">Purchase Tokens</button>
              </Link>
            </li>
          </>
          ) : (
          <>
            <li>
              <Link to="/">
                  <button>Login</button>
              </Link>
            </li>
            <li>
              <Link to="/register" className='signup-btn'>
                <button>Sign Up</button>
              </Link>
            </li>
            <div className="dropdown-link" onClick={() => { handleLogout(); }}>
            <button className="dropdown-button">Logout</button>
        </div>
          </>
            )}
          </ul>
        </nav>
          <div className='user-icon'>
            {hasActiveSubscription && (
              <ProfileButton
                header={userProfileHeader}
                handleLogout={handleLogout}
              />
            )}
          </div>
    </header>
  );
};

export default Header;
