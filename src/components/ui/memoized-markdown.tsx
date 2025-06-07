import { marked } from 'marked';
import { memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'


function parseMarkdownIntoBlocks(markdown: string): string[] {
  // First, normalize newlines to ensure consistent handling
  const normalizedMarkdown = markdown.replace(/\r\n/g, '\n');
  
  // Preserve double spaces at end of lines (markdown line breaks)
  const preservedSpaces = normalizedMarkdown.replace(/(\s\s)$/gm, '  \n');
  
  // Split the content by double newlines before parsing
  const sections = preservedSpaces.split(/\n\n+/);
  
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
      <div className="">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          components={{
            // Ensure lists are properly styled
            ul: ({ children }) => <ul className="list-disc ml-3 mb-0">{children}</ul>,
            ol: ({ start, children }) => (
              <ol className="list-decimal ml-3 mb-0" start={start}>
                {children}
              </ol>
            ),
            li: ({ children, ...props }) => (
              <li className="py-2" {...props}>
                {children}
              </li>
            ),
            // Handle line breaks explicitly
            br: () => <br className="block h-4" />,
            // Proper paragraph styling with spacing
            p: ({ children }) => <p className="text-sm mb-2 whitespace-pre-line">{children}</p>,
            // Proper heading styles
            h1: ({ children }) => <h1 className="text-2xl font-bold mt-4 mb-2">{children}</h1>,
            h2: ({ children }) => <h2 className="text-xl font-bold mt-3 mb-1.5">{children}</h2>,
            h3: ({ children }) => <h3 className="text-lg font-bold mt-2.5 mb-1.5">{children}</h3>,
            h4: ({ children }) => <h4 className="text-base font-bold mt-2 mb-1">{children}</h4>,
            h5: ({ children }) => <h5 className="text-sm font-bold mt-1.5 mb-1">{children}</h5>,
            h6: ({ children }) => <h6 className="text-xs font-bold mt-1 mb-0.5">{children}</h6>,
            // Code block styling
            code: (props) => {
              const { inline, className, children } = props as { inline?: boolean; className?: string; children: React.ReactNode };
              if (inline)
                return <code className="bg-muted px-1 py-0.5 rounded text-xs">{children}</code>;
              return (
                <code className={`not-prose ${className || ''}`}>{children}</code>
              );
            },
            // Proper blockquote styling
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-muted pl-3 italic text-sm">{children}</blockquote>
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