import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

function NavLink({ href, children, className }: NavLinkProps) {
  return (
    <a
      href={href}
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
      <NavLink href="#about">About</NavLink>
    </div>
  );
} 