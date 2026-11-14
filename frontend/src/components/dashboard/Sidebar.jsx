import { AnalyzerIcon, HistoryIcon, LogoutIcon, OverviewIcon } from "./Icons";

const NAV = [
  { id: "overview", label: "Overview", Icon: OverviewIcon },
  { id: "analyzer", label: "Analyzer", Icon: AnalyzerIcon },
  { id: "history", label: "History", Icon: HistoryIcon },
];

export default function Sidebar({ activeTab, onTabChange, historyCount, userName, initials, onLogout, open, onClose }) {
  return (
    <>
      <aside className={open ? "sidebar open" : "sidebar"} id="sidebar">
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <div className="brand-icon">CM</div>
            <div className="brand-text">
              <span className="brand-name">Career Match</span>
              <span className="brand-sub">v2.0</span>
            </div>
          </div>

          <nav className="sidebar-nav" aria-label="Dashboard">
            {NAV.map(({ id, label, Icon }) => (
              <button
                key={id}
                className={activeTab === id ? "nav-item active" : "nav-item"}
                aria-current={activeTab === id ? "page" : undefined}
                onClick={() => onTabChange(id)}
              >
                <Icon />
                {label}
                {id === "history" && <span className="nav-badge">{historyCount}</span>}
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="avatar">{initials}</div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{userName}</span>
              <span className="sidebar-user-role">Candidate</span>
            </div>
          </div>
          <button className="sidebar-logout" onClick={onLogout}>
            <LogoutIcon />
            Sign Out
          </button>
        </div>
      </aside>
      <div className={open ? "sidebar-backdrop show" : "sidebar-backdrop"} onClick={onClose} aria-hidden="true" />
    </>
  );
}
