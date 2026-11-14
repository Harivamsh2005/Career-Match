import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";
import OverviewTab from "../components/dashboard/OverviewTab";
import AnalyzerTab from "../components/dashboard/AnalyzerTab";
import HistoryTab from "../components/dashboard/HistoryTab";
import { useAuth } from "../auth";
import { STORAGE_KEYS } from "../constants";
import "../styles/dashboard.css";

const PAGE_LABELS = { overview: "Overview", analyzer: "Analyzer", history: "History" };

function loadHistory() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEYS.history) || "[]");
  } catch {
    return [];
  }
}

export default function Dashboard() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [history, setHistory] = useState(loadHistory);
  // The analysis currently shown on the Overview tab (defaults to the latest one).
  const [current, setCurrent] = useState(() => loadHistory()[0] || null);

  // dashboard.css styles `body.app-body` for the full-height app shell.
  useEffect(() => {
    document.body.classList.add("app-body");
    return () => document.body.classList.remove("app-body");
  }, []);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
  }, [history]);

  const userName = user?.name || user?.email || "User";
  const initials = userName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const goTo = (id) => {
    setTab(id);
    setSidebarOpen(false);
  };

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  function handleAnalyzed(data, fileName) {
    const entry = { ...data, fileName, date: new Date().toLocaleString() };
    setHistory((h) => [entry, ...h]);
    setCurrent(entry);
    goTo("overview");
  }

  function handleViewHistory(i) {
    setCurrent(history[i]);
    goTo("overview");
  }

  function handleClearHistory() {
    setHistory([]);
    setCurrent(null);
  }

  return (
    <>
      <Sidebar
        activeTab={tab}
        onTabChange={goTo}
        historyCount={history.length}
        userName={userName}
        initials={initials}
        onLogout={handleLogout}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="app-main">
        <Topbar
          pageLabel={PAGE_LABELS[tab]}
          userName={userName}
          initials={initials}
          onToggleSidebar={() => setSidebarOpen((o) => !o)}
        />

        {tab === "overview" && (
          <OverviewTab analysis={current} history={history} onGoToAnalyzer={() => goTo("analyzer")} />
        )}
        {tab === "analyzer" && (
          <AnalyzerTab
            token={token}
            detectedSkills={current ? current.detectedSkills : []}
            hasAnalysis={!!current}
            onAnalyzed={handleAnalyzed}
            onUnauthorized={handleLogout}
          />
        )}
        {tab === "history" && (
          <HistoryTab history={history} onView={handleViewHistory} onClear={handleClearHistory} />
        )}
      </div>
    </>
  );
}
