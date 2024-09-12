import { useState, useEffect } from 'react';
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL;

const usePhotoUpload = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [data, setData] = useState(() => {
        const savedData = localStorage.getItem('photoUploadData');
        return savedData ? JSON.parse(savedData) : {};
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        localStorage.setItem('photoUploadData', JSON.stringify(data));
    }, [data]);

    const handleFileChange = (file) => {
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
    };

    const handleSubmit = async () => {
        if (!selectedFile) {
            setError("No file selected or the file is invalid.");
            return;
        }

        const formData = new FormData();
        formData.append('photo', selectedFile);

        try {
            const response = await axios.post(`${apiUrl}/api/photo/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const jsonResponse = JSON.parse(response.data);
            const strings = jsonResponse.strings || {};
            setData(strings);
        } catch (e) {
            const errorMessage = e.response?.data?.error?.message || 'Error uploading photo';
            setError(errorMessage);
        }
    };

    const handleLineChange = (key, newValue) => {
        const updatedData = { ...data, [key]: newValue };
        setData(updatedData);
    };

    const handleLineSearch = async (line, onSearch) => {
        try {
            await onSearch(line); // Assumes onSearch is a function that returns a promise
        } catch (err) {
            setError('Error during search');
        }
    };

    const handleAllSearches = async (onSearch) => {
        setError(null);

        for (const key of Object.keys(data)) {
            try {
                await handleLineSearch(data[key], onSearch);
            } catch (err) {
                setError(`Search failed for line ${key}`);
                break;
            }
        }
    };

    const handleRemoveLine = (key) => {
        const updatedData = { ...data };
        delete updatedData[key];
        setData(updatedData);
    };

    return {
        selectedFile,
        data,
        error,
        handleFileChange,
        handleSubmit,
        handleLineChange,
        handleAllSearches,
        handleRemoveLine,
    };
};

export default usePhotoUpload;
