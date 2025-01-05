import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileCardProps {
  title: string;
  description: string;
  className?: string;
}

export function ProfileCard({ title, description, className }: ProfileCardProps) {
  const styles = {
    border: "border-teal-200/60",
    bg: "bg-gradient-to-br from-teal-50/80 via-cyan-50/80 to-teal-50/80",
    text: "from-teal-600 to-cyan-600",
    hover: "hover:bg-gradient-to-br hover:from-teal-100/80 hover:via-cyan-100/80 hover:to-teal-100/80",
  };

  return (
    <div className="relative group">
      {/* Animated background elements */}
      <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-[40px] blur-xl group-hover:blur-2xl transition-all duration-500 -z-10" />
      
      <div
        className={cn(
          "w-72 py-4 rounded-[32px] border-2",
          "transition-all duration-500 backdrop-blur-sm",
          "hover:-translate-y-1 hover:shadow-xl",
          "flex flex-col items-center justify-center text-center",
          "relative overflow-hidden",
          styles.border,
          styles.bg,
          styles.hover,
          className
        )}
      >
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-400/10 to-cyan-400/10 rounded-full translate-x-16 -translate-y-16" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-cyan-400/10 to-teal-400/10 rounded-full -translate-x-16 translate-y-16" />

        {/* Icon container */}
        <div className={cn(
          "w-20 h-20 rounded-2xl mb-4",
          "flex items-center justify-center",
          "bg-gradient-to-r shadow-lg",
          "transform transition-transform duration-500 group-hover:scale-110",
          styles.text
        )}>
          <User className="w-10 h-10 text-white" />
        </div>

        {/* Title */}
        <h3 className={cn(
          "text-xl font-semibold bg-gradient-to-r bg-clip-text text-transparent",
          "mb-3",
          styles.text
        )}>
          {title}
        </h3>

        {/* Description */}
        <p className="text-base text-muted-foreground px-8 leading-relaxed">
          {description}
        </p>

        {/* Updated text section */}
        <p className="mt-6 text-sm text-muted-foreground px-8 leading-relaxed">
          A central place for all your work experiences, projects, skills, and accomplishments
        </p>
      </div>
    </div>
  );
} 