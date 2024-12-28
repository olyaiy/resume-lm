import type { WorkExperience } from "@/lib/types";
import type { MessageAction } from "@/components/resume/ai-assistant";

export function suggestImprovement(dispatch: (action: MessageAction) => void): void {
  const mockWorkExperience: WorkExperience = {
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
  };

  dispatch({
    type: 'ADD_MESSAGE',
    message: {
      role: 'assistant',
      content: JSON.stringify(mockWorkExperience, null, 2),
      timestamp: new Date(),
      isSuggestion: true,
      suggestionStatus: 'waiting'
    }
  });
} 