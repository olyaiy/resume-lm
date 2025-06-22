import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  isInvalid: boolean;
}

export function JobDescriptionInput({ value, onChange, isInvalid }: JobDescriptionInputProps) {
  return (
    <div className="space-y-3">
      <Label 
        htmlFor="job-description"
        className="text-base font-medium text-pink-950"
      >
        Job Description <span className="text-red-500">*</span>
      </Label>
      <textarea
        id="job-description"
        placeholder="Paste the job description here..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full min-h-[120px] rounded-md bg-white border-2 border-gray-300 text-base",
          "focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 placeholder:text-gray-400",
          "resize-y p-4 shadow-sm",
          "hover:border-gray-400 transition-colors",
          isInvalid && "border-red-500 shake"
        )}
        required
      />
    </div>
  );
} 