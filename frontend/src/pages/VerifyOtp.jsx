import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';

export default function VerifyOtp() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [resendCooldown, setResendCooldown] = useState(60); // 60 seconds
  
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('OTP must be exactly 6 digits.');
      return;
    }
    
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await axios.post('/api/auth/verify-otp', {
        email,
        otp
      });
      setSuccess('OTP verified successfully!');
      setTimeout(() => {
        navigate('/reset-password', { state: { email, otpVerified: true } });
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await axios.post('/api/auth/forgot-password', {
        email
      });
      setSuccess('A new OTP has been sent to your email.');
      setResendCooldown(60);
      setTimeLeft(300); // Reset expiry timer
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!email) return null;

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
        onSubmit={handleVerifyOtp}
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
            Verify OTP
          </h2>
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#4b5563' }}>
            Enter the 6-digit code sent to <br />
            <span style={{ fontWeight: 600, color: '#1f2937' }}>{email}</span>
          </p>
        </div>

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
              OTP <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input 
              style={{
                width: '100%',
                border: '1px solid #d1d5db',
                padding: '0.625rem',
                borderRadius: '0.25rem',
                outline: 'none',
                textAlign: 'center',
                fontSize: '1.25rem',
                letterSpacing: '0.5em',
                fontFamily: 'monospace',
                backgroundColor: loading || success || timeLeft === 0 ? '#f3f4f6' : '#ffffff'
              }}
              type="text"
              maxLength="6"
              placeholder="••••••" 
              value={otp} 
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} 
              required 
              disabled={loading || !!success || timeLeft === 0}
            />
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', fontSize: '0.75rem', fontWeight: 600 }}>
          <span style={{ color: timeLeft === 0 ? '#ef4444' : '#6b7280' }}>
            Expires in: {formatTime(timeLeft)}
          </span>
          
          <button 
            type="button"
            onClick={handleResendOtp}
            disabled={resendCooldown > 0 || loading}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              fontSize: '0.75rem',
              fontWeight: 600,
              color: resendCooldown > 0 ? '#9ca3af' : '#1e40af',
              cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
              textDecoration: resendCooldown > 0 ? 'none' : 'underline'
            }}
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
          </button>
        </div>

        <button 
          disabled={loading || !!success || timeLeft === 0 || otp.length !== 6}
          style={{
            width: '100%',
            color: '#ffffff',
            padding: '0.75rem',
            borderRadius: '0.25rem',
            fontWeight: 700,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            marginTop: '1.5rem',
            border: 'none',
            cursor: loading || success || timeLeft === 0 || otp.length !== 6 ? 'not-allowed' : 'pointer',
            backgroundColor: loading || success || timeLeft === 0 || otp.length !== 6 ? '#9ca3af' : '#1e40af',
            transition: 'background-color 0.2s'
          }}
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#4b5563' }}>
          <Link to="/login" style={{ color: '#1e40af', fontWeight: 700, textDecoration: 'none' }}>
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
}
