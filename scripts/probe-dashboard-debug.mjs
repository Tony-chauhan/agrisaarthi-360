/** Diagnostic: dump dashboard heading text in en and hi. */
const BASE = process.argv[2] ?? "http://localhost:3107";
const DEBUG_PORT = process.argv[3] ?? "9227";
import { spawn } from "node:child_process";
import { mkdtempSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const user_data = mkdtempSync(join(tmpdir(), "cdp-dbg-"));
const chromePaths = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
];
const chrome = chromePaths.find((p) => existsSync(p));
const proc = spawn(chrome, [
  `--remote-debugging-port=${DEBUG_PORT}`,
  `--user-data-dir=${user_data}`,
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
  "about:blank",
]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let pageWsUrl;
for (let i = 0; i < 40; i++) {
  try {
    const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
    const page = (await res.json()).find((t) => t.type === "page");
    if (page) { pageWsUrl = page.webSocketDebuggerUrl; break; }
  } catch {}
  await sleep(250);
}
const ws = new WebSocket(pageWsUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let msgId = 0; const pending = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise((res) => { const id = ++msgId; pending.set(id, res); ws.send(JSON.stringify({ id, method, params })); });
const evalJs = async (expression) => (await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result?.result?.value;
await send("Page.enable");

for (const lang of ["en", "hi"]) {
  await send("Page.navigate", { url: `${BASE}/` });
  await sleep(2000);
  await evalJs(`window.localStorage.setItem("agrisaarthi.lang", ${JSON.stringify(lang)}); "ok"`);
  await send("Page.navigate", { url: `${BASE}/dashboard` });
  await sleep(2500);
  const text = await evalJs(
    `JSON.stringify({lang: document.documentElement.lang, h1: document.querySelector("h1")?.innerText ?? null, snippet: document.body.innerText.slice(0, 260)})`
  );
  console.log(`--- lang=${lang}\n${text}`);
}
ws.close(); proc.kill();
