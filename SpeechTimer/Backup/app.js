let guestNames = ["Guest 1", "Guest 2", "Guest 3", "Guest 4", "Guest 5"];
let secondsSpoken = [];
let timeDivs = [];
let positions = [];

let activeIndex = null;
let isPaused = false;
let isLayoutMode = false;

const settings = {
  alertGapSeconds: 10,
};

const cardsDiv = document.getElementById("cards");
const resetBtn = document.getElementById("resetBtn");

const settingsBtn = document.getElementById("settingsBtn");
const layoutBtn = document.getElementById("layoutBtn");
const settingsPanel = document.getElementById("settingsPanel");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");

const darkModeInput = document.getElementById("darkModeInput");
const guestCountInput = document.getElementById("guestCountInput");
const alertGapInput = document.getElementById("alertGapInput");
const saveSettingsBtn = document.getElementById("saveSettingsBtn");
const guestNamesArea = document.getElementById("guestNamesArea");

const pausedOverlay = document.getElementById("pausedOverlay");
const layoutOverlay = document.getElementById("layoutOverlay");

document.body.classList.add("dark");
darkModeInput.checked = true;

buildCards();
renderPausedOverlay();
renderLayoutOverlay();

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return `${mm}:${ss}`;
}

function renderTimes() {
  for (let i = 0; i < secondsSpoken.length; i++) {
    timeDivs[i].textContent = formatTime(secondsSpoken[i]);
  }
}

function renderActive() {
  const allCards = document.querySelectorAll(".card");
  for (let idx = 0; idx < allCards.length; idx++) {
    allCards[idx].classList.toggle("active", idx === activeIndex);
  }
}

function renderAlert() {
  const allCards = document.querySelectorAll(".card");
  const maxSeconds = Math.max(...secondsSpoken, 0);

  for (let i = 0; i < allCards.length; i++) {
    const behind = maxSeconds - (secondsSpoken[i] ?? 0);
    allCards[i].classList.toggle("alert", behind >= settings.alertGapSeconds);
  }
}

function renderPausedOverlay() {
  if (isPaused) {
    pausedOverlay.classList.remove("hidden");
  } else {
    pausedOverlay.classList.add("hidden");
  }
}

function renderLayoutOverlay() {
  if (isLayoutMode) {
    layoutOverlay.classList.remove("hidden");
    layoutBtn.classList.add("active");
  } else {
    layoutOverlay.classList.add("hidden");
    layoutBtn.classList.remove("active");
  }
}

function renderGuestNameInputs(count) {
  guestNamesArea.innerHTML = "";

  for (let i = 0; i < count; i++) {
    const label = document.createElement("label");
    label.textContent = `Guest ${i + 1} name`;

    const input = document.createElement("input");
    input.type = "text";
    input.value = guestNames[i] ?? `Guest ${i + 1}`;

    label.appendChild(input);
    guestNamesArea.appendChild(label);
  }
}

function buildCards() {
  cardsDiv.innerHTML = "";
  timeDivs = [];
  secondsSpoken = new Array(guestNames.length).fill(0);

  if (positions.length !== guestNames.length) {
    positions = [];
    for (let i = 0; i < guestNames.length; i++) {
      positions.push({ x: 20 + i * 320, y: 20 });
    }
  }

  for (let i = 0; i < guestNames.length; i++) {
    const slot = document.createElement("div");
    slot.classList.add("slot");
    slot.dataset.index = String(i);
    slot.style.left = positions[i].x + "px";
    slot.style.top = positions[i].y + "px";

    const card = document.createElement("div");
    card.classList.add("card");

    card.addEventListener("click", () => {
      if (isLayoutMode) return;

      activeIndex = activeIndex === i ? null : i;
      renderActive();
    });

    const nameDiv = document.createElement("div");
    nameDiv.classList.add("name");
    nameDiv.textContent = guestNames[i];

    const timeDiv = document.createElement("div");
    timeDiv.classList.add("time");
    timeDiv.textContent = "00:00";
    timeDivs.push(timeDiv);

    card.appendChild(nameDiv);
    card.appendChild(timeDiv);

    const controlsDiv = document.createElement("div");
    controlsDiv.classList.add("controls");

    const minusBtn = document.createElement("button");
    minusBtn.textContent = "-5s";
    minusBtn.type = "button";

    const plusBtn = document.createElement("button");
    plusBtn.textContent = "+5s";
    plusBtn.type = "button";

    minusBtn.addEventListener("click", () => {
      secondsSpoken[i] = Math.max(0, secondsSpoken[i] - 5);
      renderTimes();
      renderAlert();
    });

    plusBtn.addEventListener("click", () => {
      secondsSpoken[i] += 5;
      renderTimes();
      renderAlert();
    });

    controlsDiv.appendChild(minusBtn);
    controlsDiv.appendChild(plusBtn);

    slot.appendChild(card);
    slot.appendChild(controlsDiv);
    cardsDiv.appendChild(slot);
  }

  activeIndex = null;
  renderActive();
  renderTimes();
  renderAlert();

  enableFreeDrag();
}

