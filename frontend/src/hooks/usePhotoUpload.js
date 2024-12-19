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
    const [isUploading, setIsUploading] = useState(false); 

    useEffect(() => {
        localStorage.setItem('photoUploadData', JSON.stringify(data));
    }, [data]);

    const handleFileChange = (file) => {
        if (!file) {
            setSelectedFile(null);
            setError(null);
            return;
        }
    
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

    const handleRemovePhoto = () => {
        setSelectedFile(null);
        setError(null);
        console.log("Photo removed");
    };

    const handleSubmit = async () => {
        if (!selectedFile) {
            setError("No file selected or the file is invalid.");
            return;
        }
    
        const formData = new FormData();
        formData.append('photo', selectedFile);
    
        setIsUploading(true);
    
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
        } finally {
            setIsUploading(false);
        }
    };

    const handleLineChange = (key, newValue) => {
        const updatedData = { ...data, [key]: newValue };
        setData(updatedData);
    };

    const handleLineSearch = async (lineKey, onSearch) => {
        try {
            await onSearch(data[lineKey]);
    
            setData((prevData) => {
                const updatedData = { ...prevData };
                delete updatedData[lineKey];
                return updatedData; 
            });
    
            const photoUploadData = JSON.parse(localStorage.getItem('PhotoUploadData')) || {};
            delete photoUploadData[lineKey];
            localStorage.setItem('PhotoUploadData', JSON.stringify(photoUploadData));
        } catch (err) {
            setError('Error during search');
        }
    };

    const handleAllSearches = async (onSearch) => {
        setError(null);
    
        const keys = Object.keys(data);
        for (const key of keys) {
            try {
                await handleLineSearch(key, onSearch); 
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
        isUploading,
        handleFileChange,
        handleRemovePhoto,
        handleSubmit,
        handleLineChange,
        handleAllSearches,
        handleRemoveLine,
    };
};

export default usePhotoUpload;
