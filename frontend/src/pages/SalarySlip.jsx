import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Printer, ArrowLeft, Building2, CheckCircle2, ShieldCheck, Lock, FileText, AlertTriangle, Calendar, Download } from 'lucide-react';

export default function SalarySlip() {
  const { id } = useParams();
  const navigate = useNavigate();

  const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const isAdmin = currentUser?.role === 'ROLE_ADMIN' || currentUser?.roles?.[0] === 'ROLE_ADMIN';
  const isManager = currentUser?.role === 'ROLE_MANAGER' || currentUser?.roles?.[0] === 'ROLE_MANAGER';
  const isEmployee = !isAdmin && !isManager;

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [payPeriod, setPayPeriod] = useState('sep-2026'); // Defaults to last completed payroll cycle

  // Supported Corporate Payroll Cycles
  const PERIODS = {
    'sep-2026': {
      label: 'September 2026 (Last Closed & Paid Cycle)',
      badge: 'OFFICIAL SALARY SLIP - SEPTEMBER 2026',
      periodText: 'Pay Period: 01-Sep-2026 to 30-Sep-2026',
      workingDays: '30 Days | Payable: 30 Days (Completed Cycle)',
      statusText: 'Disbursed & Closed',
      statusColor: '#059669',
      statusBg: '#ecfdf5',
      factor: 1,
      isProvisional: false,
    },
    'oct-till-date': {
      label: 'October 2026 (Running Till Date: 24-Oct)',
      badge: 'PROVISIONAL INTERIM SLIP - OCTOBER 2026',
      periodText: 'Pay Period: 01-Oct-2026 to 24-Oct-2026 (Till Date)',
      workingDays: '31 Days | Payable: 24 Days (Active Month Pro-rata)',
      statusText: 'Provisional (Month In-Progress: Day 24 of 31)',
      statusColor: '#d97706',
      statusBg: '#fef3c7',
      factor: 24 / 31,
      isProvisional: true,
    },
    'oct-projected': {
      label: 'October 2026 (Month-End Full Projection)',
      badge: 'PROJECTED SALARY SLIP - OCTOBER 2026',
      periodText: 'Pay Period: 01-Oct-2026 to 31-Oct-2026 (Projected)',
      workingDays: '31 Days | Payable: 31 Days (Full Month Projection)',
      statusText: 'Month-End Processing Pending',
      statusColor: '#2563eb',
      statusBg: '#eff6ff',
      factor: 1,
      isProvisional: true,
    },
  };

  const currentPeriodConfig = PERIODS[payPeriod] || PERIODS['sep-2026'];

  // Check if an employee record matches current logged-in user
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

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      setAccessDenied(false);

      // If id is 'me', 'my-slip', or omitted, fetch logged-in user's own profile
      const targetId = (!id || id === 'me' || id === 'my-slip') ? 'me' : id;

      const params = new URLSearchParams();
      if (currentUser?.email) params.append('email', currentUser.email);
      if (currentUser?.username) params.append('username', currentUser.username);
      if (currentUser?.name) params.append('name', currentUser.name);

      const res = await axios.get(`/api/employees/${targetId}?${params.toString()}`);
      if (res.data?.data) {
        const emp = res.data.data;
        // Strict Privacy Guard: Employee can ONLY view their own payslip!
        if (isEmployee && !isOwnProfile(emp)) {
          setAccessDenied(true);
          setEmployee(null);
        } else {
          setEmployee(emp);
          setAccessDenied(false);
        }
      }
    } catch (err) {
      console.error(err);
      if (isEmployee && id && id !== 'me') {
        setAccessDenied(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Indian Payroll Calculation (Supports full month or pro-rata interim cycle)
  const calculateIndianPayroll = (annualSalary = 1200000, factor = 1) => {
    const monthlyGross = Math.round((annualSalary / 12) * factor);
    const basicPay = Math.round(monthlyGross * 0.50); // 50% Basic Pay
    const hra = Math.round(monthlyGross * 0.20);      // 20% HRA
    const conveyance = Math.round(1600 * factor);     // Standard Conveyance
    const medical = Math.round(1250 * factor);        // Standard Medical allowance
    const specialAllowance = monthlyGross - basicPay - hra - conveyance - medical;

    // Standard Indian Deductions
    const epf = Math.round(basicPay * 0.12);           // Employee PF (12% of Basic)
    const profTax = factor < 1 ? Math.round(200 * factor) : 200; // Standard Indian Professional Tax
    const tds = Math.round(monthlyGross * 0.08);       // Standard estimated TDS / Income Tax
    const totalDeductions = epf + profTax + tds;
    const netSalary = monthlyGross - totalDeductions;

    return { monthlyGross, basicPay, hra, conveyance, medical, specialAllowance, epf, profTax, tds, totalDeductions, netSalary };
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('salary-slip-paper');
    if (!element) return;

    try {
      setDownloading(true);
      const cleanEmpId = employee?.employeeId || 'EMP';
      const cleanName = (employee?.name || 'Staff').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `SalarySlip_${cleanEmpId}_${cleanName}_${payPeriod}.pdf`;

      const opt = {
        margin: [8, 8, 8, 8],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };

      // Direct file download using html2pdf
      const pdfEngine = window.html2pdf || (await import('html2pdf.js')).default;
      if (pdfEngine) {
        await pdfEngine().set(opt).from(element).save();
      } else {
        window.print();
      }
    } catch (err) {
      console.error('Direct PDF export error:', err);
      window.print();
    } finally {
      setTimeout(() => setDownloading(false), 1200);
    }
  };

  const payroll = calculateIndianPayroll(employee?.salary || 1200000, currentPeriodConfig.factor);

  // Helper for Indian Currency formatting
  const formatINR = (val) => Number(val || 0).toLocaleString('en-IN');

  return (
    <div className="salary-slip-wrapper" style={{ minHeight: '100vh', backgroundColor: '#f4f6fb', color: '#0f172a' }}>
      {/* Inline Print Stylesheet ensuring ONLY the Slip Prints */}
      <style>{`
        @media print {
          .no-print,
          .no-print *,
          nav,
          aside,
          header {
            display: none !important;
          }
          body, html {
            background-color: #ffffff !important;
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            color: #0f172a !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .salary-slip-wrapper {
            background: #ffffff !important;
            min-height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .salary-slip-main-content {
            margin: 0 !important;
            margin-left: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .salary-slip-paper {
            box-shadow: none !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 8px !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            padding: 24px 30px !important;
            background: #ffffff !important;
            page-break-inside: avoid !important;
          }
          @page {
            size: A4 portrait;
            margin: 10mm 15mm;
          }
        }
      `}</style>

      {/* Sidebar & Navbar hidden during print */}
      <div className="no-print">
        <Sidebar />
        <Navbar />
      </div>

      <div className="salary-slip-main-content" style={{ marginLeft: '260px', padding: '2rem' }}>
        {/* Top Actions - hidden during print */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link
              to="/employees"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                textDecoration: 'none',
                color: '#475569',
                fontWeight: 600,
                fontSize: '0.875rem',
                backgroundColor: '#ffffff',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
              }}
            >
              <ArrowLeft size={16} /> Back to Employee Roster
            </Link>

            {employee && isOwnProfile(employee) && (
              <span style={{
                backgroundColor: '#ecfdf5',
                color: '#065f46',
                border: '1px solid #a7f3d0',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <CheckCircle2 size={15} color="#059669" /> Your Official Personal Pay Slip
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#ffffff',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
            }}>
              <Calendar size={15} color="#4f46e5" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                Payroll Cycle:
              </span>
              <select
                value={payPeriod}
                onChange={(e) => setPayPeriod(e.target.value)}
                style={{
                  border: 'none',
                  fontSize: '0.825rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  backgroundColor: 'transparent',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="sep-2026">September 2026 (Closed & Disbursed Cycle)</option>
                <option value="oct-till-date">October 2026 (Till Date: 24-Oct - Interim)</option>
                <option value="oct-projected">October 2026 (Month-End Projected)</option>
              </select>
            </div>

            {!accessDenied && employee && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleDownloadPDF}
                  disabled={downloading}
                  style={{
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    padding: '9px 16px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: downloading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)',
                    opacity: downloading ? 0.8 : 1,
                  }}
                >
                  <Download size={15} /> {downloading ? 'Downloading...' : 'Download PDF'}
                </button>
                <button
                  onClick={() => window.print()}
                  style={{
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    border: 'none',
                    padding: '9px 16px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
                  }}
                >
                  <Printer size={15} /> Print
                </button>
              </div>
            )}
          </div>
        </div>

        {accessDenied ? (
          <div className="bento-card" style={{
            maxWidth: '620px',
            margin: '3rem auto',
            padding: '2.5rem',
            textAlign: 'center',
            border: '1px solid #fecaca',
            backgroundColor: '#ffffff',
            boxShadow: '0 10px 25px -5px rgba(220, 38, 38, 0.1)',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto',
            }}>
              <Lock size={32} />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#991b1b', margin: '0 0 0.5rem 0' }}>
              Confidential Payroll Record
            </h2>

            <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 1.5rem 0' }}>
              Under TeamFlow ERP Privacy Rules, employees are strictly authorized to view only their <strong>own</strong> personal salary slip.
              You are logged in as <strong style={{ color: '#0f172a' }}>{currentUser?.name || currentUser?.username}</strong> ({currentUser?.role === 'ROLE_EMPLOYEE' ? 'Employee' : 'User'}).
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  navigate('/salary-slip/me');
                  fetchEmployee();
                }}
                style={{
                  backgroundColor: '#4f46e5',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)',
                }}
              >
                <FileText size={16} /> View My Own Pay Slip
              </button>

              <Link
                to="/employees"
                style={{
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                }}
              >
                Return to Directory
              </Link>
            </div>
          </div>
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b', fontSize: '0.95rem' }}>
            <div style={{
              display: 'inline-block',
              width: '36px',
              height: '36px',
              border: '3px solid #e2e8f0',
              borderTopColor: '#4f46e5',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '1rem',
            }} />
            <div>Loading Official Pay Slip...</div>
          </div>
        ) : !employee ? (
          <div className="bento-card" style={{ maxWidth: '520px', margin: '3rem auto', padding: '2rem', textAlign: 'center' }}>
            <AlertTriangle size={36} color="#f59e0b" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: 800 }}>Employee Profile Not Found</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1.25rem 0' }}>
              No active employee payroll record was found matching your account. Please ensure your account has been approved by the Admin.
            </p>
            <Link
              to="/employees"
              style={{
                display: 'inline-block',
                backgroundColor: '#4f46e5',
                color: '#ffffff',
                padding: '8px 16px',
                borderRadius: '6px',
                fontWeight: 600,
                textDecoration: 'none',
                fontSize: '0.85rem',
              }}
            >
              Go to Employee Directory
            </Link>
          </div>
        ) : (
        /* Indian Salary Slip Container - this is the ONLY component printed */
        <div id="salary-slip-paper" className="salary-slip-paper" style={{
          maxWidth: '880px',
          margin: '0 auto',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)',
          border: '1px solid #e2e8f0',
          padding: '2.5rem',
        }}>
          {/* Company Letterhead */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '2px solid #4f46e5',
            paddingBottom: '1.25rem',
          }}>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                TeamFlow Technologies India Pvt. Ltd.
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                Tower B, 6th Floor, DLF Cyber City, Gurugram, Haryana - 122002<br />
                CIN: U72200HR2024PTC098765 | GSTIN: 06AAACT9876Q1Z2
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                <span style={{
                  backgroundColor: currentPeriodConfig.statusBg,
                  color: currentPeriodConfig.statusColor,
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: `1px solid ${currentPeriodConfig.statusColor}33`,
                  letterSpacing: '0.04em',
                }}>
                  {currentPeriodConfig.badge}
                </span>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: currentPeriodConfig.statusColor,
                  backgroundColor: currentPeriodConfig.statusBg,
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}>
                  ● {currentPeriodConfig.statusText}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginTop: '6px', margin: '6px 0 0 0' }}>
                {currentPeriodConfig.periodText}
              </p>
            </div>
          </div>

          {/* Employee & Indian Banking / Statutory Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px 24px',
            padding: '1.25rem 0',
            borderBottom: '1px solid #e2e8f0',
            fontSize: '0.85rem',
          }}>
            <div>
              <span style={{ color: '#64748b' }}>Employee Name:</span>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{employee?.name || 'Arjun Singhania'}</div>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Employee ID:</span>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>{employee?.employeeId || id}</div>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Department / Division:</span>
              <div style={{ fontWeight: 600 }}>{employee?.department || 'Engineering'}</div>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Designation:</span>
              <div style={{ fontWeight: 600 }}>{employee?.role || 'Lead Architect'}</div>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>PAN Number:</span>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>{employee?.pan || 'ABCPS1234F'}</div>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>UAN / EPF Number:</span>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>{employee?.uan || '100987654321'}</div>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Bank Name & Account:</span>
              <div style={{ fontWeight: 600 }}>HDFC Bank - {employee?.bankAccount || '50100234567890'}</div>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Bank IFSC Code:</span>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>{employee?.ifsc || 'HDFC0001234'}</div>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Total Working Days:</span>
              <div style={{ fontWeight: 600 }}>{currentPeriodConfig.workingDays}</div>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Annual Package (CTC):</span>
              <div style={{ fontWeight: 800, color: '#4f46e5' }}>
                ₹{formatINR(employee?.salary || 1850000)} (₹{((employee?.salary || 1850000)/100000).toFixed(1)} LPA)
              </div>
            </div>
          </div>

          {/* Earnings & Deductions Tables (Indian Standard Breakdown) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            padding: '1.25rem 0',
            borderBottom: '2px solid #e2e8f0',
          }}>
            {/* Earnings Column */}
            <div>
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '6px 10px',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.85rem',
                color: '#0f172a',
                marginBottom: '8px',
                borderLeft: '3px solid #10b981',
              }}>
                Earnings (A)
              </div>
              <table style={{ width: '100%', fontSize: '0.825rem', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 0', color: '#475569' }}>Basic Salary (50%)</td>
                    <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 600 }}>₹{formatINR(payroll.basicPay)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 0', color: '#475569' }}>House Rent Allowance (HRA 20%)</td>
                    <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 600 }}>₹{formatINR(payroll.hra)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 0', color: '#475569' }}>Special Allowance</td>
                    <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 600 }}>₹{formatINR(payroll.specialAllowance)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 0', color: '#475569' }}>Conveyance Allowance</td>
                    <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 600 }}>₹{formatINR(payroll.conveyance)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 0', color: '#475569' }}>Medical Allowance</td>
                    <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 600 }}>₹{formatINR(payroll.medical)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 0', fontWeight: 700, color: '#0f172a' }}>Gross Earnings (Monthly)</td>
                    <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                      ₹{formatINR(payroll.monthlyGross)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Deductions Column (Indian EPF, Professional Tax, TDS) */}
            <div>
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '6px 10px',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.85rem',
                color: '#0f172a',
                marginBottom: '8px',
                borderLeft: '3px solid #ef4444',
              }}>
                Deductions (B)
              </div>
              <table style={{ width: '100%', fontSize: '0.825rem', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 0', color: '#475569' }}>Provident Fund (EPF 12% on Basic)</td>
                    <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 600 }}>₹{formatINR(payroll.epf)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 0', color: '#475569' }}>Professional Tax (PT - State Govt)</td>
                    <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 600 }}>₹{formatINR(payroll.profTax)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 0', color: '#475569' }}>TDS / Income Tax</td>
                    <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 600 }}>₹{formatINR(payroll.tds)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 0', fontWeight: 700, color: '#dc2626' }}>Total Statutory Deductions</td>
                    <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 800, color: '#dc2626' }}>
                      ₹{formatINR(payroll.totalDeductions)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Net Take-Home Pay Box (Indian Currency) */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#eef2ff',
            border: '1px solid #c7d2fe',
            borderRadius: '10px',
            padding: '1.25rem 1.75rem',
            marginTop: '1.5rem',
          }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#4338ca', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Net Monthly In-Hand Salary (A - B)
              </div>
              <div style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600, marginTop: '2px' }}>
                ✔ Direct NEFT/IMPS credit to HDFC Bank A/c
              </div>
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1e1b4b' }}>
              ₹{formatINR(payroll.netSalary)}
            </div>
          </div>

          {/* Statutory Sign-off */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px dashed #cbd5e1', fontSize: '0.75rem', color: '#64748b' }}>
            <div>
              * Note: This is an electronically generated salary slip authorized by TeamFlow ERP. No physical signature required.
            </div>
            <div style={{ textAlign: 'right', fontWeight: 600 }}>
              Authorized Signatory<br />
              <span style={{ color: '#0f172a' }}>Director of HR & Payroll</span>
            </div>
          </div>
        </div>
        )}

      </div>
    </div>
  );
}
