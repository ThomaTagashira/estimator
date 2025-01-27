import {CancelSubscriptionButton} from '../components/StripeCheckoutButton'; 
import React, { useState } from 'react';

const CancelSubscriptionPage = () => {
  const [cancelingSubscription, setCancelingSubscription] = useState(false);

  const cancelCancelSubscription = () => {
    setCancelingSubscription(null); 
  };

  return (
    <div className='information-page'>    
      <div className='policy-card '>            
        <h1>We're sorry to hear you go!</h1>

          <h2> Notice: Subscription Cancellation</h2>

          <p>Upon canceling your subscription, you will have access to your account until the end of your billing cycle. If you decide to reactivate your subscription, all saved estimates and unused tokens will be returned to you.</p>

          <h3>If you wish to proceed, please click the button below to confirm the cancellation of your subscription.</h3>
          <div className='edit'>

          <button
              onClick={(e) => {
              e.stopPropagation(); 
              setCancelingSubscription(true); 
            }}
            className="delete-button"
          >
            Cancel Subscription
          </button>
        </div>
      </div>

      {cancelingSubscription && (
        <div className="slide-out-panel">
          <p><strong>WARNING:</strong></p>
          <p>Please confirm cancellation of your subscription below:</p>
          <div className='edit-buttons'>
          <button onClick={cancelCancelSubscription} className="cancel-button">Cancel</button>
            <CancelSubscriptionButton apiEndpoint="/api/cancel-subscription/"/>            
          </div>
        </div>
      )}

    </div>
  );
};

export default CancelSubscriptionPage