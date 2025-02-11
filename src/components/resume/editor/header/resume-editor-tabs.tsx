'use client';

import { User, Briefcase, FolderGit2, GraduationCap, Wrench, LayoutTemplate } from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ResumeEditorTabs() {
  return (
    <>
      {/* Enhanced second row with Resume Score and Cover Letter */}
      <div className="my-2">
        <TabsList className="h-full w-full relative bg-white/80 backdrop-blur-xl border border-white/40 rounded-lg overflow-hidden grid grid-cols-2 gap-0.5 p-0.5 shadow-lg">
          
          {/* Resume Score */}
          <TabsTrigger 
            value="resume-score" 
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium relative transition-all duration-300
              data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/10 data-[state=active]:to-teal-500/10
              data-[state=active]:border-emerald-500/20 data-[state=active]:shadow-md hover:bg-white/60
              data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-900"
          >
            <div className="p-1 rounded-md bg-emerald-100/80 transition-transform duration-300 group-data-[state=active]:scale-105 group-data-[state=active]:bg-emerald-100">
              <svg className="h-3.5 w-3.5 text-emerald-600 transition-colors group-data-[state=inactive]:text-emerald-500/70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <span className="relative text-sm whitespace-nowrap">
              Resume Score
              <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full bg-emerald-500 scale-x-0 transition-transform duration-300 group-data-[state=active]:scale-x-100"></div>
            </span>
          </TabsTrigger>

          {/* Cover Letter */}
          <TabsTrigger 
            value="cover-letter" 
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium relative transition-all duration-300
              data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/10 data-[state=active]:to-orange-500/10
              data-[state=active]:border-amber-500/20 data-[state=active]:shadow-md hover:bg-white/60
              data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-900"
          >
            <div className="p-1 rounded-md bg-amber-100/80 transition-transform duration-300 group-data-[state=active]:scale-105 group-data-[state=active]:bg-amber-100">
              <svg className="h-3.5 w-3.5 text-amber-600 transition-colors group-data-[state=inactive]:text-amber-500/70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <line x1="10" y1="9" x2="8" y2="9"/>
              </svg>
            </div>
            <span className="relative text-sm whitespace-nowrap">
              Cover Letter
              <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full bg-amber-500 scale-x-0 transition-transform duration-300 group-data-[state=active]:scale-x-100"></div>
            </span>
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsList className="h-full w-full relative bg-white/80 backdrop-blur-xl border border-white/40 rounded-lg overflow-hidden grid grid-cols-3 @[500px]:grid-cols-6 gap-0.5 p-0.5 shadow-lg">
        {/* Basic Info Tab */}
        <TabsTrigger 
          value="basic" 
          className="group flex items-center gap-1.5 px-2 py-1 rounded-md font-medium relative transition-all duration-300
            data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500/10 data-[state=active]:to-cyan-500/10
            data-[state=active]:border-teal-500/20 data-[state=active]:shadow-md hover:bg-white/60
            data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-900"
        >
          <div className="p-1 rounded-md bg-teal-100/80 transition-transform duration-300 group-data-[state=active]:scale-105 group-data-[state=active]:bg-teal-100">
            <User className="h-3.5 w-3.5 text-teal-600 transition-colors group-data-[state=inactive]:text-teal-500/70" />
          </div>
          <span className="relative text-xs whitespace-nowrap">
            Basic Info
            <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full bg-teal-500 scale-x-0 transition-transform duration-300 group-data-[state=active]:scale-x-100"></div>
          </span>
        </TabsTrigger>

        {/* Work Tab */}
        <TabsTrigger 
          value="work" 
          className="group flex items-center gap-1.5 px-2 py-1 rounded-md font-medium relative transition-all duration-300
            data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/10 data-[state=active]:to-blue-500/10
            data-[state=active]:border-cyan-500/20 data-[state=active]:shadow-md hover:bg-white/60
            data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-900"
        >
          <div className="p-1 rounded-md bg-cyan-100/80 transition-transform duration-300 group-data-[state=active]:scale-105 group-data-[state=active]:bg-cyan-100">
            <Briefcase className="h-3.5 w-3.5 text-cyan-600 transition-colors group-data-[state=inactive]:text-cyan-500/70" />
          </div>
          <span className="relative text-xs whitespace-nowrap">
            Work
            <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full bg-cyan-500 scale-x-0 transition-transform duration-300 group-data-[state=active]:scale-x-100"></div>
          </span>
        </TabsTrigger>

        {/* Projects Tab */}
        <TabsTrigger 
          value="projects" 
          className="group flex items-center gap-1.5 px-2 py-1 rounded-md font-medium relative transition-all duration-300
            data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500/10 data-[state=active]:to-purple-500/10
            data-[state=active]:border-violet-500/20 data-[state=active]:shadow-md hover:bg-white/60
            data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-900"
        >
          <div className="p-1 rounded-md bg-violet-100/80 transition-transform duration-300 group-data-[state=active]:scale-105 group-data-[state=active]:bg-violet-100">
            <FolderGit2 className="h-3.5 w-3.5 text-violet-600 transition-colors group-data-[state=inactive]:text-violet-500/70" />
          </div>
          <span className="relative text-xs whitespace-nowrap">
            Projects
            <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full bg-violet-500 scale-x-0 transition-transform duration-300 group-data-[state=active]:scale-x-100"></div>
          </span>
        </TabsTrigger>

        {/* Education Tab */}
        <TabsTrigger 
          value="education" 
          className="group flex items-center gap-1.5 px-2 py-1 rounded-md font-medium relative transition-all duration-300
            data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/10 data-[state=active]:to-blue-500/10
            data-[state=active]:border-indigo-500/20 data-[state=active]:shadow-md hover:bg-white/60
            data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-900"
        >
          <div className="p-1 rounded-md bg-indigo-100/80 transition-transform duration-300 group-data-[state=active]:scale-105 group-data-[state=active]:bg-indigo-100">
            <GraduationCap className="h-3.5 w-3.5 text-indigo-600 transition-colors group-data-[state=inactive]:text-indigo-500/70" />
          </div>
          <span className="relative text-xs whitespace-nowrap">
            Education
            <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full bg-indigo-500 scale-x-0 transition-transform duration-300 group-data-[state=active]:scale-x-100"></div>
          </span>
        </TabsTrigger>

        {/* Skills Tab */}
        <TabsTrigger 
          value="skills" 
          className="group flex items-center gap-1.5 px-2 py-1 rounded-md font-medium relative transition-all duration-300
            data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500/10 data-[state=active]:to-pink-500/10
            data-[state=active]:border-rose-500/20 data-[state=active]:shadow-md hover:bg-white/60
            data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-900"
        >
          <div className="p-1 rounded-md bg-rose-100/80 transition-transform duration-300 group-data-[state=active]:scale-105 group-data-[state=active]:bg-rose-100">
            <Wrench className="h-3.5 w-3.5 text-rose-600 transition-colors group-data-[state=inactive]:text-rose-500/70" />
          </div>
          <span className="relative text-xs whitespace-nowrap">
            Skills
            <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full bg-rose-500 scale-x-0 transition-transform duration-300 group-data-[state=active]:scale-x-100"></div>
          </span>
        </TabsTrigger>

        {/* Settings Tab */}
        <TabsTrigger 
          value="settings" 
          className="group flex items-center gap-1.5 px-2 py-1 rounded-md font-medium relative transition-all duration-300
            data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-500/10 data-[state=active]:to-slate-500/10
            data-[state=active]:border-gray-500/20 data-[state=active]:shadow-md hover:bg-white/60
            data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-900"
        >
          <div className="p-1 rounded-md bg-gray-100/80 transition-transform duration-300 group-data-[state=active]:scale-105 group-data-[state=active]:bg-gray-100">
            <LayoutTemplate className="h-3.5 w-3.5 text-gray-600 transition-colors group-data-[state=inactive]:text-gray-500/70" />
          </div>
          <span className="relative text-xs whitespace-nowrap">
            Layout
            <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full bg-gray-500 scale-x-0 transition-transform duration-300 group-data-[state=active]:scale-x-100"></div>
          </span>
        </TabsTrigger>
      </TabsList>

    
    </>
  );
} 