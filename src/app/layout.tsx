import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Footer } from "@/components/footer";
import { BuyMeCoffee } from "@/components/shared/buy-me-coffee";
import { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://resumelm.com"),
  title: {
    default: "ResumeLM - AI-Powered Resume Builder",
    template: "%s | ResumeLM"
  },
  description: "Create tailored, ATS-optimized resumes powered by AI. Land your dream tech job with personalized resume optimization.",
  applicationName: "ResumeLM",
  keywords: ["resume builder", "AI resume", "ATS optimization", "tech jobs", "career tools", "job application"],
  authors: [{ name: "ResumeLM" }],
  creator: "ResumeLM",
  publisher: "ResumeLM",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    siteName: "ResumeLM",
    title: "ResumeLM - AI-Powered Resume Builder",
    description: "Create tailored, ATS-optimized resumes powered by AI. Land your dream tech job with personalized resume optimization.",
    images: [
      {
        url: "/og.webp",
        width: 1200,
        height: 630,
        alt: "ResumeLM - AI Resume Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ResumeLM - AI-Powered Resume Builder",
    description: "Create tailored, ATS-optimized resumes powered by AI. Land your dream tech job with personalized resume optimization.",
    images: ["/og.webp"],
    creator: "@resumelm",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
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
  verification: {
    google: "google-site-verification-code", // Replace with actual verification code
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="relative min-h-screen flex flex-col">
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <BuyMeCoffee />
        </div>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
