'use client';

import { Certification } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

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
        <Card key={index} className="bg-white/40 backdrop-blur-md border-white/40">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Certification {index + 1}</CardTitle>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => removeCertification(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Certification Name</Label>
                <Input
                  value={cert.name}
                  onChange={(e) => updateCertification(index, 'name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Issuing Organization</Label>
                <Input
                  value={cert.issuer}
                  onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date Acquired</Label>
                <Input
                  type="date"
                  value={cert.date_acquired}
                  onChange={(e) => updateCertification(index, 'date_acquired', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Expiry Date (Optional)</Label>
                <Input
                  type="date"
                  value={cert.expiry_date || ''}
                  onChange={(e) => updateCertification(index, 'expiry_date', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Credential ID</Label>
                <Input
                  value={cert.credential_id || ''}
                  onChange={(e) => updateCertification(index, 'credential_id', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Credential URL</Label>
                <Input
                  type="url"
                  value={cert.url || ''}
                  onChange={(e) => updateCertification(index, 'url', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <Button 
        variant="outline" 
        className="w-full"
        onClick={addCertification}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Certification
      </Button>
    </div>
  );
} 