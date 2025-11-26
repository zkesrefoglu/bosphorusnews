import { useEffect, useRef, useState, useMemo } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

// Custom image handler
const imageHandler = (quillRef: React.RefObject<ReactQuill>, toast: any) => {
  return function() {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        // Create unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `inline-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload to Supabase storage
        const { error: uploadError } = await supabase.storage
          .from('article-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('article-images')
          .getPublicUrl(filePath);

        // Insert image into editor
        const quill = quillRef.current?.getEditor();
        if (quill) {
          const range = quill.getSelection();
          if (range) {
            quill.insertEmbed(range.index, 'image', publicUrl);
            quill.setSelection(range.index + 1, 0);
          }
        }

        toast({
          title: "Image uploaded",
          description: "Image has been inserted into the article",
        });
      } catch (error: any) {
        toast({
          title: "Upload failed",
          description: error.message,
          variant: "destructive",
        });
      }
    };
  };
};


const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'indent',
  'align',
  'blockquote', 'code-block',
  'color', 'background',
  'link', 'image'
];

export const RichTextEditor = ({ value, onChange, placeholder, className, minHeight = '400px' }: RichTextEditorProps) => {
  const quillRef = useRef<ReactQuill>(null);
  const { toast } = useToast();
  const [editorId] = useState(() => `editor-${Math.random().toString(36).substr(2, 9)}`);

  const editorModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
        [{ 'color': [] }, { 'background': [] }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: imageHandler(quillRef, toast)
      }
    }
  }), []);

  useEffect(() => {
    // Inject custom styles for this editor instance
    const styleId = `style-${editorId}`;
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        #${editorId} .ql-toolbar {
          position: sticky;
          top: 0;
          z-index: 10;
          background: hsl(var(--background));
          border-bottom: 1px solid hsl(var(--border));
        }
        
        #${editorId} .ql-container {
          min-height: ${minHeight};
          font-size: 16px;
        }
        
        #${editorId} .ql-editor {
          min-height: ${minHeight};
          font-size: 16px;
          line-height: 1.7;
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      const style = document.getElementById(styleId);
      if (style) {
        style.remove();
      }
    };
  }, [editorId, minHeight]);

  return (
    <div id={editorId} className={cn("rich-text-editor sticky-toolbar-container", className)}>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={editorModules}
        formats={formats}
        placeholder={placeholder}
        className="bg-background"
      />
    </div>
  );
};
