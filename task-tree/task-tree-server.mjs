#!/usr/bin/env node

import { spawn } from "node:child_process";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const defaultEntryPath = "/task-tree/";
const defaultDocsPath = "specs";
const defaultHost = process.env.HOST || "127.0.0.1";
const defaultPort = Number.parseInt(process.env.PORT || "", 10) || 4173;
const maxPortAttempts = 20;

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".md", "text/markdown; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
]);

function printHelp() {
  console.log(`Loom task tree server

Usage:
  npm run task-tree
  npm run task-tree -- --port 4174 --open

Options:
  --host <host>   Bind host, defaults to 127.0.0.1
  --port <port>   Bind port, defaults to 4173
  --docs <path>   Docs root (specs dir) for task/spec files, defaults to specs
  --open          Open the task tree page in the default browser
  --entry <path>  Entry path to open, defaults to /task-tree/
  --help          Show this help message
`);
}

function parseArgs(argv) {
  const options = {
    docsPath: defaultDocsPath,
    entryPath: defaultEntryPath,
    host: defaultHost,
    open: false,
    port: defaultPort,
    explicitPort: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }

    if (arg === "--open") {
      options.open = true;
      continue;
    }

    if (arg === "--host") {
      options.host = argv[index + 1] || options.host;
      index += 1;
      continue;
    }

    if (arg.startsWith("--host=")) {
      options.host = arg.slice("--host=".length) || options.host;
      continue;
    }

    if (arg === "--port") {
      const value = argv[index + 1];
      const parsed = Number.parseInt(value || "", 10);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new Error(`Invalid port value: ${value}`);
      }
      options.port = parsed;
      options.explicitPort = true;
      index += 1;
      continue;
    }

    if (arg.startsWith("--port=")) {
      const value = arg.slice("--port=".length);
      const parsed = Number.parseInt(value, 10);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new Error(`Invalid port value: ${value}`);
      }
      options.port = parsed;
      options.explicitPort = true;
      continue;
    }

    if (arg === "--docs") {
      options.docsPath = argv[index + 1] || options.docsPath;
      index += 1;
      continue;
    }

    if (arg.startsWith("--docs=")) {
      options.docsPath = arg.slice("--docs=".length) || options.docsPath;
      continue;
    }

    if (arg === "--entry") {
      options.entryPath = argv[index + 1] || options.entryPath;
      index += 1;
      continue;
    }

    if (arg.startsWith("--entry=")) {
      options.entryPath = arg.slice("--entry=".length) || options.entryPath;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!options.entryPath.startsWith("/")) {
    options.entryPath = `/${options.entryPath}`;
  }

  return options;
}

function contentTypeFor(filePath) {
  return (
    mimeTypes.get(extname(filePath).toLowerCase()) || "application/octet-stream"
  );
}

function resolveRequestPath(pathname) {
  const decodedPath = decodeURIComponent(pathname);
  const relativePath = decodedPath.replace(/^\/+/, "");
  const filePath = resolve(repoRoot, relativePath);
  const rootPrefix = `${repoRoot}${sep}`;

  if (filePath !== repoRoot && !filePath.startsWith(rootPrefix)) {
    return null;
  }

  return filePath;
}

function sendText(response, statusCode, body, headers = {}) {
  response.writeHead(statusCode, {
    "Cache-Control": "no-store",
    "Content-Type": "text/plain; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    ...headers,
  });
  response.end(body);
}

function sendJson(response, statusCode, data, headers = {}) {
  const body = JSON.stringify(data);
  response.writeHead(statusCode, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    ...headers,
  });
  response.end(body);
}

async function handleRequest(request, response, options) {
  const method = request.method || "GET";
  if (method !== "GET" && method !== "HEAD") {
    sendText(response, 405, "Method not allowed");
    return;
  }

  const requestUrl = new URL(
    request.url || "/",
    `http://${options.host}:${options.port}`,
  );

  if (requestUrl.pathname === "/") {
    response.writeHead(302, {
      Location: options.entryPath,
      "Cache-Control": "no-store",
    });
    response.end();
    return;
  }

  if (requestUrl.pathname === "/favicon.ico") {
    response.writeHead(204, { "Cache-Control": "no-store" });
    response.end();
    return;
  }

  const configPath =
    (options.entryPath.replace(/\/$/, "") || "/task-tree") + "/config.json";
  if (requestUrl.pathname === configPath) {
    sendJson(response, 200, { docsPath: options.docsPath });
    return;
  }

  let filePath = resolveRequestPath(requestUrl.pathname);
  if (!filePath) {
    sendText(response, 403, "Forbidden");
    return;
  }

  let fileStats;
  try {
    fileStats = await stat(filePath);
  } catch {
    sendText(response, 404, `Not found: ${requestUrl.pathname}`);
    return;
  }

  if (fileStats.isDirectory()) {
    filePath = join(filePath, "index.html");
    try {
      fileStats = await stat(filePath);
    } catch {
      sendText(
        response,
        404,
        `Directory listing is disabled: ${requestUrl.pathname}`,
      );
      return;
    }
  }

  response.writeHead(200, {
    "Cache-Control": "no-store",
    "Content-Length": fileStats.size,
    "Content-Type": contentTypeFor(filePath),
    "X-Content-Type-Options": "nosniff",
  });

  if (method === "HEAD") {
    response.end();
    return;
  }

  const stream = createReadStream(filePath);
  stream.on("error", () => {
    if (!response.headersSent) {
      sendText(response, 500, `Failed to read: ${requestUrl.pathname}`);
      return;
    }
    response.destroy();
  });
  stream.pipe(response);
}

function maybeOpenBrowser(url) {
  const command =
    process.platform === "darwin"
      ? ["open", [url]]
      : process.platform === "win32"
        ? ["cmd", ["/c", "start", "", url]]
        : ["xdg-open", [url]];

  const child = spawn(command[0], command[1], {
    detached: true,
    stdio: "ignore",
  });
  child.on("error", () => {
    console.warn(`Could not open browser automatically. Open ${url} manually.`);
  });
  child.unref();
}

async function listenOnPort(options, port) {
  const server = createServer((request, response) => {
    handleRequest(request, response, { ...options, port }).catch((error) => {
      console.error("Unexpected request error:", error);
      if (!response.headersSent) {
        sendText(response, 500, "Internal server error");
        return;
      }
      response.destroy();
    });
  });

  await new Promise((resolvePromise, rejectPromise) => {
    server.once("error", rejectPromise);
    server.listen(port, options.host, () => {
      server.off("error", rejectPromise);
      resolvePromise();
    });
  });

  return server;
}

async function startServer(options) {
  for (let offset = 0; offset < maxPortAttempts; offset += 1) {
    const candidatePort = options.port + offset;
    try {
      const server = await listenOnPort(options, candidatePort);
      return { port: candidatePort, server };
    } catch (error) {
      if (error.code !== "EADDRINUSE" || options.explicitPort) {
        throw error;
      }
    }
  }

  throw new Error(
    `Could not find a free port in the range ${options.port}-${options.port + maxPortAttempts - 1}.`,
  );
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  const { port, server } = await startServer(options);
  const url = `http://${options.host}:${port}${options.entryPath}`;

  console.log(`Task tree server running at ${url}`);
  console.log("Press Ctrl+C to stop.");

  if (options.open) {
    maybeOpenBrowser(url);
  }

  const shutdown = () => {
    server.close(() => {
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
