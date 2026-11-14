const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { MongoClient } = require("mongodb");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "resume_analyzer_secret_key_2024";
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "career_match";

// Built React app (frontend/dist). When present (single-container Docker image
// or `npm run build` locally) Express serves it; during development the Vite
// dev server serves the UI and proxies /api here instead.
const FRONTEND_DIST = process.env.FRONTEND_DIST || path.join(__dirname, "../frontend/dist");
const HAS_FRONTEND_BUILD = fs.existsSync(path.join(FRONTEND_DIST, "index.html"));

let usersCollection;

// ─── Middleware ────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
if (HAS_FRONTEND_BUILD) app.use(express.static(FRONTEND_DIST));

// Multer: memory storage for uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = ["text/plain", "application/pdf"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only TXT and PDF files are allowed."));
  },
});

// ─── Skill Dictionary ──────────────────────────────────────────────────────
const SKILLS = [
  "Python", "Java", "C++", "JavaScript", "TypeScript",
  "React", "Node.js", "MongoDB", "SQL", "PostgreSQL",
  "MySQL", "AWS", "Docker", "Kubernetes", "Machine Learning",
  "Deep Learning", "Data Analysis", "HTML", "CSS", "Git",
  "Django", "Flask", "Spring", "TensorFlow", "PyTorch",
  "Redis", "GraphQL", "REST API", "Linux", "Azure",
];

// ─── MongoDB Helpers ──────────────────────────────────────────────────────
async function connectDatabase() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  usersCollection = db.collection("users");
  await usersCollection.createIndex({ email: 1 }, { unique: true });
  console.log("✅ Connected to MongoDB:", MONGO_URI);
}

// ─── Auth Middleware ───────────────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided." });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token." });
  }
}

// ─── Routes ───────────────────────────────────────────────────────────────

// Register
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "All fields are required." });

  try {
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser)
      return res.status(409).json({ error: "Email already registered." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      name,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    await usersCollection.insertOne(newUser);
    res.status(201).json({ message: "Account created successfully." });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Failed to register user." });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required." });

  try {
    const user = await usersCollection.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials." });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials." });

    const token = jwt.sign({ id: user._id.toString(), name: user.name, email: user.email }, JWT_SECRET, { expiresIn: "2h" });
    res.json({ token, user: { name: user.name, email: user.email } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to authenticate user." });
  }
});

// Analyze Resume
app.post("/api/analyze", authMiddleware, upload.single("resume"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded." });

  let text = "";

  if (req.file.mimetype === "text/plain") {
    text = req.file.buffer.toString("utf-8");
  } else if (req.file.mimetype === "application/pdf") {
    try {
      const pdfParse = require("pdf-parse");
      const pdfData = await pdfParse(req.file.buffer);
      text = pdfData.text;
    } catch (err) {
      return res.status(500).json({ error: "Failed to parse PDF. Try uploading a TXT file." });
    }
  }

  // Keyword matching (case-insensitive)
  const textLower = text.toLowerCase();
  const detected = SKILLS.filter((skill) =>
    textLower.includes(skill.toLowerCase())
  );

  const score = detected.length;
  const total = SKILLS.length;
  const percentage = Math.round((score / total) * 100);

  // Tier label
  let tier = "Beginner";
  if (percentage >= 70) tier = "Expert";
  else if (percentage >= 45) tier = "Advanced";
  else if (percentage >= 25) tier = "Intermediate";

  res.json({
    detectedSkills: detected,
    allSkills: SKILLS,
    score,
    total,
    percentage,
    tier,
    wordCount: text.split(/\s+/).filter(Boolean).length,
  });
});

// Health check (used by Docker / orchestrators)
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Unknown API routes -> JSON 404 (instead of falling through to the SPA)
app.use("/api", (req, res) => res.status(404).json({ error: "API route not found." }));

// Catch-all: serve the React single-page app (client-side routing)
app.get("*", (req, res) => {
  if (HAS_FRONTEND_BUILD) return res.sendFile(path.join(FRONTEND_DIST, "index.html"));
  res
    .status(200)
    .send("Career Match API is running. Start the React frontend (npm run dev in /frontend) or build it (npm run build).");
});

async function startServer() {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`\n🚀 Career Match running at http://localhost:${PORT}`);
      console.log(
        HAS_FRONTEND_BUILD
          ? `   Frontend → http://localhost:${PORT}/login`
          : "   Frontend → not built (run `npm run dev` in /frontend, or `npm run build`)"
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
