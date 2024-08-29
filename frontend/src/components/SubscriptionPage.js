// SubscriptionPage.js

import React from 'react';
import StripeCheckoutButton from './StripeCheckoutButton'; // Assume you already have this component


const SubscriptionPage = () => {
    return (
        <div>
            <h1>Subscribe to Our Service</h1>
            <p>Please subscribe to access our features.</p>
            <StripeCheckoutButton apiEndpoint="/api/payments/" />  {/* Button to handle subscription payment */}
        </div>
    );
};

export default SubscriptionPage;
