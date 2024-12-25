import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Resume } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DocumentSettingsFormProps {
  resume: Resume;
  onChange: (field: keyof Resume, value: any) => void;
}

export function DocumentSettingsForm({ resume, onChange }: DocumentSettingsFormProps) {
  return (
    <div className="space-y-6">
      <Card className="border-white/40 shadow-xl backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Document Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Font Settings */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Font Family</Label>
              <Select
                value={resume.document_settings?.font_family || "Helvetica"}
                onValueChange={(value) => 
                  onChange('document_settings', { 
                    ...resume.document_settings, 
                    font_family: value 
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select font family" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Helvetica">Helvetica</SelectItem>
                  <SelectItem value="Times-Roman">Times Roman</SelectItem>
                  <SelectItem value="Courier">Courier</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Base Font Size: {resume.document_settings?.base_font_size || 10}pt
              </Label>
              <Slider
                value={[resume.document_settings?.base_font_size || 10]}
                min={8}
                max={12}
                step={0.5}
                onValueChange={([value]) => 
                  onChange('document_settings', {
                    ...resume.document_settings,
                    base_font_size: value
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Header Font Size: {resume.document_settings?.header_font_size || 20}pt
              </Label>
              <Slider
                value={[resume.document_settings?.header_font_size || 20]}
                min={16}
                max={24}
                step={0.5}
                onValueChange={([value]) => 
                  onChange('document_settings', {
                    ...resume.document_settings,
                    header_font_size: value
                  })
                }
              />
            </div>
          </div>

          {/* Margin Settings */}
          <div className="space-y-4">
            <Label className="text-sm font-medium text-muted-foreground">Page Margins (inches)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Top & Bottom: {resume.document_settings?.margin_tb || 0.5}in
                </Label>
                <Slider
                  value={[resume.document_settings?.margin_tb || 0.5]}
                  min={0.25}
                  max={1.5}
                  step={0.125}
                  onValueChange={([value]) => 
                    onChange('document_settings', {
                      ...resume.document_settings,
                      margin_tb: value
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Left & Right: {resume.document_settings?.margin_lr || 0.75}in
                </Label>
                <Slider
                  value={[resume.document_settings?.margin_lr || 0.75]}
                  min={0.25}
                  max={1.5}
                  step={0.125}
                  onValueChange={([value]) => 
                    onChange('document_settings', {
                      ...resume.document_settings,
                      margin_lr: value
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Line Spacing */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">
              Line Spacing: {resume.document_settings?.line_spacing || 1.15}
            </Label>
            <Slider
              value={[resume.document_settings?.line_spacing || 1.15]}
              min={1}
              max={2}
              step={0.05}
              onValueChange={([value]) => 
                onChange('document_settings', {
                  ...resume.document_settings,
                  line_spacing: value
                })
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 