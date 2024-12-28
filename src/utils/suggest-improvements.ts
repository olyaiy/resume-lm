import { MessageAction } from "@/components/resume/ai-assistant";
import { Skill, Education } from "@/lib/types";

type SuggestionType = 'work_experience' | 'project' | 'skill' | 'education';

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

  // Mock Skill
  const mockSkill: { type: 'skill', data: Skill } = {
    type: 'skill',
    data: {
      category: "Cloud Technologies",
      items: ["AWS", "Azure", "Google Cloud Platform", "Docker", "Kubernetes", "Terraform", "CI/CD"]
    }
  };

  // Mock Education
  const mockEducation: { type: 'education', data: Education } = {
    type: 'education',
    data: {
      school: "Stanford University",
      degree: "Master of Science",
      field: "Computer Science",
      location: "Stanford, CA",
      date: "2018 - 2020",
      gpa: "3.92",
      achievements: [
        "Published research paper on AI-driven software optimization",
        "Teaching Assistant for Advanced Algorithms course",
        "President of Computer Science Student Association"
      ]
    }
  };

  // Determine which mock data to use
  const mockData = {
    work_experience: mockWorkExperience,
    project: mockProject,
    skill: mockSkill,
    education: mockEducation
  }[type];

  // Dispatch suggestion based on type
  dispatch({
    type: 'ADD_MESSAGE',
    message: {
      role: 'assistant',
      content: JSON.stringify(mockData, null, 2),
      timestamp: new Date(),
      isSuggestion: true,
      suggestionStatus: 'waiting'
    }
  });
} 