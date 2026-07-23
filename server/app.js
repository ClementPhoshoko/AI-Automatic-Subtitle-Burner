const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const os = require("os");
const swaggerUi = require("swagger-ui-express");
dotenv.config();

const jobsRouter = require("./routes/jobs");
const swaggerSpec = require("./docs/swagger");
const worker = require("./workers/processor");
const logger = require("./utils/logger");

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

/* ─── Swagger ─── */

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* ─── Routes ─── */

app.use("/api/jobs", jobsRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/* ─── Static frontend (production) ─── */

const clientDist = path.join(__dirname, "..", "client", "dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

/* ─── Error handler ─── */

app.use((err, req, res, next) => {
  logger.error("Unhandled error", { error: err.message, method: req.method, path: req.path });
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal server error" });
});

/* ─── Start ─── */

const PORT = process.env.PORT || 3001;

const tmpDir = path.join(os.tmpdir(), "subtitle-burner");
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

const server = app.listen(PORT, () => {
  logger.info("Server started", { port: PORT, env: process.env.NODE_ENV || "development" });
  if (process.env.WORKER_ENABLED === "true") {
    worker.start();
    logger.info("Worker enabled");
  } else {
    logger.info("Worker disabled (set WORKER_ENABLED=true to enable)");
  }
});

/* ─── Graceful shutdown ─── */

async function shutdown(signal) {
  logger.info(`Received ${signal}, shutting down gracefully...`);

  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
