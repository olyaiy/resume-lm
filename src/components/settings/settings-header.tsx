import { Logo } from "@/components/ui/logo";

export function SettingsHeader() {
  return (
    <div className="h-20 border-b border-white/20 bg-gradient-to-r from-white/95 via-white/98 to-white/95 backdrop-blur-xl fixed left-0 right-0 z-40 shadow-lg shadow-black/5">
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff20_0%,#ffffff40_50%,#ffffff20_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-40%,#ffffff30_0%,transparent_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_100%_100%,#ffffff20_0%,transparent_100%)] pointer-events-none" />
      
      {/* Content Container */}
      <div className="max-w-[2000px] mx-auto h-full px-8 flex items-center justify-between relative">
        {/* Left Section */}
        <div className="flex items-center gap-8">
          <Logo className="text-2xl" />

          {/* Separator with Gradient */}
          <div className="h-12 w-px bg-gradient-to-b from-transparent via-gray-200/50 to-transparent" />

          {/* Settings Title Section */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Settings
                </span>
              </h1>
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-100">
                <div className="w-2 h-2 rounded-full bg-teal-400" />
                <span className="text-xs font-medium text-teal-600">Account & Preferences</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 