import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface TagInputProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  maxTags?: number;
}

export const TagInput = ({ selectedTags, onTagsChange, maxTags = 5 }: TagInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchTags = async () => {
    const { data } = await supabase.from("tags").select("*").order("name");
    if (data) setAllTags(data);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (value.trim()) {
      const filtered = allTags.filter(
        (tag) =>
          tag.name.toLowerCase().includes(value.toLowerCase()) &&
          !selectedTags.find((t) => t.id === tag.id)
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const addTag = async (tag: Tag) => {
    if (selectedTags.length >= maxTags) return;
    if (selectedTags.find((t) => t.id === tag.id)) return;
    
    onTagsChange([...selectedTags, tag]);
    setInputValue("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const createAndAddTag = async () => {
    if (!inputValue.trim() || selectedTags.length >= maxTags) return;
    
    const name = inputValue.trim();
    const slug = generateSlug(name);
    
    // Check if tag already exists
    const existingTag = allTags.find(
      (t) => t.name.toLowerCase() === name.toLowerCase() || t.slug === slug
    );
    
    if (existingTag) {
      addTag(existingTag);
      return;
    }
    
    // Create new tag
    const { data, error } = await supabase
      .from("tags")
      .insert({ name, slug })
      .select()
      .single();
    
    if (data && !error) {
      setAllTags([...allTags, data]);
      addTag(data);
    }
  };

  const removeTag = (tagId: string) => {
    onTagsChange(selectedTags.filter((t) => t.id !== tagId));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions.length > 0) {
        addTag(suggestions[0]);
      } else if (inputValue.trim()) {
        createAndAddTag();
      }
    }
    if (e.key === "Backspace" && !inputValue && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1].id);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-background min-h-[42px]">
        {selectedTags.map((tag) => (
          <Badge
            key={tag.id}
            variant="secondary"
            className="flex items-center gap-1 px-2 py-1"
          >
            #{tag.name}
            <button
              type="button"
              onClick={() => removeTag(tag.id)}
              className="hover:text-destructive"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
        {selectedTags.length < maxTags && (
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => inputValue && setShowSuggestions(true)}
            placeholder={selectedTags.length === 0 ? "Type to add tags..." : ""}
            className="flex-1 min-w-[120px] border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        )}
      </div>
      
      {showSuggestions && (suggestions.length > 0 || inputValue.trim()) && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-auto">
          {suggestions.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => addTag(tag)}
              className="w-full px-3 py-2 text-left hover:bg-muted transition-colors"
            >
              #{tag.name}
            </button>
          ))}
          {inputValue.trim() && !allTags.find((t) => t.name.toLowerCase() === inputValue.toLowerCase()) && (
            <button
              type="button"
              onClick={createAndAddTag}
              className="w-full px-3 py-2 text-left hover:bg-muted transition-colors text-primary"
            >
              Create "#{inputValue.trim()}"
            </button>
          )}
        </div>
      )}
      
      <p className="text-xs text-muted-foreground mt-1">
        {selectedTags.length}/{maxTags} tags. Press Enter to add.
      </p>
    </div>
  );
};
