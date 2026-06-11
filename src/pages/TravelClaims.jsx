// @ts-nocheck
import { useRef, useState } from "react";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Camera, Info, Paperclip, Plus, Printer, RotateCcw, Send, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const KM_RATE = 0.92;
const KM_VLA_RATE = 0.82;
const VLA_ACCOMMODATION_CAP = 394;
const ROAD_DISTANCE_FACTOR = 1.22;

const EMPLOYEE_OPTIONS = [
  "Ellen Murphy",
  "Britt Jeffs",
  "Ashlee McPhail",
  "Jaffa Withers",
  "Christine Callaghan",
  "Beray Uzunbay",
  "Lauren Campbell",
  "Mary Zaky",
  "Eliza Collister",
];

const EXPENSE_TYPE_OPTIONS = [
  "KM's",
  "Accommodation",
  "Taxis",
  "Parking",
  "Train",
  "Meals",
  "Flights",
  "Other",
];

function normalizeLocationText(value = "") {
  return value
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildCourtQueryVariants(query) {
  const variants = [];
  const cleaned = query.trim().replace(/\s+/g, " ");
  const placeOnly = cleaned
    .replace(/\bmagistrates'? courts?\b/gi, "")
    .replace(/\bcounty courts?\b/gi, "")
    .replace(/\bsupreme courts?\b/gi, "")
    .replace(/\bchildren'?s courts?\b/gi, "")
    .replace(/\bcoroners? courts?\b/gi, "")
    .replace(/\bof victoria\b/gi, "")
    .replace(/\blaw courts?\b/gi, "")
    .trim();

  if (/\b(magistrates'? courts?|county courts?|supreme courts?|children'?s courts?|law courts?)\b/i.test(cleaned) && placeOnly) {
    variants.push(`${placeOnly} law courts`);
    variants.push(`${placeOnly} courthouse`);
    variants.push(placeOnly);
  }

  if (/\bcourts?\b/i.test(cleaned) && !/\blaw courts?\b/i.test(cleaned) && placeOnly) {
    variants.push(`${placeOnly} law courts`);
    variants.push(placeOnly);
  }

  return variants;
}

function haversineKm(from, to) {
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(to.lat - from.lat);
  const dLon = toRad(to.lon - from.lon);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function calculateOneWayKm(from, to) {
  if (!from || !to || !from.lat || !from.lon || !to.lat || !to.lon) return 0;
  if (from.label === to.label) return 0;
  const oneWay = haversineKm(from, to) * ROAD_DISTANCE_FACTOR;
  return Math.round(oneWay * 10) / 10;
}

async function searchLocations(query) {
  const trimmedQuery = query.trim();
  const queryVariants = [
    trimmedQuery,
    ...buildCourtQueryVariants(trimmedQuery),
    normalizeLocationText(trimmedQuery),
    trimmedQuery.replace(/\blaw courts?\b/gi, "courthouse"),
    trimmedQuery.replace(/\blaw courts?\b/gi, "court"),
    trimmedQuery.replace(/\bmagistrates'? courts?\b/gi, "law courts"),
    trimmedQuery.replace(/\bcounty courts?\b/gi, "law courts"),
    trimmedQuery.replace(/\bsupreme courts?\b/gi, "law courts"),
  ].filter(Boolean);

  const results = [];
  const seen = new Set();

  for (const variant of queryVariants) {
    const response = await fetch(`/api/geocode?q=${encodeURIComponent(variant)}`);
    if (!response.ok) {
      continue;
    }

    const variantResults = await response.json();
    variantResults.forEach((result) => {
      if (!seen.has(result.label)) {
        seen.add(result.label);
        results.push(result);
      }
    });

    if (results.length >= 8) break;
  }

  return results.slice(0, 8);
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

function calculateOvernightStays(dateFrom, dateTo) {
  if (!dateFrom || !dateTo) return "";
  const start = new Date(`${dateFrom}T00:00:00`);
  const end = new Date(`${dateTo}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "";
  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? String(diffDays) : "0";
}

function buildEmptyExpense(index = 0) {
  return {
    id: `expense-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
    same_client_as_first: index === 0 ? "yes" : "",
    client_name: "",
    has_vla_funding: "",
    vla_reference: "",
    expense_type: "",
    expense_type_other: "",
    date: "",
    one_way_or_round_trip: "one_way",
    within_one_day: "",
    travel_date: "",
    from: "",
    from_location: null,
    from_on: "",
    to: "",
    to_location: null,
    to_on: "",
    accommodation_date_from: "",
    accommodation_date_to: "",
    overnight_stays: "",
    cost_per_night: "",
    amount: "",
    notes: "",
    receipts: [],
  };
}

const EMPTY_FORM = {
  employee_name: "",
  date_of_request: "",
  expenses: [buildEmptyExpense(0)],
  notes: "",
};

function getEffectiveClientName(expense, firstExpense) {
  return expense.same_client_as_first === "yes" ? firstExpense?.client_name || "" : expense.client_name;
}

function getEffectiveHasVla(expense, firstExpense) {
  return expense.same_client_as_first === "yes" ? firstExpense?.has_vla_funding || "" : expense.has_vla_funding;
}

function getEffectiveVlaReference(expense, firstExpense) {
  return expense.same_client_as_first === "yes" ? firstExpense?.vla_reference || "" : expense.vla_reference;
}

function getExpenseComputedValues(expense, firstExpense) {
  const effectiveHasVla = getEffectiveHasVla(expense, firstExpense);
  const oneWayKilometers = expense.expense_type === "KM's"
    ? calculateOneWayKm(expense.from_location, expense.to_location)
    : 0;
  const tripMultiplier = expense.one_way_or_round_trip === "round_trip" ? 2 : 1;
  const kilometers = oneWayKilometers * tripMultiplier;
  const payableAmount = expense.expense_type === "KM's" ? kilometers * KM_RATE : 0;
  const vlaKmAmount = expense.expense_type === "KM's" && effectiveHasVla === "yes" ? kilometers * KM_VLA_RATE : 0;
  const overnightStays = parseInt(expense.overnight_stays || "0", 10) || 0;
  const costPerNight = parseFloat(expense.cost_per_night) || 0;
  const accommodationTotal = expense.expense_type === "Accommodation" ? overnightStays * costPerNight : 0;
  const vlaAccommodationAmount =
    expense.expense_type === "Accommodation" && effectiveHasVla === "yes"
      ? overnightStays * VLA_ACCOMMODATION_CAP
      : 0;
  const manualAmount =
    expense.expense_type && !["KM's", "Accommodation"].includes(expense.expense_type)
      ? parseFloat(expense.amount) || 0
      : 0;
  const primaryAmount =
    expense.expense_type === "KM's"
      ? payableAmount
      : expense.expense_type === "Accommodation"
        ? accommodationTotal
        : manualAmount;

  return {
    effectiveHasVla,
    oneWayKilometers,
    kilometers,
    tripMultiplier,
    payableAmount,
    vlaKmAmount,
    overnightStays,
    costPerNight,
    accommodationTotal,
    vlaAccommodationAmount,
    primaryAmount,
  };
}

export default function TravelClaims() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendTo, setSendTo] = useState("ejackson@completelawsupport.com");
  const [uploadingId, setUploadingId] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState({});
  const [locationLoading, setLocationLoading] = useState({});
  const uploadInputRefs = useRef({});
  const photoInputRefs = useRef({});
  const geocodeTimeoutsRef = useRef({});
  const geocodeCacheRef = useRef(new Map());

  const firstExpense = form.expenses[0];

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const updateExpense = (id, field, value) => {
    setForm((current) => ({
      ...current,
      expenses: current.expenses.map((expense) => {
        if (expense.id !== id) return expense;
        const nextExpense = { ...expense, [field]: value };

        if (field === "expense_type") {
          if (value !== "Other") nextExpense.expense_type_other = "";
          if (value !== "KM's") {
            nextExpense.from = "";
            nextExpense.from_location = null;
            nextExpense.from_on = "";
            nextExpense.to = "";
            nextExpense.to_location = null;
            nextExpense.to_on = "";
            nextExpense.travel_date = "";
            nextExpense.within_one_day = "";
            nextExpense.one_way_or_round_trip = "one_way";
          }
          if (value !== "Accommodation") {
            nextExpense.accommodation_date_from = "";
            nextExpense.accommodation_date_to = "";
            nextExpense.overnight_stays = "";
            nextExpense.cost_per_night = "";
          }
          if (["KM's", "Accommodation"].includes(value)) {
            nextExpense.amount = "";
          }
        }

        if (field === "same_client_as_first" && value === "yes") {
          nextExpense.client_name = "";
          nextExpense.has_vla_funding = "";
          nextExpense.vla_reference = "";
        }

        if (field === "accommodation_date_from" || field === "accommodation_date_to") {
          nextExpense.overnight_stays = calculateOvernightStays(
            field === "accommodation_date_from" ? value : nextExpense.accommodation_date_from,
            field === "accommodation_date_to" ? value : nextExpense.accommodation_date_to,
          );
        }

        return nextExpense;
      }),
    }));
  };

  const addExpense = () => {
    setForm((current) => ({
      ...current,
      expenses: [...current.expenses, buildEmptyExpense(current.expenses.length)],
    }));
  };

  const queueLocationSearch = (expenseId, field, query) => {
    const key = `${expenseId}-${field}`;

    if (geocodeTimeoutsRef.current[key]) {
      clearTimeout(geocodeTimeoutsRef.current[key]);
    }

    if (!query || query.trim().length < 3) {
      setLocationSuggestions((current) => ({ ...current, [key]: [] }));
      setLocationLoading((current) => ({ ...current, [key]: false }));
      return;
    }

    geocodeTimeoutsRef.current[key] = setTimeout(async () => {
      const trimmedQuery = query.trim();
      const cacheKey = trimmedQuery.toLowerCase();

      if (geocodeCacheRef.current.has(cacheKey)) {
        setLocationSuggestions((current) => ({ ...current, [key]: geocodeCacheRef.current.get(cacheKey) }));
        return;
      }

      setLocationLoading((current) => ({ ...current, [key]: true }));
      try {
        const results = await searchLocations(trimmedQuery);
        geocodeCacheRef.current.set(cacheKey, results);
        setLocationSuggestions((current) => ({ ...current, [key]: results }));
      } catch {
        setLocationSuggestions((current) => ({ ...current, [key]: [] }));
      } finally {
        setLocationLoading((current) => ({ ...current, [key]: false }));
      }
    }, 150);
  };

  const handleLocationInput = (expenseId, field, value) => {
    const locationField = field === "from" ? "from_location" : "to_location";
    updateExpense(expenseId, field, value);
    updateExpense(expenseId, locationField, null);
    queueLocationSearch(expenseId, field, value);
  };

  const applyLocationSuggestion = (expenseId, field, suggestion) => {
    const locationField = field === "from" ? "from_location" : "to_location";
    updateExpense(expenseId, field, suggestion.label);
    updateExpense(expenseId, locationField, suggestion);
    setLocationSuggestions((current) => ({ ...current, [`${expenseId}-${field}`]: [] }));
  };

  const removeExpense = (id) => {
    setForm((current) => {
      if (current.expenses.length === 1) return current;
      return {
        ...current,
        expenses: current.expenses.filter((expense) => expense.id !== id),
      };
    });
  };

  const handleExpenseUpload = async (expenseId, files) => {
    const selectedFiles = Array.from(files || []);
    if (!selectedFiles.length) return;
    setUploadingId(expenseId);
    const uploaded = await Promise.all(
      selectedFiles.map(async (file) => {
        const result = await base44.integrations.Core.UploadFile({ file });
        return {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: file.name,
          url: result.file_url,
        };
      }),
    );

    setForm((current) => ({
      ...current,
      expenses: current.expenses.map((expense) =>
        expense.id === expenseId
          ? { ...expense, receipts: [...expense.receipts, ...uploaded] }
          : expense
      ),
    }));
    setUploadingId("");
  };

  const removeReceipt = (expenseId, receiptId) => {
    setForm((current) => ({
      ...current,
      expenses: current.expenses.map((expense) =>
        expense.id === expenseId
          ? { ...expense, receipts: expense.receipts.filter((receipt) => receipt.id !== receiptId) }
          : expense
      ),
    }));
  };

  const expenseSummaries = form.expenses.map((expense, index) => {
    const values = getExpenseComputedValues(expense, firstExpense);
    return {
      expense,
      index,
      values,
      clientName: getEffectiveClientName(expense, firstExpense),
      hasVla: getEffectiveHasVla(expense, firstExpense),
      vlaReference: getEffectiveVlaReference(expense, firstExpense),
    };
  });

  const grandTotal = expenseSummaries.reduce((sum, item) => sum + item.values.primaryAmount, 0);
  const vlaTotal = expenseSummaries.reduce(
    (sum, item) => sum + item.values.vlaKmAmount + item.values.vlaAccommodationAmount,
    0,
  );

  const handleSendEmail = async () => {
    setSending(true);

    const expenseLines = expenseSummaries
      .map(({ expense, values, clientName, hasVla, vlaReference }, index) => {
        const title = expense.expense_type === "Other" ? expense.expense_type_other || "Other" : expense.expense_type || "Expense";
        const base = [
          `Expense ${index + 1}: ${title}`,
          `Client: ${clientName || "Not entered"}`,
          `VLA funding: ${hasVla === "yes" ? "Yes" : "No"}`,
          ...(hasVla === "yes" && vlaReference ? [`VLA Reference: ${vlaReference}`] : []),
        ];

        if (expense.expense_type === "KM's") {
          base.push(`Travel within one day: ${expense.within_one_day === "yes" ? "Yes" : expense.within_one_day === "no" ? "No" : "Not entered"}`);
          if (expense.within_one_day === "yes") {
            base.push(`Date travelled: ${expense.travel_date || "Not entered"}`);
          } else if (expense.within_one_day === "no") {
            base.push(`From on: ${expense.from_on || "Not entered"}`);
            base.push(`To on: ${expense.to_on || "Not entered"}`);
          }
          base.push(`From: ${expense.from || "Not entered"}`);
          base.push(`To: ${expense.to || "Not entered"}`);
          base.push(`Trip type: ${expense.one_way_or_round_trip === "round_trip" ? "Round trip" : "One way"}`);
          base.push(`Kilometres: ${values.kilometers || 0}`);
          base.push(`Payable amount: ${formatMoney(values.payableAmount)}`);
          if (hasVla === "yes") {
            base.push(`Claimable amount from VLA: ${formatMoney(values.vlaKmAmount)}`);
          }
        } else if (expense.expense_type === "Accommodation") {
          base.push(`Date: ${expense.date || "Not entered"}`);
          base.push(`Date from: ${expense.accommodation_date_from || "Not entered"}`);
          base.push(`Date to: ${expense.accommodation_date_to || "Not entered"}`);
          base.push(`Overnight stays: ${values.overnightStays || 0}`);
          base.push(`Cost per night: ${formatMoney(values.costPerNight)}`);
          base.push(`Total accommodation cost: ${formatMoney(values.accommodationTotal)}`);
          if (hasVla === "yes") {
            base.push(`Claimable amount from VLA: ${formatMoney(values.vlaAccommodationAmount)}`);
          }
        } else {
          base.push(`Date: ${expense.date || "Not entered"}`);
          base.push(`Amount: ${formatMoney(values.primaryAmount)}`);
        }

        if (expense.notes) {
          base.push(`Notes: ${expense.notes}`);
        }

        if (expense.receipts.length) {
          base.push("Receipts:");
          expense.receipts.forEach((receipt) => base.push(`- ${receipt.name}: ${receipt.url}`));
        }

        return base.join("\n");
      })
      .join("\n\n");

    const body = `LACW TRAVEL AND EXPENSE CLAIM\n\nEmployee: ${form.employee_name || "Not entered"}\nDate of request: ${form.date_of_request || "Not entered"}\n\n${expenseLines}\n\nGrand total: ${formatMoney(grandTotal)}\n${vlaTotal ? `Potential VLA claim total: ${formatMoney(vlaTotal)}\n` : ""}${form.notes ? `\nAdditional notes:\n${form.notes}\n` : ""}`;

    await base44.integrations.Core.SendEmail({
      to: sendTo,
      subject: `Travel and Expense Claim - ${form.employee_name || "Staff"} (${form.date_of_request || new Date().toLocaleDateString("en-AU")})`,
      body,
    });

    setSending(false);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between print:hidden">
        <a href={createPageUrl("Home")} className="flex items-center gap-2 text-slate-600 hover:text-purple-600 transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Portal
        </a>
        <div className="text-center">
          <p className="font-semibold text-slate-800 text-sm">Travel and Expenses</p>
          <p className="text-xs text-slate-400">Law and Advocacy Centre for Women</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setForm({ ...EMPTY_FORM, expenses: [buildEmptyExpense(0)] })}
            className="gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </Button>
          <Button size="sm" onClick={() => window.print()} className="gap-1.5 bg-purple-600 hover:bg-purple-700">
            <Printer className="w-3.5 h-3.5" /> Print / Save PDF
          </Button>
        </div>
      </div>

      <div className="hidden print:block max-w-5xl mx-auto px-4 pt-6 pb-2">
        <div className="flex items-center justify-between border-b border-slate-300 pb-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Travel and Expenses</h1>
            <p className="text-sm text-slate-500">Law and Advocacy Centre for Women</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Travel and Expenses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="px-1 text-xs text-slate-500">
              Any km&apos;s travelled that is more than 40 kms from your usual place of business, or 80 kms round trip, can be claimed through a VLA grant.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Employee Name</Label>
                <Select value={form.employee_name} onValueChange={(value) => updateField("employee_name", value)}>
                  <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                  <SelectContent>
                    {EMPLOYEE_OPTIONS.map((name) => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date of Request</Label>
                <Input type="date" value={form.date_of_request} onChange={(e) => updateField("date_of_request", e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {expenseSummaries.map(({ expense, index, values }) => {
          const usingFirstClient = index > 0 && expense.same_client_as_first === "yes";
          const effectiveHasVla = getEffectiveHasVla(expense, firstExpense);
          const firstClientName = firstExpense?.client_name || "the first client";

          return (
            <Card key={expense.id} className="border-slate-200">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-lg">{`Expense Claim ${index + 1}`}</CardTitle>
                  {form.expenses.length > 1 && (
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500" onClick={() => removeExpense(expense.id)}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {index > 0 && (
                  <div className="space-y-2">
                    <Label>{`Is this claim for ${firstClientName}?`}</Label>
                    <Select value={expense.same_client_as_first} onValueChange={(value) => updateExpense(expense.id, "same_client_as_first", value)}>
                      <SelectTrigger><SelectValue placeholder="Select yes or no" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {(index === 0 || expense.same_client_as_first === "no") && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Client Name</Label>
                      <Input value={expense.client_name} onChange={(e) => updateExpense(expense.id, "client_name", e.target.value)} placeholder="Enter client name" />
                    </div>
                    <div className="space-y-2">
                      <Label>Is there VLA funding in place for this matter?</Label>
                      <Select value={expense.has_vla_funding} onValueChange={(value) => updateExpense(expense.id, "has_vla_funding", value)}>
                        <SelectTrigger><SelectValue placeholder="Select yes or no" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {expense.has_vla_funding === "yes" && (
                      <div className="space-y-2 md:col-span-2">
                        <Label>VLA Reference</Label>
                        <Input value={expense.vla_reference} onChange={(e) => updateExpense(expense.id, "vla_reference", e.target.value)} placeholder="Enter VLA reference" />
                      </div>
                    )}
                  </div>
                )}

                {usingFirstClient && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    This expense will use the first client name and VLA funding details already entered above.
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Expense Type</Label>
                    <Select value={expense.expense_type} onValueChange={(value) => updateExpense(expense.id, "expense_type", value)}>
                      <SelectTrigger><SelectValue placeholder="Select expense type" /></SelectTrigger>
                      <SelectContent>
                        {EXPENSE_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {expense.expense_type === "Other" && (
                  <div className="space-y-2">
                    <Label>Other Expense Type</Label>
                    <Input value={expense.expense_type_other} onChange={(e) => updateExpense(expense.id, "expense_type_other", e.target.value)} placeholder="Enter expense type" />
                  </div>
                )}

                {expense.expense_type === "KM's" && (
                  <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Travel Was Within One Day?</Label>
                        <Select value={expense.within_one_day} onValueChange={(value) => updateExpense(expense.id, "within_one_day", value)}>
                          <SelectTrigger><SelectValue placeholder="Select yes or no" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          One Way or Round Trip?
                          <span
                            className="inline-flex items-center text-slate-400"
                            title="If you have driven to multiple locations over multiple days please select this option to claim you expenses"
                          >
                            <Info className="w-4 h-4" />
                          </span>
                        </Label>
                        <Select value={expense.one_way_or_round_trip} onValueChange={(value) => updateExpense(expense.id, "one_way_or_round_trip", value)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="one_way">One way</SelectItem>
                            <SelectItem value="round_trip">Round trip</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {expense.within_one_day === "yes" && (
                      <div className="space-y-2">
                        <Label>Date Travelled</Label>
                        <Input type="date" value={expense.travel_date} onChange={(e) => updateExpense(expense.id, "travel_date", e.target.value)} />
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>From</Label>
                        <div className="relative">
                          <Input
                            value={expense.from}
                            onChange={(e) => handleLocationInput(expense.id, "from", e.target.value)}
                            placeholder="Start typing town, suburb, postcode or address"
                          />
                          {(locationSuggestions[`${expense.id}-from`]?.length > 0 || locationLoading[`${expense.id}-from`]) && (
                            <div className="absolute z-20 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg">
                              {locationLoading[`${expense.id}-from`] ? (
                                <div className="px-3 py-2 text-sm text-slate-500">Searching…</div>
                              ) : (
                                locationSuggestions[`${expense.id}-from`].map((suggestion) => (
                                  <button
                                    key={`${expense.id}-from-${suggestion.label}`}
                                    type="button"
                                    className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                                    onClick={() => applyLocationSuggestion(expense.id, "from", suggestion)}
                                  >
                                    {suggestion.label}
                                  </button>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>To</Label>
                        <div className="relative">
                          <Input
                            value={expense.to}
                            onChange={(e) => handleLocationInput(expense.id, "to", e.target.value)}
                            placeholder="Start typing town, suburb, postcode or address"
                          />
                          {(locationSuggestions[`${expense.id}-to`]?.length > 0 || locationLoading[`${expense.id}-to`]) && (
                            <div className="absolute z-20 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg">
                              {locationLoading[`${expense.id}-to`] ? (
                                <div className="px-3 py-2 text-sm text-slate-500">Searching…</div>
                              ) : (
                                locationSuggestions[`${expense.id}-to`].map((suggestion) => (
                                  <button
                                    key={`${expense.id}-to-${suggestion.label}`}
                                    type="button"
                                    className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                                    onClick={() => applyLocationSuggestion(expense.id, "to", suggestion)}
                                  >
                                    {suggestion.label}
                                  </button>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {expense.within_one_day === "no" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>From On</Label>
                          <Input type="date" value={expense.from_on} onChange={(e) => updateExpense(expense.id, "from_on", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>To On</Label>
                          <Input type="date" value={expense.to_on} onChange={(e) => updateExpense(expense.id, "to_on", e.target.value)} />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>KMs</Label>
                        <div className="flex h-10 items-center rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700">
                          {values.kilometers ? `${values.kilometers} km` : "Select from and to locations"}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Payable Amount</Label>
                        <div className="flex h-10 items-center rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900">
                          {values.kilometers ? formatMoney(values.payableAmount) : "—"}
                        </div>
                      </div>
                      {effectiveHasVla === "yes" && (
                        <div className="space-y-2">
                          <Label>Claimable Amount from VLA</Label>
                          <div className="flex h-10 items-center rounded-md border border-emerald-200 bg-emerald-50 px-3 text-sm font-semibold text-emerald-800">
                            {values.kilometers ? formatMoney(values.vlaKmAmount) : "—"}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {expense.expense_type === "Accommodation" && (
                  <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date From</Label>
                        <Input type="date" value={expense.accommodation_date_from} onChange={(e) => updateExpense(expense.id, "accommodation_date_from", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Date To</Label>
                        <Input type="date" value={expense.accommodation_date_to} onChange={(e) => updateExpense(expense.id, "accommodation_date_to", e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Number of Overnight Stays</Label>
                        <Input type="number" min="0" value={expense.overnight_stays} onChange={(e) => updateExpense(expense.id, "overnight_stays", e.target.value)} placeholder="0" />
                      </div>
                      <div className="space-y-2">
                        <Label>Cost per Night</Label>
                        <div className="flex items-center rounded-md border border-slate-200 bg-white">
                          <span className="px-3 text-sm text-slate-500">$</span>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={expense.cost_per_night}
                            onChange={(e) => updateExpense(expense.id, "cost_per_night", e.target.value)}
                            placeholder="0.00"
                            className="border-0 shadow-none focus-visible:ring-0"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Total Accommodation Cost</Label>
                        <div className="flex h-10 items-center rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900">
                          {formatMoney(values.accommodationTotal)}
                        </div>
                      </div>
                    </div>
                    {effectiveHasVla === "yes" && (
                      <div className="space-y-2">
                        <Label>Claimable Amount from VLA</Label>
                        <div className="flex h-10 items-center rounded-md border border-emerald-200 bg-emerald-50 px-3 text-sm font-semibold text-emerald-800">
                          {`${formatMoney(values.vlaAccommodationAmount)} (${values.overnightStays || 0} x ${formatMoney(VLA_ACCOMMODATION_CAP)})`}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {expense.expense_type && !["KM's", "Accommodation"].includes(expense.expense_type) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input type="date" value={expense.date} onChange={(e) => updateExpense(expense.id, "date", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Amount</Label>
                      <div className="flex items-center rounded-md border border-slate-200 bg-white">
                        <span className="px-3 text-sm text-slate-500">$</span>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={expense.amount}
                          onChange={(e) => updateExpense(expense.id, "amount", e.target.value)}
                          placeholder="0.00"
                          className="border-0 shadow-none focus-visible:ring-0"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Input value={expense.notes} onChange={(e) => updateExpense(expense.id, "notes", e.target.value)} placeholder="Add details if needed" />
                    </div>
                  </div>
                )}

                {expense.expense_type && ["KM's", "Accommodation"].includes(expense.expense_type) && (
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea value={expense.notes} onChange={(e) => updateExpense(expense.id, "notes", e.target.value)} placeholder="Add any extra details if needed" rows={2} />
                  </div>
                )}

                <div className="space-y-3 border-t border-slate-200 pt-4">
                  <Label>Receipts</Label>
                  <div className="flex flex-wrap gap-2">
                    <input
                      ref={(node) => {
                        uploadInputRefs.current[expense.id] = node;
                      }}
                      type="file"
                      accept="image/*,application/pdf"
                      multiple
                      className="hidden"
                      onChange={(e) => handleExpenseUpload(expense.id, e.target.files)}
                    />
                    <input
                      ref={(node) => {
                        photoInputRefs.current[expense.id] = node;
                      }}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => handleExpenseUpload(expense.id, e.target.files)}
                    />
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => uploadInputRefs.current[expense.id]?.click()} disabled={uploadingId === expense.id}>
                      <Paperclip className="w-4 h-4" />
                      {uploadingId === expense.id ? "Uploading..." : "Upload receipt"}
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => photoInputRefs.current[expense.id]?.click()} disabled={uploadingId === expense.id}>
                      <Camera className="w-4 h-4" />
                      {uploadingId === expense.id ? "Uploading..." : "Take photo"}
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500">On a mobile phone, `Take photo` will use your camera so you can photograph the receipt directly.</p>
                  {expense.receipts.length > 0 && (
                    <div className="space-y-2">
                      {expense.receipts.map((receipt) => (
                        <div key={receipt.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                          <a href={receipt.url} target="_blank" rel="noreferrer" className="truncate text-sm text-purple-700 hover:underline">
                            {receipt.name}
                          </a>
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500" onClick={() => removeReceipt(expense.id, receipt.id)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        <Button variant="outline" onClick={addExpense} className="gap-2">
          <Plus className="w-4 h-4" />
          Add another expense
        </Button>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-slate-100 p-4 space-y-2">
              {expenseSummaries.map(({ expense, index, values }) => {
                const typeLabel = expense.expense_type === "Other" ? expense.expense_type_other || "Other" : expense.expense_type || "Expense";
                return (
                  <div key={expense.id} className="flex justify-between text-sm">
                    <span className="text-slate-600">{`Expense ${index + 1} - ${typeLabel}`}</span>
                    <span className="font-semibold">{formatMoney(values.primaryAmount)}</span>
                  </div>
                );
              })}
              {vlaTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-700">Potential VLA claim total</span>
                  <span className="font-semibold text-emerald-800">{formatMoney(vlaTotal)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-300 pt-2 text-base font-bold">
                <span>Grand Total</span>
                <span className="text-purple-700">{formatMoney(grandTotal)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Additional Notes</Label>
              <Textarea value={form.notes} onChange={(e) => updateField("notes", e.target.value)} placeholder="Any overall notes..." rows={3} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 print:hidden">
          <CardHeader>
            <CardTitle className="text-lg">Submit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Send To</Label>
              <Input type="email" value={sendTo} onChange={(e) => setSendTo(e.target.value)} placeholder="recipient@example.com" />
            </div>
            <Button onClick={handleSendEmail} disabled={sending || sent || !sendTo || !form.employee_name} className="gap-2 bg-purple-600 hover:bg-purple-700">
              <Send className="w-4 h-4" />
              {sent ? "Sent!" : sending ? "Sending..." : "Email claim"}
            </Button>
            {!form.employee_name && <p className="text-xs text-slate-400">Select an employee name above before sending.</p>}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pb-8 print:hidden">
          <Button variant="outline" onClick={() => setForm({ ...EMPTY_FORM, expenses: [buildEmptyExpense(0)] })} className="gap-2">
            <RotateCcw className="w-4 h-4" /> Reset
          </Button>
          <Button onClick={() => window.print()} className="gap-2 bg-purple-600 hover:bg-purple-700">
            <Printer className="w-4 h-4" /> Print / Save PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
