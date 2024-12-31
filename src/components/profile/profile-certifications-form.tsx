'use client';

import { Certification } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import React from "react";

interface ProfileCertificationsFormProps {
  certifications: Certification[];
  onChange: (certifications: Certification[]) => void;
}

export function ProfileCertificationsForm({ certifications, onChange }: ProfileCertificationsFormProps) {
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

  const updateCertification = (index: number, field: keyof Certification, value: string) => {
    const updated = [...certifications];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeCertification = (index: number) => {
    onChange(certifications.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <Accordion 
        type="multiple" 
        className="space-y-3"
        defaultValue={certifications.map((_, index) => `certification-${index}`)}
      >
        {certifications.map((cert, index) => (
          <AccordionItem
            key={index}
            value={`certification-${index}`}
            className="bg-gradient-to-r from-amber-500/5 via-amber-500/10 to-yellow-500/5 backdrop-blur-md border border-amber-500/30 hover:border-amber-500/40 hover:shadow-lg transition-all duration-300 shadow-sm rounded-md overflow-hidden"
          >
            <AccordionTrigger className="px-4 py-2 hover:no-underline">
              <div className="flex items-center justify-between gap-3 flex-1">
                <div className="flex-1 text-left text-sm font-medium text-amber-900">
                  {cert.name || "New Certification"} {cert.issuer && `by ${cert.issuer}`}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {cert.date_acquired && <span>{cert.date_acquired}</span>}
                  {cert.credential_id && <span>ID: {cert.credential_id}</span>}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="px-4 pb-4 pt-2 space-y-4">
                {/* Certificate Name and Delete Button Row */}
                <div className="flex items-center justify-between gap-3">
                  <div className="relative group flex-1">
                    <Input
                      value={cert.name}
                      onChange={(e) => updateCertification(index, 'name', e.target.value)}
                      className="text-base bg-white/50 border-gray-200 rounded-md h-8
                        focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20
                        hover:border-amber-500/30 hover:bg-white/60 transition-colors
                        placeholder:text-gray-400"
                      placeholder="Certification Name"
                    />
                    <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[9px] font-medium text-amber-700">
                      CERTIFICATION
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeCertification(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors duration-300 h-8 w-8"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Issuing Organization */}
                <div className="relative group">
                  <Input
                    value={cert.issuer}
                    onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                    className="bg-white/50 border-gray-200 rounded-md h-8
                      focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20
                      hover:border-amber-500/30 hover:bg-white/60 transition-colors
                      placeholder:text-gray-400 text-sm"
                    placeholder="e.g., Microsoft, AWS, Google"
                  />
                  <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[9px] font-medium text-amber-700">
                    ISSUING ORGANIZATION
                  </div>
                </div>

                {/* Dates Row */}
                <div className="flex flex-col md:flex-row md:items-start gap-3">
                  <div className="relative group flex-1">
                    <Input
                      type="date"
                      value={cert.date_acquired}
                      onChange={(e) => updateCertification(index, 'date_acquired', e.target.value)}
                      className="bg-white/50 border-gray-200 rounded-md h-8
                        focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20
                        hover:border-amber-500/30 hover:bg-white/60 transition-colors text-sm"
                    />
                    <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[9px] font-medium text-amber-700">
                      DATE ACQUIRED
                    </div>
                  </div>
                  <div className="relative group flex-1">
                    <Input
                      type="date"
                      value={cert.expiry_date || ''}
                      onChange={(e) => updateCertification(index, 'expiry_date', e.target.value)}
                      className="bg-white/50 border-gray-200 rounded-md h-8
                        focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20
                        hover:border-amber-500/30 hover:bg-white/60 transition-colors text-sm"
                    />
                    <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[9px] font-medium text-amber-700">
                      EXPIRY DATE (OPTIONAL)
                    </div>
                  </div>
                </div>

                {/* Credential Details Row */}
                <div className="flex flex-col md:flex-row md:items-start gap-3">
                  <div className="relative group flex-1">
                    <Input
                      value={cert.credential_id || ''}
                      onChange={(e) => updateCertification(index, 'credential_id', e.target.value)}
                      className="bg-white/50 border-gray-200 rounded-md h-8
                        focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20
                        hover:border-amber-500/30 hover:bg-white/60 transition-colors
                        placeholder:text-gray-400 text-sm"
                      placeholder="Enter credential ID"
                    />
                    <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[9px] font-medium text-amber-700">
                      CREDENTIAL ID
                    </div>
                  </div>
                  <div className="relative group flex-1">
                    <div className="relative">
                      <Input
                        type="url"
                        value={cert.url || ''}
                        onChange={(e) => updateCertification(index, 'url', e.target.value)}
                        className="bg-white/50 border-gray-200 rounded-md h-8 pr-9
                          focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20
                          hover:border-amber-500/30 hover:bg-white/60 transition-colors
                          placeholder:text-gray-400 text-sm"
                        placeholder="https://..."
                      />
                      {cert.url && (
                        <a
                          href={cert.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-amber-600 hover:text-amber-700 transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                    <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[9px] font-medium text-amber-700">
                      CREDENTIAL URL
                    </div>
                  </div>
                </div>

                {/* Helper Text */}
                <div className="text-[9px] text-gray-500 italic">
                  Pro tip: Include the credential URL to make it easy for employers to verify your certification
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Button 
        variant="outline" 
        onClick={addCertification}
        className="w-full bg-gradient-to-r from-amber-500/5 via-amber-500/10 to-yellow-500/5 hover:from-amber-500/10 hover:via-amber-500/15 hover:to-yellow-500/10 border-dashed border-amber-500/30 hover:border-amber-500/40 text-amber-700 hover:text-amber-800 transition-all duration-300 h-8 text-sm"
      >
        <Plus className="h-3.5 w-3.5 mr-1.5" />
        Add Certification
      </Button>
    </div>
  );
} 