import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  slug: string;
  created_at: string;
}

const createNewsletterHTML = (articles: NewsArticle[], date: string) => {
  // Group articles by category
  const articlesByCategory = articles.reduce((acc, article) => {
    if (!acc[article.category]) {
      acc[article.category] = [];
    }
    acc[article.category].push(article);
    return acc;
  }, {} as Record<string, NewsArticle[]>);

  const categorySections = Object.entries(articlesByCategory)
    .map(([category, categoryArticles]) => `
      <div style="margin-bottom: 32px;">
        <h2 style="color: #1a1a1a; font-size: 24px; font-weight: bold; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 3px solid #2563eb;">
          ${category}
        </h2>
        ${categoryArticles.map(article => `
          <div style="margin-bottom: 24px; padding: 16px; background-color: #f8f9fa; border-radius: 8px;">
            <h3 style="color: #1a1a1a; font-size: 18px; font-weight: bold; margin: 0 0 8px 0;">
              ${article.title}
            </h3>
            <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0 0 12px 0;">
              ${article.excerpt}
            </p>
            <a href="https://bosphorusnews.com/article/${article.slug}" 
               style="color: #2563eb; font-size: 14px; font-weight: 600; text-decoration: none;">
              Read Full Article →
            </a>
          </div>
        `).join('')}
      </div>
    `).join('');

  return `
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
                    <div style="text-align: center; margin-bottom: 32px;">
                      <h1 style="color: #1a1a1a; font-size: 32px; font-weight: bold; margin: 0 0 8px 0;">
                        📰 Bosphorus News Daily Digest
                      </h1>
                      <p style="color: #6b7280; font-size: 14px; margin: 0;">
                        ${date}
                      </p>
                    </div>

                    <p style="color: #333; font-size: 16px; line-height: 26px; margin: 0 0 32px 0;">
                      Here are today's top stories. Stay informed with the latest updates from around the world.
                    </p>

                    ${categorySections}

                    <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 32px 0;">

                    <div style="text-align: center; margin: 24px 0;">
                      <a href="https://bosphorusnews.com" 
                         style="display: inline-block; background-color: #2563eb; color: #fff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 8px;">
                        Visit Bosphorus News
                      </a>
                    </div>

                    <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 32px 0;">

                    <p style="color: #8898aa; font-size: 12px; line-height: 20px; margin: 16px 0; text-align: center;">
                      © 2025 Bosphorus News. All rights reserved.<br>
                      <a href="https://bosphorusnews.com" style="color: #2563eb; text-decoration: underline;">bosphorusnews.com</a>
                    </p>

                    <p style="color: #ababab; font-size: 11px; line-height: 18px; margin-top: 16px; text-align: center;">
                      You're receiving this because you subscribed to our newsletter.<br>
                      To unsubscribe, please contact us at contact@bosphorusnews.com
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
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting daily newsletter send...");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all newsletter subscribers
    const { data: subscribers, error: subscribersError } = await supabase
      .from("newsletter_subscriptions")
      .select("email");

    if (subscribersError) {
      console.error("Error fetching subscribers:", subscribersError);
      throw subscribersError;
    }

    if (!subscribers || subscribers.length === 0) {
      console.log("No subscribers found");
      return new Response(
        JSON.stringify({ message: "No subscribers to send to" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${subscribers.length} subscribers`);

    // Get published articles from the last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const { data: articles, error: articlesError } = await supabase
      .from("news_articles")
      .select("id, title, excerpt, category, slug, created_at")
      .eq("published", true)
      .gte("created_at", oneDayAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(20);

    if (articlesError) {
      console.error("Error fetching articles:", articlesError);
      throw articlesError;
    }

    if (!articles || articles.length === 0) {
      console.log("No articles found for today");
      return new Response(
        JSON.stringify({ message: "No articles to send today" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${articles.length} articles to include`);

    // Format date for email
    const today = new Date().toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });

    // Create newsletter HTML
    const html = createNewsletterHTML(articles as NewsArticle[], today);

    // Send emails in batches to avoid rate limits
    const batchSize = 50;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      
      try {
        const { data, error } = await resend.emails.send({
          from: "Bosphorus News <onboarding@resend.dev>",
          to: batch.map(sub => sub.email),
          subject: `📰 Bosphorus News Daily Digest - ${today}`,
          html,
        });

        if (error) {
          console.error(`Error sending batch ${i / batchSize + 1}:`, error);
          errorCount += batch.length;
        } else {
          console.log(`Successfully sent batch ${i / batchSize + 1}:`, data);
          successCount += batch.length;
        }

        // Rate limiting delay between batches
        if (i + batchSize < subscribers.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (batchError) {
        console.error(`Failed to send batch ${i / batchSize + 1}:`, batchError);
        errorCount += batch.length;
      }
    }

    console.log(`Newsletter send complete. Success: ${successCount}, Errors: ${errorCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Newsletter sent successfully`,
        stats: {
          totalSubscribers: subscribers.length,
          articlesIncluded: articles.length,
          successfulSends: successCount,
          failedSends: errorCount,
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-daily-newsletter function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
