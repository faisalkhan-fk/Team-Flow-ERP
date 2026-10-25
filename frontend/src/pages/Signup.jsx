import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Layers, User, Briefcase, CheckCircle2, ArrowRight, ShieldAlert } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    department: 'Engineering',
    accountType: 'ROLE_EMPLOYEE', // 'ROLE_EMPLOYEE' or 'ROLE_MANAGER'
    designation: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [registeredRole, setRegisteredRole] = useState('');

  const departments = ['Engineering', 'Product', 'Design', 'Marketing', 'Human Resources', 'Finance'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.username.trim().toLowerCase() === 'admin') {
      setError('Admin account is reserved and unique. Only Employee or Manager accounts can be created.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post('/api/auth/register', {
        username: formData.username,
        name: formData.name,
        email: formData.email,
        department: formData.department,
        role: formData.accountType,
        designation: formData.designation,
        password: formData.password,
      });

      setSuccess(true);
      setRegisteredRole(res.data.role === 'ROLE_MANAGER' ? 'Manager' : 'Employee');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account. Please try again.');
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
      padding: '2.5rem 1rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '540px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        padding: '2.5rem',
        border: '1px solid #e2e8f0',
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
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
            Create Account
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
            Enter your details to create your workspace account
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            fontWeight: 500,
            border: '1px solid #fecaca',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981',
              marginBottom: '1rem',
            }}>
              <CheckCircle2 size={34} />
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              Registration Submitted!
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
              Your <strong>{registeredRole}</strong> account has been created.
              <br />
              <strong style={{ color: '#d97706' }}>
                Admin approval is required before you can log in.
              </strong>
            </p>

            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '14px 16px',
              textAlign: 'left',
              fontSize: '0.85rem',
              color: '#334155',
              marginBottom: '1.75rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Account Type:</span>
                <strong>{registeredRole}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Username:</span>
                <strong>{formData.username}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Status:</span>
                <span style={{
                  backgroundColor: '#fef3c7',
                  color: '#92400e',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}>
                  Pending Admin Approval
                </span>
              </div>
              {registeredRole === 'Employee' && (
                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>
                  ✓ Profile has been added to the Employee Roster directory.
                </div>
              )}
            </div>

            <button
              onClick={() => navigate('/login')}
              style={{
                width: '100%',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '11px',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
              }}
            >
              Go to Sign In <ArrowRight size={16} />
            </button>
          </div>
        ) : (

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          {/* Account Type Selection (Employee vs Manager) */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
              Select Account Type *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {/* Option 1: Employee */}
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, accountType: 'ROLE_EMPLOYEE' }))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: formData.accountType === 'ROLE_EMPLOYEE' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                  backgroundColor: formData.accountType === 'ROLE_EMPLOYEE' ? '#eff6ff' : '#ffffff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: formData.accountType === 'ROLE_EMPLOYEE' ? '#2563eb' : '#f1f5f9',
                  color: formData.accountType === 'ROLE_EMPLOYEE' ? '#ffffff' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <User size={18} />
                </div>
                <div>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: formData.accountType === 'ROLE_EMPLOYEE' ? '#1e40af' : '#1e293b',
                  }}>
                    Employee
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Team Member / Staff
                  </div>
                </div>
              </button>

              {/* Option 2: Manager */}
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, accountType: 'ROLE_MANAGER' }))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: formData.accountType === 'ROLE_MANAGER' ? '2px solid #0d9488' : '1px solid #cbd5e1',
                  backgroundColor: formData.accountType === 'ROLE_MANAGER' ? '#f0fdfa' : '#ffffff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: formData.accountType === 'ROLE_MANAGER' ? '#0d9488' : '#f1f5f9',
                  color: formData.accountType === 'ROLE_MANAGER' ? '#ffffff' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Briefcase size={18} />
                </div>
                <div>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: formData.accountType === 'ROLE_MANAGER' ? '#0f766e' : '#1e293b',
                  }}>
                    Manager
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Team Lead / Dept Head
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Full Name & Username */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                Username *
              </label>
              <input
                type="text"
                name="username"
                required
                placeholder="e.g. rahul.sharma"
                value={formData.username}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
              Work Email Address *
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="e.g. rahul@teamflow.in"
              value={formData.email}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Department & Designation */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                Department *
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                }}
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                Position / Job Title
              </label>
              <input
                type="text"
                name="designation"
                placeholder={formData.accountType === 'ROLE_MANAGER' ? 'e.g. Technical Manager' : 'e.g. Software Engineer'}
                value={formData.designation}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Password & Confirm */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                Password (min 6 chars) *
              </label>
              <input
                type="password"
                name="password"
                required
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.5rem',
              backgroundColor: formData.accountType === 'ROLE_MANAGER' ? '#0d9488' : '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '11px',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: formData.accountType === 'ROLE_MANAGER'
                ? '0 4px 10px rgba(13,148,136,0.3)'
                : '0 4px 10px rgba(37,99,235,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Registering Account...' : (
              <>
                Create {formData.accountType === 'ROLE_MANAGER' ? 'Manager' : 'Employee'} Account <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
        )}

        {/* Link back to Sign In (only when not in success view) */}
        {!success && (
          <div style={{
            marginTop: '1.75rem',
            textAlign: 'center',
            borderTop: '1px solid #f1f5f9',
            paddingTop: '1.25rem',
            fontSize: '0.875rem',
            color: '#64748b',
          }}>
            Already registered on TeamFlow ERP?{' '}
            <Link
              to="/login"
              style={{
                color: '#2563eb',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Sign In here
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

