import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const FORM_TYPES = [
  { value: 'intake_form', label: 'Intake form' },
  { value: 'guideline_form', label: 'Guideline form' },
  { value: 'additional_prep', label: 'Additional prep worksheet' },
  { value: 'medical_worksheet', label: 'Medical worksheet' },
  { value: 'memo', label: 'Memo' },
];

export default function MergeApplicationDialog({ open, onOpenChange, onMerge }) {
  const [loading, setLoading] = useState(false);

  const handleTypeSelect = async (type) => {
    setLoading(true);
    try {
      const apps = await base44.entities.LegalAidApplication.list('-updated_date', 1);
      if (!apps || apps.length === 0) {
        toast.error('No applications found to merge');
        setLoading(false);
        return;
      }

      onMerge(apps[0].form_data || {});
      toast.success('Application data merged successfully');
      onOpenChange(false);
    } catch (err) {
      toast.error('Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Merge Application Data</DialogTitle>
          <DialogDescription>
            Select the type of form you want to merge data from
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {FORM_TYPES.map(type => (
            <Button
              key={type.value}
              onClick={() => handleTypeSelect(type.value)}
              variant="outline"
              className="w-full justify-start text-left h-auto py-3"
              disabled={loading}
            >
              {loading && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
              {type.label}
            </Button>
          ))}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
