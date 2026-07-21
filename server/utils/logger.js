const isDev = process.env.NODE_ENV !== "production";

function format(level, msg, meta) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message: msg,
    ...(meta && Object.keys(meta).length ? { ...meta } : {}),
  };

  if (isDev) {
    const tag = `[${level.toUpperCase()}]`;
    const extra = meta && Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${tag} ${msg}${extra}`;
  }

  return JSON.stringify(entry);
}

const logger = {
  info(msg, meta) { console.log(format("info", msg, meta)); },
  warn(msg, meta) { console.warn(format("warn", msg, meta)); },
  error(msg, meta) { console.error(format("error", msg, meta)); },
  debug(msg, meta) {
    if (isDev) console.log(format("debug", msg, meta));
  },
};

module.exports = logger;
