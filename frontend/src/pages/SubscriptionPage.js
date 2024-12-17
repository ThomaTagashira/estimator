import React, { useState } from 'react';
import {SubscriptionCheckoutButton} from '../components/StripeCheckoutButton'; 
import './pages_css/Pages.css';

const SubscriptionPage = () => {
    const [selectedTier, setSelectedTier] = useState(''); 

    const handleSelectTier = (tier) => {
        setSelectedTier(tier);
    };

    return (
        <div className="purchase-container">

            <div className="purchase-header">
                <h1>Subscribe to Our Service</h1>
                <p>Please choose a subscription tier to access our features.</p>
                <h2>Select Your Plan:</h2>
            </div>

            <div className="cards">
                <div className="card">
                    <h3>Basic</h3>
                    <p className="price">$24.99/month</p>
                    <ul>
                        <li>Add Things Here</li>
                        <li>Add Things Here</li>
                        <li>Add Things Here</li>
                    </ul>
                    <button onClick={() => handleSelectTier('Basic')}>
                        Basic - $24.99/month
                    </button>
                </div>


                <div className="card">
                    <h3>Premium</h3>
                    <p className="price">$49.99/month</p>
                    <ul>
                        <li>Add Things Here</li>
                        <li>Add Things Here</li>
                        <li>Add Things Here</li>
                    </ul>
                    <button onClick={() => handleSelectTier('Premium')}>
                        Premium - $49.99/month
                    </button>
                </div>


                <div className="card">
                    <h3>Enterprise</h3>
                    <p className="price">$99.99</p>
                    <ul>
                        <li>Add Things Here</li>
                        <li>Add Things Here</li>
                        <li>Add Things Here</li>
                    </ul>
                    <button onClick={() => handleSelectTier('Enterprise')}>
                        Enterprise - $99.99/month
                    </button>
                </div>
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
