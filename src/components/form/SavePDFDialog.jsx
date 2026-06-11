import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileDown, ChevronRight } from "lucide-react";

/**
 * @param {{
 *   open: boolean,
 *   onOpenChange: (open: boolean) => void,
 *   onSave: () => void | Promise<void>,
 *   onSkip: () => void,
 *   isLoading: boolean
 * }} props
 */
export default function SavePDFDialog({ open, onOpenChange, onSave, onSkip, isLoading }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="w-5 h-5 text-blue-600" />
            Save Application as PDF
          </DialogTitle>
          <DialogDescription>
            Would you like to save a copy of your application as a PDF before submitting?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onSkip()} disabled={isLoading}>
            Skip
          </Button>
          <Button 
            onClick={onSave} 
            disabled={isLoading}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? 'Downloading...' : 'Download PDF'}
            {!isLoading && <ChevronRight className="w-4 h-4" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
