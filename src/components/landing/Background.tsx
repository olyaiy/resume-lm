export function Background() {
  return (
    <div className="fixed inset-0 z-0">
      {/* Primary gradient mesh with improved colors */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50/60 via-blue-50/60 to-indigo-50/60 animate-gradient-slow" />

      {/* Enhanced animated gradient orbs with better positioning and animations - mobile optimized */}
      <div className="absolute top-1/4 left-1/4 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-gradient-to-r from-violet-200/30 to-blue-200/30 rounded-full blur-3xl animate-float-slow opacity-80 mix-blend-multiply" />
      <div className="absolute bottom-1/3 right-1/4 w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-gradient-to-r from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl animate-float-delayed opacity-80 mix-blend-multiply" />
      <div className="absolute top-1/2 right-1/3 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-gradient-to-r from-indigo-200/30 to-violet-200/30 rounded-full blur-3xl animate-float opacity-80 mix-blend-multiply" />

      {/* Enhanced mesh grid overlay with subtle animation */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px] animate-mesh-slow" />
    </div>
  );
} 