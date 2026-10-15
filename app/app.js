"use strict";
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch { /* fall back below */ }
  const t = document.createElement("textarea");
  t.value = text;
  t.style.position = "fixed";
  t.style.opacity = "0";
  document.body.append(t);
  t.select();
  const ok = document.execCommand("copy");
  t.remove();
  return ok;
}

const $ = (id) => document.getElementById(id);
let stops = [{ c: "#7a2335", p: 0 }, { c: "#e3a33b", p: 55 }, { c: "#2463b3", p: 100 }];

function css() {
  const list = stops.slice().sort((a, b) => a.p - b.p).map((s) => `${s.c} ${s.p}%`).join(", ");
  return $("type").value === "linear" ? `linear-gradient(${$("angle").value}deg, ${list})` : `radial-gradient(circle, ${list})`;
}

function render() {
  const g = css();
  $("preview").style.background = g;
  $("css").textContent = `background: ${g};`;
  $("angle-v").textContent = `${$("angle").value}°`;
  $("angle").disabled = $("type").value !== "linear";
  $("stops").replaceChildren(...stops.map((s, i) => {
    const row = document.createElement("div");
    row.className = "stop";
    row.innerHTML = `<input type="color" value="${s.c}" aria-label="Colour ${i + 1}"><input type="range" min="0" max="100" value="${s.p}" aria-label="Position ${i + 1}"><span>${s.p}%</span><button aria-label="Remove colour ${i + 1}">✕</button>`;
    const [color, pos, label, del] = row.children;
    color.addEventListener("input", () => { s.c = color.value; update(); });
    pos.addEventListener("input", () => { s.p = Number(pos.value); label.textContent = `${s.p}%`; update(); });
    del.disabled = stops.length <= 2;
    del.addEventListener("click", () => { stops.splice(i, 1); render(); });
    return row;
  }));
  $("add").disabled = stops.length >= 5;
}
function update() {
  const g = css();
  $("preview").style.background = g;
  $("css").textContent = `background: ${g};`;
}

const hex = () => "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0");
$("random").addEventListener("click", () => {
  const n = 2 + Math.floor(Math.random() * 2);
  stops = Array.from({ length: n }, (_, i) => ({ c: hex(), p: Math.round((i / (n - 1)) * 100) }));
  $("angle").value = Math.floor(Math.random() * 360);
  render();
});
$("add").addEventListener("click", () => { stops.push({ c: hex(), p: 50 }); render(); });
$("type").addEventListener("change", render);
$("angle").addEventListener("input", () => { $("angle-v").textContent = `${$("angle").value}°`; update(); });
$("copy").addEventListener("click", async () => { $("msg").textContent = (await copyText($("css").textContent)) ? "Copied." : "Couldn't copy; select the code instead."; });
render();
