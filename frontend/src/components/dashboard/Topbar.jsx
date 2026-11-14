import { ChevronIcon, MenuIcon } from "./Icons";

export default function Topbar({ pageLabel, userName, initials, onToggleSidebar }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="sidebar-toggle" onClick={onToggleSidebar} aria-label="Toggle navigation">
          <MenuIcon />
        </button>
        <div className="breadcrumb">
          <span className="breadcrumb-app">Career Match</span>
          <ChevronIcon />
          <span>{pageLabel}</span>
        </div>
      </div>
      <div className="topbar-right">
        <div className="topbar-user">
          <div className="topbar-avatar">{initials}</div>
          <span>{userName}</span>
        </div>
      </div>
    </header>
  );
}
