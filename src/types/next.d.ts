// Extend window with Next.js runtime data
declare global {
  interface Window {
    __NEXT_DATA__?: {
      basePath?: string;
      [key: string]: unknown;
    };
  }
}

export {};
