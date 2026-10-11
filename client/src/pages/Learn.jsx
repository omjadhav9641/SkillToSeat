import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import api from '../services/api';
import {
  Play, Clock3, CheckCircle2, ArrowUpRight, Search, Target, RotateCcw, ChevronRight
} from '../components/icons';

export default function Learn() {
  const [lessons, setLessons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [progress, setProgress] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [topicFilter, setTopicFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  // Embedded Topic Quiz State
  const [lessonQuiz, setLessonQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [lRes, cRes, pRes] = await Promise.all([
        api.get('/lessons'),
        api.get('/categories'),
        api.get('/progress').catch(() => ({ data: { items: [] } }))
      ]);
      setLessons(lRes.data.items || []);
      setCategories(cRes.data.items || []);
      setProgress(pRes.data?.items || []);
    } catch {
      // Handled by empty states
    } finally {
      setLoading(false);
    }
  }

  // Load quiz for the selected lesson topic
  useEffect(() => {
    if (selected) {
      api.get('/quizzes')
        .then(res => {
          const matched = (res.data.items || []).find(
            q => q.topic === selected.topic || (q.lesson && (q.lesson._id === selected._id || q.lesson === selected._id))
          );
          if (matched) {
            api.get(`/quizzes/${matched._id}`)
              .then(qRes => setLessonQuiz(qRes.data.quiz))
              .catch(() => setLessonQuiz(null));
          } else {
            setLessonQuiz(null);
          }
        })
        .catch(() => setLessonQuiz(null));
      setQuizAnswers({});
      setQuizResult(null);
    }
  }, [selected]);

  const completedLessonIds = new Set(
    progress.filter(p => p.completed && p.lesson).map(p => typeof p.lesson === 'object' ? p.lesson._id : p.lesson)
  );

  const availableTopics = [
    'All',
    ...new Set(
      lessons
        .filter(l => categoryFilter === 'All' || l.category?.name === categoryFilter || l.category === categoryFilter)
        .map(l => l.topic)
        .filter(Boolean)
    )
  ];

  const visible = lessons
    .filter(l => {
      const matchCat = categoryFilter === 'All' || l.category?.name === categoryFilter || l.category === categoryFilter;
      const matchTopic = topicFilter === 'All' || l.topic === topicFilter;
      const matchSearch = !search.trim() ||
        `${l.title} ${l.topic} ${l.description || ''}`.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchTopic && matchSearch;
    })
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  async function markComplete(lessonId) {
    try {
      setCompleting(true);
      await api.post(`/progress/lessons/${lessonId}/complete`);
      const pRes = await api.get('/progress');
      setProgress(pRes.data?.items || []);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update progress.');
    } finally {
      setCompleting(false);
    }
  }

  async function submitLessonQuiz() {
    if (!lessonQuiz) return;
    const answersArray = lessonQuiz.questions.map((_, i) =>
      quizAnswers[i] !== undefined ? quizAnswers[i] : null
    );

    try {
      setSubmittingQuiz(true);
      const res = await api.post(`/quizzes/${lessonQuiz._id}/submit`, {
        answers: answersArray
      });
      setQuizResult(res.data);
      const pRes = await api.get('/progress');
      setProgress(pRes.data?.items || []);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit quiz.');
    } finally {
      setSubmittingQuiz(false);
    }
  }

  const isCompleted = selected && completedLessonIds.has(selected._id);

  return (
    <>
      <div className="page-title">
        <div>
          <div className="eyebrow">CURATED LECTURES · INTERACTIVE LEARNING</div>
          <h1>Placement Lectures</h1>
          <p>Watch foundational lectures, master core concepts, and track your completion.</p>
        </div>
      </div>

      {selected ? (
        <section className="panel lesson-view">
          <button className="back-link" onClick={() => setSelected(null)}>
            ← Back to all lectures
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span className="order-badge">Lecture #{selected.order || 1}</span>
            <span className="eyebrow" style={{ margin: 0 }}>
              {selected.category?.name || 'Placement'} · {selected.topic}
            </span>
            <span className="tag-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '2px 8px' }}>
              <Clock3 size={11} /> {selected.durationMinutes || 0} min
            </span>
            {isCompleted && (
              <span className="completed-pill">
                <CheckCircle2 size={12} /> Completed
              </span>
            )}
          </div>
          
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '24px', fontWeight: 800, margin: '6px 0' }}>
            {selected.title}
          </h2>
          <p className="muted" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {selected.description || 'Watch this video to build conceptual depth.'}
          </p>

          <div className="video-frame">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${selected.youtubeVideoId}`}
              title={selected.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '16px', paddingBottom: '16px', borderBottom: '2px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>Key Concepts:</span>
              {(selected.keyConcepts?.length ? selected.keyConcepts : ['Fundamentals', 'Time Complexity', 'Problem Solving']).map(c => (
                <span className="chip" key={c} style={{ fontSize: '11px', padding: '3px 10px' }}>{c}</span>
              ))}
            </div>

            <button
              className="primary"
              disabled={completing || isCompleted}
              onClick={() => markComplete(selected._id)}
            >
              <CheckCircle2 size={16} />
              {isCompleted ? 'Lecture Completed' : completing ? 'Saving...' : 'Mark Lecture Complete'}
            </button>
          </div>

          {/* Embedded Topic Quiz */}
          {lessonQuiz && (
            <div style={{ marginTop: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <div className="eyebrow" style={{ margin: 0 }}>TOPIC MASTERY ASSESSMENT</div>
                  <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '18px', fontWeight: 800, marginTop: '4px' }}>
                    {lessonQuiz.title}
                  </h3>
                </div>
                <span className="chip selected" style={{ fontSize: '11px', padding: '3px 10px' }}>
                  {lessonQuiz.questions?.length} QUESTIONS
                </span>
              </div>

              {quizResult && (
                <div className={`result-banner ${quizResult.percent >= 70 ? 'pass' : 'fail'}`} style={{ padding: '20px', marginBottom: '20px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={20} />
                    <span className="eyebrow" style={{ margin: 0 }}>
                      {quizResult.percent >= 70 ? 'QUIZ PASSED' : 'PRACTICE COMPLETE'}
                    </span>
                  </div>
                  <h2 style={{ fontSize: '26px', margin: '6px 0' }}>
                    Score: {quizResult.score} / {quizResult.total} ({quizResult.percent}%)
                  </h2>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Attempt #{quizResult.attempts} · Best Score: {quizResult.bestScore}%
                  </p>
                </div>
              )}

              <div className="test-questions">
                {(quizResult ? quizResult.results : lessonQuiz.questions).map((q, qIndex) => {
                  const selectedOption = quizAnswers[qIndex];
                  const isSubmitted = !!quizResult;

                  return (
                    <div
                      key={qIndex}
                      className={`test-q-box ${
                        isSubmitted ? (q.correct ? 'result-item correct' : 'result-item incorrect') : ''
                      }`}
                      style={{ padding: '16px', marginBottom: '14px' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span className="chip selected" style={{ fontSize: '10px', padding: '2px 8px', fontWeight: 800 }}>
                          QUESTION {qIndex + 1} OF {lessonQuiz.questions.length}
                        </span>
                        {isSubmitted && (
                          <span className={`status-badge ${q.correct ? 'open' : 'closed'}`}>
                            {q.correct ? 'Correct' : 'Incorrect'}
                          </span>
                        )}
                      </div>

                      <p className="test-q-prompt" style={{ fontSize: '14px', marginBottom: '12px' }}>{q.prompt}</p>

                      <div className="test-options" style={{ gap: '8px' }}>
                        {q.options.map((opt, optIndex) => {
                          const letter = String.fromCharCode(65 + optIndex);
                          let optionClass = 'test-opt-btn';

                          if (!isSubmitted) {
                            if (selectedOption === optIndex) optionClass += ' selected';
                          } else {
                            if (optIndex === q.correctAnswerIndex) {
                              optionClass += ' correct';
                            } else if (optIndex === q.studentAnswer && !q.correct) {
                              optionClass += ' incorrect';
                            }
                          }

                          return (
                            <button
                              key={optIndex}
                              type="button"
                              className={optionClass}
                              disabled={isSubmitted}
                              onClick={() => setQuizAnswers(prev => ({ ...prev, [qIndex]: optIndex }))}
                              style={{ padding: '10px 14px', fontSize: '12px' }}
                            >
                              <span className="test-opt-letter">{letter}</span>
                              <span style={{ flex: 1 }}>{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {isSubmitted && q.explanation && (
                        <div className="explanation-box" style={{ marginTop: '10px', padding: '10px 12px' }}>
                          <b style={{ display: 'block', marginBottom: '3px' }}>Explanation:</b>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!quizResult ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Answered {Object.keys(quizAnswers).length} of {lessonQuiz.questions.length} questions
                  </span>
                  <button
                    className="primary"
                    disabled={submittingQuiz}
                    onClick={submitLessonQuiz}
                  >
                    {submittingQuiz ? 'Submitting...' : 'Submit Quiz Answers'} <ChevronRight size={16} />
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                  <button
                    className="secondary"
                    onClick={() => {
                      setQuizAnswers({});
                      setQuizResult(null);
                    }}
                  >
                    <RotateCcw size={14} /> Retake Quiz
                  </button>
                  <NavLink to="/practice" className="primary">
                    More Quizzes <ArrowUpRight size={14} />
                  </NavLink>
                </div>
              )}
            </div>
          )}
        </section>
      ) : (
        <>
          <div className="search-row">
            <div className="search-box">
              <Search size={18} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search lectures by title, topic, or concept..."
              />
            </div>
            <span className="tag-badge">{visible.length} Lectures</span>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <div className="eyebrow" style={{ marginBottom: '6px' }}>CATEGORIES</div>
            <div className="filter-row" style={{ marginBottom: '14px' }}>
              {['All', ...categories.map(c => c.name)].map(c => (
                <button
                  key={c}
                  className={`chip ${categoryFilter === c ? 'selected' : ''}`}
                  onClick={() => {
                    setCategoryFilter(c);
                    setTopicFilter('All');
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {availableTopics.length > 1 && (
            <div style={{ marginBottom: '22px' }}>
              <div className="eyebrow" style={{ marginBottom: '6px' }}>TOPICS</div>
              <div className="filter-row">
                {availableTopics.map(t => (
                  <button
                    key={t}
                    className={`chip ${topicFilter === t ? 'selected' : ''}`}
                    onClick={() => setTopicFilter(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <div className="panel empty">Loading lectures...</div>
          ) : visible.length > 0 ? (
            <div className="lesson-grid">
              {visible.map(l => {
                const done = completedLessonIds.has(l._id);
                return (
                  <article className="lesson-card" key={l._id} onClick={() => setSelected(l)} style={{ cursor: 'pointer' }}>
                    <div className="lesson-cover">
                      <img
                        src={`https://img.youtube.com/vi/${l.youtubeVideoId}/hqdefault.jpg`}
                        alt={l.title}
                        onError={e => {
                          e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80';
                        }}
                      />
                      <span><Play size={18} fill="currentColor" /></span>
                    </div>
                    <div className="lesson-body">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="eyebrow">
                          {l.category?.name || 'Placement'} · {l.topic}
                        </div>
                        {done && (
                          <span className="completed-pill">
                            <CheckCircle2 size={11} /> Done
                          </span>
                        )}
                      </div>
                      <h3>{l.title}</h3>
                      <p>{l.description || 'Master key placement concepts in this lecture.'}</p>
                      <div className="lesson-foot">
                        <span className="order-badge">#{l.order || 0} · {l.durationMinutes || '--'} MIN</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>Watch Lecture</span>
                          <ArrowUpRight size={15} />
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty panel">
              <h3>No lectures found</h3>
              <p>Try adjusting your category, topic, or search query.</p>
            </div>
          )}
        </>
      )}
    </>
  );
}
