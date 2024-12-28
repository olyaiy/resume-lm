import { WorkExperience, Project } from "@/lib/types";
import { MessageAction } from "@/components/resume/ai-assistant";

type SuggestionType = 'work_experience' | 'project';

export function suggestImprovement(dispatch: (action: MessageAction) => void, type: SuggestionType = 'work_experience'): void {
  // Mock Work Experience
  const mockWorkExperience = {
    type: 'work_experience',
    data: {
      company: "Tech Solutions Inc.",
      position: "Senior Software Engineer",
      location: "San Francisco, CA",
      date: "2020 - Present",
      description: [
        "Led development of cloud-native microservices architecture using React and Node.js",
        "Improved system performance by 40% through implementation of caching strategies",
        "Mentored junior developers and conducted code reviews for team of 8 engineers"
      ],
      technologies: ["React", "Node.js", "TypeScript", "AWS", "Docker"]
    }
  };

  // Mock Project
  const mockProject = {
    type: 'project',
    data: {
      name: "AI-Powered Resume Builder",
      description: [
        "Developed a full-stack web application using Next.js 15 and TypeScript",
        "Implemented AI-driven content suggestions using OpenAI's GPT-4",
        "Built responsive UI components with Tailwind CSS and Shadcn UI"
      ],
      date: "2024",
      technologies: ["Next.js", "TypeScript", "OpenAI", "Tailwind CSS", "Shadcn UI"],
      url: "https://resume-ai.example.com",
      github_url: "https://github.com/username/resume-ai"
    }
  };

  // Dispatch suggestion based on type
  dispatch({
    type: 'ADD_MESSAGE',
    message: {
      role: 'assistant',
      content: type === 'work_experience' 
        ? JSON.stringify(mockWorkExperience, null, 2)
        : JSON.stringify(mockProject, null, 2),
      timestamp: new Date(),
      isSuggestion: true,
      suggestionStatus: 'waiting'
    }
  });
} 