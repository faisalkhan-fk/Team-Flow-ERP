import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await axios.post('/api/auth/forgot-password', {
        email
      });
      setSuccess('If an account exists with this email, an OTP has been sent.');
      setTimeout(() => {
        navigate('/verify-otp', { state: { email } });
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request OTP. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1rem'
    }}>
      <form
        onSubmit={handleSendOtp}
        style={{
          backgroundColor: '#ffffff',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          width: '100%',
          maxWidth: '28rem',
          borderTop: '4px solid #1e40af'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#1e40af', margin: 0 }}>
            TeamFlow ERP
          </h2>
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
            Forgot Password
          </p>
        </div>

        <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '1.5rem', textAlign: 'center' }}>
          Enter the email associated with your TeamFlow ERP account.
        </p>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            padding: '0.75rem',
            borderRadius: '0.25rem',
            marginBottom: '1rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: '#dcfce7',
            color: '#15803d',
            padding: '0.75rem',
            borderRadius: '0.25rem',
            marginBottom: '1rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            textAlign: 'center'
          }}>
            {success}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563', display: 'block', marginBottom: '0.25rem' }}>
              Registered Email <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input 
              style={{
                width: '100%',
                border: '1px solid #d1d5db',
                padding: '0.625rem',
                borderRadius: '0.25rem',
                outline: 'none',
                fontSize: '0.875rem',
                backgroundColor: '#ffffff'
              }}
              type="email"
              placeholder="e.g. john@teamflow.in" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              disabled={loading || !!success}
            />
          </div>
        </div>

        <button 
          disabled={loading || !!success}
          style={{
            width: '100%',
            color: '#ffffff',
            padding: '0.75rem',
            borderRadius: '0.25rem',
            fontWeight: 700,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            marginTop: '1.5rem',
            border: 'none',
            cursor: loading || success ? 'not-allowed' : 'pointer',
            backgroundColor: loading || success ? '#9ca3af' : '#1e40af',
            transition: 'background-color 0.2s'
          }}
        >
          {loading ? 'Sending OTP...' : 'Send OTP'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#4b5563' }}>
          Remember your password?{' '}
          <Link to="/login" style={{ color: '#1e40af', fontWeight: 700, textDecoration: 'none' }}>
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
}
