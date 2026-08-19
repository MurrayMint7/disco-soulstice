import { v4 as uuidv4 } from "uuid";

/** One code per ticket. The column is a `uuid`, so the generator must emit one. */
export function generateTicketCodes(
  quantity: number,
  generate: () => string = uuidv4,
): string[] {
  return Array.from({ length: quantity }, () => generate());
}
