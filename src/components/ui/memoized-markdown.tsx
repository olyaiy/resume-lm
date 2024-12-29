import { marked } from 'marked';
import { memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'


function parseMarkdownIntoBlocks(markdown: string): string[] {
  // First, normalize newlines to ensure consistent handling
  const normalizedMarkdown = markdown.replace(/\r\n/g, '\n');
  
  // Split the content by double newlines before parsing
  const sections = normalizedMarkdown.split(/\n\n+/);
  
  // Parse each section separately to maintain spacing
  const blocks: string[] = [];
  
  for (const section of sections) {
    if (!section.trim()) {
      continue; // Skip empty sections
    }
    
    const tokens = marked.lexer(section);
    let currentBlock = '';
    
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      currentBlock += token.raw;
    }
    
    if (currentBlock.trim()) {
      blocks.push(currentBlock);
    }
  }
  
  return blocks;
}

const MemoizedMarkdownBlock = memo(
  ({ content }: { content: string }) => {
    return (
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Ensure lists are properly styled
            ul: ({ children }) => <ul className="list-disc ml-4">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal ml-4">{children}</ol>,
            // Proper heading styles
            h1: ({ children }) => <h1 className="text-2xl font-bold mt-4 mb-2">{children}</h1>,
            h2: ({ children }) => <h2 className="text-xl font-bold mt-3 mb-2">{children}</h2>,
            h3: ({ children }) => <h3 className="text-lg font-bold mt-2 mb-1">{children}</h3>,
            // Code block styling
            code: ({ inline, children }) => 
              inline ? (
                <code className="bg-muted px-1 py-0.5 rounded">{children}</code>
              ) : (
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <code>{children}</code>
                </pre>
              ),
            // Proper blockquote styling
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-muted pl-4 italic">{children}</blockquote>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  },
  (prevProps, nextProps) => prevProps.content === nextProps.content
);

MemoizedMarkdownBlock.displayName = 'MemoizedMarkdownBlock';

export const MemoizedMarkdown = memo(
  ({ content, id }: { content: string; id: string }) => {
    const blocks = useMemo(() => parseMarkdownIntoBlocks(content), [content]);

    return blocks.map((block, index) => (
      <MemoizedMarkdownBlock content={block} key={`${id}-block_${index}`} />
    ));
  },
);

MemoizedMarkdown.displayName = 'MemoizedMarkdown';