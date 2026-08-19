import QRCode from "qrcode";
import { resend } from "~/server/resend";

interface SendTicketConfirmationParams {
  buyerEmail: string;
  buyerName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventVenue: string;
  eventLocation: string;
  orderId: number;
  quantity: number;
  totalInPence: number;
  ticketCodes: string[];
}

export async function sendTicketConfirmation(
  params: SendTicketConfirmationParams,
) {
  const attachments = await Promise.all(
    params.ticketCodes.map(async (code, i) => {
      const buffer = await QRCode.toBuffer(code, { width: 300, margin: 2 });
      return {
        filename: `ticket-${i + 1}.png`,
        content: buffer,
        cid: `ticket-qr-${i}`,
      };
    }),
  );

  const ticketsHtml = params.ticketCodes
    .map(
      (code, i) => `
        <div style="margin-bottom: 24px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; text-align: center;">
          <p style="font-weight: bold; margin-bottom: 8px;">Ticket ${i + 1} of ${params.quantity}</p>
          <img src="cid:ticket-qr-${i}" alt="QR Code" width="200" height="200" />
          <p style="font-family: monospace; font-size: 12px; color: #6b7280; margin-top: 8px;">${code}</p>
        </div>
      `,
    )
    .join("");

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h1 style="font-size: 24px; font-weight: bold;">Your Tickets — ${params.eventTitle}</h1>
      <p>Hi ${params.buyerName},</p>
      <p>Your tickets are confirmed. See you on the dancefloor!</p>

      <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <h2 style="font-size: 18px; margin-bottom: 8px;">Event Details</h2>
        <p><strong>${params.eventTitle}</strong></p>
        <p>${params.eventDate} · ${params.eventTime}</p>
        <p>${params.eventVenue}, ${params.eventLocation}</p>
      </div>

      <div style="margin: 24px 0;">
        <p>Order #${params.orderId} · ${params.quantity} ticket${params.quantity > 1 ? "s" : ""} · £${(params.totalInPence / 100).toFixed(2)}</p>
      </div>

      <h2 style="font-size: 18px;">Your Tickets</h2>
      <p>Present each QR code at the door.</p>
      ${ticketsHtml}
    </div>
  `;

  await resend.emails.send({
    from: "Disco Soulstice <tickets@discosoulstice.com>",
    to: params.buyerEmail,
    subject: `Your tickets for ${params.eventTitle}`,
    html,
    attachments,
  });
}
