import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import NewsConverter from "@/components/NewsConverter";
import { Pencil, Trash2, Eye, EyeOff, Send, Search, Image } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ArticlePreview } from "@/components/ArticlePreview";
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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [batchImages, setBatchImages] = useState<File[]>([]);

  // News article form state
  const [newsTitle, setNewsTitle] = useState("");
  const [newsSection, setNewsSection] = useState("");
  const [newsExcerpt, setNewsExcerpt] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [newsImageUrl, setNewsImageUrl] = useState("");
  const [newsPhotoCredit, setNewsPhotoCredit] = useState("");
  const [newsExtraImageUrl, setNewsExtraImageUrl] = useState("");
  const [newsExtraImageCredit, setNewsExtraImageCredit] = useState("");
  const [postToBluesky, setPostToBluesky] = useState(false);
  const [postingToBluesky, setPostingToBluesky] = useState(false);
  const [isBreakingNews, setIsBreakingNews] = useState(false);

  // Xtra (Editorial) form state
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
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sendingNewsletter, setSendingNewsletter] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

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

  const handleImageUpload = async (file: File, slug: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${slug}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('article-images')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('article-images')
      .getPublicUrl(filePath);

    return publicUrl;
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
      
      // Create slug from title
      const baseSlug = validData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const slug = `${baseSlug}-${Date.now()}`;
      
      // Handle image upload if file is selected
      const imageInput = document.getElementById('newsImage') as HTMLInputElement;
      let imageUrl = validData.image_url || null;
      
      if (imageInput?.files?.[0]) {
        setUploadingImage(true);
        try {
          imageUrl = await handleImageUpload(imageInput.files[0], baseSlug);
        } catch (err) {
          throw new Error("Failed to upload image");
        } finally {
          setUploadingImage(false);
        }
      }
      
      // Handle extra image upload if file is selected
      const extraImageInput = document.getElementById('newsExtraImage') as HTMLInputElement;
      let extraImageUrl = newsExtraImageUrl || null;
      
      if (extraImageInput?.files?.[0]) {
        setUploadingImage(true);
        try {
          extraImageUrl = await handleImageUpload(extraImageInput.files[0], `${baseSlug}-extra`);
        } catch (err) {
          throw new Error("Failed to upload extra image");
        } finally {
          setUploadingImage(false);
        }
      }
      
      const { error } = await supabase
        .from("news_articles")
        .insert({
          title: validData.title,
          slug: slug,
          category: validData.category,
          excerpt: validData.excerpt,
          content: validData.content,
          author: session.user.email || "Admin",
          image_url: imageUrl,
          photo_credit: newsPhotoCredit || null,
          extra_image_url: extraImageUrl,
          extra_image_credit: newsExtraImageCredit || null,
          published: true,
          breaking_news: isBreakingNews,
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "News article has been uploaded successfully",
      });

      // Post to Bluesky if checkbox is enabled
      if (postToBluesky) {
        try {
          const { error: blueskyError } = await supabase.functions.invoke('post-to-bluesky', {
            body: { 
              title: validData.title, 
              slug: slug,
              excerpt: validData.excerpt,
              image_url: imageUrl
            }
          });
          
          if (blueskyError) throw blueskyError;
          
          toast({
            title: "Posted to Bluesky!",
            description: "Article shared on Bluesky successfully",
          });
        } catch (blueskyErr: any) {
          toast({
            title: "Bluesky Post Failed",
            description: blueskyErr.message || "Failed to post to Bluesky",
            variant: "destructive",
          });
        }
      }

      // Reset form
      setNewsTitle("");
      setNewsSection("");
      setNewsExcerpt("");
      setNewsContent("");
      setNewsImageUrl("");
      setNewsPhotoCredit("");
      setNewsExtraImageUrl("");
      setNewsExtraImageCredit("");
      setPostToBluesky(false);
      setIsBreakingNews(false);
      if (imageInput) imageInput.value = '';
      if (extraImageInput) extraImageInput.value = '';
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
        category: "Editorial",
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
      
      // Create slug from title
      const baseSlug = validData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const slug = `${baseSlug}-${Date.now()}`;
      
      // Handle image upload if file is selected
      const imageInput = document.getElementById('topicImage') as HTMLInputElement;
      let imageUrl = validData.image_url || null;
      
      if (imageInput?.files?.[0]) {
        setUploadingImage(true);
        try {
          imageUrl = await handleImageUpload(imageInput.files[0], baseSlug);
        } catch (err) {
          throw new Error("Failed to upload image");
        } finally {
          setUploadingImage(false);
        }
      }
      
      // Save to daily_topics table (for Editor's Pick)
      const { error } = await supabase
        .from("daily_topics")
        .insert({
          title: validData.title,
          slug: slug,
          excerpt: validData.excerpt,
          content: validData.content,
          author: session.user.email || "Admin",
          published: true,
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Editor's Pick has been uploaded successfully",
      });

      // Reset form
      setTopicTitle("");
      setTopicExcerpt("");
      setTopicContent("");
      setTopicImageUrl("");
      if (imageInput) imageInput.value = '';
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

  const handleBatchImageUpload = async () => {
    if (batchImages.length === 0) return;

    setUploadingImage(true);
    try {
      let successCount = 0;
      
      for (const file of batchImages) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        const slug = nameWithoutExt.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        
        try {
          await handleImageUpload(file, slug);
          successCount++;
        } catch (err) {
          console.error(`Failed to upload ${file.name}:`, err);
        }
      }

      toast({
        title: "Batch Upload Complete",
        description: `${successCount}/${batchImages.length} images uploaded successfully`,
      });

      setBatchImages([]);
      const imageInput = document.getElementById('batchImages') as HTMLInputElement;
      if (imageInput) imageInput.value = '';
    } catch (error: any) {
      toast({
        title: "Upload Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
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

      // Validate and insert articles with auto-matched images
      const validArticles = await Promise.all(articles.map(async article => {
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
        const baseSlug = validData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const slug = `${baseSlug}-${Date.now()}`;

        // Try to find matching image in storage by base slug
        let imageUrl = validData.image_url || null;
        
        if (!imageUrl) {
          const { data: files } = await supabase.storage
            .from('article-images')
            .list('', { search: baseSlug });

          if (files && files.length > 0) {
            const { data: { publicUrl } } = supabase.storage
              .from('article-images')
              .getPublicUrl(files[0].name);
            imageUrl = publicUrl;
          }
        }

        return {
          title: validData.title,
          slug: slug,
          category: validData.category,
          excerpt: validData.excerpt,
          content: validData.content,
          author: session.user.email || "Admin",
          image_url: imageUrl,
          published: true,
        };
      }));

      const { error } = await supabase
        .from("news_articles")
        .insert(validArticles);

      if (error) throw error;

      const withImages = validArticles.filter(a => a.image_url).length;
      toast({
        title: "Success",
        description: `${validArticles.length} articles uploaded (${withImages} with auto-matched images)`,
      });

      setBulkFile(null);
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
    setNewsPhotoCredit(article.photo_credit || "");
    setNewsExtraImageUrl(article.extra_image_url || "");
    setNewsExtraImageCredit(article.extra_image_credit || "");
    setIsBreakingNews(article.breaking_news || false);
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
      // Keep original slug when editing - don't regenerate
      const baseSlug = editingArticle.slug.replace(/-\d+$/, ""); // Remove timestamp from original slug

      // Handle image upload if file is selected
      const imageInput = document.getElementById('editNewsImage') as HTMLInputElement;
      let imageUrl = validData.image_url || editingArticle.image_url || null;
      
      if (imageInput?.files?.[0]) {
        setUploadingImage(true);
        try {
          imageUrl = await handleImageUpload(imageInput.files[0], baseSlug);
        } catch (err) {
          throw new Error("Failed to upload image");
        } finally {
          setUploadingImage(false);
        }
      }

      // Handle extra image upload if file is selected
      const extraImageInput = document.getElementById('editNewsExtraImage') as HTMLInputElement;
      let extraImageUrl = newsExtraImageUrl || editingArticle.extra_image_url || null;
      
      if (extraImageInput?.files?.[0]) {
        setUploadingImage(true);
        try {
          extraImageUrl = await handleImageUpload(extraImageInput.files[0], `${baseSlug}-extra`);
        } catch (err) {
          throw new Error("Failed to upload extra image");
        } finally {
          setUploadingImage(false);
        }
      }

      const { error } = await supabase
        .from("news_articles")
        .update({
          title: validData.title,
          // Don't update slug - keep the original
          category: validData.category,
          excerpt: validData.excerpt,
          content: validData.content,
          image_url: imageUrl,
          photo_credit: newsPhotoCredit || null,
          extra_image_url: extraImageUrl,
          extra_image_credit: newsExtraImageCredit || null,
          breaking_news: isBreakingNews,
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
      setNewsPhotoCredit("");
      setNewsExtraImageUrl("");
      setNewsExtraImageCredit("");
      setIsBreakingNews(false);
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

  const handleToggleCarouselFeatured = async (articleId: string, currentStatus: boolean | null) => {
    try {
      const { error } = await supabase
        .from("news_articles")
        .update({ is_carousel_featured: !currentStatus })
        .eq("id", articleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Article ${!currentStatus ? "added to" : "removed from"} homepage carousel`,
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

  const handleToggleCarouselPinned = async (articleId: string, currentStatus: boolean | null) => {
    try {
      const { error } = await supabase
        .from("news_articles")
        .update({ is_carousel_pinned: !currentStatus })
        .eq("id", articleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Article ${!currentStatus ? "pinned as first" : "unpinned"} in carousel`,
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

  const handleUpdateCategoryOrder = async (articleId: string, order: number | null) => {
    try {
      const { error } = await supabase
        .from("news_articles")
        .update({ category_pin_order: order })
        .eq("id", articleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Category order updated",
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
    setNewsPhotoCredit("");
    setNewsExtraImageUrl("");
    setNewsExtraImageCredit("");
    setIsBreakingNews(false);
  };

  const filteredArticles = articles.filter((article) => {
    // Filter by published status
    if (filterPublished === "published" && !article.published) return false;
    if (filterPublished === "unpublished" && article.published) return false;
    
    // Filter by category
    if (filterCategory !== "all" && article.category !== filterCategory) return false;
    
    // Filter by keyword search (title, excerpt, or content)
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      const matchesTitle = article.title.toLowerCase().includes(keyword);
      const matchesExcerpt = article.excerpt.toLowerCase().includes(keyword);
      const matchesContent = article.content.toLowerCase().includes(keyword);
      if (!matchesTitle && !matchesExcerpt && !matchesContent) return false;
    }
    
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
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button
            variant="outline"
            onClick={() => navigate("/watermark")}
            className="flex items-center gap-2"
          >
            <Image className="w-4 h-4" />
            Watermark Tool
          </Button>
        </div>

        <Tabs defaultValue="news" className="w-full" onValueChange={(value) => {
          if (value === "manage") fetchArticles();
        }}>
            <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="news">Latest News</TabsTrigger>
            <TabsTrigger value="topic">Editor's Pick</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
            <TabsTrigger value="converter">News Converter</TabsTrigger>
            <TabsTrigger value="manage">Manage Articles</TabsTrigger>
            <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
          </TabsList>

          <TabsContent value="news">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">Add Single News Article</h2>
                <p className="text-sm text-muted-foreground">
                  Manually add one news article. All articles are part of Agenda but must have a specific category.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showPreview ? "Hide Preview" : "Show Preview"}
              </Button>
            </div>
            
            <div className={`grid gap-6 ${showPreview ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
              <Card>
                <CardHeader>
                  <CardTitle>Article Editor</CardTitle>
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
                          <SelectItem value="Agenda">Agenda</SelectItem>
                          <SelectItem value="Economy">Economy</SelectItem>
                          <SelectItem value="Defense">Defense</SelectItem>
                          <SelectItem value="Life">Life</SelectItem>
                          <SelectItem value="Türkiye">Türkiye</SelectItem>
                          <SelectItem value="World">World</SelectItem>
                          <SelectItem value="Sports">Sports</SelectItem>
                          <SelectItem value="Xtra">Xtra</SelectItem>
                          <SelectItem value="Editorial">Editorial</SelectItem>
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
                      <RichTextEditor
                        key="news-article-editor"
                        value={newsContent}
                        onChange={setNewsContent}
                        placeholder="Write your article content with formatting..."
                        minHeight="500px"
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
                      <div className="text-xs text-muted-foreground">Or upload an image below:</div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newsImage">Upload Image (optional)</Label>
                      <Input
                        id="newsImage"
                        type="file"
                        accept="image/*"
                        disabled={uploadingImage}
                      />
                      <p className="text-xs text-muted-foreground">
                        Image will be auto-named based on article title slug
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="news-photo-credit">Photo Credit (optional)</Label>
                      <Input
                        id="news-photo-credit"
                        value={newsPhotoCredit}
                        onChange={(e) => setNewsPhotoCredit(e.target.value)}
                        placeholder="e.g., AP Photo/John Doe"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="post-to-bluesky"
                        checked={postToBluesky}
                        onCheckedChange={setPostToBluesky}
                      />
                      <Label htmlFor="post-to-bluesky" className="cursor-pointer">
                        Post to Bluesky when published
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="breaking-news"
                        checked={isBreakingNews}
                        onCheckedChange={setIsBreakingNews}
                      />
                      <Label htmlFor="breaking-news" className="cursor-pointer">
                        Mark as Breaking News
                      </Label>
                    </div>

                    <Button type="submit" disabled={submitting || uploadingImage}>
                      {uploadingImage ? "Uploading Image..." : submitting ? "Uploading..." : "Upload Article"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
              
              {showPreview && (
                <Card className="md:sticky md:top-4 h-fit max-h-[calc(100vh-8rem)] overflow-hidden">
                  <CardHeader>
                    <CardTitle>Live Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ArticlePreview
                      title={newsTitle}
                      excerpt={newsExcerpt}
                      content={newsContent}
                      category={newsSection}
                      imageUrl={newsImageUrl}
                      photoCredit={newsPhotoCredit}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="topic">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">Editor's Pick (Xtra)</h2>
                <p className="text-sm text-muted-foreground">
                  Upload the main featured story that appears as "Editor's Pick" on the homepage.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showPreview ? "Hide Preview" : "Show Preview"}
              </Button>
            </div>
            
            <div className={`grid gap-6 ${showPreview ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
              <Card>
                <CardHeader>
                  <CardTitle>Article Editor</CardTitle>
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
                      <RichTextEditor
                        key="topic-article-editor"
                        value={topicContent}
                        onChange={setTopicContent}
                        placeholder="Write the Editor's Pick content with formatting..."
                        minHeight="500px"
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
                      <div className="text-xs text-muted-foreground">Or upload an image below:</div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="topicImage">Upload Image (optional)</Label>
                      <Input
                        id="topicImage"
                        type="file"
                        accept="image/*"
                        disabled={uploadingImage}
                      />
                      <p className="text-xs text-muted-foreground">
                        Image will be auto-named based on article title slug
                      </p>
                    </div>

                    <Button type="submit" disabled={submitting || uploadingImage}>
                      {uploadingImage ? "Uploading Image..." : submitting ? "Uploading..." : "Upload Editor's Pick"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
              
              {showPreview && (
                <Card className="md:sticky md:top-4 h-fit max-h-[calc(100vh-8rem)] overflow-hidden">
                  <CardHeader>
                    <CardTitle>Live Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ArticlePreview
                      title={topicTitle}
                      excerpt={topicExcerpt}
                      content={topicContent}
                      category="Xtra"
                      imageUrl={topicImageUrl}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="bulk">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Upload News Articles</CardTitle>
                <CardDescription>
                  Upload images first (named by article slug), then bulk upload articles with auto-image matching
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold mb-2">📦 Step 1: Batch Image Upload</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Upload images named by article slug (e.g., us-china-trade-deal.jpg)
                    </p>
                    <div className="space-y-3">
                      <Input
                        id="batchImages"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => setBatchImages(Array.from(e.target.files || []))}
                        disabled={uploadingImage}
                      />
                      {batchImages.length > 0 && (
                        <div className="text-sm">
                          Selected: {batchImages.length} images
                          <ul className="mt-1 text-xs text-muted-foreground">
                            {batchImages.slice(0, 5).map((f, i) => <li key={i}>• {f.name}</li>)}
                            {batchImages.length > 5 && <li>... and {batchImages.length - 5} more</li>}
                          </ul>
                        </div>
                      )}
                      <Button 
                        onClick={handleBatchImageUpload}
                        disabled={batchImages.length === 0 || uploadingImage}
                        variant="secondary"
                        className="w-full"
                      >
                        {uploadingImage ? "Uploading..." : `Upload ${batchImages.length} Images`}
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">📄 Step 2: Bulk Article Upload</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Articles will auto-match images by title slug
                    </p>
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
                  </div>
                </div>
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
                            <SelectItem value="Economy">Economy</SelectItem>
                            <SelectItem value="Defense">Defense</SelectItem>
                            <SelectItem value="Life">Life</SelectItem>
                            <SelectItem value="Türkiye">Türkiye</SelectItem>
                            <SelectItem value="World">World</SelectItem>
                            <SelectItem value="Sports">Sports</SelectItem>
                            <SelectItem value="Xtra">Xtra</SelectItem>
                            <SelectItem value="Editorial">Editorial</SelectItem>
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
                        <RichTextEditor
                          key={`edit-article-${editingArticle?.id}`}
                          value={newsContent}
                          onChange={setNewsContent}
                          placeholder="Edit the article content with formatting..."
                          minHeight="500px"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-image">Image URL (optional)</Label>
                        <Input
                          id="edit-image"
                          type="url"
                          value={newsImageUrl}
                          onChange={(e) => setNewsImageUrl(e.target.value)}
                          placeholder="Enter image URL or upload a new image below"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="editNewsImage">Or Upload New Image</Label>
                        <Input
                          id="editNewsImage"
                          type="file"
                          accept="image/*"
                        />
                        <p className="text-sm text-muted-foreground">
                          Uploading a new image will replace the current one
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-photo-credit">Photo Credit (optional)</Label>
                        <Input
                          id="edit-photo-credit"
                          value={newsPhotoCredit}
                          onChange={(e) => setNewsPhotoCredit(e.target.value)}
                          placeholder="e.g., AP Photo/John Doe"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-extra-image">Extra Image URL (optional)</Label>
                        <Input
                          id="edit-extra-image"
                          type="url"
                          value={newsExtraImageUrl}
                          onChange={(e) => setNewsExtraImageUrl(e.target.value)}
                          placeholder="Enter extra image URL or upload below"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="editNewsExtraImage">Or Upload Extra Image</Label>
                        <Input
                          id="editNewsExtraImage"
                          type="file"
                          accept="image/*"
                        />
                        <p className="text-sm text-muted-foreground">
                          Upload an additional image for this article
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-extra-photo-credit">Extra Photo Credit (optional)</Label>
                        <Input
                          id="edit-extra-photo-credit"
                          value={newsExtraImageCredit}
                          onChange={(e) => setNewsExtraImageCredit(e.target.value)}
                          placeholder="e.g., Reuters/Jane Smith"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="edit-breaking-news"
                          checked={isBreakingNews}
                          onCheckedChange={setIsBreakingNews}
                        />
                        <Label htmlFor="edit-breaking-news">Mark as Breaking News</Label>
                      </div>

                      <Button type="submit" disabled={submitting || uploadingImage}>
                        {uploadingImage ? "Uploading Image..." : submitting ? "Updating..." : "Update Article"}
                      </Button>
                    </form>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Search and Filter Controls */}
                    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                      {/* Keyword Search */}
                      <div className="space-y-2">
                        <Label htmlFor="search" className="text-sm font-medium">Search Articles</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="search"
                            type="text"
                            placeholder="Search by title, excerpt, or content..."
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      
                      {/* Filters Row */}
                      <div className="flex flex-wrap items-center gap-4">
                        {/* Category Filter */}
                        <div className="flex items-center gap-2">
                          <Label className="text-sm whitespace-nowrap">Category:</Label>
                          <Select value={filterCategory} onValueChange={setFilterCategory}>
                            <SelectTrigger className="w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Categories</SelectItem>
                              <SelectItem value="Agenda">Agenda</SelectItem>
                              <SelectItem value="Türkiye">Türkiye</SelectItem>
                              <SelectItem value="Business & Economy">Business & Economy</SelectItem>
                              <SelectItem value="FP & Defense">FP & Defense</SelectItem>
                              <SelectItem value="Life">Life</SelectItem>
                              <SelectItem value="Sports">Sports</SelectItem>
                              <SelectItem value="World">World</SelectItem>
                              <SelectItem value="Xtra">Xtra</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* Published Status Filter */}
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Status:</Label>
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
                      </div>
                      
                      {/* Results count */}
                      <div className="text-sm text-muted-foreground">
                        Showing {filteredArticles.length} of {articles.length} articles
                      </div>
                    </div>

                    {loadingArticles ? (
                      <p className="text-center py-8 text-muted-foreground">Loading articles...</p>
                    ) : filteredArticles.length === 0 ? (
                      <p className="text-center py-8 text-muted-foreground">
                        {searchKeyword || filterCategory !== "all" || filterPublished !== "all" 
                          ? "No articles match your filters" 
                          : "No articles found"}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {filteredArticles.map((article) => (
                          <div
                            key={article.id}
                            className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors space-y-3"
                          >
                            <div className="flex items-start justify-between">
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
                                  onClick={async () => {
                                    setPostingToBluesky(true);
                                    try {
                                      const { error } = await supabase.functions.invoke('post-to-bluesky', {
                                        body: { title: article.title, slug: article.slug }
                                      });
                                      
                                      if (error) throw error;
                                      
                                      toast({
                                        title: "Posted to Bluesky!",
                                        description: "Article shared on Bluesky successfully",
                                      });
                                    } catch (err: any) {
                                      toast({
                                        title: "Bluesky Post Failed",
                                        description: err.message || "Failed to post to Bluesky",
                                        variant: "destructive",
                                      });
                                    } finally {
                                      setPostingToBluesky(false);
                                    }
                                  }}
                                  disabled={postingToBluesky}
                                  title="Post to Bluesky"
                                >
                                  <Send className="w-4 h-4" />
                                </Button>
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

                            {/* Homepage Controls */}
                            <div className="flex flex-wrap gap-4 pt-3 border-t border-border">
                              <div className="flex items-center gap-2">
                                <Switch
                                  id={`carousel-${article.id}`}
                                  checked={article.is_carousel_featured || false}
                                  onCheckedChange={() => handleToggleCarouselFeatured(article.id, article.is_carousel_featured)}
                                />
                                <Label htmlFor={`carousel-${article.id}`} className="text-xs cursor-pointer">
                                  Show in carousel
                                </Label>
                              </div>

                              {article.is_carousel_featured && (
                                <div className="flex items-center gap-2">
                                  <Switch
                                    id={`pin-${article.id}`}
                                    checked={article.is_carousel_pinned || false}
                                    onCheckedChange={() => handleToggleCarouselPinned(article.id, article.is_carousel_pinned)}
                                  />
                                  <Label htmlFor={`pin-${article.id}`} className="text-xs cursor-pointer">
                                    Pin as first
                                  </Label>
                                </div>
                              )}

                              <div className="flex items-center gap-2">
                                <Label htmlFor={`order-${article.id}`} className="text-xs whitespace-nowrap">
                                  Category order:
                                </Label>
                                <Input
                                  id={`order-${article.id}`}
                                  type="number"
                                  min="1"
                                  max="999"
                                  value={article.category_pin_order || ""}
                                  onChange={(e) => {
                                    const value = e.target.value ? parseInt(e.target.value) : null;
                                    handleUpdateCategoryOrder(article.id, value);
                                  }}
                                  placeholder="Auto"
                                  className="w-20 h-8 text-xs"
                                />
                              </div>
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
