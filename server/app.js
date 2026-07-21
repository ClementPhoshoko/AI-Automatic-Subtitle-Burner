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

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/jobs", jobsRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 3001;

const tmpDir = path.join(os.tmpdir(), "subtitle-burner");
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (process.env.WORKER_ENABLED === "true") {
    worker.start();
  } else {
    console.log("Worker disabled (set WORKER_ENABLED=true to enable)");
  }
});