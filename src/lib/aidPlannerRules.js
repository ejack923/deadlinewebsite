export function stageCoversAppearance(stage, appearance) {
  const map = {
    "Advice only": [],
    Mention: ["Mention", "Contest Mention", "Conference"],
    Bail: ["Bail Application"],
    Plea: ["Plea"],
    Sentence: ["Sentence"],
    Committal: ["Committal"],
    "Trial prep": ["Conference"],
    Trial: ["Trial"],
    Appeal: ["Appeal"],
    Other: ["Other"],
  };

  return (map[stage] || []).includes(appearance);
}

export function getMissingCoreFields(data) {
  const missing = [];
  if (!data?.matter?.matterType) missing.push("Matter type");
  if (!data?.aid?.aidType) missing.push("Aid type");
  if (!data?.aid?.aidNumber) missing.push("Aid number");
  if (!data?.matter?.court) missing.push("Court");
  if (!data?.matter?.location) missing.push("Location");
  if (!data?.matter?.appearanceType) missing.push("Next listing type");
  if (!data?.matter?.nextAppearanceDate) missing.push("Next listing date");
  if (!data?.aid?.applicationStatus) missing.push("Application status");
  if (data?.funding?.grantInPlace && !data?.funding?.currentStageCovered) missing.push("Current stage covered");
  return missing;
}

export function assessAppearanceClaims(data) {
  const items = Array.isArray(data?.appearanceClaims) ? data.appearanceClaims : [];
  const actionRequired = items.filter(
    (item) =>
      item.grantActionRequired &&
      item.grantActionRequired !== "No action"
  );
  const unclaimed = items.filter((item) => item.claimExpected && !item.claimLodged);
  const unpaid = items.filter((item) => item.claimLodged && !item.claimPaid);

  if (actionRequired.length > 0) {
    const extensionItems = actionRequired.filter((item) => item.grantActionRequired === "Extension likely needed");
    const newGrantItems = actionRequired.filter((item) =>
      item.grantActionRequired === "New grant likely needed" ||
      item.grantActionRequired === "New single summary grant required for contested hearing"
    );

    return {
      level:
        newGrantItems.length > 0
          ? "new_grant_needed"
          : extensionItems.length > 0
            ? "extension_needed"
            : "manual_review",
      title:
        newGrantItems.length > 0
          ? "A new grant may now be needed"
          : extensionItems.length > 0
            ? "An extension may now be needed"
            : "Appearance outcome needs review",
      summary:
        newGrantItems.length > 0
          ? "A recorded appearance outcome indicates that one or more matters may need a new grant path."
          : extensionItems.length > 0
            ? "A recorded appearance outcome indicates that an extension may now be required."
            : "A recorded appearance outcome has been marked for manual grant review.",
      items: actionRequired.map(
        (item) =>
          item.nextListingType ||
          item.outcome ||
          item.appearanceType ||
          item.date ||
          "Appearance"
      ),
    };
  }

  if (unclaimed.length > 0) {
    return {
      level: "claim_needed",
      title: "Appearance claim should be reviewed",
      summary: "One or more recorded appearances still look like they need an ATLAS claim to be lodged.",
      items: unclaimed.map((item) => item.appearanceType || item.date || "Appearance"),
    };
  }

  if (unpaid.length > 0) {
    return {
      level: "payment_follow_up",
      title: "Claim payment should be checked",
      summary: "One or more lodged claims have not yet been marked as paid.",
      items: unpaid.map((item) => item.appearanceType || item.date || "Appearance"),
    };
  }

  return null;
}

