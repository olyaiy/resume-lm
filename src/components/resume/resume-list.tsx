import { Resume } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface ResumeListProps {
  resumes: any[];
  title: string;
  emptyMessage: string | React.ReactNode;
}

export function ResumeList({ resumes, title, emptyMessage }: ResumeListProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {resumes.length === 0 ? (
          <p className="text-muted-foreground text-sm">{emptyMessage}</p>
        ) : (
          <ul className="space-y-3">
            {resumes.map((resume) => (
              <li key={resume.id}>
                <Link 
                  href={`/resumes/${resume.id}`}
                  className="block p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="font-medium">{resume.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Last updated: {new Date(resume.updated_at).toLocaleDateString()}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
} 