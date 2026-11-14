/** Renders a grid of skill badges. `detected` is a Set/array used to colour each one. */
export default function SkillBadges({ skills, detected, forceState, emptyText }) {
  if (!skills.length && emptyText) {
    return (
      <div className="skills-grid">
        <span style={{ fontSize: "0.82rem", color: "var(--ink-faint)" }}>{emptyText}</span>
      </div>
    );
  }
  const detectedSet = new Set(detected || []);
  return (
    <div className="skills-grid">
      {skills.map((s) => {
        const state = forceState || (detectedSet.has(s) ? "detected" : "missing");
        return (
          <span key={s} className={`skill-badge ${state}`}>
            {s}
          </span>
        );
      })}
    </div>
  );
}
