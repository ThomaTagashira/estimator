import React, { useState } from 'react';
import { SubscriptionCheckoutButton } from '../components/StripeCheckoutButton';

const ChangeSubscriptionPage = ({ userSubscriptionTier }) => {
    const [tier, setNewTier] = useState(''); 

    const handleSelectNewTier = (tier) => {
        setNewTier(tier);
    };

    return (
        <div className="purchase-container">

            <div className="purchase-header">
                <h2>Select a New Plan:</h2>
                <h3>Current Plan: {userSubscriptionTier}</h3>
            </div>

            <div className="cards">
                <div className="card">                
                    <h3>Basic</h3>
                    <p className="price">$14.99/month</p>
                    <ul>
                    <li>Receive 50 tokens at the beginning of each billing cycle</li>
                    <li>Add Things Here</li>
                        <li>Add Things Here</li>
                    </ul>
                    <button onClick={() => handleSelectNewTier('Basic')}>
                        Basic - $14.99/month
                    </button>
                </div>


                <div className="card">
                    <h3>Premium</h3>
                    <p className="price">$24.99/month</p>
                    <ul>
                    <li>Receive 120 tokens at the beginning of each billing cycle</li>
                    <li>Add Things Here</li>
                        <li>Add Things Here</li>
                    </ul>
                    <button onClick={() => handleSelectNewTier('Premium')}>
                        Premium - $24.99/month
                    </button>
                </div>


                <div className="card">
                    <h3>Enterprise</h3>
                    <p className="price">$49.99</p>
                    <ul>
                    <li>Receive 275 tokens at the beginning of each billing cycle</li>
                    <li>Add Things Here</li>
                        <li>Add Things Here</li>
                    </ul>
                    <button onClick={() => handleSelectNewTier('Enterprise')}>
                        Enterprise - $49.99/month
                    </button>
                </div>
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
