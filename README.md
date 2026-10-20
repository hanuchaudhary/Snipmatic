# Snipmatic local development

## Requirements

- Bun 1.3+, Python 3.12, Docker Compose, and FFmpeg with `libass` and `libx264`
- An Upstash Redis database with its TCP/TLS connection URL (`rediss://...`)
- AWS S3 credentials and bucket for video storage
- A Gemini API key for AI clip selection

## Start locally

1. Start PostgreSQL: `docker compose up -d postgres`. The Compose Redis service is optional when using Upstash.
2. Install JavaScript dependencies from the repository root: `bun install`.
3. Create `apps/api/.env` from `apps/api/.env.example` and `processor/.env` from `processor/.env.example`. Fill in S3 credentials and bucket, `BETTER_AUTH_SECRET`, and `AI_API_KEY`. Set `REDIS_URL` in both to the **same Upstash TCP/TLS URL** from Connect → TCP, beginning with `rediss://`. The Upstash REST URL and token are different credentials and cannot be used as `REDIS_URL` here. The processor's `.env` supplies its AI key; it inherits the API process's Redis and AWS variables.
4. Set `DATABASE_URL` in `packages/db/.env` using the value from `apps/api/.env.example`. Generate the Prisma client and apply migrations: `bun run db:generate` then `bun run db:deploy`.
5. Create a Python 3.12 virtual environment at `processor/.venv`, then install packages: `cd processor && python3.12 -m venv .venv && .venv/bin/pip install -r requirements.txt && cd ..`. On a machine without `python3.12` on PATH, use its full path.
6. Start the API and queue worker: `cd apps/api && bun run dev`. In another terminal, start the client: `cd apps/client && bun run dev`.
7. Open `http://localhost:5173`. API docs are at `http://localhost:8000/docs`.

The processor publishes progress and completion to Redis; the API worker writes the database updates and acknowledges them. Keep the worker running while processing clips. An account needs credits to submit a clip; for a local test account, open Prisma Studio with `bun run db:studio` and set its `UserBilling.creditsBalance` to a positive value. Email verification links are logged by the API in local development.

For cloud processing, configure Modal credentials in the API, and deploy `processor/app/processor.py` with a Modal secret containing `AI_API_KEY`, AWS S3 values, and the same Upstash `REDIS_URL`. [Upstash documents BullMQ over TLS](https://upstash.com/docs/redis/integrations/bullmq) and [Bun supports its `rediss://` URL](https://bun.sh/guides/ecosystem/upstash).
