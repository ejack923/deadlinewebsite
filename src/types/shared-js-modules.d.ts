declare module "@/lib/utils" {
  export function cn(...inputs: unknown[]): string;
}

declare module "@/components/ui/input" {
  import * as React from "react";
  export const Input: React.ForwardRefExoticComponent<
    React.InputHTMLAttributes<HTMLInputElement> & React.RefAttributes<HTMLInputElement>
  >;
}

declare module "@/components/ui/textarea" {
  import * as React from "react";
  export const Textarea: React.ForwardRefExoticComponent<
    React.TextareaHTMLAttributes<HTMLTextAreaElement> & React.RefAttributes<HTMLTextAreaElement>
  >;
}

declare module "@/components/ui/label" {
  import * as React from "react";
  export const Label: React.ForwardRefExoticComponent<
    React.LabelHTMLAttributes<HTMLLabelElement> & React.RefAttributes<HTMLLabelElement>
  >;
}

declare module "@/components/ui/checkbox" {
  import * as React from "react";

  export interface CheckboxProps {
    id?: string;
    checked?: boolean;
    disabled?: boolean;
    className?: string;
    onCheckedChange?: (checked: boolean) => void;
  }

  export const Checkbox: React.ForwardRefExoticComponent<
    CheckboxProps & React.RefAttributes<HTMLButtonElement>
  >;
}

declare module "@/components/ui/radio-group" {
  import * as React from "react";

  export interface RadioGroupProps {
    value?: string;
    onValueChange?: (value: string) => void;
    className?: string;
    children?: React.ReactNode;
  }

  export interface RadioGroupItemProps {
    value: string;
    id?: string;
    className?: string;
  }

  export const RadioGroup: React.ForwardRefExoticComponent<
    RadioGroupProps & React.RefAttributes<HTMLDivElement>
  >;
  export const RadioGroupItem: React.ForwardRefExoticComponent<
    RadioGroupItemProps & React.RefAttributes<HTMLButtonElement>
  >;
}

declare module "@/components/ui/select" {
  import * as React from "react";

  export interface SelectProps {
    value?: string;
    disabled?: boolean;
    onValueChange?: (value: string) => void;
    children?: React.ReactNode;
  }

  export interface SelectTriggerProps {
    className?: string;
    children?: React.ReactNode;
  }

  export interface SelectValueProps {
    placeholder?: string;
  }

  export interface SelectContentProps {
    className?: string;
    children?: React.ReactNode;
  }

  export interface SelectItemProps {
    value: string;
    children?: React.ReactNode;
  }

  export const Select: React.FC<SelectProps>;
  export const SelectContent: React.ForwardRefExoticComponent<
    SelectContentProps & React.RefAttributes<HTMLDivElement>
  >;
  export const SelectItem: React.ForwardRefExoticComponent<
    SelectItemProps & React.RefAttributes<HTMLDivElement>
  >;
  export const SelectTrigger: React.ForwardRefExoticComponent<
    SelectTriggerProps & React.RefAttributes<HTMLButtonElement>
  >;
  export const SelectValue: React.FC<SelectValueProps>;
}

declare module "@/components/ui/button" {
  import * as React from "react";

  export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    asChild?: boolean;
  }

  export const Button: React.ForwardRefExoticComponent<
    ButtonProps & React.RefAttributes<HTMLButtonElement>
  >;
}

declare module "@/components/ui/dialog" {
  import * as React from "react";

  export interface DialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: React.ReactNode;
  }

  export interface DialogContentProps {
    className?: string;
    children?: React.ReactNode;
  }

  export interface DialogHeaderProps {
    className?: string;
    children?: React.ReactNode;
  }

  export interface DialogFooterProps {
    className?: string;
    children?: React.ReactNode;
  }

  export interface DialogTitleProps {
    className?: string;
    children?: React.ReactNode;
  }

  export interface DialogDescriptionProps {
    className?: string;
    children?: React.ReactNode;
  }

  export const Dialog: React.FC<DialogProps>;
  export const DialogContent: React.ForwardRefExoticComponent<
    DialogContentProps & React.RefAttributes<HTMLDivElement>
  >;
  export const DialogHeader: React.FC<DialogHeaderProps>;
  export const DialogFooter: React.FC<DialogFooterProps>;
  export const DialogTitle: React.ForwardRefExoticComponent<
    DialogTitleProps & React.RefAttributes<HTMLHeadingElement>
  >;
  export const DialogDescription: React.ForwardRefExoticComponent<
    DialogDescriptionProps & React.RefAttributes<HTMLParagraphElement>
  >;
}

declare module "@/api/base44Client" {
  export const base44: {
    integrations: {
      Core: {
        SendEmail(args: {
          to: string;
          cc: string;
          subject: string;
          body: string;
          attachment_name?: string | null;
          attachment_type?: string | null;
          attachment_base64?: string | null;
        }): Promise<unknown>;
        UploadFile(args: { file: File }): Promise<{ file_url: string }>;
      };
    };
  };
}

declare module "@/lib/chargeData" {
  export const CHARGE_DATA: Record<string, Record<string, string[]>>;
}
