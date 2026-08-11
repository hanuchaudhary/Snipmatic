import cors from "@elysiajs/cors";
import openapi from "@elysiajs/openapi";
import { Elysia, t } from "elysia";
import { serve } from "inngest/bun";
import z from "zod";

import { auth } from "./config/auth";
import { betterAuth, OpenAPI } from "./config/auth.plugin";
import { functions, inngest } from "./inngest";
import { clip } from "./modules/clip";
import { payment } from "./modules/payment";

const handler = serve({
  client: inngest,
  functions,
});

const inngestHandler = new Elysia().all("/api/inngest", ({ request }) =>
  handler(request)
);

const app = new Elysia()
  .use(inngestHandler)
  .use(
    cors({
      origin: ["http://localhost:5173"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    })
  )
  .use(
    openapi({
      mapJsonSchema: {
        zod: z.toJSONSchema,
      },
      documentation: {
        info: {
          title: "Quiz API",
          description:
            "API for Quiz, a quiz application that helps you create and manage quizzes.",
          version: "1.0.0",
        },

        components: await OpenAPI.components,
        paths: await OpenAPI.getPaths(),
        tags: [
          {
            name: "Quiz",
            description:
              "Endpoints for managing quizzes and retrieving quiz data",
          },
          {
            name: "Session",
            description:
              "Endpoints for managing sessions and retrieving session data",
          },
        ],
      },
    }).mount(auth.handler)
  )
  .get("/health", () => {
    return {
      status: "ok",
      timestamp: new Date().toLocaleTimeString(),
      message: "Welcome to Quiz API! Visit /docs for API documentation.",
    };
  })
  .use(betterAuth)
  .use(payment)
  .use(clip)
  .listen({
    port: 8000,
    hostname: "0.0.0.0",
    error: (error) => {
      console.error("Error starting server:", error);
    },
  });

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
