import { Resume } from "@/lib/types";

/**
 * Interface defining the parameters for each function
 */
interface FunctionParameters {
  read_resume: {
    section: "all" | "basic_info" | "work_experience" | "education" | "skills" | "projects" | "certifications";
  };
  update_name: {
    first_name: string;
    last_name: string;
  };
  modify_resume: {
    section: "basic_info" | "work_experience" | "education" | "skills" | "projects" | "certifications";
    action: "add" | "update" | "delete";
    index?: number;
    data: any;
  };
}

export interface FunctionArgs {
  section?: string;
  action?: string;
}

/**
 * Type for available function names
 */
type AvailableFunctions = keyof FunctionParameters;

/**
 * Schema definitions for OpenAI function calling
 */
export const functionSchemas = {
  read_resume: {
    name: "read_resume",
    description: "Read the current resume content to understand and analyze it",
    parameters: {
      type: "object",
      properties: {
        section: {
          type: "string",
          enum: ["all", "basic_info", "work_experience", "education", "skills", "projects", "certifications"],
          description: "The section of the resume to read"
        }
      },
      required: ["section"]
    }
  },
  update_name: {
    name: "update_name",
    description: "Update the first and last name in the resume",
    parameters: {
      type: "object",
      properties: {
        first_name: {
          type: "string",
          description: "The new first name"
        },
        last_name: {
          type: "string",
          description: "The new last name"
        }
      },
      required: ["first_name", "last_name"]
    }
  },
  modify_resume: {
    name: "modify_resume",
    description: "Modify a specific section of the resume (add, update, or delete entries). For update/delete actions, index is required. For add/update actions, data is required with the appropriate fields for the section.",
    parameters: {
      type: "object",
      properties: {
        section: {
          type: "string",
          enum: ["basic_info", "work_experience", "education", "skills", "projects", "certifications"],
          description: "The section of the resume to modify"
        },
        action: {
          type: "string",
          enum: ["add", "update", "delete"],
          description: "The type of modification to perform"
        },
        index: {
          type: "number",
          description: "The index of the item to update or delete (required for update and delete actions)"
        },
        data: {
          type: "object",
          description: "The data to add or update (required for add and update actions). Include only the relevant fields for the chosen section.",
          properties: {
            // Work Experience fields
            company: { type: "string", description: "Company name (for work_experience)" },
            position: { type: "string", description: "Job position (for work_experience)" },
            location: { type: "string", description: "Job location (for work_experience)" },
            date: { type: "string", description: "Employment date or date range" },
            description: { type: "array", items: { type: "string" }, description: "Bullet points describing the experience" },
            technologies: { type: "array", items: { type: "string" }, description: "Technologies used" },
            
            // Education fields
            school: { type: "string", description: "School name (for education)" },
            degree: { type: "string", description: "Degree type (for education)" },
            field: { type: "string", description: "Field of study (for education)" },
            gpa: { type: "string", description: "GPA (for education)" },
            achievements: { type: "array", items: { type: "string" }, description: "Academic achievements" },
            
            // Skills fields
            category: { type: "string", description: "Skill category (for skills)" },
            items: { type: "array", items: { type: "string" }, description: "List of skills in this category" },
            
            // Projects fields
            name: { type: "string", description: "Project name (for projects)" },
            url: { type: "string", description: "Project URL" },
            project_github_url: { type: "string", description: "Project GitHub URL" },
            
            // Certifications fields
            issuer: { type: "string", description: "Certificate issuer (for certifications)" },
            date_acquired: { type: "string", description: "Date certificate was acquired" },
            expiry_date: { type: "string", description: "Certificate expiration date" },
            credential_id: { type: "string", description: "Certificate credential ID" },
            
            // Basic Info fields
            first_name: { type: "string", description: "First name (for basic_info)" },
            last_name: { type: "string", description: "Last name (for basic_info)" },
            email: { type: "string", description: "Email address (for basic_info)" },
            phone_number: { type: "string", description: "Phone number" },
            website: { type: "string", description: "Personal website URL" },
            linkedin_url: { type: "string", description: "LinkedIn profile URL" },
            github_url: { type: "string", description: "GitHub profile URL" },
            professional_summary: { type: "string", description: "Professional summary or objective" }
          }
        }
      },
      required: ["section", "action"]
    }
  }
} as const;

/**
 * Class responsible for handling AI function calls
 * Provides a clean interface for executing functions and managing resume operations
 */
export class FunctionHandler {
  private resume: Resume;
  private onUpdateResume: (field: keyof Resume, value: any) => void;

