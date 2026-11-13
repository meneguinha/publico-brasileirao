/* ═══════════════════════════════════════════════════════
   PREDITOR BRASILEIRÃO — script.js (Enhanced Edition)
   ═══════════════════════════════════════════════════════

   ⚙️  CONFIGURAÇÃO:
   Substitua API_BASE_URL pela URL real do seu HF Space.
   ═══════════════════════════════════════════════════════ */

// Para testar localmente sem editar o arquivo: abra a página com ?api=http://localhost:8000
const API_BASE_URL =
  new URLSearchParams(window.location.search).get("api") ||
  "https://fmenegottobr-preditor-brasileirao.hf.space";

// ─── Cache (preenchido por GET /opcoes) ──────────────────
let allTeams      = [];
let estadioPadrao = {};

// ─── Refs DOM ─────────────────────────────────────────────
const mandanteEl  = document.getElementById("mandante");
const visitanteEl = document.getElementById("visitante");
const dataEl      = document.getElementById("data");
const horaEl      = document.getElementById("hora");
const estadioEl   = document.getElementById("estadio");
const rodadaEl    = document.getElementById("rodada");
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
function hojeISO() {
  const d = new Date();
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d - off).toISOString().slice(0, 10);
}

function preencherEstadio() {
  const padrao = estadioPadrao[mandanteEl.value];
  estadioEl.value = padrao || "";
}

async function init() {
  dataEl.value = hojeISO();
  try {
    const [healthRes, opcoesRes] = await Promise.all([
      fetch(`${API_BASE_URL}/`),
      fetch(`${API_BASE_URL}/opcoes`),
    ]);

    if (!healthRes.ok || !opcoesRes.ok) {
      throw new Error("Falha ao buscar dados da API.");
    }

    const health = await healthRes.json();
    const opcoes = await opcoesRes.json();

    allTeams      = opcoes.clubes;
    estadioPadrao = opcoes.estadio_padrao || {};

    const m = health.modelo || {};
    if (m.jogos_treino != null) {
      modelInfoEl.textContent =
        `Modelo ${m.versao || ""} · ${m.jogos_treino.toLocaleString("pt-BR")} jogos`;
    } else {
      modelInfoEl.textContent = "Modelo conectado";
    }

    populateSelect(mandanteEl, allTeams, "Escolha o mandante…");
    visitanteEl.innerHTML = `<option value="" disabled selected>Selecione o mandante primeiro</option>`;
    populateSelect(estadioEl, opcoes.estadios, "Não informado");
    estadioEl.options[0].disabled = false;   // estádio é opcional
    estadioEl.value = "";

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
    if (data.testes && Object.keys(data.testes).length) renderMetricas(data);
  } catch (_) {
    // Falha silenciosa — métricas são opcionais
  }
}

function renderMetricas(data) {
  const perfCard = document.getElementById("perfCard");
  const grid     = document.getElementById("perfGrid");
  const testes   = Object.values(data.testes);

  // Um número geral, sem separar por temporada: média dos testes ponderada pelo nº de jogos
  const jogos = testes.reduce((s, t) => s + t.jogos, 0);
  const mae   = testes.reduce((s, t) => s + t.mae * t.jogos, 0) / jogos;
  const r2    = testes.reduce((s, t) => s + t.r2  * t.jogos, 0) / jogos;
  // Erro % típico: o mesmo valor que a API usa para calcular a faixa típica
  const erroPct = data.erro_pct_mediano != null
    ? data.erro_pct_mediano
    : Math.max(...testes.map((t) => t.erro_pct_mediano));

  grid.innerHTML = "";
  const item = document.createElement("div");
  item.className = "perf-item";
  item.style.gridColumn = "1 / -1";
  item.innerHTML = `
    <div class="perf-model-label">👥 Público Pagante · ${fmtInt(jogos)} jogos testados</div>
    <div class="perf-row">
      <div class="perf-stat">
        <span class="perf-stat-label">Erro médio</span>
        <span class="perf-stat-value">${fmtInt(mae)}</span>
        <span class="perf-stat-unit">pagantes por jogo</span>
      </div>
      <div class="perf-stat">
        <span class="perf-stat-label">Erro típico</span>
        <span class="perf-stat-value">${erroPct.toFixed(1).replace(".", ",")}%</span>
        <span class="perf-stat-unit">metade dos jogos erra menos que isso</span>
      </div>
      <div class="perf-stat">
        <span class="perf-stat-label">R²</span>
        <span class="perf-stat-value">${r2.toFixed(2).replace(".", ",")}</span>
        <div class="perf-bar-wrap"><div class="perf-bar perf-bar-green" data-w="${Math.max(0, r2 * 100).toFixed(1)}"></div></div>
      </div>
    </div>`;
  grid.appendChild(item);

  perfCard.hidden = false;

  // Anima barras de R² (com pequeno delay para o CSS transition funcionar)
  setTimeout(() => {
    grid.querySelectorAll(".perf-bar").forEach((b) => { b.style.width = `${b.dataset.w}%`; });
  }, 120);
}

