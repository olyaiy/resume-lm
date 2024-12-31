import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Github, Linkedin, Mail, MapPin } from "lucide-react";

export function MockResume() {
  return (
    <Card className="w-full max-w-2xl bg-white/80 backdrop-blur-sm border-white/40 shadow-xl p-8 font-sans hover:shadow-purple-500/15 transition-all duration-500 hover:-translate-y-1">
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Sarah Chen</h2>
        <p className="text-muted-foreground mb-3">Senior Software Engineer</p>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Mail className="w-4 h-4" />
            <span>sarah.chen@email.com</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>San Francisco, CA</span>
          </div>
          <div className="flex items-center gap-1">
            <Github className="w-4 h-4" />
            <span>github.com/sarahchen</span>
          </div>
          <div className="flex items-center gap-1">
            <Linkedin className="w-4 h-4" />
            <span>linkedin.com/in/sarahchen</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-purple-600 mb-2 uppercase tracking-wider">Summary</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Senior Software Engineer with 7+ years of experience specializing in full-stack development, cloud architecture, and team leadership. 
          Proven track record of delivering scalable solutions and mentoring junior developers.
        </p>
      </div>

      {/* Skills */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-purple-600 mb-2 uppercase tracking-wider">Technical Skills</h3>
        <div className="flex flex-wrap gap-2">
          {[
            "TypeScript", "React", "Node.js", "Python", "AWS", "Docker",
            "Kubernetes", "GraphQL", "PostgreSQL", "Redis", "CI/CD", "System Design"
          ].map((skill) => (
            <Badge key={skill} variant="secondary" className="bg-purple-50/80 text-purple-600 hover:bg-purple-100/80">
              {skill}
            </Badge>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-purple-600 mb-2 uppercase tracking-wider">Experience</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-start mb-1">
              <div>
                <h4 className="text-sm font-medium text-gray-800">Senior Software Engineer</h4>
                <p className="text-sm text-muted-foreground">TechCorp Inc.</p>
              </div>
              <p className="text-sm text-muted-foreground">2020 - Present</p>
            </div>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Led development of microservices architecture serving 1M+ daily users</li>
              <li>Reduced cloud infrastructure costs by 40% through optimization</li>
              <li>Mentored 5 junior developers and led technical interviews</li>
            </ul>
          </div>
          <div>
            <div className="flex justify-between items-start mb-1">
              <div>
                <h4 className="text-sm font-medium text-gray-800">Software Engineer</h4>
                <p className="text-sm text-muted-foreground">StartupX</p>
              </div>
              <p className="text-sm text-muted-foreground">2018 - 2020</p>
            </div>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Developed real-time analytics dashboard using React and GraphQL</li>
              <li>Implemented CI/CD pipeline reducing deployment time by 60%</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Education */}
      <div>
        <h3 className="text-sm font-semibold text-purple-600 mb-2 uppercase tracking-wider">Education</h3>
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-sm font-medium text-gray-800">M.S. Computer Science</h4>
            <p className="text-sm text-muted-foreground">Stanford University</p>
          </div>
          <p className="text-sm text-muted-foreground">2018</p>
        </div>
      </div>
    </Card>
  );
} 