import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ handleLogout, hasActiveSubscription, tokenCount }) => {
    return (
        <header style={headerStyle}>
            <div style={logoStyle}>
                <h1>MyApp</h1>
            </div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                Tokens: {tokenCount}
            </div>
            <nav style={navStyle}>
                <ul style={ulStyle}>
                    {hasActiveSubscription ? (
                        <>
                            <li style={liStyle}><Link to="/">Home</Link></li>
                            <li style={liStyle}><Link to="/saved-estimates">Saved Estimates</Link></li>
                            <li style={liStyle}><Link to="/buy-tokens">Buy Tokens</Link></li>
                        </>
                    ) : (
                        <>
                            <li style={liStyle}><Link to="/">Sign Up</Link></li>
                        </>
                    )}
                    <li style={liStyle}><Link to="/about">About</Link></li>
                </ul>
            </nav>
            <button style={logoutButtonStyle} onClick={handleLogout}>Logout</button>
        </header>
    );
};

const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    backgroundColor: '#333',
    color: '#fff'
};

const logoStyle = {
    fontSize: '24px',
    fontWeight: 'bold'
};

const navStyle = {
    flex: '1',
    textAlign: 'center'
};

const ulStyle = {
    listStyle: 'none',
    margin: '0',
    padding: '0',
    display: 'inline-flex',
    gap: '15px'
};

const liStyle = {
    fontSize: '18px'
};

const logoutButtonStyle = {
    padding: '5px 10px',
    backgroundColor: '#f00',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px'
};

export default Header;
