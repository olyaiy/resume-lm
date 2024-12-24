'use client';

import { Certification } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ExternalLink } from "lucide-react";

interface CertificationsFormProps {
  certifications: Certification[];
  onChange: (certifications: Certification[]) => void;
}

export function CertificationsForm({ certifications, onChange }: CertificationsFormProps) {
  const addCertification = () => {
    onChange([...certifications, {
      name: "",
      issuer: "",
      date_acquired: "",
      expiry_date: "",
      credential_id: "",
      url: ""
    }]);
  };

  const updateCertification = (index: number, field: keyof Certification, value: any) => {
    const updated = [...certifications];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeCertification = (index: number) => {
    onChange(certifications.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {certifications.map((cert, index) => (
        <Card key={index} className="relative group bg-gradient-to-r from-amber-500/5 via-amber-500/10 to-yellow-500/5 backdrop-blur-md border-2 border-amber-500/30 hover:border-amber-500/40 hover:shadow-lg transition-all duration-300 shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Certificate Name and Delete Button Row */}
              <div className="flex items-center justify-between gap-4">
                <div className="relative group flex-1">
                  <Input
                    value={cert.name}
                    onChange={(e) => updateCertification(index, 'name', e.target.value)}
                    className="text-lg font-semibold bg-white/50 border-gray-200 rounded-lg
                      focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/20
                      hover:border-amber-500/30 hover:bg-white/60 transition-colors
                      placeholder:text-gray-400"
                    placeholder="Certification Name"
                  />
                  <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[10px] font-medium text-amber-700">
                    CERTIFICATION
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => removeCertification(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors duration-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Issuing Organization */}
              <div className="relative group">
                <Input
                  value={cert.issuer}
                  onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                  className="bg-white/50 border-gray-200 rounded-lg
                    focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/20
                    hover:border-amber-500/30 hover:bg-white/60 transition-colors
                    placeholder:text-gray-400"
                  placeholder="e.g., Microsoft, AWS, Google"
                />
                <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[10px] font-medium text-amber-700">
                  ISSUING ORGANIZATION
                </div>
              </div>

              {/* Dates Row */}
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="relative group flex-1">
                  <Input
                    type="date"
                    value={cert.date_acquired}
                    onChange={(e) => updateCertification(index, 'date_acquired', e.target.value)}
                    className="bg-white/50 border-gray-200 rounded-lg
                      focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/20
                      hover:border-amber-500/30 hover:bg-white/60 transition-colors"
                  />
                  <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[10px] font-medium text-amber-700">
                    DATE ACQUIRED
                  </div>
                </div>
                <div className="relative group flex-1">
                  <Input
                    type="date"
                    value={cert.expiry_date || ''}
                    onChange={(e) => updateCertification(index, 'expiry_date', e.target.value)}
                    className="bg-white/50 border-gray-200 rounded-lg
                      focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/20
                      hover:border-amber-500/30 hover:bg-white/60 transition-colors"
                  />
                  <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[10px] font-medium text-amber-700">
                    EXPIRY DATE (OPTIONAL)
                  </div>
                </div>
              </div>

              {/* Credential Details Row */}
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="relative group flex-1">
                  <Input
                    value={cert.credential_id || ''}
                    onChange={(e) => updateCertification(index, 'credential_id', e.target.value)}
                    className="bg-white/50 border-gray-200 rounded-lg
                      focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/20
                      hover:border-amber-500/30 hover:bg-white/60 transition-colors
                      placeholder:text-gray-400"
                    placeholder="Enter credential ID"
                  />
                  <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[10px] font-medium text-amber-700">
                    CREDENTIAL ID
                  </div>
                </div>
                <div className="relative group flex-1">
                  <div className="relative">
                    <Input
                      type="url"
                      value={cert.url || ''}
                      onChange={(e) => updateCertification(index, 'url', e.target.value)}
                      className="bg-white/50 border-gray-200 rounded-lg pr-9
                        focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/20
                        hover:border-amber-500/30 hover:bg-white/60 transition-colors
                        placeholder:text-gray-400"
                      placeholder="https://..."
                    />
                    {cert.url && (
                      <a
                        href={cert.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-amber-600 hover:text-amber-700 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[10px] font-medium text-amber-700">
                    CREDENTIAL URL
                  </div>
                </div>
              </div>

              {/* Helper Text */}
              <div className="text-[10px] text-gray-500 italic">
                Pro tip: Include the credential URL to make it easy for employers to verify your certification
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <Button 
        variant="outline" 
        className="w-full bg-gradient-to-r from-amber-500/5 via-amber-500/10 to-yellow-500/5 hover:from-amber-500/10 hover:via-amber-500/15 hover:to-yellow-500/10 border-dashed border-amber-500/30 hover:border-amber-500/40 text-amber-700 hover:text-amber-800 transition-all duration-300"
        onClick={addCertification}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Certification
      </Button>
    </div>
  );
} 