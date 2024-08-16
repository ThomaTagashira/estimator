import React, { useState, useEffect } from 'react';
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL;

function UploadedText() {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.post(`${apiUrl}/photo/`);
            setData(response.data.strings); // **Update to directly access response.data
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Error fetching data');
        }
    };

    return (
        <div>
            <h1>Strings</h1>
            {error ? (
                <p>Error: {error}</p>
            ) : (
                <ul>
                    {data.map((string, index) => (
                        <li key={index}>{string}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default UploadedText;