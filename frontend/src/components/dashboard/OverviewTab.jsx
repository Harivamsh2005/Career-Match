import SkillBadges from "./SkillBadges";
import { DetectedBarChart, DonutChart, GaugeChart, RadarChart } from "./Charts";

function bestOf(history) {
  return history.reduce((a, b) => (a.percentage > b.percentage ? a : b));
}

export default function OverviewTab({ analysis, history, onGoToAnalyzer }) {
  const best = history.length ? bestOf(history) : null;
  const detected = analysis ? analysis.detectedSkills : [];
  const missing = analysis ? analysis.allSkills.filter((s) => !detected.includes(s)) : [];

  return (
    <section className="tab-content active" id="tab-overview">
      <div className="content-wrap">
        <div className="section-header">
          <div>
            <h1 className="section-title">Overview</h1>
            <p className="section-sub">Your latest resume analysis at a glance.</p>
          </div>
          <button className="btn btn-accent" onClick={onGoToAnalyzer}>+ New Analysis</button>
        </div>

        {/* KPI strip */}
        <div className="kpi-strip">
          <div className="kpi-card">
            <div className="kpi-icon kpi-orange">📄</div>
            <div className="kpi-body">
              <span className="kpi-value">{history.length}</span>
              <span className="kpi-label">Analyses Run</span>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon kpi-blue">🎯</div>
            <div className="kpi-body">
              <span className="kpi-value">{best ? `${best.percentage}%` : "—"}</span>
              <span className="kpi-label">Best Score</span>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon kpi-green">✅</div>
            <div className="kpi-body">
              <span className="kpi-value">{best ? best.score : "—"}</span>
              <span className="kpi-label">Skills Found</span>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon kpi-amber">🏆</div>
            <div className="kpi-body">
              <span className="kpi-value">{best ? best.tier : "—"}</span>
              <span className="kpi-label">Best Tier</span>
            </div>
          </div>
        </div>

        {!analysis ? (
          <div className="overview-empty">
            <div className="empty-visual">📊</div>
            <h3>No data yet</h3>
            <p>Run your first analysis to see charts and insights.</p>
            <button className="btn btn-accent" onClick={onGoToAnalyzer}>Analyze a Resume →</button>
          </div>
        ) : (
          <>
            <div className="charts-grid">
              <div className="chart-card chart-card--sm">
                <div className="chart-card-header">
                  <span className="chart-title">Skill Coverage</span>
                  <span className="chart-sub">{detected.length} / {analysis.total}</span>
                </div>
                <DonutChart detectedCount={detected.length} missingCount={missing.length} percentage={analysis.percentage} />
              </div>

              <div className="chart-card chart-card--sm">
                <div className="chart-card-header">
                  <span className="chart-title">Score Meter</span>
                  <span className={`chip tier-${analysis.tier.toLowerCase()}`}>{analysis.tier}</span>
                </div>
                <GaugeChart percentage={analysis.percentage} />
              </div>

              <div className="chart-card chart-card--wide">
                <div className="chart-card-header">
                  <span className="chart-title">Detected Skills</span>
                  <span className="chart-sub">{detected.length} skills detected</span>
                </div>
                <DetectedBarChart detected={detected} />
              </div>

              <div className="chart-card chart-card--wide">
                <div className="chart-card-header">
                  <span className="chart-title">Category Radar</span>
                  <span className="chart-sub">skill domain coverage</span>
                </div>
                <RadarChart detected={detected} />
              </div>
            </div>

            <div className="breakdown-section">
              <div className="breakdown-cols">
                <div className="panel">
                  <div className="panel-header">
                    <span className="panel-title">✅ Detected Skills</span>
                    <span className="chip chip-green">{detected.length}</span>
                  </div>
                  <div className="panel-body">
                    <SkillBadges skills={detected} forceState="detected" emptyText="None detected." />
                  </div>
                </div>
                <div className="panel">
                  <div className="panel-header">
                    <span className="panel-title">❌ Missing Skills</span>
                    <span className="chip chip-gray">{missing.length}</span>
                  </div>
                  <div className="panel-body">
                    <SkillBadges skills={missing} forceState="missing" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
