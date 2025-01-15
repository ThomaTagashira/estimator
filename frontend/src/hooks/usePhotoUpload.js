import { useState, useEffect } from 'react';
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL;

const usePhotoUpload = (setIsLoading, fetchTokenCount) => {
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

    const fetchTokenBalance = async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/get-user-token-count/`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
            });
            return response.data.token_balance || 0;
        } catch (error) {
            console.error('Error fetching token balance:', error.message);
            return 0;
        }
    };

    const deductTokens = async (tokensToDeduct) => {
        try {
            await axios.post(`${apiUrl}/api/deduct-tokens/`, 
                { tokens: tokensToDeduct },
                { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } }
            );
        } catch (error) {
            console.error('Error deducting tokens:', error.message);
        }
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
            const tokenBalance = await fetchTokenBalance();

            if (tokenBalance < 5) {
                setError('Insufficient tokens to perform this search.');
                return;
            }

            const response = await axios.post(`${apiUrl}/api/photo/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            await deductTokens(5);

            const jsonResponse = JSON.parse(response.data);
            const strings = jsonResponse.strings || {};
            setData(strings);

            await fetchTokenCount();

        } catch (e) {
            const errorMessage = e.response?.data?.error?.message || 'Error uploading photo';
            setError(errorMessage);
        } finally {
            setIsUploading(false);
        }
    };

    const addNewRow = () => {
        const existingNumbers = Object.keys(data)
        .map((key) => parseInt(key.split("_")[1], 10))
        .filter((num) => !isNaN(num));
    
      const nextNumber = existingNumbers.length > 0
        ? Math.max(...existingNumbers) + 1
        : 1;
    
      const newKey = `line_${nextNumber}`;
      console.log("New key:", newKey);
    
      setData((prevData) => {
        const updatedData = {
          ...prevData,
          [newKey]: "",
        };
        console.log("Updated data:", updatedData);
        return updatedData;
      });
    };

    const handleLineChange = (key, newValue) => {
        const updatedData = { ...data, [key]: newValue };
        setData(updatedData);
    };

    const handleLineSearch = async (lineKey, onSearch) => {
        setIsLoading(true);
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
        } finally {
            setIsLoading(false);
        }    
    };

    const handleAllSearches = async (onSearch) => {
        setError(null);
        setIsLoading(true);
    
        const keys = Object.keys(data);
        for (const key of keys) {
            try {
                await handleLineSearch(key, onSearch);
            } catch (err) {
                setError(`Search failed for line ${key}`);
                break;
            }
        }
    
        setIsLoading(false); 
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
        addNewRow
    };
};

export default usePhotoUpload;
