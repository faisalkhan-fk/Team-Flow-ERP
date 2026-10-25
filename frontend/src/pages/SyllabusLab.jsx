import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Code,
  BookOpen,
  Terminal,
  Database,
  Layers,
  Cpu,
  Zap,
  Play,
  RotateCcw,
  CheckCircle,
  Copy,
  ExternalLink,
  Flame,
  FileCode,
  FilePlus,
  Trash2,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function SyllabusLab() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialUnit = Number(searchParams.get('unit')) || 1;
  const [activeUnit, setActiveUnit] = useState(initialUnit);
  const { theme } = useApp();

  useEffect(() => {
    const unitFromUrl = Number(searchParams.get('unit'));
    if (unitFromUrl && unitFromUrl >= 1 && unitFromUrl <= 5) {
      setActiveUnit(unitFromUrl);
    }
  }, [searchParams]);

  const selectUnit = (u) => {
    setActiveUnit(u);
    setSearchParams({ unit: u });
  };

  /* ========================================================
     UNIT 1 STATES & DEMOS (React Fundamentals)
     ======================================================== */
  const [greetingName, setGreetingName] = useState('Antigravity Engineer');
  const [counter, setCounter] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [badgeVariant, setBadgeVariant] = useState('success');
  const [demoList, setDemoList] = useState(['MERN Stack', 'React 19', 'Express REST', 'MongoDB']);
  const [newListItem, setNewListItem] = useState('');

  /* ========================================================
     UNIT 2 STATES & DEMOS (React Router & Hooks)
     ======================================================== */
  // 1. useState
  const [hookCounter, setHookCounter] = useState(10);
  // 2. useEffect
  const [timerSeconds, setTimerSeconds] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);
  // 3. useRef
  const inputRef = useRef(null);
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;
  const focusInput = () => inputRef.current?.focus();
  // 4. useMemo
  const [memoNumber, setMemoNumber] = useState(5);
  const factorial = useMemo(() => {
    let result = 1;
    for (let i = 1; i <= memoNumber; i++) result *= i;
    return result;
  }, [memoNumber]);
  // 5. useCallback
  const [callbackCount, setCallbackCount] = useState(0);
  const incrementCallback = useCallback(() => {
    setCallbackCount((c) => c + 1);
  }, []);

  /* ========================================================
     UNIT 3 STATES & DEMOS (REST API & Axios)
     ======================================================== */
  const [apiMethod, setApiMethod] = useState('GET');
  const [apiUrl, setApiUrl] = useState('/api/employees');
  const [apiResponse, setApiResponse] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);

  const testApiCall = async () => {
    try {
      setApiLoading(true);
      const start = performance.now();
      let res;
      if (apiMethod === 'GET') {
        res = await axios.get(apiUrl);
      } else if (apiMethod === 'POST') {
        res = await axios.post(apiUrl, {
          employeeId: 'TEST-' + Math.floor(100 + Math.random() * 900),
          name: 'Demo Tester',
          email: `test${Date.now()}@campus.edu`,
          department: 'Engineering',
          role: 'QA Engineer',
          salary: 75000,
        });
      }
      const elapsed = (performance.now() - start).toFixed(1);
      setApiStatus({ code: res.status, text: res.statusText, time: elapsed });
      setApiResponse(res.data);
    } catch (err) {
      setApiStatus({
        code: err.response?.status || 500,
        text: err.response?.statusText || 'Error',
        time: 0,
      });
      setApiResponse(err.response?.data || { error: err.message });
    } finally {
      setApiLoading(false);
    }
  };

  /* ========================================================
     UNIT 4 STATES & DEMOS (Node.js & fs File System)
     ======================================================== */
  const [fsFilename, setFsFilename] = useState('academic_notes.txt');
  const [fsContent, setFsContent] = useState('Demonstrating Node.js fs.promises.writeFile from Unit 4.');
  const [fsLog, setFsLog] = useState('');
  const [fsLoading, setFsLoading] = useState(false);
  const [benchmarkResult, setBenchmarkResult] = useState(null);

  const handleFsWrite = async () => {
    try {
      setFsLoading(true);
      const res = await axios.post('/api/node-fs/write', {
        filename: fsFilename,
        content: fsContent,
      });
      setFsLog(`✔ [fs.promises.writeFile]: ${res.data.message} (${res.data.elapsedMs}ms)`);
    } catch (err) {
      setFsLog(`❌ Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setFsLoading(false);
    }
  };

  const handleFsRead = async () => {
    try {
      setFsLoading(true);
      const res = await axios.get(`/api/node-fs/read?filename=${fsFilename}`);
      setFsLog(`📖 [fs.promises.readFile]:\n"${res.data.content}" (${res.data.elapsedMs}ms)`);
    } catch (err) {
      setFsLog(`❌ Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setFsLoading(false);
    }
  };

  const handleFsAppend = async () => {
    try {
      setFsLoading(true);
      const res = await axios.post('/api/node-fs/append', {
        filename: fsFilename,
        textToAppend: `\n[Log Timestamp: ${new Date().toLocaleTimeString()}] Audit passed.`,
      });
      setFsLog(`➕ [fs.promises.appendFile]:\n"${res.data.updatedContent}"`);
    } catch (err) {
      setFsLog(`❌ Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setFsLoading(false);
    }
  };

  const handleFsDelete = async () => {
    try {
      setFsLoading(true);
      const res = await axios.delete(`/api/node-fs/delete?filename=${fsFilename}`);
      setFsLog(`🗑 [fs.promises.unlink]: ${res.data.message}`);
    } catch (err) {
      setFsLog(`❌ Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setFsLoading(false);
    }
  };

  const runBenchmark = async () => {
    try {
      setFsLoading(true);
      const res = await axios.get('/api/node-fs/benchmark');
      setBenchmarkResult(res.data);
    } catch (err) {
      setFsLog(`Benchmark error: ${err.message}`);
    } finally {
      setFsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-success">Syllabus Interactive Lab</span>
              <span className="badge badge-info">Viva & Practical Ready</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
              MERN Stack <span className="gradient-text">Interactive Curriculum Code Lab</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '750px' }}>
              Direct live demonstrations for every single topic prescribed in your 60-Hour Course Syllabus:
              from JSX Expressions & React Hooks to Node.js Asynchronous File System and Mongoose Aggregations.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="code-font" style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.06)', padding: '6px 12px', borderRadius: 'var(--radius-sm)' }}>
              Render Counter: <strong>#{renderCountRef.current}</strong>
            </span>
          </div>
        </div>

        {/* 5 Units Navigation Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '10px',
          marginTop: '1.5rem',
        }}>
          {[
            { id: 1, title: 'Unit 1: React Fundamentals', subtitle: 'JSX, Props, Events, Forms' },
            { id: 2, title: 'Unit 2: Router & Hooks', subtitle: 'All 7 Hooks + Redux Alt' },
            { id: 3, title: 'Unit 3: REST API & Axios', subtitle: 'GET, POST, PUT, DELETE' },
            { id: 4, title: 'Unit 4: Node.js & FS', subtitle: 'Async I/O, File System' },
            { id: 5, title: 'Unit 5: Express & MongoDB', subtitle: 'Mongoose, Aggregations' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => selectUnit(tab.id)}
              className="glass-card"
              style={{
                padding: '12px 14px',
                textAlign: 'left',
                border: activeUnit === tab.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                background: activeUnit === tab.id ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                cursor: 'pointer',
                borderRadius: 'var(--radius-md)',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: activeUnit === tab.id ? '#ffffff' : 'var(--text-primary)' }}>
                {tab.title}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {tab.subtitle}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================================
          UNIT 1: REACT FUNDAMENTALS
          ========================================================================= */}
      {activeUnit === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Unit 1: Introduction To React Fundamentals (12 Hours)
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Demonstrating JSX expressions, Functional Components, Props passing, Lists & Keys, Conditional Rendering, Dynamic class rendering, and Controlled Forms.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {/* Demo 1: JSX Expressions & Props */}
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>1. JSX & Props Passing</h3>
                <span className="badge badge-info">JSX Expression</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Type in the input to see dynamic JSX expression <span className="code-font">&#123;greetingName&#125;</span> update in the child prop card:
              </p>
              <input
                type="text"
                value={greetingName}
                onChange={(e) => setGreetingName(e.target.value)}
                className="input-control"
                placeholder="Enter name for greeting prop..."
              />
              <div style={{ padding: '12px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.75rem', color: '#a5b4fc', textTransform: 'uppercase', fontWeight: 700 }}>Child Prop Component Output:</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '4px' }}>
                  Hello, {greetingName || 'Guest'}! 👋
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Evaluated expression: 2 + 2 = {2 + 2} • String Uppercase: {(greetingName || '').toUpperCase()}
                </div>
              </div>
            </div>

            {/* Demo 2: Conditional Rendering & Dynamic Classes */}
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>2. Conditional & Dynamic Classes</h3>
                <span className="badge badge-warning">Ternary / &&</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Toggle login state to see conditional JSX rendering and dynamic class badge updates:
              </p>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setIsLoggedIn(!isLoggedIn)}
                  className={`btn ${isLoggedIn ? 'btn-danger' : 'btn-primary'}`}
                >
                  {isLoggedIn ? 'Simulate Logout' : 'Simulate Login'}
                </button>
                <button
                  onClick={() => setBadgeVariant(badgeVariant === 'success' ? 'danger' : 'success')}
                  className="btn btn-secondary"
                >
                  Toggle Badge Class
                </button>
              </div>

              <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
                {isLoggedIn ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={18} color="#10b981" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>User Status: Authenticated (Admin Session)</span>
                    <span className={`badge badge-${badgeVariant}`}>{badgeVariant} class</span>
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    User Status: Anonymous / Logged Out
                  </div>
                )}
              </div>
            </div>

            {/* Demo 3: Rendering Lists & Keys */}
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>3. Rendering Lists with Unique Keys & Event Handling</h3>
                <span className="badge badge-success">Array.map()</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Demonstrating dynamic array mapping with unique keys and event-driven deletion:
              </p>

              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Add syllabus topic..."
                  value={newListItem}
                  onChange={(e) => setNewListItem(e.target.value)}
                  className="input-control"
                />
                <button
                  onClick={() => {
                    if (newListItem.trim()) {
                      setDemoList([...demoList, newListItem.trim()]);
                      setNewListItem('');
                    }
                  }}
                  className="btn btn-primary"
                >
                  Add Item
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {demoList.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.85rem',
                    }}
                  >
                    <span>{item}</span>
                    <button
                      onClick={() => setDemoList(demoList.filter((_, i) => i !== index))}
                      style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', display: 'flex' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          UNIT 2: REACT ROUTER & HOOKS
          ========================================================================= */}
      {activeUnit === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Unit 2: Understanding Role Of React Router And Hooks (12 Hours)
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Featuring interactive demos for <span className="code-font">useState, useEffect, useContext, useReducer, useCallback, useMemo, useRef</span>, and the pattern where <span className="code-font">useReducer + useContext</span> replace Redux!
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            
            {/* Hook 1: useState */}
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>1. useState Hook</h3>
                <span className="badge badge-info">State Management</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Current State: <strong style={{ fontSize: '1.2rem', color: '#6366f1' }}>{hookCounter}</strong>
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setHookCounter((c) => c + 1)} className="btn btn-secondary btn-sm">+1</button>
                <button onClick={() => setHookCounter((c) => c - 1)} className="btn btn-secondary btn-sm">-1</button>
                <button onClick={() => setHookCounter(0)} className="btn btn-danger btn-sm">Reset</button>
              </div>
            </div>

            {/* Hook 2: useEffect */}
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>2. useEffect Hook</h3>
                <span className="badge badge-success">Lifecycle & Cleanup</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Timer mounted via <span className="code-font">useEffect</span> with cleanup return function:
              </p>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={20} />
                <span>Elapsed: {timerSeconds} seconds</span>
              </div>
            </div>

            {/* Hook 3: useRef */}
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>3. useRef Hook</h3>
                <span className="badge badge-warning">DOM Ref & Mutable Val</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Access direct DOM element without triggering re-render:
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input ref={inputRef} type="text" placeholder="I will be focused..." className="input-control" />
                <button onClick={focusInput} className="btn btn-primary btn-sm">Focus DOM</button>
              </div>
            </div>

            {/* Hook 4: useMemo */}
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>4. useMemo Hook</h3>
                <span className="badge badge-info">Expensive Calculation Memo</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Factorial calculation memoized: Factorial of {memoNumber} is:
              </p>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ec4899' }}>
                {memoNumber}! = {factorial}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setMemoNumber((n) => Math.min(12, n + 1))} className="btn btn-secondary btn-sm">Increase N</button>
                <button onClick={() => setMemoNumber((n) => Math.max(1, n - 1))} className="btn btn-secondary btn-sm">Decrease N</button>
              </div>
            </div>

            {/* Hook 5: useCallback */}
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>5. useCallback Hook</h3>
                <span className="badge badge-success">Function Reference Cache</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Function reference preserved across re-renders:
              </p>
              <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                Callback Invocations: {callbackCount}
              </div>
              <button onClick={incrementCallback} className="btn btn-secondary btn-sm">
                Trigger Memoized Callback
              </button>
            </div>

            {/* Hook 6 & 7: useReducer + useContext to Replace Redux */}
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', gridColumn: 'span 2', border: '1px solid rgba(99,102,241,0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                  6. useReducer & useContext Pattern (Replacing Redux)
                </h3>
                <span className="badge badge-success">Syllabus Highlight</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                As prescribed in Unit 2: Rather than installing bulky external Redux libraries, modern React combines <span className="code-font">useReducer</span> (state + action dispatch) with <span className="code-font">createContext</span> to provide a lightweight, 100% native global store across the entire application.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                <div style={{ padding: '10px', background: 'rgba(0,0,0,0.25)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#6366f1' }}>Step 1: Reducer Function</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Pure function (state, action) =&gt; nextState handling ADD_TASK, UPDATE_TASK
                  </div>
                </div>
                <div style={{ padding: '10px', background: 'rgba(0,0,0,0.25)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#8b5cf6' }}>Step 2: Context Provider</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    &lt;AppContext.Provider value=&#123;&#123; state, dispatch &#125;&#125;&gt; wraps root
                  </div>
                </div>
                <div style={{ padding: '10px', background: 'rgba(0,0,0,0.25)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#10b981' }}>Step 3: useApp() Hook</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Any child component calls dispatch(&#123; type: '...' &#125;) with zero boilerplate
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          UNIT 3: RESTFUL API CALLING WITH AXIOS & FETCH
          ========================================================================= */}
      {activeUnit === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Unit 3: Understanding Restful Api Calling With React Js (12 Hours)
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Testing native <span className="code-font">Fetch API</span> vs <span className="code-font">Axios</span>, calling GET, POST, DELETE and PUT APIs, Form handling with JSON responses.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <select
                value={apiMethod}
                onChange={(e) => setApiMethod(e.target.value)}
                className="select-control"
                style={{ width: '120px', fontWeight: 700 }}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>

              <select
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="select-control"
                style={{ flex: 1, minWidth: '220px' }}
              >
                <option value="/api/employees">/api/employees (Employee list)</option>
                <option value="/api/employees?select=name,salary">/api/employees?select=name,salary (Projection)</option>
                <option value="/api/employees/stats/analytics">/api/employees/stats/analytics (MongoDB Aggregations)</option>
                <option value="/api/projects">/api/projects (Projects list)</option>
                <option value="/api/tasks">/api/tasks (Tasks list)</option>
                <option value="/api/health">/api/health (System status)</option>
              </select>

              <button
                onClick={testApiCall}
                disabled={apiLoading}
                className="btn btn-primary"
                style={{ minWidth: '130px' }}
              >
                <Play size={16} />
                {apiLoading ? 'Calling...' : 'Send Request'}
              </button>
            </div>

            {apiStatus && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem' }}>
                <span className={`badge ${apiStatus.code >= 200 && apiStatus.code < 300 ? 'badge-success' : 'badge-danger'}`}>
                  Status: {apiStatus.code} {apiStatus.text}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>Response Time: {apiStatus.time} ms</span>
              </div>
            )}

            <div style={{
              background: '#0a0f1d',
              padding: '1.25rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              maxHeight: '350px',
              overflowY: 'auto',
            }}>
              <pre className="code-font" style={{ fontSize: '0.8rem', color: '#38bdf8', whiteSpace: 'pre-wrap' }}>
                {apiResponse ? JSON.stringify(apiResponse, null, 2) : '// Click "Send Request" to invoke Axios API call...'}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          UNIT 4: NODE.JS & CORE FILE SYSTEM (fs)
          ========================================================================= */}
      {activeUnit === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Unit 4: Introduction to Node.js & File System (12 Hours)
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Direct live interface for Node.js <span className="code-font">fs</span> module: Read File, Write File, Append File, Delete File, and Asynchronous vs Synchronous I/O benchmark!
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {/* File System Operations Card */}
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Live Node.js fs Operations</h3>
                <span className="badge badge-info">fs.promises</span>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Filename</label>
                <input
                  type="text"
                  value={fsFilename}
                  onChange={(e) => setFsFilename(e.target.value)}
                  className="input-control"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>File Content</label>
                <textarea
                  rows="3"
                  value={fsContent}
                  onChange={(e) => setFsContent(e.target.value)}
                  className="input-control"
                />
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <button onClick={handleFsWrite} disabled={fsLoading} className="btn btn-primary btn-sm">
                  fs.writeFile (Async)
                </button>
                <button onClick={handleFsRead} disabled={fsLoading} className="btn btn-secondary btn-sm">
                  fs.readFile (Async)
                </button>
                <button onClick={handleFsAppend} disabled={fsLoading} className="btn btn-secondary btn-sm">
                  fs.appendFile
                </button>
                <button onClick={handleFsDelete} disabled={fsLoading} className="btn btn-danger btn-sm">
                  fs.unlink (Delete)
                </button>
              </div>

              {fsLog && (
                <div style={{
                  padding: '10px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)',
                  color: '#a7f3d0',
                  whiteSpace: 'pre-wrap',
                }}>
                  {fsLog}
                </div>
              )}
            </div>

            {/* Asynchronous vs Synchronous Benchmark Card */}
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Sync vs Async I/O Benchmark</h3>
                <span className="badge badge-warning">Event Loop Demo</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Compare <span className="code-font">fs.readFileSync</span> (blocking) vs <span className="code-font">fs.promises.readFile</span> (non-blocking thread pool execution):
              </p>

              <button onClick={runBenchmark} disabled={fsLoading} className="btn btn-primary">
                <Zap size={16} />
                Run Benchmark on Node.js Server
              </button>

              {benchmarkResult && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                  <div style={{ padding: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fca5a5' }}>
                      Synchronous (fs.readFileSync)
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Time: <strong>{benchmarkResult.results.synchronous.timeMs} ms</strong> (Blocks Event Loop)
                    </div>
                  </div>

                  <div style={{ padding: '10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#6ee7b7' }}>
                      Asynchronous (fs.promises.readFile)
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Time: <strong>{benchmarkResult.results.asynchronous.timeMs} ms</strong> (Non-blocking worker delegation)
                    </div>
                  </div>

                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    {benchmarkResult.takeaway}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          UNIT 5: EXPRESS & MONGODB MONGOOSE
          ========================================================================= */}
      {activeUnit === 5 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Unit 5: Building RESTful APIs with Node.js and Express.js (12 Hours)
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Mongoose Schemas, Validations, Express Middleware chain, Centralized Error Handling, and MongoDB Aggregation Pipelines.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {/* Express Middleware Architecture */}
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Express Middleware Pipeline</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Every request flows through this structured pipeline in <span className="code-font">server.js</span>:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { step: '1', name: 'cors()', desc: 'Allows cross-origin requests from React frontend' },
                  { step: '2', name: 'express.json()', desc: 'Parses incoming JSON request payloads' },
                  { step: '3', name: 'requestLogger', desc: 'Custom middleware logging method, URL, and execution ms' },
                  { step: '4', name: 'Feature Routers', desc: 'Mounted routes (/api/employees, /api/projects, /api/tasks)' },
                  { step: '5', name: 'errorHandler', desc: 'Central error middleware formatting 400/404/500 JSON errors' },
                ].map((m) => (
                  <div key={m.step} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>
                      {m.step}
                    </span>
                    <div>
                      <span className="code-font" style={{ fontWeight: 700, fontSize: '0.8rem', color: '#c7d2fe' }}>{m.name}</span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mongoose Schema & Aggregation Visualizer */}
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>MongoDB Aggregation Pipeline</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Live pipeline code used in <span className="code-font">GET /api/employees/stats/analytics</span>:
              </p>

              <div style={{ background: '#0a0f1d', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <pre className="code-font" style={{ fontSize: '0.75rem', color: '#fbbf24', overflowX: 'auto' }}>
{`Employee.aggregate([
  {
    $group: {
      _id: '$department',
      count: { $sum: 1 },
      avgSalary: { $avg: '$salary' },
      avgScore: { $avg: '$performanceScore' }
    }
  },
  { $sort: { count: -1 } }
]);`}
                </pre>
              </div>

              <div style={{ padding: '10px', background: 'rgba(16,185,129,0.1)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399' }}>Viva / Exam Tip:</span>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  The <span className="code-font">$group</span> stage separates documents into groups by the department field, and calculates accumulated values (<span className="code-font">$sum</span> and <span className="code-font">$avg</span>) for each group without running raw SQL queries.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
