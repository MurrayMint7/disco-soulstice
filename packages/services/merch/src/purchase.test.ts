import { describe, expect, it } from "vitest";

import {
  calculateMerchTotal,
  checkMerchItemPurchase,
  checkMerchStock,
} from "./purchase";

describe("checkMerchItemPurchase", () => {
  const available = { status: "available", maxPerOrder: 2 };

  it("allows a purchase within the per-order limit", () => {
    expect(checkMerchItemPurchase(available, 2)).toBeNull();
  });

  it("refuses any status other than available", () => {
    for (const status of ["coming-soon", "sold-out", "discontinued"]) {
      expect(checkMerchItemPurchase({ ...available, status }, 1)).toEqual({
        code: "BAD_REQUEST",
        message: "Item is not available for purchase",
      });
    }
  });

  it("refuses more than maxPerOrder, naming the limit", () => {
    expect(checkMerchItemPurchase(available, 3)).toEqual({
      code: "BAD_REQUEST",
      message: "Maximum 2 per order",
    });
  });
});

describe("checkMerchStock", () => {
  it("counts availability as stock minus sold", () => {
    expect(checkMerchStock({ stock: 10, sold: 8 }, 2)).toBeNull();
    expect(checkMerchStock({ stock: 10, sold: 9 }, 2)).toEqual({
      code: "CONFLICT",
      message: "Not enough stock available",
    });
  });

  it("refuses a sold-out size", () => {
    expect(checkMerchStock({ stock: 5, sold: 5 }, 1)?.code).toBe("CONFLICT");
  });
});

describe("calculateMerchTotal", () => {
  it("is price times quantity", () => {
    expect(calculateMerchTotal(2500, 2)).toBe(5000);
  });
});