export function assessGrantCoverageRisk(data) {
  const items = Array.isArray(data?.externalWork) ? data.externalWork : [];
  const highRiskItems = [];
  const reviewItems = [];

  items.forEach((item) => {
    if (!item) return;
    const label = item.providerName || item.workRequested || item.providerType || "External work";

    const highRisk =
      !data?.funding?.grantInPlace ||
      item.coveredByCurrentGrant === "No" ||
      item.extensionLikelyNeeded === "Yes" ||
      item.newGrantLikelyNeeded === "Yes" ||
      item.paymentRisk === "High" ||
      ((item.providerEngaged || item.workCompleted) && item.coveredByCurrentGrant !== "Yes");

    const needsReview =
      item.coveredByCurrentGrant === "Review" ||
      item.extensionLikelyNeeded === "Review" ||
      item.newGrantLikelyNeeded === "Review" ||
      item.paymentRisk === "Medium";

    if (highRisk) {
      highRiskItems.push(label);
    } else if (needsReview) {
      reviewItems.push(label);
    }
  });

  if (highRiskItems.length > 0) {
    return {
      level: "high",
      title: "External provider at payment risk",
      summary: "One or more external engagements may need the right grant, a new grant, or an extension before work proceeds safely.",
      items: highRiskItems,
    };
  }

  if (reviewItems.length > 0) {
    return {
      level: "review",
      title: "Grant coverage should be reviewed",
      summary: "Some external work items still need grant coverage review before the lawyer can rely on them.",
      items: reviewItems,
    };
  }

  if (items.length > 0) {
    return {
      level: "covered",
      title: "External work appears covered",
      summary: "The recorded external engagements currently look consistent with the entered grant information.",
      items: [],
    };
  }

  return null;
}

