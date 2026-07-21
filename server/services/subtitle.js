const fs = require("fs");
const path = require("path");

const STYLES = {
  classic: {
    Fontname: "Arial",
    Fontsize: 48,
    PrimaryColour: "&H00FFFFFF",
    SecondaryColour: "&H000000FF",
    OutlineColour: "&H00000000",
    BackColour: "&H80000000",
    Bold: 0,
    BorderStyle: 1,
    Outline: 2,
    Shadow: 1,
    Alignment: 2,
    MarginV: 40,
  },
  tiktok: {
    Fontname: "Arial",
    Fontsize: 56,
    PrimaryColour: "&H00FFFFFF",
    SecondaryColour: "&H000000FF",
    OutlineColour: "&H00000000",
    BackColour: "&H00000000",
    Bold: 1,
    BorderStyle: 1,
    Outline: 4,
    Shadow: 0,
    Alignment: 2,
    MarginV: 30,
  },
  minimal: {
    Fontname: "Segoe UI",
    Fontsize: 36,
    PrimaryColour: "&H00CCCCCC",
    SecondaryColour: "&H000000FF",
    OutlineColour: "&H00000000",
    BackColour: "&H00000000",
    Bold: 0,
    BorderStyle: 1,
    Outline: 1,
    Shadow: 0,
    Alignment: 2,
    MarginV: 20,
  },
  cinema: {
    Fontname: "Georgia",
    Fontsize: 52,
    PrimaryColour: "&H00FFFFFF",
    SecondaryColour: "&H000000FF",
    OutlineColour: "&H00000000",
    BackColour: "&H00000000",
    Bold: 0,
    BorderStyle: 1,
    Outline: 2,
    Shadow: 2,
    Alignment: 2,
    MarginV: 50,
  },
};

function secondsToAss(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const cs = Math.round((s - Math.floor(s)) * 100);
  const ss = Math.floor(s);
  return `${String(h).padStart(1, "0")}:${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

function escapeAss(text) {
  return text
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/\n/g, "\\N");
}

function buildAss(transcript, style) {
  const s = STYLES[style] || STYLES.classic;
  const styleFormat = [
    s.Fontname,
    s.Fontsize,
    s.PrimaryColour,
    s.SecondaryColour,
    s.OutlineColour,
    s.BackColour,
    s.Bold,
    0, 0, 0,
    100, 100, 0, 0,
    s.BorderStyle,
    s.Outline,
    s.Shadow,
    s.Alignment,
    10, 10, s.MarginV,
    1,
  ].join(",");

  const lines = [
    "[Script Info]",
    "Title: AI Subtitle Burner",
    "ScriptType: v4.00+",
    "Collisions: Normal",
    "PlayResX: 1920",
    "PlayResY: 1080",
    "",
    "[V4+ Styles]",
    "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
    `Style: Default,${styleFormat}`,
    "",
    "[Events]",
    "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
  ];

  for (const entry of transcript) {
    const start = secondsToAss(entry.start);
    const end = secondsToAss(entry.end);
    const text = escapeAss(entry.text);
    lines.push(`Dialogue: 0,${start},${end},Default,,0,0,0,,${text}`);
  }

  return lines.join("\n");
}

async function generateAss(transcript, style, outputDir) {
  const assContent = buildAss(transcript, style);
  const outputPath = path.join(outputDir, "subtitles.ass");
  fs.writeFileSync(outputPath, assContent, "utf-8");
  return outputPath;
}

module.exports = { generateAss };
