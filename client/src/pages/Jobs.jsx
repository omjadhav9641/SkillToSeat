  import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Search, Plus, MapPin, Clock3, Building2, ArrowUpRight, CheckCircle2
} from '../components/icons';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    loadJobs();
    loadApplications();
  }, []);

  async function loadJobs() {
    try {
      setLoading(true);
      // The backend filters only active/open roles for students
      const res = await api.get('/jobs');
      setJobs(res.data.items || []);
    } catch {
      // Empty state
    } finally {
      setLoading(false);
    }
  }

  async function loadApplications() {
    try {
      const res = await api.get('/applications');
      const savedSet = new Set(
        (res.data.items || []).map(a => typeof a.job === 'object' ? a.job?._id : a.job).filter(Boolean)
      );
      setSavedJobs(savedSet);
    } catch {
      // Ignore
    }
  }

  async function saveRole(j) {
    if (savedJobs.has(j._id)) return;
    try {
      setSavingId(j._id);
      await api.post('/applications', {
        job: j._id,
        jobTitle: j.title,
        company: j.company,
        applyUrl: j.applyUrl,
        status: 'Saved'
      });
      setSavedJobs(prev => new Set([...prev, j._id]));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save to application tracker.');
    } finally {
      setSavingId(null);
    }
  }

  const categories = [...new Set(jobs.map(j => j.category).filter(Boolean))];
  const employmentTypes = ['All', 'Full-time', 'Internship', 'Part-time', 'Contract'];

  const filtered = jobs.filter(j => {
    const matchSearch = `${j.title} ${j.company} ${j.location} ${j.description || ''}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchCat = !category || j.category === category;
    const matchType = !type || type === 'All' || j.type === type;
    const isOpen = j.active !== false && j.status !== 'Closed';
    return matchSearch && matchCat && matchType && isOpen;
  });

  return (
    <>
      <div className="page-title">
        <div>
          <div className="eyebrow">OPPORTUNITIES · YOUR NEXT MOVE</div>
          <h1>Open Job Roles</h1>
          <p>Discover open campus & industry opportunities, apply directly, and track your applications.</p>
        </div>
      </div>

      <div className="search-row">
        <div className="search-box">
          <Search size={18} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search roles, companies, locations..."
          />
        </div>

        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="">All employment types</option>
          {employmentTypes.filter(t => t !== 'All').map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <span className="result-count">{filtered.length} open roles</span>
      </div>

      {loading ? (
        <div className="panel empty">Loading opportunities...</div>
      ) : filtered.length > 0 ? (
        <div className="job-grid">
          {filtered.map(j => {
            const isSaved = savedJobs.has(j._id);
            return (
              <article className="job-card" key={j._id}>
                <div className="company-mark">{j.company?.slice(0, 1).toUpperCase()}</div>
                <div className="job-top">
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span className="tag">{j.type || 'Full-time'}</span>
                    {j.category && <span className="tag" style={{ color: 'var(--mint)' }}>{j.category}</span>}
                  </div>
                  <button
                    className="icon-btn"
                    title={isSaved ? 'Already saved' : 'Save to tracker'}
                    disabled={isSaved || savingId === j._id}
                    onClick={() => saveRole(j)}
                  >
                    {isSaved ? <CheckCircle2 size={16} color="var(--mint)" /> : <Plus size={17} />}
                  </button>
                </div>

                <h3>{j.title}</h3>
                <div className="company-name">
                  <Building2 size={15} /> {j.company}
                </div>

                <div className="job-meta">
                  <span>
                    <MapPin size={14} /> {j.location || 'Remote'}
                  </span>
                  <span>
                    <Clock3 size={14} /> {new Date(j.postedAt || j.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p>{j.description || 'Explore this opportunity and take the next step in your career journey.'}</p>

                <div className="job-actions">
                  <button
                    className="secondary"
                    disabled={isSaved || savingId === j._id}
                    onClick={() => saveRole(j)}
                  >
                    {isSaved ? 'Saved in Tracker' : savingId === j._id ? 'Saving...' : 'Save Role'}
                  </button>
                  <a
                    className="primary"
                    href={j.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Apply Externally <ArrowUpRight size={15} />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty panel">
          <h3>No open roles match your filters</h3>
          <p>Try clearing your search filters or check back soon for newly published roles.</p>
        </div>
      )}
    </>
  );
}
