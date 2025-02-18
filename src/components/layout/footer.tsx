import Link from "next/link";
import { Github, Linkedin, Twitter, Mail } from "lucide-react";

interface FooterProps {
  variant?: 'fixed' | 'static';
}

export function Footer({ variant = 'fixed' }: FooterProps) {
  return (
    <footer className={`h-auto md:h-14 w-full border-t border-black/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 ${variant === 'fixed' ? 'fixed bottom-0 left-0 right-0' : 'static'}`}>
      <div className="container py-4 md:py-0 flex flex-col md:flex-row h-auto md:h-14 items-center justify-between gap-4 md:gap-0">
        <div className="flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            ResumeLM © 2025
          </p>
          <span className="text-sm text-muted-foreground text-center">
            Made with ❤️ in Vancouver, BC
          </span>
        </div>
        <nav className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
          <Link
            href="mailto:resumelm@pm.me"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
          >
            <Mail className="h-4 w-4" />
            <span>Contact Support</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="https://x.com/alexanfromvan"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              <Twitter className="h-5 w-5 md:h-4 md:w-4" />
            </Link>
            <Link
              href="https://linkedin.com/in/olyaiy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              <Linkedin className="h-5 w-5 md:h-4 md:w-4" />
            </Link>
            <Link
              href="https://github.com/olyaiy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              <Github className="h-5 w-5 md:h-4 md:w-4" />
            </Link>
          </div>
        </nav>
      </div>
    </footer>
  );
} 