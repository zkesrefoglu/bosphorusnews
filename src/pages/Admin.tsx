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

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // News article form state
  const [newsTitle, setNewsTitle] = useState("");
  const [newsSection, setNewsSection] = useState("");
  const [newsExcerpt, setNewsExcerpt] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [newsImageUrl, setNewsImageUrl] = useState("");

  // Daily topic form state
  const [topicTitle, setTopicTitle] = useState("");
  const [topicExcerpt, setTopicExcerpt] = useState("");
  const [topicContent, setTopicContent] = useState("");
  const [topicImageUrl, setTopicImageUrl] = useState("");

  useEffect(() => {
    checkAdmin();
  }, []);

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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Create slug from title
      const slug = newsTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      
      const { error } = await supabase
        .from("news_articles")
        .insert({
          title: newsTitle,
          slug: slug,
          category: newsSection,
          excerpt: newsExcerpt,
          content: newsContent,
          author: session.user.email || "Admin",
          image_url: newsImageUrl || null,
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
        title: "Error",
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Create slug from title
      const slug = topicTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      
      const { error } = await supabase
        .from("daily_topics")
        .insert({
          title: topicTitle,
          slug: slug,
          excerpt: topicExcerpt,
          content: topicContent,
          author: session.user.email || "Admin",
          published: true,
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Daily topic has been uploaded successfully",
      });

      // Reset form
      setTopicTitle("");
      setTopicExcerpt("");
      setTopicContent("");
      setTopicImageUrl("");
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

        <Tabs defaultValue="news" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="news">Latest News</TabsTrigger>
            <TabsTrigger value="topic">Daily Topic</TabsTrigger>
          </TabsList>

          <TabsContent value="news">
            <Card>
              <CardHeader>
                <CardTitle>Upload News Article</CardTitle>
                <CardDescription>
                  Add a new article to the latest news section
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
                <CardTitle>Upload Daily Topic</CardTitle>
                <CardDescription>
                  Update the featured daily topic section
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
                    <Label htmlFor="topic-image">Background Image URL (optional)</Label>
                    <Input
                      id="topic-image"
                      type="url"
                      value={topicImageUrl}
                      onChange={(e) => setTopicImageUrl(e.target.value)}
                    />
                  </div>

                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Uploading..." : "Upload Topic"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
