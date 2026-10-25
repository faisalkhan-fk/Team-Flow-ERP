import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Clock, CheckCircle2, UserCheck, Calendar, Play, Square } from 'lucide-react';

export default function Attendance() {
  const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const currentEmpId = currentUser?.employeeId || (currentUser?.username === 'faisal' ? 'TF-IND-107' : currentUser?.username === 'admin' ? 'TF-IND-101' : 'TF-IND-100');
  const currentEmpName = currentUser?.name || currentUser?.username || 'Employee';
  const currentDept = currentUser?.department || 'Engineering';

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clockedIn, setClockedIn] = useState(false);
  const [activeLogId, setActiveLogId] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    fetchAttendance();
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/attendance');
      const data = Array.isArray(res.data) ? res.data : [];
      setLogs(data);

      // Determine if current user has an active clock-in today without clock-out
      const todayStr = new Date().toISOString().slice(0, 10);
      const activeLog = data.find(
        (l) =>
          (l.employeeId === currentEmpId || (l.employeeName && l.employeeName.toLowerCase() === currentEmpName.toLowerCase())) &&
          l.date === todayStr &&
          (!l.checkOut || l.checkOut === '--:--')
      );

      if (activeLog) {
        setClockedIn(true);
        setActiveLogId(activeLog._id);
      } else {
        setClockedIn(false);
        setActiveLogId(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    try {
      await axios.post('/api/attendance', {
        employeeId: currentEmpId,
        employeeName: currentEmpName,
        department: currentDept,
      });
      fetchAttendance();
    } catch (err) {
      console.error(err);
      alert('Failed to record clock in: ' + err.message);
    }
  };

  const handleClockOut = async () => {
    try {
      const targetId = activeLogId || (logs.find(
        (l) =>
          (l.employeeId === currentEmpId || (l.employeeName && l.employeeName.toLowerCase() === currentEmpName.toLowerCase())) &&
          (!l.checkOut || l.checkOut === '--:--')
      )?._id);

      if (targetId) {
        await axios.patch(`/api/attendance/${targetId}/clockout`);
      } else if (logs.length > 0) {
        await axios.patch(`/api/attendance/${logs[0]._id}/clockout`);
      }
      fetchAttendance();
    } catch (err) {
      console.error(err);
      alert('Failed to record clock out: ' + err.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#1e293b' }}>
      <Sidebar />
      <Navbar />

      <div style={{ marginLeft: '260px', padding: '2rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Attendance & Time Tracking
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
              Real-time shift tracking, biometric timestamps, and workforce punctuality logs
            </p>
          </div>

          {/* Clock-in / Out Widget */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            padding: '10px 16px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            flexWrap: 'wrap',
          }}>
            <div style={{ fontSize: '0.8rem', color: '#475569', borderRight: '1px solid #e2e8f0', paddingRight: '12px' }}>
              Logged in: <strong style={{ color: '#0f172a' }}>{currentEmpName}</strong> ({currentEmpId})
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
              🕒 {currentTime}
            </div>
            {!clockedIn ? (
              <button
                onClick={handleClockIn}
                style={{
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  padding: '7px 16px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 4px rgba(16,185,129,0.2)',
                }}
              >
                <Play size={14} /> Punch In
              </button>
            ) : (
              <button
                onClick={handleClockOut}
                style={{
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  padding: '7px 16px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 4px rgba(239,68,68,0.2)',
                }}
              >
                <Square size={14} /> Punch Out
              </button>
            )}
          </div>
        </div>

        {/* Attendance Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Present Today</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>
              {new Set(logs.filter((l) => l.status === 'Present' || l.status === 'Late').map((l) => l.employeeName)).size || logs.length} Members
            </div>
          </div>
          <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Late Arrivals</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
              {logs.filter((l) => l.status === 'Late').length} Member(s)
            </div>
          </div>
          <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Active Punch-ins</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#6366f1', marginTop: '4px' }}>
              {logs.filter((l) => !l.checkOut || l.checkOut === '--:--').length} Active
            </div>
          </div>
          <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Records Logged</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
              {logs.length} Entries
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Employee</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Department</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Check-In</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Check-Out</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Shift Duration</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading attendance records...</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{log.employeeName}</td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>{log.department}</td>
                    <td style={{ padding: '12px 16px' }}>{log.date}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#16a34a' }}>{log.checkIn}</td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{log.checkOut || '--:--'}</td>
                    <td style={{ padding: '12px 16px' }}>{log.workingHours || 8.0} hrs</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '9999px',
                        backgroundColor: log.status === 'Present' ? '#ecfdf5' : log.status === 'Late' ? '#fef3c7' : '#eff6ff',
                        color: log.status === 'Present' ? '#065f46' : log.status === 'Late' ? '#92400e' : '#1e40af',
                      }}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
