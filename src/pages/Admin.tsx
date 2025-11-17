import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import NewsConverter from "@/components/NewsConverter";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Validation schema
const newsArticleSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  category: z.string().min(1, "Section is required"),
  excerpt: z.string().trim().min(1, "Excerpt is required").max(500, "Excerpt must be less than 500 characters"),
  content: z.string().trim().min(1, "Content is required").max(50000, "Content must be less than 50,000 characters"),
  image_url: z.string().trim().url("Invalid URL format").optional().or(z.literal("")),
});

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // News article form state
  const [newsTitle, setNewsTitle] = useState("");
  const [newsSection, setNewsSection] = useState("");
  const [newsExcerpt, setNewsExcerpt] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [newsImageUrl, setNewsImageUrl] = useState("");

  // Daily topic (Agenda) form state
  const [topicTitle, setTopicTitle] = useState("");
  const [topicExcerpt, setTopicExcerpt] = useState("");
  const [topicContent, setTopicContent] = useState("");
  const [topicImageUrl, setTopicImageUrl] = useState("");

  // Manage articles state
  const [articles, setArticles] = useState<any[]>([]);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [deleteArticleId, setDeleteArticleId] = useState<string | null>(null);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [filterPublished, setFilterPublished] = useState<"all" | "published" | "unpublished">("all");
  const [sendingNewsletter, setSendingNewsletter] = useState(false);

  useEffect(() => {
    checkAdmin();
  }, []);

  const fetchArticles = async () => {
    setLoadingArticles(true);
    try {
      const { data, error } = await supabase
        .from("news_articles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load articles",
        variant: "destructive",
      });
    } finally {
      setLoadingArticles(false);
    }
  };

  const checkAdmin = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate input data
      const validationResult = newsArticleSchema.safeParse({
        title: newsTitle,
        category: newsSection,
        excerpt: newsExcerpt,
        content: newsContent,
        image_url: newsImageUrl,
      });

      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => err.message).join(", ");
        throw new Error(errors);
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const validData = validationResult.data;
      
      // Create slug from title with timestamp to avoid collisions
      const slug = `${validData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
      
      const { error } = await supabase
        .from("news_articles")
        .insert({
          title: validData.title,
          slug: slug,
          category: validData.category,
          excerpt: validData.excerpt,
          content: validData.content,
          author: session.user.email || "Admin",
          image_url: validData.image_url || null,
          published: true,
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "News article has been uploaded successfully",
      });

      // Reset form
      setNewsTitle("");
      setNewsSection("");
      setNewsExcerpt("");
      setNewsContent("");
      setNewsImageUrl("");
    } catch (error: any) {
      toast({
        title: "Validation Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate input data
      const validationResult = newsArticleSchema.safeParse({
        title: topicTitle,
        category: "Agenda",
        excerpt: topicExcerpt,
        content: topicContent,
        image_url: topicImageUrl,
      });

      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => err.message).join(", ");
        throw new Error(errors);
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const validData = validationResult.data;
      
      // Create slug from title with timestamp to avoid collisions
      const slug = `${validData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
      
      const { error } = await supabase
        .from("news_articles")
        .insert({
          title: validData.title,
          slug: slug,
          category: "Agenda",
          excerpt: validData.excerpt,
          content: validData.content,
          author: session.user.email || "Admin",
          image_url: validData.image_url || null,
          published: true,
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Daily topic (Agenda article) has been uploaded successfully",
      });

      // Reset form
      setTopicTitle("");
      setTopicExcerpt("");
      setTopicContent("");
      setTopicImageUrl("");
    } catch (error: any) {
      toast({
        title: "Validation Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkFile) return;

    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const fileText = await bulkFile.text();
      let articles: any[] = [];

      // Parse based on file type
      if (bulkFile.name.endsWith('.json')) {
        articles = JSON.parse(fileText);
      } else if (bulkFile.name.endsWith('.csv')) {
        const lines = fileText.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        
        articles = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          const article: any = {};
          headers.forEach((header, index) => {
            article[header.toLowerCase()] = values[index] || '';
          });
          return article;
        });
      }

      // Validate and insert articles
      const validArticles = articles.map(article => {
        const validationResult = newsArticleSchema.safeParse({
          title: article.title,
          category: article.category || article.section,
          excerpt: article.excerpt,
          content: article.content,
          image_url: article.image_url || article.source || '',
        });

        if (!validationResult.success) {
          throw new Error(`Invalid article "${article.title}": ${validationResult.error.errors.map(e => e.message).join(', ')}`);
        }

        const validData = validationResult.data;
        const slug = `${validData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;

        return {
          title: validData.title,
          slug: slug,
          category: validData.category,
          excerpt: validData.excerpt,
          content: validData.content,
          author: session.user.email || "Admin",
          image_url: validData.image_url || null,
          published: true,
        };
      });

      const { error } = await supabase
        .from("news_articles")
        .insert(validArticles);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${validArticles.length} articles uploaded successfully`,
      });

      setBulkFile(null);
      // Reset the file input
      const fileInput = document.getElementById('bulkFile') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      toast({
        title: "Upload Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleEditArticle = (article: any) => {
    setEditingArticle(article);
    setNewsTitle(article.title);
    setNewsSection(article.category);
    setNewsExcerpt(article.excerpt);
    setNewsContent(article.content);
    setNewsImageUrl(article.image_url || "");
  };

  const handleUpdateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;

    setSubmitting(true);
    try {
      const validationResult = newsArticleSchema.safeParse({
        title: newsTitle,
        category: newsSection,
        excerpt: newsExcerpt,
        content: newsContent,
        image_url: newsImageUrl,
      });

      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => err.message).join(", ");
        throw new Error(errors);
      }

      const validData = validationResult.data;
      const slug = `${validData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;

      const { error } = await supabase
        .from("news_articles")
        .update({
          title: validData.title,
          slug: slug,
          category: validData.category,
          excerpt: validData.excerpt,
          content: validData.content,
          image_url: validData.image_url || null,
        })
        .eq("id", editingArticle.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Article updated successfully",
      });

      setNewsTitle("");
      setNewsSection("");
      setNewsExcerpt("");
      setNewsContent("");
      setNewsImageUrl("");
      setEditingArticle(null);
      fetchArticles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteArticle = async () => {
    if (!deleteArticleId) return;

    try {
      const { error } = await supabase
        .from("news_articles")
        .delete()
        .eq("id", deleteArticleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Article deleted successfully",
      });

      setDeleteArticleId(null);
      fetchArticles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleTogglePublish = async (articleId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("news_articles")
        .update({ published: !currentStatus })
        .eq("id", articleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Article ${!currentStatus ? "published" : "unpublished"} successfully`,
      });

      fetchArticles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const cancelEdit = () => {
    setEditingArticle(null);
    setNewsTitle("");
    setNewsSection("");
    setNewsExcerpt("");
    setNewsContent("");
    setNewsImageUrl("");
  };

  const filteredArticles = articles.filter((article) => {
    if (filterPublished === "published") return article.published;
    if (filterPublished === "unpublished") return !article.published;
    return true;
  });

  const handleSendNewsletter = async () => {
    try {
      setSendingNewsletter(true);
      
      const { data, error } = await supabase.functions.invoke('send-daily-newsletter');
      
      if (error) throw error;
      
      toast({
        title: "Newsletter Sent!",
        description: `Successfully sent to ${data.stats?.successfulSends || 0} subscribers`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send newsletter",
        variant: "destructive",
      });
    } finally {
      setSendingNewsletter(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <Tabs defaultValue="news" className="w-full" onValueChange={(value) => {
          if (value === "manage") fetchArticles();
        }}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="news">Latest News</TabsTrigger>
            <TabsTrigger value="topic">Daily Topic (Agenda)</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
            <TabsTrigger value="converter">News Converter</TabsTrigger>
            <TabsTrigger value="manage">Manage Articles</TabsTrigger>
            <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
          </TabsList>

          <TabsContent value="news">
            <Card>
              <CardHeader>
                <CardTitle>Add Single News Article</CardTitle>
                <CardDescription>
                  Manually add one news article at a time. Select any category except Agenda (use the Daily Topic tab for Agenda articles).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleNewsSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="news-title">Title</Label>
                    <Input
                      id="news-title"
                      value={newsTitle}
                      onChange={(e) => setNewsTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="news-section">Section</Label>
                    <Select value={newsSection} onValueChange={setNewsSection} required>
                      <SelectTrigger id="news-section">
                        <SelectValue placeholder="Select a section" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Politics">Politics</SelectItem>
                        <SelectItem value="FP & Defense">FP & Defense</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="Life">Life</SelectItem>
                        <SelectItem value="Health">Health</SelectItem>
                        <SelectItem value="Sports">Sports</SelectItem>
                        <SelectItem value="World">World</SelectItem>
                        <SelectItem value="Xtra">Xtra</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="news-excerpt">Excerpt</Label>
                    <Textarea
                      id="news-excerpt"
                      value={newsExcerpt}
                      onChange={(e) => setNewsExcerpt(e.target.value)}
                      rows={2}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="news-content">Full Content</Label>
                    <Textarea
                      id="news-content"
                      value={newsContent}
                      onChange={(e) => setNewsContent(e.target.value)}
                      rows={8}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="news-image">Image URL (optional)</Label>
                    <Input
                      id="news-image"
                      type="url"
                      value={newsImageUrl}
                      onChange={(e) => setNewsImageUrl(e.target.value)}
                    />
                  </div>

                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Uploading..." : "Upload Article"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="topic">
            <Card>
              <CardHeader>
                <CardTitle>Featured Daily Topic (Agenda)</CardTitle>
                <CardDescription>
                  Upload the main featured story that appears at the top of the homepage. This automatically creates an Agenda article.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTopicSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="topic-title">Title</Label>
                    <Input
                      id="topic-title"
                      value={topicTitle}
                      onChange={(e) => setTopicTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="topic-excerpt">Excerpt</Label>
                    <Textarea
                      id="topic-excerpt"
                      value={topicExcerpt}
                      onChange={(e) => setTopicExcerpt(e.target.value)}
                      rows={2}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="topic-content">Full Content</Label>
                    <Textarea
                      id="topic-content"
                      value={topicContent}
                      onChange={(e) => setTopicContent(e.target.value)}
                      rows={8}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="topic-image">Image URL (optional)</Label>
                    <Input
                      id="topic-image"
                      type="url"
                      value={topicImageUrl}
                      onChange={(e) => setTopicImageUrl(e.target.value)}
                    />
                  </div>

                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Uploading..." : "Upload Daily Topic"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bulk">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Upload News Articles</CardTitle>
                <CardDescription>
                  Upload multiple news articles at once using a CSV or JSON file. You can include any category including Agenda.
                  <br /><br />
                  <strong>Required fields:</strong> title, category (or section - must be: Agenda, Politics, FP & Defense, Business, Life, Health, Sports, World, or Xtra), excerpt, content
                  <br />
                  <strong>Optional fields:</strong> image_url (or source)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBulkUpload} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bulkFile">Upload File (CSV or JSON)</Label>
                    <Input
                      id="bulkFile"
                      type="file"
                      accept=".csv,.json"
                      onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      CSV format: title, category, excerpt, content, image_url
                      <br />
                      JSON format: [{`{`}"title": "...", "category": "...", "excerpt": "...", "content": "...", "image_url": "..."{`}`}]
                    </p>
                  </div>
                  <Button type="submit" disabled={uploading || !bulkFile}>
                    {uploading ? "Uploading..." : "Upload Articles"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="converter">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered News Converter</CardTitle>
                <CardDescription>
                  Convert DOCX news files to CSV or JSON format with AI-generated catchy headlines using Lovable AI.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NewsConverter />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <CardTitle>Manage Articles</CardTitle>
                <CardDescription>
                  Edit or delete existing published articles
                </CardDescription>
              </CardHeader>
              <CardContent>
                {editingArticle ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Editing Article</h3>
                      <Button variant="outline" onClick={cancelEdit}>Cancel Edit</Button>
                    </div>
                    <form onSubmit={handleUpdateArticle} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-title">Title</Label>
                        <Input
                          id="edit-title"
                          value={newsTitle}
                          onChange={(e) => setNewsTitle(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-section">Section</Label>
                        <Select value={newsSection} onValueChange={setNewsSection} required>
                          <SelectTrigger id="edit-section">
                            <SelectValue placeholder="Select a section" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Agenda">Agenda</SelectItem>
                            <SelectItem value="Politics">Politics</SelectItem>
                            <SelectItem value="FP & Defense">FP & Defense</SelectItem>
                            <SelectItem value="Business">Business</SelectItem>
                            <SelectItem value="Life">Life</SelectItem>
                            <SelectItem value="Health">Health</SelectItem>
                            <SelectItem value="Sports">Sports</SelectItem>
                            <SelectItem value="World">World</SelectItem>
                            <SelectItem value="Xtra">Xtra</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-excerpt">Excerpt</Label>
                        <Textarea
                          id="edit-excerpt"
                          value={newsExcerpt}
                          onChange={(e) => setNewsExcerpt(e.target.value)}
                          rows={2}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-content">Full Content</Label>
                        <Textarea
                          id="edit-content"
                          value={newsContent}
                          onChange={(e) => setNewsContent(e.target.value)}
                          rows={8}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-image">Image URL (optional)</Label>
                        <Input
                          id="edit-image"
                          type="url"
                          value={newsImageUrl}
                          onChange={(e) => setNewsImageUrl(e.target.value)}
                        />
                      </div>

                      <Button type="submit" disabled={submitting}>
                        {submitting ? "Updating..." : "Update Article"}
                      </Button>
                    </form>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 mb-4">
                      <Label>Filter:</Label>
                      <div className="flex gap-2">
                        <Button
                          variant={filterPublished === "all" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFilterPublished("all")}
                        >
                          All
                        </Button>
                        <Button
                          variant={filterPublished === "published" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFilterPublished("published")}
                        >
                          Published
                        </Button>
                        <Button
                          variant={filterPublished === "unpublished" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFilterPublished("unpublished")}
                        >
                          Unpublished
                        </Button>
                      </div>
                    </div>

                    {loadingArticles ? (
                      <p className="text-center py-8 text-muted-foreground">Loading articles...</p>
                    ) : filteredArticles.length === 0 ? (
                      <p className="text-center py-8 text-muted-foreground">No articles found</p>
                    ) : (
                      <div className="space-y-2">
                        {filteredArticles.map((article) => (
                          <div
                            key={article.id}
                            className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{article.title}</h4>
                                {article.published ? (
                                  <Eye className="w-4 h-4 text-green-600" />
                                ) : (
                                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {article.category} • {new Date(article.created_at).toLocaleDateString()} • {article.published ? "Published" : "Unpublished"}
                              </p>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {article.excerpt}
                              </p>
                            </div>
                            <div className="flex gap-2 ml-4 items-start">
                              <div className="flex flex-col items-center gap-1">
                                <Switch
                                  checked={article.published}
                                  onCheckedChange={() => handleTogglePublish(article.id, article.published)}
                                />
                                <span className="text-xs text-muted-foreground">
                                  {article.published ? "Live" : "Hidden"}
                                </span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditArticle(article)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeleteArticleId(article.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="newsletter">
            <Card>
              <CardHeader>
                <CardTitle>Send Daily Newsletter</CardTitle>
                <CardDescription>
                  Manually send the daily newsletter digest to all subscribers. It includes all published articles from the last 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <p className="text-sm text-muted-foreground">
                    <strong>How it works:</strong>
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li>Collects all published articles from the last 24 hours</li>
                    <li>Groups them by category</li>
                    <li>Sends a formatted email to all newsletter subscribers</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-primary/5 rounded-lg space-y-2">
                  <p className="text-sm font-medium">For automated daily sending:</p>
                  <p className="text-sm text-muted-foreground">
                    Use a free service like <a href="https://cron-job.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">cron-job.org</a> to schedule daily calls (e.g., 9 AM) to:
                  </p>
                  <code className="block text-xs bg-background p-2 rounded mt-2 break-all">
                    https://mxmarjrkwrqnhhipckzj.supabase.co/functions/v1/send-daily-newsletter
                  </code>
                </div>

                <Button 
                  onClick={handleSendNewsletter} 
                  disabled={sendingNewsletter}
                  className="w-full"
                >
                  {sendingNewsletter ? "Sending..." : "Send Newsletter Now"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <AlertDialog open={!!deleteArticleId} onOpenChange={() => setDeleteArticleId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the article.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteArticle}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Admin;
