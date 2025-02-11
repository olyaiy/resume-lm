'use client'

import { useCallback, useMemo, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import Document from '@tiptap/extension-document'
import Text from '@tiptap/extension-text'
import Paragraph from '@tiptap/extension-paragraph'
import debounce from 'lodash/debounce'
import Bold from '@tiptap/extension-bold'
import History from '@tiptap/extension-history'
import { memo } from 'react'
import { cn } from '@/lib/utils'

interface TiptapProps {
  content: string;
  onChange: (content: string) => void;
  className?: string;
  readOnly?: boolean;
  variant?: 'default' | 'skill';
  editorProps?: {
    attributes?: {
      class?: string;
      placeholder?: string;
    };
  };
}

const Tiptap = memo(
  ({ content, onChange, className, readOnly, variant = 'default', editorProps: customEditorProps }: TiptapProps) => {
    // Transform content to HTML before loading
    const transformContent = useCallback((content: string) => {
      return content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    }, []);

    // Debounce the onChange callback
    const debouncedOnChange = useMemo(
      () => debounce((text: string) => {
        onChange(text);
      }, 300),
      [onChange]
    );

    // Memoize editor configuration
    const extensions = useMemo(
      () => [Document, Text, Paragraph, Bold, History],
      []
    );

    const editorProps = useMemo(
      () => ({
        attributes: {
          class: cn(
            "prose w-full rounded-lg border border-input bg-white/50 text-xs md:text-sm ring-offset-background",
            "placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            // Apply different styles based on variant
            variant === 'default' && "min-h-[80px] px-3 py-2",
            variant === 'skill' && "px-3",
            className
          ),
          ...customEditorProps?.attributes
        },
      }),
      [className, customEditorProps?.attributes, variant]
    );

    const editor = useEditor({
      extensions,
      content: transformContent(content),
      editorProps,
      editable: !readOnly,
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        // Convert <strong> tags back to asterisks
        const textWithAsterisks = html
          .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
          .replace(/<p>/g, '')
          .replace(/<\/p>/g, '')
          .trim();
        debouncedOnChange(textWithAsterisks);
      },
      immediatelyRender: false,
    });

    // Sync editor content when content prop changes
    useEffect(() => {
      if (editor && content !== editor.getHTML().replace(/<p>/g, '').replace(/<\/p>/g, '').trim()) {
        editor.commands.setContent(transformContent(content));
      }
    }, [content, editor, transformContent]);

    return <EditorContent editor={editor} />;
  },
  (prevProps, nextProps) => {
    // Update memo comparison to include content changes
    return (
      prevProps.className === nextProps.className &&
      prevProps.readOnly === nextProps.readOnly &&
      prevProps.content === nextProps.content &&
      prevProps.variant === nextProps.variant
    );
  }
);

// Add display name for debugging
Tiptap.displayName = 'Tiptap';

export default Tiptap;
