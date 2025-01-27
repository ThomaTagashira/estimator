import React, { useState } from 'react';
import { TokenCheckoutButton } from '../components/StripeCheckoutButton';
import './pages_css/Pages.css';

const TokenPurchasePage = () => {
    const [selectedToken, setSelectedToken] = useState('');

    const handleSelectToken = (tokenQty) => {
        setSelectedToken(tokenQty);
    };

    return (
        <div className="purchase-container">

            <div className="purchase-header">
                <h2>Select Tokens to Purchase</h2>
            </div>

            <div className="cards">
                <div className="card">
                    <h3>50 Tokens</h3>
                    <p className="price">$14.99</p>
                    <ul>
                        <li>One-Time Purchase of 50 tokens</li>
                    </ul>
                    <div className='edit'>
                        <button onClick={() => handleSelectToken('50')}>
                            50 Tokens - $14.99
                        </button>
                    </div>
                </div>


                <div className="card">
                    <h3>100 Tokens</h3>
                    <p className="price">$29.99</p>
                    <ul>
                        <li>One-Time Purchase of 100 tokens</li>
                    </ul>
                    <div className='edit'>
                        <button onClick={() => handleSelectToken('75')}>
                            100 Tokens - $29.99
                        </button>
                    </div>
                </div>


                <div className="card">
                    <h3>150 Tokens</h3>
                    <p className="price">$44.99</p>
                    <ul>
                        <li>One-Time Purchase of 150 tokens</li>
                    </ul>
                    <div className='edit'>
                        <button onClick={() => handleSelectToken('100')}>
                            150 Tokens - $44.99
                        </button>
                    </div>
                </div>
            </div>

            {selectedToken && (
                <div>
                    <h3>You have selected {selectedToken} Tokens.</h3>
                    <div className='edit'>
                        <TokenCheckoutButton
                            apiEndpoint="/api/token-payments/"
                            tokenQty={selectedToken}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default TokenPurchasePage;
