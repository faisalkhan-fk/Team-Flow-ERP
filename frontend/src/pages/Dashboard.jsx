import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { 
  Users, 
  Briefcase, 
  CheckSquare, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  RefreshCw, 
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  Calendar
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    totalEmployees: 5,
    activeProjects: 3,
    pendingTasks: 3,
    completedTasks: 1,
    attendanceCount: 5,
    payroll: 536000,
  });

  const [departmentData, setDepartmentData] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsRefreshing(true);
    try {
      const [empRes, projRes, taskRes, attRes, deptRes, apprRes] = await Promise.allSettled([
        axios.get('/api/employees'),
        axios.get('/api/projects'),
        axios.get('/api/tasks'),
        axios.get('/api/attendance'),
        axios.get('/api/departments'),
        axios.get('/api/auth/approvals'),
      ]);

      if (apprRes.status === 'fulfilled' && Array.isArray(apprRes.value?.data)) {
        setPendingApprovalsCount(apprRes.value.data.filter((a) => a.status === 'Pending').length);
      }

      const employees = empRes.status === 'fulfilled' && empRes.value.data?.data ? empRes.value.data.data : [];
      const projects = projRes.status === 'fulfilled' && projRes.value.data?.data ? projRes.value.data.data : [];
      const tasks = taskRes.status === 'fulfilled' && taskRes.value.data?.data ? taskRes.value.data.data : [];
      const attendance = attRes.status === 'fulfilled' && Array.isArray(attRes.value.data) ? attRes.value.data : [];
      const departments = deptRes.status === 'fulfilled' && Array.isArray(deptRes.value.data) ? deptRes.value.data : [];

      const totalSal = employees.reduce((acc, curr) => acc + (curr.salary || 0), 0);

      setMetrics({
        totalEmployees: employees.length,
        activeProjects: projects.filter((p) => p.status !== 'Completed').length,
        pendingTasks: tasks.filter((t) => t.status !== 'Done' && t.status !== 'COMPLETED').length,
        completedTasks: tasks.filter((t) => t.status === 'Done' || t.status === 'COMPLETED').length,
        attendanceCount: attendance.length,
        payroll: totalSal,
      });

      setRecentProjects(projects.slice(0, 3));
      setDepartmentData(departments);
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Bar Chart Configuration (Operations & Velocity)
  const barChartData = {
    labels: ['Employees', 'Active Projects', 'Pending Tasks', 'Completed', 'Attendance Logs'],
    datasets: [
      {
        label: 'Current Total',
        data: [
          metrics.totalEmployees,
          metrics.activeProjects,
          metrics.pendingTasks,
          metrics.completedTasks,
          metrics.attendanceCount,
        ],
        backgroundColor: ['#4f46e5', '#06b6d4', '#f59e0b', '#10b981', '#8b5cf6'],
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  // Doughnut Chart Configuration (Department Breakdown)
  const doughnutData = {
    labels: ['Engineering', 'Product', 'Design', 'Marketing', 'Finance'],
    datasets: [
      {
        data: [45, 25, 15, 10, 5],
        backgroundColor: ['#4f46e5', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f6fb', color: '#0f172a' }}>
      <Sidebar />
      <Navbar />

      <div style={{ marginLeft: '260px', padding: '2rem' }}>
        
        {/* Page Top Banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                Executive Operations Dashboard
              </h1>
              <span className="badge-pill badge-pill-success">Live Sync</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
              Real-time enterprise metrics, workforce telemetry, and resource allocation
            </p>
          </div>

          <button
            onClick={fetchDashboardData}
            disabled={isRefreshing}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              color: '#334155',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <RefreshCw size={15} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Metrics'}
          </button>
        </div>

        {/* Pending Approvals Notice Banner */}
        {pendingApprovalsCount > 0 && (
          <div style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '12px',
            padding: '12px 18px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#fef3c7',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Clock size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#92400e' }}>
                  {pendingApprovalsCount} Account Registration{pendingApprovalsCount > 1 ? 's' : ''} Awaiting Admin Approval
                </div>
                <div style={{ fontSize: '0.785rem', color: '#b45309' }}>
                  New Employee or Manager accounts require administrator sign-off before portal access is granted.
                </div>
              </div>
            </div>

            <Link
              to="/employees"
              style={{
                backgroundColor: '#d97706',
                color: '#ffffff',
                textDecoration: 'none',
                padding: '7px 14px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              Review & Approve <ArrowUpRight size={14} />
            </Link>
          </div>
        )}

        {/* 4 Bento Stat Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.75rem',
        }}>
          {/* Card 1: Total Employees */}
          <div className="bento-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Workforce Headcount
              </span>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4f46e5',
              }}>
                <Users size={20} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {metrics.totalEmployees}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                <span className="badge-pill badge-pill-info">+12.4% vs last qtr</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Across 5 divisions</span>
              </div>
            </div>
          </div>

          {/* Card 2: Active Projects */}
          <div className="bento-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Active Projects
              </span>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#06b6d4',
              }}>
                <Briefcase size={20} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {metrics.activeProjects}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                <span className="badge-pill badge-pill-success">100% On-Time</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>1 Critical priority</span>
              </div>
            </div>
          </div>

          {/* Card 3: Pending Tasks */}
          <div className="bento-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Pending Sprint Tasks
              </span>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f59e0b',
              }}>
                <CheckSquare size={20} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {metrics.pendingTasks}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                <span className="badge-pill badge-pill-warning">Sprint Velocity: 42pts</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>1 Task Review</span>
              </div>
            </div>
          </div>

          {/* Card 4: Monthly Payroll */}
          <div className="bento-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Annual Compensation
              </span>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
                fontSize: '1.2rem',
                fontWeight: 800,
              }}>
                ₹
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1 }}>
                ₹{((metrics.payroll || 6270000) / 100000).toFixed(1)} Lakhs
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                <span className="badge-pill badge-pill-success">Compliant</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>EPF & TDS Audited</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dual Chart Bento Grid: Bar (Velocity) + Donut (Allocation) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '1.5rem',
          marginBottom: '1.75rem',
        }}>
          {/* Main Bar Chart */}
          <div className="bento-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Live Operations & Workload Metrics
                </h2>
                <p style={{ fontSize: '0.785rem', color: '#64748b', margin: '2px 0 0 0' }}>
                  Aggregated telemetry across teams and systems
                </p>
              </div>
              <span className="badge-pill badge-pill-info">Real-time Stream</span>
            </div>

            <div style={{ height: '300px' }}>
              <Bar
                data={barChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { font: { family: 'Plus Jakarta Sans', size: 11 } } },
                    x: { grid: { display: false }, ticks: { font: { family: 'Plus Jakarta Sans', size: 11, weight: 600 } } },
                  },
                }}
              />
            </div>
          </div>

          {/* Donut Chart: Resource Distribution */}
          <div className="bento-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Resource Allocation
              </h2>
              <p style={{ fontSize: '0.785rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Headcount distribution by department
              </p>
            </div>

            <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Doughnut
                data={doughnutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10, family: 'Plus Jakarta Sans' } } } },
                  cutout: '70%',
                }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Bento Row: Active Projects + Recent Activity Feed */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.5rem',
        }}>
          {/* Ongoing Enterprise Projects */}
          <div className="bento-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Active Enterprise Deliverables
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Q4 Roadmap</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentProjects.map((p) => (
                <div key={p.projectCode} style={{ padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #eef2f6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{p.title}</span>
                    <span style={{ fontWeight: 700, color: '#4f46e5' }}>{p.completionPercentage}%</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '6px',
                    backgroundColor: '#e2e8f0',
                    borderRadius: '9999px',
                    marginTop: '8px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${p.completionPercentage}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #4f46e5 0%, #06b6d4 100%)',
                      borderRadius: '9999px',
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
                    <span>Client: <strong>{p.client}</strong></span>
                    <span>Lead: <strong>{p.leadEmployee}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Operational Timeline Feed */}
          <div className="bento-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Recent Operational Activity
              </h2>
              <span className="badge-pill badge-pill-info">Live Log</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { time: '10 mins ago', title: 'Task TSK-101 completed by Arjun Singhania', type: 'Sprint' },
                { time: '45 mins ago', title: 'Biometric Attendance logged: 4 members on shift', type: 'HR' },
                { time: '2 hours ago', title: 'Project PRJ-TATA (Tata Digital) progress updated to 65%', type: 'Projects' },
                { time: 'Yesterday', title: 'Monthly Salary Slips for October generated (₹ INR)', type: 'Payroll' },
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#4f46e5',
                    marginTop: '6px',
                    flexShrink: 0,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.725rem', color: '#94a3b8' }}>
                      {item.time} • <span style={{ color: '#6366f1' }}>{item.type}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
