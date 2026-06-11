import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { getAppealCostsCertificateFeeInfo, getAppearanceFeeInfo, getAppearanceTypesForCourt, getCircuitFeeInfo, getCmiaFeeInfo, getCounselCircuitFeeInfo, getCounselTrialFeeInfo, getCounselTypeOptions, getHourlyPreparationFeeInfo, getSoaFeeInfo } from "@/lib/vla-fees-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText, Printer, RotateCcw, ArrowLeft, Mail, Send } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createPageUrl } from "@/utils";
import { usePersistentForm } from "@/lib/usePersistentForm";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const EMPTY_FORM = {
  client_surname: "",
  client_first_name: "",
  case_id: "",
  court_name: "",
  court_name_other: "",
  location: "",
  regional_location: "",
  hearing_date: "",
  hearing_time: "",
  mildura_travel_type: "",
  flight_cost: "",
  travel_km: "",
  include_circuit_fee: false,
  include_accommodation_fee: false,
  appearance_type: "",
  appearance_type_other: "",
  appearance_fee_other: "",
  additional_appearances: [],
  include_hourly_rates: false,
  counsel_type: "n_a",
  matter_type: "",
  extra_matter_types: [],
  jail_conference: false,
  prosecutor: "",
  informant_name: "",
  vpn_number: "",
  prosecutor_other: "",
  local_council: "",
  counsel_name: "",
  counsel_email: "",
  counsel_phone: "",
  clerk: "",
  clerk_other: "",
  instructions: "",
  provide_aid_application: false,
  counsel_memo: "",
  counsel_memo_files: [],
  fee_review_decision: "",
  amended_appearance_type: "",
  amended_appearance_type_other: "",
  amended_appearance_fee_other: "",
  amended_travel_km: "",
  amended_additional_appearances: [],
  amendment_reason_type: "",
  amended_fee_reason: "",
  costs_orders_files: [],
  instructor_to_seek_order: false,
  attach_revised_backsheet: false,
  instructor_email: "",
  documents_attached: "",
  additional_notes: "",
  uploaded_files: [],
};

const LOCAL_COUNCILS = ["ALPINE SHIRE COUNCIL","ARARAT RURAL CITY COUNCIL","BALLARAT CITY COUNCIL","BANYULE CITY COUNCIL","BASS COAST SHIRE COUNCIL","BAW BAW SHIRE COUNCIL","BAYSIDE CITY COUNCIL","BENALLA RURAL CITY COUNCIL","BOROONDARA CITY COUNCIL","BOROUGH OF QUEENSCLIFFE COUNCIL","BRIMBANK CITY COUNCIL","BULOKE SHIRE COUNCIL","GREATER BENDIGO CITY COUNCIL","CAMPASPE SHIRE COUNCIL","CARDINIA SHIRE COUNCIL","CASEY CITY COUNCIL","CENTRAL GOLDFIELDS SHIRE COUNCIL","COLAC OTWAY SHIRE COUNCIL","CORANGAMITE SHIRE COUNCIL","DAREBIN CITY COUNCIL","GREATER DANDENONG CITY COUNCIL","EAST GIPPSLAND SHIRE COUNCIL","FRANKSTON CITY COUNCIL","GANNAWARRA SHIRE COUNCIL","GLEN EIRA CITY COUNCIL","GLENELG SHIRE COUNCIL","GOLDEN PLAINS SHIRE COUNCIL","GREATER GEELONG CITY COUNCIL","GREATER SHEPPARTON CITY COUNCIL","HEPBURN SHIRE COUNCIL","HINDMARSH SHIRE COUNCIL","HOBSONS BAY CITY COUNCIL","HORSHAM RURAL CITY COUNCIL","HUME CITY COUNCIL","INDIGO SHIRE COUNCIL","KINGSTON CITY COUNCIL","KNOX CITY COUNCIL","LATROBE CITY COUNCIL","LODDON SHIRE COUNCIL","MACEDON RANGES SHIRE COUNCIL","MANNINGHAM CITY COUNCIL","MANSFIELD SHIRE COUNCIL","MARIBYRNONG CITY COUNCIL","MAROONDAH CITY COUNCIL","MELBOURNE CITY COUNCIL","MELTON CITY COUNCIL","MERRI-BEK CITY COUNCIL","MILDURA RURAL CITY COUNCIL","MITCHELL SHIRE COUNCIL","MOIRA SHIRE COUNCIL","MONASH CITY COUNCIL","MOONEE VALLEY CITY COUNCIL","MOORABOOL SHIRE COUNCIL","MORNINGTON PENINSULA SHIRE COUNCIL","MOUNT ALEXANDER SHIRE COUNCIL","MOYNE SHIRE COUNCIL","MURRINDINDI SHIRE COUNCIL","NILLUMBIK SHIRE COUNCIL","NORTHERN GRAMPIANS SHIRE COUNCIL","PORT PHILLIP CITY COUNCIL","PYRENEES SHIRE COUNCIL","SOUTH GIPPSLAND SHIRE COUNCIL","SOUTHERN GRAMPIANS SHIRE COUNCIL","STONNINGTON CITY COUNCIL","STRATHBOGIE SHIRE COUNCIL","SURF COAST SHIRE COUNCIL","SWAN HILL RURAL CITY COUNCIL","TOWONG SHIRE COUNCIL","WANGARATTA RURAL CITY COUNCIL","WARRNAMBOOL CITY COUNCIL","WELLINGTON SHIRE COUNCIL","WEST WIMMERA SHIRE COUNCIL","WHITEHORSE CITY COUNCIL","WHITTLESEA CITY COUNCIL","WODONGA CITY COUNCIL","WYNDHAM CITY COUNCIL","YARRA CITY COUNCIL","YARRA RANGES SHIRE COUNCIL","YARRIAMBIACK SHIRE COUNCIL"];

const REGIONAL_LOCATIONS = ["Ararat","Bacchus Marsh","Bairnsdale","Ballarat","Benalla","Bendigo","Castlemaine","Cobram","Colac","Corryong","Dromana","Echuca","Edenhope","Geelong","Hamilton","Hopetoun","Horsham","Kerang","Korumburra","Kyneton","Latrobe Valley","Mansfield","Maryborough","Mildura","Myrtleford","Nhill","Omeo","Orbost","Ouyen","Portland","Robinvale","Sale","Seymour","Shepparton","St Arnaud","Stawell","Swan Hill","Wangaratta","Warrnambool","Wodonga","Wonthaggi"];

const CLERK_OPTIONS = [
  { value: "list_a_barristers", label: "List A Barristers", barristerFunction: "getListABarristers" },
  { value: "greens_list", label: "Greens List", barristerFunction: "getGreensListBarristers" },
  { value: "chapmans_list", label: "Chapman's List", barristerFunction: "getChapmansList" },
  { value: "devers_list", label: "Devers List", barristerFunction: "getDeversListBarristers" },
  { value: "foleys_list", label: "Foleys List", barristerFunction: "getFoleysListBarristers" },
  { value: "list_g_barristers", label: "List G Barristers", barristerFunction: "getListGBarristers" },
  { value: "lennons_list", label: "Lennons List", barristerFunction: "getLennonsListBarristers" },
  { value: "holmes_list", label: "Holmes List", barristerFunction: "getHolmesListBarristers" },
  { value: "meldrums_list", label: "Meldrums List", barristerFunction: "getMeldrumsListBarristers" },
  { value: "parnells_list", label: "Parnells Barristers", barristerFunction: "getParnellsBarristers" },
  { value: "svensons_list", label: "Svenson Barristers", barristerFunction: "getSvensonsBarristers" },
  { value: "pattersons_list", label: "Pattersons List" },
  { value: "youngs_list", label: "Youngs List" },
  { value: "agency_brief", label: "Agency Brief" },
  { value: "other", label: "Other" },
];

const CLERK_CONFIG = Object.fromEntries(
  CLERK_OPTIONS.map((option) => [option.value, option]),
);

const KM_RATE = 0.83;
const KM_OFFSET = 80;
const ROAD_DISTANCE_FACTOR = 1.22;
const APP_ENV = typeof import.meta !== "undefined" && import.meta.env ? import.meta.env : {};
const IS_REMOTE_EMAIL_MODE = APP_ENV.VITE_APP_INTEGRATION_MODE === "remote" && Boolean(APP_ENV.VITE_APP_API_BASE_URL);
const MONEY_FORMATTER = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const AMENDMENT_REASON_OPTIONS = [
  { value: "costs_granted", label: "Costs granted" },
  { value: "different_appearance", label: "Matter proceeded to a different appearance type" },
  { value: "other", label: "Other" },
];
const BACKSHEET_STORAGE_KEY = "lacw_backsheet_to_counsel_form";

function getDefaultAttachmentLabel(fileName = "") {
  return fileName.replace(/\.[^/.]+$/, "");
}

const TRAVEL_LOCATION_OPTIONS = [
  "Carlton",
  "Broadmeadows",
  "Dandenong",
  "Frankston",
  "Heidelberg",
  "Melbourne",
  "Moorabbin Justice Centre",
  "Neighbourhood Justice Centre",
  "Ringwood",
  "Sunshine",
  "Werribee",
  ...REGIONAL_LOCATIONS,
];

const TRAVEL_LOCATION_COORDS = {
  Carlton: { lat: -37.8033, lon: 144.9652 },
  Broadmeadows: { lat: -37.6807, lon: 144.9180 },
  Dandenong: { lat: -37.9870, lon: 145.2143 },
  Frankston: { lat: -38.1445, lon: 145.1229 },
  Heidelberg: { lat: -37.7563, lon: 145.0606 },
  Melbourne: { lat: -37.8136, lon: 144.9631 },
  "Moorabbin Justice Centre": { lat: -37.9401, lon: 145.0531 },
  "Neighbourhood Justice Centre": { lat: -37.8077, lon: 144.9917 },
  Ringwood: { lat: -37.8150, lon: 145.2291 },
  Sunshine: { lat: -37.7833, lon: 144.8333 },
  Werribee: { lat: -37.9006, lon: 144.6605 },
  Ararat: { lat: -37.2854, lon: 142.9273 },
  "Bacchus Marsh": { lat: -37.6757, lon: 144.4382 },
  Bairnsdale: { lat: -37.8229, lon: 147.6104 },
  Ballarat: { lat: -37.5622, lon: 143.8503 },
  Benalla: { lat: -36.5511, lon: 145.9840 },
  Bendigo: { lat: -36.7570, lon: 144.2794 },
  Castlemaine: { lat: -37.0671, lon: 144.2168 },
  Cobram: { lat: -35.9207, lon: 145.6409 },
  Colac: { lat: -38.3390, lon: 143.5848 },
  Corryong: { lat: -36.1961, lon: 147.9027 },
  Dromana: { lat: -38.3338, lon: 144.9645 },
  Echuca: { lat: -36.1290, lon: 144.7481 },
  Edenhope: { lat: -37.0360, lon: 141.2951 },
  Geelong: { lat: -38.1499, lon: 144.3617 },
  Hamilton: { lat: -37.7444, lon: 142.0220 },
  Hopetoun: { lat: -35.7280, lon: 142.3643 },
  Horsham: { lat: -36.7113, lon: 142.1998 },
  Kerang: { lat: -35.7345, lon: 143.9200 },
  Korumburra: { lat: -38.4310, lon: 145.8230 },
  Kyneton: { lat: -37.2444, lon: 144.4518 },
  "Latrobe Valley": { lat: -38.2361, lon: 146.3916 },
  Mansfield: { lat: -37.0529, lon: 146.0874 },
  Maryborough: { lat: -37.0456, lon: 143.7392 },
  Mildura: { lat: -34.2081, lon: 142.1246 },
  Myrtleford: { lat: -36.5612, lon: 146.7231 },
  Nhill: { lat: -36.3333, lon: 141.6500 },
  Omeo: { lat: -37.0990, lon: 147.5952 },
  Orbost: { lat: -37.7004, lon: 148.4600 },
  Ouyen: { lat: -35.0739, lon: 142.3189 },
  Portland: { lat: -38.3462, lon: 141.6041 },
  Robinvale: { lat: -34.5836, lon: 142.7723 },
  Sale: { lat: -38.1081, lon: 147.0660 },
  Seymour: { lat: -37.0269, lon: 145.1333 },
  Shepparton: { lat: -36.3805, lon: 145.3990 },
  "St Arnaud": { lat: -36.6161, lon: 143.2552 },
  Stawell: { lat: -37.0563, lon: 142.7802 },
  "Swan Hill": { lat: -35.3378, lon: 143.5544 },
  Wangaratta: { lat: -36.3583, lon: 146.3126 },
  Warrnambool: { lat: -38.3818, lon: 142.4870 },
  Wodonga: { lat: -36.1241, lon: 146.8818 },
  Wonthaggi: { lat: -38.6056, lon: 145.5931 },
};

