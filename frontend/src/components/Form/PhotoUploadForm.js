import React from 'react';
import '../components_css/Components.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const PhotoUploadForm = ({
  onSearch,
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
}) => {


  return (
      <div className="photo-upload-container">
        <div className="photo-upload-form">
          <h3>Photo Upload Form</h3>
          <div
            className="drop-zone"
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];

              if (file) {
                  handleFileChange(file);
              }
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            {selectedFile ? (
              <>
                {isUploading ? (
                  <p className="loading-message">
                    Converting photo to text, please wait...
                  </p>
                ) : (

                  <>
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Preview"
                      className="preview-image"
                    />

                    <button
                      className="remove-photo-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePhoto();
                      }}
                    >
                      X
                    </button>
                  </>
                )}
              </>
            ) : (
              <p>Drop your image here, or click the button below to browse</p>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => handleFileChange(e.target.files[0])}
            />

            <button
              type={selectedFile ? "submit" : "button"}
              className="upload-btn"
              onClick={() => {
                if (!selectedFile) {
                  document.getElementById('file-upload').click();
                }
              }}
              disabled={isUploading}
            >
              {selectedFile
                ? isUploading
                  ? 'Uploading...'
                  : 'Upload Photo'
              : 'Browse'}
            </button>
          </form>
        </div>

      <hr className="divider" />

      <div className="uploaded-lines-container">
        <div className="uploaded-lines">
          <h3>Uploaded Lines</h3>

          {error && <p className="error-message">{error}</p>}

          <ul>
            {Object.keys(data).map((key) => (
              <li key={key}>
                <textarea
                  value={data[key]}
                  onChange={(e) => handleLineChange(key, e.target.value)}
                />

                <button onClick={() => handleRemoveLine(key)} >
                  <FontAwesomeIcon icon={faTrash} style={{ color: 'red', cursor: 'pointer' }} />
                </button>
              </li>
            ))}
          </ul>

          <div>
            <button onClick={() => handleAllSearches(onSearch)} className="upload-btn">
              Search All
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PhotoUploadForm;
