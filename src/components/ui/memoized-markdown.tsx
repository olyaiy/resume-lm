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
            ul: ({ children }) => <ul className="list-disc ml-3">{children}</ul>,
            ol: ({ start, children }) => (
              <ol className="list-decimal ml-3" start={start}>
                {children}
              </ol>
            ),
            li: ({ ordered, index, children }) => (
              <li value={ordered ? index + 1 : undefined}>
                {children}
              </li>
            ),
            // Proper heading styles
            h1: ({ children }) => <h1 className="text-2xl font-bold mt-4 mb-2">{children}</h1>,
            h2: ({ children }) => <h2 className="text-xl font-bold mt-3 mb-1.5">{children}</h2>,
            h3: ({ children }) => <h3 className="text-lg font-bold mt-2.5 mb-1.5">{children}</h3>,
            h4: ({ children }) => <h4 className="text-base font-bold mt-2 mb-1">{children}</h4>,
            h5: ({ children }) => <h5 className="text-sm font-bold mt-1.5 mb-1">{children}</h5>,
            h6: ({ children }) => <h6 className="text-xs font-bold mt-1 mb-0.5">{children}</h6>,
            // Code block styling
            code: ({ inline, className, children }) => {
              // If it's an inline code block
              if (inline) {
                return <code className="bg-muted px-1 py-0.5 rounded text-xs">{children}</code>;
              }
              
              // For code blocks, we return a div wrapper instead of pre directly
              return (
                <div className="not-prose">
                  {/* <pre className="bg-muted p-3 rounded-lg overflow-x-auto text-xs"> */}
                    <code className={className}>{children}</code>
                  {/* </pre> */}
                </div>
              );
            },
            // Proper blockquote styling
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-muted pl-3 italic text-sm">{children}</blockquote>
            ),
            // Add default paragraph styling
            p: ({ children }) => <p className="text-sm">{children}</p>,
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