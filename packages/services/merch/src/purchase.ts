/**
 * The availability, per-order and stock guards from
 * `merchRouter.createCheckoutSession`, lifted verbatim, messages included.
 *
 * Like the ticketing guards, these return a problem rather than throwing, so a
 * router can write `if (problem) throw new TRPCError(problem)` without this
 * package depending on tRPC.
 */

export interface PurchaseProblem {
  code: "BAD_REQUEST" | "CONFLICT" | "NOT_FOUND";
  message: string;
}

export interface PurchasableMerchItem {
  status: string;
  maxPerOrder: number;
}

export interface MerchStock {
  stock: number;
  sold: number;
}

export function checkMerchItemPurchase(
  item: PurchasableMerchItem,
  quantity: number,
): PurchaseProblem | null {
  if (item.status !== "available") {
    return {
      code: "BAD_REQUEST",
      message: "Item is not available for purchase",
    };
  }
  if (quantity > item.maxPerOrder) {
    return {
      code: "BAD_REQUEST",
      message: `Maximum ${item.maxPerOrder} per order`,
    };
  }
  return null;
}

export function checkMerchStock(
  size: MerchStock,
  quantity: number,
): PurchaseProblem | null {
  const available = size.stock - size.sold;
  if (available < quantity) {
    return { code: "CONFLICT", message: "Not enough stock available" };
  }
  return null;
}

export function calculateMerchTotal(
  priceInPence: number,
  quantity: number,
): number {
  return priceInPence * quantity;
}
