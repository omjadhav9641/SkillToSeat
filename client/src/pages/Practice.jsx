import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import {
  Target, CheckCircle2, ChevronRight, RotateCcw, Award, ArrowUpRight
} from '../components/icons';

export default function Practice() {
  const [searchParams] = useSearchParams();
  const initialTopic = searchParams.get('topic') || 'All';

  const [quizzes, setQuizzes] = useState([]);
  const [progress, setProgress] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(initialTopic);
  const [activeTest, setActiveTest] = useState(null); // quiz object loaded for taking
  const [answers, setAnswers] = useState({}); // { [questionIndex]: optionIndex }
  const [submitting, setSubmitting] = useState(false);
  const [testResult, setTestResult] = useState(null); // post-submission scoring and explanations
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [qRes, pRes] = await Promise.all([
        api.get('/quizzes'),
        api.get('/progress').catch(() => ({ data: { items: [] } }))
      ]);
      setQuizzes(qRes.data.items || []);
      setProgress(pRes.data?.items || []);
    } catch {
      // Handled in UI
    } finally {
      setLoading(false);
    }
  }

  // Map progress by quiz ID or topic
  const progressMap = {};
  progress.forEach(p => {
    if (p.quiz) {
      const qId = typeof p.quiz === 'object' ? p.quiz._id : p.quiz;
      progressMap[qId] = p;
    }
    if (p.topic) {
      if (!progressMap[p.topic] || p.bestScore > progressMap[p.topic].bestScore) {
        progressMap[p.topic] = p;
      }
    }
  });

  const distinctTopics = ['All', ...new Set(quizzes.map(q => q.topic).filter(Boolean))];

  const filteredTests = quizzes.filter(q => {
    return selectedTopic === 'All' || q.topic === selectedTopic;
  });

  async function startTest(test) {
    try {
      setLoading(true);
      // Fetches student version of test (answerIndex stripped by server)
      const res = await api.get(`/quizzes/${test._id}`);
      setActiveTest(res.data.quiz);
      setAnswers({});
      setTestResult(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not load test.');
    } finally {
      setLoading(false);
    }
  }

  async function submitTest() {
    if (!activeTest) return;

    // Build answers array indexed by question
    const answersArray = activeTest.questions.map((_, i) =>
      answers[i] !== undefined ? answers[i] : null
    );

    const answeredCount = Object.keys(answers).length;
    if (answeredCount < activeTest.questions.length) {
      if (!confirm(`You have answered ${answeredCount} of ${activeTest.questions.length} questions. Submit anyway?`)) {
        return;
      }
    }

    try {
      setSubmitting(true);
      const res = await api.post(`/quizzes/${activeTest._id}/submit`, {
        answers: answersArray
      });
      setTestResult(res.data);
      // Refresh progress
      const pRes = await api.get('/progress');
      setProgress(pRes.data?.items || []);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit test.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="page-title">
        <div>
          <div className="eyebrow">TOPIC MASTERY · AUTOMATED ASSESSMENTS</div>
          <h1>Topic-Based Practice Tests</h1>
          <p>Choose a learning topic, test your knowledge with multiple-choice questions, and get instant explanations.</p>
        </div>
      </div>

      {activeTest ? (
        <section className="panel test-runner">
          <div className="test-header">
            <div>
              <button
                className="back-link"
                onClick={() => {
                  setActiveTest(null);
                  setTestResult(null);
                }}
              >
                ← Back to all tests
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="chip" style={{ fontSize: '11px', padding: '3px 10px' }}>{activeTest.topic}</span>
                <span className="chip selected" style={{ fontSize: '11px', padding: '3px 10px' }}>
                  {activeTest.questions?.length} QUESTIONS
                </span>
              </div>
              <h2 style={{ margin: '6px 0 2px', fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '22px' }}>{activeTest.title}</h2>
              {activeTest.description && <p className="muted" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{activeTest.description}</p>}
            </div>

            {testResult && (
              <button
                className="secondary"
                onClick={() => {
                  setAnswers({});
                  setTestResult(null);
                }}
              >
                <RotateCcw size={15} /> Retake Test
              </button>
            )}
          </div>

          {/* Results Summary Banner */}
          {testResult && (
            <div className={`result-banner ${testResult.percent >= 70 ? 'pass' : 'fail'}`}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                {testResult.percent >= 70 ? (
                  <CheckCircle2 size={24} color="var(--mint)" />
                ) : (
                  <Target size={24} color="#ea8a91" />
                )}
                <span className="eyebrow" style={{ color: 'inherit' }}>
                  {testResult.percent >= 70 ? 'TEST PASSED' : 'PRACTICE COMPLETE'}
                </span>
              </div>
              <h2>
                {testResult.score} / {testResult.total} ({testResult.percent}%)
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#a7b8cc' }}>
                {testResult.percent >= 70
                  ? 'Excellent work! You demonstrated strong mastery of this topic.'
                  : 'Keep practicing! Review the detailed question explanations below.'}
                {' · '}Attempt #{testResult.attempts} · Best Score: {testResult.bestScore}%
              </p>
            </div>
          )}

          {/* Questions List */}
          <div className="test-questions">
            {(testResult ? testResult.results : activeTest.questions).map((q, qIndex) => {
              const selectedOption = answers[qIndex];
              const isSubmitted = !!testResult;

              return (
                <div
                  key={qIndex}
                  className={`test-q-box ${
                    isSubmitted ? (q.correct ? 'result-item correct' : 'result-item incorrect') : ''
                  }`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span className="chip selected" style={{ fontSize: '10px', padding: '2px 8px', fontWeight: 800 }}>
                      QUESTION {qIndex + 1} OF {activeTest.questions.length}
                    </span>
                    {isSubmitted && (
                      <span className={`status-badge ${q.correct ? 'open' : 'closed'}`}>
                        {q.correct ? 'Correct' : 'Incorrect'}
                      </span>
                    )}
                  </div>

                  <p className="test-q-prompt">{q.prompt}</p>

                  <div className="test-options">
                    {q.options.map((opt, optIndex) => {
                      const letter = String.fromCharCode(65 + optIndex);
                      let optionClass = 'test-opt-btn';

                      if (!isSubmitted) {
                        if (selectedOption === optIndex) optionClass += ' selected';
                      } else {
                        // In review mode: highlight correct answer and student's selection
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
                          onClick={() => setAnswers(prev => ({ ...prev, [qIndex]: optIndex }))}
                        >
                          <span className="test-opt-letter">{letter}</span>
                          <span style={{ flex: 1 }}>{opt}</span>
                          {isSubmitted && optIndex === q.correctAnswerIndex && (
                            <CheckCircle2 size={16} color="var(--mint)" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Server Explanation shown after submission */}
                  {isSubmitted && q.explanation && (
                    <div className="explanation-box">
                      <b style={{ color: 'var(--mint)', display: 'block', marginBottom: '4px' }}>
                        Explanation:
                      </b>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!testResult ? (
            <div className="test-footer">
              <span style={{ fontSize: '11px', color: '#8899af' }}>
                Answered {Object.keys(answers).length} of {activeTest.questions.length} questions
              </span>
              <button
                className="primary"
                disabled={submitting}
                onClick={submitTest}
              >
                {submitting ? 'Submitting...' : 'Submit Answers'} <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '20px' }}>
              <button
                className="secondary"
                onClick={() => {
                  setActiveTest(null);
                  setTestResult(null);
                }}
              >
                ← Back to All Tests
              </button>
              <button
                className="primary"
                onClick={() => {
                  setAnswers({});
                  setTestResult(null);
                }}
              >
                <RotateCcw size={15} /> Try Test Again
              </button>
            </div>
          )}
        </section>
      ) : (
        <>
          {/* Topic Filter Chips */}
          <div style={{ marginBottom: '22px' }}>
            <div className="eyebrow" style={{ marginBottom: '8px' }}>CHOOSE A LEARNING TOPIC</div>
            <div className="filter-row">
              {distinctTopics.map(t => (
                <button
                  key={t}
                  className={`chip ${selectedTopic === t ? 'selected' : ''}`}
                  onClick={() => setSelectedTopic(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="panel empty">Loading practice tests...</div>
          ) : filteredTests.length > 0 ? (
            <div className="test-grid">
              {filteredTests.map(test => {
                const prog = progressMap[test._id] || progressMap[test.topic];
                const hasAttempted = prog && prog.attempts > 0;

                return (
                  <article className="test-card panel" key={test._id}>
                    <div className="test-card-top">
                      <span className="order-badge">{test.topic}</span>
                      {hasAttempted ? (
                        <span className="completed-pill">
                          <Award size={12} /> Best: {prog.bestScore}% ({prog.attempts} att.)
                        </span>
                      ) : (
                        <span className="tag">Not attempted</span>
                      )}
                    </div>

                    <h3 style={{ margin: '10px 0 6px', font: '700 16px Manrope' }}>{test.title}</h3>
                    <p className="muted" style={{ flex: 1, minHeight: '36px' }}>
                      {test.description || `Test your knowledge and preparation on ${test.topic}.`}
                    </p>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '16px',
                        paddingTop: '12px',
                        borderTop: '1px solid #1f2e42'
                      }}
                    >
                      <span style={{ fontSize: '10px', color: '#7f91a8' }}>
                        {test.questionCount || test.questions?.length || 0} Questions
                      </span>
                      <button className="primary" onClick={() => startTest(test)}>
                        {hasAttempted ? 'Retake Test' : 'Start Test'} <ChevronRight size={15} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty panel">
              <div className="empty-icon"><Target size={22} /></div>
              <h3>No tests found for this topic</h3>
              <p>Admins can publish new topic tests in the Admin Panel.</p>
            </div>
          )}
        </>
      )}
    </>
  );
}
