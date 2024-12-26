import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Resume } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface DocumentSettingsFormProps {
  resume: Resume;
  onChange: (field: keyof Resume, value: any) => void;
}

export function DocumentSettingsForm({ resume, onChange }: DocumentSettingsFormProps) {
  const defaultSettings = {
    font_family: "Helvetica",
    base_font_size: 10,
    header_font_size: 20,
    margin_tb: 0.5,
    margin_lr: 0.75,
    line_spacing: 1.15,
    section_title_size: 10,
    section_title_spacing: 0.5,
    section_title_border: 0.5,
    section_title_padding: 2,
    secondary_text_size: 9,
    link_color: "#2563eb",
    section_spacing: 8,
    item_spacing: 4,
    bullet_indent: 8,
    header_spacing: 8,
    // Header defaults
    header_name_size: 24,
    header_name_color: "#111827",
    header_name_spacing: 0.5,
    header_name_bottom_spacing: 20,
    header_info_size: 10,
    header_info_color: "#4b5563",
    header_info_spacing: 4,
    header_layout: "centered" as const,
  };

  const handleRestoreDefaults = () => {
    onChange('document_settings', defaultSettings);
  };

  return (
    <div className="space-y-6">
      <Card className="border-white/40 shadow-xl backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <CardTitle className="text-lg font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Document Settings
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRestoreDefaults}
            className="text-xs text-muted-foreground hover:text-teal-600 border-slate-200/50 hover:border-teal-200/50 transition-colors"
          >
            Restore Defaults
          </Button>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Font Settings */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Font Settings</Label>
              <div className="h-[1px] flex-1 mx-4 bg-gradient-to-r from-teal-200/20 via-cyan-200/20 to-transparent" />
            </div>

            <div className="space-y-4 bg-slate-50/50 rounded-lg p-4 border border-slate-200/50">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-muted-foreground">Base Font Size</Label>
                  <span className="text-xs text-muted-foreground/60">{resume.document_settings?.base_font_size || 10}pt</span>
                </div>
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
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-muted-foreground">Secondary Text Size</Label>
                  <span className="text-xs text-muted-foreground/60">{resume.document_settings?.secondary_text_size || 9}pt</span>
                </div>
                <Slider
                  value={[resume.document_settings?.secondary_text_size || 9]}
                  min={7}
                  max={11}
                  step={0.5}
                  onValueChange={([value]) => 
                    onChange('document_settings', {
                      ...resume.document_settings,
                      secondary_text_size: value
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Header Styling - Moved here */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Header Styling</Label>
              <div className="h-[1px] flex-1 mx-4 bg-gradient-to-r from-teal-200/20 via-cyan-200/20 to-transparent" />
            </div>

            <div className="space-y-4 bg-slate-50/50 rounded-lg p-4 border border-slate-200/50">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Layout Style</Label>
                  <Select
                    value={resume.document_settings?.header_layout || "centered"}
                    onValueChange={(value: 'centered' | 'split') => 
                      onChange('document_settings', { 
                        ...resume.document_settings, 
                        header_layout: value 
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select layout style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="centered">Centered</SelectItem>
                      <SelectItem value="split">Split</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-muted-foreground">Name Size</Label>
                    <span className="text-xs text-muted-foreground/60">{resume.document_settings?.header_name_size || 24}pt</span>
                  </div>
                  <Slider
                    value={[resume.document_settings?.header_name_size || 24]}
                    min={18}
                    max={32}
                    step={1}
                    onValueChange={([value]) => 
                      onChange('document_settings', {
                        ...resume.document_settings,
                        header_name_size: value
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-muted-foreground">Name Letter Spacing</Label>
                    <span className="text-xs text-muted-foreground/60">{resume.document_settings?.header_name_spacing || 0.5}</span>
                  </div>
                  <Slider
                    value={[resume.document_settings?.header_name_spacing || 0.5]}
                    min={0}
                    max={2}
                    step={0.1}
                    onValueChange={([value]) => 
                      onChange('document_settings', {
                        ...resume.document_settings,
                        header_name_spacing: value
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-muted-foreground">Space Below Name</Label>
                    <span className="text-xs text-muted-foreground/60">Level {((resume.document_settings?.header_name_bottom_spacing || 20) - 16) / 4 + 1}</span>
                  </div>
                  <Slider
                    value={[((resume.document_settings?.header_name_bottom_spacing || 20) - 16) / 4 + 1]}
                    min={1}
                    max={4}
                    step={1}
                    onValueChange={([value]) => 
                      onChange('document_settings', {
                        ...resume.document_settings,
                        header_name_bottom_spacing: (value - 1) * 4 + 16
                      })
                    }
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-muted-foreground/40">Compact</span>
                    <span className="text-[10px] text-muted-foreground/40">Spacious</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-muted-foreground">Contact Info Size</Label>
                    <span className="text-xs text-muted-foreground/60">{resume.document_settings?.header_info_size || 10}pt</span>
                  </div>
                  <Slider
                    value={[resume.document_settings?.header_info_size || 10]}
                    min={8}
                    max={14}
                    step={0.5}
                    onValueChange={([value]) => 
                      onChange('document_settings', {
                        ...resume.document_settings,
                        header_info_size: value
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-muted-foreground">Contact Info Spacing</Label>
                    <span className="text-xs text-muted-foreground/60">{resume.document_settings?.header_info_spacing || 4}pt</span>
                  </div>
                  <Slider
                    value={[resume.document_settings?.header_info_spacing || 4]}
                    min={2}
                    max={8}
                    step={0.5}
                    onValueChange={([value]) => 
                      onChange('document_settings', {
                        ...resume.document_settings,
                        header_info_spacing: value
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section Title Settings */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Section Title Styling</Label>
              <div className="h-[1px] flex-1 mx-4 bg-gradient-to-r from-teal-200/20 via-cyan-200/20 to-transparent" />
            </div>

            <div className="space-y-4 bg-slate-50/50 rounded-lg p-4 border border-slate-200/50">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-muted-foreground">Title Size</Label>
                    <span className="text-xs text-muted-foreground/60">{resume.document_settings?.section_title_size || 10}pt</span>
                  </div>
                  <Slider
                    value={[resume.document_settings?.section_title_size || 10]}
                    min={9}
                    max={14}
                    step={0.5}
                    onValueChange={([value]) => 
                      onChange('document_settings', {
                        ...resume.document_settings,
                        section_title_size: value
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-muted-foreground">Letter Spacing</Label>
                    <span className="text-xs text-muted-foreground/60">{resume.document_settings?.section_title_spacing || 0.5}</span>
                  </div>
                  <Slider
                    value={[resume.document_settings?.section_title_spacing || 0.5]}
                    min={0}
                    max={2}
                    step={0.1}
                    onValueChange={([value]) => 
                      onChange('document_settings', {
                        ...resume.document_settings,
                        section_title_spacing: value
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-muted-foreground">Border Width</Label>
                    <span className="text-xs text-muted-foreground/60">{resume.document_settings?.section_title_border || 0.5}pt</span>
                  </div>
                  <Slider
                    value={[resume.document_settings?.section_title_border || 0.5]}
                    min={0}
                    max={2}
                    step={0.5}
                    onValueChange={([value]) => 
                      onChange('document_settings', {
                        ...resume.document_settings,
                        section_title_border: value
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-muted-foreground">Bottom Padding</Label>
                    <span className="text-xs text-muted-foreground/60">{resume.document_settings?.section_title_padding || 2}pt</span>
                  </div>
                  <Slider
                    value={[resume.document_settings?.section_title_padding || 2]}
                    min={0}
                    max={6}
                    step={0.5}
                    onValueChange={([value]) => 
                      onChange('document_settings', {
                        ...resume.document_settings,
                        section_title_padding: value
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Spacing Settings */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Layout Spacing</Label>
              <div className="h-[1px] flex-1 mx-4 bg-gradient-to-r from-teal-200/20 via-cyan-200/20 to-transparent" />
            </div>

            <div className="space-y-4 bg-slate-50/50 rounded-lg p-4 border border-slate-200/50">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-muted-foreground">Section Spacing</Label>
                    <span className="text-xs text-muted-foreground/60">{resume.document_settings?.section_spacing || 8}pt</span>
                  </div>
                  <Slider
                    value={[resume.document_settings?.section_spacing || 8]}
                    min={4}
                    max={16}
                    step={1}
                    onValueChange={([value]) => 
                      onChange('document_settings', {
                        ...resume.document_settings,
                        section_spacing: value
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-muted-foreground">Item Spacing</Label>
                    <span className="text-xs text-muted-foreground/60">{resume.document_settings?.item_spacing || 4}pt</span>
                  </div>
                  <Slider
                    value={[resume.document_settings?.item_spacing || 4]}
                    min={2}
                    max={8}
                    step={0.5}
                    onValueChange={([value]) => 
                      onChange('document_settings', {
                        ...resume.document_settings,
                        item_spacing: value
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-muted-foreground">Bullet Indent</Label>
                    <span className="text-xs text-muted-foreground/60">{resume.document_settings?.bullet_indent || 8}pt</span>
                  </div>
                  <Slider
                    value={[resume.document_settings?.bullet_indent || 8]}
                    min={4}
                    max={16}
                    step={1}
                    onValueChange={([value]) => 
                      onChange('document_settings', {
                        ...resume.document_settings,
                        bullet_indent: value
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-muted-foreground">Header Spacing</Label>
                    <span className="text-xs text-muted-foreground/60">{resume.document_settings?.header_spacing || 8}pt</span>
                  </div>
                  <Slider
                    value={[resume.document_settings?.header_spacing || 8]}
                    min={4}
                    max={16}
                    step={1}
                    onValueChange={([value]) => 
                      onChange('document_settings', {
                        ...resume.document_settings,
                        header_spacing: value
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Margin Settings */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Page Margins</Label>
              <div className="h-[1px] flex-1 mx-4 bg-gradient-to-r from-teal-200/20 via-cyan-200/20 to-transparent" />
            </div>

            <div className="space-y-4 bg-slate-50/50 rounded-lg p-4 border border-slate-200/50">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-muted-foreground">Top & Bottom</Label>
                    <span className="text-xs text-muted-foreground/60">{resume.document_settings?.margin_tb || 0.5}in</span>
                  </div>
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
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-muted-foreground">Left & Right</Label>
                    <span className="text-xs text-muted-foreground/60">{resume.document_settings?.margin_lr || 0.75}in</span>
                  </div>
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
          </div>

          {/* Line Spacing */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Line Spacing</Label>
              <div className="h-[1px] flex-1 mx-4 bg-gradient-to-r from-teal-200/20 via-cyan-200/20 to-transparent" />
            </div>

            <div className="space-y-4 bg-slate-50/50 rounded-lg p-4 border border-slate-200/50">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-muted-foreground">Line Height</Label>
                  <span className="text-xs text-muted-foreground/60">{resume.document_settings?.line_spacing || 1.15}</span>
                </div>
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
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 