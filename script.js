const EMAIL = "soonjongy@gmail.com";
const PHONE = "010-2456-6150";
const YOUTUBE = "https://www.youtube.com/@ai-study";
const PROFILE = {
  family: "BeingSure",
  given: "",
  name: "BeingSure",
  org: "Beingrich",
  title: "Beingrich 대표",
  note: "책과 함께 크고 있습니다. 같이 크실 분?",
};

const card = document.querySelector("#card");
const copyButton = document.querySelector("#copy-email");
const saveButton = document.querySelector("#save-contact");
const linkedin = document.querySelector("#linkedin");
const status = document.querySelector("#status");

const motionOk = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
const canTilt = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

let statusTimer = 0;

function setStatus(message) {
  status.textContent = message;
  window.clearTimeout(statusTimer);
  statusTimer = window.setTimeout(() => {
    status.textContent = "";
  }, 2200);
}

async function copyEmail() {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(EMAIL);
      return;
    }
  } catch {
    // Some browsers block the async clipboard API. The selection fallback still works.
  }

  const field = document.createElement("textarea");
  field.value = EMAIL;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.left = "-9999px";
  document.body.appendChild(field);
  field.select();
  const copied = document.execCommand("copy");
  field.remove();
  if (!copied) {
    throw new Error("copy failed");
  }
}

function downloadContact() {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N;CHARSET=UTF-8:${PROFILE.family};${PROFILE.given};;;`,
    `FN;CHARSET=UTF-8:${PROFILE.name}`,
    `ORG;CHARSET=UTF-8:${PROFILE.org}`,
    `TITLE;CHARSET=UTF-8:${PROFILE.title}`,
    `TEL;TYPE=CELL:${PHONE}`,
    `EMAIL;TYPE=INTERNET:${EMAIL}`,
    `NOTE;CHARSET=UTF-8:${PROFILE.note}`,
  ];

  const profileUrl = linkedin.href;
  if (profileUrl && !profileUrl.endsWith("linkedin.com/")) {
    lines.push(`URL:${profileUrl}`);
  }
  lines.push(`URL:${YOUTUBE}`);

  lines.push("END:VCARD", "");

  const file = new Blob(["\uFEFF", lines.join("\r\n")], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = "beingsure.vcf";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

copyButton.addEventListener("click", async () => {
  try {
    await copyEmail();
    setStatus("이메일을 복사했습니다.");
  } catch {
    setStatus("복사에 실패했습니다. 주소를 직접 선택해 주세요.");
  }
});

saveButton.addEventListener("click", () => {
  downloadContact();
  setStatus("연락처 파일을 저장했습니다.");
});

const STYLES = ["forest", "ink", "sunset", "night"];
const styleButtons = [...document.querySelectorAll(".choice")];
const swatches = [...document.querySelectorAll(".swatch")];
const bgPicker = document.querySelector("#bg-picker");

function sceneTone(color) {
  const hex = color.replace("#", "");
  if (hex.length !== 6) return "dark";
  const red = parseInt(hex.slice(0, 2), 16);
  const green = parseInt(hex.slice(2, 4), 16);
  const blue = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
  return luminance > 0.62 ? "light" : "dark";
}

function applyStyle(style) {
  const next = STYLES.includes(style) ? style : "forest";
  card.dataset.style = next;
  for (const button of styleButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.style === next));
  }
  localStorage.setItem("card-style", next);
}

function applyBackground(color) {
  const next = /^#[0-9a-fA-F]{6}$/.test(color) ? color : "#101a16";
  document.body.style.setProperty("--scene", next);
  document.body.dataset.sceneTone = sceneTone(next);
  bgPicker.value = next;
  for (const swatch of swatches) {
    swatch.setAttribute("aria-pressed", String(swatch.dataset.bg.toLowerCase() === next.toLowerCase()));
  }
  localStorage.setItem("card-bg", next);
}

for (const button of styleButtons) {
  button.addEventListener("click", () => applyStyle(button.dataset.style));
}

for (const swatch of swatches) {
  swatch.addEventListener("click", () => applyBackground(swatch.dataset.bg));
}

bgPicker.addEventListener("input", () => applyBackground(bgPicker.value));

applyStyle(localStorage.getItem("card-style") || "forest");
applyBackground(localStorage.getItem("card-bg") || "#101a16");

if (motionOk && canTilt) {
  card.addEventListener("pointermove", (event) => {
    const bounds = card.getBoundingClientRect();
    const px = (event.clientX - bounds.left) / bounds.width;
    const py = (event.clientY - bounds.top) / bounds.height;
    card.style.setProperty("--ry", `${(px - 0.5) * 8}deg`);
    card.style.setProperty("--rx", `${(0.5 - py) * 8}deg`);
    card.style.setProperty("--gx", `${px * 100}%`);
    card.style.setProperty("--gy", `${py * 100}%`);
    card.classList.add("is-tilting");
  });

  card.addEventListener("pointerleave", () => {
    card.style.setProperty("--ry", "0deg");
    card.style.setProperty("--rx", "0deg");
    card.classList.remove("is-tilting");
  });
}
