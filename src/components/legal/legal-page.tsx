import type { ReactNode } from "react";

interface LegalPageProps {
  title: string;
  updated: string;
  children: ReactNode;
}

export function LegalPage({ title, updated, children }: LegalPageProps) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16">
      <article className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm md:p-12">
        <p className="text-sm text-muted-foreground">Last updated {updated}</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900">{title}</h1>
        <div className="prose prose-slate mt-8 max-w-none">{children}</div>
      </article>
    </main>
  );
}
