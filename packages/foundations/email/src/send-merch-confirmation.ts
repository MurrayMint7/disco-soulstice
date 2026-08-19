import { resend } from "./resend";

export interface SendMerchConfirmationParams {
  buyerEmail: string;
  buyerName: string;
  itemTitle: string;
  size: string;
  quantity: number;
  totalInPence: number;
  orderId: number;
}

export async function sendMerchConfirmation(
  params: SendMerchConfirmationParams,
) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h1 style="font-size: 24px; font-weight: bold;">Order Confirmed</h1>
      <p>Hi ${params.buyerName},</p>
      <p>Your merch order has been confirmed!</p>

      <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <h2 style="font-size: 18px; margin-bottom: 8px;">Order Details</h2>
        <p><strong>${params.itemTitle}</strong></p>
        <p>Size: ${params.size}</p>
        <p>Quantity: ${params.quantity}</p>
        <p>Total: £${(params.totalInPence / 100).toFixed(2)}</p>
        <p style="font-size: 12px; color: #6b7280; margin-top: 8px;">Order #${params.orderId}</p>
      </div>

      <p>We'll let you know when your order is ready for collection.</p>
    </div>
  `;

  await resend.emails.send({
    from: "Disco Soulstice <tickets@discosoulstice.com>",
    to: params.buyerEmail,
    subject: `Order confirmed — ${params.itemTitle}`,
    html,
  });
}
