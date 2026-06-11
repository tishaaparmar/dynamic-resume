import { RESUME_TEMPLATES } from "@/templates/resumeTemplates";
import { ResumeTemplate } from "@/types/resume";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface TemplatePickerProps {
  value: ResumeTemplate;
  onChange: (template: ResumeTemplate) => void;
  disabled?: boolean;
}

export const TemplatePicker = ({ value, onChange, disabled }: TemplatePickerProps) => (
  <div className="grid grid-cols-2 gap-3">
    {RESUME_TEMPLATES.map((t) => (
      <button
        key={t.id}
        type="button"
        disabled={disabled}
        onClick={() => onChange(t.id)}
        className={cn(
          "relative text-left p-3 rounded-lg border-2 transition-all hover:shadow-md",
          value === t.id
            ? "border-primary bg-primary/5 shadow-sm"
            : "border-border hover:border-primary/40",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {value === t.id && (
          <span className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
            <Check className="w-3 h-3 text-white" />
          </span>
        )}
        <div
          className={cn(
            "h-16 rounded mb-2 border",
            t.id === "classic" && "bg-white border-gray-300",
            t.id === "modern" && "bg-gradient-to-r from-blue-50 to-white border-blue-200",
            t.id === "minimal" && "bg-gray-50 border-gray-200",
            t.id === "executive" && "bg-slate-800 border-slate-700"
          )}
        />
        <p className="font-medium text-sm text-foreground">{t.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{t.description}</p>
      </button>
    ))}
  </div>
);
