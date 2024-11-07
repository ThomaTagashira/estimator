import React from 'react';
import { Link } from 'react-router-dom';


const BusinessInfoUpdateSuccessPage = () => {
    return (
        <div>
            <h1>Your Business Information Has Been Updated</h1>
                <Link to="/">
                    <button>Return to Home</button>
                </Link>
        </div>
    );
};

export default BusinessInfoUpdateSuccessPage;
