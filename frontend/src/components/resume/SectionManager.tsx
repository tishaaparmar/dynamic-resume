import { ResumeSections, SECTION_LABELS } from "@/types/resume";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SectionManagerProps {
  sections: ResumeSections;
  onChange: (sections: ResumeSections) => void;
  disabled?: boolean;
}

export const SectionManager = ({ sections, onChange, disabled }: SectionManagerProps) => {
  const toggle = (key: keyof ResumeSections) => {
    if (disabled) return;
    onChange({ ...sections, [key]: !sections[key] });
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Toggle sections on or off. Disabled sections won't appear on your resume or PDF.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(Object.keys(SECTION_LABELS) as (keyof ResumeSections)[]).map((key) => (
          <div
            key={key}
            className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50"
          >
            <Label htmlFor={`section-${key}`} className="text-sm font-medium cursor-pointer">
              {SECTION_LABELS[key]}
            </Label>
            <Switch
              id={`section-${key}`}
              checked={sections[key]}
              onCheckedChange={() => toggle(key)}
              disabled={disabled}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
