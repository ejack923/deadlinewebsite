import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * @typedef {{ value: string, label: string }} ChoiceOption
 */

/**
 * @typedef {{
 *   label: string,
 *   name: string,
 *   value?: string,
 *   onChange: (name: string, value: string) => void,
 *   placeholder?: string,
 *   type?: string,
 *   required?: boolean
 * }} TextFieldProps
 */

/**
 * @typedef {{
 *   label: string,
 *   name: string,
 *   value?: string,
 *   onChange: (name: string, value: string) => void,
 *   placeholder?: string,
 *   rows?: number
 * }} TextAreaFieldProps
 */

/**
 * @typedef {{
 *   label: string,
 *   name: string,
 *   value?: string,
 *   onChange: (name: string, value: string) => void,
 *   options?: ChoiceOption[],
 *   inline?: boolean
 * }} RadioFieldProps
 */

/**
 * @typedef {{
 *   label: string,
 *   name: string,
 *   checked?: boolean,
 *   onChange: (name: string, value: boolean) => void
 * }} CheckboxFieldProps
 */

/**
 * @typedef {{
 *   label: string,
 *   name: string,
 *   values?: string[],
 *   onChange: (name: string, value: string[]) => void,
 *   options?: ChoiceOption[]
 * }} CheckboxGroupProps
 */

/**
 * @typedef {{
 *   label: string,
 *   name: string,
 *   value?: string,
 *   onChange: (name: string, value: string) => void,
 *   options?: ChoiceOption[],
 *   placeholder?: string
 * }} SelectFieldProps
 */

/**
 * @typedef {{
 *   number?: string,
 *   title: string
 * }} SectionHeaderProps
 */

/** @param {TextFieldProps} props */
export function TextField({ label, name, value, onChange, placeholder = "", type = "text", required = false }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id={name}
        type={type}
        value={value || ""}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        className="h-10 border-gray-200 focus:border-[#0071BC] focus:ring-[#0071BC]/20"
      />
    </div>
  );
}

/** @param {TextAreaFieldProps} props */
export function TextAreaField({ label, name, value, onChange, placeholder = "", rows = 4 }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name} className="text-sm font-medium text-gray-700">{label}</Label>
      <Textarea
        id={name}
        value={value || ""}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="border-gray-200 focus:border-[#0071BC] focus:ring-[#0071BC]/20"
      />
    </div>
  );
}

/** @param {RadioFieldProps} props */
export function RadioField({ label, name, value, onChange, options = [], inline = true }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <RadioGroup
        value={value || ""}
        onValueChange={(val) => onChange(name, val)}
        className={inline ? "flex flex-wrap gap-4" : "space-y-2"}
      >
        {options.map((opt) => (
          <div key={opt.value} className="flex items-center gap-2">
            <RadioGroupItem value={opt.value} id={`${name}-${opt.value}`} className="border-gray-300 text-[#0071BC]" />
            <Label htmlFor={`${name}-${opt.value}`} className="text-sm text-gray-600 cursor-pointer font-normal">{opt.label}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}

/** @param {CheckboxFieldProps} props */
export function CheckboxField({ label, name, checked = false, onChange }) {
  return (
    <div className="flex items-start gap-2.5">
      <Checkbox
        id={name}
        checked={checked || false}
        onCheckedChange={(val) => onChange(name, val)}
        className="mt-0.5 border-gray-300 data-[state=checked]:bg-[#0071BC] data-[state=checked]:border-[#0071BC]"
      />
      <Label htmlFor={name} className="text-sm text-gray-600 cursor-pointer font-normal leading-relaxed">{label}</Label>
    </div>
  );
}

/** @param {CheckboxGroupProps} props */
export function CheckboxGroup({ label, name, values = [], onChange, options = [] }) {
  const current = values || [];
  /** @param {string} optValue */
  const handleToggle = (optValue) => {
    const updated = current.includes(optValue)
      ? current.filter(v => v !== optValue)
      : [...current, optValue];
    onChange(name, updated);
  };
  
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((opt) => (
          <div key={opt.value} className="flex items-start gap-2.5">
            <Checkbox
              id={`${name}-${opt.value}`}
              checked={current.includes(opt.value)}
              onCheckedChange={() => handleToggle(opt.value)}
              className="mt-0.5 border-gray-300 data-[state=checked]:bg-[#0071BC] data-[state=checked]:border-[#0071BC]"
            />
            <Label htmlFor={`${name}-${opt.value}`} className="text-sm text-gray-600 cursor-pointer font-normal leading-relaxed">{opt.label}</Label>
          </div>
        ))}
      </div>
    </div>
  );
}

/** @param {SelectFieldProps} props */
export function SelectField({ label, name, value, onChange, options = [], placeholder = "Select..." }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <Select value={value || ""} onValueChange={(val) => onChange(name, val)}>
        <SelectTrigger className="h-10 border-gray-200 focus:border-[#0071BC] focus:ring-[#0071BC]/20">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/** @param {SectionHeaderProps} props */
export function SectionHeader({ number, title }) {
  return (
    <div className="flex items-center gap-3 pb-3 border-b border-[#0071BC]/20 mb-5">
      <div className="w-8 h-8 rounded-lg bg-[#0071BC] text-white flex items-center justify-center text-sm font-bold shrink-0">
        {number}
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
  );
}
