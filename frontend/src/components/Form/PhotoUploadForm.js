import React from 'react';

const PhotoUploadForm = ({ onSearch, selectedFile, data, error, handleFileChange, handleSubmit, handleLineChange, handleAllSearches, handleRemoveLine }) => {
    return (
        <div>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                <input type="file" onChange={(e) => handleFileChange(e.target.files[0])} />
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
            <button onClick={() => handleAllSearches(onSearch)}>Search All</button>
        </div>
    );
};

export default PhotoUploadForm;
