import React, { useEffect, useMemo, useState } from 'react';
import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen, LayoutDashboard, BriefcaseBusiness, ClipboardList, LogOut, Menu, X,
  Flame, ArrowUpRight, ChevronRight, ShieldCheck, Target, TrendingUp, Sun, Moon, Award, RotateCcw
} from './components/icons.jsx';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';
import api from './services/api';
import { useTheme } from './context/ThemeContext.jsx';

import Learn from './pages/Learn.jsx';
import Jobs from './pages/Jobs.jsx';
import Practice from './pages/Practice.jsx';
import Admin from './pages/Admin.jsx';

const statuses = ['Saved', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me')
      .then(r => setUser(r.data.user))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Starting SkillToSeat…</div>;

  return (
    <Routes>
      <Route path="/login" element={<Auth mode="login" setUser={setUser} />} />
      <Route path="/register" element={<Auth mode="register" setUser={setUser} />} />
      <Route path="*" element={user ? <Shell user={user} setUser={setUser} /> : <Auth mode="login" setUser={setUser} />} />
    </Routes>
  );
}

function Auth({ mode, setUser }) {
  const [register, setRegister] = useState(mode === 'register');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [dbStatus, setDbStatus] = useState('checking');
  const { theme, toggleTheme } = useTheme();
  const nav = useNavigate();

  useEffect(() => {
    api.get('/health')
      .then(r => setDbStatus(r.data?.database))
      .catch(() => setDbStatus('disconnected'));
  }, []);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const r = await api.post(`/auth/${register ? 'register' : 'login'}`, Object.fromEntries(new FormData(e.currentTarget)));
      setUser(r.data.user);
      nav('/');
    } catch (err) {
      if (!err.response) {
        setError('Backend API is unreachable. Please verify that the server is running on port 5000.');
      } else if (err.response.status === 401) {
        setError(err.response.data?.message || 'Incorrect email or password. Please check your credentials.');
      } else if (err.response.status === 503) {
        setError(err.response.data?.message || 'Database service is currently unavailable. Please verify MongoDB Atlas connection and IP access list.');
      } else {
        setError(err.response.data?.message || (register ? 'Could not create account. Please check your details.' : 'Could not sign in. Please check your credentials.'));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <div className="auth-art">
        <div>
          <div className="brand" style={{ padding: 0 }}>
            <span className="brand-mark">S</span>
            <div className="brand-text">
              <span className="brand-title">Skill<span>To</span>Seat</span>
              <span className="brand-tagline">Learn. Practice. Launch.</span>
            </div>
          </div>
        </div>

        <div className="art-copy">
          <div className="eyebrow">CAREER ACCELERATION PLATFORM</div>
          <h1>
            Master concepts.<br />
            <span>Crack the test.</span><br />
            Launch your career.
          </h1>
          <p>The structured placement preparation suite built for ambitious students. Lectures, scored topic assessments, and real-time application tracking.</p>
          <div className="art-card">
            <div className="avatar" style={{ width: '40px', height: '40px' }}>⚡</div>
            <div>
              <b>{register ? 'Create your profile' : 'Welcome back, student'}</b>
              <small>Placement prep & career management in one view</small>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1px' }}>
            LEARN · PRACTICE · LAUNCH
          </div>
          <button className="icon-btn" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} mode`}>
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </div>

      <div className="auth-form-wrap">
        <form className="auth-form" onSubmit={submit}>
          <div className="eyebrow">STUDENT PORTAL</div>
          <h2>{register ? 'Create your account' : 'Sign in to SkillToSeat'}</h2>
          <p className="muted">{register ? 'Begin your structured placement journey.' : 'Resume your learning path and active applications.'}</p>
          
          {dbStatus === 'disconnected' && (
            <div style={{
              background: 'var(--danger-bg)',
              border: '2px solid var(--border)',
              borderRadius: '6px',
              padding: '10px 12px',
              margin: '14px 0',
              fontSize: '12px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <strong style={{ color: 'var(--danger)', display: 'block', marginBottom: '3px' }}>
                Database Disconnected
              </strong>
              MongoDB Atlas is rejecting connections (TLS IP restriction). Add your current IP in your Atlas Dashboard Network Access list.
            </div>
          )}

          {register && (
            <label>Full name<input name="name" placeholder="Alex Morgan" required /></label>
          )}
          <label>Email address<input name="email" type="email" placeholder="you@university.edu" required /></label>
          <label>Password<input name="password" type="password" minLength="8" placeholder="At least 8 characters" required /></label>
          {error && <div className="error">{error}</div>}
          <button className="primary" style={{ width: '100%', marginTop: '20px', height: '42px' }} disabled={busy}>
            {busy ? 'Please wait…' : register ? 'Create account' : 'Sign in'}
            <ChevronRight size={17} />
          </button>
          <div className="switch">
            {register ? 'Already have an account?' : 'New to SkillToSeat?'}{' '}
            <button type="button" onClick={() => setRegister(!register)}>
              {register ? 'Sign in' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Shell({ user, setUser }) {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => setOpen(false), [loc]);

  const links = [
    ['/', 'Dashboard', LayoutDashboard],
    ['/learn', 'Lectures', BookOpen],
    ['/practice', 'Topic Quizzes', Target],
    ['/jobs', 'Job Openings', BriefcaseBusiness],
    ['/applications', 'App Tracker', ClipboardList]
  ];

  async function logout() {
    await api.post('/auth/logout');
    setUser(null);
    nav('/login');
  }

  return (
    <div className="app-shell">
      <aside className={open ? 'sidebar show' : 'sidebar'}>
        <div className="brand">
          <span className="brand-mark">S</span>
          <div className="brand-text">
            <span className="brand-title">Skill<span>To</span>Seat</span>
            <span className="brand-tagline">Learn. Practice. Launch.</span>
          </div>
        </div>

        <div className="side-label">NAVIGATION</div>
        {links.map(([to, label, Icon]) => (
          <NavLink end={to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to={to} key={to}>
            <Icon size={18} />{label}
          </NavLink>
        ))}

        {user.role === 'ADMIN' && (
          <>
            <div className="side-label" style={{ marginTop: '24px' }}>ADMINISTRATION</div>
            <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/admin">
              <ShieldCheck size={18} />Manage Platform
            </NavLink>
          </>
        )}

        <div className="side-bottom">
          <div className="theme-toggle-row">
            <span>Theme: {theme === 'light' ? 'Light' : 'Dark'}</span>
            <button className="icon-btn" style={{ width: '28px', height: '28px' }} onClick={toggleTheme} title="Toggle theme">
              {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            </button>
          </div>

          <div className="profile">
            <div className="avatar">{user.name?.slice(0, 1).toUpperCase()}</div>
            <div>
              <b>{user.name}</b>
              <small>{user.role === 'ADMIN' ? 'Admin Portal' : 'Student'}</small>
            </div>
            <button className="icon-btn" style={{ marginLeft: 'auto' }} title="Sign out" onClick={logout}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="icon-btn mobile-menu" onClick={() => setOpen(!open)}>
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div className="crumb">
              SKILLTOSEAT <span>/</span> <b>{links.find(a => a[0] === loc.pathname)?.[1] || (loc.pathname === '/admin' ? 'Admin' : 'Workspace')}</b>
            </div>
          </div>
          <div className="top-right">
            <div className="tag-badge">
              <span className="live-dot"></span> Active Prep Mode
            </div>
            <button className="icon-btn" onClick={toggleTheme} title={`Toggle ${theme === 'light' ? 'Dark' : 'Light'} theme`}>
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <div className="avatar small">{user.name?.slice(0, 1).toUpperCase()}</div>
          </div>
        </header>

        <div className="content">
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/admin" element={user.role === 'ADMIN' ? <Admin /> : <Dashboard user={user} />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function PageTitle({ eyebrow, title, sub, children }) {
  return (
    <div className="page-title">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>
      {children}
    </div>
  );
}

function Dashboard({ user }) {
  const [data, setData] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [quizProgress, setQuizProgress] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard'),
      api.get('/lessons'),
      api.get('/progress')
    ]).then(([d, l, p]) => {
      setData(d.data);
      setLessons(l.data.items || []);
      setQuizProgress((p.data.items || []).filter(item => item.quiz));
    }).catch(() => {});
  }, []);

  const st = data?.stats || {};
  const chart = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    return {
      day: d.toLocaleDateString('en', { weekday: 'short' }),
      value: data?.activity?.find(a => a.dateKey === key)?.actions || 0
    };
  }), [data]);

  return (
    <>
      <PageTitle
        eyebrow="PREPARATION DASHBOARD"
        title={`Welcome back, ${user.name?.split(' ')[0]}.`}
        sub="Your central workspace for learning placement topics, taking scored quizzes, and launching career applications."
      />

      <div className="stats-grid">
        <Stat icon={Target} label="Lecture Progress" value={`${st.completion || 0}%`} note={`${st.completed || 0} of ${st.totalLessons || 0} completed`} color="mint" />
        <Stat icon={Flame} label="Daily Streak" value={`${st.streak || 0} days`} note="Consistency builds placements" color="orange" />
        <Stat icon={ClipboardList} label="Applications" value={st.applications || 0} note="Roles in your tracker" color="blue" />
        <Stat icon={BriefcaseBusiness} label="Open Positions" value={st.openJobs || 0} note="Verified openings" color="purple" />
      </div>

      <div className="dash-grid">
        <section className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="eyebrow" style={{ margin: 0 }}>CONSISTENCY TRACKER</div>
              <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '18px', fontWeight: 800, marginTop: '6px' }}>Weekly Activity</h3>
            </div>
            <span className="tag-badge"><span className="live-dot" /> 7-DAY RECORD</span>
          </div>

          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 700 }} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ background: 'var(--panel)', border: '2px solid var(--border)', borderRadius: 6, color: 'var(--text)', boxShadow: 'var(--shadow-sm)' }} />
                <Bar dataKey="value" fill="var(--accent)" stroke="var(--border)" strokeWidth={1.5} maxBarSize={42} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-foot">Every completed lecture and quiz attempt logs toward your streak.</div>
        </section>

        <section className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="eyebrow" style={{ alignSelf: 'flex-start' }}>CURRICULUM</div>
          <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '18px', fontWeight: 800, marginTop: '4px' }}>Recommended Lectures</h3>
          
          <div className="focus-list">
            {lessons.slice(0, 3).map((l, i) => (
              <NavLink to="/learn" className="focus-item" key={l._id}>
                <div className="focus-num">0{i + 1}</div>
                <div className="focus-info">
                  <b>{l.title}</b>
                  <small>{l.topic} · {l.durationMinutes || '—'} mins</small>
                </div>
                <ChevronRight size={17} />
              </NavLink>
            ))}
            {!lessons.length && <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No lectures available yet.</p>}
          </div>
          <NavLink className="secondary" to="/learn" style={{ marginTop: 'auto', alignSelf: 'flex-start' }}>
            Explore All Lectures <ArrowUpRight size={15} />
          </NavLink>
        </section>
      </div>

      {/* Quiz Progress & Results Section */}
      <section className="panel" style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <div className="eyebrow" style={{ margin: 0 }}>TOPIC ASSESSMENTS</div>
            <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '18px', fontWeight: 800, marginTop: '4px' }}>Recent Quiz Performance</h3>
          </div>
          <NavLink to="/practice" className="primary" style={{ padding: '6px 14px', fontSize: '12px' }}>
            Practice Assessments <ChevronRight size={15} />
          </NavLink>
        </div>

        {quizProgress.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
            {quizProgress.map(qp => (
              <div key={qp._id} style={{
                background: 'var(--panel-alt)',
                border: '2px solid var(--border)',
                borderRadius: '6px',
                padding: '14px',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <b style={{ fontSize: '13px' }}>{qp.quiz?.title || qp.topic}</b>
                  <span className={`status-badge ${qp.completed ? 'open' : 'closed'}`}>
                    {qp.completed ? 'PASSED' : 'RETAKE'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Attempts: {qp.attempts}</span>
                  <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '16px' }}>
                    Score: {qp.lastScore}% (Best: {qp.bestScore}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '12px' }}>
            You haven't attempted any topic quizzes yet. Test your knowledge in the <b>Topic Quizzes</b> section to log scores and unlock mastery.
          </div>
        )}
      </section>

      <section className="welcome-strip">
        <div className="welcome-icon"><Flame size={22} /></div>
        <div style={{ flex: 1 }}>
          <b>Learn. Practice. Launch.</b>
          <p>Stay ahead of campus placement schedules by studying curated lectures and solving verified technical quizzes.</p>
        </div>
        <NavLink to="/practice" className="primary">
          Start Quiz Assessment <ChevronRight size={16} />
        </NavLink>
      </section>
    </>
  );
}

function Stat({ icon: Icon, label, value, note, color }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}><Icon size={20} /></div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-note">{note}</div>
    </div>
  );
}

function Applications() {
  const [items, setItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const refresh = () => api.get('/applications').then(r => setItems(r.data.items || [])).catch(() => {});

  useEffect(() => { refresh(); }, []);

  async function change(id, status) {
    await api.patch(`/applications/${id}`, { status });
    refresh();
  }

  async function remove(id) {
    if (!confirm('Remove this opportunity from your tracker?')) return;
    await api.delete(`/applications/${id}`);
    refresh();
  }

  const filtered = statusFilter === 'ALL' ? items : items.filter(i => i.status === statusFilter);

  return (
    <>
      <PageTitle
        eyebrow="APPLICATION TRACKER · STAY ORGANIZED"
        title="Manage Your Placement Pipeline"
        sub="Track each opportunity through every milestone: Saved, Applied, Assessment, Interview, Offer, Rejected, or Withdrawn."
      />

      <div className="status-summary">
        <button
          className={`status-pill ${statusFilter === 'ALL' ? 'selected' : ''}`}
          onClick={() => setStatusFilter('ALL')}
          style={{ background: statusFilter === 'ALL' ? 'var(--accent)' : 'var(--panel)', cursor: 'pointer' }}
        >
          All Opportunities <b>{items.length}</b>
        </button>
        {statuses.map(s => {
          const count = items.filter(i => i.status === s).length;
          return (
            <button
              className="status-pill"
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                background: statusFilter === s ? 'var(--accent)' : 'var(--panel)',
                cursor: 'pointer'
              }}
            >
              {s} <b>{count}</b>
            </button>
          );
        })}
      </div>

      <div className="application-list">
        {filtered.map(i => (
          <article className="application-card" key={i._id}>
            <div className="company-mark">{i.company?.slice(0, 1).toUpperCase()}</div>
            <div className="application-main">
              <div className="application-title">
                <h3>{i.jobTitle}</h3>
                <span>{i.company}</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                Updated {new Date(i.updatedAt).toLocaleDateString()}
              </div>
            </div>

            <select
              value={i.status}
              onChange={e => change(i._id, e.target.value)}
              style={{ fontWeight: 700 }}
            >
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            {i.applyUrl && (
              <a className="icon-btn" href={i.applyUrl} target="_blank" rel="noreferrer" title="Open external application link">
                <ArrowUpRight size={17} />
              </a>
            )}

            <button className="icon-btn" onClick={() => remove(i._id)} title="Remove from tracker">
              <X size={15} />
            </button>
          </article>
        ))}

        {!filtered.length && (
          <div className="empty panel">
            <div className="empty-icon"><ClipboardList size={22} /></div>
            <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '18px', fontWeight: 800 }}>No applications matching filter</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {statusFilter === 'ALL'
                ? 'Save open roles from the Job Openings page to manage your interview lifecycle.'
                : `No roles currently marked with status "${statusFilter}".`}
            </p>
            <NavLink className="primary" to="/jobs">
              Find Job Openings <ChevronRight size={16} />
            </NavLink>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
