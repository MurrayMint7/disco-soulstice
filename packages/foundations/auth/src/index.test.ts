import { describe, expect, it } from "vitest";

import { AuthorizationError, hasAdminRole } from "./index";

describe("hasAdminRole", () => {
  it("is true only for the admin role", () => {
    expect(hasAdminRole({ role: "admin" })).toBe(true);
  });

  it("is false for any other role", () => {
    expect(hasAdminRole({ role: "user" })).toBe(false);
    expect(hasAdminRole({})).toBe(false);
    expect(hasAdminRole(undefined)).toBe(false);
    expect(hasAdminRole(null)).toBe(false);
  });
});

describe("AuthorizationError", () => {
  it("carries the code the caller maps onto its transport", () => {
    const error = new AuthorizationError("FORBIDDEN", "Forbidden");
    expect(error.code).toBe("FORBIDDEN");
    expect(error.message).toBe("Forbidden");
    expect(error).toBeInstanceOf(Error);
  });
});
