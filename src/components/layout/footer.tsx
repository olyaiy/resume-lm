import Link from "next/link";
import { Github, Linkedin, Twitter } from "lucide-react";

interface FooterProps {
  variant?: 'fixed' | 'static';
}

export function Footer({ variant = 'fixed' }: FooterProps) {
  return (
    <footer className={`h-14 w-full border-t border-black/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 ${variant === 'fixed' ? 'fixed bottom-0 left-0 right-0' : 'static'}`}>
      <div className="container flex h-14 items-center justify-between ">
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            ResumeLM © 2025
          </p>
          <span className="text-sm text-muted-foreground">
            Made with ❤️ in Vancouver, BC
          </span>
        </div>
        <nav className="flex items-center gap-4">
          <Link
            href="https://x.com/alexanfromvan"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Twitter className="h-4 w-4" />
          </Link>
          <Link
            href="https://linkedin.com/in/olyaiy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Linkedin className="h-4 w-4" />
          </Link>
          <Link
            href="https://github.com/olyaiy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="h-4 w-4" />
          </Link>
        </nav>
      </div>
    </footer>
  );
} 