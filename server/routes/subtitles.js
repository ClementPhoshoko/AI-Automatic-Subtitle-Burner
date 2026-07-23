const { Router } = require("express");
const { downloadSubtitles } = require("../controllers/subtitles");

const router = Router({ mergeParams: true });

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
 *         content:
 *           text/plain:
 *             schema: { type: string }
 *       404:
 *         description: Job not found or no subtitles
 */
router.get("/", downloadSubtitles);

module.exports = router;
