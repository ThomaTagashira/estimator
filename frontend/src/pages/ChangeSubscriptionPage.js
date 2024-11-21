import React, { useState } from 'react';
import {SubscriptionCheckoutButton} from '../components/StripeCheckoutButton'; 

const ChangeSubscriptionPage = () => {
    const [tier, setNewTier] = useState(''); 

    const handleSelectNewTier = (tier) => {
        setNewTier(tier);
    };

    return (
        <div>
            <h1>Which Tier Would You Like to Change Your Current Subscription To?</h1>
            <p>Your Current Subscription: </p>

            <div>
                <h2>Select Your Plan:</h2>
                <ul>
                    <li>
                        <button onClick={() => handleSelectNewTier('Basic')}>
                            Basic - $24.99/month
                        </button>
                    </li>
                    <li>
                        <button onClick={() => handleSelectNewTier('Premium')}>
                            Premium - $49.99/month
                        </button>
                    </li>
                    <li>
                        <button onClick={() => handleSelectNewTier('Enterprise')}>
                            Enterprise - $99.99/month
                        </button>
                    </li>
                </ul>
            </div>

            {tier && (
                <div>
                    <h3>You have selected the {tier} plan.</h3>
                    <SubscriptionCheckoutButton
                        apiEndpoint="/api/payments/"
                        tier={tier}
                    />
                </div>
            )}
        </div>
    );
};

export default ChangeSubscriptionPage;
