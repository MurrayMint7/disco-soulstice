import { describe, expect, it } from "vitest";

import { generateTicketCodes } from "./codes";

describe("generateTicketCodes", () => {
  it("emits one code per ticket", () => {
    expect(generateTicketCodes(3)).toHaveLength(3);
    expect(generateTicketCodes(0)).toEqual([]);
  });

  it("emits unique codes", () => {
    const codes = generateTicketCodes(50);
    expect(new Set(codes).size).toBe(50);
  });

  it("emits uuids, because the ticketCode column is a uuid", () => {
    const [code] = generateTicketCodes(1);
    expect(code).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });
});
