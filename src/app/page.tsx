import { Background } from "@/components/landing/Background";
import { Hero } from "@/components/landing/Hero";

export default function Page() {
  return (
    <main className="relative overflow-x-hidden selection:bg-violet-200/50">
      {/* Background component */}
      <Background />
      
      {/* Main content */}
      <div className="relative z-10 min-h-[100vh] container mx-auto px-4 py-8 md:py-16 flex flex-col justify-center">
        {/* Hero Section */}
        <Hero />
      </div>
    </main>
  );
}