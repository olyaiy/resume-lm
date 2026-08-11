import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { Resume } from "@/lib/types";
import { resumeReducer } from "./resume-editor-context";

const resume = {
  id: "resume-1",
  user_id: "user-1",
  name: "Test resume",
  target_role: "Engineer",
  is_base_resume: true,
  first_name: "Alex",
  last_name: "Example",
  email: "alex@example.com",
  work_experience: [],
  education: [],
  skills: [],
  projects: [],
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
  has_cover_letter: false,
} satisfies Resume;

describe("resume editor dirty state", () => {
  it("marks field updates dirty without serializing the whole resume", () => {
    const state = {
      resume,
      isSaving: false,
      isDeleting: false,
      hasUnsavedChanges: false,
    };

    const updated = resumeReducer(state, {
      type: "UPDATE_FIELD",
      field: "name",
      value: "Updated resume",
    });

    assert.equal(updated.resume.name, "Updated resume");
    assert.equal(updated.hasUnsavedChanges, true);
  });

  it("clears dirty state after a successful save", () => {
    const state = {
      resume,
      isSaving: false,
      isDeleting: false,
      hasUnsavedChanges: true,
    };

    const saved = resumeReducer(state, { type: "MARK_SAVED" });
    assert.equal(saved.hasUnsavedChanges, false);
  });
});
