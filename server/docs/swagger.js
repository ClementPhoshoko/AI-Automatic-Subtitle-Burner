const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AI Subtitle Burner API",
      version: "1.0.0",
      description: "Upload videos, generate subtitles via AI, and burn them into videos.",
    },
    servers: [{ url: "http://localhost:3001", description: "Development" }],
  },
  apis: ["./routes/*.js", "./docs/*.yaml"],
};

module.exports = swaggerJsdoc(options);
