import { WEB_URL } from "@snipmatic/utils";

export const webOrigins = [
  ...new Set(
    [WEB_URL, process.env.WEB_URL, "http://localhost:3000"]
      .filter((origin): origin is string => Boolean(origin))
      .map((origin) => new URL(origin).origin)
  ),
];
