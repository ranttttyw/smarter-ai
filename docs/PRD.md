# Smarter AI — Product Requirements Document

**Version**: 0.1 (Draft)
**Author**: Ranty
**Last updated**: 2026-04

---

## 1. Problem Statement

Knowledge workers who use AI daily face a recurring friction: different models perform differently on different tasks, but manually querying multiple models and comparing outputs is slow and cognitively demanding. There's no tool that helps users *understand the differences* between model outputs — only tools that show raw outputs side by side.

## 2. Target Users

**Primary**: Chinese knowledge workers (students, analysts, content creators, PMs) who use AI assistants daily and want to get the best answer for each specific task.

**User characteristics**:
- Uses 2+ AI products regularly
- Has a sense that "different AIs are good at different things" but no systematic way to compare
- Values time — wants signal, not noise

## 3. User Stories

| As a... | I want to... | So that... |
|---|---|---|
| Knowledge worker | Send one prompt to multiple models at once | I don't have to copy-paste across tabs |
| AI power user | See a summary of *how* the answers differ | I can decide quickly without reading everything |
| Frequent user | Track which model I tend to prefer | I can build intuition about which model suits which task type |
| Job seeker | Share a live demo of this tool | Interviewers can see my PM + execution skills |

## 4. Core Features (MVP)

### 4.1 Parallel Query
- User inputs a prompt
- Selects 1–3 models from: GPT-4o, Claude 3.5, Gemini Pro, DeepSeek V3, Llama 3.1
- System queries all selected models simultaneously (parallel, not sequential)

### 4.2 Difference Summary Card
- A separate AI call (GPT-4o-mini) analyzes all responses and generates:
  - One-paragraph summary of key differences
  - 2–3 highlight chips (e.g. "Claude most concise", "GPT-4o gave code examples")
- This is the core differentiator vs. all existing tools

### 4.3 Per-Model Analysis Tags
- Auto-detected dimensions per response:
  - Length (short / medium / long)
  - Structure (bullet / paragraph / mixed)
  - Tone (formal / casual)
  - Has code / has citations / expresses uncertainty

### 4.4 One-Click Selection + Continuation
- User selects their preferred answer
- Two options: continue asking all models, or go deeper with one model

### 4.5 Preference Tracking
- Every selection recorded locally (localStorage v1)
- Dashboard shows: total comparisons, model preference distribution, recent history

## 5. Success Metrics

| Metric | Definition | Target (3 months post-launch) |
|---|---|---|
| **Selection rate** (North Star) | % of comparisons where user clicks "Choose this" | > 60% |
| Session depth | Avg number of queries per session | > 2 |
| 7-day retention | Users who return within 7 days | > 30% |
| Time-to-selection | Seconds from results appearing to user selecting | < 30s |

## 6. Competitive Landscape

| Product | Core value | Missing |
|---|---|---|
| Nat.dev | Side-by-side raw output | No analysis, no summary |
| Chatbot Arena (lmarena.ai) | Blind A/B voting, Elo leaderboard | Not for productivity, no workflow integration |
| Poe | Multi-model access hub | No comparison, no difference analysis |
| OpenRouter | API gateway for developers | Not a consumer product |
| **Smarter AI** | **Difference summary + decision support** | — |

## 7. Out of Scope (v1)

- Multi-turn conversation mode
- Image / multimodal inputs
- Team / collaboration features
- Custom model fine-tuning
- Mobile app

## 8. Open Questions

- [ ] Should analysis be done by a separate AI call (adds latency ~1s) or rule-based (fast but shallow)?
- [ ] How do we handle models that time out or return errors gracefully?
- [ ] Should preference data sync across devices (requires auth)?
