# Smarter AI — Multi-Model Response Comparator

> Ask once. Compare all. Choose the best.

Smarter AI lets you send a single prompt to multiple LLMs simultaneously (GPT-4o, Claude 3.5, Gemini Pro, DeepSeek V3), then surfaces a smart **difference summary** — so you spend less time reading and more time deciding.

---

## Why this exists

Most people use only one AI model, not because it's the best for every task, but because switching between tabs is friction. Smarter AI removes that friction by running your query in parallel across models and highlighting *what's actually different* between their answers.

---

## Core Features

| Feature | Description |
|---|---|
| ⚡ Parallel querying | Sends your prompt to up to 3 models simultaneously |
| 🔍 Difference summary | AI-generated analysis of *how* models differ, not just what they say |
| 📊 Style analysis | Detects length, structure, tone, and information density per model |
| ✅ One-click selection | Choose the answer you want, then continue in that model or ask all again |
| 📈 Preference tracking | Tracks which models you've favored over time (stored locally) |

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | HTML / CSS / Vanilla JS (prototype) → React (v2) |
| Backend | Node.js + Express |
| AI APIs | OpenAI, Anthropic, Google Gemini |
| Analysis | GPT-4o-mini meta-prompt for difference summarization |
| Storage | localStorage (v1) → Supabase (v2) |
| Deploy | Vercel (frontend) + Railway (backend) |

---

## Project Status

- [x] Phase 0 — Repo setup & project structure
- [ ] Phase 1 — Real API integration (backend)
- [ ] Phase 2 — Smart analysis layer
- [ ] Phase 3 — Frontend upgrade (real API calls + streaming)
- [ ] Phase 4 — Preference recording (backend persistence)
- [ ] Phase 5 — Deployment
- [ ] Phase 6 — Product documentation (PRD, user stories, metrics)

---

## Getting Started (local)

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/smarter-ai.git
cd smarter-ai

# Backend
cd backend
cp .env.example .env        # Add your API keys here
npm install
npm run dev                 # Runs on http://localhost:3001

# Frontend (in a new terminal)
cd ../frontend
open index.html             # Or use Live Server in VS Code
```

---

## Folder Structure

```
smarter-ai/
├── frontend/
│   ├── public/             # Static assets
│   └── src/                # JS / CSS source
├── backend/
│   └── src/                # Express routes, API clients
├── docs/
│   └── PRD.md              # Product requirements document
├── .gitignore
└── README.md
```

---

## Product Context

This project was designed using a PM-first approach:

- **Target user**: Knowledge workers who use AI daily and want to pick the right model for each task
- **Core metric**: Selection rate (% of comparisons where user actively chooses a model)
- **Key differentiator**: Difference summary layer — competitors (Nat.dev, Poe, Chatbot Arena) show raw outputs side-by-side; Smarter AI tells you *what's actually different*

See [`docs/PRD.md`](./docs/PRD.md) for full product requirements.

---

## Author

Built by Ranty — System Engineering MS student, aspiring AI PM.
