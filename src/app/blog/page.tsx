import { getAllPosts } from "@/lib/blog";
import Link from "next/link";
import { Metadata } from "next";
import { Calendar, ArrowRight, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "ResumeLM Blog",
  description: "Latest updates, tips, and articles from the ResumeLM team.",
};

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <main className="min-h-screen relative">
      {/* Background with gradient and pattern */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 via-sky-50/50 to-violet-50/50" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px]" />
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-teal-200/20 to-cyan-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-200/20 to-indigo-200/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-16 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-full text-sm font-medium text-teal-700 mb-6">
            <Sparkles className="w-4 h-4" />
            Latest insights and updates
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-teal-600 via-cyan-600 to-purple-600 bg-clip-text text-transparent leading-tight">
            ResumeLM Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Discover the latest tips, product updates, and insights from our team as we revolutionize resume building with AI.
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid gap-8 md:gap-12">
          {posts.map(({ slug, frontMatter }, index) => (
            <article key={slug} className={`group ${index === 0 ? 'md:col-span-2' : ''}`}>
              <Link
                href={`/blog/${slug}`}
                className="block"
              >
                <div className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-xl border border-white/40 shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:scale-[1.02] group-hover:border-teal-200/60">
                  {/* Gradient border effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-400/10 via-cyan-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative p-8 md:p-10">
                    {/* Featured badge for first post */}
                    {index === 0 && (
                      <div className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs font-semibold rounded-full mb-4">
                        <Sparkles className="w-3 h-3" />
                        Featured
                      </div>
                    )}
                    
                    {/* Date */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <Calendar className="w-4 h-4" />
                      <time dateTime={frontMatter.date}>
                        {new Date(frontMatter.date).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </time>
                    </div>

                    {/* Title */}
                    <h2 className={`font-bold mb-4 text-gray-900 group-hover:text-teal-600 transition-colors duration-300 ${
                      index === 0 ? 'text-3xl md:text-4xl' : 'text-2xl'
                    }`}>
                      {frontMatter.title}
                    </h2>

                    {/* Description */}
                    <p className={`text-gray-600 leading-relaxed mb-6 ${
                      index === 0 ? 'text-lg' : 'text-base'
                    }`}>
                      {frontMatter.description}
                    </p>

                    {/* Read more link */}
                    <div className="flex items-center gap-2 text-teal-600 font-semibold group-hover:text-teal-700 transition-colors duration-300">
                      <span>Read article</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {/* Call to action */}
        <div className="text-center mt-20">
          <div className="inline-block p-8 rounded-2xl bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Want to stay updated?
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Follow our journey as we continue to innovate and improve the resume building experience.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
            >
              Try ResumeLM
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
} 