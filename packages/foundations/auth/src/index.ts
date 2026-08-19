import { auth, clerkClient } from "@clerk/nextjs/server";

/**
 * The one place Clerk is spoken to on the server. Nothing else in the workspace
 * imports `@clerk/nextjs` except `apps/nextjs/src/middleware.ts`, which Next.js
 * requires at the app root, and `@disco/auth/react` for the UI components.
 */

export type AuthorizationErrorCode = "UNAUTHORIZED" | "FORBIDDEN";

/**
 * Thrown by the guards below so callers can map an authorization failure onto
 * their own transport — a `TRPCError` in `@disco/trpc`, an HTTP status in a
 * route handler — without this package knowing about either.
 */
export class AuthorizationError extends Error {
  readonly code: AuthorizationErrorCode;

  constructor(code: AuthorizationErrorCode, message: string) {
    super(message);
    this.name = "AuthorizationError";
    this.code = code;
  }
}

export interface UserProfile {
  email: string;
  name: string;
}

/** Pure predicate over Clerk's `publicMetadata`, so the rule is testable. */
export function hasAdminRole(publicMetadata: unknown): boolean {
  return (
    typeof publicMetadata === "object" &&
    publicMetadata !== null &&
    (publicMetadata as { role?: unknown }).role === "admin"
  );
}

export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

export async function requireCurrentUserId(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new AuthorizationError("UNAUTHORIZED", "Unauthorized");
  }
  return userId;
}

export async function isAdmin(userId: string): Promise<boolean> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  return hasAdminRole(user.publicMetadata);
}

/**
 * Throws `AuthorizationError("UNAUTHORIZED")` when there is no user and
 * `AuthorizationError("FORBIDDEN")` when the user is not an admin.
 */
export async function requireAdmin(
  userId: string | null | undefined,
): Promise<string> {
  if (!userId) {
    throw new AuthorizationError("UNAUTHORIZED", "Unauthorized");
  }
  if (!(await isAdmin(userId))) {
    throw new AuthorizationError("FORBIDDEN", "Forbidden");
  }
  return userId;
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  return {
    email: user.emailAddresses[0]?.emailAddress ?? "",
    name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
  };
}
