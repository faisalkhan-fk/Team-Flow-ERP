import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Layers, ArrowRight, Clock, AlertCircle } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setIsPending(false);
      const res = await axios.post('/api/auth/login', { username, password });
      // Store authentic user role (Admin, Manager, or Employee)
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials. Please verify username and password.';
      const pending = err.response?.data?.status === 'Pending' || msg.toLowerCase().includes('pending');
      setIsPending(pending);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f1f5f9',
      padding: '2rem 1rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        padding: '2.5rem',
        border: '1px solid #e2e8f0',
      }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            marginBottom: '0.75rem',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
          }}>
            <Layers size={28} />
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            TeamFlow ERP
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
            Enterprise Resource Planning & Operations
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: isPending ? '#fef3c7' : '#fee2e2',
            color: isPending ? '#92400e' : '#dc2626',
            padding: '12px 14px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            fontWeight: 500,
            border: isPending ? '1px solid #fde68a' : '1px solid #fecaca',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
          }}>
            {isPending ? (
              <Clock size={18} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
            ) : (
              <AlertCircle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
            )}
            <div>
              {isPending && <strong style={{ display: 'block', marginBottom: '2px' }}>Approval Pending</strong>}
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              User ID or Email
            </label>
            <input
              type="text"
              required
              autoComplete="off"
              placeholder="Enter User ID or Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              tabIndex={1}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none',
                backgroundColor: '#ffffff',
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                Password
              </label>
              <Link
                to="/forgot-password"
                tabIndex={4}
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#2563eb',
                  textDecoration: 'none',
                }}
              >
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              required
              autoComplete="new-password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              tabIndex={2}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none',
                backgroundColor: '#ffffff',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            tabIndex={3}
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '11px',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 10px rgba(37,99,235,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Authenticating...' : (
              <>Sign In to Portal <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        {/* Link to Signup */}
        <div style={{
          marginTop: '1.75rem',
          textAlign: 'center',
          fontSize: '0.875rem',
          color: '#64748b',
          borderTop: '1px solid #f1f5f9',
          paddingTop: '1.25rem',
        }}>
          Don't have an account?{' '}
          <Link
            to="/signup"
            style={{
              color: '#2563eb',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Create an Account / Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
