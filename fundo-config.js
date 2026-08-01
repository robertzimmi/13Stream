const STORAGE_KEY = "stream-overlay-fundo";

const FORMAT_TO_TIPO = {
  cc: "ADULT",
  sage: "YOUNG",
};

function resolveHeroImage(arquivo) {
  return `assets/${arquivo}`;
}

function getHeroesForFormat(format) {
  const tipo = FORMAT_TO_TIPO[format] || "ADULT";
  return bancoDeImagensHerois.filter((hero) => hero.tipo === tipo);
}

function populateHeroSelect(playerNumber, selectedHeroId = "") {
  const format = document.getElementById("stream-format").value;
  const heroSelect = document.getElementById(`p${playerNumber}-hero`);
  const heroes = getHeroesForFormat(format);

  heroSelect.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Selecione um herói";
  heroSelect.appendChild(placeholder);

  heroes.forEach((hero) => {
    const option = document.createElement("option");
    option.value = hero.arquivo;
    option.textContent = hero.nome;
    option.dataset.image = resolveHeroImage(hero.arquivo);
    heroSelect.appendChild(option);
  });

  const hasSelectedHero = heroes.some((hero) => hero.arquivo === selectedHeroId);
  heroSelect.value = hasSelectedHero ? selectedHeroId : "";
}

function setupRecordToggle(playerNumber) {
  const showRecord = document.getElementById(`p${playerNumber}-show-record`);
  const recordFields = document.getElementById(`p${playerNumber}-record-fields`);
  const wins = document.getElementById(`p${playerNumber}-wins`);
  const losses = document.getElementById(`p${playerNumber}-losses`);
  const draws = document.getElementById(`p${playerNumber}-draws`);
  const inputs = [wins, losses, draws];

  function updateRecordFields() {
    const enabled = showRecord.checked;
    recordFields.classList.toggle("is-disabled", !enabled);

    inputs.forEach((input) => {
      input.disabled = !enabled;

      if (!enabled) {
        input.value = "";
      }
    });
  }

  showRecord.addEventListener("change", updateRecordFields);
  updateRecordFields();
}

function setupPlayer(playerNumber) {
  const heroSelect = document.getElementById(`p${playerNumber}-hero`);
  const preview = document.getElementById(`p${playerNumber}-preview`);
  const flipCheckbox = document.getElementById(`p${playerNumber}-flip`);

  function updatePreview() {
    const selectedOption = heroSelect.selectedOptions[0];
    const image = selectedOption?.dataset.image || "";

    if (!image) {
      preview.removeAttribute("src");
      preview.hidden = true;
      preview.classList.remove("is-flipped");
      return;
    }

    preview.src = image;
    preview.hidden = false;
    preview.classList.toggle("is-flipped", flipCheckbox.checked);
  }

  heroSelect.addEventListener("change", updatePreview);
  flipCheckbox.addEventListener("change", updatePreview);

  populateHeroSelect(playerNumber);
}

function setupGlobalFormat() {
  const formatSelect = document.getElementById("stream-format");

  formatSelect.addEventListener("change", () => {
    [1, 2].forEach((playerNumber) => {
      const selectedHeroId = document.getElementById(`p${playerNumber}-hero`).value;
      populateHeroSelect(playerNumber, selectedHeroId);
    });
  });
}

function getPlayerData(playerNumber) {
  const heroSelect = document.getElementById(`p${playerNumber}-hero`);
  const selectedOption = heroSelect.selectedOptions[0];
  const showRecord = document.getElementById(`p${playerNumber}-show-record`).checked;

  return {
    name: document.getElementById(`p${playerNumber}-name`).value.trim(),
    showRecord,
    wins: showRecord ? document.getElementById(`p${playerNumber}-wins`).value : "",
    losses: showRecord ? document.getElementById(`p${playerNumber}-losses`).value : "",
    draws: showRecord ? document.getElementById(`p${playerNumber}-draws`).value : "",
    heroId: heroSelect.value,
    heroName: selectedOption?.textContent || "",
    heroImage: selectedOption?.dataset.image || "",
    flip: document.getElementById(`p${playerNumber}-flip`).checked,
  };
}

function loadSavedData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  try {
    const data = JSON.parse(saved);

    document.getElementById("show-cameras").checked = Boolean(data.showCameras);
    document.getElementById("show-life").checked = Boolean(data.showLife);
    document.getElementById("show-score").checked = Boolean(data.showScore);
    document.getElementById("stream-format").value = data.format || "cc";

    [1, 2].forEach((playerNumber) => {
      const player = data[`player${playerNumber}`];
      if (!player) return;

      document.getElementById(`p${playerNumber}-name`).value = player.name || "";
      document.getElementById(`p${playerNumber}-show-record`).checked = Boolean(player.showRecord);

      populateHeroSelect(playerNumber, player.heroId || "");

      if (player.showRecord) {
        document.getElementById(`p${playerNumber}-wins`).value = player.wins ?? "";
        document.getElementById(`p${playerNumber}-losses`).value = player.losses ?? "";
        document.getElementById(`p${playerNumber}-draws`).value = player.draws ?? "";
      }

      document.getElementById(`p${playerNumber}-flip`).checked = Boolean(player.flip);
    });

    [1, 2].forEach((playerNumber) => {
      document.getElementById(`p${playerNumber}-show-record`).dispatchEvent(new Event("change"));
      document.getElementById(`p${playerNumber}-hero`).dispatchEvent(new Event("change"));
    });
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

document.getElementById("fundo-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const payload = {
    showCameras: document.getElementById("show-cameras").checked,
    showLife: document.getElementById("show-life").checked,
    showScore: document.getElementById("show-score").checked,
    format: document.getElementById("stream-format").value,
    player1: getPlayerData(1),
    player2: getPlayerData(2),
    updatedAt: Date.now(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  window.location.href = "fundo-display.html";
});

setupRecordToggle(1);
setupRecordToggle(2);
setupPlayer(1);
setupPlayer(2);
loadSavedData();