  constructor(
    resume: Resume,
    onUpdateResume: (field: keyof Resume, value: any) => void
  ) {
    this.resume = resume;
    this.onUpdateResume = onUpdateResume;
  }

  /**
   * Handles function calls from AI, including validation and execution
   * @param functionName - Name of the function from AI
   * @param functionArgs - JSON string of arguments from AI
   * @returns Result of the function execution
   */
  async handleFunctionCall(functionName: string, functionArgs: string): Promise<string> {
    // Validate function name
    const validFunctions = ['read_resume', 'update_name', 'modify_resume'] as const;
    if (!validFunctions.includes(functionName as any)) {
      throw new Error(`Invalid function name: ${functionName}`);
    }

    // Parse and execute
    const args = JSON.parse(functionArgs);
    return this.executeFunction(functionName as typeof validFunctions[number], args);
  }

  /**
   * Internal method to execute functions
   */
  private async executeFunction(name: AvailableFunctions, args: any): Promise<string> {
    switch (name) {
      case "read_resume":
        return this.readResume(args.section);
      case "update_name":
        return this.updateName(args.first_name, args.last_name);
      case "modify_resume":
        return this.modifyResume(args.section, args.action, args.index, args.data);
      default:
        throw new Error(`Unknown function: ${name}`);
    }
  }

  /**
   * Reads specified section of the resume
   * @param section - Section of the resume to read
   * @returns JSON string of the requested section
   */
  private readResume(section: FunctionParameters["read_resume"]["section"]): string {
    switch (section) {
      case "all":
        return JSON.stringify(this.resume);
      case "basic_info":
        return JSON.stringify({
          first_name: this.resume.first_name,
          last_name: this.resume.last_name,
          email: this.resume.email,
          phone_number: this.resume.phone_number,
          location: this.resume.location,
          website: this.resume.website,
          linkedin_url: this.resume.linkedin_url,
          github_url: this.resume.github_url,
          professional_summary: this.resume.professional_summary
        });
      case "work_experience":
        return JSON.stringify(this.resume.work_experience);
      case "education":
        return JSON.stringify(this.resume.education);
      case "skills":
        return JSON.stringify(this.resume.skills);
      case "projects":
        return JSON.stringify(this.resume.projects);
      case "certifications":
        return JSON.stringify(this.resume.certifications);
      default:
        throw new Error("Invalid section specified");
    }
  }

  /**
   * Updates the first and last name in the resume
   * @param first_name - New first name
   * @param last_name - New last name
   * @returns JSON string confirming the update
   */
  private updateName(first_name: string, last_name: string): string {
    this.resume.first_name = first_name;
    this.resume.last_name = last_name;
    this.onUpdateResume('first_name', first_name);
    this.onUpdateResume('last_name', last_name);
    return JSON.stringify({
      success: true,
      message: "Name updated successfully",
      updated_values: {
        first_name,
        last_name
      }
    });
  }

  /**
   * Modifies a specific section of the resume
   * @param section - Section to modify
   * @param action - Type of modification (add/update/delete)
   * @param index - Index for update/delete operations
   * @param data - New data to add or update
   * @returns JSON string confirming the modification
   */
  private modifyResume(
    section: FunctionParameters["modify_resume"]["section"],
    action: FunctionParameters["modify_resume"]["action"],
    index?: number,
    data?: any
  ): string {
    switch (section) {
      case "basic_info":
        Object.entries(data).forEach(([key, value]) => {
          const typedKey = key as keyof Resume;
          if (typedKey in this.resume && typeof value === typeof this.resume[typedKey]) {
            (this.resume[typedKey] as any) = value;
            this.onUpdateResume(typedKey, value);
          }
        });
        break;

      case "work_experience":
      case "education":
      case "skills":
      case "projects":
      case "certifications": {
        const sectionArray = this.resume[section];
        
        switch (action) {
          case "add":
            sectionArray.push(data);
            this.onUpdateResume(section, sectionArray);
            break;
          case "update":
            if (index === undefined || !sectionArray[index]) {
              throw new Error(`Invalid index for ${section} update`);
            }
            sectionArray[index] = { ...sectionArray[index], ...data };
            this.onUpdateResume(section, sectionArray);
            break;
          case "delete":
            if (index === undefined || !sectionArray[index]) {
              throw new Error(`Invalid index for ${section} deletion`);
            }
            sectionArray.splice(index, 1);
            this.onUpdateResume(section, sectionArray);
            break;
        }
        break;
      }

      default:
        throw new Error("Invalid section specified");
    }

    return JSON.stringify({
      success: true,
      message: `Successfully ${action}ed ${section}`,
      section,
      action,
      index
    });
  }
} 