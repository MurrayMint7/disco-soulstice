import type { SendMerchConfirmationParams } from "@disco/email";

export interface BuildMerchConfirmationInput {
  buyerEmail: string;
  buyerName: string;
  itemTitle: string | undefined;
  size: string;
  quantity: number;
  totalInPence: number;
  orderId: number;
}

/** The item row is read after the order is written, so the title can be missing. */
export const fallbackItemTitle = "Merch Item";

export function buildMerchConfirmation(
  input: BuildMerchConfirmationInput,
): SendMerchConfirmationParams {
  return {
    buyerEmail: input.buyerEmail,
    buyerName: input.buyerName,
    itemTitle: input.itemTitle ?? fallbackItemTitle,
    size: input.size,
    quantity: input.quantity,
    totalInPence: input.totalInPence,
    orderId: input.orderId,
  };
}
