export function Background() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden size-full">
      {/* Simplified gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50/60 via-blue-50/60 to-indigo-50/60" />

      {/* Single subtle animated orb - much lighter */}
      <div className="absolute top-1/3 left-1/2 w-[400px] h-[400px] bg-gradient-to-r from-violet-200/20 to-blue-200/20 rounded-full blur-2xl animate-pulse opacity-60 transform -translate-x-1/2" />

      {/* Simplified static mesh overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:20px_20px]" />
    </div>
  );
} 