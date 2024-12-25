/**
 * Resume Preview Component
 * 
 * This component generates a PDF resume using @react-pdf/renderer and displays it using react-pdf.
 * It supports two variants: base and tailored resumes, with consistent styling and layout.
 * The PDF is generated client-side and updates whenever the resume data changes.
 */

"use client";

import { Resume } from "@/lib/types";
import { Document, Page, pdfjs } from 'react-pdf';
import { useState, useEffect } from 'react';
import { pdf } from '@react-pdf/renderer';
import { ResumePDFDocument } from './resume-pdf-document';
import { useDebouncedValue } from '@/hooks/use-debounced-value';

// Import required CSS for react-pdf
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface ResumePreviewProps {
  resume: Resume;
  variant?: 'base' | 'tailored';
  containerWidth?: number;
}

/**
 * ResumePreview Component
 * 
 * Displays a PDF preview of the resume using react-pdf.
 * Handles PDF generation and responsive display.
 */
export function ResumePreview({ resume, variant = 'base', containerWidth }: ResumePreviewProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const debouncedWidth = useDebouncedValue(containerWidth, 100);

  // Generate PDF when resume data changes
  useEffect(() => {
    async function generatePDF() {
      const blob = await pdf(<ResumePDFDocument resume={resume} variant={variant} />).toBlob();
      const url = URL.createObjectURL(blob);
      setUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    generatePDF();
  }, [resume, variant]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  // Show loading state while PDF is being generated
  if (!url) {
    return (
      <div className="w-full aspect-[8.5/11] bg-white rounded-xl shadow-lg p-8">
        <div className="space-y-8 animate-pulse">
          {/* Header skeleton */}
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded-md w-1/3 mx-auto" />
            <div className="flex justify-center gap-4">
              <div className="h-3 bg-gray-200 rounded w-24" />
              <div className="h-3 bg-gray-200 rounded w-24" />
              <div className="h-3 bg-gray-200 rounded w-24" />
            </div>
          </div>

          {/* Summary skeleton */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-5/6" />
            </div>
          </div>

          {/* Experience skeleton */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-32" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="h-3 bg-gray-200 rounded w-48" />
                    <div className="h-3 bg-gray-200 rounded w-24" />
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-5/6" />
                </div>
              ))}
            </div>
          </div>

          {/* Education skeleton */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-28" />
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="h-3 bg-gray-200 rounded w-40" />
                    <div className="h-3 bg-gray-200 rounded w-24" />
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Display the generated PDF using react-pdf
  return (
    <div className="w-full h-full relative">
      <Document
        file={url}
        onLoadSuccess={onDocumentLoadSuccess}
        className="flex flex-col items-center w-full h-full bg-red-500"
        loading={
          <div className="w-full aspect-[8.5/11] bg-white rounded-xl shadow-lg p-8">
            <div className="space-y-8 animate-pulse">
              {/* Header skeleton */}
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded-md w-1/3 mx-auto" />
                <div className="flex justify-center gap-4">
                  <div className="h-3 bg-gray-200 rounded w-24" />
                  <div className="h-3 bg-gray-200 rounded w-24" />
                  <div className="h-3 bg-gray-200 rounded w-24" />
                </div>
              </div>

              {/* Summary skeleton */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-5/6" />
                </div>
              </div>

              {/* Experience skeleton */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32" />
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="h-3 bg-gray-200 rounded w-48" />
                        <div className="h-3 bg-gray-200 rounded w-24" />
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-full" />
                      <div className="h-3 bg-gray-200 rounded w-5/6" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Education skeleton */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-28" />
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="h-3 bg-gray-200 rounded w-40" />
                        <div className="h-3 bg-gray-200 rounded w-24" />
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        }
      >
        {Array.from(new Array(numPages), (_, index) => (
          <Page
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            className="mb-4 rounded-xl shadow-lg"
            width={debouncedWidth}
          />
        ))}
      </Document>
    </div>
  );
} 