export function assessAidPlanner(data) {
  const warnings = [];
  const coverageRisk = assessGrantCoverageRisk(data);
  const appearanceClaims = assessAppearanceClaims(data);

  if (!data.matter.matterType || !data.matter.court || !data.matter.nextAppearanceDate) {
    return {
      status: "missing_info",
      nextAction: "Complete the missing matter details before guidance can be given.",
      reasons: ["Matter type, court, and next appearance date are required."],
      warnings: [],
    };
  }

  if (data.application?.formCompleted && !data.application?.lodgedInAtlas) {
    return {
      status: "apply_now",
      nextAction: "Lodge the legal aid application in ATLAS.",
      reasons: [
        "The application form has been marked complete.",
        "The matter is not yet marked as lodged in ATLAS.",
      ],
      warnings,
    };
  }

  if (!data.funding.aidApplied && !data.funding.grantInPlace && !data.application?.lodgedInAtlas) {
    return {
      status: "apply_now",
      nextAction: "Apply for legal assistance now.",
      reasons: [
        "A future appearance is listed.",
        "No ATLAS lodgement or grant is currently recorded.",
      ],
      warnings,
    };
  }

  if (
    (data.application?.lodgedInAtlas || data.funding.aidApplied) &&
    !data.funding.grantInPlace &&
    (!data.application?.decisionReceived || !data.application?.decisionResult || data.application?.decisionResult === "Pending")
  ) {
    return {
      status: "waiting_on_vla",
      nextAction: "Await the VLA funding decision and monitor for follow-up requests.",
      reasons: [
        "The matter has been marked as lodged in ATLAS or as having an aid application recorded.",
        "A grant decision has not yet been recorded as final.",
      ],
      warnings,
    };
  }

  if (Array.isArray(data?.aid?.parsedAlerts) && data.aid.parsedAlerts.length > 0) {
    const highPriorityAlert = data.aid.parsedAlerts.find((alert) => alert.level === "error" || alert.level === "warning");
    if (highPriorityAlert) {
      return {
        status: highPriorityAlert.recommendedStatus || "manual_review",
        nextAction: highPriorityAlert.nextAction || "Review the uploaded aid letter and confirm the next grant action.",
        reasons: [
          "The uploaded aid letter includes a grant condition or outcome that requires attention.",
          highPriorityAlert.message,
        ],
        warnings: data.aid.parsedAlerts
          .filter((alert) => alert !== highPriorityAlert)
          .map((alert) => alert.message),
      };
    }
  }

  if (data.application?.decisionReceived && data.application?.decisionResult === "Refused") {
    return {
      status: "manual_review",
      nextAction: "Review the refusal outcome and decide whether a fresh application, changed grant type, or other follow-up is needed.",
      reasons: [
        "A grant decision has been recorded.",
        "The recorded decision result is refused.",
      ],
      warnings,
    };
  }

  if (
    data.funding.grantInPlace &&
    data.matter.appearanceType &&
    data.funding.currentStageCovered &&
    !stageCoversAppearance(data.funding.currentStageCovered, data.matter.appearanceType)
  ) {
    return {
      status: "extension_review",
      nextAction: coverageRisk?.level === "high" ? "Review grant coverage before engaging or paying the next provider work." : "Review and request an extension before the next appearance.",
      reasons: [
        "A grant is in place.",
        "The selected appearance does not appear to be covered by the current stage.",
        ...(coverageRisk ? [coverageRisk.summary] : []),
      ],
      warnings,
    };
  }

  if (data.funding.extensionRequested && !data.funding.extensionDecision) {
    warnings.push("An extension has been requested but no decision is recorded yet.");
  }

  if (appearanceClaims?.level === "new_grant_needed") {
    return {
      status: "extension_review",
      nextAction: "Review the appearance outcome and apply for the new grant now required.",
      reasons: [
        "A recorded appearance outcome has been marked as requiring a new grant path.",
        appearanceClaims.summary,
      ],
      warnings,
    };
  }

  if (appearanceClaims?.level === "extension_needed") {
    return {
      status: "extension_review",
      nextAction: "Review the appearance outcome and prepare the required extension.",
      reasons: [
        "A recorded appearance outcome has been marked as requiring an extension.",
        appearanceClaims.summary,
      ],
      warnings,
    };
  }

  if (appearanceClaims?.level === "manual_review") {
    return {
      status: "manual_review",
      nextAction: "Review the appearance outcome to confirm the next grant action.",
      reasons: [
        "A recorded appearance outcome has been marked for manual review.",
        appearanceClaims.summary,
      ],
      warnings,
    };
  }

  if (appearanceClaims?.level === "claim_needed") {
    return {
      status: "ready_to_bill",
      nextAction: "Review the recorded appearance and lodge the matching ATLAS claim.",
      reasons: [
        "At least one appearance has been recorded as needing a claim.",
        appearanceClaims.summary,
      ],
      warnings,
    };
  }

  if (data.finalisation?.matterFinalised && !data.finalisation?.outcomeEnteredInAtlas) {
    return {
      status: "manual_review",
      nextAction: "Enter the matter outcome in ATLAS before closing the grant workflow.",
      reasons: [
        "The matter has been marked finalised.",
        "The final outcome has not yet been marked as entered in ATLAS.",
      ],
      warnings,
    };
  }

  if (data.finalisation?.outcomeEnteredInAtlas && !data.finalisation?.grantClosed) {
    return {
      status: "manual_review",
      nextAction: "Close the grant once the final outcome work is complete.",
      reasons: [
        "A final outcome has been marked as entered in ATLAS.",
        "The grant is not yet marked as closed.",
      ],
      warnings,
    };
  }

  if (data.funding.grantInPlace && data.matter.currentAppearanceComplete) {
    return {
      status: "ready_to_bill",
      nextAction: "Review the covered items and prepare billing.",
      reasons: [
        "A grant is in place.",
        "The current appearance is marked complete.",
        ...(coverageRisk?.level === "covered" ? ["External work currently appears covered."] : []),
        ...(appearanceClaims?.level === "payment_follow_up" ? [appearanceClaims.summary] : []),
      ],
      warnings,
    };
  }

  if (coverageRisk?.level === "high") {
    return {
      status: "extension_review",
      nextAction: "Review grant coverage before further work is briefed or paid.",
      reasons: [
        "An external work item has been marked as not clearly covered.",
        coverageRisk.summary,
      ],
      warnings,
    };
  }

  return {
    status: "covered",
    nextAction: "Matter appears covered at the current stage.",
    reasons: [
      "A grant is in place.",
      "The selected appearance appears consistent with the covered stage.",
      ...(coverageRisk?.level === "covered" ? ["External work currently appears covered."] : []),
      ...(coverageRisk?.level === "review" ? [coverageRisk.summary] : []),
      ...(appearanceClaims?.level === "payment_follow_up" ? [appearanceClaims.summary] : []),
    ],
    warnings,
  };
}