function enableFreeDrag() {
  const slots = Array.from(document.querySelectorAll(".slot"));

  slots.forEach((slot) => {
    let isDragging = false;
    let startMouseX = 0;
    let startMouseY = 0;
    let startX = 0;
    let startY = 0;

    slot.addEventListener("mousedown", (e) => {
      if (!isLayoutMode) return;

      const tag = e.target.tagName;
      if (tag === "BUTTON" || tag === "INPUT") return;

      isDragging = true;
      slot.style.zIndex = "1000";

      const idx = Number(slot.dataset.index);
      startMouseX = e.clientX;
      startMouseY = e.clientY;
      startX = positions[idx].x;
      startY = positions[idx].y;

      e.preventDefault();
    });

    window.addEventListener("mousemove", (e) => {
      if (!isDragging) return;

      const idx = Number(slot.dataset.index);
      const dx = e.clientX - startMouseX;
      const dy = e.clientY - startMouseY;

      positions[idx].x = startX + dx;
      positions[idx].y = startY + dy;

      slot.style.left = positions[idx].x + "px";
      slot.style.top = positions[idx].y + "px";
    });

    window.addEventListener("mouseup", () => {
      if (!isDragging) return;
      isDragging = false;
      slot.style.zIndex = "1";
    });
  });
}

function resetAll() {
  secondsSpoken = secondsSpoken.map(() => 0);
  activeIndex = null;
  isPaused = false;
  renderActive();
  renderTimes();
  renderAlert();
  renderPausedOverlay();
}

resetBtn.addEventListener("click", () => {
  resetAll();
});

settingsBtn.addEventListener("click", () => {
  darkModeInput.checked = document.body.classList.contains("dark");
  guestCountInput.value = String(guestNames.length);
  alertGapInput.value = String(settings.alertGapSeconds);

  renderGuestNameInputs(Number(guestCountInput.value));
  settingsPanel.classList.remove("hidden");
});

layoutBtn.addEventListener("click", () => {
  isLayoutMode = !isLayoutMode;
  renderLayoutOverlay();
});

closeSettingsBtn.addEventListener("click", () => {
  settingsPanel.classList.add("hidden");
});

darkModeInput.addEventListener("change", () => {
  document.body.classList.toggle("dark", darkModeInput.checked);
});

guestCountInput.addEventListener("input", () => {
  const count = Number(guestCountInput.value);
  if (!Number.isFinite(count) || count < 1) return;
  renderGuestNameInputs(count);
});

saveSettingsBtn.addEventListener("click", () => {
  const inputs = guestNamesArea.querySelectorAll("input");
  guestNames = Array.from(inputs).map((inp) => inp.value.trim() || "Guest");

  settings.alertGapSeconds = Number(alertGapInput.value) || 0;

  positions = [];
  settingsPanel.classList.add("hidden");
  buildCards();
});

setInterval(() => {
  if (!isPaused && activeIndex != null) {
    secondsSpoken[activeIndex] += 1;
    renderTimes();
    renderAlert();
  }
}, 1000);

document.addEventListener("keydown", (event) => {
  const key = event.key;

  const tag = event.target.tagName;
  const isTypingField =
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    event.target.isContentEditable;

  if (isTypingField) return;

  if (isLayoutMode) {
    if (key === " ") {
      event.preventDefault();
      isPaused = !isPaused;
      renderPausedOverlay();
    }
    return;
  }

  if (key === " ") {
    event.preventDefault();
    isPaused = !isPaused;
    renderPausedOverlay();
    return;
  }

  if (key === "d" || key === "D") {
    const willBeDark = !document.body.classList.contains("dark");
    document.body.classList.toggle("dark", willBeDark);
    return;
  }

  if (key.startsWith("F")) {
    const n = Number(key.slice(1));
    if (Number.isFinite(n)) {
      const index = n - 1;

      if (index >= 0 && index < guestNames.length) {
        event.preventDefault();
        activeIndex = activeIndex === index ? null : index;
        renderActive();
      }
      return;
    }
  }

  if (key >= "1" && key <= "9") {
    const index = Number(key) - 1;
    if (index >= guestNames.length) return;

    activeIndex = activeIndex === index ? null : index;
    renderActive();
  }
});