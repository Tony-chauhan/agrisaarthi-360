/**
 * Language matrix probe (CDP, native WebSocket — no new dependencies).
 *
 * Exercises the master-prompt TEST 1–8 matrix: landing default English,
 * हिन्दी switch on the landing navbar, full-site Hindi persistence across
 * navigation and hard refresh, switch back to English, persistence on
 * dashboard hard refresh and direct workspace URLs.
 *
 * Usage: node scripts/probe-language.mjs [baseUrl] [port]
 */

const BASE = process.argv[2] ?? "http://localhost:3107";
const DEBUG_PORT = process.argv[3] ?? "9226";

import { spawn } from "node:child_process";
import { mkdtempSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const user_data = mkdtempSync(join(tmpdir(), "cdp-lang-"));
const chromePaths = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
];
const chrome = chromePaths.find((p) => existsSync(p));
if (!chrome) {
  console.error("Chrome not found");
  process.exit(2);
}

const proc = spawn(chrome, [
  `--remote-debugging-port=${DEBUG_PORT}`,
  `--user-data-dir=${user_data}`,
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
  "--window-size=1280,900",
  "about:blank",
]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let pageWsUrl;
for (let i = 0; i < 40; i++) {
  try {
    const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
    const targets = await res.json();
    const page = targets.find((t) => t.type === "page");
    if (page) {
      pageWsUrl = page.webSocketDebuggerUrl;
      break;
    }
  } catch {
    /* retry */
  }
  await sleep(250);
}
if (!pageWsUrl) {
  console.error("No page target found");
  proc.kill();
  process.exit(2);
}

const ws = new WebSocket(pageWsUrl);
await new Promise((resolve, reject) => {
  ws.onopen = resolve;
  ws.onerror = reject;
});

let msgId = 0;
const pending = new Map();
const consoleErrors = [];

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  } else if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error") {
    consoleErrors.push(msg.params.args?.map((a) => a.value ?? a.description).join(" ").slice(0, 200));
  } else if (msg.method === "Runtime.exceptionThrown") {
    consoleErrors.push((msg.params.exceptionDetails?.exception?.description ?? "page exception").slice(0, 200));
  }
};

function send(method, params = {}) {
  const id = ++msgId;
  return new Promise((resolve) => {
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function evalJs(expression) {
  const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  return r.result?.result?.value;
}

await send("Runtime.enable");
await send("Page.enable");

let failures = 0;
function report(name, pass, detail = "") {
  if (!pass) failures++;
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function goto(path) {
  await send("Page.navigate", { url: `${BASE}${path}` });
  await sleep(2200);
}

async function bodyHas(text) {
  return Boolean(await evalJs(`document.body.innerText.includes(${JSON.stringify(text)})`));
}

async function clickButton(label) {
  return evalJs(`(() => {
    const btn = [...document.querySelectorAll("button")].find(
      (b) => b.textContent.trim() === ${JSON.stringify(label)}
    );
    if (!btn) return false;
    btn.click();
    return true;
  })()`);
}

// TEST 1 — landing defaults to English
await goto("/");
report("T1 landing default English", (await bodyHas("Add Your Farm")) && !(await bodyHas("अपना खेत जोड़ें")));

// TEST 2 — हिन्दी on the landing navbar translates the landing page
const clickedHi = await clickButton("हिन्दी");
await sleep(700);
const storedAfterHi = await evalJs(`window.localStorage.getItem("agrisaarthi.lang")`);
report(
  "T2 landing switch to Hindi",
  clickedHi && (await bodyHas("अपना खेत जोड़ें")) && !(await bodyHas("Add Your Farm")) && storedAfterHi === "hi",
  `localStorage=${storedAfterHi}`
);

// TEST 3 — Add Your Farm opens Farm Profile in Hindi
await goto("/farm-profile");
report(
  "T3 farm profile Hindi",
  (await bodyHas("फार्म प्रोफ़ाइल")) && !(await bodyHas("Farm profile"))
);

// TEST 4 — workspace navigation stays Hindi (dashboard + weather)
await goto("/dashboard");
const dashHi = (await bodyHas("खेत की समीक्षा")) && !(await bodyHas("FARM OVERVIEW"));
await goto("/weather");
const weatherLang = await evalJs(`document.documentElement.lang`);
report("T4 workspace stays Hindi", dashHi && weatherLang === "hi", `weather html.lang=${weatherLang}`);

// TEST 5 — hard refresh keeps Hindi, no hydration errors
await goto("/farm-profile");
const refreshLang = await evalJs(`document.documentElement.lang`);
report(
  "T5 hard refresh persists Hindi",
  refreshLang === "hi" && (await bodyHas("फार्म प्रोफ़ाइल"))
);

// TEST 6 — switch back to English from the landing page
await goto("/");
await clickButton("English");
await sleep(700);
const storedAfterEn = await evalJs(`window.localStorage.getItem("agrisaarthi.lang")`);
report(
  "T6 back to English",
  (await bodyHas("Add Your Farm")) && !(await bodyHas("अपना खेत जोड़ें")) && storedAfterEn === "en",
  `localStorage=${storedAfterEn}`
);

// TEST 7 — dashboard hard refresh keeps English
await goto("/dashboard");
report(
  "T7 dashboard persists English",
  (await bodyHas("FARM OVERVIEW")) && (await evalJs(`document.documentElement.lang`)) === "en"
);

// TEST 8 — direct workspace URL applies persisted language (Hindi again)
await goto("/");
await clickButton("हिन्दी");
await sleep(700);
await goto("/crop-advisor");
report(
  "T8 direct URL applies Hindi",
  (await bodyHas("फसल सलाहकार")) && (await evalJs(`document.documentElement.lang`)) === "hi"
);

// Workspace must NOT contain a language switcher (post-hydration reality)
const workspaceSwitcher = await evalJs(
  `[...document.querySelectorAll('[role="group"]')].filter((g) => (g.getAttribute("aria-label")||"").includes("Language")).length`
);
report("T9 no workspace switcher post-hydration", workspaceSwitcher === 0, `found=${workspaceSwitcher}`);

console.log(
  consoleErrors.length === 0
    ? "console: clean across all tests"
    : `console errors (${consoleErrors.length}):\n` + [...new Set(consoleErrors)].slice(0, 8).join("\n")
);
if (consoleErrors.length > 0) failures += consoleErrors.length;

ws.close();
proc.kill();
process.exit(failures === 0 ? 0 : 1);
