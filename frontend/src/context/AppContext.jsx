import React, { createContext, useContext, useReducer, useState, useEffect } from 'react';
import axios from 'axios';

// Unit 2: "useReducer and useContext to replace Redux"
const AppContext = createContext();

// Initial Reducer State
const initialTaskState = {
  tasks: [],
  notifications: [
    { id: 1, type: 'info', message: 'Welcome to TeamFlow ERP! MERN Syllabus Unit 1-5 active.' },
  ],
  stats: {
    totalEmployees: 5,
    activeProjects: 3,
    openTasks: 4,
    payroll: 536000,
  },
};

// Reducer Function (Pure Function handling state transitions)
function appReducer(state, action) {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };

    case 'ADD_TASK':
      return {
        ...state,
        tasks: [action.payload, ...state.tasks],
        notifications: [
          { id: Date.now(), type: 'success', message: `Task "${action.payload.title}" created!` },
          ...state.notifications.slice(0, 4),
        ],
      };

    case 'UPDATE_TASK_STATUS':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task._id === action.payload.id || task.taskId === action.payload.id
            ? { ...task, status: action.payload.status }
            : task
        ),
      };

    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter((task) => task._id !== action.payload && task.taskId !== action.payload),
        notifications: [
          { id: Date.now(), type: 'warning', message: 'Task deleted successfully' },
          ...state.notifications.slice(0, 4),
        ],
      };

    case 'SET_STATS':
      return { ...state, stats: { ...state.stats, ...action.payload } };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications.slice(0, 4)],
      };

    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.payload),
      };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [theme, setTheme] = useState('dark');
  const [dbStatus, setDbStatus] = useState({ connected: false, host: 'Connecting...', database: '' });
  const [state, dispatch] = useReducer(appReducer, initialTaskState);

  // Sync theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Initial fetch of health & database connectivity
  useEffect(() => {
    const checkSystemHealth = async () => {
      try {
        const res = await axios.get('/api/health');
        if (res.data?.database) {
          setDbStatus(res.data.database);
        }
      } catch (err) {
        console.warn('Backend not responding yet:', err.message);
      }
    };

    const fetchInitialTasks = async () => {
      try {
        const res = await axios.get('/api/tasks');
        if (res.data?.data) {
          dispatch({ type: 'SET_TASKS', payload: res.data.data });
        }
      } catch (err) {
        console.warn('Tasks initial load failed:', err.message);
      }
    };

    checkSystemHealth();
    fetchInitialTasks();
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const value = {
    theme,
    toggleTheme,
    dbStatus,
    setDbStatus,
    state,
    dispatch,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Custom Hook to consume AppContext
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
