import Image from "next/image";
import { cn } from "@/lib/utils";
import { CheckCircle2, Star } from "lucide-react";



interface SplitContentProps {
  imageSrc: string;
  heading: string;
  description: string;
  imageOnLeft?: boolean;
  imageOverflowRight?: boolean;
  className?: string;
  children?: React.ReactNode;
  bulletPoints?: string[];
  badgeText?: string;
  badgeGradient?: string;
}

export function SplitContent({
  imageSrc,
  heading,
  description,
  imageOnLeft = true,
  imageOverflowRight = false,
  className,
  children,
  bulletPoints,
  badgeText,
  badgeGradient = "from-purple-600/10 to-indigo-600/10",
}: SplitContentProps) {
  return (
   
    <div className={cn(
      "relative w-full  overflow-hidden",
      "before:absolute before:inset-0 before:bg-gradient-to-br before:from-violet-50/80 before:via-blue-50/80 before:to-indigo-50/80 before:opacity-75",
      "after:absolute after:inset-0 after:bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] after:bg-[size:14px_24px] after:opacity-20 ",
      className
    )}>
      <div className="relative w-full px-4 sm:px-6 lg:px-8">
        <div className={cn(
          "grid gap-12 lg:gap-8 items-center",
          "lg:grid-cols-5"
        )}>
          {/* Content Section - Enhanced Typography and Layout */}
          {imageOverflowRight && (
            <div className={cn(
              "relative flex flex-col gap-8 lg:col-span-2",
              "lg:pl-16 text-right",
              "order-first lg:order-none"
            )}>
              {/* Badge if provided */}
              {badgeText && (
                <div className={`inline-block self-end px-4 py-1 rounded-full bg-gradient-to-r ${badgeGradient} border-purple-200/40 text-purple-700 text-sm font-medium mb-1`}>
                  <div className="flex items-center">
                    <span className="mr-2">{badgeText}</span>
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </div>
                </div>
              )}
              
              {/* Enhanced heading with gradient underline */}
              <div className="space-y-2 inline-flex flex-col items-end w-full">
                <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
                  <span className="inline-block bg-gradient-to-r from-violet-600 via-blue-600 to-violet-600 bg-clip-text text-transparent animate-gradient-x pb-2">
                    {heading}
                  </span>
                </h2>
                <div className="h-1 w-24 bg-gradient-to-r from-violet-500/80 to-blue-500/80 rounded-full" />
              </div>
              
              {/* Enhanced description */}
              <p className="text-xl text-muted-foreground/90 leading-relaxed font-medium">
                {description}
              </p>

              {/* Bullet points if provided */}
              {bulletPoints && bulletPoints.length > 0 && (
                <div className="space-y-2 flex flex-col items-end">
                  {bulletPoints.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2 flex-row-reverse">
                      <CheckCircle2 className="w-5 h-5 text-purple-700 flex-shrink-0 mt-0.5" />
                      <span className="text-sm md:text-base text-right">{point}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Optional children for interactive elements */}
              {children && (
                <div className="mt-4">
                  {children}
                </div>
              )}
            </div>
          )}

          
          {/* Image Section - Enhanced for Screenshots */}
          <div className={cn(
            "relative group lg:col-span-3",
            imageOverflowRight ? "w-[140%]" : "w-[140%] -ml-[40%]",
            "aspect-[16/10]",
            "order-last lg:order-none"
          )}>
            {/* Enhanced image container with deeper glass effect */}
            <div className="relative h-full w-full overflow-hidden rounded-2xl shadow-2xl ">
              {/* Main image */}
            
              <div className="relative h-full w-full p-2">
               
                <Image
                  src={imageSrc}
                  alt={heading}
                  fill
                  className="object-cover rounded-xl transition-all duration-700 group-hover:scale-[1.02]"
                  sizes="(min-width: 1440px) 50vw, (min-width: 1024px) 60vw, (min-width: 768px) 80vw, 100vw"
                  quality={100}
                  priority
                  loading="eager"
                  style={{
                    objectFit: 'cover',
                    transform: 'translate3d(0, 0, 0)',
                  }}
                />
                
                {/* Subtle shine effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-xl" />
              </div>

            </div>

          </div>

          {/* Content Section - Enhanced Typography and Layout */}
          {!imageOverflowRight && (
            <div className={cn(
              "relative flex flex-col gap-8 lg:col-span-2",
              imageOnLeft ? "lg:pl-16" : "lg:pr-16",
              "order-first lg:order-none"
            )}>
              {/* Badge if provided */}
              {badgeText && (
                <div className={`inline-block px-4 py-1 rounded-full bg-gradient-to-r ${badgeGradient} border-purple-200/40 text-purple-700 text-sm font-medium mb-1`}>
                  <div className="flex items-center">
                    <span className="mr-2">{badgeText}</span>
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </div>
                </div>
              )}
              
              {/* Enhanced heading with gradient underline */}
              <div className="space-y-2">
                <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
                  <span className="inline-block bg-gradient-to-r from-violet-600 via-blue-600 to-violet-600 bg-clip-text text-transparent animate-gradient-x pb-2">
                    {heading}
                  </span>
                </h2>
                <div className="h-1 w-24 bg-gradient-to-r from-violet-500/80 to-blue-500/80 rounded-full" />
              </div>
              
              {/* Enhanced description */}
              <p className="text-xl text-muted-foreground/90 leading-relaxed font-medium">
                {description}
              </p>

              {/* Bullet points if provided */}
              {bulletPoints && bulletPoints.length > 0 && (
                <div className="space-y-2">
                  {bulletPoints.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-purple-700 flex-shrink-0 mt-0.5" />
                      <span className="text-sm md:text-base">{point}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Optional children for interactive elements */}
              {children && (
                <div className="mt-4">
                  {children}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
 
  );
} 