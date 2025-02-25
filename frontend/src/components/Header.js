import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ProfileButton from './ProfileButton';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


const Header = ({ handleLogout, hasActiveSubscription, tokenCount, userSubscriptionTier, inTrial, apiUrl, isAuthenticated }) => {
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
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h2>FairBuild</h2>
        </Link>

        {(hasActiveSubscription || inTrial) && isAuthenticated && (
          <div className="subscription-info">
            <div>Tokens: {tokenCount}</div>
            <div>Current Subscription: {userSubscriptionTier}</div>
          </div>
        )}
      </div>

      <nav className='nav' ref={dropdownRef}>       
        <ul className={`nav-link ${menuOpen ? "open" : ""}`}>
        {(hasActiveSubscription || inTrial) && isAuthenticated ? (
          <>
            <li>
              <Link to="/" className="dropdown-link" onClick={() => setMenuOpen(false)}>
                <button>Estimates</button>
              </Link>

              <Link to="/buy-tokens" className="dropdown-link" onClick={() => setMenuOpen(false)}>
                <button>Purchase Tokens</button>
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
          </>
            )}
          </ul>
        </nav>
          <div className='user-icon'>
          {(hasActiveSubscription || inTrial) && isAuthenticated && (
              <ProfileButton
                header={userProfileHeader}
                handleLogout={handleLogout}
                apiUrl={apiUrl}
              />
            )}
          </div>
    </header>
  );
};

export default Header;
