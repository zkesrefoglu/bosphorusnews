import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Sending welcome email to:", email);

    // Create HTML email content
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 20px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; margin: 0 auto; padding: 40px;">
                  <tr>
                    <td>
                      <h1 style="color: #1a1a1a; font-size: 32px; font-weight: bold; margin: 0 0 20px 0;">Welcome to Bosphorus News!</h1>
                      
                      <p style="color: #333; font-size: 16px; line-height: 26px; margin: 16px 0;">
                        Thank you for subscribing to our newsletter. We're thrilled to have you join our community of informed readers.
                      </p>

                      <div style="background-color: #f0f7ff; border-left: 4px solid #2563eb; padding: 16px 20px; margin: 32px 0; border-radius: 4px;">
                        <p style="color: #1e40af; font-size: 16px; line-height: 24px; margin: 0;">
                          🎉 You're now subscribed with: <strong>${email}</strong>
                        </p>
                      </div>

                      <p style="color: #333; font-size: 16px; line-height: 26px; margin: 16px 0;">
                        <strong>What to expect:</strong>
                      </p>
                      
                      <div style="margin: 16px 0;">
                        <p style="color: #333; font-size: 16px; line-height: 28px; margin: 8px 0;">📰 Daily curated news from around the world</p>
                        <p style="color: #333; font-size: 16px; line-height: 28px; margin: 8px 0;">💼 Business insights and market updates</p>
                        <p style="color: #333; font-size: 16px; line-height: 28px; margin: 8px 0;">⚽ Sports highlights and breaking news</p>
                        <p style="color: #333; font-size: 16px; line-height: 28px; margin: 8px 0;">💻 Technology trends and innovations</p>
                        <p style="color: #333; font-size: 16px; line-height: 28px; margin: 8px 0;">🌍 Exclusive Xtra content and special features</p>
                      </div>

                      <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 32px 0;">

                      <div style="text-align: center; margin: 32px 0;">
                        <p style="color: #333; font-size: 16px; line-height: 26px; margin: 16px 0;">
                          Start exploring our latest stories now:
                        </p>
                        <a href="https://bosphorusnews.com" 
                           style="display: inline-block; background-color: #2563eb; color: #fff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 8px; margin-top: 16px;">
                          Visit Bosphorus News
                        </a>
                      </div>

                      <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 32px 0;">

                      <p style="color: #8898aa; font-size: 14px; line-height: 22px; margin: 24px 0;">
                        Stay informed, stay ahead. We deliver the news that matters most to you, right to your inbox.
                      </p>

                      <p style="color: #8898aa; font-size: 12px; line-height: 20px; margin-top: 32px; text-align: center;">
                        © 2025 Bosphorus News. All rights reserved.<br>
                        <a href="https://bosphorusnews.com" style="color: #2563eb; text-decoration: underline;">bosphorusnews.com</a>
                      </p>

                      <p style="color: #ababab; font-size: 12px; line-height: 18px; margin-top: 16px; text-align: center;">
                        If you didn't subscribe to this newsletter, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    // Send the email using Resend
    const { data, error } = await resend.emails.send({
      from: "Bosphorus News <newsletter@bosphorusnews.com>",
      to: [email],
      subject: "Welcome to Bosphorus News - Your Daily News Source",
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to send email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Email sent successfully:", data);

    return new Response(
      JSON.stringify({ success: true, message: "Welcome email sent successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-newsletter-confirmation function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
