import React, { useState } from 'react';
import {SubscriptionCheckoutButton} from '../components/StripeCheckoutButton'; 

const SubscriptionPage = () => {
    const [selectedTier, setSelectedTier] = useState(''); 

    const handleSelectTier = (tier) => {
        setSelectedTier(tier);
    };

    return (
        <div>
            <h1>Subscribe to Our Service</h1>
            <p>Please choose a subscription tier to access our features.</p>

            <div>
                <h2>Select Your Plan:</h2>
                <ul>
                    <li>
                        <button onClick={() => handleSelectTier('Basic')}>
                            Basic - $24.99/month
                        </button>
                    </li>
                    <li>
                        <button onClick={() => handleSelectTier('Premium')}>
                            Premium - $49.99/month
                        </button>
                    </li>
                    <li>
                        <button onClick={() => handleSelectTier('Enterprise')}>
                            Enterprise - $99.99/month
                        </button>
                    </li>
                </ul>
            </div>

            {selectedTier && (
                <div>
                    <h3>You have selected the {selectedTier} plan.</h3>
                    <SubscriptionCheckoutButton
                        apiEndpoint="/api/payments/"
                        tier={selectedTier}
                    />
                </div>
            )}
        </div>
    );
};

export default SubscriptionPage;
