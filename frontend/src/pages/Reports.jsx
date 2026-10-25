import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { 
  FileSpreadsheet, 
  Download, 
  RefreshCw, 
  Trash2, 
  FileText, 
  CheckCircle2, 
  HardDrive,
  FileCheck,
  Calendar,
  Users,
  Palmtree,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function Reports() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportingType, setExportingType] = useState(null); // 'attendance-pdf', 'attendance-excel', etc.
  const [selectedFileContent, setSelectedFileContent] = useState('');
  const [activeFileName, setActiveFileName] = useState('');
  const [toast, setToast] = useState(null);

  // Hidden print element ref for html2pdf
  const printContainerRef = useRef(null);
  const [pdfRenderData, setPdfRenderData] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/node-fs/list');
      if (res.data?.success) {
        setFiles(res.data.files || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // Universal CSV Downloader
  const downloadCSV = (filename, csvContent) => {
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Downloaded '${filename}' successfully!`);
  };

  // Helper for generating PDF from container
  const triggerPdfGeneration = async (filename, renderObj) => {
    setPdfRenderData(renderObj);
    // Allow React state to render the hidden preview DOM
    setTimeout(async () => {
      try {
        const element = document.getElementById('report-pdf-render-area');
        if (!element) {
          throw new Error('PDF render container not found');
        }

        const opt = {
          margin: [10, 10, 10, 10],
          filename: filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
        };

        const generator = window.html2pdf || (await import('html2pdf.js')).default;
        if (generator) {
          await generator().set(opt).from(element).save();
          showToast(`Exported '${filename}' successfully!`);
        } else {
          window.print();
        }
      } catch (err) {
        console.error('PDF Export Error:', err);
        showToast('Export notice: Generating via browser print fallback...');
        window.print();
      } finally {
        setExportingType(null);
        setPdfRenderData(null);
      }
    }, 400);
  };

  // 1. MONTHLY ATTENDANCE REPORT HANDLERS
  const exportAttendancePDF = async () => {
    try {
      setExportingType('attendance-pdf');
      const res = await axios.get('/api/attendance');
      const logs = Array.isArray(res.data) ? res.data : [];

      triggerPdfGeneration('Monthly_Attendance_Report_October_2026.pdf', {
        title: 'Monthly Attendance & Time Tracking Telemetry Report',
        subtitle: 'Official workforce biometric logs, shift durations, and punctuality audit',
        headers: ['Emp ID', 'Employee Name', 'Department', 'Date', 'Check-In', 'Check-Out', 'Shift Duration', 'Status'],
        rows: logs.map((l) => [
          l.employeeId || 'TF-EMP',
          l.employeeName || 'Staff',
          l.department || 'Engineering',
          l.date || '2026-10-24',
          l.checkIn || '--:--',
          l.checkOut || '--:--',
          `${l.workingHours || 8.0} hrs`,
          l.status || 'Present',
        ]),
      });
    } catch (err) {
      showToast('Error: ' + err.message);
      setExportingType(null);
    }
  };

  const exportAttendanceExcel = async () => {
    try {
      setExportingType('attendance-excel');
      const res = await axios.get('/api/attendance');
      const logs = Array.isArray(res.data) ? res.data : [];

      let csv = 'Employee ID,Employee Name,Department,Date,Check-In,Check-Out,Working Hours,Status\n';
      logs.forEach((l) => {
        csv += `"${l.employeeId || 'TF-EMP'}","${l.employeeName || 'Staff'}","${l.department || 'Engineering'}","${l.date || '2026-10-24'}","${l.checkIn || '--:--'}","${l.checkOut || '--:--'}","${l.workingHours || 8.0} hrs","${l.status || 'Present'}"\n`;
      });

      downloadCSV('Monthly_Attendance_Report_October_2026.csv', csv);
    } catch (err) {
      showToast('Error: ' + err.message);
    } finally {
      setExportingType(null);
    }
  };

  // 2. EMPLOYEE PERFORMANCE REPORT HANDLERS
  const exportPerformancePDF = async () => {
    try {
      setExportingType('performance-pdf');
      const [empRes, tskRes] = await Promise.allSettled([
        axios.get('/api/employees'),
        axios.get('/api/tasks'),
      ]);

      const emps = empRes.status === 'fulfilled' && empRes.value.data?.data ? empRes.value.data.data : [];
      const tasks = tskRes.status === 'fulfilled' && tskRes.value.data?.data ? tskRes.value.data.data : [];

      triggerPdfGeneration('Employee_Performance_Report_2026.pdf', {
        title: 'Workforce Performance, KPI & Efficiency Analytics Report',
        subtitle: 'Sprint velocity, deliverables contribution, and corporate performance rating',
        headers: ['Emp ID', 'Employee Name', 'Role & Designation', 'Department', 'Annual CTC', 'Rating (Out of 5)', 'Completed Tasks', 'Status'],
        rows: emps.map((e) => {
          const compTasks = tasks.filter((t) => (t.assignedTo || '').toLowerCase() === (e.name || '').toLowerCase() && (t.status === 'Done' || t.status === 'COMPLETED')).length;
          return [
            e.employeeId || 'TF-IND',
            e.name || 'Staff',
            e.role || 'Software Engineer',
            e.department || 'Engineering',
            `₹${(e.salary || 0).toLocaleString('en-IN')}`,
            `${e.performanceScore || 4.2} / 5.0 ⭐`,
            `${compTasks} Delivered`,
            e.status || 'Active',
          ];
        }),
      });
    } catch (err) {
      showToast('Error: ' + err.message);
      setExportingType(null);
    }
  };

  const exportPerformanceCSV = async () => {
    try {
      setExportingType('performance-csv');
      const [empRes, tskRes] = await Promise.allSettled([
        axios.get('/api/employees'),
        axios.get('/api/tasks'),
      ]);

      const emps = empRes.status === 'fulfilled' && empRes.value.data?.data ? empRes.value.data.data : [];
      const tasks = tskRes.status === 'fulfilled' && tskRes.value.data?.data ? tskRes.value.data.data : [];

      let csv = 'Employee ID,Employee Name,Role,Department,Annual Salary (INR),Performance Rating,Completed Tasks,Status\n';
      emps.forEach((e) => {
        const compTasks = tasks.filter((t) => (t.assignedTo || '').toLowerCase() === (e.name || '').toLowerCase() && (t.status === 'Done' || t.status === 'COMPLETED')).length;
        csv += `"${e.employeeId || 'TF-IND'}","${e.name || 'Staff'}","${e.role || 'Software Engineer'}","${e.department || 'Engineering'}","${e.salary || 0}","${e.performanceScore || 4.2}","${compTasks}","${e.status || 'Active'}"\n`;
      });

      downloadCSV('Employee_Performance_Report_2026.csv', csv);
    } catch (err) {
      showToast('Error: ' + err.message);
    } finally {
      setExportingType(null);
    }
  };

  // 3. LEAVES & PAYROLL SUMMARY HANDLERS
  const exportLeavesPayrollPDF = async () => {
    try {
      setExportingType('leaves-pdf');
      const [lvRes, empRes] = await Promise.allSettled([
        axios.get('/api/leaves'),
        axios.get('/api/employees'),
      ]);

      const leaves = lvRes.status === 'fulfilled' && Array.isArray(lvRes.value.data) ? lvRes.value.data : [];

      triggerPdfGeneration('Leaves_and_Payroll_Summary_2026.pdf', {
        title: 'Statutory Leaves & Corporate Payroll Reconciliation Summary',
        subtitle: 'Comprehensive audit of employee paid time-offs, sick leaves, and HR approval telemetry',
        headers: ['Leave ID', 'Employee Name', 'Department', 'Leave Type', 'Period From - To', 'Days', 'Reason', 'Approval Status'],
        rows: leaves.map((lv) => [
          lv._id || 'LV',
          lv.employeeName || 'Staff',
          lv.department || 'Engineering',
          lv.leaveType || 'Casual Leave',
          `${lv.startDate} to ${lv.endDate}`,
          `${lv.days || 1} Day(s)`,
          lv.reason || 'Personal Work',
          lv.status || 'PENDING',
        ]),
      });
    } catch (err) {
      showToast('Error: ' + err.message);
      setExportingType(null);
    }
  };

  const exportLeavesPayrollExcel = async () => {
    try {
      setExportingType('leaves-excel');
      const res = await axios.get('/api/leaves');
      const leaves = Array.isArray(res.data) ? res.data : [];

      let csv = 'Leave ID,Employee ID,Employee Name,Department,Leave Type,Start Date,End Date,Days,Reason,Approval Status\n';
      leaves.forEach((lv) => {
        csv += `"${lv._id || 'LV'}","${lv.employeeId || 'TF-EMP'}","${lv.employeeName || 'Staff'}","${lv.department || 'Engineering'}","${lv.leaveType || 'Casual Leave'}","${lv.startDate || ''}","${lv.endDate || ''}","${lv.days || 1}","${(lv.reason || '').replace(/"/g, '""')}","${lv.status || 'PENDING'}"\n`;
      });

      downloadCSV('Leaves_and_Payroll_Summary_2026.csv', csv);
    } catch (err) {
      showToast('Error: ' + err.message);
    } finally {
      setExportingType(null);
    }
  };

  // Node fs Audit Generator (Unit 4 compatibility)
  const generateReport = async () => {
    try {
      setLoading(true);
      const filename = `enterprise_audit_${new Date().toISOString().slice(0, 10)}.txt`;
      const content = `==========================================================\nTEAMFLOW ERP - CORPORATE AUDIT & STATUTORY ROSTER\nGenerated On: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST\nOrganization: TeamFlow Technologies India Pvt. Ltd.\nCIN: U72200HR2024PTC098765 | GSTIN: 06AAACT9876Q1Z2\n==========================================================\n\n1. INDIAN WORKFORCE & PAYROLL TELEMETRY:\n- Total On-Roll Engineers: 5\n- Annual Payroll Outlay (CTC): ₹62,70,000 (₹62.70 Lakhs)\n- Statutory Deductions: Employee PF (12%), Professional Tax (₹200), TDS\n\n2. ACTIVE CLIENT INITIATIVES:\n- PRJ-TATA: Cloud ERP Enterprise Migration (Tata Digital Ltd.) - ₹45,00,000\n- PRJ-RELIANCE: NextGen Retail Design System (Reliance Retail) - ₹28,00,000\n- PRJ-HDFC: Digital Banking KYC Onboarding Portal (HDFC Bank) - ₹35,00,000\n\n3. TECH HUB OFFICES:\n- Headquarters: Tower B, Cyber City, Gurugram, Haryana\n- Branches: Bengaluru, Hyderabad, Noida, Mumbai\n\nVerified By: Arjun Singhania, Lead Architect & System Admin\n==========================================================\n`;

      await axios.post('/api/node-fs/write', { filename, content });
      showToast(`Export '${filename}' generated successfully!`);
      fetchFiles();
      loadFile(filename);
    } catch (err) {
      showToast('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadFile = async (filename) => {
    try {
      setActiveFileName(filename);
      const res = await axios.get(`/api/node-fs/read?filename=${filename}`);
      setSelectedFileContent(res.data.content);
    } catch (err) {
      setSelectedFileContent('Failed to load file: ' + err.message);
    }
  };

  const deleteFile = async (filename) => {
    if (!window.confirm(`Delete ${filename}?`)) return;
    try {
      await axios.delete(`/api/node-fs/delete?filename=${filename}`);
      showToast(`File deleted`);
      if (activeFileName === filename) {
        setActiveFileName('');
        setSelectedFileContent('');
      }
      fetchFiles();
    } catch (err) {
      showToast('Error: ' + err.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#1e293b' }}>
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
            backgroundColor: '#10b981',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.875rem',
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <CheckCircle2 size={16} /> {toast}
          </div>
        )}

        {/* Header matching AI Tech ERP */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            Reports & Analytics Center
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
            Generate and export corporate timesheet telemetry, workforce performance, and statutory payroll analytics
          </p>
        </div>

        {/* 3 TOP ANALYTICS & EXPORT CARDS (Exact match to AI Tech ERP) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem',
        }}>
          {/* Card 1: Monthly Attendance Report (Green Top Border) */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            borderTop: '4px solid #16a34a',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                Monthly Attendance Report
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
                Complete logs of check-in/out times, working hours, and present/absent counts.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={exportAttendancePDF}
                disabled={exportingType === 'attendance-pdf'}
                style={{
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 16px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.825rem',
                  cursor: exportingType === 'attendance-pdf' ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 4px rgba(220, 38, 38, 0.25)',
                }}
              >
                <FileText size={15} /> {exportingType === 'attendance-pdf' ? 'Generating...' : 'Export PDF'}
              </button>
              <button
                onClick={exportAttendanceExcel}
                disabled={exportingType === 'attendance-excel'}
                style={{
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 16px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.825rem',
                  cursor: exportingType === 'attendance-excel' ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 4px rgba(22, 163, 74, 0.25)',
                }}
              >
                <FileSpreadsheet size={15} /> {exportingType === 'attendance-excel' ? 'Exporting...' : 'Export Excel'}
              </button>
            </div>
          </div>

          {/* Card 2: Employee Performance Report (Blue Top Border) */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            borderTop: '4px solid #2563eb',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                Employee Performance Report
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
                Task completion rates, active projects contribution, and efficiency metrics.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={exportPerformancePDF}
                disabled={exportingType === 'performance-pdf'}
                style={{
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 16px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.825rem',
                  cursor: exportingType === 'performance-pdf' ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 4px rgba(220, 38, 38, 0.25)',
                }}
              >
                <FileText size={15} /> {exportingType === 'performance-pdf' ? 'Generating...' : 'Export PDF'}
              </button>
              <button
                onClick={exportPerformanceCSV}
                disabled={exportingType === 'performance-csv'}
                style={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 16px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.825rem',
                  cursor: exportingType === 'performance-csv' ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)',
                }}
              >
                <FileSpreadsheet size={15} /> {exportingType === 'performance-csv' ? 'Exporting...' : 'Export CSV'}
              </button>
            </div>
          </div>

          {/* Card 3: Leaves & Payroll Summary (Orange/Yellow Top Border) */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            borderTop: '4px solid #f59e0b',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                Leaves & Payroll Summary
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
                Approved/pending leaves summary, casual and sick leave allocations per employee.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={exportLeavesPayrollPDF}
                disabled={exportingType === 'leaves-pdf'}
                style={{
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 16px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.825rem',
                  cursor: exportingType === 'leaves-pdf' ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 4px rgba(220, 38, 38, 0.25)',
                }}
              >
                <FileText size={15} /> {exportingType === 'leaves-pdf' ? 'Generating...' : 'Export PDF'}
              </button>
              <button
                onClick={exportLeavesPayrollExcel}
                disabled={exportingType === 'leaves-excel'}
                style={{
                  backgroundColor: '#f59e0b',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 16px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.825rem',
                  cursor: exportingType === 'leaves-excel' ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 4px rgba(245, 158, 11, 0.25)',
                }}
              >
                <FileSpreadsheet size={15} /> {exportingType === 'leaves-excel' ? 'Exporting...' : 'Export Excel'}
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 2: SYSTEM AUDIT ARCHIVES (Unit 4 Node FS File Storage) */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                System Audit Logs & Statutory File Archives
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                Filesystem exports stored on server storage via Node.js FS backend module
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={fetchFiles}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  padding: '7px 14px',
                  borderRadius: '6px',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <RefreshCw size={13} /> Refresh
              </button>
              <button
                onClick={generateReport}
                disabled={loading}
                style={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  padding: '7px 16px',
                  borderRadius: '6px',
                  fontSize: '0.825rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 4px rgba(37,99,235,0.2)',
                }}
              >
                <Download size={14} /> Generate Statutory Audit Log
              </button>
            </div>
          </div>

          {/* 2 Column View: File List + Text Viewer */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {/* File List */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', backgroundColor: '#f8fafc' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px', color: '#475569' }}>
                Server Stored Files ({files.length})
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '320px', overflowY: 'auto' }}>
                {files.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                    No exported audit files found. Click "Generate Statutory Audit Log" to create one.
                  </div>
                ) : (
                  files.map((f) => (
                    <div
                      key={f.filename}
                      onClick={() => loadFile(f.filename)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        backgroundColor: activeFileName === f.filename ? '#eff6ff' : '#ffffff',
                        border: `1px solid ${activeFileName === f.filename ? '#93c5fd' : '#e2e8f0'}`,
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={16} color="#2563eb" />
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>{f.filename}</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{f.size} bytes</div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); deleteFile(f.filename); }}
                        style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '4px' }}
                        title="Delete file"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Viewer */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', backgroundColor: '#ffffff' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px', color: '#475569' }}>
                Inspection Console: <span style={{ color: '#2563eb' }}>{activeFileName || 'None selected'}</span>
              </div>

              <div style={{
                backgroundColor: '#0b0f19',
                borderRadius: '6px',
                padding: '1rem',
                color: '#38bdf8',
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                height: '300px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.5,
              }}>
                {selectedFileContent || '// Select any audit log on the left to inspect its raw server payload...'}
              </div>
            </div>
          </div>
        </div>

        {/* OFFSCREEN CONTAINER USED FOR HIGH-RES PDF RENDERING */}
        {pdfRenderData && (
          <div
            id="report-pdf-render-area"
            style={{
              position: 'fixed',
              left: '-9999px',
              top: '0',
              width: '1100px',
              backgroundColor: '#ffffff',
              padding: '2.5rem',
              color: '#0f172a',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            {/* PDF Header Letterhead */}
            <div style={{ borderBottom: '2px solid #2563eb', paddingBottom: '1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>TeamFlow Technologies India Pvt. Ltd.</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                  Tower B, 6th Floor, DLF Cyber City, Gurugram, Haryana - 122002 | CIN: U72200HR2024PTC098765
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#eff6ff', color: '#1e40af', padding: '4px 10px', borderRadius: '4px', border: '1px solid #bfdbfe', display: 'inline-block' }}>
                  OFFICIAL AUDIT REPORT
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
                  Generated on: {new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
                </div>
              </div>
            </div>

            {/* Document Title */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 4px 0', color: '#1e293b' }}>
                {pdfRenderData.title}
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                {pdfRenderData.subtitle}
              </p>
            </div>

            {/* Document Data Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1', color: '#334155' }}>
                  {pdfRenderData.headers.map((h, i) => (
                    <th key={i} style={{ padding: '8px 10px', fontWeight: 700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pdfRenderData.rows.map((row, rIdx) => (
                  <tr key={rIdx} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: rIdx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} style={{ padding: '8px 10px', fontWeight: cIdx === 1 ? 600 : 400 }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer Sign-off */}
            <div style={{ marginTop: '2.5rem', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
              <div>System Certified by: <strong>TeamFlow ERP Engine v2.0</strong></div>
              <div>Confidential Corporate Records • Internal Statutory Use Only</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
