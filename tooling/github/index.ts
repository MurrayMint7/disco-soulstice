export const requiredCiCommands = [
  "pnpm lint",
  "pnpm boundaries",
  "pnpm test",
  "pnpm typecheck",
  "pnpm build",
] as const;

export const localVerificationCommand = "pnpm verify";
