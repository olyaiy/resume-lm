// OpenAI function schema for resume parsing
export const openAiProfileSchema = {
  name: "resume-schema",
  schema: {
    type: "object",
    properties: {
      response: {
        type: "string"
      },
      first_name: {
        type: "string"
      },
      last_name: {
        type: "string"
      },
      email: {
        type: "string"
      },
      phone_number: {
        type: "string"
      },
      location: {
        type: "string"
      },
      website: {
        type: "string"
      },
      linkedin_url: {
        type: "string"
      },
      github_url: {
        type: "string"
      },
      work_experience: {
        type: "array",
        items: {
          type: "object",
          properties: {
            company: {
              type: "string"
            },
            position: {
              type: "string"
            },
            date: {
              type: "string"
            },
            location: {
              type: "string"
            },
            description: {
              type: "array",
              items: {
                type: "string"
              }
            },
            technologies: {
              type: "array",
              items: {
                type: "string"
              }
            }
          },
          required: [
            "company",
            "position",
            "date",
            "location",
            "description",
            "technologies"
          ],
          additionalProperties: false
        }
      },
      education: {
        type: "array",
        items: {
          type: "object",
          properties: {
            school: {
              type: "string"
            },
            degree: {
              type: "string"
            },
            field: {
              type: "string"
            },
            date: {
              type: "string"
            },
            location: {
              type: "string"
            },
            gpa: {
              type: "string"
            },
            achievements: {
              type: "array",
              items: {
                type: "string"
              }
            }
          },
          required: [
            "school",
            "degree",
            "field",
            "date",
            "location",
            "gpa",
            "achievements"
          ],
          additionalProperties: false
        }
      },
      skills: {
        type: "array",
        items: {
          type: "object",
          properties: {
            category: {
              type: "string"
            },
            skills: {
              type: "array",
              items: {
                type: "string"
              }
            }
          },
          required: [
            "category",
            "skills"
          ],
          additionalProperties: false
        }
      },
      projects: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: {
              type: "string"
            },
            description: {
                type: "array",
                items: {
                  type: "string"
                }
            },
            date: {
              type: "string"
            },
            url: {
              type: "string"
            },
            technologies: {
              type: "array",
              items: {
                type: "string"
              }
            }
          },
          required: [
            "name",
            "description",
            "date",
            "url",
            "technologies"
          ],
          additionalProperties: false
        }
      },
      certifications: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: {
              type: "string"
            },
            issuer: {
              type: "string"
            },
            date: {
              type: "string"
            },
            expiry_date: {
              type: "string"
            },
            credential_id: {
              type: "string"
            }
          },
          required: [
            "name",
            "issuer",
            "date",
            "expiry_date",
            "credential_id"
          ],
          additionalProperties: false
        }
      }
    },
    required: [
      "response",
      "first_name",
      "last_name",
      "email",
      "phone_number",
      "location",
      "website",
      "linkedin_url",
      "github_url",
      "work_experience",
      "education",
      "skills",
      "projects",
      "certifications"
    ],
    additionalProperties: false
  },
  strict: true
} as const;


