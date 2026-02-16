'use client';

import { Document as PDFDocument, Page as PDFPage, Text, View, StyleSheet } from '@react-pdf/renderer';
import { memo } from 'react';

const styles = StyleSheet.create({
  page: {
    padding: 72, // 1 inch margins
    fontFamily: 'Times-Roman',
    fontSize: 11,
    lineHeight: 1.5,
    color: '#000',
    backgroundColor: '#fff',
  },
  paragraph: {
    marginBottom: 12,
  },
  text: {
    textAlign: 'left',
  },
});

interface CoverLetterPDFDocumentProps {
  content: string;
}

// Convert HTML content to plain text paragraphs
function parseHtmlContent(html: string): string[] {
  if (!html) return [];

  // Split by paragraph tags
  const paragraphs = html
    .split(/<\/?p>/gi)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  // Process each paragraph
  return paragraphs.map(p => {
    // Replace <br /> with newlines
    let text = p.replace(/<br\s*\/?>/gi, '\n');
    // Remove any remaining HTML tags
    text = text.replace(/<[^>]*>/g, '');
    // Decode common HTML entities
    text = text
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&mdash;/g, '—')
      .replace(/&ndash;/g, '–')
      .replace(/&hellip;/g, '...')
      .replace(/‑/g, '-'); // Replace non-breaking hyphen
    // Clean up multiple spaces and trim
    text = text.replace(/\s+/g, ' ').trim();
    return text;
  }).filter(p => p.length > 0);
}

export const CoverLetterPDFDocument = memo(function CoverLetterPDFDocument({
  content
}: CoverLetterPDFDocumentProps) {
  const paragraphs = parseHtmlContent(content);

  return (
    <PDFDocument>
      <PDFPage size="LETTER" style={styles.page}>
        {paragraphs.map((paragraph, index) => (
          <View key={index} style={styles.paragraph}>
            <Text style={styles.text}>{paragraph}</Text>
          </View>
        ))}
      </PDFPage>
    </PDFDocument>
  );
});
