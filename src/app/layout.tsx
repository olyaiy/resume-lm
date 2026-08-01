import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import { SITE_URL } from "@/lib/site-config";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: SITE_URL },
  title: {
    default: "ResumeLM - AI-Powered Resume Builder",
    template: "%s | ResumeLM",
  },
  description:
    "Create tailored, ATS-optimized resumes powered by AI. Land your dream tech job with personalized resume optimization.",
  applicationName: "ResumeLM",
  keywords: [
    "resume builder",
    "AI resume",
    "ATS optimization",
    "tech jobs",
    "career tools",
    "job application",
  ],
  authors: [{ name: "ResumeLM" }],
  creator: "ResumeLM",
  publisher: "ResumeLM",
  formatDetection: { email: false, address: false, telephone: false },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: "ResumeLM",
    title: "ResumeLM - AI-Powered Resume Builder",
    description:
      "Create tailored, ATS-optimized resumes powered by AI. Land your dream tech job with personalized resume optimization.",
    images: [{ url: "/og.webp", width: 1200, height: 630, alt: "ResumeLM - AI Resume Builder" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ResumeLM - AI-Powered Resume Builder",
    description:
      "Create tailored, ATS-optimized resumes powered by AI. Land your dream tech job with personalized resume optimization.",
    images: ["/og.webp"],
    creator: "@resumelm",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans">
        {children}
        <Toaster
          richColors
          position="top-right"
          closeButton
          toastOptions={{
            style: {
              fontSize: "1rem",
              padding: "16px",
              minWidth: "400px",
              maxWidth: "500px",
            },
          }}
        />
      </body>
    </html>
  );
}
