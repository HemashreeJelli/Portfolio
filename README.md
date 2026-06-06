# Hemashree Jelli // Interactive Portfolio Website

An interactive, high-fidelity portfolio website featuring an organic halftone dither aesthetic and a retro CLI/terminal theme. Designed to showcase core AI/ML, RAG, and Full-Stack software engineering projects, credentials, and diagnostics.

---

## 🎨 Core Design & Themes
The interface utilizes a custom, token-driven vanilla CSS system featuring a dynamic palette selector with four retro colorways:
* **Lavender Dither** (Default high-contrast lavender glow)
* **Cyber Amber** (Phosphor retro-terminal look)
* **Neon Matrix** (Vibrant cyber-green theme)
* **Silver Mono** (Elegant minimalist gray/silver)

---

## 🛠️ Key Features
* **Halftone Dither Backdrop**: Full-screen organic wave field rendered on a real-time canvas backdrop using coordinate hash grain noise and kinetic mouse cursor repulsion.
* **Project Deep-Dive HUD**: Stateful interactive inspector panel that dynamically displays technical details, core architectures, and links.
* **Embedded Bash CLI Terminal**: Fully functional guest shell simulator supporting interactive script triggers:
  * `help` - Lists active console scripts.
  * `about` - Retrieves professional biography specs.
  * `projects` - Prints diagnostic details for active executables.
  * `skills` - Runs capabilities metric diagnostic.
  * `clear` - Wipes console logs.
  * `name [val]`, `email [val]`, `message [val]` - Registers transmission payloads.
  * `send` - Dispatches payload to Netlify.
* **Web Audio Synth Feedback**: Procedural retro sound generation (clicks, glitch hums, beeps) synthesized directly via the browser's Web Audio API.
* **Netlify Form Integration**: Decoupled asynchronous contact form with stateful UI feedback status banners ("Sending...", "Sent", "Error").

---

## 📂 Project Directory
The portfolio showcases diagnostics for:
1. **Smart Research Workspace** — A citation-aware RAG platform utilizing FastAPI, React, ChromaDB, Groq LLMs (Llama-3.3), and Cross-Encoder reranking.
2. **RAPT: Resume Analysis & Tracking Platform** — An AI-powered recruitment engine bridging job descriptions and resumes using FastAPI, React (Vite), pgvector similarity matching, and Supabase Edge Functions (GTE embeddings).
3. **Crime Analytics & FIR Management System** — Streamlit case database and analytics system with an Oracle backend, using Scikit-Learn (Random Forest, DBSCAN, Isolation Forest) for hotspot clustering and anomalies.
4. **Semantic Search System** — High-performance semantic engine built on the 20 Newsgroups dataset combining SentenceTransformers, GMM clustering, FAISS vector indexing, and cluster-aware caching.
5. **AI-Powered Donation Platform** — Gamified micro-donation platform using OpenAI recommendations, habit-forming streaks, and sponsor-backed rewards.

