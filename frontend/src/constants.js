// Same 30-skill dictionary and category map the original dashboard used.
// (The backend remains the source of truth for the analysis itself.)
export const SKILLS = [
  "Python", "Java", "C++", "JavaScript", "TypeScript", "React", "Node.js",
  "MongoDB", "SQL", "PostgreSQL", "MySQL", "AWS", "Docker", "Kubernetes",
  "Machine Learning", "Deep Learning", "Data Analysis", "HTML", "CSS", "Git",
  "Django", "Flask", "Spring", "TensorFlow", "PyTorch", "Redis", "GraphQL",
  "REST API", "Linux", "Azure",
];

export const CATEGORIES = {
  Languages: ["Python", "Java", "C++", "JavaScript", "TypeScript"],
  Frontend: ["React", "HTML", "CSS"],
  Backend: ["Node.js", "Django", "Flask", "Spring", "REST API", "GraphQL"],
  Databases: ["MongoDB", "SQL", "PostgreSQL", "MySQL", "Redis"],
  "DevOps/Cloud": ["AWS", "Docker", "Kubernetes", "Linux", "Azure", "Git"],
  "ML / Data": ["Machine Learning", "Deep Learning", "Data Analysis", "TensorFlow", "PyTorch"],
};

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // matches multer limit in backend

export const STORAGE_KEYS = {
  token: "rsa_token",
  user: "rsa_user",
  history: "rsa_history",
};
