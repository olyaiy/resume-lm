import { Logo } from "@/components/ui/logo";
import { NavMenu } from "@/components/layout/nav-menu";

interface AppHeaderProps {
  children?: React.ReactNode;
}

export function AppHeader({ children }: AppHeaderProps) {
  return (
    <header className="h-20 border-b backdrop-blur-xl sticky top-0 left-0 right-0 z-40 shadow-lg border-purple-200/50">
      {/* Gradient backdrop with blur */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-50/95 via-white/95 to-purple-50/95" />
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f3e8ff30_0%,#ffffff40_50%,#f3e8ff30_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-40%,#f3e8ff30_0%,transparent_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_100%_100%,#f3e8ff20_0%,transparent_100%)] pointer-events-none" />

      {/* Content Container */}
      <div className="max-w-[2000px] mx-auto h-full px-6 flex items-center relative">
        {/* Logo */}
        <Logo className="text-xl" />

        {/* Navigation Menu (right-aligned) */}
        <NavMenu />

        {/* Optional Children */}
        {children && <div className="flex items-center gap-2 ml-4">{children}</div>}
      </div>
    </header>
  );
} 