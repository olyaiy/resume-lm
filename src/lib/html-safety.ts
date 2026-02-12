const STRIP_TAG_PATTERNS = [
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /<style[\s\S]*?>[\s\S]*?<\/style>/gi,
  /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
  /<object[\s\S]*?>[\s\S]*?<\/object>/gi,
  /<embed[\s\S]*?>[\s\S]*?<\/embed>/gi,
  /<svg[\s\S]*?>[\s\S]*?<\/svg>/gi,
  /<math[\s\S]*?>[\s\S]*?<\/math>/gi,
  /<form[\s\S]*?>[\s\S]*?<\/form>/gi,
  /<input[^>]*>/gi,
  /<button[\s\S]*?>[\s\S]*?<\/button>/gi,
  /<link[^>]*>/gi,
  /<meta[^>]*>/gi,
  /<base[^>]*>/gi,
];

export function sanitizeRichTextHtml(html: string): string {
  let sanitized = html;

  for (const pattern of STRIP_TAG_PATTERNS) {
    sanitized = sanitized.replace(pattern, '');
  }

  return sanitized
    .replace(/\son\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s(srcdoc)=('([^']*)'|"([^"]*)"|[^\s>]+)/gi, '')
    .replace(/\s(href|src|xlink:href)=('|")\s*javascript:[\s\S]*?\2/gi, '')
    .replace(/\s(href|src|xlink:href)=('|")\s*data:text\/html[\s\S]*?\2/gi, '');
}

export function toSafeJsonScript(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
