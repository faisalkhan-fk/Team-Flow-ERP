import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const otpVerified = location.state?.otpVerified;

  useEffect(() => {
    if (!email || !otpVerified) {
      navigate('/forgot-password');
    }
  }, [email, otpVerified, navigate]);

  const getPasswordStrength = (pass) => {
    let score = 0;
    if (pass.length > 8) score += 1;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score += 1;
    if (/\d/.test(pass)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pass)) score += 1;
    
    if (score === 0 && pass.length > 0) return { label: 'Very Weak', color: '#ef4444', width: '25%' };
    if (score === 1) return { label: 'Weak', color: '#f97316', width: '50%' };
    if (score === 2) return { label: 'Medium', color: '#eab308', width: '75%' };
    if (score >= 3) return { label: 'Strong', color: '#22c55e', width: '100%' };
    return { label: '', color: '#e5e7eb', width: '0%' };
  };

  const strength = getPasswordStrength(newPassword);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/reset-password', {
        email,
        newPassword,
        confirmPassword
      });
      setSuccess(res.data.message || 'Password reset successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!email || !otpVerified) return null;

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
        onSubmit={handleResetPassword}
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
            Reset Password
          </h2>
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#4b5563' }}>
            Create a new strong password for your account.
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
              New Password <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                style={{
                  width: '100%',
                  border: '1px solid #d1d5db',
                  padding: '0.625rem 3rem 0.625rem 0.625rem',
                  borderRadius: '0.25rem',
                  outline: 'none',
                  fontSize: '0.875rem',
                  backgroundColor: loading || success ? '#f3f4f6' : '#ffffff'
                }}
                type={showPassword ? "text" : "password"}
                placeholder="Min 8 chars, 1 uppercase, 1 symbol" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                required 
                disabled={loading || !!success}
              />
              <button 
                type="button"
                tabIndex="-1"
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  right: 0,
                  paddingRight: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '0.875rem',
                  color: '#4b5563',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {newPassword.length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Password Strength</span>
                  <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
                <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '9999px', height: '6px', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: strength.color, width: strength.width, height: '6px', borderRadius: '9999px', transition: 'all 0.3s' }}></div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563', display: 'block', marginBottom: '0.25rem' }}>
              Confirm New Password <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input 
              style={{
                width: '100%',
                border: '1px solid #d1d5db',
                padding: '0.625rem',
                borderRadius: '0.25rem',
                outline: 'none',
                fontSize: '0.875rem',
                backgroundColor: loading || success ? '#f3f4f6' : '#ffffff'
              }}
              type={showPassword ? "text" : "password"}
              placeholder="Confirm your new password" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              required 
              disabled={loading || !!success}
            />
          </div>
        </div>

        <button 
          disabled={loading || !!success || newPassword.length < 8}
          style={{
            width: '100%',
            color: '#ffffff',
            padding: '0.75rem',
            borderRadius: '0.25rem',
            fontWeight: 700,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            marginTop: '1.5rem',
            border: 'none',
            cursor: loading || success || newPassword.length < 8 ? 'not-allowed' : 'pointer',
            backgroundColor: loading || success || newPassword.length < 8 ? '#9ca3af' : '#1e40af',
            transition: 'background-color 0.2s'
          }}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
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
