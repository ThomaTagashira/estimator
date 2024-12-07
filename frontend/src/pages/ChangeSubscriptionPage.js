import React, { useState } from 'react';
import { SubscriptionCheckoutButton } from '../components/StripeCheckoutButton';

const ChangeSubscriptionPage = ({ userSubscriptionTier }) => {
    const [tier, setNewTier] = useState(''); 

    const handleSelectNewTier = (tier) => {
        setNewTier(tier);
    };

    return (
        <div class="purchase-container">

            <div class="purchase-header">
                <h1>Which Tier Would You Like to Change Your Current Subscription To?</h1>
                <h3>Your Current Subscription: {userSubscriptionTier}</h3>
                <h2>Select Your Plan:</h2>
            </div>

            <div class="cards">
                <div class="card">                
                    <h3>Basic</h3>
                    <p class="price">$24.99/month</p>
                    <ul>
                        <li>Add Things Here</li>
                        <li>Add Things Here</li>
                        <li>Add Things Here</li>
                    </ul>
                    <button onClick={() => handleSelectNewTier('Basic')}>
                        Basic - $24.99/month
                    </button>
                </div>


                <div class="card">
                    <h3>Premium</h3>
                    <p class="price">$49.99/month</p>
                    <ul>
                        <li>Add Things Here</li>
                        <li>Add Things Here</li>
                        <li>Add Things Here</li>
                    </ul>
                    <button onClick={() => handleSelectNewTier('Premium')}>
                        Premium - $49.99/month
                    </button>
                </div>


                <div class="card">
                    <h3>Enterprise</h3>
                    <p class="price">$99.99</p>
                    <ul>
                        <li>Add Things Here</li>
                        <li>Add Things Here</li>
                        <li>Add Things Here</li>
                    </ul>
                    <button onClick={() => handleSelectNewTier('Enterprise')}>
                        Enterprise - $99.99/month
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
