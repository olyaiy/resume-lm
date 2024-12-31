import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowRight, Github, Sparkles, Target, Zap, CheckCircle2, ChevronRight } from "lucide-react";

export default async function LoginPage() {
  return (
    <main className="min-h-screen relative overflow-hidden selection:bg-purple-200/50">
      {/* Enhanced Gradient Background Elements */}
      <div className="fixed inset-0 z-0">
        {/* Primary gradient mesh with improved colors */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50/60 via-sky-50/60 to-violet-50/60 animate-gradient-slow" />
        
        {/* Enhanced animated gradient orbs with better positioning and animations */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-to-r from-pink-200/30 to-violet-200/30 rounded-full blur-3xl animate-float-slow opacity-80 mix-blend-multiply" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-gradient-to-r from-blue-200/30 to-teal-200/30 rounded-full blur-3xl animate-float-delayed opacity-80 mix-blend-multiply" />
        <div className="absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-gradient-to-r from-purple-200/30 to-indigo-200/30 rounded-full blur-3xl animate-float opacity-80 mix-blend-multiply" />
        
        {/* Enhanced mesh grid overlay with subtle animation */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px] animate-mesh-slow" />
      </div>

      {/* Enhanced Navigation with backdrop blur and border */}
      <nav className="relative z-10 border-b border-white/20 backdrop-blur-md bg-white/5 sticky top-0">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent hover:scale-105 transition-transform cursor-pointer">
              ResumeLM
            </div>
            <div className="flex items-center gap-4">
              <a href="https://github.com/your-repo" target="_blank" rel="noopener noreferrer" 
                className="p-2 rounded-full hover:bg-purple-50/80 transition-all duration-300 hover:scale-110">
                <Github className="w-5 h-5 text-purple-600" />
              </a>
              <Button variant="ghost" 
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50/80 transition-all duration-300 hover:scale-105">
                Login
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Content with better spacing and animations */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row items-center gap-12 mb-20">
          {/* Enhanced Hero Left Section */}
          <div className="flex-1 text-center lg:text-left space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50/80 border border-purple-200 text-purple-600 hover:bg-purple-100/80 transition-all duration-300 cursor-pointer group hover:scale-105">
              <Github className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span className="text-sm font-medium">Open Source on GitHub</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold space-y-2">
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent inline-block hover:scale-105 transition-transform cursor-default">
                Open Source, AI Resume Builder
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent inline-block hover:scale-105 transition-transform cursor-default">
                that lands you tech jobs
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
              Create tailored, ATS-optimized resumes powered by AI. 
              <span className="block mt-2 opacity-90">Stand out to recruiters and increase your interview chances by 3x.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" 
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/35 hover:-translate-y-1 transition-all duration-300 group">
                Get Started Free 
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" 
                className="border-purple-200 hover:bg-purple-50/80 hover:-translate-y-1 transition-all duration-300">
                View Demo
              </Button>
            </div>

            {/* Enhanced Quick Benefits with animations */}
            <div className="flex flex-col sm:flex-row gap-6 text-sm text-muted-foreground">
              {[
                "AI-Powered Resume Analysis",
                "ATS-Optimized Templates",
                "Tech-Focused Design"
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 group hover:scale-105 transition-transform cursor-default">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0 group-hover:text-purple-700 transition-colors" />
                  <span className="group-hover:text-purple-700 transition-colors">{benefit}</span>
                </div>
              ))}
            </div>
            
            {/* Enhanced Social Proof with hover effects */}
            <div className="p-6 rounded-xl bg-white/40 backdrop-blur-md border border-white/40 shadow-xl shadow-purple-500/5 hover:shadow-purple-500/15 transition-all duration-300 hover:-translate-y-1">
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-8">
                <div className="flex items-center gap-3 group">
                  <div className="flex -space-x-3 hover:space-x-1 transition-all duration-300">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} 
                        className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 border-2 border-white p-0.5 transition-transform hover:scale-110">
                        <div className="w-full h-full rounded-full bg-white" />
                      </div>
                    ))}
                  </div>
                  <p className="text-sm">
                    <span className="font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">2,000+</span>
                    <span className="text-muted-foreground"> resumes created</span>
                  </p>
                </div>
                <div className="h-8 w-px bg-purple-200/80 hidden sm:block" />
                <div className="flex items-center gap-3 group">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Sparkles key={i} className="w-5 h-5 text-yellow-400 transition-transform group-hover:scale-110" />
                    ))}
                  </div>
                  <p className="text-sm">
                    <span className="font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">4.9/5</span>
                    <span className="text-muted-foreground"> user rating</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Auth Card with improved glass effect */}
          <div className="flex-1 w-full max-w-md">
            <Card className="glass-card border-white/40 shadow-xl backdrop-blur-xl hover:shadow-purple-500/15 transition-all duration-500 hover:-translate-y-1">
              <CardHeader className="space-y-4">
                <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Start Building Your Future
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Create your account to build an AI-powered resume that gets noticed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="signup" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login" className="data-[state=active]:bg-purple-50/80">Login</TabsTrigger>
                    <TabsTrigger value="signup" className="data-[state=active]:bg-purple-50/80">Sign Up</TabsTrigger>
                  </TabsList>
                  <TabsContent value="login">
                    <LoginForm />
                  </TabsContent>
                  <TabsContent value="signup">
                    <SignupForm />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhanced Features Grid with improved cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {[
            {
              icon: <Zap className="w-6 h-6 text-purple-600" />,
              title: "AI-Powered Optimization",
              description: "Our AI analyzes your experience and tailors your resume to match job requirements perfectly."
            },
            {
              icon: <Target className="w-6 h-6 text-purple-600" />,
              title: "ATS-Friendly Format",
              description: "Ensure your resume passes through Applicant Tracking Systems with our optimized templates."
            },
            {
              icon: <Sparkles className="w-6 h-6 text-purple-600" />,
              title: "Tailored for Tech",
              description: "Specifically designed for software engineers, developers, and tech professionals."
            }
          ].map((feature, i) => (
            <Card key={i} 
              className="glass-card border-white/40 hover:shadow-purple-500/15 transition-all duration-300 hover:-translate-y-2 group">
              <CardContent className="pt-6">
                <div className="rounded-full w-12 h-12 flex items-center justify-center bg-purple-50/80 mb-4 group-hover:scale-110 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
  