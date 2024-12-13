import React, { useState } from 'react';
import { TokenCheckoutButton } from '../components/StripeCheckoutButton';
import './pages_css/Pages.css';

const TokenPurchasePage = () => {
    const [selectedToken, setSelectedToken] = useState('');

    const handleSelectToken = (tokenQty) => {
        setSelectedToken(tokenQty);
    };

    return (
        <div class="purchase-container">

            <div class="purchase-header">
                <h2>Select Tokens to Purchase</h2>
            </div>

            <div class="cards">
                <div class="card">
                    <h3>50 Tokens</h3>
                    <p class="price">$19.99</p>
                    <ul>
                        <li>One-Time Purchase of 50 tokens</li>
                    </ul>
                    <button onClick={() => handleSelectToken('50')}>
                        50 Tokens - $19.99
                    </button>
                </div>


                <div class="card">
                    <h3>75 Tokens</h3>
                    <p class="price">$29.99</p>
                    <ul>
                        <li>One-Time Purchase of 75 tokens</li>
                    </ul>
                    <button onClick={() => handleSelectToken('75')}>
                        75 Tokens - $29.99
                    </button>
                </div>


                <div class="card">
                    <h3>100 Tokens</h3>
                    <p class="price">$39.99</p>
                    <ul>
                        <li>One-Time Purchase of 100 tokens</li>
                    </ul>
                    <button onClick={() => handleSelectToken('100')}>
                        100 Tokens - $39.99
                    </button>
                </div>
            </div>

            {selectedToken && (
                <div>
                    <h3>You have selected {selectedToken} Tokens.</h3>
                    <TokenCheckoutButton
                        apiEndpoint="/api/token-payments/"
                        tokenQty={selectedToken}
                    />
                </div>
            )}
        </div>
    );
};

export default TokenPurchasePage;
