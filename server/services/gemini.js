const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const MAX_RETRIES = 3;

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

async function transcribeAudio(audioPath) {
  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  if (!fs.existsSync(audioPath)) {
    throw new Error(`Audio file not found: ${audioPath}`);
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL });

  const audioData = fs.readFileSync(audioPath);
  const base64Audio = audioData.toString("base64");

  const mimeType = audioPath.endsWith(".mp3") ? "audio/mp3" : "audio/mpeg";

  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await model.generateContent([
        { text: PROMPT },
        {
          inlineData: {
            mimeType,
            data: base64Audio,
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

      const isRateLimit = err.message?.includes("429") || err.message?.includes("quota");
      const isOverload = err.message?.includes("503") || err.message?.includes("overloaded");

      if (attempt < MAX_RETRIES && (isRateLimit || isOverload)) {
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(`[Gemini] Attempt ${attempt} failed (${err.message}), retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      break;
    }
  }

  throw new Error(`Gemini transcription failed after ${MAX_RETRIES} attempts: ${lastError.message}`);
}

module.exports = { transcribeAudio };
