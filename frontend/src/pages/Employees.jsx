import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { 
  UserPlus, 
  Search, 
  LayoutGrid, 
  List, 
  Edit, 
  Trash2, 
  FileText, 
  Mail, 
  DollarSign, 
  Star, 
  X, 
  Briefcase,
  Check,
  Clock,
  UserCheck,
  ShieldCheck,
  Users,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [toast, setToast] = useState(null);

  // Admin Approval states
  const [activeTab, setActiveTab] = useState('roster'); // 'roster' | 'approvals'
  const [approvals, setApprovals] = useState([]);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [approvalFilter, setApprovalFilter] = useState('ALL');
  const [approvalSearch, setApprovalSearch] = useState('');

  const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const isAdmin = currentUser?.role === 'ROLE_ADMIN' || currentUser?.roles?.[0] === 'ROLE_ADMIN';
  const isManager = currentUser?.role === 'ROLE_MANAGER' || currentUser?.roles?.[0] === 'ROLE_MANAGER';
  const isEmployee = !isAdmin && !isManager;

  // Check if an employee record belongs to the currently logged in user
  const isOwnProfile = (emp) => {
    if (!currentUser || !emp) return false;
    const userEmail = (currentUser.email || '').trim().toLowerCase();
    const empEmail = (emp.email || '').trim().toLowerCase();
    if (userEmail && empEmail && userEmail === empEmail) return true;

    const userName = (currentUser.name || '').trim().toLowerCase();
    const empName = (emp.name || '').trim().toLowerCase();
    if (userName && empName && userName === empName) return true;

    const userUsername = (currentUser.username || '').trim().toLowerCase();
    const empId = (emp.employeeId || '').trim().toLowerCase();
    if (userUsername && empId && (userUsername === empId || emp.email?.toLowerCase().startsWith(userUsername))) return true;

    return false;
  };

  // Edit permission: Admin & Manager can edit team; Employee can ONLY edit their own data!
  const canEditEmployee = (emp) => {
    if (isAdmin) return true;
    if (isManager) return true;
    return isOwnProfile(emp);
  };

  // Pay Slip permission: Admin & Manager can view any payslip; Employee can ONLY view their own payslip!
  const canViewPaySlip = (emp) => {
    if (isAdmin) return true;
    if (isManager) return true;
    return isOwnProfile(emp);
  };

  // Delete permission: Only Admin can delete employees
  const canDeleteEmployee = () => {
    return isAdmin;
  };

  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    email: '',
    department: 'Engineering',
    role: '',
    salary: '',
    skills: '',
    performanceScore: '4.5',
  });

  const departments = ['All', 'Engineering', 'Product', 'Design', 'Marketing', 'Human Resources', 'Finance'];

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedDept !== 'All') params.append('department', selectedDept);

      const res = await axios.get(`/api/employees?${params.toString()}`);
      if (res.data?.data) {
        setEmployees(res.data.data);
      }
    } catch (err) {
      showToast('error', 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovals = async () => {
    try {
      setApprovalLoading(true);
      const res = await axios.get('/api/auth/approvals');
      setApprovals(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn('Failed to fetch approvals:', err);
    } finally {
      setApprovalLoading(false);
    }
  };

  const handleApprovalAction = async (id, status, name) => {
    try {
      await axios.put(`/api/auth/approvals/${id}`, { status });
      showToast('success', `Account for ${name} has been ${status.toLowerCase()}!`);
      fetchApprovals();
      fetchEmployees();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update approval status');
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchApprovals();
  }, [selectedDept]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEmployee) {
        if (!canEditEmployee(editingEmployee)) {
          showToast('error', 'Permission Denied: You can only edit your own employee profile.');
          return;
        }
        await axios.put(`/api/employees/${editingEmployee._id || editingEmployee.employeeId}`, formData);
        showToast('success', 'Employee profile updated successfully');
      } else {
        if (!isAdmin && !isManager) {
          showToast('error', 'Permission Denied: Only Admin or Manager can add new employees.');
          return;
        }
        await axios.post('/api/employees', formData);
        showToast('success', 'Employee created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchEmployees();
    } catch (err) {
      showToast('error', err.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id, name) => {
    if (!isAdmin) {
      showToast('error', 'Permission Denied: Only Admin can delete employee records.');
      return;
    }
    if (!window.confirm(`Delete record for ${name}?`)) return;
    try {
      await axios.delete(`/api/employees/${id}`);
      showToast('success', `Employee ${name} deleted`);
      fetchEmployees();
    } catch (err) {
      showToast('error', 'Failed to delete employee');
    }
  };

  const openEditModal = (emp) => {
    if (!canEditEmployee(emp)) {
      showToast('error', 'Restricted: You can only edit your own employee profile.');
      return;
    }
    setEditingEmployee(emp);
    setFormData({
      employeeId: emp.employeeId,
      name: emp.name,
      email: emp.email,
      department: emp.department,
      role: emp.role,
      salary: emp.salary,
      skills: Array.isArray(emp.skills) ? emp.skills.join(', ') : emp.skills,
      performanceScore: emp.performanceScore || 4.2,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingEmployee(null);
    setFormData({
      employeeId: '',
      name: '',
      email: '',
      department: 'Engineering',
      role: '',
      salary: '',
      skills: '',
      performanceScore: '4.5',
    });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f6fb', color: '#0f172a' }}>
      <Sidebar />
      <Navbar />

      <div style={{ marginLeft: '260px', padding: '2rem' }}>
        {toast && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            padding: '12px 20px',
            borderRadius: '8px',
            backgroundColor: toast.type === 'success' ? '#10b981' : '#ef4444',
            color: '#ffffff',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}>
            {toast.message}
          </div>
        )}

        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              Employee Workforce Directory
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
              Corporate directory, salary packages, performance rankings, and compensation slips
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* View Mode Switcher (Table vs Grid) */}
            <div style={{
              backgroundColor: '#e2e8f0',
              padding: '3px',
              borderRadius: '8px',
              display: 'flex',
              gap: '2px',
            }}>
              <button
                onClick={() => setViewMode('table')}
                style={{
                  border: 'none',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  backgroundColor: viewMode === 'table' ? '#ffffff' : 'transparent',
                  color: viewMode === 'table' ? '#4f46e5' : '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.785rem',
                  fontWeight: 700,
                }}
              >
                <List size={14} /> Table
              </button>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  border: 'none',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  backgroundColor: viewMode === 'grid' ? '#ffffff' : 'transparent',
                  color: viewMode === 'grid' ? '#4f46e5' : '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.785rem',
                  fontWeight: 700,
                }}
              >
                <LayoutGrid size={14} /> Grid
              </button>
            </div>

            {(isAdmin || isManager) && (
              <button
                onClick={() => { resetForm(); setShowModal(true); }}
                style={{
                  backgroundColor: '#4f46e5',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 18px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(79,70,229,0.3)',
                }}
              >
                <UserPlus size={16} /> Add Employee
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs: Employee Roster vs Account Approvals (Admin Only) */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
          <button
            onClick={() => setActiveTab('roster')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 18px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'roster' ? '#4f46e5' : '#ffffff',
              color: activeTab === 'roster' ? '#ffffff' : '#64748b',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'roster' ? '0 2px 8px rgba(79,70,229,0.3)' : '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'all 0.15s ease',
            }}
          >
            <Users size={16} /> Employee Roster
            <span style={{
              backgroundColor: activeTab === 'roster' ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
              color: activeTab === 'roster' ? '#ffffff' : '#475569',
              padding: '2px 7px',
              borderRadius: '9999px',
              fontSize: '0.725rem',
              fontWeight: 800,
            }}>
              {employees.length}
            </span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('approvals')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'approvals' ? '#4f46e5' : '#ffffff',
                color: activeTab === 'approvals' ? '#ffffff' : '#64748b',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                boxShadow: activeTab === 'approvals' ? '0 2px 8px rgba(79,70,229,0.3)' : '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'all 0.15s ease',
              }}
            >
              <ShieldCheck size={16} /> Account Approvals
              {approvals.filter((a) => a.status === 'Pending').length > 0 && (
                <span style={{
                  backgroundColor: '#f59e0b',
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  fontSize: '0.725rem',
                  fontWeight: 800,
                }}>
                  {approvals.filter((a) => a.status === 'Pending').length} Pending
                </span>
              )}
            </button>
          )}
        </div>

        {activeTab === 'roster' && (
          <>
        {/* Filter Bar with Segmented Department Pills */}
        <div className="bento-card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <form onSubmit={(e) => { e.preventDefault(); fetchEmployees(); }} style={{ display: 'flex', gap: '8px', flex: 1, maxWidth: '380px' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '10px' }} />
                <input
                  type="text"
                  placeholder="Search by name, role or employee ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>
              <button
                type="submit"
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Search
              </button>
            </form>

            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Total Results: <strong>{employees.length}</strong>
            </span>
          </div>

          {/* Department Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  fontSize: '0.785rem',
                  fontWeight: selectedDept === dept ? 700 : 500,
                  border: selectedDept === dept ? '1px solid #4f46e5' : '1px solid #e2e8f0',
                  backgroundColor: selectedDept === dept ? '#eef2ff' : '#ffffff',
                  color: selectedDept === dept ? '#4f46e5' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* View Mode: Modern Table */}
        {viewMode === 'table' ? (
          <div className="bento-card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e6ebf4', color: '#64748b' }}>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Employee Details</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Division & Designation</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Compensation</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Performance</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading records...</td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No employees found.</td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr key={emp._id || emp.employeeId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                          }}>
                            {emp.name ? emp.name.charAt(0) : 'E'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {emp.name}
                              {isOwnProfile(emp) && (
                                <span style={{
                                  backgroundColor: '#e0e7ff',
                                  color: '#4338ca',
                                  fontSize: '0.65rem',
                                  fontWeight: 800,
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  letterSpacing: '0.04em',
                                }}>
                                  YOU
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              <span style={{ fontWeight: 600, color: '#4f46e5' }}>{emp.employeeId}</span> • {emp.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{emp.role}</div>
                        <span className="badge-pill badge-pill-info" style={{ marginTop: '2px' }}>
                          {emp.department}
                        </span>
                      </td>

                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a' }}>
                        ₹{(emp.salary || 0).toLocaleString('en-IN')} / yr
                        <div style={{ fontSize: '0.75rem', color: '#4f46e5', fontWeight: 600 }}>
                          ({((emp.salary || 0) / 100000).toFixed(1)} LPA)
                        </div>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontWeight: 700 }}>
                          <Star size={14} fill="#f59e0b" />
                          <span>{emp.performanceScore || '4.2'}</span>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>/ 5.0</span>
                        </div>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <span className="badge-pill badge-pill-success">
                          Active
                        </span>
                      </td>

                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                          {canViewPaySlip(emp) ? (
                            <Link
                              to={`/salary-slip/${emp._id || emp.employeeId}`}
                              style={{
                                padding: '6px 10px',
                                backgroundColor: isOwnProfile(emp) ? '#4f46e5' : '#eef2ff',
                                color: isOwnProfile(emp) ? '#ffffff' : '#4f46e5',
                                border: isOwnProfile(emp) ? '1px solid #4338ca' : '1px solid #c7d2fe',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                boxShadow: isOwnProfile(emp) ? '0 1px 4px rgba(79,70,229,0.3)' : 'none',
                              }}
                              title={isOwnProfile(emp) ? "View My Official Pay Slip" : `View Pay Slip for ${emp.name}`}
                            >
                              <FileText size={13} /> {isOwnProfile(emp) && isEmployee ? 'My Pay Slip' : 'Pay Slip'}
                            </Link>
                          ) : (
                            <span
                              style={{
                                padding: '5px 8px',
                                backgroundColor: '#f1f5f9',
                                color: '#94a3b8',
                                borderRadius: '6px',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                cursor: 'not-allowed',
                              }}
                              title="Confidential: Only this employee or Admin can view this payslip"
                            >
                              🔒 Private
                            </span>
                          )}
                          {canEditEmployee(emp) && (
                            <button
                              onClick={() => openEditModal(emp)}
                              title={isOwnProfile(emp) ? "Edit My Profile" : "Edit Employee Record"}
                              style={{ padding: '6px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                            >
                              <Edit size={14} color="#475569" />
                            </button>
                          )}
                          {canDeleteEmployee(emp) && (
                            <button
                              onClick={() => handleDelete(emp._id || emp.employeeId, emp.name)}
                              title="Delete Employee"
                              style={{ padding: '6px', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer' }}
                            >
                              <Trash2 size={14} color="#dc2626" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* View Mode: Bento Grid Cards */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.25rem',
          }}>
            {employees.map((emp) => (
              <div key={emp._id || emp.employeeId} className="bento-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1rem',
                    }}>
                      {emp.name ? emp.name.charAt(0) : 'E'}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{emp.name}</h3>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{emp.employeeId}</div>
                    </div>
                  </div>
                  <span className="badge-pill badge-pill-info">{emp.department}</span>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Briefcase size={14} color="#64748b" />
                    <span>{emp.role}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={14} color="#64748b" />
                    <span style={{ color: '#64748b' }}>{emp.email}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 800, color: '#16a34a', fontSize: '0.9rem' }}>₹</span>
                    <span><strong>₹{(emp.salary || 0).toLocaleString('en-IN')}</strong> / yr <span style={{ color: '#4f46e5', fontWeight: 600, fontSize: '0.75rem' }}>({((emp.salary || 0) / 100000).toFixed(1)} LPA)</span></span>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '10px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontWeight: 700, fontSize: '0.85rem' }}>
                    <Star size={14} fill="#f59e0b" />
                    <span>{emp.performanceScore || '4.2'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {canViewPaySlip(emp) && (
                      <Link
                        to={`/salary-slip/${emp._id || emp.employeeId}`}
                        style={{
                          padding: '5px 8px',
                          backgroundColor: isOwnProfile(emp) ? '#4f46e5' : '#eef2ff',
                          color: isOwnProfile(emp) ? '#ffffff' : '#4f46e5',
                          border: isOwnProfile(emp) ? '1px solid #4338ca' : '1px solid #c7d2fe',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                        }}
                        title={isOwnProfile(emp) ? "View My Official Pay Slip" : `View Pay Slip for ${emp.name}`}
                      >
                        {isOwnProfile(emp) && isEmployee ? 'My Slip' : 'Slip'}
                      </Link>
                    )}
                    {canEditEmployee(emp) && (
                      <button onClick={() => openEditModal(emp)} title={isOwnProfile(emp) ? "Edit My Profile" : "Edit Employee"} style={{ padding: '5px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}>
                        <Edit size={13} />
                      </button>
                    )}
                    {canDeleteEmployee(emp) && (
                      <button onClick={() => handleDelete(emp._id || emp.employeeId, emp.name)} title="Delete Employee" style={{ padding: '5px', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer' }}>
                        <Trash2 size={13} color="#dc2626" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </>
        )}

        {/* Account Approvals Tab View */}
        {activeTab === 'approvals' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Filter toolbar */}
            <div className="bento-card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['ALL', 'Pending', 'Approved', 'Rejected'].map((statusKey) => {
                  const count = statusKey === 'ALL'
                    ? approvals.length
                    : approvals.filter((a) => a.status === statusKey).length;
                  return (
                    <button
                      key={statusKey}
                      onClick={() => setApprovalFilter(statusKey)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '9999px',
                        fontSize: '0.8rem',
                        fontWeight: approvalFilter === statusKey ? 700 : 500,
                        border: approvalFilter === statusKey ? '1px solid #4f46e5' : '1px solid #e2e8f0',
                        backgroundColor: approvalFilter === statusKey ? '#eef2ff' : '#ffffff',
                        color: approvalFilter === statusKey ? '#4f46e5' : '#475569',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>{statusKey === 'ALL' ? 'All Requests' : statusKey}</span>
                      <span style={{
                        backgroundColor: approvalFilter === statusKey ? '#4f46e5' : '#e2e8f0',
                        color: approvalFilter === statusKey ? '#ffffff' : '#64748b',
                        padding: '1px 6px',
                        borderRadius: '9999px',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                      }}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search in approvals */}
              <div style={{ position: 'relative', width: '260px' }}>
                <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '9px' }} />
                <input
                  type="text"
                  placeholder="Filter candidate by name..."
                  value={approvalSearch}
                  onChange={(e) => setApprovalSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 12px 7px 32px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.825rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Approvals Table */}
            <div className="bento-card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                    Corporate Account Approvals Queue
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                    Administrator verification queue for Employee and Manager portal registrations
                  </p>
                </div>
                <button
                  onClick={fetchApprovals}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Refresh Queue
                </button>
              </div>

              {approvalLoading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                  Loading approvals queue...
                </div>
              ) : approvals.filter((a) => {
                if (approvalFilter !== 'ALL' && a.status !== approvalFilter) return false;
                if (approvalSearch && !a.name.toLowerCase().includes(approvalSearch.toLowerCase()) && !a.username.toLowerCase().includes(approvalSearch.toLowerCase())) return false;
                return true;
              }).length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                  <ShieldCheck size={36} color="#cbd5e1" style={{ marginBottom: '8px' }} />
                  <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#64748b' }}>
                    No account registration requests found.
                  </p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.825rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                        <th style={{ padding: '12px 16px' }}>Candidate / User</th>
                        <th style={{ padding: '12px 16px' }}>Account Type</th>
                        <th style={{ padding: '12px 16px' }}>Department & Designation</th>
                        <th style={{ padding: '12px 16px' }}>Email</th>
                        <th style={{ padding: '12px 16px' }}>Requested On</th>
                        <th style={{ padding: '12px 16px' }}>Status</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Admin Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvals
                        .filter((a) => {
                          if (approvalFilter !== 'ALL' && a.status !== approvalFilter) return false;
                          if (approvalSearch && !a.name.toLowerCase().includes(approvalSearch.toLowerCase()) && !a.username.toLowerCase().includes(approvalSearch.toLowerCase())) return false;
                          return true;
                        })
                        .map((reqUser) => (
                          <tr key={reqUser.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '8px',
                                  backgroundColor: reqUser.role === 'ROLE_MANAGER' ? '#0d9488' : '#2563eb',
                                  color: '#ffffff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 800,
                                  fontSize: '0.75rem',
                                }}>
                                  {reqUser.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{reqUser.name}</div>
                                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>@{reqUser.username}</div>
                                </div>
                              </div>
                            </td>

                            <td style={{ padding: '12px 16px' }}>
                              <span style={{
                                backgroundColor: reqUser.role === 'ROLE_MANAGER' ? '#f0fdfa' : '#eff6ff',
                                color: reqUser.role === 'ROLE_MANAGER' ? '#0f766e' : '#1e40af',
                                border: reqUser.role === 'ROLE_MANAGER' ? '1px solid #ccfbf1' : '1px solid #dbeafe',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                              }}>
                                {reqUser.role === 'ROLE_MANAGER' ? 'Manager' : 'Employee'}
                              </span>
                            </td>

                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ fontWeight: 600, color: '#1e293b' }}>{reqUser.designation || 'Team Member'}</div>
                              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{reqUser.department}</div>
                            </td>

                            <td style={{ padding: '12px 16px', color: '#475569' }}>
                              {reqUser.email}
                            </td>

                            <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.75rem' }}>
                              {reqUser.requestedAt ? new Date(reqUser.requestedAt).toLocaleDateString('en-IN') : 'Recent'}
                            </td>

                            <td style={{ padding: '12px 16px' }}>
                              <span style={{
                                backgroundColor: reqUser.status === 'Approved' ? '#ecfdf5' : reqUser.status === 'Rejected' ? '#fee2e2' : '#fef3c7',
                                color: reqUser.status === 'Approved' ? '#065f46' : reqUser.status === 'Rejected' ? '#dc2626' : '#92400e',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}>
                                {reqUser.status === 'Approved' && <Check size={12} />}
                                {reqUser.status === 'Pending' && <Clock size={12} />}
                                {reqUser.status || 'Pending'}
                              </span>
                            </td>

                            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '6px' }}>
                                {reqUser.status !== 'Approved' && (
                                  <button
                                    onClick={() => handleApprovalAction(reqUser.id, 'Approved', reqUser.name)}
                                    title="Approve Account"
                                    style={{
                                      backgroundColor: '#10b981',
                                      color: '#ffffff',
                                      border: 'none',
                                      padding: '5px 10px',
                                      borderRadius: '6px',
                                      fontSize: '0.75rem',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                    }}
                                  >
                                    <Check size={13} /> Approve
                                  </button>
                                )}

                                {reqUser.status !== 'Rejected' && (
                                  <button
                                    onClick={() => handleApprovalAction(reqUser.id, 'Rejected', reqUser.name)}
                                    title="Reject Account"
                                    style={{
                                      backgroundColor: '#fee2e2',
                                      color: '#dc2626',
                                      border: '1px solid #fecaca',
                                      padding: '5px 10px',
                                      borderRadius: '6px',
                                      fontSize: '0.75rem',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                    }}
                                  >
                                    <X size={13} /> Reject
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}>
            <div style={{ width: '100%', maxWidth: '520px', backgroundColor: '#ffffff', borderRadius: '10px', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                    {editingEmployee
                      ? (isOwnProfile(editingEmployee) && isEmployee ? 'Edit My Profile' : 'Edit Employee Details')
                      : 'Add New Employee'}
                  </h2>
                  {editingEmployee && isOwnProfile(editingEmployee) && isEmployee && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                      Update your personal details. Compensation & Department are managed by Admin.
                    </p>
                  )}
                </div>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      Employee ID *
                    </label>
                    <input
                      type="text"
                      name="employeeId"
                      required
                      disabled={true}
                      placeholder="TF-IND-106"
                      value={formData.employeeId}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#f1f5f9', cursor: 'not-allowed' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.name}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      Work Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="rahul@teamflow.in"
                      value={formData.email}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      Department * {!isAdmin && <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>(Admin Only)</span>}
                    </label>
                    <select
                      name="department"
                      disabled={!isAdmin}
                      value={formData.department}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        backgroundColor: !isAdmin ? '#f1f5f9' : '#ffffff',
                        cursor: !isAdmin ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Product">Product</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Finance">Finance</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      Designation / Role * {!isAdmin && !isManager && <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>(Manager Only)</span>}
                    </label>
                    <input
                      type="text"
                      name="role"
                      required
                      disabled={!isAdmin && !isManager}
                      placeholder="e.g. Cloud Engineer"
                      value={formData.role}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        backgroundColor: !isAdmin && !isManager ? '#f1f5f9' : '#ffffff',
                        cursor: !isAdmin && !isManager ? 'not-allowed' : 'text',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      Annual CTC (₹ in INR) * {!isAdmin && <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>(Admin Only)</span>}
                    </label>
                    <input
                      type="number"
                      name="salary"
                      required
                      disabled={!isAdmin}
                      min="100000"
                      placeholder="e.g. 1250000 (12.5 LPA)"
                      value={formData.salary}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        backgroundColor: !isAdmin ? '#f1f5f9' : '#ffffff',
                        cursor: !isAdmin ? 'not-allowed' : 'text',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Key Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="skills"
                    placeholder="e.g. React.js, Node.js, Express, AWS"
                    value={formData.skills}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{ padding: '8px 16px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '8px 16px', border: 'none', backgroundColor: '#4f46e5', color: '#ffffff', fontWeight: 700, borderRadius: '6px', cursor: 'pointer' }}
                  >
                    {editingEmployee ? (isOwnProfile(editingEmployee) && isEmployee ? 'Update My Profile' : 'Save Updates') : 'Add Employee'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
