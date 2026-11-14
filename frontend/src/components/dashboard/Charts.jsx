import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import { CATEGORIES } from "../../constants";

Chart.register(...registerables);

/**
 * Creates a Chart.js chart on mount (and whenever `build` inputs change),
 * and destroys it on cleanup — the React equivalent of the old killChart().
 */
function useChart(buildConfig, deps) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const chart = new Chart(canvasRef.current, buildConfig());
    return () => chart.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return canvasRef;
}

const MONO = "'DM Mono', monospace";

export function DonutChart({ detectedCount, missingCount, percentage }) {
  const ref = useChart(
    () => ({
      type: "doughnut",
      data: {
        labels: ["Detected", "Missing"],
        datasets: [{
          data: [detectedCount, missingCount],
          backgroundColor: ["#C8410A", "#E8E0D0"],
          borderColor: ["#9B2F06", "#D6CEBC"],
          borderWidth: 2,
          hoverOffset: 6,
        }],
      },
      options: { cutout: "74%", plugins: { legend: { display: false } }, animation: { duration: 900 } },
    }),
    [detectedCount, missingCount]
  );
  return (
    <div className="donut-wrap">
      <canvas ref={ref} role="img" aria-label={`${percentage}% of skills matched`} />
      <div className="donut-center">
        <span className="donut-pct">{percentage}%</span>
        <span className="donut-label">matched</span>
      </div>
    </div>
  );
}

export function GaugeChart({ percentage }) {
  const ref = useChart(() => {
    const color = percentage >= 70 ? "#2D6A4F" : percentage >= 45 ? "#1E40AF" : percentage >= 25 ? "#B45309" : "#A8997F";
    return {
      type: "doughnut",
      data: {
        datasets: [{
          data: [percentage, 100 - percentage],
          backgroundColor: [color, "#E8E0D0"],
          borderColor: ["transparent", "transparent"],
          borderWidth: 0,
          circumference: 180,
          rotation: -90,
        }],
      },
      options: { cutout: "70%", plugins: { legend: { display: false }, tooltip: { enabled: false } }, animation: { duration: 1000 } },
    };
  }, [percentage]);
  return (
    <div className="gauge-wrap">
      <canvas ref={ref} role="img" aria-label={`Score ${percentage} out of 100`} />
      <div className="gauge-center">
        <span className="gauge-pct">{percentage}</span>
        <span className="gauge-label">/ 100</span>
      </div>
    </div>
  );
}

const PALETTE = [
  "#C8410A", "#2D6A4F", "#1E40AF", "#B45309", "#7C3AED",
  "#0F766E", "#BE123C", "#0369A1", "#92400E", "#1A4731",
  "#6D28D9", "#065F46", "#1E3A8A", "#78350F", "#5B21B6",
];

export function DetectedBarChart({ detected }) {
  const ref = useChart(() => {
    const labels = detected.length ? detected : ["No skills found"];
    return {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Detected",
          data: labels.map(() => 1),
          backgroundColor: labels.map((_, i) => PALETTE[i % PALETTE.length]),
          borderRadius: 4,
          borderSkipped: false,
        }],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: () => "  Present in resume" } } },
        scales: {
          x: { display: false, max: 1.5 },
          y: { grid: { color: "rgba(0,0,0,0.04)" }, ticks: { font: { family: MONO, size: 11 }, color: "#6B5F4E" } },
        },
        animation: { duration: 800 },
      },
    };
  }, [detected]);
  return (
    <div className="bar-wrap">
      <canvas ref={ref} role="img" aria-label="Detected skills" />
    </div>
  );
}

export function RadarChart({ detected }) {
  const ref = useChart(() => {
    const keys = Object.keys(CATEGORIES);
    const pcts = keys.map((cat) => {
      const skills = CATEGORIES[cat];
      return Math.round((skills.filter((s) => detected.includes(s)).length / skills.length) * 100);
    });
    return {
      type: "radar",
      data: {
        labels: keys,
        datasets: [{
          label: "Coverage %",
          data: pcts,
          backgroundColor: "rgba(200,65,10,0.12)",
          borderColor: "#C8410A",
          pointBackgroundColor: "#C8410A",
          pointRadius: 4,
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          r: {
            min: 0, max: 100,
            ticks: { stepSize: 25, font: { size: 10, family: MONO }, color: "#A8997F", backdropColor: "transparent" },
            grid: { color: "rgba(0,0,0,0.07)" },
            pointLabels: { font: { size: 11, family: MONO }, color: "#6B5F4E" },
            angleLines: { color: "rgba(0,0,0,0.07)" },
          },
        },
        animation: { duration: 1000 },
      },
    };
  }, [detected]);
  return (
    <div className="radar-wrap">
      <canvas ref={ref} role="img" aria-label="Skill category coverage" />
    </div>
  );
}
