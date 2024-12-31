import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Github, Linkedin, Mail, MapPin } from "lucide-react";

export function MockResume() {
  return (
    <Card className="w-full max-w-[6in] aspect-[8.5/11] bg-white relative p-6 font-sans 
      before:absolute before:inset-0 before:bg-[radial-gradient(#00000005_1px,transparent_1px)] before:bg-[size:16px_16px] before:opacity-70
      [box-shadow:0_2px_8px_rgba(0,0,0,0.1),0_0_1px_rgba(0,0,0,0.1)]
      rounded-none border-[0.5px] border-gray-200/50">
      {/* Header - Centered */}
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Sarah Chen</h2>
        <p className="text-gray-600 text-sm mb-2">Senior Software Engineer</p>
        <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] text-gray-600">
          <div className="flex items-center gap-1">
            <Mail className="w-2.5 h-2.5" />
            <span>sarah.chen@email.com</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-2.5 h-2.5" />
            <span>San Francisco, CA</span>
          </div>
          <div className="flex items-center gap-1">
            <Github className="w-2.5 h-2.5" />
            <span>github.com/sarahchen</span>
          </div>
          <div className="flex items-center gap-1">
            <Linkedin className="w-2.5 h-2.5" />
            <span>linkedin.com/in/sarahchen</span>
          </div>
        </div>
      </div>

      {/* Technical Skills */}
      <div className="mb-4">
        <h3 className="text-[10px] font-bold text-gray-900 mb-1.5 uppercase tracking-wider border-b border-gray-200 pb-1">Technical Skills</h3>
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-[10px] py-0">Languages: TypeScript, Python, JavaScript, SQL</Badge>
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-[10px] py-0">Frontend: React, Next.js, Redux, HTML5, CSS3</Badge>
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-[10px] py-0">Backend: Node.js, Express, GraphQL, REST</Badge>
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-[10px] py-0">Cloud: AWS, Docker, Kubernetes</Badge>
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-[10px] py-0">Databases: PostgreSQL, MongoDB, Redis</Badge>
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-[10px] py-0">Tools: Git, CI/CD, Jest, Cypress</Badge>
        </div>
      </div>

      {/* Experience */}
      <div className="mb-4">
        <h3 className="text-[10px] font-bold text-gray-900 mb-1.5 uppercase tracking-wider border-b border-gray-200 pb-1">Professional Experience</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-baseline mb-0.5">
              <h4 className="text-[11px] font-semibold text-gray-800">Senior Software Engineer</h4>
              <p className="text-[10px] text-gray-600">Jan 2020 - Present</p>
            </div>
            <p className="text-[10px] font-medium text-gray-700 mb-0.5">TechCorp Inc., San Francisco, CA</p>
            <ul className="text-[10px] text-gray-600 list-disc list-outside ml-3 space-y-0.5">
              <li>Led development of microservices platform serving 1M+ daily users, achieving 99.99% uptime</li>
              <li>Architected and implemented cloud-native solutions reducing AWS costs by 40% while improving scalability</li>
              <li>Mentored 5 junior developers and led technical design reviews for critical features</li>
            </ul>
          </div>
          <div>
            <div className="flex justify-between items-baseline mb-0.5">
              <h4 className="text-[11px] font-semibold text-gray-800">Software Engineer</h4>
              <p className="text-[10px] text-gray-600">Mar 2018 - Dec 2020</p>
            </div>
            <p className="text-[10px] font-medium text-gray-700 mb-0.5">StartupX, San Francisco, CA</p>
            <ul className="text-[10px] text-gray-600 list-disc list-outside ml-3 space-y-0.5">
              <li>Built real-time analytics dashboard processing 500K+ daily events using React and Node.js</li>
              <li>Optimized CI/CD pipeline reducing deployment time from 45 to 12 minutes</li>
              <li>Developed key product features increasing user engagement by 25%</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Projects */}
      <div className="mb-4">
        <h3 className="text-[10px] font-bold text-gray-900 mb-1.5 uppercase tracking-wider border-b border-gray-200 pb-1">Projects</h3>
        <div className="space-y-2">
          <div>
            <div className="flex justify-between items-baseline">
              <h4 className="text-[11px] font-semibold text-gray-800">Open Source Analytics Dashboard</h4>
              <p className="text-[10px] text-gray-600">github.com/sarahchen/analytics</p>
            </div>
            <ul className="text-[10px] text-gray-600 list-disc list-outside ml-3 space-y-0.5">
              <li>Built real-time dashboard with React, TypeScript, and WebSocket for live data streaming</li>
              <li>1000+ GitHub stars, 50+ contributors, used by 100+ companies</li>
            </ul>
          </div>
          <div>
            <div className="flex justify-between items-baseline">
              <h4 className="text-[11px] font-semibold text-gray-800">Distributed Cache Library</h4>
              <p className="text-[10px] text-gray-600">github.com/sarahchen/dcache</p>
            </div>
            <ul className="text-[10px] text-gray-600 list-disc list-outside ml-3 space-y-0.5">
              <li>Developed high-performance distributed caching solution using Redis and Node.js</li>
              <li>Achieved 99.9% cache hit rate and sub-millisecond response times</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Education */}
      <div>
        <h3 className="text-[10px] font-bold text-gray-900 mb-1.5 uppercase tracking-wider border-b border-gray-200 pb-1">Education</h3>
        <div>
          <div className="flex justify-between items-baseline mb-0.5">
            <h4 className="text-[11px] font-semibold text-gray-800">M.S. Computer Science</h4>
            <p className="text-[10px] text-gray-600">2018</p>
          </div>
          <p className="text-[10px] text-gray-600">Stanford University, Stanford, CA</p>
          <p className="text-[10px] text-gray-600 mt-0.5">Focus: Distributed Systems and Machine Learning</p>
        </div>
      </div>
    </Card>
  );
} 