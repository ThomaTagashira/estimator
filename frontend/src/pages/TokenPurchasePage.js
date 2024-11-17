// TokenPurchasePage.js

import React, { useState } from 'react';
import { TokenCheckoutButton } from '../components/StripeCheckoutButton';


const TokenPurchasePage = () => {
    const [selectedToken, setSelectedToken] = useState('');

    const handleSelectToken = (tokenQty) => {
        setSelectedToken(tokenQty);
    };

    return (
        <div>
            <h2>Select Tokens to Purchase</h2>
            <ul>
                <li>
                    <button onClick={() => handleSelectToken('50')}>
                        50 Tokens - $19.99
                    </button>
                </li>
                <li>
                    <button onClick={() => handleSelectToken('75')}>
                        75 Tokens - $29.99
                    </button>
                </li>
                <li>
                    <button onClick={() => handleSelectToken('100')}>
                        100 Tokens - $39.99
                    </button>
                </li>
            </ul>

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
