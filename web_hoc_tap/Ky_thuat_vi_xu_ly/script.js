// =============================================
//   QUIZ ENGINE with Hint Tooltip System
// =============================================

const SET_NAMES = {all:"All",exam2023:"Exam 2023.2",practice:"Practice",advanced:"Advanced",extra:"Extra", midterm1:"Mock 1", midterm2:"Mock 2", midterm3:"Mock 3", exam_prep_all: "Syllabus"};
const TOPIC_NAMES = {all:"All",number:"Number Systems",register:"Registers",addressing:"Addressing",stack:"Stack",flags:"Flags",trace:"Trace",arch:"Architecture",instruction:"Instruction Set", "Chapter 1": "Chapter 1", "Chapter 2": "Chapter 2", "Chapter 3": "Chapter 3", "Chapter 4": "Chapter 4"};

let S = {mode:"practice",set:"all",topic:"all",questions:[],cur:0,score:0,answers:[],t0:null,timer:null,timeLeft:2700};

// ---- Init ----
document.addEventListener("DOMContentLoaded", () => {
  updateCounts();
  bindAll();
  applySelection();
});

function updateCounts() {
  const sets = {all:0,exam2023:0,practice:0,advanced:0,extra:0, midterm1:0, midterm2:0, midterm3:0, exam_prep_all: 0};
  ALL_QUESTIONS.forEach(q => { if (sets[q.set] !== undefined) sets[q.set]++; sets.all++; });
  document.getElementById("countAll").textContent = sets.all + " questions";
  document.getElementById("countExam").textContent = sets.exam2023 + " questions";
  document.getElementById("countPractice").textContent = sets.practice + " questions";
  document.getElementById("countAdvanced").textContent = sets.advanced + " questions";
  document.getElementById("countExtra").textContent = sets.extra + " questions";
  document.getElementById("countMidterm1").textContent = sets.midterm1 + " questions";
  document.getElementById("countMidterm2").textContent = sets.midterm2 + " questions";
  document.getElementById("countMidterm3").textContent = sets.midterm3 + " questions";
  document.getElementById("countPrepAll").textContent = sets.exam_prep_all + " questions";
}

function applySelection() {
  const pool = getPool();
  document.getElementById("readyInfo").innerHTML = `Ready: <strong>${pool.length} questions</strong>`;
}

function getPool() {
  let pool = S.set === "all" ? [...ALL_QUESTIONS] : ALL_QUESTIONS.filter(q => q.set === S.set);
  if (S.topic !== "all") pool = pool.filter(q => q.topic === S.topic);
  return pool;
}

function bindAll() {
  // Set selection
  document.querySelectorAll(".set-card").forEach(c => c.addEventListener("click", () => {
    document.querySelectorAll(".set-card").forEach(x => x.classList.remove("selected"));
    c.classList.add("selected");
    S.set = c.dataset.set;
    applySelection();
  }));

  // Topic chips
  document.querySelectorAll(".chip").forEach(c => c.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach(x => x.classList.remove("active"));
    c.classList.add("active");
    S.topic = c.dataset.topic;
    applySelection();
  }));

  // Mode
  document.querySelectorAll(".mode-btn").forEach(b => b.addEventListener("click", () => {
    document.querySelectorAll(".mode-btn").forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    S.mode = b.dataset.mode;
  }));

  document.getElementById("startBtn").addEventListener("click", startQuiz);
  document.getElementById("nextBtn").addEventListener("click", nextQ);
  document.getElementById("backBtn").addEventListener("click", () => showScreen("landing"));
  document.getElementById("retryBtn").addEventListener("click", () => startQuiz());
  document.getElementById("homeBtn").addEventListener("click", () => window.location.href = "../index.html");

  // Sidebar toggle
  const sidebarToggle = document.getElementById("sidebar-toggle");
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", () => {
      document.getElementById("sidebar").classList.toggle("collapsed");
    });
  }

  // Global hint tooltip

  document.addEventListener("mousemove", moveTooltip);
}

// ---- Hint Tooltip ----
const tooltip = document.getElementById("hintTooltip");
const hintTitle = document.getElementById("hintTitle");
const hintBody = document.getElementById("hintBody");
let tooltipVisible = false;

function moveTooltip(e) {
  if (!tooltipVisible) return;
  const pad = 14;
  let x = e.clientX + pad;
  let y = e.clientY + pad;
  const tw = tooltip.offsetWidth;
  const th = tooltip.offsetHeight;
  if (x + tw > window.innerWidth - 10) x = e.clientX - tw - pad;
  if (y + th > window.innerHeight - 10) y = e.clientY - th - pad;
  tooltip.style.left = x + "px";
  tooltip.style.top = y + "px";
}