// ═══════════════════════════════════════════════════════════
// 9. EVENT LISTENERS
// ═══════════════════════════════════════════════════════════
mandanteEl.addEventListener("change", () => {
  const mandante  = mandanteEl.value;
  const anterior  = visitanteEl.value;
  const filtrados = allTeams.filter((t) => t !== mandante);
  populateSelect(visitanteEl, filtrados, "Escolha o visitante…");
  if (anterior && anterior !== mandante) visitanteEl.value = anterior;
  preencherEstadio();
  resultCard.hidden = true;
  hideError();
});

document.getElementById("predictionForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError();

  const mandante  = mandanteEl.value;
  const visitante = visitanteEl.value;
  const data      = dataEl.value;
  const hora      = horaEl.value || null;
  const estadio   = estadioEl.value || null;
  const rodadaTxt = rodadaEl.value.trim();
  const rodada    = rodadaTxt ? parseInt(rodadaTxt, 10) : null;

  if (!mandante || !visitante || !data) {
    showError("Preencha mandante, visitante e data antes de calcular.");
    return;
  }
  if (mandante === visitante) {
    showError("O time mandante e visitante não podem ser iguais.");
    return;
  }
  if (rodada !== null && (isNaN(rodada) || rodada < 1 || rodada > 38)) {
    showError("A rodada deve ser um número de 1 a 38 (ou deixe em branco).");
    return;
  }

  setLoading(true);
  resultCard.hidden = true;

  try {
    const response = await fetch(`${API_BASE_URL}/prever`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mandante, visitante, data, hora, estadio, rodada }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const detail  = Array.isArray(errData.detail)
        ? errData.detail.map((d) => d.msg).join("; ")
        : errData.detail;
      throw new Error(detail || `Erro ${response.status} da API.`);
    }

    const resultado = await response.json();
    renderResult(resultado, { mandante, visitante, data, hora, estadio, rodada });

  } catch (err) {
    console.error("[prever]", err);
    showError(`Erro ao calcular: ${err.message}`);
  } finally {
    setLoading(false);
  }
});

// ═══════════════════════════════════════════════════════════
// 10. RENDER RESULT — with all effects
// ═══════════════════════════════════════════════════════════
function renderResult(res, jogo) {
  // Cabeçalho (só com o que o usuário informou)
  document.getElementById("matchTitle").textContent = `${jogo.mandante} × ${jogo.visitante}`;
  const dataBR = jogo.data.split("-").reverse().join("/");
  const partes = [dataBR + (jogo.hora ? ` às ${jogo.hora}` : "")];
  if (jogo.estadio) partes.push(jogo.estadio);
  if (jogo.rodada != null) partes.push(`Rodada ${jogo.rodada}`);
  document.getElementById("matchMeta").textContent = partes.join(" — ");

  // Métricas — placeholders antes da animação
  const publEl  = document.getElementById("metricPublico");
  const faixaEl = document.getElementById("metricFaixa");
  publEl.textContent = "0";
  const [faixaMin, faixaMax] = res.faixa_tipica;
  faixaEl.textContent = `${fmtInt(faixaMin)} – ${fmtInt(faixaMax)}`;

  // Mostra card com animação
  resultCard.hidden = false;
  resultCard.scrollIntoView({ behavior: "smooth", block: "nearest" });

  // 🎊 Confetti
  burstConfetti(65);

  // 🔢 Contador animado — público
  animateCounter(publEl, res.publico_previsto, (v) => fmtInt(v), 1600);
  setTimeout(() => {
    publEl.classList.add("glow-green");
    setTimeout(() => publEl.classList.remove("glow-green"), 1900);
  }, 1650);
  setTimeout(() => {
    faixaEl.classList.add("glow-yellow");
    setTimeout(() => faixaEl.classList.remove("glow-yellow"), 1900);
  }, 1850);

  // Ativa tilt nos cards recém-exibidos
  initTilt();
}

// ─── Bootstrap ────────────────────────────────────────────
init();
