import { sanitizeArticleContent } from "@/lib/contentUtils";

interface ArticlePreviewProps {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  imageUrl?: string;
  photoCredit?: string;
}

export const ArticlePreview = ({
  title,
  excerpt,
  content,
  category,
  imageUrl,
  photoCredit,
}: ArticlePreviewProps) => {
  return (
    <div className="border border-border rounded-lg p-6 bg-background h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wide bg-primary text-primary-foreground rounded">
            {category || "Uncategorized"}
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight tracking-tight">
          {title || "Article Title"}
        </h1>

        <div className="flex items-center space-x-4 mb-8 pb-8 border-b border-border">
          <time className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </time>
        </div>

        {imageUrl && (
          <figure className="mb-8 rounded-lg overflow-hidden">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-auto object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            {photoCredit && (
              <figcaption className="mt-2 text-xs text-muted-foreground text-right">
                Photo: {photoCredit}
              </figcaption>
            )}
          </figure>
        )}

        <div className="prose prose-lg max-w-none">
          <p className="text-xl leading-relaxed text-foreground mb-8">
            {excerpt || "Article excerpt will appear here..."}
          </p>
          {content ? (
            <div
              className="rich-text-content text-foreground"
              dangerouslySetInnerHTML={{ __html: sanitizeArticleContent(content) }}
            />
          ) : (
            <p className="text-muted-foreground italic">
              Start typing to see your content preview...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
