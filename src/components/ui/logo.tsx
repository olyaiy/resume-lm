import { cn } from "@/lib/utils";
import Link from "next/link";
import { GradientHover } from "./gradient-hover";

interface LogoProps {
  className?: string;
  asLink?: boolean;
}

export function Logo({ className, asLink = true }: LogoProps) {
  const logoContent = (
    <GradientHover className={cn("text-2xl font-bold", className)}>
      ResumeLM
    </GradientHover>
  );

  if (asLink) {
    return (
      <Link href="/">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
} 