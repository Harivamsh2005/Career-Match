import { useRef, useState } from "react";
import Alert from "../Alert";
import SkillBadges from "./SkillBadges";
import { analyzeResume } from "../../api";
import { MAX_UPLOAD_BYTES, SKILLS } from "../../constants";

const ALLOWED_EXT = [".txt", ".pdf"];

export default function AnalyzerTab({ token, detectedSkills, hasAnalysis, onAnalyzed, onUnauthorized }) {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  function chooseFile(f) {
    if (!f) return;
    const ext = f.name.slice(f.name.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      setFile(null);
      return setError("Only TXT and PDF files are allowed.");
    }
    if (f.size > MAX_UPLOAD_BYTES) {
      setFile(null);
      return setError("File is too large. The maximum size is 5 MB.");
    }
    setFile(f);
    setError("");
  }

  async function handleAnalyze() {
    if (!file) return;
    setError("");
    setLoading(true);
    try {
      const data = await analyzeResume(file, token);
      onAnalyzed(data, file.name);
      // Reset so the same file can be picked again later.
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      if (err.status === 401) return onUnauthorized();
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="tab-content active" id="tab-analyzer">
      <div className="content-wrap">
        <div className="section-header">
          <div>
            <h1 className="section-title">Career Match</h1>
            <p className="section-sub">Upload a TXT or PDF to extract your technical skill profile.</p>
          </div>
        </div>

        <div className="analyzer-layout">
          <div className="panel upload-panel">
            <div className="panel-header">
              <span className="panel-title">📁 Upload Resume</span>
            </div>
            <div className="panel-body">
              <Alert message={error} type="error" />

              <div
                className={dragOver ? "upload-zone drag-over" : "upload-zone"}
                id="drop-zone"
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  chooseFile(e.dataTransfer.files[0]);
                }}
              >
                <input
                  ref={inputRef}
                  type="file"
                  id="resume-file"
                  accept=".txt,.pdf"
                  aria-label="Choose resume file"
                  onChange={(e) => chooseFile(e.target.files[0])}
                />
                <div className="upload-zone-inner">
                  <div className="upload-icon-box">
                    <svg viewBox="0 0 48 48" fill="none" width="36" height="36" aria-hidden="true">
                      <rect width="48" height="48" rx="10" fill="var(--accent-light)" />
                      <path d="M24 14v14M24 14l-5 5M24 14l5 5" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M14 30v2a2 2 0 002 2h16a2 2 0 002-2v-2" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="upload-title">Drop your resume here</p>
                  <p className="upload-sub">TXT or PDF &middot; max 5 MB</p>
                  <span className="upload-browse">or click to browse</span>
                </div>
              </div>

              <div className={file ? "file-selected show" : "file-selected"}>
                {file && `✓ ${file.name}  (${(file.size / 1024).toFixed(1)} KB)`}
              </div>

              <button
                className="btn btn-primary btn-full"
                id="analyze-btn"
                onClick={handleAnalyze}
                disabled={!file || loading}
              >
                <span className={loading ? "spinner show" : "spinner"} aria-hidden="true" />
                <span>{loading ? "Analyzing…" : "Analyze Resume"}</span>
              </button>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">📚 Skill Dictionary</span>
              <span className="chip chip-gray">{SKILLS.length}</span>
            </div>
            <div className="panel-body">
              <SkillBadges skills={SKILLS} detected={detectedSkills} forceState={hasAnalysis ? undefined : "idle"} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
