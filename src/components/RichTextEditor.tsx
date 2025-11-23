import { useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const modules = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'color': [] }, { 'background': [] }],
    ['clean']
  ],
};

const formats = [
  'bold', 'italic', 'underline',
  'list', 'bullet',
  'color', 'background'
];

export const RichTextEditor = ({ value, onChange, placeholder, className }: RichTextEditorProps) => {
  const quillRef = useRef<ReactQuill>(null);

  return (
    <div className={cn("rich-text-editor", className)}>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="bg-background"
      />
    </div>
  );
};
