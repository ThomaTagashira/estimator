import { SubscriptionCheckoutButton } from '../components/StripeCheckoutButton';

const SubscrptionPlanCards = ({ handleSelectNewTier, tier }) => {

  return (
    <div className='purchase-container'>
      <div className="cards">
        <div className="card">                
          <h3>Basic</h3>
          <p className="price">$24.99/month</p>
          <ul>
              <li>Receive 50 tokens at the beginning of each billing cycle</li>
              {/* <li>Add Things Here</li> */}
              {/* <li>Add Things Here</li> */}
          </ul>
          <div className='edit'>
            <button onClick={() => handleSelectNewTier('Basic')}>
                Basic - $24.99/month
            </button>
            </div>
        </div>


        <div className="card">
          <h3>Premium</h3>
          <p className="price">$39.99/month</p>
          <ul>
              <li>Receive 120 tokens at the beginning of each billing cycle</li>
              {/* <li>Add Things Here</li> */}
              {/* <li>Add Things Here</li> */}
              
          </ul>
          <div className='edit'>
            <button onClick={() => handleSelectNewTier('Premium')}>
                Premium - $39.99/month
            </button>
          </div>
        </div>


        <div className="card">
          <h3>Enterprise</h3>
          <p className="price">$59.99/month</p>
          <ul>
              <li>Receive 250 tokens at the beginning of each billing cycle</li>
              {/* <li>Add Things Here</li> */}
              {/* <li>Add Things Here</li> */}
          </ul>
          <div className='edit'>
            <button onClick={() => handleSelectNewTier('Enterprise')}>
                Enterprise - $59.99/month
            </button>
          </div>
        </div>
      </div>

      {tier && (
        <div>
          <h3>You have selected the {tier} plan.</h3>
            <div className='edit'>
              <SubscriptionCheckoutButton
                  apiEndpoint="/api/payments/"
                  tier={tier}
              />
            </div>
        </div>
      )}
    </div>
  );
};

export default SubscrptionPlanCards;
