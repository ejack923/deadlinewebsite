import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { getFeesForCourtType } from "./FeeData";

export default function FeeRowsTable({ courtType, counselRates, feeRows, onChange }) {
  const fees = getFeesForCourtType(courtType, counselRates);

  // Group fees by category
  const grouped = fees.reduce((acc, fee) => {
    if (!acc[fee.group]) acc[fee.group] = [];
    acc[fee.group].push(fee);
    return acc;
  }, {});

  // Ensure at least one row is always shown
  const rows = feeRows.length > 0 ? feeRows : [{ fee_type: "", quantity: 1, amount: 0, other_description: "" }];

  const addRow = () => {
    onChange([...rows, { fee_type: "", quantity: 1, amount: 0, other_description: "" }]);
  };

  const removeRow = (index) => {
    const updated = rows.filter((_, i) => i !== index);
    onChange(updated.length > 0 ? updated : []);
  };

  const updateRow = (index, field, value) => {
    const updated = rows.map((row, i) => {
      if (i !== index) return row;
      if (field === "fee_type") {
        // value is "GROUP|label", extract label for display and find amount
        const [, label] = value.split("|");
        const found = fees.find(f => `${f.group}|${f.label}` === value);
        return { ...row, fee_type: label || value, amount: found ? found.amount : 0, _fee_key: value };
      }
      return { ...row, [field]: value };
    });
    onChange(updated);
  };

  const total = rows.reduce((sum, row) => {
    const qty = parseFloat(row.quantity) || 1;
    const amt = parseFloat(row.amount) || 0;
    return sum + qty * amt;
  }, 0);

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left">
              <th className="pb-2 pr-3 font-medium text-slate-600 w-1/2">Fee Type</th>
              <th className="pb-2 pr-3 font-medium text-slate-600 w-20">Qty/Days/KMs</th>
              <th className="pb-2 pr-3 font-medium text-slate-600 w-28">Amount ($)</th>
              <th className="pb-2 font-medium text-slate-600 w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, index) => (
                <tr key={index}>
                <td className="py-2 pr-3">
                  {row.fee_type === "__OTHER__" ? (
                    <Input
                      placeholder="Describe fee..."
                      value={row.other_description || ""}
                      onChange={e => updateRow(index, "other_description", e.target.value)}
                      className="h-8 text-sm"
                    />
                  ) : (
                    <Select value={row._fee_key || row.fee_type} onValueChange={val => updateRow(index, "fee_type", val)}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Select fee type..." />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(grouped).map(([group, items]) => (
                          <div key={group}>
                            <div className="px-2 py-1 text-xs font-semibold text-slate-500 bg-slate-50">{group}</div>
                            {items.map(fee => (
                              <SelectItem key={`${fee.group}|${fee.label}`} value={`${fee.group}|${fee.label}`}>
                                {fee.label} — ${fee.amount}
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                        <div className="px-2 py-1 text-xs font-semibold text-slate-500 bg-slate-50">OTHER</div>
                        <SelectItem value="__OTHER__">Other (manual entry)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </td>
                <td className="py-2 pr-3">
                  <Input
                    type="number"
                    min="1"
                    value={row.quantity}
                    onChange={e => updateRow(index, "quantity", e.target.value)}
                    className="h-8 text-sm w-20"
                  />
                </td>
                <td className="py-2 pr-3">
                  <Input
                    type="number"
                    min="0"
                    value={row.amount}
                    onChange={e => updateRow(index, "amount", e.target.value)}
                    className="h-8 text-sm w-28"
                  />
                </td>
                <td className="py-2">
                  <button onClick={() => removeRow(index)} className="text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button type="button" variant="outline" size="sm" onClick={addRow} className="gap-2">
        <Plus className="w-4 h-4" /> Add Row
      </Button>

      {total > 0 && (
        <div className="flex justify-end pt-2 border-t border-slate-200">
          <span className="font-semibold text-slate-700">
            Total: ${total.toLocaleString("en-AU", { minimumFractionDigits: 2 })}
          </span>
        </div>
      )}
    </div>
  );
}
