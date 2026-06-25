'use client';

import {
  Document as PDFDocument,
  Page as PDFPage,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { ReactNode } from 'react';

// Renders the cover letter through @react-pdf (the same engine the resume PDF
// uses) instead of rasterizing the DOM with html2canvas. html2canvas clones the
// whole document to render and bails out to a blank page when the page contains
// a tainted <canvas> (pdf.js / the resume preview), which is unavoidable here.
// @react-pdf builds the PDF directly from the markup and never touches the DOM.

const styles = StyleSheet.create({
  page: {
    paddingVertical: 56,
    paddingHorizontal: 56,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.5,
    color: '#1a1a1a',
  },
  block: { marginBottom: 10 },
  h1: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  h2: { fontSize: 15, fontWeight: 'bold', marginBottom: 8 },
  h3: { fontSize: 13, fontWeight: 'bold', marginBottom: 6 },
});

const TEXT_NODE = 3;
const ELEMENT_NODE = 1;

// Inline formatting: nested <Text> with bold/italic/underline.
function inlineStyleFor(tag: string) {
  switch (tag) {
    case 'STRONG':
    case 'B':
      return { fontWeight: 'bold' as const };
    case 'EM':
    case 'I':
      return { fontStyle: 'italic' as const };
    case 'U':
    case 'INS':
      return { textDecoration: 'underline' as const };
    case 'S':
    case 'STRIKE':
    case 'DEL':
      return { textDecoration: 'line-through' as const };
    default:
      return {};
  }
}

function renderInline(node: Node, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  node.childNodes.forEach((child, i) => {
    const k = `${key}-${i}`;
    if (child.nodeType === TEXT_NODE) {
      const text = child.textContent ?? '';
      if (text) out.push(text);
    } else if (child.nodeType === ELEMENT_NODE) {
      const el = child as Element;
      if (el.tagName === 'BR') {
        out.push(<Text key={k}>{'\n'}</Text>);
      } else {
        out.push(
          <Text key={k} style={inlineStyleFor(el.tagName)}>
            {renderInline(el, k)}
          </Text>,
        );
      }
    }
  });
  return out;
}

const BLOCK_CONTAINERS = new Set(['DIV', 'UL', 'OL', 'BLOCKQUOTE']);

// Flatten block-level markup into a list of react-pdf paragraphs. Containers
// (the prose wrapper div, lists) are descended into; everything else is treated
// as a paragraph.
function renderBlocks(parent: Node, keyBase: string): ReactNode[] {
  const blocks: ReactNode[] = [];
  parent.childNodes.forEach((child, i) => {
    if (child.nodeType !== ELEMENT_NODE) return;
    const el = child as Element;
    const tag = el.tagName;
    const k = `${keyBase}-${i}`;

    if (BLOCK_CONTAINERS.has(tag)) {
      blocks.push(...renderBlocks(el, k));
      return;
    }

    const blockStyle =
      tag === 'H1' ? styles.h1
      : tag === 'H2' ? styles.h2
      : tag === 'H3' || tag === 'H4' || tag === 'H5' || tag === 'H6' ? styles.h3
      : styles.block;

    const align = (el as HTMLElement).style?.textAlign;
    const style = align
      ? [blockStyle, { textAlign: align as 'left' | 'center' | 'right' | 'justify' }]
      : blockStyle;

    const prefix = tag === 'LI' ? '•  ' : '';
    blocks.push(
      <Text key={k} style={style}>
        {prefix}
        {renderInline(el, k)}
      </Text>,
    );
  });
  return blocks;
}

export function CoverLetterPDFDocument({ html }: { html: string }) {
  const parsed = new DOMParser().parseFromString(html || '', 'text/html');
  const blocks = renderBlocks(parsed.body, 'cl');

  return (
    <PDFDocument>
      <PDFPage size="LETTER" style={styles.page}>
        <View>
          {blocks.length > 0
            ? blocks
            : <Text>{parsed.body.textContent ?? ''}</Text>}
        </View>
      </PDFPage>
    </PDFDocument>
  );
}
