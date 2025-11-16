import React, { useState } from 'react';
import { FileText, Download, AlertCircle, Sparkles } from 'lucide-react';
import * as mammoth from 'mammoth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function NewsConverter() {
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState('');
  const [format, setFormat] = useState('json');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatingAI, setGeneratingAI] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const generateExcerptWithAI = async (content: string): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-headline', {
        body: { content }
      });

      if (error) {
        console.error('Error generating headline:', error);
        const cleaned = content.replace(/--\s*[A-Z]+.*?\{.*?\}\s*$/i, '').trim();
        return cleaned.substring(0, 70).trim() + (cleaned.length > 70 ? '...' : '');
      }

      return data.headline || content.substring(0, 70) + '...';
    } catch (err) {
      console.error('Failed to generate AI headline:', err);
      const cleaned = content.replace(/--\s*[A-Z]+.*?\{.*?\}\s*$/i, '').trim();
      return cleaned.substring(0, 70).trim() + (cleaned.length > 70 ? '...' : '');
    }
  };

  const parseNews = (text: string) => {
    const lines = text.split('\n');
    const newsItems: Array<{ content: string; category: string; source: string; excerpt?: string }> = [];
    let currentCategory = 'General';

    for (let line of lines) {
      line = line.trim();
      
      if (!line || line.includes('UPDATES & HEADLINES') || line.includes('TURKEY --')) continue;
      
      const categoryMatch = line.match(/\{([^}]+)\}/);
      const hasSourceAttribution = line.match(/--\s+[A-Z]/);
      
      if (categoryMatch || hasSourceAttribution) {
        if (categoryMatch) {
          currentCategory = categoryMatch[1].trim();
        }
        
        let content = line.replace(/^[-•·*]\s*/, '').trim();
        
        const sourceMatch = content.match(/--\s+([A-Z]+.*?)(?:\{|$)/i);
        const source = sourceMatch ? sourceMatch[1].trim() : 'Unknown';
        
        content = content.replace(/--\s*[A-Z]+.*?\{.*?\}\s*$/i, '').trim();
        
        if (content.length > 20) {
          newsItems.push({
            content,
            category: currentCategory,
            source
          });
        }
      }
    }

    return newsItems;
  };

  const convertToFormat = async (newsItems: Array<{ content: string; category: string; source: string }>) => {
    setGeneratingAI(true);
    setProgress({ current: 0, total: newsItems.length });

    const itemsWithExcerpts = [];
    for (let i = 0; i < newsItems.length; i++) {
      const item = newsItems[i];
      setProgress({ current: i + 1, total: newsItems.length });
      const excerpt = await generateExcerptWithAI(item.content);
      itemsWithExcerpts.push({ ...item, excerpt });
    }

    setGeneratingAI(false);

    if (format === 'csv') {
      const header = 'Category,Excerpt,Content,Source\n';
      const rows = itemsWithExcerpts
        .map(item => {
          const escapeCsv = (str: string) => `"${str.replace(/"/g, '""')}"`;
          return `${escapeCsv(item.category)},${escapeCsv(item.excerpt || '')},${escapeCsv(item.content)},${escapeCsv(item.source)}`;
        })
        .join('\n');
      return header + rows;
    } else {
      return JSON.stringify(itemsWithExcerpts, null, 2);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      setInputText(result.value);
      
      const newsItems = parseNews(result.value);
      const converted = await convertToFormat(newsItems);
      setOutput(converted);
      toast.success('File converted successfully with AI-generated headlines!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError('Error processing file: ' + errorMessage);
      toast.error('Failed to process file');
    } finally {
      setLoading(false);
    }
  };

  const handleConvert = async () => {
    try {
      setError('');
      const newsItems = parseNews(inputText);
      
      if (newsItems.length === 0) {
        setError('No news items found. Make sure text is properly formatted with bullets.');
        return;
      }
      
      const converted = await convertToFormat(newsItems);
      setOutput(converted);
      toast.success('Text converted successfully with AI-generated headlines!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError('Error converting: ' + errorMessage);
      toast.error('Failed to convert text');
    }
  };

  const handleDownload = () => {
    try {
      if (!output) {
        setError('Nothing to download. Please convert text first.');
        return;
      }
      
      const blob = new Blob([output], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `news_data_${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('File downloaded successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError('Error downloading: ' + errorMessage);
      toast.error('Failed to download file');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold text-foreground">News Converter</h2>
          <p className="text-sm text-muted-foreground">Convert DOCX news files to CSV or JSON with AI-generated catchy headlines</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Output Format
          </label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Upload DOCX File
          </label>
          <input
            type="file"
            accept=".docx"
            onChange={handleFileUpload}
            disabled={loading || generatingAI}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:cursor-pointer hover:file:bg-primary/90 disabled:opacity-50"
          />
        </div>
      </div>

      {generatingAI && (
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <span className="text-sm font-medium text-foreground">
              Generating AI headlines... ({progress.current}/{progress.total})
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-destructive">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-foreground">
              Input Text
            </label>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your news text here..."
            className="w-full h-96 px-4 py-3 bg-background border border-border rounded-lg text-foreground font-mono text-sm focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-foreground">
              Output ({format.toUpperCase()})
            </label>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Converted output will appear here..."
            className="w-full h-96 px-4 py-3 bg-muted border border-border rounded-lg text-foreground font-mono text-sm resize-none"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleConvert}
          disabled={loading || generatingAI || !inputText}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading || generatingAI ? 'Processing...' : 'Convert with AI'}
        </button>
        
        <button
          onClick={handleDownload}
          disabled={!output || loading || generatingAI}
          className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download {format.toUpperCase()}
        </button>
      </div>
    </div>
  );
}
