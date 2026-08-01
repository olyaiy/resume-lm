import type { Metadata } from "next";

import { JobListingsCard } from "@/components/jobs/job-listings-card";

export const metadata: Metadata = {
  title: "Job listings | ResumeLM",
  description: "Review and manage job listings while tailoring your ResumeLM applications.",
};

export default function JobsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50/50 via-sky-50/50 to-violet-50/50 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Job listings</h1>
          <p className="text-muted-foreground">Save opportunities and use them when creating tailored resumes.</p>
        </div>
        <JobListingsCard />
      </div>
    </main>
  );
}
