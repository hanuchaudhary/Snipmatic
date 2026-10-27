import { status } from "elysia";
import { timingSafeEqual } from "node:crypto";

export function requireProcessorAuth(headers: Headers) {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw status(503, "Processor API key is not configured");

  const authorization = headers.get("authorization");
  const supplied = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : "";
  const expectedBuffer = Buffer.from(apiKey);
  const suppliedBuffer = Buffer.from(supplied);
  if (
    suppliedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(suppliedBuffer, expectedBuffer)
  ) {
    throw status(401, "Invalid processor API key");
  }
}
