import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
// import './components_css/Components.css';

const GoogleLoginButton = ({ googleID, handleGoogleLogin }) => {
  return (
    <GoogleOAuthProvider clientId={googleID}>
      <button onClick={handleGoogleLogin} className="google-login-btn">
        <div className="google-icon-wrapper">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="google-icon"
          >

            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.15 15.91-5.85l-7.73-6c-2.14 1.43-4.93 2.28-8.18 2.28-6.25 0-11.56-4.22-13.45-10.11l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            />
            
          </svg>
        </div>

        <span>Continue with Google</span>
      </button>
    </GoogleOAuthProvider>
  );
};

export default GoogleLoginButton;
