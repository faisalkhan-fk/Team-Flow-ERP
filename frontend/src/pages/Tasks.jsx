import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Plus, Trash2, Clock, User, X, CheckSquare } from 'lucide-react';

export default function Tasks() {
  const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const isAdmin = currentUser?.role === 'ROLE_ADMIN' || currentUser?.roles?.[0] === 'ROLE_ADMIN';
  const isManager = currentUser?.role === 'ROLE_MANAGER' || currentUser?.roles?.[0] === 'ROLE_MANAGER';
  const currentEmpName = currentUser?.name || currentUser?.username || 'Employee';

  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL' or 'MY'

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    projectCode: 'PRJ-TATA',
    assignedTo: currentEmpName,
    priority: 'Medium',
    estimatedHours: 4,
  });

  const columns = ['Todo', 'In Progress', 'Review', 'Done'];

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const [tskRes, empRes, prjRes] = await Promise.allSettled([
        axios.get('/api/tasks'),
        axios.get('/api/employees'),
        axios.get('/api/projects'),
      ]);

      if (tskRes.status === 'fulfilled' && tskRes.value?.data?.data) {
        setTasks(tskRes.value.data.data);
      }
      if (empRes.status === 'fulfilled' && empRes.value?.data?.data) {
        setEmployees(empRes.value.data.data);
      }
      if (prjRes.status === 'fulfilled' && prjRes.value?.data?.data) {
        setProjects(prjRes.value.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const openCreateModal = () => {
    setNewTask({
      title: '',
      description: '',
      projectCode: projects[0]?.projectCode || 'PRJ-TATA',
      assignedTo: currentEmpName,
      priority: 'Medium',
      estimatedHours: 4,
    });
    setShowModal(true);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/tasks', newTask);
      setShowModal(false);
      fetchTasks();
    } catch (err) {
      alert('Error creating task: ' + err.message);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axios.patch(`/api/tasks/${taskId}`, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId || t.taskId === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!isAdmin && !isManager) {
      alert('Permission Denied: Only Admins and Project Managers can permanently delete sprint tasks.');
      return;
    }
    if (!window.confirm('Delete this task?')) return;
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId && t.taskId !== taskId));
    } catch (err) {
      console.error(err);
    }
  };

  const displayedTasks = filterMode === 'MY'
    ? tasks.filter((t) => (t.assignedTo || '').toLowerCase() === currentEmpName.toLowerCase())
    : tasks;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#1e293b' }}>
      <Sidebar />
      <Navbar />

      <div style={{ marginLeft: '260px', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Task Kanban Board
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
              Agile sprint workflow, task ownership, and delivery stage transitions
            </p>
          </div>

          <button
            onClick={openCreateModal}
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
            <Plus size={16} /> Create Task
          </button>
        </div>

        {/* Filter Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
          <button
            onClick={() => setFilterMode('ALL')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.825rem',
              cursor: 'pointer',
              backgroundColor: filterMode === 'ALL' ? '#2563eb' : '#f1f5f9',
              color: filterMode === 'ALL' ? '#ffffff' : '#475569',
            }}
          >
            All Sprint Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setFilterMode('MY')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.825rem',
              cursor: 'pointer',
              backgroundColor: filterMode === 'MY' ? '#2563eb' : '#f1f5f9',
              color: filterMode === 'MY' ? '#ffffff' : '#475569',
            }}
          >
            My Assigned Tasks ({tasks.filter((t) => (t.assignedTo || '').toLowerCase() === currentEmpName.toLowerCase()).length})
          </button>
        </div>

        {/* 4 Kanban Columns */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
          alignItems: 'start',
        }}>
          {columns.map((col) => {
            const colTasks = displayedTasks.filter((t) => (t.status || 'Todo') === col);
            const colColors = {
              'Todo': '#64748b',
              'In Progress': '#2563eb',
              'Review': '#f59e0b',
              'Done': '#10b981',
            };

            return (
              <div
                key={col}
                style={{
                  backgroundColor: '#f1f5f9',
                  padding: '1.25rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  minHeight: '520px',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '2px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: colColors[col] }} />
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{col}</h3>
                  </div>
                  <span style={{ backgroundColor: '#ffffff', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, color: '#475569', border: '1px solid #cbd5e1' }}>
                    {colTasks.length}
                  </span>
                </div>

                {/* Cards */}
                {colTasks.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', border: '1px dashed #cbd5e1', borderRadius: '6px' }}>
                    No tasks in {col}
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task._id || task.taskId}
                      style={{
                        backgroundColor: '#ffffff',
                        padding: '1rem',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb' }}>
                          {task.taskId}
                        </span>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: task.priority === 'Urgent' ? '#fee2e2' : task.priority === 'High' ? '#fef3c7' : '#eff6ff',
                          color: task.priority === 'Urgent' ? '#dc2626' : task.priority === 'High' ? '#b45309' : '#1d4ed8',
                        }}>
                          {task.priority}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                        {task.title}
                      </h4>
                      {task.description && (
                        <p style={{ fontSize: '0.785rem', color: '#64748b', lineHeight: 1.4, margin: 0 }}>
                          {task.description}
                        </p>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <User size={12} />
                          <span>{task.assignedTo}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} />
                          <span>{task.estimatedHours || 4}h</span>
                        </div>
                      </div>

                      {/* Transition Buttons */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                        {(isAdmin || isManager) ? (
                          <button
                            onClick={() => handleDeleteTask(task._id || task.taskId)}
                            style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '2px' }}
                            title="Delete task"
                          >
                            <Trash2 size={14} />
                          </button>
                        ) : <div />}

                        <div style={{ display: 'flex', gap: '4px' }}>
                          {col !== 'Todo' && (
                            <button
                              onClick={() => handleStatusChange(task._id || task.taskId, columns[columns.indexOf(col) - 1])}
                              style={{ padding: '3px 8px', fontSize: '0.7rem', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              ← Prev
                            </button>
                          )}
                          {col !== 'Done' && (
                            <button
                              onClick={() => handleStatusChange(task._id || task.taskId, columns[columns.indexOf(col) + 1])}
                              style={{ padding: '3px 8px', fontSize: '0.7rem', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                            >
                              Next →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            );
          })}
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
            <div style={{ width: '100%', maxWidth: '460px', backgroundColor: '#ffffff', borderRadius: '8px', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Create Sprint Task</h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Task Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Database Index Optimization"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Description</label>
                  <textarea
                    rows="3"
                    placeholder="Technical task notes..."
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', resize: 'vertical' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Project</label>
                    <select
                      value={newTask.projectCode}
                      onChange={(e) => setNewTask({ ...newTask, projectCode: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    >
                      {projects.map((p) => (
                        <option key={p._id || p.projectCode} value={p.projectCode}>
                          {p.projectCode} ({p.title})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Assignee</label>
                    <select
                      value={newTask.assignedTo}
                      onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    >
                      <option value="">Select Assignee...</option>
                      {employees.map((emp) => (
                        <option key={emp._id || emp.employeeId} value={emp.name}>
                          {emp.name} ({emp.role || emp.department})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Priority</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Est. Hours</label>
                    <input
                      type="number"
                      min="1"
                      value={newTask.estimatedHours}
                      onChange={(e) => setNewTask({ ...newTask, estimatedHours: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                    Cancel
                  </button>
                  <button type="submit" style={{ padding: '8px 16px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 700, borderRadius: '6px' }}>
                    Save Task
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
