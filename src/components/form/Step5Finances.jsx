// @ts-nocheck
import React from 'react';
import { TextField, RadioField, SectionHeader } from './FormField';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

function FinancialTable({ title, rows, name, data, onChange, hasPartner }) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-gray-700">{title}</Label>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 pr-3 font-medium text-gray-600 w-1/3"></th>
              <th className="text-left py-2 px-2 font-medium text-gray-600">You</th>
              {hasPartner && <th className="text-left py-2 px-2 font-medium text-gray-600">Your partner</th>}
              <th className="text-left py-2 px-2 font-medium text-gray-600">Frequency</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.key} className="border-b border-gray-100">
                <td className="py-2 pr-3 text-gray-600">
                  {row.label}
                  {row.key === "home" && data[`${name}_home_you`] && (
                    <>
                      <span className="ml-1 text-gray-400">(current value)</span>
                      <div className="mt-1 text-xs text-amber-700 italic">*The client's name must be on the title of the property for it to be considered an asset</div>
                    </>
                  )}
                </td>
                <td className="py-2 px-1">
                  <Input
                    value={data[`${name}_${row.key}_you`] || ""}
                    onChange={e => onChange(`${name}_${row.key}_you`, e.target.value)}
                    className="h-8 text-sm border-gray-200"
                    placeholder="$"
                  />
                </td>
                {hasPartner && (
                  <td className="py-2 px-1">
                    <Input
                      value={data[`${name}_${row.key}_partner`] || ""}
                      onChange={e => onChange(`${name}_${row.key}_partner`, e.target.value)}
                      className="h-8 text-sm border-gray-200"
                      placeholder="$"
                    />
                  </td>
                )}
                <td className="py-2 px-1">
                                  <select
                                    value={data[`${name}_${row.key}_freq`] || ""}
                                    onChange={e => onChange(`${name}_${row.key}_freq`, e.target.value)}
                                    className="h-8 text-sm border border-gray-200 rounded-md px-2 w-full bg-white"
                                  >
                                    <option value=""></option>
                                    <option value="Weekly">Weekly</option>
                                    <option value="Fortnightly">Fortnightly</option>
                                    <option value="Monthly">Monthly</option>
                                    <option value="Yearly">Yearly</option>
                                  </select>
                                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const INCOME_ROWS = [
  { key: "pensions", label: "Pensions/benefits/allowances" },
  { key: "employment", label: "Income – employment" },
  { key: "business", label: "Business / self-employed" },
  { key: "child_support", label: "Child support" },
  { key: "other", label: "Other" },
  { key: "total", label: "Total income" },
];

const EXPENSE_ROWS = [
  { key: "tax", label: "Income tax" }, { key: "rent", label: "Rent" },
  { key: "mortgage", label: "Mortgage" }, { key: "board", label: "Board" },
  { key: "rates", label: "Rates" }, { key: "business_exp", label: "Business expenses" },
  { key: "childcare", label: "Child care" }, { key: "maintenance", label: "Child support / maintenance" },
  { key: "total", label: "Total expenses" },
];

const ASSET_ROWS = [
  { key: "home", label: "Home" }, { key: "home_mortgage", label: "Home mortgage (amount owed to the bank)" },
  { key: "real_estate", label: "Other real estate" }, { key: "other_mortgage", label: "Other mortgage" },
  { key: "farm", label: "Farm / business" }, { key: "farm_mortgage", label: "Farm / business mortgage" },
  { key: "vehicle", label: "Motor vehicle" }, { key: "vehicle_loan", label: "Motor vehicle loan" },
  { key: "cash", label: "Cash / savings" }, { key: "other_assets", label: "Other assets" },
  { key: "total", label: "Total assets" },
];

