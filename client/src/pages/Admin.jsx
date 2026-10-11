import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Plus, Edit, Trash2, X, CheckCircle2, ShieldCheck
} from '../components/icons';

export default function Admin() {
  const [tab, setTab] = useState('Lectures');
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null); // null if adding new
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadCategories();
    loadLessons();
  }, []);

  useEffect(() => {
    loadData();
  }, [tab]);

  async function loadCategories() {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.items || []);
    } catch {
      // Ignore
    }
  }

  async function loadLessons() {
    try {
      const res = await api.get('/lessons');
      setLessons(res.data.items || []);
    } catch {
      // Ignore
    }
  }

  async function loadData() {
    setLoading(true);
    setMsg('');
    setErr('');
    try {
      if (tab === 'Lectures') {
        const res = await api.get('/lessons');
        setRows(res.data.items || []);
      } else if (tab === 'Jobs') {
        // Admin gets all jobs including closed
        const res = await api.get('/jobs?all=true');
        setRows(res.data.items || []);
      } else if (tab === 'Tests') {
        const res = await api.get('/quizzes');
        setRows(res.data.items || []);
      } else if (tab === 'Categories') {
        const res = await api.get('/categories');
        setRows(res.data.items || []);
      } else if (tab === 'Topics') {
        const [lRes, qRes] = await Promise.all([
          api.get('/lessons'),
          api.get('/quizzes')
        ]);
        const allLessons = lRes.data.items || [];
        const allQuizzes = qRes.data.items || [];
        const topicMap = new Map();
        
        allLessons.forEach(l => {
          if (!l.topic) return;
          const entry = topicMap.get(l.topic) || {
            _id: l.topic,
            name: l.topic,
            categoryName: l.category?.name || 'Unassigned',
            categoryId: l.category?._id || l.category,
            lectureCount: 0,
            quizCount: 0
          };
          entry.lectureCount += 1;
          topicMap.set(l.topic, entry);
        });

        allQuizzes.forEach(q => {
          if (!q.topic) return;
          const entry = topicMap.get(q.topic) || {
            _id: q.topic,
            name: q.topic,
            categoryName: q.category?.name || 'Unassigned',
            categoryId: q.category?._id || q.category,
            lectureCount: 0,
            quizCount: 0
          };
          entry.quizCount += 1;
          topicMap.set(q.topic, entry);
        });

        setRows(Array.from(topicMap.values()));
      }
    } catch (e) {
      setErr(e.response?.data?.message || 'Could not load data.');
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditItem(null);
    if (tab === 'Lectures') {
      setFormData({
        title: '',
        topic: '',
        category: categories[0]?._id || '',
        youtubeVideoId: '',
        durationMinutes: 15,
        order: (rows.length || 0) + 1,
        description: '',
        keyConcepts: ''
      });
    } else if (tab === 'Jobs') {
      setFormData({
        title: '',
        company: '',
        location: 'Remote',
        type: 'Full-time',
        category: 'Engineering',
        applyUrl: '',
        description: '',
        status: 'Open'
      });
    } else if (tab === 'Tests') {
      setFormData({
        title: '',
        topic: '',
        category: categories[0]?._id || '',
        lesson: '',
        description: '',
        questions: [
          {
            prompt: '',
            options: ['', '', '', ''],
            answerIndex: 0,
            explanation: ''
          }
        ]
      });
    } else if (tab === 'Categories') {
      setFormData({
        name: '',
        description: '',
        order: (rows.length || 0) + 1
      });
    } else if (tab === 'Topics') {
      setTab('Lectures');
      setFormData({
        title: '',
        topic: '',
        category: categories[0]?._id || '',
        youtubeVideoId: '',
        durationMinutes: 15,
        order: 1,
        description: '',
        keyConcepts: ''
      });
    }
    setModalOpen(true);
  }

  async function openEditModal(item) {
    setEditItem(item);
    if (tab === 'Lectures') {
      setFormData({
        title: item.title || '',
        topic: item.topic || '',
        category: typeof item.category === 'object' ? item.category?._id : item.category || '',
        youtubeVideoId: item.youtubeVideoId || '',
        durationMinutes: item.durationMinutes || 0,
        order: item.order || 0,
        description: item.description || '',
        keyConcepts: (item.keyConcepts || []).join(', ')
      });
    } else if (tab === 'Jobs') {
      setFormData({
        title: item.title || '',
        company: item.company || '',
        location: item.location || 'Remote',
        type: item.type || 'Full-time',
        category: item.category || 'Engineering',
        applyUrl: item.applyUrl || '',
        description: item.description || '',
        status: item.status || (item.active ? 'Open' : 'Closed')
      });
    } else if (tab === 'Tests') {
      // Load full quiz with answerIndex from admin endpoint
      try {
        const fullRes = await api.get(`/quizzes/${item._id}/admin`);
        const qz = fullRes.data.quiz;
        setFormData({
          title: qz.title || '',
          topic: qz.topic || '',
          category: typeof qz.category === 'object' ? qz.category?._id : qz.category || '',
          lesson: typeof qz.lesson === 'object' ? qz.lesson?._id : qz.lesson || '',
          description: qz.description || '',
          questions: qz.questions || []
        });
      } catch {
        setFormData({
          title: item.title || '',
          topic: item.topic || '',
          category: typeof item.category === 'object' ? item.category?._id : item.category || '',
          lesson: typeof item.lesson === 'object' ? item.lesson?._id : item.lesson || '',
          description: item.description || '',
          questions: item.questions || []
        });
      }
    } else if (tab === 'Categories') {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        order: item.order || 0
      });
    }
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg('');
    setErr('');

    try {
      const payload = { ...formData };

      // Field normalization
      if (tab === 'Lectures') {
        if (!payload.category && categories.length > 0) {
          payload.category = categories[0]._id;
        }
        if (typeof payload.keyConcepts === 'string') {
          payload.keyConcepts = payload.keyConcepts
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);
        }
        payload.durationMinutes = Number(payload.durationMinutes) || 0;
        payload.order = Number(payload.order) || 0;
      }

      if (tab === 'Jobs') {
        payload.active = payload.status === 'Open';
      }

      if (tab === 'Tests') {
        // Validate test questions
        if (!payload.questions || payload.questions.length === 0) {
          throw new Error('Test must have at least one question.');
        }
        for (const q of payload.questions) {
          if (!q.prompt?.trim()) throw new Error('Every question must have a prompt.');
          if (!q.options || q.options.some(o => !o.trim())) {
            throw new Error('All options must be filled out for each question.');
          }
        }
      }

      const resourcePath =
        tab === 'Lectures' ? '/lessons' :
        tab === 'Jobs' ? '/jobs' :
        tab === 'Tests' ? '/quizzes' : '/categories';

      if (editItem) {
        await api.patch(`${resourcePath}/${editItem._id}`, payload);
        setMsg(`${tab.slice(0, -1)} updated successfully.`);
      } else {
        await api.post(resourcePath, payload);
        setMsg(`${tab.slice(0, -1)} created and published.`);
      }

      setModalOpen(false);
      loadData();
      if (tab === 'Categories') loadCategories();
      if (tab === 'Lectures') loadLessons();
    } catch (err) {
      setErr(err.response?.data?.message || err.message || 'Operation failed.');
    }
  }

  async function handleDelete(item) {
    const name = item.title || item.name || 'this item';
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const resourcePath =
        tab === 'Lectures' ? '/lessons' :
        tab === 'Jobs' ? '/jobs' :
        tab === 'Tests' ? '/quizzes' : '/categories';

      await api.delete(`${resourcePath}/${item._id}`);
      setMsg(`Deleted successfully.`);
      loadData();
    } catch (err) {
      setErr(err.response?.data?.message || 'Delete failed.');
    }
  }

  async function toggleJobStatus(job) {
    try {
      const newStatus = job.status === 'Open' || job.active ? 'Closed' : 'Open';
      await api.patch(`/jobs/${job._id}`, {
        status: newStatus,
        active: newStatus === 'Open'
      });
      loadData();
    } catch (err) {
      setErr(err.response?.data?.message || 'Failed to update job status.');
    }
  }

  // Question builder helpers for Tests
  function addQuestion() {
    setFormData(prev => ({
      ...prev,
      questions: [
        ...(prev.questions || []),
        { prompt: '', options: ['', '', '', ''], answerIndex: 0, explanation: '' }
      ]
    }));
  }

  function removeQuestion(index) {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  }

  function addOption(qIndex) {
    setFormData(prev => {
      const qs = [...prev.questions];
      if (qs[qIndex].options.length >= 6) return prev;
      const opts = [...qs[qIndex].options, ''];
      qs[qIndex] = { ...qs[qIndex], options: opts };
      return { ...prev, questions: qs };
    });
  }

  function removeOption(qIndex, optIndex) {
    setFormData(prev => {
      const qs = [...prev.questions];
      if (qs[qIndex].options.length <= 2) return prev;
      const opts = qs[qIndex].options.filter((_, i) => i !== optIndex);
      let answerIndex = qs[qIndex].answerIndex;
      if (answerIndex === optIndex) answerIndex = 0;
      else if (answerIndex > optIndex) answerIndex -= 1;
      qs[qIndex] = { ...qs[qIndex], options: opts, answerIndex };
      return { ...prev, questions: qs };
    });
  }

  function updateQuestion(qIndex, field, value) {
    setFormData(prev => {
      const qs = [...prev.questions];
      qs[qIndex] = { ...qs[qIndex], [field]: value };
      return { ...prev, questions: qs };
    });
  }

  function updateQuestionOption(qIndex, optIndex, value) {
    setFormData(prev => {
      const qs = [...prev.questions];
      const opts = [...qs[qIndex].options];
      opts[optIndex] = value;
      qs[qIndex] = { ...qs[qIndex], options: opts };
      return { ...prev, questions: qs };
    });
  }

  return (
    <>
      <div className="page-title">
        <div>
          <div className="eyebrow">ADMINISTRATION · CONTENT CONTROL</div>
          <h1>Manage Placement Platform</h1>
          <p>Create, update, and publish lectures, open job roles, topic practice tests, and categories.</p>
        </div>
      </div>

      <div className="admin-tabs">
        {['Lectures', 'Jobs', 'Tests', 'Categories', 'Topics'].map(t => (
          <button
            key={t}
            className={tab === t ? 'selected' : ''}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
        <button className="primary add-btn" onClick={openCreateModal}>
          <Plus size={16} /> Add {tab === 'Topics' ? 'Topic Content' : tab.slice(0, -1)}
        </button>
      </div>

      {msg && <div className="success">{msg}</div>}
      {err && <div className="error">{err}</div>}

      {loading ? (
        <div className="panel empty">Loading {tab.toLowerCase()}...</div>
      ) : rows.length > 0 ? (
        <div className="admin-list">
          {rows.map(item => (
            <div className="admin-row" key={item._id}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <b>{item.title || item.name}</b>
                  {tab === 'Lectures' && (
                    <span className="order-badge">Order: {item.order || 0}</span>
                  )}
                  {tab === 'Jobs' && (
                    <span className={`status-badge ${(item.status === 'Open' || item.active) ? 'open' : 'closed'}`}>
                      {item.status || (item.active ? 'Open' : 'Closed')}
                    </span>
                  )}
                  {tab === 'Topics' && (
                    <span className="order-badge">{item.lectureCount} Lectures · {item.quizCount} Tests</span>
                  )}
                </div>
                <small>
                  {tab === 'Lectures' && `${item.topic} · ${item.category?.name || 'Category'} · ${item.durationMinutes || 0} mins · Video: ${item.youtubeVideoId}`}
                  {tab === 'Jobs' && `${item.company} · ${item.location || 'Remote'} · ${item.type || 'Full-time'} · Category: ${item.category}`}
                  {tab === 'Tests' && `Topic: ${item.topic} · ${item.questionCount || item.questions?.length || 0} Questions`}
                  {tab === 'Categories' && (item.description || 'No description')}
                  {tab === 'Topics' && `Category: ${item.categoryName}`}
                </small>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {tab === 'Topics' ? (
                  <>
                    <button
                      className="secondary"
                      style={{ padding: '6px 10px', fontSize: '11px' }}
                      onClick={() => {
                        setTab('Lectures');
                        setEditItem(null);
                        setFormData({
                          title: '',
                          topic: item.name,
                          category: item.categoryId || categories[0]?._id || '',
                          youtubeVideoId: '',
                          durationMinutes: 15,
                          order: 1,
                          description: '',
                          keyConcepts: ''
                        });
                        setModalOpen(true);
                      }}
                    >
                      + Lecture
                    </button>
                    <button
                      className="secondary"
                      style={{ padding: '6px 10px', fontSize: '11px' }}
                      onClick={() => {
                        setTab('Tests');
                        setEditItem(null);
                        setFormData({
                          title: `${item.name} Assessment`,
                          topic: item.name,
                          category: item.categoryId || categories[0]?._id || '',
                          lesson: '',
                          description: '',
                          questions: [{ prompt: '', options: ['', '', '', ''], answerIndex: 0, explanation: '' }]
                        });
                        setModalOpen(true);
                      }}
                    >
                      + Quiz
                    </button>
                  </>
                ) : (
                  <>
                    {tab === 'Jobs' && (
                      <button
                        className="secondary"
                        style={{ padding: '6px 10px', fontSize: '11px' }}
                        onClick={() => toggleJobStatus(item)}
                      >
                        Toggle {item.status === 'Open' ? 'Close' : 'Open'}
                      </button>
                    )}
                    <button
                      className="secondary"
                      style={{ padding: '6px 10px', fontSize: '11px' }}
                      onClick={() => openEditModal(item)}
                    >
                      <Edit size={13} /> Edit
                    </button>
                    <button
                      className="danger-link"
                      style={{ padding: '6px 10px' }}
                      onClick={() => handleDelete(item)}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty panel">
          <h3>No {tab.toLowerCase()} found</h3>
          <p>Click the "Add {tab.slice(0, -1)}" button above to create one.</p>
        </div>
      )}

      {/* Modal Dialog for Create / Edit */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3>{editItem ? `Edit ${tab.slice(0, -1)}` : `Create New ${tab.slice(0, -1)}`}</h3>
              <button className="icon-btn" onClick={() => setModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* LECTURES FORM */}
                {tab === 'Lectures' && (
                  <>
                    <div className="form-group">
                      <label>Lecture Title *</label>
                      <input
                        required
                        value={formData.title || ''}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g. Master Binary Search & Two Pointers"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Category *</label>
                        <select
                          value={formData.category || ''}
                          onChange={e => setFormData({ ...formData, category: e.target.value })}
                        >
                          {categories.map(c => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Topic *</label>
                        <input
                          required
                          value={formData.topic || ''}
                          onChange={e => setFormData({ ...formData, topic: e.target.value })}
                          placeholder="e.g. Binary Search"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>YouTube Video ID or Full URL *</label>
                      <input
                        required
                        value={formData.youtubeVideoId || ''}
                        onChange={e => setFormData({ ...formData, youtubeVideoId: e.target.value })}
                        placeholder="e.g. dQw4w9WgXcQ or https://youtube.com/watch?v=..."
                      />
                      <small>Full YouTube URLs or 11-character video IDs are automatically normalized.</small>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Duration (Minutes)</label>
                        <input
                          type="number"
                          min="0"
                          value={formData.durationMinutes ?? 15}
                          onChange={e => setFormData({ ...formData, durationMinutes: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Display Order</label>
                        <input
                          type="number"
                          min="0"
                          value={formData.order ?? 1}
                          onChange={e => setFormData({ ...formData, order: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        value={formData.description || ''}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Brief overview of what students will learn..."
                      />
                    </div>

                    <div className="form-group">
                      <label>Key Concepts (comma-separated)</label>
                      <input
                        value={formData.keyConcepts || ''}
                        onChange={e => setFormData({ ...formData, keyConcepts: e.target.value })}
                        placeholder="e.g. Invariant, Monotonicity, Lower Bound"
                      />
                    </div>
                  </>
                )}

                {/* JOBS FORM */}
                {tab === 'Jobs' && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Role Title *</label>
                        <input
                          required
                          value={formData.title || ''}
                          onChange={e => setFormData({ ...formData, title: e.target.value })}
                          placeholder="e.g. Associate Software Engineer"
                        />
                      </div>
                      <div className="form-group">
                        <label>Company *</label>
                        <input
                          required
                          value={formData.company || ''}
                          onChange={e => setFormData({ ...formData, company: e.target.value })}
                          placeholder="e.g. Microsoft"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Location</label>
                        <input
                          value={formData.location || ''}
                          onChange={e => setFormData({ ...formData, location: e.target.value })}
                          placeholder="e.g. Bengaluru, India or Remote"
                        />
                      </div>
                      <div className="form-group">
                        <label>Employment Type</label>
                        <select
                          value={formData.type || 'Full-time'}
                          onChange={e => setFormData({ ...formData, type: e.target.value })}
                        >
                          <option value="Full-time">Full-time</option>
                          <option value="Internship">Internship</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Category</label>
                        <input
                          value={formData.category || 'Engineering'}
                          onChange={e => setFormData({ ...formData, category: e.target.value })}
                          placeholder="e.g. Engineering, Product, Data"
                        />
                      </div>
                      <div className="form-group">
                        <label>Status (Open / Closed) *</label>
                        <select
                          value={formData.status || 'Open'}
                          onChange={e => setFormData({ ...formData, status: e.target.value })}
                        >
                          <option value="Open">Open (Visible to Students)</option>
                          <option value="Closed">Closed (Hidden from Students)</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>External Application URL *</label>
                      <input
                        required
                        type="url"
                        value={formData.applyUrl || ''}
                        onChange={e => setFormData({ ...formData, applyUrl: e.target.value })}
                        placeholder="https://company.careers/apply/..."
                      />
                    </div>

                    <div className="form-group">
                      <label>Job Description</label>
                      <textarea
                        value={formData.description || ''}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Job details, qualifications, and requirements..."
                      />
                    </div>
                  </>
                )}

                {/* TESTS / QUIZZES FORM */}
                {tab === 'Tests' && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Test Title *</label>
                        <input
                          required
                          value={formData.title || ''}
                          onChange={e => setFormData({ ...formData, title: e.target.value })}
                          placeholder="e.g. Binary Search Mastery Assessment"
                        />
                      </div>
                      <div className="form-group">
                        <label>Associated Topic *</label>
                        <input
                          required
                          value={formData.topic || ''}
                          onChange={e => setFormData({ ...formData, topic: e.target.value })}
                          placeholder="e.g. Binary Search"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Category (optional)</label>
                        <select
                          value={formData.category || ''}
                          onChange={e => setFormData({ ...formData, category: e.target.value })}
                        >
                          <option value="">No Category</option>
                          {categories.map(c => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Associated Lecture (optional)</label>
                        <select
                          value={formData.lesson || ''}
                          onChange={e => setFormData({ ...formData, lesson: e.target.value })}
                        >
                          <option value="">No Lecture</option>
                          {lessons.map(l => (
                            <option key={l._id} value={l._id}>{l.title}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Test Description</label>
                      <input
                        value={formData.description || ''}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Brief overview of test topics..."
                      />
                    </div>

                    <div className="question-builder">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="eyebrow" style={{ color: 'var(--mint)' }}>QUESTIONS BUILDER</span>
                        <button type="button" className="secondary" style={{ padding: '6px 10px' }} onClick={addQuestion}>
                          <Plus size={13} /> Add Question
                        </button>
                      </div>

                      {(formData.questions || []).map((q, qIndex) => (
                        <div className="question-item" key={qIndex}>
                          <div className="question-top">
                            <b>Question {qIndex + 1}</b>
                            {formData.questions.length > 1 && (
                              <button
                                type="button"
                                className="danger-link"
                                onClick={() => removeQuestion(qIndex)}
                              >
                                Remove Question
                              </button>
                            )}
                          </div>

                          <div className="form-group" style={{ marginBottom: '10px' }}>
                            <label>Question Prompt *</label>
                            <input
                              required
                              value={q.prompt || ''}
                              onChange={e => updateQuestion(qIndex, 'prompt', e.target.value)}
                              placeholder="Enter the question prompt..."
                            />
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <label style={{ fontSize: '10px', color: '#9bb0c9', fontWeight: 600 }}>
                              Options ({q.options.length}) · Select radio for correct answer *
                            </label>
                            {q.options.length < 6 && (
                              <button
                                type="button"
                                className="secondary"
                                style={{ padding: '3px 8px', fontSize: '9px' }}
                                onClick={() => addOption(qIndex)}
                              >
                                + Add Option
                              </button>
                            )}
                          </div>

                          {q.options.map((opt, optIndex) => (
                            <div className="option-row" key={optIndex}>
                              <input
                                type="radio"
                                name={`correct-${qIndex}`}
                                checked={q.answerIndex === optIndex}
                                onChange={() => updateQuestion(qIndex, 'answerIndex', optIndex)}
                                title="Mark as correct answer"
                              />
                              <input
                                required
                                type="text"
                                value={opt}
                                onChange={e => updateQuestionOption(qIndex, optIndex, e.target.value)}
                                placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                              />
                              {q.options.length > 2 && (
                                <button
                                  type="button"
                                  className="icon-btn"
                                  style={{ width: '28px', height: '28px', flex: 'none' }}
                                  title="Remove this option"
                                  onClick={() => removeOption(qIndex, optIndex)}
                                >
                                  <X size={12} />
                                </button>
                              )}
                            </div>
                          ))}

                          <div className="form-group" style={{ marginTop: '10px' }}>
                            <label>Explanation (shown to student after submission)</label>
                            <textarea
                              value={q.explanation || ''}
                              onChange={e => updateQuestion(qIndex, 'explanation', e.target.value)}
                              placeholder="Why is this answer correct? Explain the concept..."
                              style={{ minHeight: '52px' }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* CATEGORIES FORM */}
                {tab === 'Categories' && (
                  <>
                    <div className="form-group">
                      <label>Category Name *</label>
                      <input
                        required
                        value={formData.name || ''}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Data Structures & Algorithms"
                      />
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        value={formData.description || ''}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Category description..."
                      />
                    </div>
                    <div className="form-group">
                      <label>Display Order</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.order ?? 1}
                        onChange={e => setFormData({ ...formData, order: e.target.value })}
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="modal-foot">
                <button type="button" className="secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary">
                  {editItem ? 'Save Changes' : 'Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
