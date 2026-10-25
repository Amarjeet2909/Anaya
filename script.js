"use strict";

const yesButton = document.getElementById("yesButton");
const noButton = document.getElementById("noButton");
const buttonNote = document.getElementById("buttonNote");
const celebration = document.getElementById("celebration");
const loveSong = document.getElementById("loveSong");
const musicStatus = document.getElementById("musicStatus");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const notes = [
  "Oops… it has butterflies too ♡",
  "A little shy. A little hard to catch.",
  "That button seems to have other plans…",
  "Meanwhile, “yes” is right where you left it ♡"
];
let escapes = 0;
let lastEscape = 0;
let accepted = false;
let confettiTimer;

function overlaps(a, b, padding = 0) {
  return a.left < b.right + padding && a.right > b.left - padding &&
    a.top < b.bottom + padding && a.bottom > b.top - padding;
}

function escapeNo(event) {
  if (event) event.preventDefault();
  if (accepted || performance.now() - lastEscape < 100) return;
  lastEscape = performance.now();

  const viewport = window.visualViewport;
  const width = viewport ? viewport.width : window.innerWidth;
  const height = viewport ? viewport.height : window.innerHeight;
  const offsetX = viewport ? viewport.offsetLeft : 0;
  const offsetY = viewport ? viewport.offsetTop : 0;
  const rect = noButton.getBoundingClientRect();
  const yesRect = yesButton.getBoundingClientRect();
  const margin = 14;
  const maxX = Math.max(margin, width - rect.width - margin);
  const maxY = Math.max(margin, height - rect.height - margin);
  let best = { x: margin, y: margin, score: -Infinity };

  for (let i = 0; i < 40; i++) {
    const x = offsetX + margin + Math.random() * (maxX - margin);
    const y = offsetY + margin + Math.random() * (maxY - margin);
    const candidate = { left: x, top: y, right: x + rect.width, bottom: y + rect.height };
    if (overlaps(candidate, yesRect, 24)) continue;
    const pointerX = event && Number.isFinite(event.clientX) ? event.clientX : rect.left;
    const pointerY = event && Number.isFinite(event.clientY) ? event.clientY : rect.top;
    const score = Math.hypot(x - pointerX, y - pointerY);
    if (score > best.score) best = { x, y, score };
  }

  noButton.classList.add("runaway");
  noButton.style.left = `${best.x}px`;
  noButton.style.top = `${best.y}px`;
  buttonNote.textContent = notes[escapes % notes.length];
  escapes++;
}

noButton.addEventListener("pointerenter", escapeNo);
noButton.addEventListener("pointerdown", escapeNo);
noButton.addEventListener("click", escapeNo);
noButton.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") escapeNo(event);
});

function resetNoPosition() {
  noButton.classList.remove("runaway");
  noButton.style.removeProperty("left");
  noButton.style.removeProperty("top");
}

window.addEventListener("resize", resetNoPosition);
if (window.visualViewport) window.visualViewport.addEventListener("resize", resetNoPosition);

function celebrate() {
  if (reducedMotion.matches) return;
  const container = document.getElementById("confetti");
  clearTimeout(confettiTimer);
  container.replaceChildren();
  if (typeof container.showPopover === "function" && !container.matches(":popover-open")) container.showPopover();
  const colors = ["#e91e63", "#d41450", "#ff467e", "#bd1645", "#f25b83"];
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < 110; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.textContent = i % 5 === 0 ? "✧" : "♥";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.setProperty("--color", colors[i % colors.length]);
    piece.style.setProperty("--size", `${26 + Math.random() * 32}px`);
    piece.style.setProperty("--duration", `${5 + Math.random() * 4}s`);
    piece.style.setProperty("--delay", `${Math.random() * 2}s`);
    piece.style.setProperty("--sway", `${Math.random() * 180 - 90}px`);
    fragment.appendChild(piece);
  }
  container.appendChild(fragment);
  confettiTimer = setTimeout(() => {
    container.replaceChildren();
    if (typeof container.hidePopover === "function") container.hidePopover();
  }, 11500);
}

yesButton.addEventListener("click", () => {
  accepted = true;
  noButton.hidden = true;
  yesButton.innerHTML = 'Miss Anaya Vyas said yes! <span aria-hidden="true">♡</span>';
  buttonNote.textContent = "Amarjeet Singh Rajput’s favorite little moment. ♡";
  loveSong.loop = true;
  loveSong.volume = 0.7;
  loveSong.play().then(() => {
    musicStatus.textContent = "Our song, on repeat ♡";
  }).catch(() => {
    musicStatus.textContent = "Tap play above to start our song ♡";
  });
  celebration.showModal();
  celebrate();
});

function closeCelebration() {
  celebration.close();
  yesButton.focus();
}

document.getElementById("closeCelebration").addEventListener("click", closeCelebration);
document.getElementById("keepMoment").addEventListener("click", closeCelebration);
celebration.addEventListener("click", (event) => {
  if (event.target !== celebration) return;
  const rect = celebration.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right ||
      event.clientY < rect.top || event.clientY > rect.bottom) closeCelebration();
});

const petals = document.getElementById("petals");
if (!reducedMotion.matches) {
  for (let i = 0; i < 12; i++) {
    const heart = document.createElement("span");
    heart.className = "petal";
    heart.textContent = i % 2 ? "♡" : "✧";
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.setProperty("--duration", `${16 + Math.random() * 14}s`);
    heart.style.setProperty("--delay", `${-Math.random() * 28}s`);
    heart.style.setProperty("--size", `${12 + Math.random() * 14}px`);
    petals.appendChild(heart);
  }
}
