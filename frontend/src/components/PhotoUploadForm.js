import React, { useState, useEffect } from 'react';
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL;

const PhotoUploadForm = ({ onSearch }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [data, setData] = useState({});
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log("Data state updated:", data);
    }, [data]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const validFormats = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
            const maxSize = 20 * 1024 * 1024;

            if (!validFormats.includes(file.type)) {
                setError("Unsupported image format. Please upload a PNG, JPEG, GIF, or WebP image.");
                setSelectedFile(null);
                return;
            }

            if (file.size > maxSize) {
                setError("Image size exceeds the 20 MB limit. Please upload a smaller image.");
                setSelectedFile(null);
                return;
            }

            setSelectedFile(file);
            setError(null);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!selectedFile) {
            setError("No file selected or the file is invalid.");
            return;
        }

        const formData = new FormData();
        formData.append('photo', selectedFile);

        try {
            console.log('Making API request with file:', selectedFile);
            const response = await axios.post(`${apiUrl}/api/photo/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Full API response:', response);

            const jsonResponse = JSON.parse(response.data);

            if (!jsonResponse.strings) {
                console.error('API response does not contain "strings" key:', jsonResponse);
                setError('Invalid API response structure');
                return;
            }

            const strings = jsonResponse.strings || {};

            console.log('API response strings:', strings);

            Object.entries(strings).forEach(([key, value]) => {
                console.log(`${key}: ${value}`);
            });

            setData(strings);
        } catch (e) {
            const errorMessage = e.response && e.response.data && e.response.data.error
                ? e.response.data.error.message
                : 'Error uploading photo';
            setError(errorMessage);
            console.error('Error uploading photo:', e);
        }
    };

    const handleLineChange = (key, newValue) => {
        const updatedData = { ...data, [key]: newValue };
        setData(updatedData);
    };

    const handleLineSearch = async (line) => {
        try {
            await onSearch(line); // Assumes onSearch is a function that returns a promise
        } catch (err) {
            console.error('Error during search:', err);
            setError('Error during search');
        }
    };

    const handleAllSearches = async () => {
        setError(null); // Clear any previous errors

        // Sequentially execute searches
        for (const key of Object.keys(data)) {
            try {
                await handleLineSearch(data[key]);
                console.log(`Search for line ${key} completed`);
            } catch (err) {
                setError(`Search failed for line ${key}`);
                console.error(err);
                break; // Stop further searches on error
            }
        }
    };

    const handleRemoveLine = (key) => {
        const updatedData = { ...data };
        delete updatedData[key]; // Remove the line from the data object
        setData(updatedData);
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input type="file" onChange={handleFileChange} />
                <button type="submit">Upload Photo</button>
            </form>

            <h1>Uploaded Lines</h1>
            {error && <p>Error: {error}</p>}
            <ul>
                {Object.keys(data).map((key) => (
                    <li key={key}>
                        <textarea
                            style={{ width: '100%', height: `${Math.max(data[key].split('\n').length * 1.5 + 0.5, 2)}em` }}
                            value={data[key]}
                            onChange={(e) => handleLineChange(key, e.target.value)}
                        />
                        <button onClick={() => handleRemoveLine(key)}>Remove Line</button>
                    </li>
                ))}
            </ul>
            <button onClick={handleAllSearches}>Search All</button>
        </div>
    );
};

export default PhotoUploadForm;
