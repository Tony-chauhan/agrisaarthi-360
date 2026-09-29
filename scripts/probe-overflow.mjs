/**
 * Overflow + console-error probe using headless Chrome via CDP
 * (Node 22+ native WebSocket — no new dependencies).
 *
 * Usage: node scripts/probe-overflow.mjs [baseUrl] [port]
 * Measures document scrollWidth vs viewport width on the landing page,
 * including after a full scroll (pinned journey engaged), and collects
 * console errors / page errors.
 */

const BASE = process.argv[2] ?? "http://localhost:3107";
const DEBUG_PORT = process.argv[3] ?? "9223";
const WIDTHS = [375, 390, 414, 768, 1024, 1280, 1440];

import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const user_data = mkdtempSync(join(tmpdir(), "cdp-probe-"));

const chromePaths = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
];
const { existsSync } = await import("node:fs");
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
  "--window-size=1440,900",
  "about:blank",
]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Wait for the DevTools endpoint, then attach to the PAGE target
// (Runtime.evaluate is unavailable on the browser-level endpoint).
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
    consoleErrors.push(msg.params.args?.map((a) => a.value ?? a.description).join(" "));
  } else if (msg.method === "Runtime.exceptionThrown") {
    consoleErrors.push(msg.params.exceptionDetails?.exception?.description ?? "page exception");
  }
};

function send(method, params = {}) {
  const id = ++msgId;
  return new Promise((resolve) => {
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

await send("Runtime.enable");
await send("Page.enable");

let failures = 0;
for (const width of WIDTHS) {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height: 900,
    deviceScaleFactor: 1,
    mobile: width < 768,
  });
  await send("Page.navigate", { url: BASE });
  await sleep(2500);

  const evalScroll = async () => {
    const r = await send("Runtime.evaluate", {
      expression:
        "JSON.stringify({sw: document.documentElement.scrollWidth, iw: window.innerWidth, bw: document.body ? document.body.scrollWidth : 0})",
      returnByValue: true,
    });
    try {
      return JSON.parse(r.result?.result?.value ?? "{}");
    } catch {
      return null;
    }
  };

  let m = await evalScroll();
  const before = m ? `${m.sw}x${m.iw}` : "n/a";

  // Scroll through the whole page so the GSAP pin/spacer is engaged.
  await send("Runtime.evaluate", {
    expression: "window.scrollTo(0, document.body.scrollHeight)",
  });
  await sleep(1800);
  m = await evalScroll();

  const overflow = m && Math.max(m.sw, m.bw) > m.iw + 1;
  if (overflow) failures++;
  console.log(
    `${width}px: before-scroll ${before}, after-scroll ${m ? `${Math.max(m.sw, m.bw)}x${m.iw}` : "n/a"} ${overflow ? "OVERFLOW" : "OK"}`
  );
}

console.log(
  consoleErrors.length === 0
    ? "console: clean"
    : `console errors (${consoleErrors.length}):\n` + consoleErrors.slice(0, 10).join("\n")
);

ws.close();
proc.kill();
process.exit(failures === 0 && consoleErrors.length === 0 ? 0 : 1);
