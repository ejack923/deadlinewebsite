import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { createPageUrl } from "@/utils";
import { createPlanner } from "@/lib/aidPlannerSchema";
import { assessAidPlanner, getMissingCoreFields } from "@/lib/aidPlannerRules";
import { downloadPlannerIcs, downloadPlannerJson, parsePlannerJson } from "@/lib/aidPlannerExport";
import { getLastOpenedMatterId, loadMatterFromDevice, saveMatterToDevice, setLastOpenedMatterId } from "@/lib/aidPlannerStore";
import PlannerActionsBar from "@/components/aid-planner/PlannerActionsBar";
import GuidancePanel from "@/components/aid-planner/GuidancePanel";
import MinimumInfoForm from "@/components/aid-planner/MinimumInfoForm";
import OptionalMatterDetails from "@/components/aid-planner/OptionalMatterDetails";
import PlannerSidebar from "@/components/aid-planner/PlannerSidebar";
import { Chip } from "@/components/aid-planner/PlannerFields";
import PracticeManagerImportModal from "@/components/aid-planner/PracticeManagerImportModal";
import { getPracticeManagerAdapter, practiceManagerAdapters } from "@/lib/aidPlannerAdapters";
import AidLifecycleSection from "@/components/aid-planner/AidLifecycleSection";
import { createAppearanceClaim } from "@/lib/aidPlannerSchema";
import { applyPlannerAppearanceFeeDefaults } from "@/lib/aidPlannerCriminalFees";
import { inferCriminalAidPathway } from "@/lib/criminalAidFramework";
import { deriveGrantActionAfterOutcome, inferOutcomeFromText } from "@/lib/aidPlannerAppearanceImport";

function updateTimestamp(data) {
  return { ...data, updatedAt: new Date().toISOString() };
}

function applyInferredCriminalPathway(nextPlanner) {
  const inferredPathway = inferCriminalAidPathway({
    matterType: nextPlanner.matter.matterType,
    court: nextPlanner.matter.court,
    appearanceType: nextPlanner.matter.appearanceType,
    appealCostsCertificateGranted: nextPlanner.criminal.appealCostsCertificateGranted,
  });

  if (!inferredPathway) {
    if (nextPlanner.matter.matterType !== "Criminal") {
      return {
        ...nextPlanner,
        criminal: {
          ...nextPlanner.criminal,
          pathwayId: "",
          pathwayLabel: "",
          feeTableRef: "",
          feeScheduleRef: "",
        },
      };
    }
    return nextPlanner;
  }

  return {
    ...nextPlanner,
    criminal: {
      ...nextPlanner.criminal,
      pathwayId: inferredPathway.id,
      pathwayLabel: inferredPathway.label,
      feeTableRef: inferredPathway.feeTableRef,
      feeScheduleRef: inferredPathway.feeScheduleRef,
    },
  };
}

function syncFundingFromApplicationStatus(planner, applicationStatus) {
  const nextFunding = { ...planner.funding };
  const nextApplication = { ...planner.application };

  if (applicationStatus === "Aid not applied for") {
    nextFunding.aidApplied = false;
    nextFunding.grantInPlace = false;
    nextApplication.lodgedInAtlas = false;
    nextApplication.decisionReceived = false;
    nextApplication.decisionResult = "";
  } else if (applicationStatus === "Application applied for - Pending" || applicationStatus === "Aid applied for") {
    nextFunding.aidApplied = true;
    nextFunding.grantInPlace = false;
    nextApplication.lodgedInAtlas = true;
    nextApplication.decisionReceived = false;
    nextApplication.decisionResult = "Pending";
  } else if (applicationStatus === "Aid granted") {
    nextFunding.aidApplied = true;
    nextFunding.grantInPlace = true;
    nextApplication.lodgedInAtlas = true;
    nextApplication.decisionReceived = true;
    nextApplication.decisionResult = "Granted";
  } else if (applicationStatus === "Aid refused") {
    nextFunding.aidApplied = true;
    nextFunding.grantInPlace = false;
    nextApplication.lodgedInAtlas = true;
    nextApplication.decisionReceived = true;
    nextApplication.decisionResult = "Refused";
  }

  return {
    ...planner,
    funding: nextFunding,
    application: nextApplication,
  };
}

