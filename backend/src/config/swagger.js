import path from "path";
import { fileURLToPath } from "url";
import swaggerJsdoc from "swagger-jsdoc";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function buildSwaggerSpec() {
  return swaggerJsdoc({
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Multi-Source News Digest API",
        version: "1.0.0",
        description: "RSS-backed news digest with AI summaries and clustering",
      },
      servers: [{ url: "/" }],
    },
    apis: [path.join(__dirname, "..", "swagger", "paths.js")],
  });
}
