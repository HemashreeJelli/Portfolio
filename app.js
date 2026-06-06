/**
 * -------------------------------------------------------------
 * CORE APPLICATION CONTROLLER
 * Minimalist Interactive Dither Portfolio - Hemashree Jelli
 * ------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  
  /* ==========================================
   * SYSTEM CONSTANTS & CONFIGURATIONS
   * ========================================== */
  let activeTab = "hero";
  let currentTheme = "lavender";
  let audioMuted = false;
  let audioCtx = null;
  
  // Mouse coordinates trackers
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let targetMouseX = mouseX;
  let targetMouseY = mouseY;
  
  /* ==========================================
   * WEB AUDIO SYNTHESIS MODULE (Click / Glitch hums)
   * ========================================== */
  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  function playSynthSound(freq, type = "sine", duration = 0.05, volume = 0.08) {
    if (audioMuted) return;
    try {
      initAudio();
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }
      
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      
      gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
      
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn("Synth audio error:", e);
    }
  }

  const soundClick = () => playSynthSound(1000, "triangle", 0.04, 0.05);
  const soundBeep = () => playSynthSound(600, "square", 0.08, 0.04);
  const soundHover = () => playSynthSound(1400, "sine", 0.02, 0.02);
  const soundGlitch = () => playSynthSound(Math.random() * 200 + 80, "sawtooth", 0.15, 0.06);

  function addAudioFeedback() {
    const clickables = document.querySelectorAll("a, button, select, input, textarea, .project-card, .term-macro-btn");
    clickables.forEach(elem => {
      elem.addEventListener("mouseenter", () => {
        soundHover();
      });
      elem.addEventListener("click", () => {
        soundClick();
      });
    });
  }

  // Audio Toggle Switch
  const audioBtn = document.getElementById("audio-toggle");
  if (audioBtn) {
    audioBtn.addEventListener("click", () => {
      audioMuted = !audioMuted;
      if (!audioMuted) {
        initAudio();
        audioBtn.classList.add("fill-btn");
        audioBtn.querySelector(".audio-icon").textContent = "🔊";
        audioBtn.querySelector(".audio-label").textContent = "ACTIVE";
        soundBeep();
      } else {
        audioBtn.classList.remove("fill-btn");
        audioBtn.querySelector(".audio-icon").textContent = "🔈";
        audioBtn.querySelector(".audio-label").textContent = "MUTE";
      }
    });
  }

  /* ==========================================
   * SILENT MINIMALIST LOADER SCREEN
   * ========================================== */
  const loaderScreen = document.getElementById("loader-screen");
  const loaderProgress = document.getElementById("loader-progress");
  const loaderPercentage = document.getElementById("loader-percentage");
  
  let loaderVal = 0;
  let loaderInterval = null;

  function runSilentLoader() {
    loaderInterval = setInterval(() => {
      loaderVal += Math.floor(Math.random() * 5) + 2;
      
      if (loaderVal >= 100) {
        loaderVal = 100;
        clearInterval(loaderInterval);
        setTimeout(fadeLoaderOut, 300);
      }
      
      loaderProgress.style.width = loaderVal + "%";
      loaderPercentage.textContent = String(loaderVal).padStart(2, "0") + "%";
    }, 70);
  }

  function fadeLoaderOut() {
    loaderScreen.style.opacity = "0";
    loaderScreen.style.transform = "scale(0.98)";
    loaderScreen.style.transition = "all 0.5s cubic-bezier(0.1, 0.8, 0.2, 1)";
    
    setTimeout(() => {
      loaderScreen.classList.add("hidden-element");
      document.getElementById("app-wrapper").classList.remove("hidden-element");
      
      resizeBackgroundCanvas();
      animateSkillBars();
      addAudioFeedback();
    }, 500);
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !loaderScreen.classList.contains("hidden-element")) {
      clearInterval(loaderInterval);
      fadeLoaderOut();
    }
  });

  runSilentLoader();

  /* ==========================================
   * COHESIVE PALETTE SWITCHER
   * ========================================== */
  const themeSelector = document.getElementById("matrix-theme-selector");
  if (themeSelector) {
    themeSelector.addEventListener("change", (e) => {
      currentTheme = e.target.value;
      document.documentElement.setAttribute("data-theme", currentTheme);
      soundBeep();
    });
  }

  /* ==========================================
   * FULL-SCREEN ORGANIC ORDERED DITHER WAVES
   * Real-Time Viewport-wide Backdrop (Subtle Step = 6px Restored)
   * ========================================== */
  const bgCanvas = document.getElementById("dither-canvas");
  const bgCtx = bgCanvas.getContext("2d");
  
  function resizeBackgroundCanvas() {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
  }
  
  window.addEventListener("resize", resizeBackgroundCanvas);
  resizeBackgroundCanvas(); // Set initial canvas size immediately!
  
  window.addEventListener("mousemove", (e) => {
    targetMouseX = e.clientX;
    targetMouseY = e.clientY;
  });

  const bayerThresholdMap = [
    [ 1,  9,  3, 11],
    [13,  5, 15,  7],
    [ 4, 12,  2, 10],
    [16,  8, 14,  6]
  ];

  function renderBackgroundMatrix() {
    bgCtx.globalAlpha = 1.0; // Reset alpha for clearing background
    bgCtx.fillStyle = "#000000";
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
    
    // Smoothly track mouse coordinates
    mouseX += (targetMouseX - mouseX) * 0.1;
    mouseY += (targetMouseY - mouseY) * 0.1;
    
    const time = performance.now() * 0.0006;
    const step = 7; // Denser step size for high-fidelity halftone dither textures
    
    const w = bgCanvas.width;
    const h = bgCanvas.height;
    
    // Dynamic palette fill color
    let activeColor = "#a2a7f5";
    if (currentTheme === "amber") activeColor = "#ffb356";
    else if (currentTheme === "matrix") activeColor = "#00ff66";
    else if (currentTheme === "silver") activeColor = "#f3f4f6";

    bgCtx.fillStyle = activeColor;
    bgCtx.globalAlpha = 0.95; // Reduce dither color intensity/opacity by 5%
    
    const repulsionRadius = 260; // The threshold range where the cursor pushes the dots
    
    for (let y = 0; y < h; y += step) {
      const ny = y * 0.005;
      
      for (let x = 0; x < w; x += step) {
        const nx = x * 0.005;
        
        // 1. Calculate baseline organic wave field over the entire screen using multi-frequency chaotic waves to break periodic patterns
        let val = Math.sin(nx * 1.7 + time * 1.1) * Math.cos(ny * 1.3 - time * 0.8) * 0.35 + 
                  Math.sin(nx * 0.8 - ny * 1.4 + time * 1.4) * 0.25 + 
                  Math.cos(nx * 2.2 + ny * 1.9 - time * 0.6) * 0.15 + 
                  Math.sin((nx - ny) * 0.5 + time * 1.8) * 0.2 + 0.22;
                  
        // 2. Add high-fidelity coordinate hash grain noise to break grid structures completely
        const rand = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        const noise = rand - Math.floor(rand);
        val += (noise - 0.5) * 0.16;
        
        // 3. Compute grid distance from the mouse cursor
        const dx = x - mouseX;
        const dy = y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        let drawX = x;
        let drawY = y;
        
        // 4. Apply kinetic repulsion: push dots away elastically so they cluster around the cursor without fading away
        if (dist < repulsionRadius && dist > 0) {
          const force = (repulsionRadius - dist) / repulsionRadius;
          
          // Coordinate space distortion: slide the dots away from the cursor dramatically (up to 75px)
          const pushDist = force * 75; 
          drawX += (dx / dist) * pushDist;
          drawY += (dy / dist) * pushDist;
          
          // Gentle core fading only at the very center of the cursor (dist < 45px) to keep a clear pointer bubble
          if (dist < 45) {
            val *= (dist / 45);
          }
        }
        
        // 5. Apply soft radial center-of-screen fade to maximize text readability
        const dxCenter = drawX - w / 2;
        const dyCenter = drawY - h / 2;
        const distToCenter = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter);
        const maxDist = Math.sqrt((w * w) / 4 + (h * h) / 4);
        const normDist = distToCenter / maxDist;
        
        // Soft vignette: scale dot size down near the center (scale ranges from 0.7 to 1.0 for a very subtle fade)
        const centerScale = 0.7 + 0.3 * Math.pow(normDist, 1.6);
        val *= centerScale;
        
        if (val < 0) val = 0;
        if (val > 1) val = 1;
        
        if (val > 0.04) {
          // Draw halftone circle centered at the distorted coordinate position
           const maxRadius = step * 0.67;
          const dotRadius = val * maxRadius;
          
          bgCtx.beginPath();
          bgCtx.arc(drawX + step / 2, drawY + step / 2, dotRadius, 0, Math.PI * 2);
          bgCtx.fill();
        }
      }
    }
    
    requestAnimationFrame(renderBackgroundMatrix);
  }
  
  renderBackgroundMatrix();

  /* ==========================================
   * SYSTEM NAVIGATION SECTION SWITCHER
   * ========================================== */
  const navItems = document.querySelectorAll(".nav-item");
  const sections = document.querySelectorAll(".workspace-section");

  navItems.forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const targetTab = item.getAttribute("data-tab");
      
      if (targetTab === activeTab) return;
      
      navItems.forEach(nav => nav.classList.remove("active-nav"));
      item.classList.add("active-nav");
      
      sections.forEach(section => {
        section.classList.remove("active-section");
        if (section.getAttribute("id") === targetTab) {
          section.classList.add("active-section");
        }
      });
      
      activeTab = targetTab;
      
      // Reset scroll position of the workspace container to the top when switching tabs
      const workspace = document.querySelector(".system-workspace");
      if (workspace) {
        workspace.scrollTop = 0;
      }
      window.scrollTo(0, 0);
      
      if (activeTab === "about") {
        animateSkillBars();
      }
    });
  });

  // Enforce window-level scroll lock to prevent layout shifts (e.g. navigation header moving up)
  window.addEventListener("scroll", () => {
    if (window.scrollY !== 0) {
      window.scrollTo(0, 0);
    }
  });

  document.querySelectorAll(".nav-trigger").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-target");
      const matchedNav = document.querySelector(`.nav-item[data-tab="${target}"]`);
      if (matchedNav) matchedNav.click();
    });
  });

  /* ==========================================
   * CAPABILITIES METERS ANIMATION
   * ========================================== */
  function animateSkillBars() {
    const skillBars = document.querySelectorAll(".skill-bar-fill");
    skillBars.forEach(bar => {
      bar.style.width = "0%";
      const percentage = bar.getAttribute("data-percentage");
      
      setTimeout(() => {
        bar.style.width = percentage + "%";
      }, 150);
    });
  }

  /* ==========================================
   * HERO TYPEWRITER SYSTEM
   * ========================================== */
  const typewriterElement = document.getElementById("typewriter-text");
  const typewriterPhrases = [
    "AI/ML RESEARCH INTERN",
    "FULL-STACK DEVELOPER",
    "DATA SCIENTIST",
    "BIOINFORMATICS RESEARCHER"
  ];
  let phraseIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let typewriterDelay = 120;

  function runTypewriter() {
    if (!typewriterElement) return;
    const currentPhrase = typewriterPhrases[phraseIdx];
    
    if (isDeleting) {
      typewriterElement.textContent = currentPhrase.substring(0, charIdx - 1);
      charIdx--;
      typewriterDelay = 60;
    } else {
      typewriterElement.textContent = currentPhrase.substring(0, charIdx + 1);
      charIdx++;
      typewriterDelay = 100 + Math.random() * 50;
    }

    if (!isDeleting && charIdx === currentPhrase.length) {
      typewriterDelay = 1800;
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      phraseIdx = (phraseIdx + 1) % typewriterPhrases.length;
      typewriterDelay = 400;
    }

    setTimeout(runTypewriter, typewriterDelay);
  }

  if (typewriterElement) {
    setTimeout(runTypewriter, 1800);
  }

  /* ==========================================
   * PROJECTS EXECUTABLE GRID INSPECTOR HUD (Procedural Visualizer Loops)
   * ========================================== */
  const projectCards = document.querySelectorAll(".project-card");
  const projectInspector = document.getElementById("project-inspector");
  const closeInspectorBtn = document.getElementById("close-inspector-btn");
  
  const inspectTech = document.getElementById("inspect-tech");
  const inspectImpact = document.getElementById("inspect-impact");
  const inspectFullDesc = document.getElementById("inspect-full-desc");
  const inspectSourceLink = document.getElementById("inspect-source-link");
  const inspectLiveLink = document.getElementById("inspect-live-link");
  
  const inspectorCanvas = document.getElementById("inspector-canvas");
  const inspectorImage = document.getElementById("inspector-image");
  let inspectCtx = null;
  if (inspectorCanvas) {
    inspectCtx = inspectorCanvas.getContext("2d");
  }
  
  const projectDatabase = [
    {
      tech: "FastAPI, React, ChromaDB, Groq SDK",
      impact: "Metadata-based source attribution & query rewriting",
      desc: "<strong>SMART RESEARCH WORKSPACE</strong><br><br>A high-performance, citation-aware Retrieval-Augmented Generation (RAG) platform designed for semantic search and conversational QA over uploaded research papers and PDF documents.<br><br><strong>Key Features & Pipeline:</strong><br>• <strong>Document Parsing & Ingestion:</strong> Automatically extracts, cleans, and indexes PDF contents into a ChromaDB vector store while filtering OCR noise and bibliography boilerplate.<br>• <strong>Two-Stage Reranked Retrieval:</strong> Queries 15 candidate vector chunks and applies a high-precision Cross-Encoder model (<code>ms-marco-MiniLM-L-6-v2</code>) to select the top 5 most relevant contexts.<br>• <strong>Conversational Context Rewriter:</strong> Utilizes Groq LLM (<code>llama-3.3-70b-versatile</code>) to rewrite follow-up conversational questions into self-contained search queries.<br>• <strong>Citation-Aware Answers:</strong> Generates detailed, structured answers referencing specific document sources and page numbers.<br><br><strong>API & Infrastructure:</strong><br>Features a FastAPI backend exposing document upload, deletion, library stats, and QA endpoints, with a modern glassmorphic React dashboard. Fully containerized and orchestrated via Docker and Docker Compose.",
      source: "https://github.com/HemashreeJelli/InsightAI",
      live: null,
      type: null
    },
    {
      tech: "React, FastAPI, Supabase, GTE / pgvector",
      impact: "Cosine similarity ranking of candidate profiles & jobs",
      desc: "<strong>RAPT: RESUME ANALYSIS & TRACKING PLATFORM</strong><br><br>A sophisticated, AI-powered recruitment and candidate-job matching system utilizing semantic vector search to pair recruiter job descriptions with candidate resumes based on skill relevance.<br><br><strong>Core Architecture & Features:</strong><br>• <strong>Distributed System Design:</strong> Decoupled backend architecture combining FastAPI for role-based recruiter routes with Supabase Edge Functions for fast AI processing.<br>• <strong>Semantic Embedding Engine:</strong> Uses a lightweight GTE-small Transformer model to map resume and job description text into 384-dimensional dense semantic vectors.<br>• <strong>Vector DB Similarity Matching:</strong> Computes Cosine Similarity scores over unstructured resume data via pgvector extensions on a unified PostgreSQL database.<br>• <strong>Recruiter & Candidate Portals:</strong> Features applicant screening, gap analysis, dynamic SVG resume health indicators, and role-restricted routing on a sleek glassmorphic React Vite dashboard.",
      source: "https://github.com/HemashreeJelli/RAPT-Resume-Analysis-Tracking-Platform",
      live: "https://rapt-delta.vercel.app/",
      type: null
    },
    {
      tech: "Streamlit, Oracle DB, Scikit-Learn, ML Pipeline",
      impact: "Hotspot prediction (DBSCAN) & anomaly detection (Isolation Forest)",
      desc: "<strong>CRIME ANALYTICS & FIR MANAGEMENT SYSTEM</strong><br><br>A modular crime management and analytics pipeline designed to simulate an end-to-end FIR (First Information Report) workflow using synthetically generated crime data.<br><br><strong>Core Architecture & Features:</strong><br>• <strong>Streamlit Dashboard:</strong> Real-time visualization interface mapping spatial crime densities (KDE) and managing complaint registries, assignments, and evidence logs.<br>• <strong>Oracle Database Integration:</strong> Features robust connection pools linking case management modules directly to a relational Oracle schema.<br>• <strong>Machine Learning Analytics:</strong> Combines Random Forest classifiers for crime type/severity predictions with Isolation Forests for automated anomaly detection.<br>• <strong>Spatial Hotspot Clustering:</strong> Uses unsupervised DBSCAN and K-Means algorithms to discover spatial density patterns and predict crime hotspots.",
      source: "https://github.com/HemashreeJelli/Crime-Analytics-FIR-Management-System",
      live: null,
      type: null
    },
    {
      tech: "FastAPI, FAISS, SentenceTransformers, Docker",
      impact: "GMM cluster-aware caching & fast Top-K FAISS indexing",
      desc: "<strong>SEMANTIC SEARCH SYSTEM</strong><br><br>A high-performance semantic search engine built on the 20 Newsgroups dataset that integrates deep learning embeddings with classical statistical clustering and vector databases for optimized document retrieval.<br><br><strong>Key Features & Pipeline:</strong><br>• <strong>Embedding & PCA:</strong> Converts text to 384-dimensional dense vectors using SentenceTransformers, then reduces dimensionality to 50 dimensions via PCA for compact cluster separation.<br>• <strong>Fuzzy GMM Clustering:</strong> Applies a Gaussian Mixture Model to predict semantic cluster probabilities for incoming queries.<br>• <strong>Cluster-Aware Semantic Cache:</strong> Intercepts queries using a cluster-scoped cache, significantly accelerating repeat or highly similar searches.<br>• <strong>FAISS Indexing:</strong> Queries that miss the cache trigger an optimized Top-K similarity search using a FAISS vector index, returning the closest document matches.<br><br><strong>API & Infrastructure:</strong><br>Exposes FastAPI REST endpoints including <code>POST /query</code> (semantic search with cache status), <code>GET /cache/stats</code> (hit/miss rate logging), and <code>DELETE /cache</code> (in-memory wipe). Fully containerized using Docker and orchestrated with Docker Compose for reproducible deployments.",
      source: "https://github.com/HemashreeJelli/Semantic-search-system",
      live: null,
      type: null
    },
    {
      tech: "React.js, Node.js, PostgreSQL, OpenAI",
      impact: "Gamified micro-donations with AI recommendation loops",
      desc: "<strong>AI-POWERED DONATION PLATFORM</strong><br><br>A habit-forming micro-donation platform designed to make charitable giving frictionless, consistent, and rewarding through personalization and gamification.<br><br><strong>Core Architecture & Features:</strong><br>• <strong>AI-Driven Personalization:</strong> Leverages OpenAI and OpenRouter models to suggest charities based on user interest profiles, current seasonal events, or urgent global crises, building adaptive giving plans that resonate emotionally.<br>• <strong>Gamification Engine:</strong> Integrates a custom point accumulation system and user leaderboards to reward consistent donors with sponsored coupons, badges, and milestones.<br>• <strong>Habit Loops & Streaks:</strong> Encourages long-term giving through weekly/monthly streaks, smart push notifications (\"Your streak is alive! You just unlocked 7 days of kindness\"), and impact celebration cues.<br>• <strong>Recurring Comfort Budgeting:</strong> Implements secure auto-deduction pipelines for monthly micro-donations configured to a user-defined comfort cap.",
      source: "https://github.com/HemashreeJelli/AI-powered-Donation-Website-NIVA-",
      live: null,
      type: null
    }
  ];

  let inspectorAnimId = null;
  let inspectorFrameCount = 0;

  projectCards.forEach(card => {
    card.addEventListener("click", () => {
      const projIndex = parseInt(card.getAttribute("data-project"));
      const data = projectDatabase[projIndex];
      
      if (inspectTech) inspectTech.textContent = data.tech;
      if (inspectImpact) inspectImpact.textContent = data.impact;
      if (inspectFullDesc) inspectFullDesc.innerHTML = data.desc;
      
      if (inspectSourceLink) {
        if (data.source) {
          inspectSourceLink.style.display = "";
          inspectSourceLink.href = data.source;
        } else {
          inspectSourceLink.style.display = "none";
        }
      }
      
      if (inspectLiveLink) {
        if (data.live) {
          inspectLiveLink.style.display = "";
          inspectLiveLink.href = data.live;
        } else {
          inspectLiveLink.style.display = "none";
        }
      }
      
      if (projectInspector) {
        projectInspector.classList.remove("hidden-element");
        
        if (data.type) {
          if (inspectorCanvas && inspectorCanvas.parentNode) {
            inspectorCanvas.parentNode.style.display = "";
          }
          
          if (data.type === "image") {
            if (inspectorCanvas) inspectorCanvas.classList.add("hidden-element");
            if (inspectorImage) {
              inspectorImage.classList.remove("hidden-element");
              inspectorImage.src = data.image + "?v=49.0";
            }
            if (inspectorAnimId) {
              cancelAnimationFrame(inspectorAnimId);
              inspectorAnimId = null;
            }
          } else {
            if (inspectorCanvas) inspectorCanvas.classList.remove("hidden-element");
            if (inspectorImage) inspectorImage.classList.add("hidden-element");
            
            // Reset canvas size inside bounds
            inspectorCanvas.width = inspectorCanvas.parentNode.clientWidth;
            inspectorCanvas.height = inspectorCanvas.parentNode.clientHeight;
            
            if (inspectorAnimId) {
              cancelAnimationFrame(inspectorAnimId);
            }
            
            runInspectorVisualizer(data.type);
          }
        } else {
          if (inspectorCanvas && inspectorCanvas.parentNode) {
            inspectorCanvas.parentNode.style.display = "none";
          }
          if (inspectorImage) {
            inspectorImage.classList.add("hidden-element");
            inspectorImage.src = "";
          }
          if (inspectorAnimId) {
            cancelAnimationFrame(inspectorAnimId);
            inspectorAnimId = null;
          }
        }
        
        projectInspector.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      
      soundGlitch();
    });
  });

  if (closeInspectorBtn) {
    closeInspectorBtn.addEventListener("click", () => {
      if (projectInspector) {
        projectInspector.classList.add("hidden-element");
      }
      if (inspectorImage) {
        inspectorImage.classList.add("hidden-element");
        inspectorImage.src = "";
      }
      if (inspectorAnimId) {
        cancelAnimationFrame(inspectorAnimId);
        inspectorAnimId = null;
      }
      soundBeep();
    });
  }

  function runInspectorVisualizer(type) {
    if (!inspectCtx) return;
    
    inspectCtx.clearRect(0, 0, inspectorCanvas.width, inspectorCanvas.height);
    inspectorFrameCount++;
    
    const w = inspectorCanvas.width;
    const h = inspectorCanvas.height;
    
    let activeColor = "#a2a7f5";
    if (currentTheme === "amber") activeColor = "#ffb356";
    else if (currentTheme === "matrix") activeColor = "#00ff66";
    else if (currentTheme === "silver") activeColor = "#f3f4f6";

    inspectCtx.fillStyle = "#000000";
    inspectCtx.fillRect(0, 0, w, h);
    
    inspectCtx.strokeStyle = activeColor;
    inspectCtx.fillStyle = activeColor;
    inspectCtx.lineWidth = 1;

    switch (type) {
      case "matrix_rain":
        inspectCtx.font = "8px monospace";
        inspectCtx.globalAlpha = 0.35;
        const cols = Math.ceil(w / 12);
        for (let i = 0; i < cols; i++) {
          const colX = i * 12 + 6;
          const offset = (Math.sin(inspectorFrameCount * 0.05 + i) * 0.5 + 0.5) * h;
          for (let j = 0; j < 5; j++) {
            const charY = (offset + j * 12) % h;
            const randChar = String.fromCharCode(33 + Math.floor(Math.random() * 93));
            inspectCtx.fillText(randChar, colX, charY);
          }
        }
        break;

      case "audio_wave":
        inspectCtx.beginPath();
        for (let x = 0; x < w; x++) {
          const angle = (x / w) * Math.PI * 6 + inspectorFrameCount * 0.08;
          const y = h / 2 + Math.sin(angle) * 35 * Math.sin(inspectorFrameCount * 0.02);
          if (x === 0) inspectCtx.moveTo(x, y);
          else inspectCtx.lineTo(x, y);
        }
        inspectCtx.stroke();
        
        inspectCtx.globalAlpha = 0.5;
        for (let x = 0; x < w; x += 16) {
          const angle = (x / w) * Math.PI * 6 + inspectorFrameCount * 0.08;
          const y = h / 2 + Math.sin(angle) * 35 * Math.sin(inspectorFrameCount * 0.02);
          inspectCtx.fillRect(x - 2, y - 2, 4, 4);
        }
        break;

      case "procedural_grid":
        const lines = 10;
        const horizonY = h * 0.35;
        for (let i = 0; i < lines; i++) {
          const progress = i / lines;
          const scaleY = horizonY + (h - horizonY) * Math.pow(progress, 2.5);
          inspectCtx.globalAlpha = progress * 0.5;
          inspectCtx.beginPath();
          inspectCtx.moveTo(0, scaleY);
          inspectCtx.lineTo(w, scaleY);
          inspectCtx.stroke();
        }
        const rays = 12;
        const centerX = w / 2;
        for (let i = 0; i <= rays; i++) {
          const rayProgress = i / rays;
          const targetX = rayProgress * w;
          inspectCtx.globalAlpha = 0.35;
          inspectCtx.beginPath();
          inspectCtx.moveTo(centerX, horizonY);
          inspectCtx.lineTo(targetX, h);
          inspectCtx.stroke();
        }
        break;

      case "swarm_flock":
        const boidsCount = 20;
        const radius = Math.min(w, h) * 0.28;
        const centerSwarmX = w / 2;
        const centerSwarmY = h / 2;
        inspectCtx.globalAlpha = 0.6;
        for (let i = 0; i < boidsCount; i++) {
          const t = inspectorFrameCount * 0.02 + (i * Math.PI * 2) / boidsCount;
          const boidX = centerSwarmX + Math.sin(t * 2) * radius * Math.cos(t * 0.5);
          const boidY = centerSwarmY + Math.cos(t * 3) * radius * Math.sin(t * 0.8);
          inspectCtx.fillRect(boidX - 1, boidY - 1, 3, 3);
          if (i > 0) {
            inspectCtx.globalAlpha = 0.15;
            inspectCtx.beginPath();
            inspectCtx.moveTo(boidX, boidY);
            inspectCtx.lineTo(centerSwarmX, centerSwarmY);
            inspectCtx.stroke();
            inspectCtx.globalAlpha = 0.6;
          }
        }
        break;
    }
    
    inspectCtx.globalAlpha = 1.0;
    inspectCtx.fillStyle = "rgba(0,0,0,0.1)";
    inspectCtx.fillRect(0, 0, w, h);
    
    inspectorAnimId = requestAnimationFrame(() => runInspectorVisualizer(type));
  }

  /* ==========================================
   * RESTORED COMMAND PROMPT CLI TERMINAL ENGINE
   * ========================================== */
  const cliInput = document.getElementById("cli-input");
  const cliOutput = document.getElementById("cli-output");
  const macroButtons = document.querySelectorAll(".term-macro-btn");
  
  const transmissionPayload = {
    name: "",
    email: "",
    message: ""
  };

  if (cliInput) {
    cliInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const inputStr = cliInput.value.trim();
        cliInput.value = "";
        if (inputStr) {
          processCommand(inputStr);
        }
      }
    });
  }

  macroButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const cmd = btn.getAttribute("data-cmd");
      processCommand(cmd);
    });
  });

  function logToCLI(text, cssClass = "") {
    if (!cliOutput) return;
    const div = document.createElement("div");
    if (cssClass) div.className = cssClass;
    div.innerHTML = text.replace(/\n/g, "<br>");
    
    const inputLine = cliOutput.querySelector(".cli-input-line");
    if (inputLine) {
      cliOutput.insertBefore(div, inputLine);
    } else {
      cliOutput.appendChild(div);
    }
    
    cliOutput.scrollTop = cliOutput.scrollHeight;
  }

  function processCommand(cmdLine) {
    logToCLI("guest@hemashree.sys:~$ " + cmdLine, "text-white");
    
    const parts = cmdLine.toLowerCase().split(" ");
    const command = parts[0];
    const args = parts.slice(1).join(" ");
    
    soundClick();
    
    switch (command) {
      case "help":
        logToCLI(
          "AVAILABLE EXECUTIVE SCRIPTS:\n" +
          "  <span class='text-green'>about</span>         Retrieve biography & core specs.\n" +
          "  <span class='text-green'>projects</span>      List dynamic compilations grid pack.\n" +
          "  <span class='text-green'>skills</span>        Analyze capabilities specifications.\n" +
          "  <span class='text-green'>clear</span>         Wipe the console logs.\n" +
          "  <span class='text-green'>name [val]</span>    Identify transmission name payload.\n" +
          "  <span class='text-green'>email [val]</span>   Identify transmission email channel.\n" +
          "  <span class='text-green'>message [v]</span>   Write transmission message body.\n" +
          "  <span class='text-green'>send</span>          Transmit compiled payload package."
        );
        break;

      case "about":
        logToCLI(
          "SPECIFICATIONS // HEMASHREE JELLI\n" +
          "---------------------------------\n" +
          "AI/ML Research Intern at IIIT Kottayam & B.Tech CSE (Bioinformatics) student at VIT (CGPA: 9.13). Specializes in multimodal deep learning models (BERT, ViT), citation-aware RAG workspaces, Supabase full-stack setups, and predictive data analytics."
        );
        break;
 
      case "projects":
        logToCLI(
          "DIRECTORY OF SYSTEM EXECUTABLES:\n" +
          "  ID: 0xFD42 - SMART RESEARCH WORKSPACE  [2.4 MB]\n" +
          "  ID: 0xA77E - RAPT: RESUME ANALYSIS    [1.8 MB]\n" +
          "  ID: 0x93FF - CRIME ANALYTICS & FIR SYS [820 KB]\n" +
          "  ID: 0x5EAE - SEMANTIC SEARCH SYSTEM    [3.6 MB]\n" +
          "  ID: 0xD0A8 - AI DONATION PLATFORM      [1.5 MB]\n" +
          "  Select a card above to run procedural diagnostics."
        );
        break;
 
      case "skills":
        logToCLI(
          "CAPABILITIES METRIC DIAGNOSTICS:\n" +
          "  - AI/ML RESEARCH (TRANSFORMERS): [██████████████░] 95%\n" +
          "  - LLM APPS & RAG ARCHITECTURES:  [█████████████░░] 93%\n" +
          "  - FULL-STACK SOFTWARE DEV:       [████████████░░░] 90%\n" +
          "  - DATA SCIENCE & ANALYTICS:      [███████████░░░░] 88%"
        );
        break;

      case "clear":
        if (cliOutput) {
          const lines = Array.from(cliOutput.children);
          lines.forEach(line => {
            if (!line.classList.contains("cli-input-line")) {
              line.remove();
            }
          });
        }
        break;

      case "name":
        if (!args) {
          logToCLI("Error: Parameter 'name' cannot be empty. Usage: 'name USER_1'", "text-red");
        } else {
          transmissionPayload.name = args;
          document.getElementById("user-name").value = args;
          logToCLI("Payload registered: name = '" + args + "'", "text-lavender");
        }
        break;

      case "email":
        if (!args) {
          logToCLI("Error: Parameter 'email' cannot be empty. Usage: 'email name@domain.com'", "text-red");
        } else {
          transmissionPayload.email = args;
          document.getElementById("user-email").value = args;
          logToCLI("Payload registered: email = '" + args + "'", "text-lavender");
        }
        break;

      case "message":
      case "msg":
        if (!args) {
          logToCLI("Error: Parameter 'message' cannot be empty. Usage: 'message Hello!'", "text-red");
        } else {
          transmissionPayload.message = args;
          document.getElementById("user-msg").value = args;
          logToCLI("Payload registered: message = '" + args + "'", "text-lavender");
        }
        break;

      case "send":
      case "submit":
      case "transmit":
        executeCLIFormSubmission();
        break;

      default:
        logToCLI("Command not found: '" + command + "'. Type 'help' for script catalogue.", "text-red");
        break;
    }
  }

  function executeCLIFormSubmission() {
    const name = document.getElementById("user-name").value.trim();
    const email = document.getElementById("user-email").value.trim();
    const msg = document.getElementById("user-msg").value.trim();
    
    if (name) transmissionPayload.name = name;
    if (email) transmissionPayload.email = email;
    if (msg) transmissionPayload.message = msg;
    
    const feed = document.getElementById("form-feedback");
    
    if (!transmissionPayload.name || !transmissionPayload.email || !transmissionPayload.message) {
      if (feed) {
        feed.classList.remove("hidden-element");
        feed.className = "form-status-feed highlight-text";
        feed.style.borderColor = "rgba(255, 100, 100, 0.4)";
        feed.textContent = "✦ Transmission error: Incomplete details. Please fill in all fields.";
      }
      return;
    }
    
    // Provide immediate visual click feedback on the submit button
    const submitBtn = document.querySelector(".form-submit");
    const originalText = submitBtn ? submitBtn.textContent : "Send Message";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "SENDING...";
      submitBtn.style.opacity = "0.7";
    }
    
    if (feed) {
      feed.classList.remove("hidden-element");
      feed.style.borderColor = "var(--border-color)";
      feed.className = "form-status-feed highlight-text";
      feed.textContent = "✦ Sending...";
    }
    
    soundGlitch();
    
    // Satisfying simulated retro processing delay (800ms)
    setTimeout(() => {
      // Submit form to Netlify using fetch
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          "form-name": "contact",
          "name": transmissionPayload.name,
          "email": transmissionPayload.email,
          "message": transmissionPayload.message
        }).toString()
      })
      .then(response => {
        if (!response.ok) {
          throw new Error("Form submission failed");
        }
        
        setTimeout(() => {
          // Reset payload
          transmissionPayload.name = "";
          transmissionPayload.email = "";
          transmissionPayload.message = "";
          
          // Reset form inputs
          const contactFormEl = document.getElementById("contact-form");
          if (contactFormEl) contactFormEl.reset();
          
          // Restore submit button to active state
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            submitBtn.style.opacity = "1.0";
          }
          
          // Set success banner
          if (feed) {
            feed.className = "form-status-feed highlight-text";
            feed.textContent = "✦ Sent";
            setTimeout(() => {
              feed.classList.add("hidden-element");
            }, 4000);
          }
        }, 700);
      })
      .catch(error => {
        console.error("Netlify form submission error:", error);
        
        // Restore submit button
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
          submitBtn.style.opacity = "1.0";
        }
        
        // Show error status
        if (feed) {
          feed.style.borderColor = "rgba(255, 100, 100, 0.4)";
          feed.textContent = "✦ Error. Please try again.";
        }
      });
      
    }, 800);
  }

  /* ==========================================
   * STANDARD CONTACT FORM SUBMISSION
   * ========================================== */
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      transmissionPayload.name = document.getElementById("user-name").value.trim();
      transmissionPayload.email = document.getElementById("user-email").value.trim();
      transmissionPayload.message = document.getElementById("user-msg").value.trim();
      
      executeCLIFormSubmission();
    });
  }

});
