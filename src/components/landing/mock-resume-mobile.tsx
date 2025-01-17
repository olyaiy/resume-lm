import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Github, Linkedin, Mail, MapPin } from "lucide-react";

export function MockResumeMobile() {
  return (
    <Card className="w-full max-w-[6in] aspect-[8.5/11] bg-white relative p-4 font-sans 
      before:absolute before:inset-0 before:bg-[radial-gradient(#00000005_1px,transparent_1px)] before:bg-[size:12px_12px] before:opacity-70
      [box-shadow:0_2px_8px_rgba(0,0,0,0.1),0_0_1px_rgba(0,0,0,0.1)]
      rounded-none border-[0.5px] border-gray-200/50">
      {/* Header - Centered */}
      <div className="mb-4 text-center">
        <h2 className="text-base font-bold text-gray-900 mb-0.5">David Zhang</h2>
        <p className="text-gray-600 text-xs mb-1.5">Full Stack Developer</p>
        <div className="flex flex-wrap items-center justify-center gap-2 text-[8px] text-gray-600">
          <div className="flex items-center gap-0.5">
            <Mail className="w-2 h-2" />
            <span>david.zhang@gmail.com</span>
          </div>
          <div className="flex items-center gap-0.5">
            <MapPin className="w-2 h-2" />
            <span>Vancouver, BC</span>
          </div>
          <div className="flex items-center gap-0.5">
            <Github className="w-2 h-2" />
            <span>github.com/davidzhang-dev</span>
          </div>
          <div className="flex items-center gap-0.5">
            <Linkedin className="w-2 h-2" />
            <span>linkedin.com/in/davidzhang-dev</span>
          </div>
        </div>
      </div>

      {/* Technical Skills */}
      <div className="mb-3">
        <h3 className="text-[8px] font-bold text-gray-900 mb-1 uppercase tracking-wider border-b border-gray-200 pb-0.5">Technical Skills</h3>
        <div className="flex flex-wrap gap-0.5">
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-[8px] py-0 px-1">Languages: TypeScript, Python, JavaScript</Badge>
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-[8px] py-0 px-1">Frontend: React, Next.js, TailwindCSS</Badge>
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-[8px] py-0 px-1">Backend: Node.js, Express</Badge>
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-[8px] py-0 px-1">Cloud: AWS, Vercel</Badge>
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-[8px] py-0 px-1">AI/ML: TensorFlow, LangChain</Badge>
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-[8px] py-0 px-1">DB: PostgreSQL</Badge>
        </div>
      </div>

      {/* Experience */}
      <div className="mb-3">
        <h3 className="text-[8px] font-bold text-gray-900 mb-1 uppercase tracking-wider border-b border-gray-200 pb-0.5">Professional Experience</h3>
        <div className="space-y-2">
          <div>
            <div className="flex justify-between items-baseline mb-0.5">
              <h4 className="text-[9px] font-semibold text-gray-800">Full Stack Developer</h4>
              <p className="text-[8px] text-gray-600">May 2021 - Present</p>
            </div>
            <p className="text-[8px] font-medium text-gray-700 mb-0.5">Clio, Vancouver, BC</p>
            <ul className="text-[8px] text-gray-600 list-disc list-outside ml-2.5 space-y-0.5">
              <li>Developed key features for legal platform using React and TypeScript</li>
              <li>Implemented AI document analysis reducing review time by 60%</li>
              <li>Optimized API performance for 30% faster load times</li>
            </ul>
          </div>
          <div>
            <div className="flex justify-between items-baseline mb-0.5">
              <h4 className="text-[9px] font-semibold text-gray-800">Junior Developer</h4>
              <p className="text-[8px] text-gray-600">Jun 2019 - Apr 2021</p>
            </div>
            <p className="text-[8px] font-medium text-gray-700 mb-0.5">Hootsuite, Vancouver, BC</p>
            <ul className="text-[8px] text-gray-600 list-disc list-outside ml-2.5 space-y-0.5">
              <li>Built responsive dashboard components using React and Redux</li>
              <li>Collaborated on analytics features serving 100K+ users</li>
              <li>Participated in agile development and code reviews</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Projects */}
      <div className="mb-3">
        <h3 className="text-[8px] font-bold text-gray-900 mb-1 uppercase tracking-wider border-b border-gray-200 pb-0.5">Projects</h3>
        <div className="space-y-1.5">
          <div>
            <div className="flex justify-between items-baseline">
              <h4 className="text-[9px] font-semibold text-gray-800">AI Meeting Assistant</h4>
              <p className="text-[8px] text-gray-600">github.com/davidzhang-dev/meeting-ai</p>
            </div>
            <ul className="text-[8px] text-gray-600 list-disc list-outside ml-2.5 space-y-0.5">
              <li>Built meeting summarization tool using OpenAI API and Next.js</li>
              <li>Implemented real-time transcription and key points extraction</li>
            </ul>
          </div>
          <div>
            <div className="flex justify-between items-baseline">
              <h4 className="text-[9px] font-semibold text-gray-800">Housing Market Analyzer</h4>
              <p className="text-[8px] text-gray-600">github.com/davidzhang-dev/van-housing</p>
            </div>
            <ul className="text-[8px] text-gray-600 list-disc list-outside ml-2.5 space-y-0.5">
              <li>Created web scraper and analysis tool for real estate listings</li>
              <li>Built interactive dashboard using Next.js and Chart.js</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Education */}
      <div>
        <h3 className="text-[8px] font-bold text-gray-900 mb-1 uppercase tracking-wider border-b border-gray-200 pb-0.5">Education</h3>
        <div>
          <div className="flex justify-between items-baseline mb-0.5">
            <h4 className="text-[9px] font-semibold text-gray-800">B.Sc. Computer Science</h4>
            <p className="text-[8px] text-gray-600">2019</p>
          </div>
          <p className="text-[8px] text-gray-600">University of British Columbia, Vancouver, BC</p>
          <p className="text-[8px] text-gray-600 mt-0.5">Focus: Software Engineering and Machine Learning</p>
        </div>
      </div>
    </Card>
  );
} 