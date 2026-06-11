import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

/**
 * @typedef {{
 *   label: string,
 *   name: string,
 *   type?: string,
 *   value?: string | string[] | boolean,
 *   onChange: (name: string, value: string | string[] | boolean) => void,
 *   options?: string[],
 *   placeholder?: string,
 *   className?: string,
 *   multiline?: boolean,
 *   disabled?: boolean
 * }} IntakeFormFieldProps
 */

/** @param {IntakeFormFieldProps} props */
export default function FormField({ label, name, type = "text", value, onChange, options, placeholder, className, multiline, disabled }) {
  /** @param {string | string[] | boolean} val */
  const handleChange = (val) => onChange(name, val);
  const stringValue = typeof value === "string" ? value : "";
  const arrayValue = Array.isArray(value) ? value : [];
  const booleanValue = Boolean(value);

  if (type === "radio") {
    return (
      <div className={cn("space-y-2", className)}>
        <Label className="text-sm font-medium text-slate-700">{label}</Label>
        <RadioGroup value={stringValue} onValueChange={handleChange} className="flex flex-wrap gap-x-5 gap-y-2">
          {options?.map(opt => (
            <div key={opt} className="flex items-center gap-2">
              <RadioGroupItem value={opt} id={`${name}-${opt}`} />
              <Label htmlFor={`${name}-${opt}`} className="text-sm text-slate-600 font-normal cursor-pointer">{opt}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    );
  }

  if (type === "checkbox-group") {
    const currentValues = arrayValue;
    return (
      <div className={cn("space-y-2", className)}>
        <Label className="text-sm font-medium text-slate-700">{label}</Label>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {options?.map(opt => (
            <div key={opt} className="flex items-center gap-2">
              <Checkbox
                id={`${name}-${opt}`}
                checked={currentValues.includes(opt)}
                onCheckedChange={(checked) => {
                  const newVals = checked ? [...currentValues, opt] : currentValues.filter(v => v !== opt);
                  handleChange(newVals);
                }}
              />
              <Label htmlFor={`${name}-${opt}`} className="text-sm text-slate-600 font-normal cursor-pointer">{opt}</Label>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "checkbox") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Checkbox id={name} checked={booleanValue} onCheckedChange={handleChange} />
        <Label htmlFor={name} className="text-sm text-slate-600 font-normal cursor-pointer">{label}</Label>
      </div>
    );
  }

  if (type === "select") {
    return (
      <div className={cn("space-y-1.5", className)}>
        <Label className="text-sm font-medium text-slate-700">{label}</Label>
        <Select value={stringValue} onValueChange={handleChange} disabled={disabled}>
          <SelectTrigger className="bg-white border-slate-200 focus:ring-slate-400">
            <SelectValue placeholder={placeholder || "Select..."} />
          </SelectTrigger>
          <SelectContent>
            {options?.map(opt => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (type === "date") {
    return (
      <div className={cn("space-y-1.5", className)}>
        <Label className="text-sm font-medium text-slate-700">{label}</Label>
        <Input
          type="date"
          value={stringValue ? stringValue.split('T')[0] : ""}
          onChange={(e) => handleChange(e.target.value ? new Date(e.target.value).toISOString() : "")}
          className="bg-white border-slate-200 focus:ring-slate-400"
          disabled={disabled}
        />
      </div>
    );
  }

  if (multiline) {
    return (
      <div className={cn("space-y-1.5", className)}>
        <Label className="text-sm font-medium text-slate-700">{label}</Label>
        <Textarea
          value={stringValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className="bg-white border-slate-200 focus:ring-slate-400 min-h-[80px]"
          disabled={disabled}
        />
      </div>
    );
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-sm font-medium text-slate-700">{label}</Label>
      <Input
        value={stringValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="bg-white border-slate-200 focus:ring-slate-400"
        disabled={disabled}
      />
    </div>
  );
}
