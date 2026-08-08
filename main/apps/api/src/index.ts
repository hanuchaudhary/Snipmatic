import { Elysia, t } from "elysia";
import { betterAuth, OpenAPI } from "./config/auth.plugin";
import { auth } from "./config/auth";
import openapi from "@elysiajs/openapi";
import z from "zod";
import cors from "@elysiajs/cors";

const app = new Elysia()
  .use(cors({
    origin: ["http://localhost:5173"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }))
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
    }).mount(auth.handler),
  )
  .get("/health", () => {
    return {
      status: "ok",
      timestamp: new Date().toLocaleTimeString(),
      message: "Welcome to Quiz API! Visit /docs for API documentation.",
    };
  })
  .use(betterAuth)
  .listen({
    port: 8000,
    hostname: "localhost",
    error: (error) => {
      console.error("Error starting server:", error);
    },
  });

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);