import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import SectionHeader from "./SectionHeader";

const assigneeOptions = [
  "Ellen Murphy",
  "Britt Jeffs",
  "Ashlee McPhail",
  "Jaffa Withers",
  "Christine Callaghan",
  "Beray Uzunbay",
  "Lauren Campbell",
  "Mary Zaky",
  "Eliza Collister"
];

const crimeSubtypes = ["Summary", "Consol", "Indictable", "Infringements", "Appeal", "CMIA"];

export default function ApprovalAndAssignmentSection({ formData, updateField, updateNestedField }) {
  const approvalData = formData.approval_data || {};

  const handleApprovalChange = (key, value) => {
    updateNestedField("approval_data", key, value);
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Approval & Assignment" />

      {/* Approved */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700">Approved</label>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="approved-yes"
              checked={approvalData.approved === "yes"}
              onCheckedChange={() => handleApprovalChange("approved", "yes")}
            />
            <label htmlFor="approved-yes" className="text-sm cursor-pointer">
              Yes
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="approved-no"
              checked={approvalData.approved === "no"}
              onCheckedChange={() => handleApprovalChange("approved", "no")}
            />
            <label htmlFor="approved-no" className="text-sm cursor-pointer">
              No
            </label>
          </div>
        </div>

        {/* Referral to - shown when No is selected */}
        {approvalData.approved === "no" && (
          <div className="mt-3">
            <label className="text-sm font-medium text-slate-700 block mb-2">Referral to</label>
            <Input
              placeholder="Enter referral details"
              value={approvalData.referral_to || ""}
              onChange={(e) => handleApprovalChange("referral_to", e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Action Required */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700">Action Required</label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="brief-request"
              checked={approvalData.brief_request || false}
              onCheckedChange={(checked) => handleApprovalChange("brief_request", checked)}
            />
            <label htmlFor="brief-request" className="text-sm cursor-pointer">
              Brief Request
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="checklist"
              checked={approvalData.checklist || false}
              onCheckedChange={(checked) => handleApprovalChange("checklist", checked)}
            />
            <label htmlFor="checklist" className="text-sm cursor-pointer">
              Checklist
            </label>
          </div>
          {(approvalData.brief_request || approvalData.checklist) && (
            <div>
              <Input
                placeholder="Enter action request details"
                value={approvalData.action_request_details || ""}
                onChange={(e) => handleApprovalChange("action_request_details", e.target.value)}
                className="mt-2"
              />
            </div>
          )}
        </div>
      </div>

      {/* File type to open */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700">File type to open</label>
        
        {/* Crime */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="file-crime"
              checked={approvalData.file_crime || false}
              onCheckedChange={(checked) => handleApprovalChange("file_crime", checked)}
            />
            <label htmlFor="file-crime" className="text-sm cursor-pointer">
              Crime
            </label>
          </div>

          {approvalData.file_crime && (
            <div className="ml-6 space-y-2">
              <Select value={approvalData.crime_subtype || ""} onValueChange={(value) => handleApprovalChange("crime_subtype", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select crime type" />
                </SelectTrigger>
                <SelectContent>
                  {crimeSubtypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* IVO */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="file-ivo"
            checked={approvalData.file_ivo || false}
            onCheckedChange={(checked) => handleApprovalChange("file_ivo", checked)}
          />
          <label htmlFor="file-ivo" className="text-sm cursor-pointer">
            IVO
          </label>
        </div>

        {/* VOCAT */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="file-vocat"
            checked={approvalData.file_vocat || false}
            onCheckedChange={(checked) => handleApprovalChange("file_vocat", checked)}
          />
          <label htmlFor="file-vocat" className="text-sm cursor-pointer">
            VOCAT
          </label>
        </div>
      </div>

      {/* Funding */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700">Funding</label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="funding-lacw"
              checked={approvalData.funding_lacw || false}
              onCheckedChange={(checked) => handleApprovalChange("funding_lacw", checked)}
            />
            <label htmlFor="funding-lacw" className="text-sm cursor-pointer">
              LACW
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="funding-vla"
              checked={approvalData.funding_vla || false}
              onCheckedChange={(checked) => handleApprovalChange("funding_vla", checked)}
            />
            <label htmlFor="funding-vla" className="text-sm cursor-pointer">
              VLA
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="funding-private"
              checked={approvalData.funding_private || false}
              onCheckedChange={(checked) => handleApprovalChange("funding_private", checked)}
            />
            <label htmlFor="funding-private" className="text-sm cursor-pointer">
              Private
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="funding-vocat"
              checked={approvalData.funding_vocat || false}
              onCheckedChange={(checked) => handleApprovalChange("funding_vocat", checked)}
            />
            <label htmlFor="funding-vocat" className="text-sm cursor-pointer">
              VOCAT
            </label>
          </div>
        </div>
      </div>

      {/* Assigned to */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700">Assigned to</label>
        <Select value={approvalData.assigned_to || ""} onValueChange={(value) => handleApprovalChange("assigned_to", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select assignee" />
          </SelectTrigger>
          <SelectContent>
            {assigneeOptions.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Next court date */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700">Next court date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {approvalData.next_court_date
                ? format(new Date(approvalData.next_court_date), "PPP")
                : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={approvalData.next_court_date ? new Date(approvalData.next_court_date) : undefined}
              onSelect={(date) =>
                handleApprovalChange("next_court_date", date ? date.toISOString() : "")
              }
              disabled={(date) => date < new Date()}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
