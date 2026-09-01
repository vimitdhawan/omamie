import { Resend } from "resend";
import type { ReplyEmailInput } from "./types";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send a reply email to a contact message
 * Uses Resend to send emails from support@omamie.com
 */
export async function sendReplyEmail(input: ReplyEmailInput) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error(
      "RESEND_API_KEY is not configured. Please add it to your .env.local file."
    );
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "Omamie Support <support@omamie.com>",
      to: input.to,
      subject: `Re: ${input.subject}`,
      text: input.message,
      // Optional: Add HTML version for better formatting
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Re: ${input.subject}</h2>
          <div style="white-space: pre-wrap; line-height: 1.6; color: #555;">
            ${input.message.replace(/\n/g, "<br>")}
          </div>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #999; font-size: 12px;">
            This is a response from Omamie Support regarding your contact inquiry.
          </p>
        </div>
      `,
    });

    if (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Email sending failed: ${error.message}`);
    }
    throw new Error("Email sending failed due to an unknown error");
  }
}
