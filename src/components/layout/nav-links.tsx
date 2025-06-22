'use client'
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

function NavLink({ href, children, className }: NavLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Only prevent default and use smooth scrolling for anchor links (starting with #)
    if (href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
    // For regular page routes (like /blog), let the browser handle navigation normally
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={cn(
        "text-sm font-medium text-muted-foreground/90 hover:text-foreground transition-colors duration-200",
        className
      )}
    >
      {children}
    </a>
  );
}

export function NavLinks() {
  return (
    <div className="hidden md:flex items-center gap-6">
      <NavLink href="#features">Features</NavLink>
      <NavLink href="#how-it-works">How it Works</NavLink>
      <NavLink href="#pricing">Pricing</NavLink>
      <NavLink href="#creator-story">About</NavLink>
      <NavLink href="/blog">Blog</NavLink>
    </div>
  );
} 