import Image, { ImageProps } from "next/image";
import type { ComponentProps } from "react";

function RoundedImage(props: ImageProps) {
  return <Image {...props} className="rounded-md border shadow-sm my-4" />;
}

function InlineCode(props: ComponentProps<"code">) {
  return (
    <code
      {...props}
      className="px-1 py-0.5 bg-muted rounded text-sm font-mono text-pink-600"
    />
  );
}

export const mdxComponents = {
  img: RoundedImage,
  Image: RoundedImage,
  code: InlineCode,
  pre: (props: ComponentProps<"pre">) => (
    <pre
      {...props}
      className="my-4 rounded-lg bg-gray-900 text-gray-50 overflow-x-auto p-4"
    />
  ),
  // You can map more elements as needed
}; 