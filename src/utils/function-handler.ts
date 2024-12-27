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
    description: "Modify a specific section of the resume (add, update, or delete entries)",
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
          description: "The data to add or update (required for add and update actions)"
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

  constructor(resume: Resume) {
    this.resume = resume;
  }

  /**
   * Executes a function based on the provided name and arguments
   * @param name - Name of the function to execute
   * @param args - Arguments for the function
   * @returns Result of the function execution
   */
  async executeFunction(name: AvailableFunctions, args: any): Promise<string> {
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
        // Update basic info fields
        Object.assign(this.resume, data);
        break;

      case "work_experience":
      case "education":
      case "skills":
      case "projects":
      case "certifications":
        const sectionArray = this.resume[section];
        
        switch (action) {
          case "add":
            sectionArray.push(data);
            break;
          case "update":
            if (index === undefined || !sectionArray[index]) {
              throw new Error(`Invalid index for ${section} update`);
            }
            sectionArray[index] = { ...sectionArray[index], ...data };
            break;
          case "delete":
            if (index === undefined || !sectionArray[index]) {
              throw new Error(`Invalid index for ${section} deletion`);
            }
            sectionArray.splice(index, 1);
            break;
        }
        break;

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