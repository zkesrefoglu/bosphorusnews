import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");

    if (!slug) {
      return new Response(JSON.stringify({ error: "Missing slug parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: article, error } = await supabase
      .from("news_articles")
      .select("title, excerpt, image_url, category")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();

    if (error || !article) {
      // Redirect to homepage if article not found
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          "Location": "https://bosphorusnews.com",
        },
      });
    }

    const siteUrl = "https://bosphorusnews.com";
    const articleUrl = `${siteUrl}/article/${slug}`;
    const defaultImage = `${siteUrl}/logo.png`;
    
    // Use original image URL - just clean up cache-busting params
    let ogImage = defaultImage;
    
    if (article.image_url) {
      ogImage = article.image_url;
      // Remove cache-busting query params that may cause issues
      if (ogImage.includes('?')) {
        ogImage = ogImage.split('?')[0];
      }
    }
    
    // Escape for HTML attributes
    const safeOgImage = escapeHtml(ogImage);
    
    console.log("Article slug:", slug);
    console.log("Image URL:", ogImage);

    // Return HTML with proper meta tags for social media crawlers
    // No instant redirect - crawlers will read the OG tags, users will click the link
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(article.title)} - Bosphorus News</title>
<meta name="description" content="${escapeHtml(article.excerpt)}">
<meta property="og:type" content="article">
<meta property="og:url" content="${articleUrl}">
<meta property="og:title" content="${escapeHtml(article.title)}">
<meta property="og:description" content="${escapeHtml(article.excerpt)}">
<meta property="og:image" content="${safeOgImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:site_name" content="Bosphorus News">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@BosphorusNews">
<meta name="twitter:url" content="${articleUrl}">
<meta name="twitter:title" content="${escapeHtml(article.title)}">
<meta name="twitter:description" content="${escapeHtml(article.excerpt)}">
<meta name="twitter:image" content="${safeOgImage}">
<link rel="canonical" href="${articleUrl}">
<style>
body{font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:40px auto;padding:20px;background:#0a0a0a;color:#fff}
h1{font-size:1.5rem;line-height:1.4;margin-bottom:16px}
p{color:#888;margin-bottom:24px}
a{display:inline-block;background:#dc2626;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:500}
a:hover{background:#b91c1c}
img{max-width:100%;border-radius:8px;margin-bottom:20px}
</style>
</head>
<body>
<img src="${safeOgImage}" alt="${escapeHtml(article.title)}">
<h1>${escapeHtml(article.title)}</h1>
<p>${escapeHtml(article.excerpt)}</p>
<a href="${articleUrl}">Read Full Article →</a>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
