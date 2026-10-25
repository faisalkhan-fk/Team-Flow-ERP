import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Palmtree, Plus, Check, X, Clock, AlertCircle } from 'lucide-react';

export default function Leaves() {
  const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const isAdmin = currentUser?.role === 'ROLE_ADMIN' || currentUser?.roles?.[0] === 'ROLE_ADMIN';
  const isManager = currentUser?.role === 'ROLE_MANAGER' || currentUser?.roles?.[0] === 'ROLE_MANAGER';
  const isEmployee = !isAdmin && !isManager;
  const currentEmpId = currentUser?.employeeId || (currentUser?.username === 'faisal' ? 'TF-IND-107' : currentUser?.username === 'admin' ? 'TF-IND-101' : 'TF-IND-100');
  const currentEmpName = currentUser?.name || currentUser?.username || 'Employee';
  const currentDept = currentUser?.department || 'Engineering';

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewFilter, setViewFilter] = useState(isEmployee ? 'MY' : 'ALL'); // 'ALL' or 'MY'

  const [formData, setFormData] = useState({
    employeeId: currentEmpId,
    employeeName: currentEmpName,
    department: currentDept,
    leaveType: 'Casual Leave',
    startDate: '',
    endDate: '',
    days: 1,
    reason: '',
  });

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/leaves');
      setLeaves(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const openApplyModal = () => {
    setFormData({
      employeeId: currentEmpId,
      employeeName: currentEmpName,
      department: currentDept,
      leaveType: 'Casual Leave',
      startDate: '',
      endDate: '',
      days: 1,
      reason: '',
    });
    setShowModal(true);
  };

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/leaves', {
        ...formData,
        employeeId: currentEmpId,
        employeeName: currentEmpName,
        department: currentDept,
      });
      setShowModal(false);
      fetchLeaves();
    } catch (err) {
      alert('Error applying for leave: ' + err.message);
    }
  };

  const updateStatus = async (id, status) => {
    if (!isAdmin && !isManager) {
      alert('Only Administrators and Managers are authorized to approve or reject leave applications.');
      return;
    }
    try {
      await axios.patch(`/api/leaves/${id}/status`, { status });
      fetchLeaves();
    } catch (err) {
      console.error(err);
    }
  };

  const isMyLeave = (lv) => {
    if (lv.employeeId && lv.employeeId === currentEmpId) return true;
    if (lv.employeeName && lv.employeeName.toLowerCase() === currentEmpName.toLowerCase()) return true;
    return false;
  };

  const displayedLeaves = viewFilter === 'MY' ? leaves.filter(isMyLeave) : leaves;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#1e293b' }}>
      <Sidebar />
      <Navbar />

      <div style={{ marginLeft: '260px', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Leave Management
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
              Employee paid time off, sick leave applications, and HR approval workflows
            </p>
          </div>

          <button
            onClick={openApplyModal}
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '9px 18px',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Plus size={16} /> Apply for Leave
          </button>
        </div>

        {/* Leave Balances Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Casual Leaves</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>10 / 12 Days</div>
          </div>
          <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Sick Leaves</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>7 / 10 Days</div>
          </div>
          <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Paid Annual Leave</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#9333ea', marginTop: '4px' }}>15 / 18 Days</div>
          </div>
          <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Pending Approvals</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
              {leaves.filter((l) => l.status === 'PENDING').length} Requests
            </div>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
          <button
            onClick={() => setViewFilter('ALL')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.825rem',
              cursor: 'pointer',
              backgroundColor: viewFilter === 'ALL' ? '#2563eb' : '#f1f5f9',
              color: viewFilter === 'ALL' ? '#ffffff' : '#475569',
            }}
          >
            All Applications ({leaves.length})
          </button>
          <button
            onClick={() => setViewFilter('MY')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.825rem',
              cursor: 'pointer',
              backgroundColor: viewFilter === 'MY' ? '#2563eb' : '#f1f5f9',
              color: viewFilter === 'MY' ? '#ffffff' : '#475569',
            }}
          >
            My Leaves ({leaves.filter(isMyLeave).length})
          </button>
        </div>

        {/* Leaves Table */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Employee</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Department</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Leave Type</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Dates & Duration</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Reason</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading leave requests...</td>
                </tr>
              ) : displayedLeaves.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No leave applications found under this view.</td>
                </tr>
              ) : (
                displayedLeaves.map((lv) => (
                  <tr key={lv._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{lv.employeeName}</td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>{lv.department}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{lv.leaveType}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {lv.startDate} to {lv.endDate} ({lv.days} day{lv.days > 1 ? 's' : ''})
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b', maxWidth: '220px' }}>{lv.reason}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '9999px',
                        backgroundColor: lv.status === 'APPROVED' ? '#ecfdf5' : lv.status === 'REJECTED' ? '#fee2e2' : '#fef3c7',
                        color: lv.status === 'APPROVED' ? '#065f46' : lv.status === 'REJECTED' ? '#dc2626' : '#92400e',
                      }}>
                        {lv.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      {lv.status === 'PENDING' ? (
                        (isAdmin || isManager) ? (
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              onClick={() => updateStatus(lv._id, 'APPROVED')}
                              style={{
                                backgroundColor: '#10b981',
                                color: '#ffffff',
                                border: 'none',
                                padding: '5px 10px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Check size={12} /> Approve
                            </button>
                            <button
                              onClick={() => updateStatus(lv._id, 'REJECTED')}
                              style={{
                                backgroundColor: '#ef4444',
                                color: '#ffffff',
                                border: 'none',
                                padding: '5px 10px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <X size={12} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#b45309', backgroundColor: '#fef3c7', padding: '3px 8px', borderRadius: '4px' }}>
                            Awaiting HR Review
                          </span>
                        )
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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
            <div style={{ width: '100%', maxWidth: '480px', backgroundColor: '#ffffff', borderRadius: '8px', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Apply for Leave</h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', padding: '10px 14px', borderRadius: '6px', fontSize: '0.8rem', color: '#334155', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                <div>Applicant: <strong>{currentEmpName}</strong> ({currentEmpId})</div>
                <div style={{ color: '#64748b' }}>Dept: {currentDept}</div>
              </div>

              <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Leave Type</label>
                  <select
                    value={formData.leaveType}
                    onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  >
                    <option value="Casual Leave">Casual Leave</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Paid Leave">Paid Annual Leave</option>
                    <option value="Emergency Leave">Emergency Leave</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Start Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>End Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Total Days</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.days}
                    onChange={(e) => setFormData({ ...formData, days: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Reason for Leave *</label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Brief description of leave reason..."
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                    Cancel
                  </button>
                  <button type="submit" style={{ padding: '8px 16px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 700, borderRadius: '6px' }}>
                    Submit Request
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
