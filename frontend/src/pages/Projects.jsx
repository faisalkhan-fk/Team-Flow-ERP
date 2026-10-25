import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Briefcase, Plus, Calendar, DollarSign, User, X } from 'lucide-react';

export default function Projects() {
  const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const isAdmin = currentUser?.role === 'ROLE_ADMIN' || currentUser?.roles?.[0] === 'ROLE_ADMIN';
  const isManager = currentUser?.role === 'ROLE_MANAGER' || currentUser?.roles?.[0] === 'ROLE_MANAGER';

  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    projectCode: '',
    title: '',
    client: '',
    department: 'Engineering',
    budget: '',
    priority: 'Medium',
    leadEmployee: '',
    deadline: '',
  });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const [projRes, empRes] = await Promise.allSettled([
        axios.get('/api/projects'),
        axios.get('/api/employees'),
      ]);
      if (projRes.status === 'fulfilled' && projRes.value?.data?.data) {
        setProjects(projRes.value.data.data);
      }
      if (empRes.status === 'fulfilled' && empRes.value?.data?.data) {
        setEmployees(empRes.value.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/projects', formData);
      setShowModal(false);
      setFormData({
        projectCode: '',
        title: '',
        client: '',
        department: 'Engineering',
        budget: '',
        priority: 'Medium',
        leadEmployee: '',
        deadline: '',
      });
      fetchProjects();
    } catch (err) {
      alert('Error creating project: ' + err.message);
    }
  };

  const handleProgressChange = async (id, newPercentage) => {
    try {
      let newStatus = 'In Progress';
      if (newPercentage === 100) newStatus = 'Completed';
      else if (newPercentage === 0) newStatus = 'Planning';

      await axios.patch(`/api/projects/${id}/progress`, {
        completionPercentage: newPercentage,
        status: newStatus,
      });

      setProjects((prev) =>
        prev.map((p) =>
          p._id === id || p.projectCode === id
            ? { ...p, completionPercentage: newPercentage, status: newStatus }
            : p
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#1e293b' }}>
      <Sidebar />
      <Navbar />

      <div style={{ marginLeft: '260px', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Enterprise Projects
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
              Client deliverables, milestones, budgets, and engineering roadmaps
            </p>
          </div>

          {(isAdmin || isManager) && (
            <button
              onClick={() => setShowModal(true)}
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
              <Plus size={16} /> New Project
            </button>
          )}
        </div>

        {/* Project Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1.5rem',
        }}>
          {loading ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              Loading project portfolio...
            </div>
          ) : (
            projects.map((prj) => (
              <div
                key={prj.projectCode}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb' }}>
                      {prj.projectCode}
                    </span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: '2px 0 0 0' }}>
                      {prj.title}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                      Client: <strong>{prj.client}</strong>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    backgroundColor: prj.priority === 'Critical' ? '#fee2e2' : prj.priority === 'High' ? '#fef3c7' : '#eff6ff',
                    color: prj.priority === 'Critical' ? '#dc2626' : prj.priority === 'High' ? '#b45309' : '#1d4ed8',
                  }}>
                    {prj.priority}
                  </span>
                </div>

                {/* Progress Control */}
                <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Completion Status</span>
                    <span style={{ fontWeight: 700, color: '#2563eb' }}>
                      {prj.completionPercentage}% ({prj.status})
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={prj.completionPercentage || 0}
                    onChange={(e) => handleProgressChange(prj._id || prj.projectCode, Number(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer', accentColor: '#2563eb' }}
                  />
                </div>

                {/* Details Footer */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  fontSize: '0.8rem',
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '10px',
                  color: '#475569',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 800, color: '#16a34a', fontSize: '0.9rem' }}>₹</span>
                    <span>Budget: <strong>₹{(prj.budget || 0).toLocaleString('en-IN')}</strong> <span style={{ color: '#2563eb', fontWeight: 600 }}>({((prj.budget || 0) / 100000).toFixed(1)}L)</span></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={14} color="#2563eb" />
                    <span>Lead: <strong>{prj.leadEmployee}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', gridColumn: 'span 2' }}>
                    <Calendar size={14} color="#9333ea" />
                    <span>Deadline: <strong>{new Date(prj.deadline).toLocaleDateString()}</strong></span>
                  </div>
                </div>
              </div>
            ))
          )}
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
            <div style={{ width: '100%', maxWidth: '500px', backgroundColor: '#ffffff', borderRadius: '8px', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Create Enterprise Project</h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Project Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="PRJ-DELTA"
                    value={formData.projectCode}
                    onChange={(e) => setFormData({ ...formData, projectCode: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Project Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI Workflow Engine"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Client Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tata Digital / Reliance Retail"
                      value={formData.client}
                      onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Department</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Product">Product</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Budget (₹ in INR) *</label>
                    <input
                      type="number"
                      required
                      min="100000"
                      placeholder="e.g. 3500000 (35 Lakhs)"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Project Lead</label>
                    <select
                      value={formData.leadEmployee}
                      onChange={(e) => setFormData({ ...formData, leadEmployee: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    >
                      <option value="">Select Project Lead...</option>
                      {employees.map((emp) => (
                        <option key={emp._id || emp.employeeId} value={emp.name}>
                          {emp.name} ({emp.role || emp.department})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Deadline *</label>
                    <input
                      type="date"
                      required
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                    Cancel
                  </button>
                  <button type="submit" style={{ padding: '8px 16px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 700, borderRadius: '6px' }}>
                    Create Project
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
