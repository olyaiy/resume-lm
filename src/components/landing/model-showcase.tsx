import Image from "next/image";

export function ModelShowcase() {
  return (
    <div className="w-full py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Heading with gradient text */}
        <h2 className="text-center text-3xl font-semibold mb-12">
          <span className="bg-gradient-to-r from-violet-600 via-blue-600 to-violet-600 bg-clip-text text-transparent">
            Use Your Favorite AI Models
          </span>
        </h2>

        {/* Logo Container with Glass Effect */}
        <div className="relative">
          {/* Gradient background with animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-100/50 via-blue-100/50 to-violet-100/50 rounded-2xl blur-xl" />
          
          {/* Glass container */}
          <div className="relative backdrop-blur-xl bg-white/40 border border-white/40 rounded-2xl p-8 shadow-xl">
            {/* Logo grid with responsive layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 items-center justify-items-center">
              {/* ChatGPT Logo */}
              <div className="relative w-48 h-12 transition-transform duration-500 hover:scale-105">
                <Image
                  src="/chatgpt-full.png"
                  alt="ChatGPT"
                  fill
                  className="object-contain"
                />
              </div>

              {/* Claude Logo */}
              <div className="relative w-48 h-12 transition-transform duration-500 hover:scale-105">
                <Image
                  src="/claude-logo-full.svg"
                  alt="Claude"
                  fill
                  className="object-contain"
                />
              </div>

              {/* Deepseek Logo */}
              <div className="relative w-48 h-12 transition-transform duration-500 hover:scale-105">
                <Image
                  src="/deepseek-logo-full.png"
                  alt="Deepseek"
                  fill
                  className="object-contain"
                />
              </div>

              {/* Gemini Logo */}
              <div className="relative w-48 h-12 transition-transform duration-500 hover:scale-105">
                <Image
                  src="/gemini-logo-full.png"
                  alt="Gemini"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 