function showHint(key, text) {
  hintTitle.textContent = key;
  hintBody.textContent = text;
  tooltip.classList.add("visible");
  tooltipVisible = true;
}

function hideHint() {
  tooltip.classList.remove("visible");
  tooltipVisible = false;
}

// ---- Enrich text with keyword hints (SINGLE-PASS to avoid corruption) ----
function enrichText(text) {
  // Build one big regex from all hint keys, longest first
  const keys = Object.keys(HINTS).sort((a, b) => b.length - a.length);
  const escaped = keys.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`\\b(${escaped.join('|')})\\b`, 'g');
  const used = new Set();

  // Single pass: replace all matches at once, no re-processing
  return text.replace(pattern, (match) => {
    // Find the correct key (case-sensitive first, then uppercase)
    const key = HINTS[match] ? match : (HINTS[match.toUpperCase()] ? match.toUpperCase() : null);
    if (!key || used.has(key)) return match;
    used.add(key);
    return `<span class="kw" data-hkey="${key}">${match}</span>`;
  });
}

// ---- Enrich code with line-by-line hints ----
function enrichCode(code) {
  if (!code) return "";
  return code.split("\n").map(line => {
    const trimmed = line.trim();
    let instr = "";
    const parts = trimmed.split(/[\s,]+/);
    for (const p of parts) {
      const upper = p.toUpperCase().replace(":", "");
      if (HINTS[upper] && !p.endsWith(":")) { instr = upper; break; }
    }
    if (instr) {
      return `<span class="code-line" data-hkey="${instr}">${escapeHtml(line)}</span>`;
    }
    return `<span class="code-line">${escapeHtml(line)}</span>`;
  }).join("\n");
}

