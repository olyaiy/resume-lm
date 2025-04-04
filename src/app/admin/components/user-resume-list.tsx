'use client';

import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

// Define the structure of the resume data expected by this component
interface ResumeInfo {
  id: string;
  name: string;
  created_at: string;
  is_base_resume: boolean | null;
}

// Define the props for the component
interface UserResumeListProps {
  resumes: ResumeInfo[];
}

// Helper function to format dates concisely for the table
function formatTableDate(dateString?: string | null): string {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Invalid Date';
  }
}

export default function UserResumeList({ resumes }: UserResumeListProps) {
  if (!resumes || resumes.length === 0) {
    return <p className="text-sm text-muted-foreground italic">This user has no resumes.</p>;
  }

  return (
    <Table>
      <TableCaption>A list of the user&apos;s resumes.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {resumes.map((resume) => (
          <TableRow key={resume.id}>
            <TableCell className="font-medium">
              <Link href={`/resumes/${resume.id}`} className="hover:underline text-primary" target="_blank" rel="noopener noreferrer">
                {resume.name || 'Untitled Resume'}
              </Link>
            </TableCell>
             <TableCell>
              {resume.is_base_resume ? (
                <Badge variant="secondary">Base</Badge>
              ) : (
                 <Badge variant="outline">Tailored</Badge>
              )}
            </TableCell>
            <TableCell className="text-right">{formatTableDate(resume.created_at)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}