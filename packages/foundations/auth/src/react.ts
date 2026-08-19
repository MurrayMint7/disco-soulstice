/**
 * Clerk's React surface, re-exported so app code never imports `@clerk/nextjs`
 * directly. Clerk's own modules carry their `"use client"` directives, so the
 * client boundary stays where Clerk puts it.
 */
export {
  ClerkProvider,
  SignIn,
  SignInButton,
  SignUp,
  UserButton,
  useAuth,
} from "@clerk/nextjs";