export const openAiResumeSchema = {
  name: "resume",
  schema: {
    type: "object",
    properties: {
      id: { type: "string" },
      user_id: { type: "string" },
      job_id: { type: ["string", "null"] },
      is_base_resume: { type: "boolean" },
      resume_title: { type: "string" },
      target_role: { type: "string" },
      name: { type: "string" },
      first_name: { type: ["string", "null"] },
      last_name: { type: ["string", "null"] },
      email: { type: ["string", "null"] },
      phone_number: { type: ["string", "null"] },
      location: { type: ["string", "null"] },
      website: { type: ["string", "null"] },
      linkedin_url: { type: ["string", "null"] },
      github_url: { type: ["string", "null"] },
      professional_summary: { type: ["string", "null"] },
      work_experience: {
        type: "array",
        items: {
          type: "object",
          properties: {
            company: { type: "string" },
            position: { type: "string" },
            date: { type: "string" },
            location: { type: "string" },
            description: {
              type: "array",
              items: { type: "string" }
            },
            technologies: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: [
            "company",
            "position",
            "date",
            "location",
            "description",
            "technologies"
          ],
          additionalProperties: false
        }
      },
      education: {
        type: "array",
        items: {
          type: "object",
          properties: {
            school: { type: "string" },
            degree: { type: "string" },
            field: { type: "string" },
            date: { type: "string" },
            location: { type: "string" },
            gpa: { type: ["number", "null"] },
            achievements: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: [
            "school",
            "degree",
            "field",
            "date",
            "location",
            "gpa",
            "achievements"
          ],
          additionalProperties: false
        }
      },
      projects: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: {
              type: "array",
              items: { type: "string" }
            },
            date: { type: "string" },
            url: { type: ["string", "null"] },
            github_url: { type: ["string", "null"] },
            technologies: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: [
            "name",
            "description",
            "date",
            "github_url",
            "url",
            "technologies"
          ],
          additionalProperties: false
        }
      },
      skills: {
        type: "array",
        items: {
          type: "object",
          properties: {
            category: { type: "string" },
            items: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["category", "items"],
          additionalProperties: false
        }
      },
      certifications: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            issuer: { type: "string" },
            date: { type: "string" },
            expiry_date: { type: ["string", "null"] },
            credential_id: { type: ["string", "null"] },
            url: { type: ["string", "null"] }
          },
          required: [
            "name",
            "issuer",
            "date",
            "expiry_date",
            "credential_id",
            "url"
          ],
          additionalProperties: false
        }
      },
      section_order: {
        type: "array",
        items: { type: "string" }
      },
      section_configs: {
        type: "object",
        properties: {
          work_experience: {
            type: "object",
            properties: {
              visible: { type: "boolean" },
              max_items: { type: ["number", "null"] },
              style: {
                type: ["string", "null"],
                enum: ["grouped", "list", "grid", null]
              }
            },
            required: ["visible", "max_items", "style"],
            additionalProperties: false
          },
          education: {
            type: "object",
            properties: {
              visible: { type: "boolean" },
              max_items: { type: ["number", "null"] },
              style: {
                type: ["string", "null"],
                enum: ["grouped", "list", "grid", null]
              }
            },
            required: ["visible", "max_items", "style"],
            additionalProperties: false
          },
          skills: {
            type: "object",
            properties: {
              visible: { type: "boolean" },
              max_items: { type: ["number", "null"] },
              style: {
                type: ["string", "null"],
                enum: ["grouped", "list", "grid", null]
              }
            },
            required: ["visible", "max_items", "style"],
            additionalProperties: false
          },
          projects: {
            type: "object",
            properties: {
              visible: { type: "boolean" },
              max_items: { type: ["number", "null"] },
              style: {
                type: ["string", "null"],
                enum: ["grouped", "list", "grid", null]
              }
            },
            required: ["visible", "max_items", "style"],
            additionalProperties: false
          },
          certifications: {
            type: "object",
            properties: {
              visible: { type: "boolean" },
              max_items: { type: ["number", "null"] },
              style: {
                type: ["string", "null"],
                enum: ["grouped", "list", "grid", null]
              }
            },
            required: ["visible", "max_items", "style"],
            additionalProperties: false
          }
        },
        required: ["work_experience", "education", "skills", "projects", "certifications"],
        additionalProperties: false
      },
      created_at: { type: "string" },
      updated_at: { type: "string" }
    },
    required: [
      "id",
      "user_id",
      "job_id",
      "is_base_resume",
      "resume_title",
      "target_role",
      "name",
      "first_name",
      "last_name",
      "email",
      "phone_number",
      "location",
      "website",
      "linkedin_url",
      "github_url",
      "professional_summary",
      "work_experience",
      "education",
      "skills",
      "projects",
      "certifications",
      "section_order",
      "section_configs",
      "created_at",
      "updated_at"
    ],
    additionalProperties: false
  },
  strict: true
} as const;

export const openAiWorkExperienceSchema = {
  "name": "work-experience-schema",
  "schema": {
    "type": "object",
    "properties": {
      "points": {
        "type": "array",
        "description": "A collection of bullet points describing work achievements or responsibilities.",
        "items": {
          "type": "string",
          "description": "A bullet point describing a work achievement or responsibility."
        }
      },
      "analysis": {
        "type": "object",
        "description": "An analysis of the work experience achievements.",
        "properties": {
          "impact_score": {
            "type": "number",
            "description": "Score indicating the overall impact of these achievements (1-10)."
          },
          "improvement_suggestions": {
            "type": "array",
            "description": "Suggestions for improvement based on the analysis.",
            "items": {
              "type": "string",
              "description": "A suggestion for improvement."
            }
          }
        },
        "required": [
          "impact_score",
          "improvement_suggestions"
        ],
        "additionalProperties": false
      }
    },
    "required": [
      "points",
      "analysis"
    ],
    "additionalProperties": false
  },
  "strict": true
} as const;

export const openAiProjectSchema = {
  "name": "project-schema",
  "schema": {
    "type": "object",
    "properties": {
      "points": {
        "type": "array",
        "description": "A collection of bullet points describing project achievements or features.",
        "items": {
          "type": "string",
          "description": "A bullet point describing a project achievement or feature."
        }
      },
      "analysis": {
        "type": "object",
        "description": "An analysis of the project achievements.",
        "properties": {
          "impact_score": {
            "type": "number",
            "description": "Score indicating the overall impact of these achievements (1-10)."
          },
          "improvement_suggestions": {
            "type": "array",
            "description": "Suggestions for improvement based on the analysis.",
            "items": {
              "type": "string",
              "description": "A suggestion for improvement."
            }
          }
        },
        "required": [
          "impact_score",
          "improvement_suggestions"
        ],
        "additionalProperties": false
      }
    },
    "required": [
      "points",
      "analysis"
    ],
    "additionalProperties": false
  },
  "strict": true
} as const;