function getCourtDestinationLabel(courtName, location, regionalLocation) {
  const venue = location === "Regional Location" ? regionalLocation : location;
  if (!venue) return "";
  return [venue, courtName, "Victoria"].filter(Boolean).join(", ");
}

function getTravelLocationKey(location, regionalLocation) {
  return location === "Regional Location" ? regionalLocation : location;
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

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      resolve(result.includes(",") ? result.split(",")[1] : result);
    };
    reader.onerror = () => reject(reader.error || new Error("Failed to read PDF blob"));
    reader.readAsDataURL(blob);
  });
}

export default function BacksheetToCounsel() {
  const printLayoutRef = useRef(null);
  const { form: formData, setForm: setFormData, resetForm } = usePersistentForm(BACKSHEET_STORAGE_KEY, EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [showJailAlert, setShowJailAlert] = useState(false);
  const [showMilduraAlert, setShowMilduraAlert] = useState(false);
  const [showMilduraTravelDialog, setShowMilduraTravelDialog] = useState(false);
  const [barristerMap, setBarristerMap] = useState({});
  const [fallbackContactMap, setFallbackContactMap] = useState({});
  const [loadingBarristers, setLoadingBarristers] = useState(false);
  const [showTravelCalculator, setShowTravelCalculator] = useState(false);
  const [travelCalculatorTarget, setTravelCalculatorTarget] = useState("initial");
  const [travelFrom, setTravelFrom] = useState("");
  const [travelRawKm, setTravelRawKm] = useState("");
  const [travelLookupError, setTravelLookupError] = useState("");
  const [calculatingTravel, setCalculatingTravel] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showEmailSentAlert, setShowEmailSentAlert] = useState(false);
  const [emailSentMessage, setEmailSentMessage] = useState("Your backsheet has been sent to counsel.");
  const [memoUploading, setMemoUploading] = useState(false);
  const [showCounselMemoSection, setShowCounselMemoSection] = useState(false);
  const [revisedBacksheetSending, setRevisedBacksheetSending] = useState(false);
  const [emailDraft, setEmailDraft] = useState({
    to: "",
    cc: "",
    subject: "",
    body: "",
    attachments: [],
  });
  const selectedClerkConfig = CLERK_CONFIG[formData.clerk];
  const isCounselMemoOnlyView = new URLSearchParams(window.location.search).get("view") === "counsel-memo"
    || window.location.hash === "#memo-from-counsel";

  useEffect(() => {
    if (isCounselMemoOnlyView) {
      setShowCounselMemoSection(true);
    }
  }, [isCounselMemoOnlyView]);

  useEffect(() => {
    const clerk = formData.clerk;
    const barristerFunction = selectedClerkConfig?.barristerFunction;
    if (!clerk || !barristerFunction || barristerMap[clerk]) return;

    setLoadingBarristers(true);
    base44.functions.invoke(barristerFunction, {})
      .then(res => {
        setBarristerMap(m => ({ ...m, [clerk]: res.data.barristers || [] }));
        setFallbackContactMap(m => ({ ...m, [clerk]: res.data.fallbackContact || null }));
      })
      .catch(() => {
        setBarristerMap(m => ({ ...m, [clerk]: [] }));
        setFallbackContactMap(m => ({ ...m, [clerk]: null }));
      })
      .finally(() => setLoadingBarristers(false));
  }, [formData.clerk, selectedClerkConfig, barristerMap]);

  const updateField = (field, value) => setFormData(f => ({ ...f, [field]: value }));
  const addAdditionalAppearance = () => {
    setFormData((f) => ({
      ...f,
      additional_appearances: [
        ...f.additional_appearances,
        { id: crypto.randomUUID(), appearance: "", appearance_other: "", fee: "" },
      ],
    }));
  };
  const updateAdditionalAppearance = (id, field, value) => {
    setFormData((f) => ({
      ...f,
      additional_appearances: f.additional_appearances.map((item) => (
        item.id === id ? { ...item, [field]: value } : item
      )),
    }));
  };
  const removeAdditionalAppearance = (id) => {
    setFormData((f) => ({
      ...f,
      additional_appearances: f.additional_appearances.filter((item) => item.id !== id),
    }));
  };
  const addAmendedAppearance = () => {
    setFormData((f) => ({
      ...f,
      amended_additional_appearances: [
        ...f.amended_additional_appearances,
        { id: crypto.randomUUID(), appearance: "", appearance_other: "", fee: "" },
      ],
    }));
  };
  const updateAmendedAppearance = (id, field, value) => {
    setFormData((f) => ({
      ...f,
      amended_additional_appearances: f.amended_additional_appearances.map((item) => (
        item.id === id ? { ...item, [field]: value } : item
      )),
    }));
  };
  const removeAmendedAppearance = (id) => {
    setFormData((f) => ({
      ...f,
      amended_additional_appearances: f.amended_additional_appearances.filter((item) => item.id !== id),
    }));
  };
  const clearCounselFields = () => {
    updateField("counsel_name", "");
    updateField("counsel_email", "");
    updateField("counsel_phone", "");
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    const results = await Promise.all(files.map(file => base44.integrations.Core.UploadFile({ file })));
    const newFiles = results.map((r, i) => ({
      name: files[i].name,
      display_name: getDefaultAttachmentLabel(files[i].name),
      url: r.file_url,
    }));
    setFormData(f => ({ ...f, uploaded_files: [...f.uploaded_files, ...newFiles] }));
    setUploading(false);
    e.target.value = "";
  };

  const removeFile = (index) => {
    setFormData(f => ({ ...f, uploaded_files: f.uploaded_files.filter((_, i) => i !== index) }));
  };
  const updateUploadedFileLabel = (index, value) => {
    setFormData((f) => ({
      ...f,
      uploaded_files: f.uploaded_files.map((file, fileIndex) => (
        fileIndex === index ? { ...file, display_name: value } : file
      )),
    }));
  };
  const handleCounselMemoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setMemoUploading(true);
    const results = await Promise.all(files.map((file) => base44.integrations.Core.UploadFile({ file })));
    const newFiles = results.map((result, index) => ({
      name: files[index].name,
      display_name: getDefaultAttachmentLabel(files[index].name),
      url: result.file_url,
    }));
    setFormData((f) => ({ ...f, counsel_memo_files: [...f.counsel_memo_files, ...newFiles] }));
    setMemoUploading(false);
    e.target.value = "";
  };
  const removeCounselMemoFile = (index) => {
    setFormData((f) => ({
      ...f,
      counsel_memo_files: f.counsel_memo_files.filter((_, fileIndex) => fileIndex !== index),
    }));
  };
  const updateCounselMemoFileLabel = (index, value) => {
    setFormData((f) => ({
      ...f,
      counsel_memo_files: f.counsel_memo_files.map((file, fileIndex) => (
        fileIndex === index ? { ...file, display_name: value } : file
      )),
    }));
  };
  const handleCostsOrderUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setMemoUploading(true);
    const results = await Promise.all(files.map((file) => base44.integrations.Core.UploadFile({ file })));
    const newFiles = results.map((result, index) => ({
      name: files[index].name,
      display_name: getDefaultAttachmentLabel(files[index].name),
      url: result.file_url,
    }));
    setFormData((f) => ({ ...f, costs_orders_files: [...f.costs_orders_files, ...newFiles] }));
    setMemoUploading(false);
    e.target.value = "";
  };
  const removeCostsOrderFile = (index) => {
    setFormData((f) => ({
      ...f,
      costs_orders_files: f.costs_orders_files.filter((_, fileIndex) => fileIndex !== index),
    }));
  };
  const updateCostsOrderFileLabel = (index, value) => {
    setFormData((f) => ({
      ...f,
      costs_orders_files: f.costs_orders_files.map((file, fileIndex) => (
        fileIndex === index ? { ...file, display_name: value } : file
      )),
    }));
  };

  const handleCounselSelect = (name) => {
    updateField("counsel_name", name);
    const clerk = formData.clerk;
    const barristers = barristerMap[clerk] || [];
    const barrister = barristers.find(b => b.name === name);
    const fallbackContact = fallbackContactMap[clerk] || {};
    updateField("counsel_email", barrister?.email || fallbackContact.email || "");
    updateField("counsel_phone", barrister?.phone || fallbackContact.phone || "");
  };

  const today = new Date().toLocaleDateString("en-AU", { day: "2-digit", month: "long", year: "numeric" });
  const formattedHearingDate = formData.hearing_date
    ? new Date(`${formData.hearing_date}T00:00:00`).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    : "";
  const currentBarristers = barristerMap[formData.clerk] || [];
  const isAutoFillClerk = Boolean(selectedClerkConfig?.barristerFunction);
  const selectedCourtName = formData.court_name === "Other" ? formData.court_name_other : formData.court_name;
  const selectedAppearanceType = formData.appearance_type === "Other" ? formData.appearance_type_other : formData.appearance_type;
  const selectedClerkLabel = formData.clerk === "other"
    ? formData.clerk_other
    : selectedClerkConfig?.label || formData.clerk;
  const feeLookupCourt = formData.court_name === "Other" ? "" : formData.court_name;
  const feeLookupAppearanceType = formData.appearance_type === "Other" ? "" : formData.appearance_type;
  const buildAppearanceFeeSummaryRows = (appearanceValue, appearanceOther = "", manualFeeValue = "") => {
    const resolvedAppearance = appearanceValue === "Other" ? appearanceOther : appearanceValue;
    const lookupAppearance = appearanceValue === "Other" ? "" : appearanceValue;
    const manualFee = Number(manualFeeValue);
    const hasManualFee = Number.isFinite(manualFee) && manualFee > 0;
    const baseAppearanceFeeInfo = getAppearanceFeeInfo(feeLookupCourt, lookupAppearance);
    const baseAppealCostsCertificateFeeInfo = getAppealCostsCertificateFeeInfo(feeLookupCourt, lookupAppearance);
    const baseCounselTrialFeeInfo = getCounselTrialFeeInfo(feeLookupCourt, lookupAppearance);
    const baseCircuitFeeInfo = getCircuitFeeInfo(feeLookupCourt, lookupAppearance, formData.regional_location);
    const baseCounselCircuitFeeInfo = getCounselCircuitFeeInfo(feeLookupCourt, lookupAppearance, formData.regional_location);
    const baseSelectedCounselFee = baseCounselTrialFeeInfo?.roleFees.find((item) => item.role === formData.counsel_type) || null;
    const baseShowVlaFee = Boolean(baseAppearanceFeeInfo) && !baseSelectedCounselFee;

    return [
      baseSelectedCounselFee ? { label: `${formData.counsel_type} counsel fee`, amount: baseSelectedCounselFee.amountLabel } : null,
      appearanceValue === "Other" && hasManualFee
        ? { label: resolvedAppearance || "Fee", amount: MONEY_FORMATTER.format(manualFee) }
        : null,
      baseShowVlaFee ? { label: baseAppearanceFeeInfo.feeType, amount: baseAppearanceFeeInfo.amountLabel } : null,
      baseAppealCostsCertificateFeeInfo ? { label: "Appeal Costs Certificate fee*", amount: baseAppealCostsCertificateFeeInfo.amountLabel } : null,
      ...(formData.include_circuit_fee
        ? [
          ...(baseCounselCircuitFeeInfo ? [{ label: "Counsel circuit fee", amount: baseCounselCircuitFeeInfo.circuitFee }] : []),
          ...(baseCircuitFeeInfo
            ? baseCircuitFeeInfo.feeItems
              .filter((feeItem) => feeItem.label !== "Overnight fee")
              .map((feeItem) => ({
                label: `${baseCircuitFeeInfo.feeType} - ${feeItem.label}`,
                amount: feeItem.amountLabel,
              }))
            : []),
        ]
        : []),
      ...(formData.include_accommodation_fee
        ? [
          ...(baseCounselCircuitFeeInfo ? [{ label: "Counsel circuit overnight fee", amount: baseCounselCircuitFeeInfo.overnightFee }] : []),
          ...(baseCircuitFeeInfo
            ? baseCircuitFeeInfo.feeItems
              .filter((feeItem) => feeItem.label === "Overnight fee")
              .map((feeItem) => ({
                label: `${baseCircuitFeeInfo.feeType} - ${feeItem.label}`,
                amount: feeItem.amountLabel,
              }))
            : []),
        ]
        : []),
    ].filter(Boolean);
  };
  const appearanceFeeInfo = getAppearanceFeeInfo(feeLookupCourt, feeLookupAppearanceType);
  const appealCostsCertificateFeeInfo = getAppealCostsCertificateFeeInfo(feeLookupCourt, feeLookupAppearanceType);
  const counselTrialFeeInfo = getCounselTrialFeeInfo(feeLookupCourt, feeLookupAppearanceType);
  const circuitFeeInfo = getCircuitFeeInfo(feeLookupCourt, feeLookupAppearanceType, formData.regional_location);
  const counselCircuitFeeInfo = getCounselCircuitFeeInfo(feeLookupCourt, feeLookupAppearanceType, formData.regional_location);
  const hourlyPreparationFeeInfo = getHourlyPreparationFeeInfo(feeLookupCourt, feeLookupAppearanceType);
  const cmiaFeeInfo = getCmiaFeeInfo(feeLookupCourt, feeLookupAppearanceType);
  const soaFeeInfo = getSoaFeeInfo(feeLookupCourt, feeLookupAppearanceType);
  const selectedCounselFee = counselTrialFeeInfo?.roleFees.find((item) => item.role === formData.counsel_type) || null;
  const showVlaFee = Boolean(appearanceFeeInfo) && !selectedCounselFee;
  const manualAppearanceFee = Number(formData.appearance_fee_other);
  const hasManualAppearanceFee = Number.isFinite(manualAppearanceFee) && manualAppearanceFee > 0;
  const manualAppearanceFeeAmount = hasManualAppearanceFee ? MONEY_FORMATTER.format(manualAppearanceFee) : "";
  const additionalAppearanceRows = formData.additional_appearances.flatMap((item) => {
    const appearanceLabel = item.appearance === "Other" ? item.appearance_other : item.appearance;
    if (!appearanceLabel) return [];
    return buildAppearanceFeeSummaryRows(item.appearance, item.appearance_other, item.fee)
      .map((row) => ({ label: `${appearanceLabel} - ${row.label}`, amount: row.amount }));
  });
  const amendedAppearanceType = formData.amended_appearance_type === "Other"
    ? formData.amended_appearance_type_other
    : formData.amended_appearance_type;
  const amendmentReasonLabel = AMENDMENT_REASON_OPTIONS.find((option) => option.value === formData.amendment_reason_type)?.label || "";
  const standardCircuitRows = circuitFeeInfo
    ? circuitFeeInfo.feeItems
      .filter((item) => item.label !== "Overnight fee")
      .map((item) => ({ label: item.label, amount: item.amountLabel }))
    : [];
  const accommodationRows = [
    ...(circuitFeeInfo
      ? circuitFeeInfo.feeItems
        .filter((item) => item.label === "Overnight fee")
        .map((item) => ({ label: item.label, amount: item.amountLabel }))
      : []),
    ...(counselCircuitFeeInfo ? [{ label: "Counsel circuit overnight fee", amount: counselCircuitFeeInfo.overnightFee }] : []),
  ];
  const selectedCircuitRows = formData.include_circuit_fee
    ? [
      ...(counselCircuitFeeInfo ? [{ label: "Counsel circuit fee", amount: counselCircuitFeeInfo.circuitFee }] : []),
      ...standardCircuitRows,
    ]
    : [];
  const selectedAccommodationRows = formData.include_accommodation_fee ? accommodationRows : [];
  const amendedFeeRows = formData.fee_review_decision === "amend"
    ? formData.amendment_reason_type === "costs_granted"
      ? [
        ...(appealCostsCertificateFeeInfo ? [{ label: "Appeal Costs Certificate fee*", amount: appealCostsCertificateFeeInfo.amountLabel }] : []),
        ...(isKmTravelMatter && hasAmendedTravelKm ? [{ label: `Travel (${amendedTravelKm} km @ $0.83/km)`, amount: amendedTravelKmAmount }] : []),
        ...(formData.jail_conference ? [{ label: "Jail conference fee", amount: MONEY_FORMATTER.format(185) }] : []),
        ...selectedCircuitRows,
        ...selectedAccommodationRows,
      ]
      : [
        ...buildAppearanceFeeSummaryRows(
          formData.amended_appearance_type,
          formData.amended_appearance_type_other,
          formData.amended_appearance_fee_other,
        ),
        ...(isKmTravelMatter && hasAmendedTravelKm ? [{ label: `Travel (${amendedTravelKm} km @ $0.83/km)`, amount: amendedTravelKmAmount }] : []),
        ...(formData.jail_conference ? [{ label: "Jail conference fee", amount: MONEY_FORMATTER.format(185) }] : []),
        ...selectedCircuitRows,
        ...selectedAccommodationRows,
        ...formData.amended_additional_appearances.flatMap((item) => {
          const appearanceLabel = item.appearance === "Other" ? item.appearance_other : item.appearance;
          if (!appearanceLabel) return [];
          return buildAppearanceFeeSummaryRows(item.appearance, item.appearance_other, item.fee)
            .map((row) => ({ label: `${appearanceLabel} - ${row.label}`, amount: row.amount }));
        }),
      ]
    : [];
  const canSendRevisedBacksheet = Boolean(
    formData.instructor_email
    && (
      (formData.amendment_reason_type === "costs_granted" && (formData.costs_orders_files.length > 0 || formData.instructor_to_seek_order))
      || (formData.amendment_reason_type === "different_appearance" && amendedFeeRows.length > 0)
      || (formData.amendment_reason_type === "other" && formData.amended_fee_reason.trim() && amendedFeeRows.length > 0)
    )
  );
  const venueLabel = formData.location === "Regional Location" ? formData.regional_location : formData.location;
  const applicantName = [formData.client_first_name, formData.client_surname].filter(Boolean).join(" ");
  const informantEmail = formData.vpn_number ? `vp${String(formData.vpn_number).replace(/\D/g, "")}@police.vic.gov.au` : "";
  const legalAidFormLink = `${window.location.origin}${createPageUrl("LegalAidForm")}`;
  const instructionsBlock = [
    formData.instructions,
    formData.provide_aid_application ? `Legal Aid application: ${legalAidFormLink}` : "",
  ].filter(Boolean).join("\n\n");
  const contraLabel = formData.prosecutor === "VICTORIA POLICE"
    ? (formData.informant_name || formData.prosecutor)
    : formData.prosecutor === "LOCAL COUNCIL"
    ? formData.local_council
    : formData.prosecutor === "OTHER"
      ? formData.prosecutor_other
      : formData.prosecutor;
  const matterHeading = selectedAppearanceType
    ? `BRIEF TO APPEAR FOR DEFENDANT ON ${selectedAppearanceType.toUpperCase()}`
    : "BRIEF TO APPEAR";
  const courtDestinationLabel = getCourtDestinationLabel(selectedCourtName, formData.location, formData.regional_location);
  const travelKm = Number(formData.travel_km);
  const hasTravelKm = Number.isFinite(travelKm) && travelKm > 0;
  const travelKmAmount = hasTravelKm
    ? MONEY_FORMATTER.format(travelKm * KM_RATE)
    : "";
  const amendedTravelKm = Number(formData.amended_travel_km);
  const hasAmendedTravelKm = Number.isFinite(amendedTravelKm) && amendedTravelKm > 0;
  const amendedTravelKmAmount = hasAmendedTravelKm
    ? MONEY_FORMATTER.format(amendedTravelKm * KM_RATE)
    : "";
  const flightCost = Number(formData.flight_cost);
  const hasFlightCost = Number.isFinite(flightCost) && flightCost > 0;
  const flightCostAmount = hasFlightCost ? MONEY_FORMATTER.format(flightCost) : "";
  const isKmTravelMatter = formData.location === "Regional Location"
    && !(formData.regional_location === "Mildura" && formData.mildura_travel_type === "flights");
  const feeRows = [
    selectedCounselFee ? { label: "Counsel fee", amount: selectedCounselFee.amountLabel } : null,
    formData.appearance_type === "Other" && hasManualAppearanceFee
      ? { label: selectedAppearanceType || "Fee", amount: manualAppearanceFeeAmount }
      : null,
    showVlaFee ? { label: appearanceFeeInfo.feeType, amount: appearanceFeeInfo.amountLabel } : null,
    appealCostsCertificateFeeInfo ? { label: "Appeal Costs Certificate fee*", amount: appealCostsCertificateFeeInfo.amountLabel } : null,
    isKmTravelMatter && hasTravelKm ? { label: `Travel (${travelKm} km @ $0.83/km)`, amount: travelKmAmount } : null,
    formData.mildura_travel_type === "flights" && hasFlightCost ? { label: "Flights", amount: flightCostAmount } : null,
    formData.jail_conference ? { label: "Jail conference fee", amount: MONEY_FORMATTER.format(185) } : null,
    ...selectedCircuitRows,
    ...selectedAccommodationRows,
    ...additionalAppearanceRows,
  ].filter(Boolean);
  const activeFeeRows = formData.fee_review_decision === "amend" && amendedFeeRows.length > 0
    ? amendedFeeRows
    : feeRows;
  const initialFeeRows = feeRows;
  const feeSummaryRows = [
    selectedCounselFee ? { label: `${formData.counsel_type} counsel fee`, amount: selectedCounselFee.amountLabel } : null,
    showVlaFee ? { label: appearanceFeeInfo.feeType, amount: appearanceFeeInfo.amountLabel } : null,
    appealCostsCertificateFeeInfo ? { label: "Appeal Costs Certificate fee*", amount: appealCostsCertificateFeeInfo.amountLabel } : null,
    isKmTravelMatter && hasTravelKm ? { label: `Travel (${travelKm} km @ $0.83/km)`, amount: travelKmAmount } : null,
    formData.mildura_travel_type === "flights" && hasFlightCost ? { label: "Flights", amount: flightCostAmount } : null,
    formData.jail_conference ? { label: "Jail conference fee", amount: MONEY_FORMATTER.format(185) } : null,
    ...selectedCircuitRows.map((row) => ({
      label: circuitFeeInfo ? `${circuitFeeInfo.feeType} – ${row.label}` : row.label,
      amount: row.amount,
    })),
    ...selectedAccommodationRows.map((row) => ({
      label: row.label === "Counsel circuit overnight fee"
        ? row.label
        : circuitFeeInfo
          ? `${circuitFeeInfo.feeType} – ${row.label}`
          : row.label,
      amount: row.amount,
    })),
    ...additionalAppearanceRows,
  ].filter(Boolean);
  const feeNotes = [
    circuitFeeInfo?.gazettedTown && circuitFeeInfo.gazettedTown !== circuitFeeInfo.regionalLocation
      ? `Circuit fees are shown using the gazetted circuit town for ${circuitFeeInfo.gazettedTown}.`
      : "",
    circuitFeeInfo?.note || "",
    counselCircuitFeeInfo?.note || "",
  ].filter(Boolean);
  const parsedRawKm = Number(travelRawKm);
  const calculatedFinalKm = Number.isFinite(parsedRawKm) ? Math.max(parsedRawKm - KM_OFFSET, 0) : 0;
  const calculatedTravelAmount = MONEY_FORMATTER.format(calculatedFinalKm * KM_RATE);

  const openTravelCalculator = (target = "initial") => {
    setTravelCalculatorTarget(target);
    setTravelLookupError("");
    setTravelRawKm(
      target === "amended" && formData.amended_travel_km
        ? String(formData.amended_travel_km)
        : target === "initial" && formData.travel_km
          ? String(formData.travel_km)
          : "",
    );
    setShowTravelCalculator(true);
  };

  const calculateTravelFromLocations = () => {
    const toLocationKey = getTravelLocationKey(formData.location, formData.regional_location);
    if (!travelFrom || !toLocationKey) {
      setTravelLookupError("Select both a from location and a court location first.");
      return;
    }
    setTravelLookupError("");
    const fromPoint = TRAVEL_LOCATION_COORDS[travelFrom];
    const toPoint = TRAVEL_LOCATION_COORDS[toLocationKey];
    if (!fromPoint || !toPoint) {
      setTravelLookupError("That location pair is not available in the calculator yet. You can still enter raw km manually.");
      return;
    }

    const estimatedRoadKm = Number((haversineKm(fromPoint, toPoint) * ROAD_DISTANCE_FACTOR).toFixed(1));
    setTravelRawKm(String(estimatedRoadKm));
  };

  const applyTravelCalculation = () => {
    updateField(
      travelCalculatorTarget === "amended" ? "amended_travel_km" : "travel_km",
      String(calculatedFinalKm),
    );
    setShowTravelCalculator(false);
  };

  const handleOpenEfasSearch = async (event) => {
    event.preventDefault();

    const efasUrl = "https://dailylists.magistratesvic.com.au/EFAS/CaseSearch";
    const searchPrompt = [formData.client_surname, formData.client_first_name]
      .filter(Boolean)
      .join(", ");

    try {
      if (searchPrompt && navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(searchPrompt);
      }
    } catch {
      // Clipboard access can be blocked by the browser; opening EFAS still helps.
    }

    window.open(efasUrl, "_blank", "noopener,noreferrer");
  };

  const updateEmailDraft = (field, value) => {
    setEmailDraft((draft) => ({ ...draft, [field]: value }));
  };

  const openEmailDialog = () => {
    const recipientName = formData.counsel_name || "Counsel";
    const clientName = applicantName || "Client";
    const counselPortalLink = `${window.location.origin}${createPageUrl("BacksheetToCounsel")}#memo-from-counsel`;
    const pdfLine = IS_REMOTE_EMAIL_MODE
      ? "Please find the backsheet attached as a PDF."
      : "Please find the backsheet PDF downloaded for manual attachment to this draft.";
    const aidApplicationSection = formData.provide_aid_application
      ? [
          "",
          "Legal aid application:",
          legalAidFormLink,
        ].join("\n")
      : "";

    setEmailDraft({
      to: formData.counsel_email || "",
      cc: "",
      subject: `Backsheet to Counsel - ${clientName}${selectedAppearanceType ? ` - ${selectedAppearanceType}` : ""}`,
      body: `Dear ${recipientName},

${pdfLine}
${aidApplicationSection}

Please use the portal link below to review the backsheet and provide your memo:
${counselPortalLink}

Kind regards,`,
    });
    setEmailSent(false);
    setShowEmailDialog(true);
  };

  const generateBacksheetPdfBlob = async ({ hideLeftColumn = false } = {}) => {
    const source = printLayoutRef.current;
    if (!source) {
      throw new Error("Backsheet print layout not available");
    }

    const clone = source.cloneNode(true);
    clone.classList.remove("hidden");
    clone.classList.add("block");
    clone.style.position = "fixed";
    clone.style.left = "-10000px";
    clone.style.top = "0";
    clone.style.width = "920px";
    clone.style.zIndex = "-1";
    clone.style.background = "#ffffff";
    if (hideLeftColumn) {
      const grid = clone.querySelector(".backsheet-print-grid");
      const leftColumn = clone.querySelector(".backsheet-print-left");
      if (grid) {
        grid.style.gridTemplateColumns = "1fr";
      }
      if (leftColumn) {
        leftColumn.remove();
      }
    }
    document.body.appendChild(clone);

    try {
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imageWidth = pageWidth;
      const imageHeight = (canvas.height * imageWidth) / canvas.width;
      const imageData = canvas.toDataURL("image/png");

      let remainingHeight = imageHeight;
      let position = 0;

      pdf.addImage(imageData, "PNG", 0, position, imageWidth, imageHeight);
      remainingHeight -= pageHeight;

      while (remainingHeight > 0) {
        position = remainingHeight - imageHeight;
        pdf.addPage();
        pdf.addImage(imageData, "PNG", 0, position, imageWidth, imageHeight);
        remainingHeight -= pageHeight;
      }

      return pdf.output("blob");
    } finally {
      document.body.removeChild(clone);
    }
  };

  const handleSendRevisedBacksheet = async () => {
    if (!formData.instructor_email || formData.fee_review_decision !== "amend") return;

    const portalLink = `${window.location.origin}${createPageUrl("BacksheetToCounsel")}`;
    const amendedFeeSummaryText = amendedFeeRows.map((row) => `- ${row.label}: ${row.amount}`).join("\n");

    if (!IS_REMOTE_EMAIL_MODE) {
      const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(formData.instructor_email)}&su=${encodeURIComponent(`Revised Backsheet - ${applicantName || "Client"}`)}&body=${encodeURIComponent([
        "Please find the revised backsheet details below.",
        "",
        "Amendment reason type:",
        amendmentReasonLabel || "Not specified",
        "",
        "Amended fee summary:",
        amendedFeeSummaryText || "No amended fee summary entered.",
        "",
        "Counsel memo:",
        formData.counsel_memo || "No counsel memo provided.",
        "",
        "Reasons for fee amendment:",
        formData.amended_fee_reason || "No reason provided.",
        "",
        formData.instructor_to_seek_order ? "Instructor to seek order from the court: Yes" : "",
        formData.costs_orders_files.length > 0 ? `Costs orders:\n${formData.costs_orders_files.map((file) => `- ${file.display_name || file.name}: ${file.url}`).join("\n")}` : "",
        "",
        "Portal link:",
        portalLink,
      ].join("\n"))}`;
      window.open(gmailComposeUrl, "_blank");
      setEmailSentMessage("A revised backsheet draft has been opened for the instructor.");
      setShowEmailSentAlert(true);
      return;
    }

    setRevisedBacksheetSending(true);
    try {
      const pdfBlob = await generateBacksheetPdfBlob({ hideLeftColumn: true });
      const pdfFile = new File([pdfBlob], `revised-backsheet-${(applicantName || "client").replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "client"}.pdf`, { type: "application/pdf" });
      const pdfUpload = await base44.integrations.Core.UploadFile({ file: pdfFile });
      const emailBody = [
        "Please find the revised backsheet below.",
        "",
        "Amendment reason type:",
        amendmentReasonLabel || "Not specified",
        "",
        "Revised fee summary:",
        amendedFeeSummaryText || "No amended fee summary entered.",
        "",
        "Counsel memo:",
        formData.counsel_memo || "No counsel memo provided.",
        "",
        "Reasons for fee amendment:",
        formData.amended_fee_reason || "No reason provided.",
        "",
        formData.instructor_to_seek_order ? "Instructor to seek order from the court: Yes" : "",
        formData.costs_orders_files.length > 0 ? `Costs orders:\n${formData.costs_orders_files.map((file) => `- ${file.display_name || file.name}: ${file.url}`).join("\n")}` : "",
        "",
        "Revised backsheet PDF:",
        pdfUpload.file_url,
        "",
        "Portal link:",
        portalLink,
      ].join("\n");

      await base44.integrations.Core.SendEmail({
        to: formData.instructor_email,
        cc: "",
        subject: `Revised Backsheet - ${applicantName || "Client"}`,
        body: emailBody,
      });

      setEmailSentMessage("The revised backsheet has been sent to the instructor.");
      setShowEmailSentAlert(true);
    } finally {
      setRevisedBacksheetSending(false);
    }
  };

  const handleSendBacksheetEmail = async () => {
    if (!emailDraft.to) return;

    const counselPortalLink = `${window.location.origin}${createPageUrl("BacksheetToCounsel")}#memo-from-counsel`;

    if (!IS_REMOTE_EMAIL_MODE) {
      const pdfBlob = await generateBacksheetPdfBlob({ hideLeftColumn: true });
      const pdfFileName = `backsheet-${(applicantName || "client").replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "client"}.pdf`;
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = pdfUrl;
      downloadLink.download = pdfFileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(pdfUrl);

      const standaloneMailBody = [
        emailDraft.body.trim(),
        "",
        "If needed, use this portal link to provide your memo:",
        counselPortalLink,
      ].filter(Boolean).join("\n");
      const mailtoUrl = `mailto:${encodeURIComponent(emailDraft.to)}?subject=${encodeURIComponent(emailDraft.subject)}${emailDraft.cc ? `&cc=${encodeURIComponent(emailDraft.cc)}` : ""}&body=${encodeURIComponent(standaloneMailBody)}`;
      window.location.href = mailtoUrl;
      setEmailSentMessage(`Your email program has been opened and the backsheet PDF has been downloaded as ${pdfFileName} for attachment.`);
      setEmailSent(true);
      setShowEmailSentAlert(true);
      setTimeout(() => {
        setEmailSent(false);
        setShowEmailDialog(false);
      }, 1500);
      return;
    }

    setEmailSending(true);
    try {
      const pdfBlob = await generateBacksheetPdfBlob();
      const pdfFileName = `backsheet-${(applicantName || "client").replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "client"}.pdf`;
      const pdfFile = new File([pdfBlob], pdfFileName, { type: "application/pdf" });
      const pdfUpload = await base44.integrations.Core.UploadFile({ file: pdfFile });
      const pdfBase64 = await blobToBase64(pdfBlob);

      const uploadedDocumentLinks = formData.uploaded_files.map((file) => `- ${file.display_name || file.name}: ${file.url}`).join("\n");
      const emailBody = [
        emailDraft.body.trim(),
        "",
        "Portal link for memo:",
        counselPortalLink,
        uploadedDocumentLinks ? `\nCurrent backsheet documents:\n${uploadedDocumentLinks}` : "",
      ].filter(Boolean).join("\n");

      const sendResult = await base44.integrations.Core.SendEmail({
        to: emailDraft.to,
        cc: emailDraft.cc,
        subject: emailDraft.subject,
        body: emailBody,
        attachment_name: pdfFileName,
        attachment_type: "application/pdf",
        attachment_base64: pdfBase64,
      });

      if (!sendResult?.ok) {
        throw new Error("Email send failed");
      }
      setEmailSentMessage("Your backsheet has been sent to counsel.");

      setEmailSent(true);
      setShowEmailSentAlert(true);
      setTimeout(() => {
        setEmailSent(false);
        setShowEmailDialog(false);
      }, 1500);
    } finally {
      setEmailSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between print:hidden">
        <a
          href={isCounselMemoOnlyView ? createPageUrl("BacksheetToCounsel") : createPageUrl("Home")}
          className="flex items-center gap-2 text-slate-600 hover:text-purple-600 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          {isCounselMemoOnlyView ? "Back to Backsheet" : "Back to Portal"}
        </a>
        <div className="text-center">
          <p className="font-semibold text-slate-800 text-sm">{isCounselMemoOnlyView ? "Counsel Memo Portal" : "Backsheet to Counsel"}</p>
          <p className="text-xs text-slate-400">{isCounselMemoOnlyView ? "Review fee details and provide your memo" : "Law and Advocacy Centre for Women"}</p>
        </div>
        <div className="flex items-center gap-2">
          {!isCounselMemoOnlyView && (
            <>
              <Button variant="outline" size="sm" onClick={resetForm} className="gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" /> New Backsheet
              </Button>
              <Button size="sm" onClick={() => window.print()} className="gap-1.5 bg-purple-600 hover:bg-purple-700">
                <Printer className="w-3.5 h-3.5" /> Print / Save PDF
              </Button>
            </>
          )}
        </div>
      </div>

      <div ref={printLayoutRef} className="hidden print:block bg-white px-10 pt-10 pb-6 text-black">
        <div className="backsheet-print-grid grid grid-cols-[0.52fr_0.48fr] gap-4 text-[12px] leading-6">
          <div className="backsheet-print-left min-h-[720px] border border-black p-4" />

          <div className="space-y-4">
            <div className="text-[13px] font-semibold uppercase leading-5">
              <div>{selectedCourtName ? `IN THE ${selectedCourtName.toUpperCase()} OF VICTORIA` : "IN THE COURT OF VICTORIA"}</div>
              <div>{venueLabel ? `AT ${venueLabel.toUpperCase()}` : ""}</div>
            </div>
            {(formData.hearing_date || formData.hearing_time) && (
              <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 font-semibold">
                {formattedHearingDate ? (
                  <>
                    <div>Hearing date:</div>
                    <div>{formattedHearingDate}</div>
                  </>
                ) : <><div /><div /></>}
                {formData.hearing_time ? (
                  <>
                    <div>Hearing time:</div>
                    <div>{formData.hearing_time}</div>
                  </>
                ) : null}
              </div>
            )}

            {formData.case_id && (
              <div className="font-semibold text-blue-700 underline">{formData.case_id}</div>
            )}

            <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 font-semibold">
              <div>{applicantName || "Defendant"}</div>
              <div>Defendant</div>
              <div>v</div>
              <div />
              <div>{contraLabel || "Respondent / Prosecutor"}</div>
              <div>Informant</div>
            </div>

            <div className="border-y border-black py-2 text-center font-bold uppercase leading-5">
              {matterHeading}
            </div>

            <div className="space-y-1">
              <div><span className="font-medium">Counsel:</span> {formData.counsel_name || ""}</div>
              <div><span className="font-medium">Clerk:</span> {selectedClerkLabel || ""}</div>
            </div>

            {activeFeeRows.length > 0 && (
              <div>
                <div className="font-medium">Fees</div>
                <div className="text-[10px]">(including GST and conferences where applicable)</div>
                <div className="mt-2 space-y-1">
                  {activeFeeRows.map((row) => (
                    <div key={`print-${row.label}-${row.amount}`}>
                      <div className="grid grid-cols-[1fr_auto] gap-3">
                        <div>{row.label}</div>
                        <div>{row.amount}</div>
                      </div>
                      {row.label === "Appeal Costs Certificate fee*" && (
                        <div className="mt-1 text-[10px] leading-4 text-slate-600">
                          If an appeal costs certificate is granted for this appearance please invoice this fee.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(formData.additional_notes || formData.counsel_memo || formData.fee_review_decision === "amend") && (
              <div className="border border-black p-2">
                {formData.additional_notes && (
                  <div className="whitespace-pre-wrap">{formData.additional_notes}</div>
                )}
                {formData.counsel_memo && (
                  <div className={formData.additional_notes ? "mt-3" : ""}>
                    <div className="font-medium">Memo from counsel</div>
                    <div className="whitespace-pre-wrap">{formData.counsel_memo}</div>
                  </div>
                )}
                {formData.fee_review_decision === "amend" && (
                  <div className={formData.additional_notes || formData.counsel_memo ? "mt-3" : ""}>
                    <div className="font-medium">Reason for fee amendment</div>
                    <div>{amendmentReasonLabel || "Amended fee"}</div>
                    {formData.amended_fee_reason && (
                      <div className="mt-1 whitespace-pre-wrap">{formData.amended_fee_reason}</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="hidden">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Backsheet to Counsel</h1>
            <p className="text-sm text-slate-500">Law and Advocacy Centre for Women</p>
          </div>
          <div className="text-right text-sm text-slate-500">
            <p>Date: {today}</p>
            <p>RMIT Building 152, Level 1 · 147–155 Pelham Street, Carlton VIC 3053</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 print:hidden">

        {/* Client Information */}
        {!isCounselMemoOnlyView && <Card className="border-slate-200">
          <CardHeader><CardTitle className="text-lg">Client Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Client Surname *</Label>
                <Input value={formData.client_surname} onChange={e => updateField("client_surname", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Client First Name *</Label>
                <Input value={formData.client_first_name} onChange={e => updateField("client_first_name", e.target.value)} required />
              </div>
            </div>
          </CardContent>
        </Card>}

        {/* Court & Matter Details */}
        {!isCounselMemoOnlyView && <Card className="border-slate-200">
          <CardHeader><CardTitle className="text-lg">Court &amp; Matter Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Court *</Label>
                <Select value={formData.court_name} onValueChange={v => {
                  updateField("court_name", v);
                  updateField("court_name_other", "");
                  updateField("appearance_type", "");
                  updateField("appearance_type_other", "");
                  updateField("counsel_type", "n_a");
                  updateField("matter_type", "");
                  updateField("extra_matter_types", []);
                }}>
                  <SelectTrigger><SelectValue placeholder="Select court" /></SelectTrigger>
                  <SelectContent>
                    {["Children's Court","Magistrates Court","County Court","Supreme Court","Court of appeal","High Court","Office of Chief Examiner","Other"].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formData.court_name === "Other" && (
                <div className="space-y-2">
                  <Label>Please specify court</Label>
                  <Input
                    value={formData.court_name_other}
                    onChange={e => updateField("court_name_other", e.target.value)}
                    placeholder="Enter court name"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>Location</Label>
                <Select value={formData.location} onValueChange={v => updateField("location", v)}>
                  <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                  <SelectContent>
                    {["Broadmeadows","Dandenong","Frankston","Heidelberg","Melbourne","Moorabbin Justice Centre","Neighbourhood Justice Centre","Ringwood","Sunshine","Werribee","Regional Location"].map(l => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.location === "Regional Location" && (
              <div className="space-y-2">
                <Label>Regional Location</Label>
                <Select value={formData.regional_location} onValueChange={v => {
                  updateField("regional_location", v);
                  if (v === "Mildura") {
                    setShowMilduraAlert(true);
                    setShowMilduraTravelDialog(true);
                  } else {
                    updateField("mildura_travel_type", "");
                    updateField("flight_cost", "");
                  }
                }}>
                  <SelectTrigger><SelectValue placeholder="Select regional location" /></SelectTrigger>
                  <SelectContent>
                    {REGIONAL_LOCATIONS.map(loc => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hearing Date</Label>
                <Input type="date" value={formData.hearing_date} onChange={e => updateField("hearing_date", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Hearing Time</Label>
                <Input type="time" value={formData.hearing_time} onChange={e => updateField("hearing_time", e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Case ID</Label>
              <Input value={formData.case_id} onChange={e => updateField("case_id", e.target.value)} placeholder="e.g. M12345678" />
              {formData.court_name === "Magistrates Court" && (
                <>
                  <div className="flex flex-wrap gap-3 pt-1">
                    <a href="https://dailylists.magistratesvic.com.au/EFAS/CaseSearch" target="_blank" rel="noopener noreferrer" onClick={handleOpenEfasSearch} className="text-xs text-blue-600 hover:underline">EFAS Case Search</a>
                    <a href="https://dailylists.magistratesvic.com.au/Home/LogOn" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">Log into your EFAS account</a>
                  </div>
                  <p className="pt-1 text-xs text-slate-500">EFAS opens in a new tab and copies the client name to your clipboard in `Surname, First name` format.</p>
                </>
              )}
              {formData.court_name === "County Court" && (
                <div className="flex flex-wrap gap-3 pt-1">
                  <a href="http://cjep.justice.vic.gov.au/pls/p100/ck_public_qry_crim.cp_crimlist_setup_idx" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">County Court Listings</a>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Prosecutor</Label>
              <Select value={formData.prosecutor} onValueChange={v => {
                updateField("prosecutor", v);
                updateField("informant_name", "");
                updateField("vpn_number", "");
                updateField("local_council", "");
                updateField("prosecutor_other", "");
              }}>
                <SelectTrigger><SelectValue placeholder="Select prosecutor" /></SelectTrigger>
                <SelectContent>
                  {["VICTORIA POLICE","OFFICE OF PUBLIC PROSECUTION","COMMONWEALTH DEPARTMENT PUBLIC PROSECUTION","FINES VICTORIA","DEPARTMENT OF JUSTICE AND COMMUNITY SAFETY","CORRECTIONS VICTORIA","AUSTRALIAN FEDERAL POLICE","VIC ROADS","TAC","VICTORIAN GOVERNMENT SOLICITORS OFFICE","CHIEF EXAMINER","COMMISSIONER OF POLICE","LOCAL COUNCIL","ATO","OTHER"].map(v => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.prosecutor === "OTHER" && (
              <div className="space-y-2">
                <Label>Please specify</Label>
                <Input value={formData.prosecutor_other} onChange={e => updateField("prosecutor_other", e.target.value)} placeholder="Enter prosecutor..." />
              </div>
            )}

            {formData.prosecutor === "VICTORIA POLICE" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Informant Name</Label>
                  <Input
                    value={formData.informant_name}
                    onChange={e => updateField("informant_name", e.target.value)}
                    placeholder="e.g. Wangman, R (48969)"
                  />
                </div>
                <div className="space-y-2">
                  <Label>VPN Number</Label>
                  <Input
                    value={formData.vpn_number}
                    onChange={e => updateField("vpn_number", e.target.value)}
                    placeholder="e.g. 48969"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={informantEmail} readOnly placeholder="Auto-filled from VPN number" />
                </div>
              </div>
            )}

            {formData.prosecutor === "LOCAL COUNCIL" && (
              <div className="space-y-2">
                <Label>Select Council</Label>
                <Select value={formData.local_council} onValueChange={v => updateField("local_council", v)}>
                  <SelectTrigger><SelectValue placeholder="Select local council" /></SelectTrigger>
                  <SelectContent>
                    {LOCAL_COUNCILS.map(v => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.location === "Regional Location" && !(formData.regional_location === "Mildura" && formData.mildura_travel_type === "flights") && (
              <div className="space-y-2">
                <Button type="button" variant="outline" onClick={() => openTravelCalculator("initial")}>
                  Calculate travel fee
                </Button>
              </div>
            )}

            {formData.location === "Regional Location" && formData.regional_location === "Mildura" && formData.mildura_travel_type === "flights" && (
              <div className="space-y-2">
                <Label>Flights</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.flight_cost}
                  onChange={e => updateField("flight_cost", e.target.value)}
                  placeholder="Enter flight cost"
                />
              </div>
            )}

            {(standardCircuitRows.length > 0 || selectedCircuitRows.length > 0 || accommodationRows.length > 0) && (
              <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                <div className="text-sm font-medium text-slate-800">Regional fee options</div>
                {(standardCircuitRows.length > 0 || counselCircuitFeeInfo) && (
                  <Label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.include_circuit_fee}
                      onChange={(e) => updateField("include_circuit_fee", e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    <span>Include circuit fee</span>
                  </Label>
                )}
                {accommodationRows.length > 0 && (
                  <Label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.include_accommodation_fee}
                      onChange={(e) => updateField("include_accommodation_fee", e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    <span>Include accommodation fee</span>
                  </Label>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Appearance Type</Label>
              <Select value={formData.appearance_type} onValueChange={v => {
                updateField("appearance_type", v);
                updateField("appearance_type_other", "");
                updateField("appearance_fee_other", "");
                updateField("include_hourly_rates", false);
                updateField("counsel_type", "n_a");
                updateField("matter_type", "");
                updateField("extra_matter_types", []);
              }}>
                <SelectTrigger><SelectValue placeholder="Select appearance type" /></SelectTrigger>
                <SelectContent>
                  {getAppearanceTypesForCourt(formData.court_name).map(at => (
                    <SelectItem key={at.label} value={at.label}>{at.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.appearance_type === "Other" && (
                <>
                  <div className="space-y-2">
                    <Label>Please specify appearance type</Label>
                    <Input
                      value={formData.appearance_type_other}
                      onChange={e => updateField("appearance_type_other", e.target.value)}
                      placeholder="Enter appearance type"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Manual Fee</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.appearance_fee_other}
                      onChange={e => updateField("appearance_fee_other", e.target.value)}
                      placeholder="Enter fee amount"
                    />
                  </div>
                </>
              )}
              <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-slate-800">Additional Appearances</div>
                  <Button type="button" variant="outline" size="sm" onClick={addAdditionalAppearance}>
                    Add Another Appearance
                  </Button>
                </div>
                {formData.additional_appearances.length > 0 && (
                  <div className="space-y-3">
                    {formData.additional_appearances.map((item, index) => {
                      const itemFeeSummaryRows = buildAppearanceFeeSummaryRows(item.appearance, item.appearance_other, item.fee);

                      return (
                      <div key={item.id} className="rounded-md border border-slate-200 bg-white p-3">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <div className="text-sm font-medium text-slate-700">Appearance {index + 2}</div>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeAdditionalAppearance(item.id)}>
                            Remove
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Appearance</Label>
                            <Select
                              value={item.appearance}
                              onValueChange={(value) => {
                                updateAdditionalAppearance(item.id, "appearance", value);
                                if (value !== "Other") {
                                  updateAdditionalAppearance(item.id, "appearance_other", "");
                                }
                              }}
                            >
                              <SelectTrigger><SelectValue placeholder="Select appearance type" /></SelectTrigger>
                              <SelectContent>
                                {getAppearanceTypesForCourt(formData.court_name).map((option) => (
                                  <SelectItem key={`${item.id}-${option.label}`} value={option.label}>{option.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {item.appearance === "Other" && (
                            <div className="space-y-2">
                              <Label>Please specify appearance type</Label>
                              <Input
                                value={item.appearance_other}
                                onChange={(e) => updateAdditionalAppearance(item.id, "appearance_other", e.target.value)}
                                placeholder="Enter appearance type"
                              />
                            </div>
                          )}
                          {item.appearance === "Other" && (
                            <div className="space-y-2">
                              <Label>Manual Fee</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.fee}
                                onChange={(e) => updateAdditionalAppearance(item.id, "fee", e.target.value)}
                                placeholder="Enter fee amount"
                              />
                            </div>
                          )}
                        </div>
                        {itemFeeSummaryRows.length > 0 && (
                          <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900">
                            <div className="font-medium">Fee summary</div>
                            <div className="mt-2 space-y-1">
                              {itemFeeSummaryRows.map((row) => (
                                <div key={`${item.id}-${row.label}-${row.amount}`} className="grid grid-cols-[1fr_auto] gap-3 border-b border-slate-100 pb-1 last:border-b-0 last:pb-0">
                                  <div>{row.label}</div>
                                  <div className="font-semibold">{row.amount}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )})}
                  </div>
                )}
              </div>
              {counselTrialFeeInfo && (
                <div className="space-y-2">
                  <Label>Counsel Type</Label>
                  <Select value={formData.counsel_type} onValueChange={v => updateField("counsel_type", v)}>
                    <SelectTrigger><SelectValue placeholder="Select counsel type" /></SelectTrigger>
                    <SelectContent>
                      {getCounselTypeOptions().map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {hourlyPreparationFeeInfo && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={formData.include_hourly_rates}
                      onChange={e => updateField("include_hourly_rates", e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    <span>Include hourly rates</span>
                  </Label>
                </div>
              )}
              {feeSummaryRows.length > 0 && (
                <div className="rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900">
                  <div className="font-medium">Fee summary</div>
                  <div className="mt-2 space-y-1">
                    {feeSummaryRows.map((row) => (
                      <div key={`${row.label}-${row.amount}`} className="grid grid-cols-[1fr_auto] gap-3 border-b border-slate-100 pb-1 last:border-b-0 last:pb-0">
                        <div>{row.label}</div>
                        <div className="font-semibold">{row.amount}</div>
                      </div>
                    ))}
                  </div>
                  {feeNotes.length > 0 && (
                    <div className="mt-3 space-y-1 text-xs text-slate-600">
                      {feeNotes.map((note) => (
                        <div key={note}>{note}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {hourlyPreparationFeeInfo && formData.include_hourly_rates && (
                <div className="rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm text-cyan-900">
                  <div>
                    <span className="font-medium">Hourly rate:</span> {hourlyPreparationFeeInfo.feeType}
                  </div>
                  <div className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-3">
                    {hourlyPreparationFeeInfo.rates.map((item) => (
                      <div key={item.role} className="rounded border border-cyan-200 bg-white px-2 py-2">
                        <div className="text-xs font-medium text-cyan-700">{item.role}</div>
                        <div className="text-sm font-semibold text-cyan-900">{item.amountLabel} per hour</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-cyan-700">{hourlyPreparationFeeInfo.note}</div>
                </div>
              )}
              {cmiaFeeInfo && (
                <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-900">
                  <div>
                    <span className="font-medium">CMIA supporting rates:</span> {cmiaFeeInfo.feeType}
                  </div>
                  <div className="mt-2 space-y-1">
                    <div><span className="font-medium">Preparation:</span> {cmiaFeeInfo.preparation}</div>
                    <div><span className="font-medium">Instructing:</span> {cmiaFeeInfo.instructing}</div>
                  </div>
                  <div className="mt-2 text-xs text-indigo-700">{cmiaFeeInfo.note}</div>
                </div>
              )}
              {soaFeeInfo && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
                  <div>
                    <span className="font-medium">Serious Offenders Act supporting rates:</span> {soaFeeInfo.feeType}
                  </div>
                  <div className="mt-2 space-y-1">
                    {soaFeeInfo.preparation && (
                      <div><span className="font-medium">Preparation:</span> {soaFeeInfo.preparation}</div>
                    )}
                    {soaFeeInfo.instructing && (
                      <div><span className="font-medium">Instructing:</span> {soaFeeInfo.instructing}</div>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-rose-700">{soaFeeInfo.note}</div>
                </div>
              )}
              {counselTrialFeeInfo?.note && selectedCounselFee && (
                <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-700">
                  {counselTrialFeeInfo.note}
                </div>
              )}
            </div>

            {selectedAppearanceType && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input type="checkbox" checked={formData.jail_conference} onChange={e => {
                    updateField("jail_conference", e.target.checked);
                    if (e.target.checked) setShowJailAlert(true);
                  }} className="w-4 h-4 rounded border-slate-300" />
                  <span>Jail Conference</span>
                </Label>
              </div>
            )}
          </CardContent>
        </Card>}

        {/* Counsel Information */}
        {!isCounselMemoOnlyView && <Card className="border-slate-200">
          <CardHeader><CardTitle className="text-lg">Counsel Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Clerk</Label>
              <Select value={formData.clerk} onValueChange={v => {
                updateField("clerk", v);
                updateField("clerk_other", "");
                clearCounselFields();
              }}>
                <SelectTrigger><SelectValue placeholder="Select clerk" /></SelectTrigger>
                <SelectContent>
                  {CLERK_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formData.clerk === "other" && (
              <div className="space-y-2">
                <Label>Please specify clerk</Label>
                <Input
                  value={formData.clerk_other}
                  onChange={e => updateField("clerk_other", e.target.value)}
                  placeholder="Enter clerk name"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Counsel Name *</Label>
              {isAutoFillClerk ? (
                <Select value={formData.counsel_name} onValueChange={handleCounselSelect} disabled={loadingBarristers}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingBarristers ? "Loading barristers..." : "Select counsel"} />
                  </SelectTrigger>
                  <SelectContent>
                    {currentBarristers.map(b => (
                      <SelectItem key={b.id || b.slug} value={b.name}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input value={formData.counsel_name} onChange={e => updateField("counsel_name", e.target.value)} placeholder="Enter counsel name" required />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Counsel Email
                  {isAutoFillClerk && formData.counsel_email && (
                    <span className="text-xs text-blue-600">(auto-filled)</span>
                  )}
                </Label>
                <Input type="email" value={formData.counsel_email} onChange={e => updateField("counsel_email", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Counsel Phone
                  {isAutoFillClerk && formData.counsel_phone && (
                    <span className="text-xs text-blue-600">(auto-filled)</span>
                  )}
                </Label>
                <Input type="tel" value={formData.counsel_phone} onChange={e => updateField("counsel_phone", e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>}

        {/* Instructions to Counsel */}
        {!isCounselMemoOnlyView && <Card className="border-slate-200">
          <CardHeader><CardTitle className="text-lg">Instructions to Counsel</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Textarea value={formData.instructions} onChange={e => updateField("instructions", e.target.value)} placeholder="Provide detailed instructions for counsel..." rows={10} />
            <div className="space-y-2">
              <Label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.provide_aid_application}
                  onChange={e => updateField("provide_aid_application", e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <span>Provide aid application</span>
              </Label>
              {formData.provide_aid_application && (
                <a
                  href={legalAidFormLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  LegalAidForm
                </a>
              )}
            </div>
          </CardContent>
        </Card>}

        {/* Documents & Notes */}
        {!isCounselMemoOnlyView && <Card className="border-slate-200">
          <CardHeader><CardTitle className="text-lg">Documents &amp; Additional Notes</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Documents Attached</Label>
              <Textarea value={formData.documents_attached} onChange={e => updateField("documents_attached", e.target.value)} placeholder="List documents being provided to counsel..." rows={3} />
            </div>
            <div className="space-y-2 print:hidden">
              <Label>Upload Documents</Label>
              <div className="flex items-center gap-2">
                <Input type="file" multiple onChange={handleFileUpload} disabled={uploading} className="cursor-pointer" />
                {uploading && <Loader2 className="h-4 w-4 animate-spin text-slate-500" />}
              </div>
              {formData.uploaded_files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {formData.uploaded_files.map((file, i) => (
                    <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 flex-1 items-start gap-2">
                        <FileText className="h-4 w-4 text-slate-500" />
                          <div className="min-w-0 flex-1 space-y-2">
                            <Input
                              value={file.display_name || file.name}
                              onChange={(e) => updateUploadedFileLabel(i, e.target.value)}
                              placeholder="Attachment label"
                            />
                            <div className="truncate text-xs text-slate-500">{file.name}</div>
                          </div>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(i)} className="shrink-0">
                          Remove attachment
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Additional Notes</Label>
              <Textarea value={formData.additional_notes} onChange={e => updateField("additional_notes", e.target.value)} placeholder="Any other relevant information..." rows={3} />
            </div>
          </CardContent>
        </Card>}

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">Memo From Counsel</CardTitle>
            {!isCounselMemoOnlyView && (
              <Button type="button" variant="outline" size="sm" onClick={() => setShowCounselMemoSection((current) => !current)}>
                {showCounselMemoSection ? "Hide Memo From Counsel" : "Memo From Counsel"}
              </Button>
            )}
          </CardHeader>
          {showCounselMemoSection && (
            <CardContent className="space-y-4">
              {initialFeeRows.length > 0 && (
                <div className="rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900">
                  <div className="font-medium">Initial Fee Summary</div>
                  <div className="mt-2 space-y-1">
                    {initialFeeRows.map((row) => (
                      <div key={`initial-memo-${row.label}-${row.amount}`} className="grid grid-cols-[1fr_auto] gap-3 border-b border-slate-100 pb-1 last:border-b-0 last:pb-0">
                        <div>{row.label}</div>
                        <div className="font-semibold">{row.amount}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label>Memo Body</Label>
                <Textarea
                  value={formData.counsel_memo}
                  onChange={e => updateField("counsel_memo", e.target.value)}
                  placeholder="Counsel can provide their memo here..."
                  rows={8}
                />
              </div>
              <div className="space-y-2">
                <Label>Memo Attachments</Label>
                <div className="flex items-center gap-2">
                  <Input type="file" multiple onChange={handleCounselMemoUpload} disabled={memoUploading} className="cursor-pointer" />
                  {memoUploading && <Loader2 className="h-4 w-4 animate-spin text-slate-500" />}
                </div>
                {formData.counsel_memo_files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {formData.counsel_memo_files.map((file, index) => (
                      <div key={`${file.name}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 flex-1 items-start gap-2">
                            <FileText className="h-4 w-4 text-slate-500" />
                            <div className="min-w-0 flex-1 space-y-2">
                              <Input
                                value={file.display_name || file.name}
                                onChange={(e) => updateCounselMemoFileLabel(index, e.target.value)}
                                placeholder="Attachment label"
                              />
                              <div className="truncate text-xs text-slate-500">{file.name}</div>
                            </div>
                          </div>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeCounselMemoFile(index)} className="shrink-0">
                            Remove attachment
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="text-sm font-medium text-slate-800">Fee Review</div>
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <Label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.fee_review_decision === "confirm"}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData((current) => ({
                            ...current,
                            fee_review_decision: "confirm",
                            amended_appearance_type: "",
                            amended_appearance_type_other: "",
                            amended_appearance_fee_other: "",
                            amended_travel_km: "",
                            amended_additional_appearances: [],
                            amendment_reason_type: "",
                            amended_fee_reason: "",
                            costs_orders_files: [],
                            instructor_to_seek_order: false,
                            attach_revised_backsheet: false,
                            instructor_email: "",
                          }));
                        } else {
                          updateField("fee_review_decision", "");
                        }
                      }}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    <span>Confirm Fee</span>
                  </Label>
                  <Label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.fee_review_decision === "amend"}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateField("fee_review_decision", "amend");
                        } else {
                          setFormData((current) => ({
                            ...current,
                            fee_review_decision: "",
                            amended_appearance_type: "",
                            amended_appearance_type_other: "",
                            amended_appearance_fee_other: "",
                            amended_travel_km: "",
                            amended_additional_appearances: [],
                            amendment_reason_type: "",
                            amended_fee_reason: "",
                            costs_orders_files: [],
                            instructor_to_seek_order: false,
                            attach_revised_backsheet: false,
                            instructor_email: "",
                          }));
                        }
                      }}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    <span>Amend Fee</span>
                  </Label>
                </div>

                {formData.fee_review_decision === "amend" && (
                  <div className="space-y-4">
                    {isKmTravelMatter && (
                      <div className="space-y-3 rounded-lg border border-slate-200 bg-white px-3 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-medium text-slate-800">Travel Fee Recalculation</div>
                          <Button type="button" variant="outline" size="sm" onClick={() => openTravelCalculator("amended")}>
                            Calculate travel fee
                          </Button>
                        </div>
                        {hasAmendedTravelKm && (
                          <div className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-900">
                            <div className="font-medium">Counsel Calculated Travel</div>
                            <div className="mt-2 grid grid-cols-[1fr_auto] gap-3 border-b border-slate-100 pb-1 last:border-b-0 last:pb-0">
                              <div>{`Travel (${amendedTravelKm} km @ $0.83/km)`}</div>
                              <div className="font-semibold">{amendedTravelKmAmount}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Reason for Amendment</Label>
                      <Select
                        value={formData.amendment_reason_type}
                        onValueChange={(value) => {
                          setFormData((current) => ({
                            ...current,
                            amendment_reason_type: value,
                            amended_appearance_type: "",
                            amended_appearance_type_other: "",
                            amended_appearance_fee_other: "",
                            amended_travel_km: "",
                            amended_additional_appearances: [],
                            amended_fee_reason: "",
                            costs_orders_files: [],
                            instructor_to_seek_order: false,
                          }));
                        }}
                      >
                        <SelectTrigger><SelectValue placeholder="Select reason for amendment" /></SelectTrigger>
                        <SelectContent>
                          {AMENDMENT_REASON_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {formData.amendment_reason_type === "costs_granted" && (
                      <div className="space-y-3 rounded-lg border border-slate-200 bg-white px-3 py-3">
                        {amendedFeeRows.length > 0 && (
                          <div className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-900">
                            <div className="font-medium">Amended Fee Summary</div>
                            <div className="mt-2 space-y-1">
                              {amendedFeeRows.map((row) => (
                                <div key={`amended-${row.label}-${row.amount}`} className="grid grid-cols-[1fr_auto] gap-3 border-b border-slate-100 pb-1 last:border-b-0 last:pb-0">
                                  <div>{row.label}</div>
                                  <div className="font-semibold">{row.amount}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="space-y-2">
                          <Label>Upload Costs Orders</Label>
                          <div className="flex items-center gap-2">
                            <Input type="file" multiple onChange={handleCostsOrderUpload} disabled={memoUploading} className="cursor-pointer" />
                            {memoUploading && <Loader2 className="h-4 w-4 animate-spin text-slate-500" />}
                          </div>
                          {formData.costs_orders_files.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {formData.costs_orders_files.map((file, index) => (
                                <div key={`${file.name}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex min-w-0 flex-1 items-start gap-2">
                                      <FileText className="h-4 w-4 text-slate-500" />
                                      <div className="min-w-0 flex-1 space-y-2">
                                        <Input
                                          value={file.display_name || file.name}
                                          onChange={(e) => updateCostsOrderFileLabel(index, e.target.value)}
                                          placeholder="Attachment label"
                                        />
                                        <div className="truncate text-xs text-slate-500">{file.name}</div>
                                      </div>
                                    </div>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => removeCostsOrderFile(index)} className="shrink-0">
                                      Remove attachment
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.instructor_to_seek_order}
                              onChange={(e) => updateField("instructor_to_seek_order", e.target.checked)}
                              className="w-4 h-4 rounded border-slate-300"
                            />
                            <span>Instructor to seek order from the court</span>
                          </Label>
                        </div>
                      </div>
                    )}
                    {(formData.amendment_reason_type === "different_appearance" || formData.amendment_reason_type === "other") && (
                      <>
                        <div className="space-y-2">
                          <Label>Amended Appearance Type</Label>
                          <Select
                            value={formData.amended_appearance_type}
                            onValueChange={(value) => {
                              updateField("amended_appearance_type", value);
                              updateField("amended_appearance_type_other", "");
                              updateField("amended_appearance_fee_other", "");
                            }}
                          >
                            <SelectTrigger><SelectValue placeholder="Select appearance type" /></SelectTrigger>
                            <SelectContent>
                              {getAppearanceTypesForCourt(formData.court_name).map((option) => (
                                <SelectItem key={`amended-${option.label}`} value={option.label}>{option.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {formData.amended_appearance_type === "Other" && (
                          <>
                            <div className="space-y-2">
                              <Label>Please specify appearance type</Label>
                              <Input
                                value={formData.amended_appearance_type_other}
                                onChange={e => updateField("amended_appearance_type_other", e.target.value)}
                                placeholder="Enter appearance type"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Manual Fee</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.amended_appearance_fee_other}
                                onChange={e => updateField("amended_appearance_fee_other", e.target.value)}
                                placeholder="Enter fee amount"
                              />
                            </div>
                          </>
                        )}
                        <div className="space-y-3 rounded-lg border border-slate-200 bg-white px-3 py-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-sm font-medium text-slate-800">Additional Amended Appearances</div>
                            <Button type="button" variant="outline" size="sm" onClick={addAmendedAppearance}>
                              Add Another Appearance
                            </Button>
                          </div>
                          {formData.amended_additional_appearances.length > 0 && (
                            <div className="space-y-3">
                              {formData.amended_additional_appearances.map((item, index) => {
                                const itemFeeSummaryRows = buildAppearanceFeeSummaryRows(item.appearance, item.appearance_other, item.fee);

                                return (
                                  <div key={item.id} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                                    <div className="mb-2 flex items-center justify-between gap-3">
                                      <div className="text-sm font-medium text-slate-700">Amended Appearance {index + 2}</div>
                                      <Button type="button" variant="ghost" size="sm" onClick={() => removeAmendedAppearance(item.id)}>
                                        Remove
                                      </Button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                      <div className="space-y-2">
                                        <Label>Appearance</Label>
                                        <Select
                                          value={item.appearance}
                                          onValueChange={(value) => {
                                            updateAmendedAppearance(item.id, "appearance", value);
                                            if (value !== "Other") {
                                              updateAmendedAppearance(item.id, "appearance_other", "");
                                            }
                                          }}
                                        >
                                          <SelectTrigger><SelectValue placeholder="Select appearance type" /></SelectTrigger>
                                          <SelectContent>
                                            {getAppearanceTypesForCourt(formData.court_name).map((option) => (
                                              <SelectItem key={`${item.id}-${option.label}`} value={option.label}>{option.label}</SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      {item.appearance === "Other" && (
                                        <div className="space-y-2">
                                          <Label>Please specify appearance type</Label>
                                          <Input
                                            value={item.appearance_other}
                                            onChange={(e) => updateAmendedAppearance(item.id, "appearance_other", e.target.value)}
                                            placeholder="Enter appearance type"
                                          />
                                        </div>
                                      )}
                                      {item.appearance === "Other" && (
                                        <div className="space-y-2">
                                          <Label>Manual Fee</Label>
                                          <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={item.fee}
                                            onChange={(e) => updateAmendedAppearance(item.id, "fee", e.target.value)}
                                            placeholder="Enter fee amount"
                                          />
                                        </div>
                                      )}
                                    </div>
                                    {itemFeeSummaryRows.length > 0 && (
                                      <div className="mt-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900">
                                        <div className="font-medium">Amended fee summary</div>
                                        <div className="mt-2 space-y-1">
                                          {itemFeeSummaryRows.map((row) => (
                                            <div key={`${item.id}-${row.label}-${row.amount}`} className="grid grid-cols-[1fr_auto] gap-3 border-b border-slate-100 pb-1 last:border-b-0 last:pb-0">
                                              <div>{row.label}</div>
                                              <div className="font-semibold">{row.amount}</div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        {amendedFeeRows.length > 0 && (
                          <div className="rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900">
                            <div className="font-medium">Amended Fee Summary</div>
                            <div className="mt-2 space-y-1">
                              {amendedFeeRows.map((row) => (
                                <div key={`amended-${row.label}-${row.amount}`} className="grid grid-cols-[1fr_auto] gap-3 border-b border-slate-100 pb-1 last:border-b-0 last:pb-0">
                                  <div>{row.label}</div>
                                  <div className="font-semibold">{row.amount}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    {formData.amendment_reason_type === "other" && (
                      <div className="space-y-2">
                        <Label>Other Reason</Label>
                        <Textarea
                          value={formData.amended_fee_reason}
                          onChange={e => updateField("amended_fee_reason", e.target.value)}
                          placeholder="Please explain the amendment..."
                          rows={4}
                        />
                      </div>
                    )}
                    <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                      <Label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.attach_revised_backsheet}
                          onChange={(e) => {
                            updateField("attach_revised_backsheet", e.target.checked);
                            if (!e.target.checked) {
                              updateField("instructor_email", "");
                            }
                          }}
                          className="w-4 h-4 rounded border-slate-300"
                        />
                        <span>Attach revised backsheet and send to instructor</span>
                      </Label>
                      {formData.attach_revised_backsheet && (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label>Instructor Email</Label>
                            <Input
                              type="email"
                              value={formData.instructor_email}
                              onChange={e => updateField("instructor_email", e.target.value)}
                              placeholder="Enter instructor email"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleSendRevisedBacksheet}
                            disabled={revisedBacksheetSending || !canSendRevisedBacksheet}
                          >
                            {revisedBacksheetSending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending revised backsheet</> : "Send Revised Backsheet"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Alerts */}
        <AlertDialog open={showMilduraAlert} onOpenChange={setShowMilduraAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Mildura Travel Reminder</AlertDialogTitle>
              <AlertDialogDescription>
                If flying to Mildura, please ensure a special disbursement is sought for the cost of the airfare. Counsel must provide the flight booking receipt to support the disbursement request.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction>Understood</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showJailAlert} onOpenChange={setShowJailAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Jail Conference Fee Reminder</AlertDialogTitle>
              <AlertDialogDescription>
                Please make sure the jail conference fee is available to pay to counsel. Only one jail conference fee is payable under each grant of aid.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction>Understood</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showEmailSentAlert} onOpenChange={setShowEmailSentAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Email Sent</AlertDialogTitle>
              <AlertDialogDescription>
                {emailSentMessage}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setShowEmailSentAlert(false)}>OK</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showMilduraTravelDialog} onOpenChange={setShowMilduraTravelDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Please select a travel type for Mildura</AlertDialogTitle>
              <AlertDialogDescription>
                Choose whether this Mildura matter requires Flights or KM's.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={formData.mildura_travel_type === "flights" ? "default" : "outline"}
                onClick={() => {
                  updateField("mildura_travel_type", "flights");
                  updateField("travel_km", "");
                  setShowMilduraTravelDialog(false);
                }}
              >
                Flights
              </Button>
              <Button
                type="button"
                variant={formData.mildura_travel_type === "km" ? "default" : "outline"}
                onClick={() => {
                  updateField("mildura_travel_type", "km");
                  updateField("flight_cost", "");
                  setShowMilduraTravelDialog(false);
                }}
              >
                KM's
              </Button>
            </div>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setShowMilduraTravelDialog(false)}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={showTravelCalculator} onOpenChange={setShowTravelCalculator}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{travelCalculatorTarget === "amended" ? "Counsel Travel Calculator" : "Travel Calculator"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>From</Label>
                <Select value={travelFrom} onValueChange={setTravelFrom}>
                  <SelectTrigger><SelectValue placeholder="Select start location" /></SelectTrigger>
                  <SelectContent>
                    {TRAVEL_LOCATION_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>To</Label>
                <Input value={getTravelLocationKey(formData.location, formData.regional_location) || ""} readOnly placeholder="Select a court location first" />
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={calculateTravelFromLocations} disabled={!travelFrom || !getTravelLocationKey(formData.location, formData.regional_location)}>
                  Calculate distance
                </Button>
                {travelLookupError && <span className="text-xs text-red-600">{travelLookupError}</span>}
              </div>
              <div className="space-y-2">
                <Label>Raw kilometres</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={travelRawKm}
                  onChange={e => setTravelRawKm(e.target.value)}
                  placeholder="Enter or calculate total kms"
                />
              </div>
              <div className="rounded-lg bg-slate-50 p-3 text-sm space-y-1">
                <div className="flex justify-between"><span>Raw km</span><span>{Number.isFinite(parsedRawKm) ? `${parsedRawKm} km` : "—"}</span></div>
                <div className="flex justify-between"><span>Less 80 km</span><span>{Number.isFinite(parsedRawKm) ? `${KM_OFFSET} km` : "—"}</span></div>
                <div className="flex justify-between font-medium"><span>Final km amount</span><span>{Number.isFinite(parsedRawKm) ? `${calculatedFinalKm} km` : "—"}</span></div>
                <div className="flex justify-between font-semibold"><span>Total payable at $0.83/km</span><span>{Number.isFinite(parsedRawKm) ? calculatedTravelAmount : "—"}</span></div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowTravelCalculator(false)}>Cancel</Button>
              <Button type="button" onClick={applyTravelCalculation} disabled={!Number.isFinite(parsedRawKm)}>
                {travelCalculatorTarget === "amended" ? "Use counsel travel amount" : "Use km amount"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Email Backsheet</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>To</Label>
                  <Input type="email" value={emailDraft.to} onChange={e => updateEmailDraft("to", e.target.value)} placeholder="Enter recipient email" />
                </div>
                <div className="space-y-2">
                  <Label>CC</Label>
                  <Input value={emailDraft.cc} onChange={e => updateEmailDraft("cc", e.target.value)} placeholder="Enter cc recipients" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input value={emailDraft.subject} onChange={e => updateEmailDraft("subject", e.target.value)} placeholder="Enter email subject" />
              </div>
              <div className="space-y-2">
                <Label>Email Body</Label>
                <Textarea value={emailDraft.body} onChange={e => updateEmailDraft("body", e.target.value)} rows={10} placeholder="Enter email body" />
                <p className="text-xs text-slate-500">
                  {IS_REMOTE_EMAIL_MODE
                    ? "The backsheet PDF is included automatically, and any backsheet documents already uploaded are listed in the email."
                    : "In local mode, your default email program opens and the backsheet PDF is downloaded for manual attachment."}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEmailDialog(false)}>Cancel</Button>
              <Button type="button" onClick={handleSendBacksheetEmail} disabled={emailSending || !emailDraft.to}>
                {emailSent ? "Sent" : emailSending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending</> : <><Send className="mr-2 h-4 w-4" /> {IS_REMOTE_EMAIL_MODE ? "Send Email" : "Open Email App"}</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Actions */}
        {!isCounselMemoOnlyView && <div className="flex justify-end gap-3 pb-8 print:hidden">
          <Button variant="outline" onClick={resetForm} className="gap-2">
            <RotateCcw className="w-4 h-4" /> New Backsheet
          </Button>
          <Button variant="outline" onClick={openEmailDialog} className="gap-2">
            <Mail className="w-4 h-4" /> Email
          </Button>
          <Button onClick={() => window.print()} className="gap-2 bg-purple-600 hover:bg-purple-700">
            <Printer className="w-4 h-4" /> Print / Save PDF
          </Button>
        </div>}
      </div>
    </div>
  );
}
