/* ═══════════════════════════════════════════════════════
   PREDITOR BRASILEIRÃO — script.js (Enhanced Edition)
   ═══════════════════════════════════════════════════════

   ⚙️  CONFIGURAÇÃO:
   Substitua API_BASE_URL pela URL real do seu HF Space.
   ═══════════════════════════════════════════════════════ */

const API_BASE_URL = "https://fmenegottobr-preditor-brasileirao.hf.space";

// ─── Cache ───────────────────────────────────────────────
let allTeams = [];
let horarios  = [];

// ─── Refs DOM ─────────────────────────────────────────────
const mandanteEl  = document.getElementById("mandante");
const visitanteEl = document.getElementById("visitante");
const horaEl      = document.getElementById("hora");
const modelInfoEl = document.getElementById("modelInfo");
const submitBtn   = document.getElementById("submitBtn");
const resultCard  = document.getElementById("resultCard");
const errorToast  = document.getElementById("errorToast");
const errorMsgEl  = document.getElementById("errorMsg");

// ═══════════════════════════════════════════════════════════
// 1. PARTICLE SYSTEM
// ═══════════════════════════════════════════════════════════
const canvas = document.getElementById("particleCanvas");
const ctx    = canvas.getContext("2d");

const COLORS = ["#FDB913", "#009B3A", "#002776", "#ffffff"];

let particles = [];

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}

function randomBetween(a, b) { return a + Math.random() * (b - a); }

function createParticle() {
  return {
    x: randomBetween(0, canvas.width),
    y: randomBetween(0, canvas.height),
    r: randomBetween(0.8, 2.5),
    dx: randomBetween(-0.25, 0.25),
    dy: randomBetween(-0.4, -0.1),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    alpha: randomBetween(0.15, 0.55),
  };
}

function initParticles(count = 90) {
  particles = Array.from({ length: count }, createParticle);
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((p) => {
    p.x += p.dx;
    p.y += p.dy;
    // Wrap around
    if (p.y < -4) p.y = canvas.height + 4;
    if (p.x < -4) p.x = canvas.width + 4;
    if (p.x > canvas.width + 4) p.x = -4;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.alpha;
    ctx.fill();
    ctx.globalAlpha = 1;
  });
  requestAnimationFrame(animateParticles);
}

window.addEventListener("resize", () => { resizeCanvas(); initParticles(); });
resizeCanvas();
initParticles();
animateParticles();

// ═══════════════════════════════════════════════════════════
// 2. 3D TILT ON METRIC CARDS
// ═══════════════════════════════════════════════════════════
function initTilt() {
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) / (rect.width  / 2);  // -1 to 1
      const dy   = (e.clientY - cy) / (rect.height / 2);  // -1 to 1
      const rotX = (-dy * 12).toFixed(2);
      const rotY = ( dx * 12).toFixed(2);
      card.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.04)`;
      card.style.boxShadow = `${-dx * 12}px ${-dy * 12}px 40px rgba(0,0,0,0.35)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
      card.style.boxShadow = "";
      card.style.transition = "transform 0.4s ease, box-shadow 0.4s ease";
      setTimeout(() => { card.style.transition = ""; }, 400);
    });
  });
}

