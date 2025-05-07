"use client"
import React from 'react';
import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle2, ChevronRight, Star } from "lucide-react";
import Link from "next/link";

const FeatureHighlights = () => {
  // Enhanced features with metrics, testimonials, and benefit-focused language
  const features = [
    {
      title: "Get 3x More Interviews",
      description: "Our AI analyzes thousands of successful resumes to give you personalized recommendations that highlight your strengths and match what employers are looking for.",
      image: "/images/ss1.webp",
      gradient: "from-purple-600 to-indigo-600",
      lightGradient: "from-purple-600/10 to-indigo-600/10",
      borderColor: "border-purple-200/40",
      textColor: "text-purple-700",
      metrics: "86% of users report higher response rates",
      benefits: [
        "Smart content suggestions based on your experience",
        "Keyword optimization for ATS systems",
        "Industry-specific recommendations"
      ],
      testimonial: {
        quote: "I got interviews at 3 top tech companies after using ResumeLM to optimize my resume.",
        author: "Michael K., Software Engineer",
        rating: 5
      }
    },
    {
      title: "Pass Resume Screening Systems",
      description: "Stop getting rejected by ATS. Get real-time feedback and actionable insights with our resume scoring system that analyzes what's missing from your application.",
      image: "/images/ss2.webp",
      gradient: "from-teal-600 to-cyan-600",
      lightGradient: "from-teal-600/10 to-cyan-600/10",
      borderColor: "border-teal-200/40",
      textColor: "text-teal-700",
      metrics: "91% improvement in ATS compatibility scores",
      benefits: [
        "Real-time ATS compatibility checks",
        "Keyword gap analysis for job descriptions",
        "Format optimization for parsing accuracy"
      ],
      testimonial: {
        quote: "ResumeLM showed me exactly why my resume wasn't getting through. Fixed it in minutes!",
        author: "Sarah L., Marketing Director",
        rating: 5
      }
    },
    {
      title: "Save Hours on Cover Letters",
      description: "Create personalized cover letters in seconds that highlight your relevant experience and demonstrate why you're the perfect fit for each specific role.",
      image: "/images/ss3.webp",
      gradient: "from-pink-600 to-rose-600",
      lightGradient: "from-pink-600/10 to-rose-600/10",
      borderColor: "border-pink-200/40",
      textColor: "text-pink-700",
      metrics: "Average 28 minutes saved per application",
      benefits: [
        "Tailored to match job requirements",
        "Professional tone and structure",
        "Highlights relevant achievements"
      ],
      testimonial: {
        quote: "I applied to 12 jobs in one afternoon with customized cover letters for each one.",
        author: "Alex J., Project Manager",
        rating: 5
      }
    },
    {
      title: "Manage Your Job Search Efficiently",
      description: "Keep track of all your applications, versions, and feedback in one intuitive dashboard designed to streamline your entire job search process.",
      image: "/images/ss4.webp",
      gradient: "from-emerald-600 to-green-600",
      lightGradient: "from-emerald-600/10 to-green-600/10",
      borderColor: "border-emerald-200/40",
      textColor: "text-emerald-700",
      metrics: "Users apply to 40% more relevant positions",
      benefits: [
        "Centralized resume version control",
        "Application status tracking",
        "Performance analytics across applications"
      ],
      testimonial: {
        quote: "The dashboard completely transformed how I organize my job search. So much less stress!",
        author: "Jamie T., Data Analyst",
        rating: 5
      }
    },
  ];

  // Trusted by logos
  const companies = [
    { name: "Google", logo: "/logos/google.png" },
    { name: "Microsoft", logo: "/logos/microsoft.webp" },
    { name: "Amazon", logo: "/logos/amazon.png" },
    { name: "Meta", logo: "/logos/meta.png" },
    { name: "Netflix", logo: "/logos/netflix.png" },
  ];

  // Statistics counters
  const stats = [
    { value: "50,000+", label: "Resumes Created" },
    { value: "89%", label: "Interview Rate" },
    { value: "4.9/5", label: "User Rating" },
    { value: "15 min", label: "Average Setup Time" },
  ];

  // Animation variants for scroll reveal
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="py-24 md:py-32 px-4 sm:px-6 relative overflow-hidden">
      {/* Enhanced decorative elements */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-purple-200/30 to-indigo-200/30 blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-tr from-teal-200/30 to-cyan-200/30 blur-3xl"></div>
      <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-pink-200/20 to-rose-200/20 blur-3xl"></div>
 
      {/* Section header with enhanced value proposition */}
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              The Resume Builder That Gets You Hired
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Smart AI tools that optimize your resume for each job, increasing your interview chances by up to 3x
          </p>
        </motion.div>

        {/* Statistics counter section */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 max-w-4xl mx-auto mt-10 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              variants={itemVariants}
              className="rounded-xl bg-white/30 backdrop-blur-sm border border-white/40 p-4 md:p-6"
            >
              <p className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
      
      {/* Enhanced features display */}
      <div className="max-w-7xl mx-auto space-y-24 md:space-y-40">
        {features.map((feature, index) => (
          <motion.div 
            key={index}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-10 lg:gap-10`}
          >
            {/* Enhanced feature description */}
            <div className="w-full lg:w-2/6 space-y-8">
              <motion.div variants={itemVariants}>
                <div className={`inline-block px-4 py-1 rounded-full bg-gradient-to-r ${feature.lightGradient} ${feature.borderColor} ${feature.textColor} text-sm font-medium mb-3`}>
                  <div className="flex items-center">
                    <span className="mr-2">{feature.metrics}</span>
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </div>
                </div>
                <h3 className={`text-2xl md:text-3xl font-semibold bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-lg mt-3">
                  {feature.description}
                </p>
              </motion.div>

              {/* Feature benefits list */}
              <motion.div variants={itemVariants} className="space-y-2 ">
                {feature.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className={`w-5 h-5 ${feature.textColor} flex-shrink-0 mt-0.5`} />
                    <span className="text-sm md:text-base">{benefit}</span>
                  </div>
                ))}
              </motion.div>

              {/* Testimonial card */}
              {/* <motion.div 
                variants={itemVariants}
                className="mt-6 bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/40"
              >
                <div className="flex gap-1 mb-2">
                  {Array(feature.testimonial.rating).fill(0).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 fill-current ${feature.textColor}`} />
                  ))}
                </div>
                <p className="text-sm italic">&ldquo;{feature.testimonial.quote}&rdquo;</p>
                <p className={`text-sm font-medium ${feature.textColor} mt-2`}>
                  {feature.testimonial.author}
                </p>
              </motion.div> */}

              {/* Feature-specific CTA */}
              <motion.div variants={itemVariants} className="pt-2">
                <Link 
                  href="/auth/register" 
                  className={`inline-flex items-center gap-1 px-5 py-2 rounded-lg bg-gradient-to-r ${feature.gradient} text-white font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5`}
                >
                  Try this feature
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
            
            {/* Enhanced feature image with 3D effect */}
            <motion.div 
              variants={itemVariants}
              className="w-full lg:w-4/6 group"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="relative rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer shadow-2xl transform-gpu">
                {/* Enhanced 3D effect with multiple layers */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/60 to-white/20 opacity-70 z-10"></div>
                <div className={`absolute -inset-0.5 bg-gradient-to-tr ${feature.gradient} opacity-20 blur-sm z-0`}></div>
                
                {/* Image frame with enhanced lighting effects */}
                <div className="relative bg-white/40 backdrop-blur-md border border-white/60 shadow-xl overflow-hidden p-1 z-20">
                  {/* The screenshot with enhanced container */}
                  <div className="relative rounded-lg overflow-hidden shadow-inner" style={{ aspectRatio: '3/2' }}>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/0 z-10"></div>
                    <Image 
                      src={feature.image} 
                      alt={feature.title} 
                      fill
                      quality={100}
                      className="object-cover object-top transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 65vw, 900px"
                      priority
                    />
                    
                    {/* Enhanced hover effect with gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 to-white/0 group-hover:from-white/0 group-hover:to-white/20 transition-all duration-700 z-10"></div>
                    
                    {/* Reflection effect */}
                    <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/20 to-transparent transform -skew-y-6 z-20"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
      
      {/* Social proof section - Trusted by companies */}
      <motion.div 
        className="mt-24 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <h3 className="text-xl text-muted-foreground mb-8">Trusted by professionals from companies like</h3>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 max-w-4xl mx-auto opacity-80">
          {companies.map((company, index) => (
            <div key={index} className="w-24 h-12 relative grayscale hover:grayscale-0 transition-all duration-300">
              <Image 
                src={company.logo} 
                alt={company.name} 
                fill
                className="object-contain" 
                sizes="100px"
              />
            </div>
          ))}
        </div>
      </motion.div>
      
      {/* Enhanced CTA section */}
      <motion.div 
        className="mt-28 text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-3xl mx-auto px-6 py-12 rounded-2xl bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-lg border border-white/40 shadow-xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Ready to land your dream job?
            </span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join 50,000+ professionals who are getting more interviews with ResumeLM
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/register" 
              className="px-8 py-4 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-lg font-medium shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              Create Your Free Resume
            </Link>
            <Link 
              href="/examples" 
              className="px-8 py-4 rounded-lg bg-white/80 border border-purple-200/40 text-lg font-medium transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                See Examples
              </span>
            </Link>
          </div>
          
          <p className="text-sm text-muted-foreground mt-6 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            No credit card required • 100% free
          </p>
        </div>
      </motion.div>

      {/* Sticky mobile CTA - only visible on mobile/tablet */}
      <div className="md:hidden fixed bottom-4 left-0 right-0 z-50 px-4">
        <Link 
          href="/auth/register" 
          className="flex items-center justify-center w-full py-3.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium shadow-lg"
        >
          Get Started Now
        </Link>
      </div>
    </section>
  );
};

export default FeatureHighlights;
