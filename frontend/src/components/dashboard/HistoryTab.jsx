export default function HistoryTab({ history, onView, onClear }) {
  return (
    <section className="tab-content active" id="tab-history">
      <div className="content-wrap">
        <div className="section-header">
          <div>
            <h1 className="section-title">Analysis History</h1>
            <p className="section-sub">All resumes analyzed this session.</p>
          </div>
          <button className="btn btn-ghost" onClick={onClear}>Clear All</button>
        </div>

        {history.length === 0 ? (
          <div className="overview-empty">
            <div className="empty-visual">🕐</div>
            <h3>No analyses yet</h3>
            <p>Your history will appear here after each analysis.</p>
          </div>
        ) : (
          <div className="history-list">
            {history.map((entry, i) => (
              <div className="history-card fade-up" style={{ animationDelay: `${i * 0.06}s` }} key={`${entry.date}-${i}`}>
                <div className="history-card-left">
                  <div className="history-icon">📄</div>
                  <div>
                    <p className="history-filename">{entry.fileName}</p>
                    <p className="history-date">{entry.date}</p>
                  </div>
                </div>
                <div className="history-card-right">
                  <div className="history-stat">
                    <span className="history-stat-val">{entry.score}/{entry.total}</span>
                    <span className="history-stat-label">Skills</span>
                  </div>
                  <div className="history-stat">
                    <span className="history-stat-val">{entry.percentage}%</span>
                    <span className="history-stat-label">Coverage</span>
                  </div>
                  <span className={`chip tier-${entry.tier.toLowerCase()}`}>{entry.tier}</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => onView(i)}>View →</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
