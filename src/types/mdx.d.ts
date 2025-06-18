declare module '*.mdx' {
  import { FC, DetailedHTMLProps, HTMLAttributes } from 'react';
  const MDXComponent: FC<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>>;
  export default MDXComponent;
} 