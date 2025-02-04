import React from 'react';

function Footer() {
  return (
    <footer className='footer'>
      <p>&copy; 2024 FairBuild. All rights reserved.</p>
      <p>
        <a href="mailto:support@fairbuildapp.com" style={{ color: '#007bff', textDecoration: 'none', margin: '0 10px' }}>Contact Us</a>
        |
        <a href="/app/privacypolicy" style={{ color: '#007bff', textDecoration: 'none', margin: '0 10px' }}>Privacy Policy</a>
        |
        <a href="/app/refundpolicy" style={{ color: '#007bff', textDecoration: 'none', margin: '0 10px' }}>Refund Policy</a>
        |
        <a href="/app/termsandconditions" style={{ color: '#007bff', textDecoration: 'none', margin: '0 10px' }}>Terms of Service</a>
      </p>
    </footer>
  );
}

export default Footer;