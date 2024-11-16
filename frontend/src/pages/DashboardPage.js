import React from 'react';
import { Link } from 'react-router-dom';


const DashboardPage = () => {
    return (
        <div style={styles.container}>
            <h1>Welcome to Your Dashboard</h1>
            <p>You have an active subscription and are authenticated.</p>

            <div style={styles.cards}>
                <div style={styles.card}>
                    <h2>Account Information</h2>
                    <Link to="/save-business-info">
                        <button>Update Business Information</button>
                    </Link>
                </div>
                <div style={styles.card}>
                    <h2>Subscription</h2>
                    <p>Manage your subscription and payment methods.</p>
                </div>
                <div style={styles.card}>
                    <h2>Settings</h2>
                    <p>Adjust your preferences and settings.</p>
                </div>
                <div className="dashboard-page">
                    <h2>Dashboard</h2>
                    <Link to="/create-estimate">
                        <button>Create New Estimate</button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        textAlign: 'center',
    },
    cards: {
        display: 'flex',
        justifyContent: 'space-around',
        marginTop: '20px',
    },
    card: {
        backgroundColor: '#f4f4f4',
        padding: '20px',
        borderRadius: '10px',
        width: '30%',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    },
};

export default DashboardPage;
