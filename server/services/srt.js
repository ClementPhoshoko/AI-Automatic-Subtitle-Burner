function formatSrtTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds - Math.floor(seconds)) * 1000);

  return (
    String(h).padStart(2, "0") + ":" +
    String(m).padStart(2, "0") + ":" +
    String(s).padStart(2, "0") + "," +
    String(ms).padStart(3, "0")
  );
}

function transcriptToSrt(transcript) {
  if (!Array.isArray(transcript) || transcript.length === 0) {
    return "";
  }

  const lines = [];

  transcript.forEach((entry, index) => {
    const start = formatSrtTime(entry.start);
    const end = formatSrtTime(entry.end);
    const text = (entry.text || "").replace(/\n/g, "\r\n");

    lines.push(String(index + 1));
    lines.push(`${start} --> ${end}`);
    lines.push(text);
    lines.push("");
  });

  return lines.join("\n");
}

module.exports = { transcriptToSrt };