// ═══════════════════════════════════════════════════════════
// 3. RIPPLE EFFECT ON BUTTON
// ═══════════════════════════════════════════════════════════
function rippleEffect(e) {
  const btn  = e.currentTarget;
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 1.5;
  const x    = e.clientX - rect.left - size / 2;
  const y    = e.clientY - rect.top  - size / 2;

  const ripple = document.createElement("span");
  ripple.className = "ripple";
  ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`;
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 700);
}

// ═══════════════════════════════════════════════════════════
// 4. NUMBER COUNTER ANIMATION
// ═══════════════════════════════════════════════════════════
function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }

function animateCounter(el, targetValue, formatter, duration = 1600) {
  const start = performance.now();
  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = easeOutExpo(progress);
    const current  = targetValue * eased;
    el.textContent = formatter(current);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = formatter(targetValue);
  }
  requestAnimationFrame(step);
}

// ═══════════════════════════════════════════════════════════
// 5. CONFETTI BURST
// ═══════════════════════════════════════════════════════════
const confettiContainer = document.getElementById("confettiContainer");
const CONFETTI_COLORS   = ["#FDB913", "#009B3A", "#002776", "#ffffff", "#ff6b6b", "#74c0fc"];

function burstConfetti(count = 60) {
  confettiContainer.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";

    const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    const left  = randomBetween(5, 95);
    const dur   = randomBetween(1.8, 3.2);
    const delay = randomBetween(0, 0.8);
    const size  = randomBetween(6, 14);
    const isCircle = Math.random() > 0.5;

    piece.style.cssText = `
      left: ${left}%;
      background: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: ${isCircle ? "50%" : "2px"};
      --dur: ${dur}s;
      --delay: ${delay}s;
    `;
    confettiContainer.appendChild(piece);
  }
  // Auto-cleanup
  setTimeout(() => { confettiContainer.innerHTML = ""; }, 4000);
}

// ═══════════════════════════════════════════════════════════
// 6. UTILITIES
// ═══════════════════════════════════════════════════════════
function fmtInt(n) {
  return new Intl.NumberFormat("pt-BR").format(Math.round(n));
}

function fmtBRL(n) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(n);
}

function populateSelect(el, items, placeholder = "Selecione…") {
  el.innerHTML = `<option value="" disabled selected>${placeholder}</option>`;
  items.forEach((item) => {
    const opt = document.createElement("option");
    opt.value = item;
    opt.textContent = item;
    el.appendChild(opt);
  });
}

function showError(msg) {
  errorMsgEl.textContent = msg;
  errorToast.hidden = false;
  resultCard.hidden  = true;
}
function hideError() { errorToast.hidden = true; }

function setLoading(active) {
  submitBtn.disabled = active;
  submitBtn.classList.toggle("loading", active);
}

// ═══════════════════════════════════════════════════════════
// 7. API INIT
// ═══════════════════════════════════════════════════════════
async function init() {
  try {
    const [healthRes, timesRes, horariosRes] = await Promise.all([
      fetch(`${API_BASE_URL}/`),
      fetch(`${API_BASE_URL}/times`),
      fetch(`${API_BASE_URL}/horarios`),
    ]);

    if (!healthRes.ok || !timesRes.ok || !horariosRes.ok) {
      throw new Error("Falha ao buscar dados da API.");
    }

    const health       = await healthRes.json();
    const timesData    = await timesRes.json();
    const horariosData = await horariosRes.json();

    allTeams = timesData.times;
    horarios  = horariosData.horarios;

    if (health.modelo && health.modelo.n_jogos != null) {
      modelInfoEl.textContent =
        `${health.modelo.n_jogos.toLocaleString("pt-BR")} jogos · ${health.modelo.ano_min}–${health.modelo.ano_max}`;
    } else {
      modelInfoEl.textContent = "Modelo conectado";
    }

    populateSelect(mandanteEl, allTeams, "Escolha o mandante…");
    populateSelect(horaEl, horarios, "Escolha o horário…");
    visitanteEl.innerHTML = `<option value="" disabled selected>Selecione o mandante primeiro</option>`;

    // Busca métricas de performance (silencioso — não bloqueia o init)
    fetchMetricas();

  } catch (err) {
    console.error("[init]", err);
    modelInfoEl.textContent = "API offline";
    const dot = document.querySelector(".pill-dot");
    dot.style.background = "#f87171";
    dot.style.boxShadow  = "0 0 6px #f87171";
    showError("Não foi possível conectar à API. Verifique se o Space no Hugging Face está ativo.");
  }
}

// ═══════════════════════════════════════════════════════════
// 8. FETCH & RENDER MÉTRICAS
// ═══════════════════════════════════════════════════════════
async function fetchMetricas() {
  try {
    const res = await fetch(`${API_BASE_URL}/metricas`);
    if (!res.ok) return;
    const data = await res.json();
    if (data.publico.r2 !== null) renderMetricas(data);
  } catch (_) {
    // Falha silenciosa — métricas são opcionais
  }
}

function renderMetricas(data) {
  const perfCard = document.getElementById("perfCard");

  // R² Público
  const r2Pub = data.publico.r2;
  document.getElementById("perfR2Pub").textContent = r2Pub.toFixed(4);
  document.getElementById("perfMaePub").textContent = fmtInt(data.publico.mae);

  // R² Renda
  const r2Rend = data.renda.r2;
  document.getElementById("perfR2Rend").textContent = r2Rend.toFixed(4);
  document.getElementById("perfMaeRend").textContent = fmtBRL(data.renda.mae);

  // Mostra card
  perfCard.hidden = false;

  // Anima barras de R² (com pequeno delay para o CSS transition funcionar)
  setTimeout(() => {
    document.getElementById("barR2Pub").style.width  = `${Math.max(0, r2Pub  * 100).toFixed(1)}%`;
    document.getElementById("barR2Rend").style.width = `${Math.max(0, r2Rend * 100).toFixed(1)}%`;
  }, 120);
}

// ═══════════════════════════════════════════════════════════
// 9. EVENT LISTENERS
// ═══════════════════════════════════════════════════════════
mandanteEl.addEventListener("change", () => {
  const mandante = mandanteEl.value;
  const filtrados = allTeams.filter((t) => t !== mandante);
  populateSelect(visitanteEl, filtrados, "Escolha o visitante…");
  resultCard.hidden = true;
  hideError();
});

document.getElementById("predictionForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError();

  const mandante  = mandanteEl.value;
  const visitante = visitanteEl.value;
  const hora      = horaEl.value;
  const diaSemana = document.getElementById("diaSemana").value;
  const ano       = parseInt(document.getElementById("ano").value, 10);

  if (!mandante || !visitante || !hora || !diaSemana || !ano) {
    showError("Por favor, preencha todos os campos antes de calcular.");
    return;
  }
  if (mandante === visitante) {
    showError("O time mandante e visitante não podem ser iguais.");
    return;
  }

  setLoading(true);
  resultCard.hidden = true;

  try {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mandante, visitante, hora, dia_semana: diaSemana, ano }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `Erro ${response.status} da API.`);
    }

    const data = await response.json();
    renderResult(data);

  } catch (err) {
    console.error("[predict]", err);
    showError(`Erro ao calcular: ${err.message}`);
  } finally {
    setLoading(false);
  }
});

// ═══════════════════════════════════════════════════════════
// 9. RENDER RESULT — with all effects
// ═══════════════════════════════════════════════════════════
function renderResult(data) {
  // Cabeçalho
  document.getElementById("matchTitle").textContent = `${data.mandante} × ${data.visitante}`;
  document.getElementById("matchMeta").textContent  = `${data.dia_semana} às ${data.hora} — ${data.ano}`;

  // Métricas — placeholders antes da animação
  const publEl  = document.getElementById("metricPublico");
  const rendaEl = document.getElementById("metricRenda");
  publEl.textContent  = "0";
  rendaEl.textContent = "R$ 0,00";

  // Contexto histórico
  document.getElementById("histPublico").textContent = `${fmtInt(data.avg_pub_hist)} pag.`;
  document.getElementById("histRenda").textContent   = fmtBRL(data.avg_ren_hist);

  // Delta
  const deltaBanner = document.getElementById("deltaBanner");
  if (data.delta_pub >= 0) {
    deltaBanner.className = "delta-banner positive";
    deltaBanner.innerHTML = `📈 Previsão <strong>${fmtInt(data.delta_pub)}</strong> pagantes acima da média histórica do mandante`;
  } else {
    deltaBanner.className = "delta-banner negative";
    deltaBanner.innerHTML = `📉 Previsão <strong>${fmtInt(Math.abs(data.delta_pub))}</strong> pagantes abaixo da média histórica do mandante`;
  }

  // Mostra card com animação
  resultCard.hidden = false;
  resultCard.scrollIntoView({ behavior: "smooth", block: "nearest" });

  // 🎊 Confetti
  burstConfetti(65);

  // 🔢 Contador animado — público
  animateCounter(publEl, data.publico_est, (v) => fmtInt(v), 1600);
  // Adiciona glow no final do contador
  setTimeout(() => {
    publEl.classList.add("glow-green");
    setTimeout(() => publEl.classList.remove("glow-green"), 1900);
  }, 1650);

  // 🔢 Contador animado — renda
  animateCounter(rendaEl, data.renda_est, (v) => fmtBRL(v), 1800);
  setTimeout(() => {
    rendaEl.classList.add("glow-yellow");
    setTimeout(() => rendaEl.classList.remove("glow-yellow"), 1900);
  }, 1850);

  // Ativa tilt nos cards recém-exibidos
  initTilt();
}

// ─── Bootstrap ────────────────────────────────────────────
init();
