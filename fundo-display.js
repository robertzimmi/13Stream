const STORAGE_KEY = "stream-overlay-fundo";

function loadDisplayData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return null;

  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

function resolveHeroImage(image) {
  if (!image) return "";
  const normalized = image.trim();
  if (!normalized) return "";
  return normalized.startsWith("assets/") ? normalized : `assets/${normalized}`;
}

function getHeroName(player) {
  if (!player) return "Herói não selecionado";
  if (player.heroName) return player.heroName;
  if (player.heroId) {
    const entry = Array.isArray(bancoDeImagensHerois)
      ? bancoDeImagensHerois.find((hero) => hero.arquivo === player.heroId)
      : null;
    if (entry) return entry.nome;
  }
  return "Herói não selecionado";
}

function getHeroImage(player) {
  if (!player) return "";
  if (player.heroImage) return resolveHeroImage(player.heroImage);
  if (player.heroId) return resolveHeroImage(player.heroId);
  return "";
}

function setVisibilityElement(elem, visible) {
  if (!elem) return;
  if (visible) {
    elem.classList.remove("fade-hidden");
  } else {
    elem.classList.add("fade-hidden");
  }
}

function applyConfigToggles(data) {
  const showCameras = Boolean(data?.showCameras);
  const showLife = Boolean(data?.showLife);
  const showScore = Boolean(data?.showScore);

  setVisibilityElement(document.getElementById("cam-left"), showCameras);
  setVisibilityElement(document.getElementById("cam-right"), showCameras);
  setVisibilityElement(document.getElementById("p1-life-box"), showLife);
  setVisibilityElement(document.getElementById("p2-life-box"), showLife);
  setVisibilityElement(document.getElementById("placar-left"), showScore);
  setVisibilityElement(document.getElementById("placar-right"), showScore);
}

function renderOverlay(data) {
  const p1 = data?.player1 || {};
  const p2 = data?.player2 || {};

  document.getElementById("p1-display-name").innerText = p1.name?.trim() || "Player 1";
  document.getElementById("p2-display-name").innerText = p2.name?.trim() || "Player 2";

  document.getElementById("p1-score").innerText = `${p1.wins || 0}-${p1.losses || 0}-${p1.draws || 0}`;
  document.getElementById("p2-score").innerText = `${p2.wins || 0}-${p2.losses || 0}-${p2.draws || 0}`;

  const bg1 = getHeroImage(p1) || "assets/heroes/default.jpg";
  const bg2 = getHeroImage(p2) || "assets/heroes/default.jpg";
  const camLeft = document.getElementById("cam-left");
  const camRight = document.getElementById("cam-right");

  if (camLeft) {
    camLeft.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.2)), url("${bg1}")`;
  }
  if (camRight) {
    camRight.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.2)), url("${bg2}")`;
  }

  document.getElementById("p1-hero-label").innerText = getHeroName(p1);
  document.getElementById("p2-hero-label").innerText = getHeroName(p2);

  document.getElementById("p1-life").innerText = "40";
  document.getElementById("p2-life").innerText = "40";

  applyConfigToggles(data);
}

function renderFromStorage() {
  const data = loadDisplayData();
  renderOverlay(data);
}

function setupLifeBox(boxId, valueId) {
  const box = document.getElementById(boxId);
  const value = document.getElementById(valueId);
  let life = parseInt(value.innerText, 10) || 40;

  box.querySelector(".life-left").addEventListener("click", (event) => {
    event.stopPropagation();
    life = Math.max(0, life - 1);
    value.innerText = life;
  });

  box.querySelector(".life-right").addEventListener("click", (event) => {
    event.stopPropagation();
    life += 1;
    value.innerText = life;
  });
}

window.addEventListener("storage", renderFromStorage);
window.addEventListener("DOMContentLoaded", () => {
  setupLifeBox("p1-life-box", "p1-life");
  setupLifeBox("p2-life-box", "p2-life");
  renderFromStorage();
});
