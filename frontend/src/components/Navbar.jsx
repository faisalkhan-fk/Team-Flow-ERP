import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { Bell, Search, Plus, LogOut, ChevronRight, Sparkles } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const rawUser = localStorage.getItem('user');
  const user = rawUser ? JSON.parse(rawUser) : { username: 'admin', name: 'Arjun Singhania', roles: ['ROLE_ADMIN'] };

  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showQuickAction, setShowQuickAction] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/notifications');
      if (Array.isArray(res.data)) setNotifications(res.data);
    } catch (err) {
      console.warn(err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.warn(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getPageTitle = (path) => {
    if (path.startsWith('/salary-slip') || path === '/my-payslip') return 'Salary Slip & Compensation';
    switch (path) {
      case '/dashboard': return 'Dashboard Overview';
      case '/employees': return 'Employee Roster & Directory';
      case '/departments': return 'Divisions & Corporate Budget';
      case '/attendance': return 'Time & Attendance Telemetry';
      case '/projects': return 'Project Portfolio & Roadmaps';
      case '/tasks': return 'Sprint Kanban Operations';
      case '/leaves': return 'Leave Approval Hub';
      case '/ai': return 'TeamFlow AI Intelligence';
      case '/reports': return 'Reports & Analytics Center';
      default: return 'Overview';
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div style={{
      height: '64px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e6ebf4',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      marginLeft: '260px',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      {/* Breadcrumb Path */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
        <span style={{ color: '#64748b', fontWeight: 500 }}>TeamFlow</span>
        <ChevronRight size={14} color="#94a3b8" />
        <span style={{ color: '#0f172a', fontWeight: 700 }}>{getPageTitle(location.pathname)}</span>
      </div>

      {/* Center/Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Modern Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#f1f5f9',
          padding: '6px 14px',
          borderRadius: '8px',
          width: '260px',
        }}>
          <Search size={15} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search team, projects..."
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '0.825rem',
              width: '100%',
              color: '#1e293b',
            }}
          />
          <span style={{ fontSize: '0.65rem', backgroundColor: '#e2e8f0', color: '#64748b', padding: '2px 5px', borderRadius: '4px', fontWeight: 700 }}>
            ⌘K
          </span>
        </div>

        {/* Quick Action Button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowQuickAction(!showQuickAction)}
            style={{
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              padding: '7px 14px',
              borderRadius: '6px',
              fontSize: '0.825rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)',
            }}
          >
            <Plus size={15} /> Quick Action
          </button>

          {showQuickAction && (
            <div style={{
              position: 'absolute',
              right: 0,
              marginTop: '8px',
              width: '190px',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
              border: '1px solid #e2e8f0',
              padding: '6px 0',
              zIndex: 100,
            }}>
              <Link
                to="/employees"
                onClick={() => setShowQuickAction(false)}
                style={{ display: 'block', padding: '8px 16px', fontSize: '0.825rem', color: '#1e293b', textDecoration: 'none' }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = '#f8fafc')}
                onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
              >
                + New Employee
              </Link>
              <Link
                to="/projects"
                onClick={() => setShowQuickAction(false)}
                style={{ display: 'block', padding: '8px 16px', fontSize: '0.825rem', color: '#1e293b', textDecoration: 'none' }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = '#f8fafc')}
                onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
              >
                + New Project
              </Link>
              <Link
                to="/tasks"
                onClick={() => setShowQuickAction(false)}
                style={{ display: 'block', padding: '8px 16px', fontSize: '0.825rem', color: '#1e293b', textDecoration: 'none' }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = '#f8fafc')}
                onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
              >
                + New Sprint Task
              </Link>
            </div>
          )}
        </div>

        {/* Bell Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              position: 'relative',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              cursor: 'pointer',
              padding: '8px',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                fontSize: '9px',
                fontWeight: 800,
                padding: '2px 5px',
                borderRadius: '9999px',
                border: '2px solid #ffffff',
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <div style={{
              position: 'absolute',
              right: 0,
              marginTop: '10px',
              width: '320px',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              zIndex: 100,
            }}>
              <div style={{
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                padding: '10px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b' }}>Enterprise Alerts</span>
                {unreadCount > 0 && (
                  <span style={{ backgroundColor: '#fee2e2', color: '#dc2626', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                    {unreadCount} New
                  </span>
                )}
              </div>

              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => { if (!n.read) markAsRead(n.id); }}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      backgroundColor: !n.read ? '#f5f3ff' : '#ffffff',
                    }}
                  >
                    <p style={{ fontSize: '0.825rem', color: '#1e293b', fontWeight: !n.read ? 600 : 400, margin: 0 }}>
                      {n.message}
                    </p>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', marginTop: '4px', display: 'block' }}>
                      {n.type} • {new Date(n.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 10px 4px 6px',
          borderRadius: '8px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: (user.role === 'ROLE_ADMIN' || user.roles?.[0] === 'ROLE_ADMIN')
              ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
              : (user.role === 'ROLE_MANAGER' || user.roles?.[0] === 'ROLE_MANAGER')
              ? 'linear-gradient(135deg, #0d9488 0%, #059669 100%)'
              : 'linear-gradient(135deg, #2563eb 0%, #0284c7 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 800,
          }}>
            {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.1 }}>
              {user.name || user.username}
            </div>
            <div style={{
              fontSize: '0.65rem',
              color: (user.role === 'ROLE_ADMIN' || user.roles?.[0] === 'ROLE_ADMIN')
                ? '#6366f1'
                : (user.role === 'ROLE_MANAGER' || user.roles?.[0] === 'ROLE_MANAGER')
                ? '#0d9488'
                : '#2563eb',
              fontWeight: 700,
              letterSpacing: '0.04em',
            }}>
              {(user.role === 'ROLE_ADMIN' || user.roles?.[0] === 'ROLE_ADMIN')
                ? 'Admin'
                : (user.role === 'ROLE_MANAGER' || user.roles?.[0] === 'ROLE_MANAGER')
                ? 'Manager'
                : 'Employee'}
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Sign Out"
          style={{
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            border: 'none',
            padding: '8px',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}
