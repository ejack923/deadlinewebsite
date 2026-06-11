import React from 'react';
import { TextField, TextAreaField, RadioField, CheckboxGroup, SectionHeader } from './FormField';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

/**
 * @param {{
 *   data: Record<string, any>,
 *   onChange: (name: string, value: any) => void
 * }} props
 */
export default function Step9SpecificMatters({ data, onChange }) {
  const children = data.family_children || [{}];

  const addChild = () => onChange("family_children", [...children, {}]);
  /** @param {number} idx */
  const removeChild = (idx) => onChange("family_children", children.filter((_, i) => i !== idx));
  /** @param {number} idx @param {string} field @param {string} value */
  const updateChild = (idx, field, value) => {
    const updated = [...children];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange("family_children", updated);
  };

  return (
    <div className="space-y-8">
      {/* Section 26 - Criminal */}
      <div>
        <SectionHeader number="26" title="Criminal prosecutions only" />
        <div className="space-y-5">
          <RadioField label="Do you have any prior convictions?" name="prior_convictions" value={data.prior_convictions} onChange={onChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
          {data.prior_convictions === "Yes" && (
            <TextAreaField label="If yes, please outline (year, offence, penalty)" name="convictions_details" value={data.convictions_details} onChange={onChange} rows={4} />
          )}
        </div>
      </div>

      {/* Section 27 - Appeals */}
      <div>
        <SectionHeader number="27" title="Criminal appeals only" />
        <div className="space-y-5">
          <RadioField label="Do you wish to appeal a conviction?" name="appeal_conviction" value={data.appeal_conviction} onChange={onChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
          <RadioField label="Do you wish to appeal against a sentence?" name="appeal_sentence" value={data.appeal_sentence} onChange={onChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
          {(data.appeal_conviction === "Yes" || data.appeal_sentence === "Yes") && (
            <>
              <TextAreaField label="Please provide details" name="appeal_details" value={data.appeal_details} onChange={onChange} />
              <TextField label="Which court made the decision?" name="appeal_court" value={data.appeal_court} onChange={onChange} />
              <TextField label="What was the date of the original decision?" name="appeal_date" value={data.appeal_date} onChange={onChange} type="date" />
            </>
          )}
        </div>
      </div>

      {/* Section 28 - Family Law */}
      <div>
        <SectionHeader number="28" title="Family law matters only (including child protection matters)" />
        <div className="space-y-5">
          <RadioField label="Are there any children relevant to your legal problem?" name="has_family_children" value={data.has_family_children} onChange={onChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
          {data.has_family_children === "Yes" && (
            <>
              {children.map((child, idx) => (
                <div key={idx} className="p-4 border border-gray-200 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Child {idx + 1}</span>
                    {children.length > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => removeChild(idx)} className="text-red-500 h-7">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">First name</Label>
                      <Input value={child.first_name || ""} onChange={e => updateChild(idx, "first_name", e.target.value)} className="h-9 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Middle name</Label>
                      <Input value={child.middle_name || ""} onChange={e => updateChild(idx, "middle_name", e.target.value)} className="h-9 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Last name</Label>
                      <Input value={child.last_name || ""} onChange={e => updateChild(idx, "last_name", e.target.value)} className="h-9 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Male/female/other</Label>
                      <Input value={child.gender || ""} onChange={e => updateChild(idx, "gender", e.target.value)} className="h-9 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Date of birth</Label>
                      <Input type="date" value={child.dob || ""} onChange={e => updateChild(idx, "dob", e.target.value)} className="h-9 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Relationship to you</Label>
                      <Input value={child.relationship || ""} onChange={e => updateChild(idx, "relationship", e.target.value)} className="h-9 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Who does the child live with?</Label>
                      <Input value={child.lives_with || ""} onChange={e => updateChild(idx, "lives_with", e.target.value)} className="h-9 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Since when?</Label>
                      <Input type="date" value={child.since_when || ""} onChange={e => updateChild(idx, "since_when", e.target.value)} className="h-9 text-sm" />
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addChild} className="gap-2">
                <Plus className="w-3.5 h-3.5" /> Add child
              </Button>
            </>
          )}

          <div className="mt-4 pt-4 border-t border-gray-200">
            <Label className="text-sm font-semibold text-[#0071BC] block mb-4">Existing orders</Label>
            <div className="space-y-5">
              <RadioField label="Are there any current family law or child orders in relation to this matter?" name="existing_orders" value={data.existing_orders} onChange={onChange} options={[{value:"No",label:"No"},{value:"Yes, interim",label:"Yes, interim"},{value:"Yes, final",label:"Yes, final"}]} />
              {data.existing_orders && data.existing_orders !== "No" && (
                <>
                  <TextField label="Date of order" name="order_date" value={data.order_date} onChange={onChange} type="date" />
                  <RadioField label="Court or tribunal which made the order?" name="order_court" value={data.order_court} onChange={onChange} options={[{value:"Children's Court",label:"Children's Court"},{value:"Family Court",label:"Family Court"},{value:"Federal Magistrates Court",label:"Federal Magistrates Court"},{value:"Magistrates' Court of Victoria",label:"Magistrates' Court of Victoria"}]} inline={false} />
                  <CheckboxGroup label="Type of order:" name="order_types" values={data.order_types} onChange={onChange} options={[{value:"Family law",label:"Family law"},{value:"Child support",label:"Child support"},{value:"Family violence",label:"Family violence"},{value:"Child welfare",label:"Child welfare"}]} />
                </>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <Label className="text-sm font-semibold text-[#0071BC] block mb-4">Details of dispute</Label>
            <div className="space-y-5">
              <RadioField label="Did you live with the other party?" name="lived_with_party" value={data.lived_with_party} onChange={onChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
              {data.lived_with_party === "Yes" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextField label="Date of marriage" name="marriage_date" value={data.marriage_date} onChange={onChange} type="date" />
                  <TextField label="Date de facto relationship started" name="defacto_date" value={data.defacto_date} onChange={onChange} type="date" />
                  <TextField label="Date of separation" name="separation_date" value={data.separation_date} onChange={onChange} type="date" />
                  <TextField label="Date of divorce" name="divorce_date" value={data.divorce_date} onChange={onChange} type="date" />
                </div>
              )}
              <RadioField label="Have you attended family dispute resolution with a registered family dispute practitioner?" name="attended_fdr" value={data.attended_fdr} onChange={onChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
              {data.attended_fdr === "No" && (
                <TextAreaField label="If you do not wish to attend Victoria Legal Aid Family Dispute Resolution Service, please provide reasons:" name="fdr_reasons" value={data.fdr_reasons} onChange={onChange} />
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <Label className="text-sm font-semibold text-[#0071BC] block mb-4">Safety fears</Label>
            <div className="space-y-5">
              <RadioField label="Do you fear for your safety?" name="fear_safety" value={data.fear_safety} onChange={onChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
              <RadioField label="Do you fear for the safety of the children?" name="fear_children_safety" value={data.fear_children_safety} onChange={onChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
              <RadioField label="Are there any current investigations about child abuse?" name="child_abuse_investigation" value={data.child_abuse_investigation} onChange={onChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
              <RadioField label="Is there a family violence order in place for your protection?" name="fvo_you" value={data.fvo_you} onChange={onChange} options={[{value:"No",label:"No"},{value:"Yes, interim",label:"Yes, interim"},{value:"Yes, final",label:"Yes, final"}]} />
              <RadioField label="Is there a family violence order in place for the protection of children?" name="fvo_children" value={data.fvo_children} onChange={onChange} options={[{value:"No",label:"No"},{value:"Yes, interim",label:"Yes, interim"},{value:"Yes, final",label:"Yes, final"}]} />
              {data.fvo_children && data.fvo_children !== "No" && (
                <RadioField label="What is your role in the family violence order for the protection of the children?" name="fvo_children_role" value={data.fvo_children_role} onChange={onChange} options={[{value:"Applicant/plaintiff/appellant",label:"Applicant/plaintiff/appellant"},{value:"Accused/defendant/respondent",label:"Accused/defendant/respondent"},{value:"Interested party",label:"Interested party"},{value:"No court proceedings",label:"No court proceedings"},{value:"Other",label:"Other"}]} inline={false} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
