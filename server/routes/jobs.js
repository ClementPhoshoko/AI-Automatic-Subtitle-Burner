const { Router } = require("express");
const rateLimit = require("express-rate-limit");
const upload = require("../middleware/upload");
const {
  uploadVideo,
  listJobs,
  getJob,
  processJob,
  deleteJob,
  getQueue,
} = require("../controllers/jobs");
const subtitlesRouter = require("./subtitles");

const router = Router();

const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: "Too many uploads. Try again in a minute." },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @openapi
 * /api/jobs/upload:
 *   post:
 *     tags: [Jobs]
 *     summary: Upload a video and create a processing job
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [video]
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *               subtitle_style:
 *                 type: string
 *                 enum: [classic, tiktok, minimal, cinema, apple, netflix, youtube]
 *                 default: classic
 *     responses:
 *       201:
 *         description: Job created
 *       400:
 *         description: Invalid file or style
 */
router.post("/upload", uploadLimiter, upload.single("video"), uploadVideo);

/**
 * @openapi
 * /api/jobs:
 *   get:
 *     tags: [Jobs]
 *     summary: List all jobs
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200:
 *         description: List of jobs
 */
router.get("/", listJobs);

/**
 * @openapi
 * /api/jobs/queue:
 *   get:
 *     tags: [Jobs]
 *     summary: Get queue status and pending jobs
 *     responses:
 *       200:
 *         description: Queue details with processing/queued counts
 */
router.get("/queue", getQueue);

/**
 * @openapi
 * /api/jobs/{id}:
 *   get:
 *     tags: [Jobs]
 *     summary: Get a single job by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Job details
 *       404:
 *         description: Job not found
 */
router.get("/:id", getJob);

/**
 * @openapi
 * /api/jobs/{id}/process:
 *   post:
 *     tags: [Jobs]
 *     summary: Manually trigger processing for a queued job
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Processing started
 *       400:
 *         description: Job not in queued status
 *       404:
 *         description: Job not found
 */
router.post("/:id/process", processJob);

/**
 * @openapi
 * /api/jobs/{id}:
 *   delete:
 *     tags: [Jobs]
 *     summary: Delete a job and its storage files
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Job deleted
 *       404:
 *         description: Job not found
 */
router.delete("/:id", deleteJob);

/**
 * @openapi
 * /api/jobs/{id}/subtitles:
 *   get:
 *     tags: [Subtitles]
 *     summary: Download subtitles as .srt file
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: SRT subtitle file
 *       404:
 *         description: Job not found or no subtitles
 */
router.use("/:id/subtitles", subtitlesRouter);

module.exports = router;