function escapeHtml(s) {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

// Bind hints: lookup from HINTS dict at hover time (no data-hint attribute needed)
function bindHints(container) {
  container.querySelectorAll("[data-hkey]").forEach(el => {
    el.addEventListener("mouseenter", () => {
      const key = el.dataset.hkey;
      if (HINTS[key]) showHint(key, HINTS[key]);
    });
    el.addEventListener("mouseleave", hideHint);
  });
}

// ---- Quiz Flow ----
function startQuiz() {
  let pool = getPool();
  if (pool.length === 0) { alert("No questions found! Please select a different exam set."); return; }

  // Shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const maxQ = S.mode === "exam" ? Math.min(30, pool.length) : pool.length;
  S.questions = pool.slice(0, maxQ);
  S.cur = 0; S.score = 0; S.answers = []; S.t0 = Date.now();

  showScreen("quiz");
  document.getElementById("topicLabel").textContent = SET_NAMES[S.set] || "Quiz";

  const tb = document.getElementById("timerBox");
  if (S.mode === "exam") {
    tb.classList.remove("hidden", "warning");
    S.timeLeft = 2700;
    updateTimer();
    S.timer = setInterval(tick, 1000);
  } else {
    tb.classList.add("hidden");
    if (S.timer) clearInterval(S.timer);
  }
  renderQ();
}

function tick() {
  S.timeLeft--;
  if (S.timeLeft <= 0) { clearInterval(S.timer); showResults(); return; }
  if (S.timeLeft <= 300) document.getElementById("timerBox").classList.add("warning");
  updateTimer();
}

function updateTimer() {
  const m = Math.floor(S.timeLeft / 60), s = S.timeLeft % 60;
  document.getElementById("timer").textContent = `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

function renderQ() {
  const q = S.questions[S.cur];
  const total = S.questions.length;

  document.getElementById("questionCounter").textContent = `${S.cur + 1}/${total}`;
  document.getElementById("qNumber").textContent = `Question ${S.cur + 1}`;
  document.getElementById("scoreDisplay").textContent = S.score;
  document.getElementById("progressBar").style.width = `${(S.cur / total) * 100}%`;

  // Question text with hints
  const qTextEl = document.getElementById("qText");
  qTextEl.innerHTML = enrichText(q.text);
  bindHints(qTextEl);

  // Code block with line hints
  const codeEl = document.getElementById("qCode");
  if (q.code) {
    codeEl.innerHTML = enrichCode(q.code);
    codeEl.classList.remove("hidden");
    bindHints(codeEl);
  } else {
    codeEl.classList.add("hidden");
  }

  // Options
  const container = document.getElementById("optionsContainer");
  container.innerHTML = "";
  const letters = ["A", "B", "C", "D"];
  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "opt-btn";
    btn.innerHTML = `<span class="opt-letter">${letters[i]}</span><span class="opt-text">${opt}</span>`;
    btn.addEventListener("click", () => selectAnswer(i));
    container.appendChild(btn);
  });

  document.getElementById("explanation").classList.add("hidden");
  document.getElementById("nextBtn").classList.add("hidden");
}

function selectAnswer(sel) {
  const q = S.questions[S.cur];
  const correct = q.answer;
  const ok = sel === correct;
  if (ok) S.score++;
  S.answers.push({ qi: S.cur, sel, correct, ok });

  const btns = document.querySelectorAll(".opt-btn");
  btns.forEach((b, i) => {
    b.classList.add("locked");
    if (i === correct) b.classList.add("correct");
    if (i === sel && !ok) b.classList.add("wrong");
  });

  document.getElementById("scoreDisplay").textContent = S.score;

  const expl = document.getElementById("explanation");
  expl.classList.remove("hidden", "correct-e", "wrong-e");
  expl.classList.add(ok ? "correct-e" : "wrong-e");
  document.getElementById("explIcon").textContent = ok ? "✅" : "❌";
  document.getElementById("explTitle").textContent = ok ? "Correct!" : "Wrong!";
  document.getElementById("explText").innerHTML = q.explanation;

  const nextBtn = document.getElementById("nextBtn");
  nextBtn.classList.remove("hidden");
  document.getElementById("nextBtnText").textContent =
    S.cur < S.questions.length - 1 ? "Next Question" : "View Results 🏆";
}

function nextQ() {
  S.cur++;
  if (S.cur >= S.questions.length) { showResults(); return; }
  renderQ();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showResults() {
  if (S.timer) clearInterval(S.timer);
  const total = S.questions.length;
  const right = S.score, wrong = total - right;
  const pct = Math.round((right / total) * 100);
  const elapsed = Math.floor((Date.now() - S.t0) / 1000);
  const mm = Math.floor(elapsed / 60), ss = elapsed % 60;

  let emoji, title;
  if (pct >= 90) { emoji = "🏆"; title = "Excellent!"; }
  else if (pct >= 70) { emoji = "🎉"; title = "Great Job!"; }
  else if (pct >= 50) { emoji = "💪"; title = "Keep Trying!"; }
  else { emoji = "📖"; title = "Needs More Review!"; }

  document.getElementById("resultEmoji").textContent = emoji;
  document.getElementById("resultTitle").textContent = title;
  document.getElementById("finalScore").textContent = right;
  document.getElementById("totalQuestions").textContent = `/${total}`;
  document.getElementById("correctCount").textContent = right;
  document.getElementById("wrongCount").textContent = wrong;
  document.getElementById("timeSpent").textContent = `${mm}:${String(ss).padStart(2,"0")}`;
  document.getElementById("pctDisplay").textContent = pct + "%";

  // Score ring
  const circ = document.getElementById("scoreCircle");
  const C = 2 * Math.PI * 52;
  const offset = C - (pct / 100) * C;
  circ.style.stroke = pct >= 70 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444";
  setTimeout(() => { circ.style.strokeDashoffset = offset; }, 200);

  // Review wrong
  const rev = document.getElementById("reviewSection");
  rev.innerHTML = "";
  if (wrong > 0) {
    const h = document.createElement("h3");
    h.textContent = `📝 Incorrect Questions (${wrong})`;
    rev.appendChild(h);
  }
  const letters = ["A","B","C","D"];
  S.answers.forEach((a, idx) => {
    if (a.ok) return;
    const q = S.questions[a.qi];
    const d = document.createElement("div");
    d.className = "rev-item";
    d.innerHTML = `<span class="rev-icon">❌</span><div class="rev-body">
      <div class="rev-q">Question ${idx+1}: ${q.text.substring(0,90)}${q.text.length>90?"...":""}</div>
      <div class="rev-ans">You selected: <strong>${letters[a.sel]}. ${q.options[a.sel]}</strong><br>
      Correct answer: <strong class="rev-correct">${letters[a.correct]}. ${q.options[a.correct]}</strong><br>
      <em>${q.explanation}</em></div></div>`;
    rev.appendChild(d);
  });

  document.getElementById("progressBar").style.width = "100%";
  showScreen("result");
}

// ---- Nav ----
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo({ top: 0 });
}

function goHome() {
  if (S.timer) clearInterval(S.timer);
  document.getElementById("scoreCircle").style.strokeDashoffset = 326.73;
  showScreen("landing");
  applySelection();
}
