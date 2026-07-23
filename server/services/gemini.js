const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const logger = require("../utils/logger");

const API_KEY = process.env.GEMINI_API_KEY;

const FALLBACK_CHAIN = [
  "gemini-3.5-flash",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
];

const MAX_RETRIES_PER_MODEL = 2;
const RETRY_BASE_DELAY = 2000;

const PROMPT = `Transcribe the speech in this audio file and return ONLY a JSON array.
No markdown, no code fences, no explanation.

Each element must have:
- "start": start time in seconds (number)
- "end": end time in seconds (number)
- "text": the spoken words (string)

Rules:
- Split into readable segments (one sentence or phrase per entry).
- Do not merge different speakers.
- Use realistic timestamps matching the audio.
- Return ONLY the JSON array. Nothing else.

Example:
[{"start":0.0,"end":1.2,"text":"Hello everyone"}]`;

function parseTranscript(text) {
  let cleaned = text.trim();

  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  }

  const parsed = JSON.parse(cleaned);

  if (!Array.isArray(parsed)) {
    throw new Error("Gemini response is not an array");
  }

  for (const entry of parsed) {
    if (typeof entry.start !== "number" || typeof entry.end !== "number" || typeof entry.text !== "string") {
      throw new Error("Invalid transcript entry format");
    }
  }

  return parsed;
}

function isTransientError(err) {
  const msg = err.message || "";
  return (
    msg.includes("429") ||
    msg.includes("503") ||
    msg.includes("quota") ||
    msg.includes("overloaded") ||
    msg.includes("Service Unavailable") ||
    msg.includes("resource has been exhausted") ||
    msg.includes("rate limit")
  );
}

async function tryModel(genAI, modelName, audioBase64, mimeType) {
  const model = genAI.getGenerativeModel({ model: modelName });

  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES_PER_MODEL; attempt++) {
    try {
      const result = await model.generateContent([
        { text: PROMPT },
        {
          inlineData: {
            mimeType,
            data: audioBase64,
          },
        },
      ]);

      const response = result.response;
      const text = response.text();

      if (!text || text.trim().length === 0) {
        throw new Error("Empty response from Gemini");
      }

      const transcript = parseTranscript(text);

      if (transcript.length === 0) {
        throw new Error("Gemini returned an empty transcript");
      }

      return transcript;
    } catch (err) {
      lastError = err;

      if (isTransientError(err) && attempt < MAX_RETRIES_PER_MODEL) {
        const delay = RETRY_BASE_DELAY * Math.pow(2, attempt - 1);
        logger.warn(`[${modelName}] Attempt ${attempt} failed, retrying in ${delay}ms...`, { error: err.message });
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      throw err;
    }
  }

  throw lastError;
}

async function transcribeAudio(audioPath) {
  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  if (!fs.existsSync(audioPath)) {
    throw new Error(`Audio file not found: ${audioPath}`);
  }

  const audioData = fs.readFileSync(audioPath);
  const base64Audio = audioData.toString("base64");
  const mimeType = audioPath.endsWith(".mp3") ? "audio/mp3" : "audio/mpeg";

  const genAI = new GoogleGenerativeAI(API_KEY);

  let lastError;

  for (const modelName of FALLBACK_CHAIN) {
    try {
      logger.info(`Trying model: ${modelName}`);
      const transcript = await tryModel(genAI, modelName, base64Audio, mimeType);
      logger.info(`Transcription succeeded with: ${modelName}`);
      return transcript;
    } catch (err) {
      lastError = err;
      logger.warn(`[${modelName}] All attempts failed`, { error: err.message });
      continue;
    }
  }

  throw new Error(`Transcription failed on all models: ${lastError.message}`);
}

module.exports = { transcribeAudio };