function applyImportedMatter(prev, adapter, selectedMatter) {
  if (!adapter || !selectedMatter) return prev;

  const client = {
    ...prev.client,
    ...selectedMatter.client,
    fullName:
      selectedMatter.client?.fullName ||
      [selectedMatter.client?.firstName, selectedMatter.client?.lastName].filter(Boolean).join(" "),
  };

  const nextAppearanceDate =
    selectedMatter.matter?.nextAppearanceDate && /^\d{4}-\d{2}-\d{2}$/.test(selectedMatter.matter.nextAppearanceDate)
      ? selectedMatter.matter.nextAppearanceDate
      : prev.matter.nextAppearanceDate;

  return updateTimestamp({
    ...prev,
    source: {
      type: "pms",
      provider: adapter.name,
      externalId: selectedMatter.externalId || "",
      actionstep: selectedMatter.actionstep || {},
    },
    client,
    matter: {
      ...prev.matter,
      ...selectedMatter.matter,
      nextAppearanceDate,
    },
  });
}

export default function AidPlanner() {
  const [planner, setPlanner] = useState(() => createPlanner());
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedAdapterId, setSelectedAdapterId] = useState("");
  const [actionstepSession, setActionstepSession] = useState(null);
  const fileInputRef = useRef(null);

  const guidance = useMemo(() => assessAidPlanner(planner), [planner]);
  const missingCoreFields = useMemo(() => getMissingCoreFields(planner), [planner]);
  const selectedAdapter = useMemo(() => getPracticeManagerAdapter(selectedAdapterId), [selectedAdapterId]);

  useEffect(() => {
    const lastId = getLastOpenedMatterId();
    const lastMatter = loadMatterFromDevice(lastId);
    if (lastMatter) {
      setPlanner(lastMatter);
    }
  }, []);

  useEffect(() => {
    saveMatterToDevice({ ...planner, guidance });
    setLastOpenedMatterId(planner.matterId);
  }, [planner, guidance]);

  const setClientField = (field, value) => {
    setPlanner((prev) => {
      const client = { ...prev.client, [field]: value };
      client.fullName = [client.firstName, client.lastName].filter(Boolean).join(" ");
      return updateTimestamp({ ...prev, client });
    });
  };

  const setMatterField = (field, value) => {
    setPlanner((prev) =>
      updateTimestamp(
        applyInferredCriminalPathway({
          ...prev,
          matter: { ...prev.matter, [field]: value },
        })
      )
    );
  };

  const setAidField = (field, value) => {
    setPlanner((prev) => {
      let next = {
        ...prev,
        aid: { ...prev.aid, [field]: value },
      };

      if (field === "aidType") {
        next.aid.aidTypeList = value
          .split(";")
          .map((item) => item.trim())
          .filter(Boolean);
      }

      if (field === "aidTypeList") {
        next.aid.aidType = Array.isArray(value) ? value.filter(Boolean).join("; ") : prev.aid.aidType;
      }

      if (field === "applicationStatus") {
        next = syncFundingFromApplicationStatus(next, value);
      }

      return updateTimestamp(next);
    });
  };

  const setFundingField = (field, value) => {
    setPlanner((prev) => updateTimestamp({ ...prev, funding: { ...prev.funding, [field]: value } }));
  };

  const setFinalisationField = (field, value) => {
    setPlanner((prev) => updateTimestamp({ ...prev, finalisation: { ...prev.finalisation, [field]: value } }));
  };

  const setNotes = (value) => {
    setPlanner((prev) => updateTimestamp({ ...prev, notes: value }));
  };

  const addAppearanceClaim = (initialValues = {}) => {
    setPlanner((prev) => {
      const baseClaim = createAppearanceClaim();
      const newClaim = { ...baseClaim, ...initialValues };
      
      // If an appearanceType is provided, try to apply fee defaults
      const finalClaim = initialValues.appearanceType && initialValues.appearanceType !== "Other"
        ? applyPlannerAppearanceFeeDefaults(newClaim, prev.matter.court, initialValues.appearanceType, prev.aid?.aidTypeList || [])
        : newClaim;

      return updateTimestamp({
        ...prev,
        appearanceClaims: [...(prev.appearanceClaims || []), finalClaim],
      });
    });
  };

  const updateAppearanceClaim = (id, field, value) => {
    setPlanner((prev) =>
      updateTimestamp({
        ...prev,
        appearanceClaims: (prev.appearanceClaims || []).map((item) => {
          if (item.id !== id) return item;
          if (field === "appearanceType") {
            const nextClaim = applyPlannerAppearanceFeeDefaults(
              item,
              prev.matter.court,
              value,
              prev.aid?.aidTypeList || []
            );
            return {
              ...nextClaim,
              customAppearanceType: value === "Other" ? nextClaim.customAppearanceType || "" : "",
              grantActionRequired: deriveGrantActionAfterOutcome(prev, {
                ...nextClaim,
                appearanceType: value,
              }),
            };
          }
          const nextClaim = { ...item, [field]: value };
          if (field === "notes" && !nextClaim.outcome) {
            nextClaim.outcome = inferOutcomeFromText(value);
          }
          if (field === "outcome" || field === "customAppearanceType" || field === "notes") {
            nextClaim.grantActionRequired = deriveGrantActionAfterOutcome(prev, nextClaim);
          }
          return nextClaim;
        }),
      })
    );
  };

  const removeAppearanceClaim = (id) => {
    setPlanner((prev) =>
      updateTimestamp({
        ...prev,
        appearanceClaims: (prev.appearanceClaims || []).filter((item) => item.id !== id),
      })
    );
  };

  const importAppearanceClaims = (importedClaims) => {
    setPlanner((prev) =>
      updateTimestamp({
        ...prev,
        appearanceClaims: [
          ...(prev.appearanceClaims || []),
          ...importedClaims.map((claim) => {
            const base = createAppearanceClaim();
            const appearanceType = claim.appearanceType || "Other";
            const withDefaults =
              appearanceType && appearanceType !== "Other"
                ? applyPlannerAppearanceFeeDefaults(base, prev.matter.court, appearanceType, prev.aid?.aidTypeList || [])
                : { ...base, appearanceType };
            const nextClaim = {
              ...withDefaults,
              date: claim.date || withDefaults.date,
              appearanceType,
              customAppearanceType: claim.customAppearanceType || "",
              outcome: claim.outcome || inferOutcomeFromText(claim.notes || ""),
              notes: claim.notes || "",
              importSource: claim.importSource || "",
              claimedUnits: claim.claimedUnits || "",
            };
            return {
              ...nextClaim,
              grantActionRequired: deriveGrantActionAfterOutcome(prev, nextClaim),
            };
          }),
        ],
      })
    );
  };

  const handleDownloadPlanner = () => {
    downloadPlannerJson(planner, guidance);
  };

  const handleUploadPlanner = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setPlanner(parsePlannerJson(text));
    event.target.value = "";
  };

  const handleExportCalendar = () => {
    downloadPlannerIcs(planner, guidance);
  };

  const handlePrintSummary = () => {
    window.print();
  };

  const handleConfirmPracticeManager = (adapter, selectedMatter, session) => {
    setSelectedAdapterId(adapter.id);
    if (session?.provider === "actionstep" && session.apiEndpoint && session.accessToken) {
      setActionstepSession(session);
    }
    if (selectedMatter) {
      setPlanner((prev) => applyImportedMatter(prev, adapter, selectedMatter));
      setShowAdvanced(true);
    }
    setImportModalOpen(false);
  };

  const resetPlanner = () => {
    setPlanner(createPlanner());
    setSelectedAdapterId("");
    setActionstepSession(null);
  };

  const handleAidLetterParsed = (payload, fileName) => {
    const fields = payload?.fields || {};
    setPlanner((prev) =>
      updateTimestamp(
        applyInferredCriminalPathway(
          syncFundingFromApplicationStatus(
            (() => {
              const isApprovalLetter = fields.documentType === "grant_approval_letter";
              const nextUploadedLetterName =
                fileName && prev.aid.uploadedLetterName && prev.aid.uploadedLetterName !== fileName
                  ? `${prev.aid.uploadedLetterName} | ${fileName}`
                  : fileName || prev.aid.uploadedLetterName;

              return {
                ...prev,
                matter: {
                  ...prev.matter,
                  matterType: isApprovalLetter ? (prev.matter.matterType || fields.matterType) : (fields.matterType || prev.matter.matterType),
                  court: isApprovalLetter ? (prev.matter.court || fields.court) : (fields.court || prev.matter.court),
                  location: isApprovalLetter ? (prev.matter.location || fields.location) : (fields.location || prev.matter.location),
                  appearanceType: isApprovalLetter ? (prev.matter.appearanceType || fields.listingType) : (fields.listingType || prev.matter.appearanceType),
                  nextAppearanceDate: isApprovalLetter ? (prev.matter.nextAppearanceDate || fields.listingDate) : (fields.listingDate || prev.matter.nextAppearanceDate),
                },
                aid: {
                  ...prev.aid,
                  aidType: isApprovalLetter ? (prev.aid.aidType || fields.aidType) : (fields.aidType || prev.aid.aidType),
                  aidTypeList:
                    isApprovalLetter
                      ? (prev.aid.aidTypeList?.length ? prev.aid.aidTypeList : Array.isArray(fields.aidTypeList) ? fields.aidTypeList : prev.aid.aidTypeList)
                      : (Array.isArray(fields.aidTypeList) && fields.aidTypeList.length > 0 ? fields.aidTypeList : prev.aid.aidTypeList),
                  guideline: isApprovalLetter ? (prev.aid.guideline || fields.guideline) : (fields.guideline || prev.aid.guideline),
                  aidNumber: fields.aidNumber || prev.aid.aidNumber,
                  extensionNumber: fields.extensionNumber || prev.aid.extensionNumber || "",
                  effectiveDate: isApprovalLetter
                    ? (fields.effectiveDate || prev.aid.effectiveDate)
                    : (prev.aid.effectiveDate || fields.effectiveDate),
                  applicationStatus: fields.applicationStatus || prev.aid.applicationStatus,
                  uploadedLetterName: nextUploadedLetterName,
                  custodyStatus: isApprovalLetter ? (prev.aid.custodyStatus || fields.custodyStatus) : (fields.custodyStatus || prev.aid.custodyStatus),
                  documentType: fields.documentType || prev.aid.documentType,
                  parsedAlerts: Array.isArray(payload?.parsedAlerts) ? payload.parsedAlerts : [],
                  conflictFlags: Array.isArray(payload?.conflictFlags) ? payload.conflictFlags : [],
                },
              };
            })(),
            fields.applicationStatus || prev.aid.applicationStatus
          )
        )
      )
    );
  };

  return (
    <div className="min-h-screen bg-slate-50" id="aid-planner-print">
      <style>{`
        @media print {
          body { background: white !important; }
          .aid-planner-no-print { display: none !important; }
          .aid-planner-print-card { box-shadow: none !important; border: 1px solid #d1d5db !important; }
          .aid-planner-print-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="aid-planner-no-print bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-4">
        <a
          href={createPageUrl("Home")}
          className="flex items-center gap-2 text-slate-600 hover:text-purple-600 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Portal
        </a>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="aid-planner-print-card bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold uppercase tracking-wide">
                <CalendarDays className="w-3.5 h-3.5" />
                Portable matter planner
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mt-3">Aid Planner</h1>
              <p className="text-slate-500 mt-2 max-w-2xl">
                Assess whether aid should be applied for, whether an extension is likely needed, and what appears billable now. Nothing is stored in the app long-term.
              </p>
            </div>

            <PlannerActionsBar
              onUploadClick={() => fileInputRef.current?.click()}
              onOpenPracticeManagerImport={() => setImportModalOpen(true)}
              onDownload={handleDownloadPlanner}
              onExportCalendar={handleExportCalendar}
              onPrint={handlePrintSummary}
              onReset={resetPlanner}
            />
            <input ref={fileInputRef} type="file" accept=".json,application/json" onChange={handleUploadPlanner} className="hidden" />
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Chip>{guidance.status.replaceAll("_", " ")}</Chip>
            {planner.matter.nextAppearanceDate && <Chip>Next appearance: {planner.matter.nextAppearanceDate}</Chip>}
            {planner.funding.vlaReference && <Chip>VLA ref: {planner.funding.vlaReference}</Chip>}
            {planner.client.fullName && <Chip>{planner.client.fullName}</Chip>}
            {planner.application.lodgedInAtlas && <Chip>ATLAS lodged</Chip>}
            {planner.finalisation.matterFinalised && <Chip>Matter finalised</Chip>}
          </div>

          <div className="aid-planner-print-grid grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
            <div className="xl:col-span-2 space-y-6">
              <OptionalMatterDetails
                planner={planner}
                setClientField={setClientField}
                setMatterField={setMatterField}
                setFundingField={setFundingField}
              />

              <MinimumInfoForm
                planner={planner}
                missingCoreFields={missingCoreFields}
                showAdvanced={showAdvanced}
                onToggleAdvanced={setShowAdvanced}
                setMatterField={setMatterField}
                setFundingField={setFundingField}
                setAidField={setAidField}
                onAidLetterParsed={handleAidLetterParsed}
              />

              <AidLifecycleSection
                planner={planner}
                setFinalisationField={setFinalisationField}
                addAppearanceClaim={addAppearanceClaim}
                updateAppearanceClaim={updateAppearanceClaim}
                removeAppearanceClaim={removeAppearanceClaim}
                importAppearanceClaims={importAppearanceClaims}
              />
            </div>

            <div className="space-y-6">
              <GuidancePanel guidance={guidance} />
              <PlannerSidebar showAdvanced={showAdvanced} notes={planner.notes} setNotes={setNotes} selectedAdapter={selectedAdapter} />
            </div>
          </div>
        </div>
      </div>

      <PracticeManagerImportModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        adapters={practiceManagerAdapters}
        onConfirmAdapter={handleConfirmPracticeManager}
      />
    </div>
  );
}
