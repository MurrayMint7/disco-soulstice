import { type Config } from "drizzle-kit";

import { env } from "@disco/env";

export default {
  schema: "../../packages/foundations/db/src/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  tablesFilter: ["disco-soulstice_*"],
} satisfies Config;
