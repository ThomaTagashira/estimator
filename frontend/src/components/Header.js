import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './components_css/Header.css';

const Header = ({ handleLogout, hasActiveSubscription, tokenCount, userSubscriptionTier }) => {
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
        <header className="header">
            <div className="logo">
                <h1>MyApp</h1>
            </div>
            {hasActiveSubscription && (
                <div className="subscription-info">
                    <div>Tokens: {tokenCount}</div>
                    <div>Current Subscription: {userSubscriptionTier}</div>
                </div>
            )}
            <nav className="nav">
                <ul>
                    {hasActiveSubscription ? (
                        <>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/buy-tokens">Buy Tokens</Link></li>
                        </>
                    ) : (
                        <li><Link to="/">Sign Up</Link></li>
                    )}
                    <li><Link to="/about">About</Link></li>
                </ul>
            </nav>
            {/* Hamburger Menu */}
            <div className="hamburger-container" ref={dropdownRef}>
                <div className="hamburger" onClick={toggleMenu}>
                    <div className="line"></div>
                    <div className="line"></div>
                    <div className="line"></div>
                </div>
                {isMenuOpen && (
                    <div className="dropdown-menu">
                        <Link to="/save-business-info" className="dropdown-link" onClick={() => setIsMenuOpen(false)}>
                            <button className="dropdown-button">Update Business Information</button>
                        </Link>
                        <Link to="/change-subscription-tier" className="dropdown-link" onClick={() => setIsMenuOpen(false)}>
                            <button className="dropdown-button">Change Subscription Tier</button>
                        </Link>
                        <Link to="/cancel-subscription" className="dropdown-link" onClick={() => setIsMenuOpen(false)}>
                            <button className="dropdown-button">Cancel Subscription</button>
                        </Link>
                        <button className="dropdown-button" onClick={() => { handleLogout(); setIsMenuOpen(false); }}>
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
