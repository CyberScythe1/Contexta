import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import useAuthStore from '../store/useAuthStore';
import { motion } from 'framer-motion';
import './Login.css';

const Login = () => {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      if (credentialResponse.credential) {
         await login(credentialResponse.credential);
         navigate('/');
      }
    } catch (e) {
      console.error(e);
      alert('Login Failed. Check console.');
    } finally {
      setLoading(false);
    }
  };

  const handleError = () => {
    console.log('Login Failed');
    alert('Google Login Failed');
  };

  return (
    <div className="login-container">
      <motion.div 
        className="login-card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="login-header">
          <h2>Welcome to Contexta</h2>
          <p>Your intelligent document assistant</p>
        </div>
        
        <div className="google-btn-wrapper">
          {loading ? (
             <p>Signing in...</p>
          ) : (
             <GoogleLogin
               onSuccess={handleSuccess}
               onError={handleError}
               shape="rectangular"
               theme="filled_black"
               size="large"
             />
          )}
        </div>

        <p className="note">Please sign in with your Google account to access your knowledge bases.</p>
      </motion.div>
    </div>
  );
};

export default Login;
