import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  Briefcase,
  CheckSquare,
  Palmtree,
  Sparkles,
  FileSpreadsheet,
  Layers,
  ChevronDown,
  Building,
  FileText
} from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const isAdmin = currentUser?.role === 'ROLE_ADMIN' || currentUser?.roles?.[0] === 'ROLE_ADMIN';
  const isManager = currentUser?.role === 'ROLE_MANAGER' || currentUser?.roles?.[0] === 'ROLE_MANAGER';
  const isEmployee = !isAdmin && !isManager;

  const groups = [
    {
      category: 'OPERATIONS',
      items: [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/projects', label: 'Projects & Roadmaps', icon: Briefcase },
        { to: '/tasks', label: 'Sprint Kanban', icon: CheckSquare },
      ],
    },
    {
      category: 'WORKFORCE & HR',
      items: [
        { to: '/employees', label: 'Employee Roster', icon: Users },
        { to: '/salary-slip/me', label: isEmployee ? 'My Pay Slip' : 'Payroll / Salary Slips', icon: FileText, badge: isEmployee ? 'My Slip' : undefined },
        { to: '/departments', label: 'Divisions & Budget', icon: Building2 },
        { to: '/attendance', label: 'Time & Attendance', icon: Clock },
        { to: '/leaves', label: 'Leave Requests', icon: Palmtree },
      ],
    },
    {
      category: 'INTELLIGENCE',
      items: [
        { to: '/ai', label: 'TeamFlow AI Assistant', icon: Sparkles, badge: 'Smart' },
        { to: '/reports', label: 'Reports & Export', icon: FileSpreadsheet },
      ],
    },
  ];

  const isActive = (path) => {
    if (path === '/salary-slip/me') {
      return location.pathname.startsWith('/salary-slip') || location.pathname === '/my-payslip';
    }
    return location.pathname === path;
  };

  return (
    <div style={{
      width: '260px',
      backgroundColor: '#0b0f19',
      color: '#f8fafc',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      boxShadow: '4px 0 24px rgba(0, 0, 0, 0.15)',
      overflowY: 'auto',
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid rgba(255, 255, 255, 0.06)',
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '1.25rem 1.25rem 1rem 1.25rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
          }}>
            <Layers size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
              TeamFlow <span style={{ color: '#06b6d4' }}>ERP</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              Enterprise Cloud v2.4
            </div>
          </div>
        </div>

        {/* Workspace Switcher Pill */}
        <div style={{
          marginTop: '12px',
          padding: '6px 10px',
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: '#cbd5e1',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
            <span style={{ fontWeight: 600 }}>Main Headquarters</span>
          </div>
          <ChevronDown size={14} color="#94a3b8" />
        </div>
      </div>

      {/* Grouped Navigation */}
      <div style={{ padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
        {groups.map((grp) => (
          <div key={grp.category}>
            <div style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              color: '#64748b',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '0 12px 6px 12px',
            }}>
              {grp.category}
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {grp.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.to);
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: active ? 700 : 500,
                        textDecoration: 'none',
                        color: active ? '#ffffff' : '#94a3b8',
                        backgroundColor: active ? 'rgba(79, 70, 229, 0.22)' : 'transparent',
                        border: active ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Icon size={17} color={active ? '#818cf8' : '#94a3b8'} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span style={{
                          backgroundColor: 'rgba(6, 182, 212, 0.2)',
                          color: '#38bdf8',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '4px',
                        }}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Footer System Status */}
      <div style={{
        padding: '1rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        backgroundColor: 'rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
          <span style={{ color: '#64748b' }}>Cluster Status</span>
          <span style={{ color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            ● Operational
          </span>
        </div>
      </div>
    </div>
  );
}
