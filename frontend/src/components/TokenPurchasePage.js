// TokenPurchasePage.js

import React from 'react';
import StripeCheckoutButton from './StripeCheckoutButton';


const TokenPurchasePage = () => {
    return (
        <div>
            <h1>Purchase Tokens</h1>
            <div>
                <h2>Buy 50 Tokens</h2>
                <StripeCheckoutButton apiEndpoint="/api/token-payments/" tokenAmount="50" />
            </div>
            <div>
                <h2>Buy 75 Tokens</h2>
                <StripeCheckoutButton apiEndpoint="/api/token-payments/" tokenAmount="75" />
            </div>
            <div>
                <h2>Buy 100 Tokens</h2>
                <StripeCheckoutButton apiEndpoint="/api/token-payments/" tokenAmount="100" />
            </div>
        </div>
    );
};

export default TokenPurchasePage;
