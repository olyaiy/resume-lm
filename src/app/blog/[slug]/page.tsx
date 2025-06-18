import { compileMDX } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { mdxComponents } from "@/components/blog/mdx-components";
import { Calendar, ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  
  const url = `https://resumelm.com/blog/${slug}`;
  const publishedTime = new Date(post.frontMatter.date).toISOString();
  
  return {
    title: post.frontMatter.title,
    description: post.frontMatter.description,
    keywords: ['resume builder', 'tech jobs', 'Vancouver tech', 'career advice', 'AI resume', 'job search'],
    authors: [{ name: 'ResumeLM Team' }],
    creator: 'ResumeLM',
    publisher: 'ResumeLM',
    category: 'Career Advice',
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: post.frontMatter.title,
      description: post.frontMatter.description,
      url: url,
      siteName: 'ResumeLM',
      type: 'article',
      publishedTime: publishedTime,
      authors: ['ResumeLM Team'],
      images: [
        {
          url: '/og.webp',
          width: 1200,
          height: 630,
          alt: post.frontMatter.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.frontMatter.title,
      description: post.frontMatter.description,
      images: ['/og.webp'],
      creator: '@resumelm',
      site: '@resumelm',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  let post;
  try {
    post = getPostBySlug(slug);
  } catch {
    return notFound();
  }

  const { content } = await compileMDX<{ title: string }>({
    source: post.content,
    components: mdxComponents,
  });

  // Calculate reading time (rough estimate)
  const wordCount = post.content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200); // Average reading speed

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
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="container mx-auto px-4 py-6 max-w-4xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium transition-colors duration-300 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to blog
          </Link>
        </nav>

        {/* Article Header */}
        <header className="container mx-auto px-4 pb-12 max-w-4xl">
          <div className="text-center max-w-3xl mx-auto">
            {/* Meta info */}
            <div className="flex items-center justify-center gap-6 text-sm text-gray-600 mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time dateTime={post.frontMatter.date}>
                  {new Date(post.frontMatter.date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{readingTime} min read</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-teal-600 via-cyan-600 to-purple-600 bg-clip-text text-transparent leading-tight">
              {post.frontMatter.title}
            </h1>

            {/* Description */}
            <p className="text-xl text-gray-600 leading-relaxed">
              {post.frontMatter.description}
            </p>
          </div>
        </header>

        {/* Article Content */}
        <article className="container mx-auto px-4 pb-16 max-w-4xl">
          {/* Structured Data */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Article',
                headline: post.frontMatter.title,
                description: post.frontMatter.description,
                image: 'https://resumelm.com/og.webp',
                datePublished: new Date(post.frontMatter.date).toISOString(),
                dateModified: new Date(post.frontMatter.date).toISOString(),
                author: {
                  '@type': 'Organization',
                  name: 'ResumeLM Team',
                  url: 'https://resumelm.com',
                },
                publisher: {
                  '@type': 'Organization',
                  name: 'ResumeLM',
                  logo: {
                    '@type': 'ImageObject',
                    url: 'https://resumelm.com/og.webp',
                  },
                  url: 'https://resumelm.com',
                },
                mainEntityOfPage: {
                  '@type': 'WebPage',
                  '@id': `https://resumelm.com/blog/${slug}`,
                },
                articleSection: 'Career Advice',
                keywords: 'resume builder, tech jobs, Vancouver tech, career advice, AI resume, job search',
                wordCount: wordCount,
                timeRequired: `PT${readingTime}M`,
              }),
            }}
          />
          
          <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl overflow-hidden">
            <div className="p-8 md:p-12 lg:p-16">
              <div className="prose prose-lg prose-slate max-w-none
                prose-headings:bg-gradient-to-r prose-headings:from-teal-600 prose-headings:to-cyan-600 prose-headings:bg-clip-text prose-headings:text-transparent prose-headings:font-bold
                prose-h1:text-4xl prose-h1:mb-8 prose-h1:mt-0
                prose-h2:text-3xl prose-h2:mb-6 prose-h2:mt-12
                prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-8
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
                prose-a:text-teal-600 prose-a:font-medium prose-a:no-underline hover:prose-a:text-teal-700 hover:prose-a:underline
                prose-strong:text-gray-900 prose-strong:font-semibold
                prose-blockquote:border-l-4 prose-blockquote:border-teal-500 prose-blockquote:bg-teal-50/50 prose-blockquote:rounded-r-lg prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:my-8 prose-blockquote:not-italic
                prose-blockquote:text-teal-800 prose-blockquote:font-medium
                prose-code:text-pink-600 prose-code:bg-pink-50 prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:text-sm prose-code:font-mono
                prose-pre:bg-gray-900 prose-pre:text-gray-50 prose-pre:rounded-xl prose-pre:shadow-lg
                prose-ul:space-y-2 prose-ol:space-y-2
                prose-li:text-gray-700
                prose-img:rounded-xl prose-img:shadow-lg prose-img:border prose-img:border-gray-200
              ">
                {content}
              </div>
            </div>
          </div>
        </article>

        {/* Footer CTA */}
        <footer className="container mx-auto px-4 pb-16 max-w-4xl">
          <div className="text-center">
            <div className="inline-block p-8 rounded-2xl bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to build your perfect resume?
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Join thousands of professionals who have already transformed their careers with ResumeLM.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/blog"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-teal-600 text-teal-600 font-semibold rounded-lg hover:bg-teal-50 transition-all duration-300"
                >
                  Read More Articles
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
} 