"use client"
import { useRef, useState, useEffect } from "react"
import { Play, Maximize2 } from "lucide-react"

export function VideoShowcase() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`)
        })
      } else {
        document.exitFullscreen()
      }
    }
  }

  useEffect(() => {
    const handleVideoEnd = () => {
      setIsPlaying(false)
    }
    
    const video = videoRef.current
    if (video) {
      video.addEventListener('ended', handleVideoEnd)
    }
    
    return () => {
      if (video) {
        video.removeEventListener('ended', handleVideoEnd)
      }
    }
  }, [])

  return (
    <section className="py-16 md:py-24 px-4 relative overflow-hidden" id="how-it-works">
      {/* Simplified background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-teal-100/10"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-indigo-100/10"></div>
      
      <div className="container mx-auto max-w-6xl">
        {/* Section header */}
        <div className="text-center mb-12 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-teal-600">
            See ResumeLM in Action
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Watch how our AI-powered platform transforms your resume in minutes
          </p>
        </div>
        
        {/* Video container with simplified styling */}
        <div className="relative mx-auto group">
          {/* Simplified card effect container */}
          <div className="relative rounded-2xl bg-white border border-gray-200 shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg z-10">
            {/* Video placeholder */}
            <div 
              className="relative aspect-video w-full cursor-pointer" 
              onClick={togglePlay}
            >
              <video 
                ref={videoRef}
                className="w-full h-full object-cover rounded-2xl"
                src="/ResumeLM.mp4"
                poster="/thumbnail.png"
                onEnded={() => setIsPlaying(false)}
              />
              
              {/* Simplified overlay for thumbnail */}
              {!isPlaying && (
                <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
              )}
              
              {/* Play button - Only shows when video is paused */}
              {!isPlaying && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-full bg-indigo-600 text-white transition-all duration-300 hover:scale-110 z-20"
                  aria-label="Play video"
                >
                  <Play className="w-8 h-8 ml-1" />
                </button>
              )}
              
              {/* Controls overlay - bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                <div className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200">
                  ResumeLM Demo
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFullscreen();
                  }}
                  className="text-white bg-black/20 p-2 rounded-full border border-white/10 transition-all duration-300 hover:bg-black/30"
                  aria-label="Toggle fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Feature badges below video */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-sm border border-indigo-200 text-indigo-700">
              Interactive Demo
            </span>
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-sm border border-indigo-200 text-indigo-700">
              User-friendly Interface
            </span>
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-sm border border-indigo-200 text-indigo-700">
              Real-time AI Assistance
            </span>
          </div>
        </div>
      </div>
    </section>
  )
} 