// Thin wrapper around the existing Node.js REST API.
// Requests use relative URLs (/api/...) so they work through the Vite dev
// proxy, the Docker image, or any reverse proxy. Set VITE_API_URL to point
// at a backend on a different origin.
const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request(path, options = {}, fallbackMessage = "Request failed.") {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, options);
  } catch {
    throw new ApiError("Cannot reach the server. Please check your connection and try again.", 0);
  }

  // The backend answers with JSON; guard against HTML/empty error bodies.
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON body */
  }

  if (!res.ok) {
    throw new ApiError((data && data.error) || fallbackMessage, res.status);
  }
  return data;
}

const jsonPost = (path, body, fallback) =>
  request(
    path,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    fallback
  );

export const loginUser = (email, password) =>
  jsonPost("/api/login", { email, password }, "Login failed.");

export const registerUser = (name, email, password) =>
  jsonPost("/api/register", { name, email, password }, "Registration failed.");

export function analyzeResume(file, token) {
  const fd = new FormData();
  fd.append("resume", file);
  return request(
    "/api/analyze",
    { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd },
    "Analysis failed."
  );
}
