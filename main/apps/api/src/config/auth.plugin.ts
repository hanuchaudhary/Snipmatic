import Elysia from "elysia";

import { auth } from "./auth";

let _schema: ReturnType<typeof auth.api.generateOpenAPISchema>;
const getSchema = async () => (_schema ??= auth.api.generateOpenAPISchema());

export const OpenAPI = {
  getPaths: (prefix = "/api/auth") =>
    getSchema().then(({ paths }) => {
      const reference: typeof paths = Object.create(null);

      for (const path of Object.keys(paths)) {
        const key = prefix + path;
        reference[key] = paths[path]!;

        for (const method of Object.keys(paths[path]!)) {
          const operation = (reference[key] as any)[method];
          operation.tags = ["Authentication"];
        }
      }

      return reference;
    }) as Promise<any>,
  components: getSchema().then(({ components }) => components) as Promise<any>,
} as const;

export const withAuth = new Elysia({ name: "with-auth" }).macro({
  auth: {
    async resolve({ status, request: { headers } }) {
      const session = await auth.api.getSession({
        headers,
      });

      if (!session) return status(401);

      return {
        user: session.user,
        session: session.session,
      };
    },
  },
});

export const betterAuth = new Elysia({ name: "better-auth" })
  .use(withAuth)
  .mount(auth.handler);