export default function Step5Finances({ data, onChange }) {
  const hasPartner = data.has_partner === "Yes";

  const dependants = data.dependants || [{}];

  const addDependant = () => {
    onChange("dependants", [...dependants, {}]);
  };

  const removeDependant = (idx) => {
    onChange("dependants", dependants.filter((_, i) => i !== idx));
  };

  const updateDependant = (idx, field, value) => {
    const updated = [...dependants];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange("dependants", updated);
  };

  return (
    <div className="space-y-8">
      {/* Section 13 */}
      <div>
        <SectionHeader number="13" title="Dependant details" />
        <div className="p-4 bg-blue-50 rounded-lg mb-5 text-sm text-gray-600">
          'Dependant' means a person who relies on you for financial support including children or elderly parents.
        </div>
        <div className="space-y-5">
          <RadioField label="Do any dependants live with you?" name="has_dependants" value={data.has_dependants} onChange={onChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
          {data.has_dependants === "Yes" && (
            <>
              {dependants.map((dep, idx) => (
                <div key={idx} className="p-4 border border-gray-200 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Dependant {idx + 1}</span>
                    {dependants.length > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => removeDependant(idx)} className="text-red-500 h-7">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">First name</Label>
                      <Input value={dep.first_name || ""} onChange={e => updateDependant(idx, "first_name", e.target.value)} className="h-9 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Last name</Label>
                      <Input value={dep.last_name || ""} onChange={e => updateDependant(idx, "last_name", e.target.value)} className="h-9 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Relationship to you</Label>
                      <Input value={dep.relationship || ""} onChange={e => updateDependant(idx, "relationship", e.target.value)} className="h-9 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Date of birth</Label>
                      <Input type="date" value={dep.dob || ""} onChange={e => updateDependant(idx, "dob", e.target.value)} className="h-9 text-sm" />
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addDependant} className="gap-2">
                <Plus className="w-3.5 h-3.5" /> Add dependant
              </Button>
              <RadioField label="Do you or your partner pay child support/maintenance?" name="pays_child_support" value={data.pays_child_support} onChange={onChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
              {data.pays_child_support === "Yes" && (
                <TextField label="How many children/maintenance dependants is the payment for?" name="child_support_count" value={data.child_support_count} onChange={onChange} />
              )}
            </>
          )}
        </div>
      </div>

      {/* Section 14 */}
            <div>
              <SectionHeader number="14" title="Your income (before tax)" />
              <FinancialTable title="" rows={INCOME_ROWS} name="income" data={data} onChange={onChange} hasPartner={hasPartner} />
              {data.income_employment_you && (
                <div className="mt-4 p-4 border border-amber-300 bg-amber-50 rounded-lg">
                  <p className="text-sm font-medium text-amber-800 mb-2">Please ensure one of the following is on file:</p>
                  <ul className="text-sm text-amber-800 space-y-1 list-decimal list-inside">
                    <li>3 months of pay slips, or</li>
                    <li>a letter from employer setting out their weekly pay</li>
                  </ul>
                </div>
              )}
              {data.income_business_you && (
                <div className="mt-4 p-4 border border-amber-300 bg-amber-50 rounded-lg">
                  <p className="text-sm font-medium text-amber-800 mb-2">Please ensure one of the following is on file:</p>
                  <ul className="text-sm text-amber-800 space-y-1 list-decimal list-inside">
                    <li>Latest tax return and profit and loss statement, or</li>
                    <li>Business activity statements (if business is less than 12 months old)</li>
                  </ul>
                </div>
              )}
              {data.income_other_you && (
                <div className="mt-4 p-4 border border-gray-200 rounded-lg space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Please advise the 'other' income type</Label>
                  <Input
                    value={data.income_other_type || ""}
                    onChange={e => onChange("income_other_type", e.target.value)}
                    className="h-9 text-sm border-gray-200"
                    placeholder="Enter income type..."
                  />
                </div>
              )}
            </div>

      {/* Section 15 */}
      <div>
        <SectionHeader number="15" title="Expenses" />
        <FinancialTable title="" rows={EXPENSE_ROWS} name="expense" data={data} onChange={onChange} hasPartner={hasPartner} />
        {EXPENSE_ROWS.filter(r => r.key !== "total").every(r => !data[`expense_${r.key}_you`]) && (
          <div className="mt-4 p-4 border border-amber-300 bg-amber-50 rounded-lg space-y-3">
            <p className="text-sm font-medium text-amber-800">Unless your client is homeless, a child or in custody please advise why there are no expenses to report</p>
            <textarea
              className="w-full border border-amber-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
              rows={3}
              placeholder="Please provide reason..."
              value={data.no_expenses_reason || ""}
              onChange={e => onChange("no_expenses_reason", e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Section 16 */}
      <div>
        <SectionHeader number="16" title="Assets" />
        <FinancialTable title="" rows={ASSET_ROWS} name="asset" data={data} onChange={onChange} hasPartner={hasPartner} />
        {(data.asset_home_you || data.asset_real_estate_you) && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            A property value has been entered. Please review the{" "}
            <a href="https://www.handbook.vla.vic.gov.au/contributions-policy" target="_blank" rel="noopener noreferrer" className="underline font-medium hover:text-blue-600">
              VLA Contributions Policy
            </a>.
          </div>
        )}
        <div className="space-y-5 mt-5">
          <div className="mb-4">
            <a href="https://www.handbook.vla.vic.gov.au/12-means-test" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800 underline">
              Please refer to VLA's means test guidelines for further information
            </a>
          </div>
          <RadioField label="If you are a homeowner:" name="is_homeowner" value={data.is_homeowner} onChange={onChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
          {data.is_homeowner === "Yes" && (
            <>
              <TextField label="What is the property address?" name="property_address" value={data.property_address} onChange={onChange} />
              <TextField label="What name(s) are on the property title?" name="property_names" value={data.property_names} onChange={onChange} />
            </>
          )}
          <RadioField label="Have any of your assets been seized, frozen or restrained by the police or the court?" name="assets_seized" value={data.assets_seized} onChange={onChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
          {data.assets_seized === "Yes" && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              Please review the{" "}
              <a href="https://www.handbook.vla.vic.gov.au/guideline-7-proceeds-crime-act-2002" target="_blank" rel="noopener noreferrer" className="underline font-medium hover:text-blue-600">
                VLA Guideline 7 – Proceeds of Crime Act 2002
              </a>.
            </div>
          )}
          
          <div className="mt-4">
            <Label className="text-sm font-medium text-gray-700 block mb-3">Business</Label>
            <p className="text-sm text-gray-500 mb-3">Are you or your partner:</p>
            <div className="space-y-3">
              <RadioField label="Self employed" name="biz_self_employed" value={data.biz_self_employed} onChange={onChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
              <RadioField label="A partner or director in a business or company" name="biz_director" value={data.biz_director} onChange={onChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
              <RadioField label="A shareholder in a private company" name="biz_shareholder" value={data.biz_shareholder} onChange={onChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
              <RadioField label="Receiving money from a trust" name="biz_trust" value={data.biz_trust} onChange={onChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
              <RadioField label="Receiving any other benefit from a business or company" name="biz_other_benefit" value={data.biz_other_benefit} onChange={onChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
              <TextField label="If yes to any of the above, please provide details" name="biz_details" value={data.biz_details} onChange={onChange} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
