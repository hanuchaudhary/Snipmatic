declare const process: { env: { [key: string]: string | undefined } };

export const WEB_URL = process.env.WEB_URL || "http://localhost:5173";
export const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";