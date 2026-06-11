import React, { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  CheckCircle2,
  CircleDashed,
  DatabaseZap,
  Link2,
  LoaderCircle,
  LogIn,
  Search,
  UserRoundSearch,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createAdapterPreview } from "@/lib/aidPlannerAdapters/baseAdapter";
import {
  ACTIONSTEP_ENVIRONMENTS,
  buildActionstepAuthorizeUrl,
  clearActionstepOAuthDraft,
  exchangeActionstepCode,
  loadActionstepOAuthDraft,
  saveActionstepOAuthDraft,
  searchActionstepMatters,
  listAllActionstepMatters,
} from "@/lib/aidPlannerAdapters/actionstepClient";

function AdapterBadge({ stage }) {
  if (stage === "adapter-ready") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Ready next
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
      <CircleDashed className="h-3.5 w-3.5" />
      Planned
    </span>
  );
}

export default function PracticeManagerImportModal({
  open,
  onOpenChange,
  adapters,
  onConfirmAdapter,
}) {
  const [selectedAdapterId, setSelectedAdapterId] = useState(adapters[0]?.id || "");
  const [isConnected, setIsConnected] = useState(false);
  const [searchMode, setSearchMode] = useState("preview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMatterId, setSelectedMatterId] = useState("");
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [oauthEnvironment, setOauthEnvironment] = useState("production");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [scopes, setScopes] = useState("");
  const [redirectUri, setRedirectUri] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [oauthError, setOauthError] = useState("");
  const [oauthSuccess, setOauthSuccess] = useState("");
  const [isExchangingCode, setIsExchangingCode] = useState(false);
  const [liveResults, setLiveResults] = useState([]);
  const [liveError, setLiveError] = useState("");
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const [isImportingAll, setIsImportingAll] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelectedAdapterId((current) => current || adapters[0]?.id || "");
    setIsConnected(false);
    setSearchMode("preview");
    setSearchQuery("");
    setSelectedMatterId("");
    setApiEndpoint("");
    setAccessToken("");
    setOauthEnvironment("production");
    setClientId("");
    setClientSecret("");
    setScopes("");
    setRedirectUri("");
    setAuthCode("");
    setOauthError("");
    setOauthSuccess("");
    setLiveResults([]);
    setLiveError("");
    setIsSearchingLive(false);
  }, [open, adapters]);

  useEffect(() => {
    if (!open) return;

    const draft = loadActionstepOAuthDraft();
    const params = new URLSearchParams(window.location.search);
    const returnedCode = params.get("code") || "";

    setOauthEnvironment(draft?.environment || "production");
    setClientId(draft?.clientId || "");
    setClientSecret(draft?.clientSecret || "");
    setScopes(draft?.scopes || "");
    setRedirectUri(
      draft?.redirectUri ||
        `${window.location.origin}${window.location.pathname}`
    );
    setAuthCode(returnedCode);
  }, [open]);

  const selectedAdapter = useMemo(
    () => adapters.find((adapter) => adapter.id === selectedAdapterId) || adapters[0] || null,
    [adapters, selectedAdapterId]
  );

  const preview = selectedAdapter ? createAdapterPreview(selectedAdapter) : null;
  const canConfirm = selectedAdapter?.stage === "adapter-ready";

  const previewResults = useMemo(() => {
    if (!selectedAdapter?.supportsStubSearch) return [];
    const query = searchQuery.trim().toLowerCase();
    if (!query) return selectedAdapter.sampleMatters || [];

    return (selectedAdapter.sampleMatters || []).filter((matter) => {
      const haystack = [
        matter.client?.fullName,
        matter.client?.fileNumber,
        matter.matter?.summary,
        matter.matter?.court,
        matter.matter?.lawyer,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [selectedAdapter, searchQuery]);

  const visibleResults = searchMode === "live" ? liveResults : previewResults;

  const selectedMatter = useMemo(
    () => visibleResults.find((matter) => matter.externalId === selectedMatterId) || null,
    [visibleResults, selectedMatterId]
  );

  const modalStyle = {
    width: "min(1100px, 98vw)",
    maxWidth: "98vw",
    height: "92vh",
    top: "1rem",
    left: "50%",
    transform: "translateX(-50%)",
    overflowY: "auto",
  };

  const contentGridStyle = {
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  };

  const handleLiveSearch = async () => {
    setLiveError("");
    setIsSearchingLive(true);
    setSelectedMatterId("");

    try {
      const results = await searchActionstepMatters({
        apiEndpoint,
        accessToken,
        query: searchQuery,
      });
      setLiveResults(results);
    } catch (error) {
      setLiveResults([]);
      setLiveError(error instanceof Error ? error.message : "Actionstep search failed.");
    } finally {
      setIsSearchingLive(false);
    }
  };

  const handleImportAll = async () => {
    setLiveError("");
    setIsImportingAll(true);
    try {
      const results = await listAllActionstepMatters({
        apiEndpoint,
        accessToken,
      });
      if (results.length === 0) {
        setLiveError("No matters found to import.");
        return;
      }
      onConfirmAdapter(selectedAdapter, results, {
        provider: selectedAdapter.id,
        mode: "live",
        apiEndpoint,
        accessToken,
      });
    } catch (error) {
      setLiveError(error instanceof Error ? error.message : "Import all failed.");
    } finally {
      setIsImportingAll(false);
    }
  };

  const handleStartOAuth = () => {
    setOauthError("");
    setOauthSuccess("");

    if (!clientId.trim() || !scopes.trim() || !redirectUri.trim()) {
      setOauthError("Client ID, scopes, and redirect URI are required before starting Actionstep sign-in.");
      return;
    }

    saveActionstepOAuthDraft({
      environment: oauthEnvironment,
      clientId,
      clientSecret,
      scopes,
      redirectUri,
    });

    window.location.href = buildActionstepAuthorizeUrl({
      environment: oauthEnvironment,
      clientId,
      scopes,
      redirectUri,
    });
  };

  const handleExchangeCode = async () => {
    setOauthError("");
    setOauthSuccess("");
    setLiveError("");

    if (!clientId.trim() || !clientSecret.trim() || !redirectUri.trim() || !authCode.trim()) {
      setOauthError("Client ID, client secret, redirect URI, and returned authorization code are required.");
      return;
    }

    setIsExchangingCode(true);
    try {
      const tokenData = await exchangeActionstepCode({
        environment: oauthEnvironment,
        clientId,
        clientSecret,
        redirectUri,
        code: authCode,
      });

      setAccessToken(tokenData.access_token || "");
      setApiEndpoint(tokenData.api_endpoint || "");
      setOauthSuccess("Actionstep token exchange succeeded. Live matter search is ready.");
      clearActionstepOAuthDraft();

      const params = new URLSearchParams(window.location.search);
      if (params.has("code")) {
        params.delete("code");
        const nextQuery = params.toString();
        const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}`;
        window.history.replaceState({}, "", nextUrl);
      }
    } catch (error) {
      setOauthError(error instanceof Error ? error.message : "Actionstep token exchange failed.");
    } finally {
      setIsExchangingCode(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="!left-1/2 !top-4 !flex !h-[92vh] !w-[98vw] !max-w-[98vw] !translate-x-[-50%] !translate-y-0 !overflow-y-scroll flex-col p-0 sm:!max-w-6xl"
        style={modalStyle}
      >
        <div className="shrink-0 border-b border-slate-200 bg-slate-50 px-4 py-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <BriefcaseBusiness className="h-5 w-5 text-purple-600" />
              Import from practice manager
            </DialogTitle>
            <DialogDescription className="max-w-3xl text-sm text-slate-600">
              Choose the connector path you want to use. The planner still stays local-first: imported matter details are used in the browser and kept on the user&apos;s device or downloaded file, not in a central app database.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="min-h-0 flex-1 px-4 py-4">
          <div className="grid gap-4" style={contentGridStyle}>
          <section className="pr-2">
            <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Available connectors</h3>
            <div className="space-y-2">
              {adapters.map((adapter) => {
                const isSelected = adapter.id === selectedAdapterId;
                return (
                  <button
                    key={adapter.id}
                    type="button"
                    onClick={() => setSelectedAdapterId(adapter.id)}
                    className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                      isSelected
                        ? "border-purple-300 bg-purple-50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-slate-900">{adapter.name}</div>
                        <p className={`mt-1 text-xs text-slate-600 ${isSelected ? "" : "line-clamp-2"}`}>{adapter.description}</p>
                      </div>
                      <AdapterBadge stage={adapter.stage} />
                    </div>
                  </button>
                );
              })}
            </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 pr-3">
            {selectedAdapter && preview ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <DatabaseZap className="h-4 w-4 text-purple-600" />
                    <h3 className="text-lg font-semibold text-slate-900">{preview.title}</h3>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{preview.connectSummary}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="text-sm font-semibold text-slate-900">Fields to prefill</div>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      {preview.importFields.map((field) => (
                        <li key={field}>- {field}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="text-sm font-semibold text-slate-900">Fields to keep manual</div>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      {preview.manualFields.map((field) => (
                        <li key={field}>- {field}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {preview.writeBackOptions.length > 0 && (
                  <div className="rounded-xl border border-dashed border-slate-200 p-3">
                    <div className="text-sm font-semibold text-slate-900">Optional later write-back</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {preview.writeBackOptions.map((option) => (
                        <span key={option} className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          {option}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedAdapter?.supportsStubSearch && (
                  <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSearchMode("preview");
                          setSelectedMatterId("");
                          setLiveError("");
                        }}
                        className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                          searchMode === "preview"
                            ? "bg-purple-600 text-white"
                            : "border border-slate-200 bg-white text-slate-600"
                        }`}
                      >
                        Preview mode
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchMode("live");
                          setSelectedMatterId("");
                        }}
                        className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                          searchMode === "live"
                            ? "bg-purple-600 text-white"
                            : "border border-slate-200 bg-white text-slate-600"
                        }`}
                      >
                        Live API mode
                      </button>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">Actionstep import flow</div>
                        <p className="mt-1 text-sm text-slate-600">
                          {searchMode === "live"
                            ? "Use the api_endpoint and access_token returned by Actionstep OAuth to test a real matter search without storing credentials in the app."
                            : "This is a stubbed connector flow so we can prove the import experience before wiring a full OAuth callback."}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsConnected((current) => !current)}
                        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
                          isConnected
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-purple-600 text-white hover:bg-purple-700"
                        }`}
                      >
                        <Link2 className="h-4 w-4" />
                        {isConnected ? "Actionstep connected" : "Connect to Actionstep"}
                      </button>
                    </div>

                    {isConnected && (
                      <div className="space-y-4">
                        {searchMode === "live" && (
                          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                              <label className="block space-y-1">
                                <span className="text-sm font-medium text-slate-700">Environment</span>
                                <select
                                  value={oauthEnvironment}
                                  onChange={(e) => setOauthEnvironment(e.target.value)}
                                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-700"
                                >
                                  {Object.keys(ACTIONSTEP_ENVIRONMENTS).map((key) => (
                                    <option key={key} value={key}>
                                      {key === "production" ? "Production" : "Staging"}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label className="block space-y-1">
                                <span className="text-sm font-medium text-slate-700">Scopes</span>
                                <input
                                  value={scopes}
                                  onChange={(e) => setScopes(e.target.value)}
                                  placeholder="Space-separated Actionstep scopes"
                                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-700"
                                />
                              </label>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                              <label className="block space-y-1">
                                <span className="text-sm font-medium text-slate-700">Client ID</span>
                                <input
                                  value={clientId}
                                  onChange={(e) => setClientId(e.target.value)}
                                  placeholder="Actionstep client ID"
                                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-700"
                                />
                              </label>
                              <label className="block space-y-1">
                                <span className="text-sm font-medium text-slate-700">Client secret</span>
                                <input
                                  value={clientSecret}
                                  onChange={(e) => setClientSecret(e.target.value)}
                                  placeholder="Actionstep client secret"
                                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-700"
                                />
                              </label>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                              <label className="block space-y-1">
                                <span className="text-sm font-medium text-slate-700">Redirect URI</span>
                                <input
                                  value={redirectUri}
                                  onChange={(e) => setRedirectUri(e.target.value)}
                                  placeholder={`${window.location.origin}${window.location.pathname}`}
                                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-700"
                                />
                              </label>
                              <label className="block space-y-1">
                                <span className="text-sm font-medium text-slate-700">Returned authorization code</span>
                                <input
                                  value={authCode}
                                  onChange={(e) => setAuthCode(e.target.value)}
                                  placeholder="Paste the code from Actionstep if needed"
                                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-700"
                                />
                              </label>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                              <button
                                type="button"
                                onClick={handleStartOAuth}
                                className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                              >
                                <LogIn className="h-4 w-4" />
                                Start Actionstep sign-in
                              </button>
                              <button
                                type="button"
                                onClick={handleExchangeCode}
                                disabled={isExchangingCode}
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-purple-300 hover:text-purple-700 disabled:cursor-not-allowed disabled:bg-slate-100"
                              >
                                {isExchangingCode && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                Exchange returned code
                              </button>
                            </div>

                            {oauthError && (
                              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                                {oauthError}
                              </div>
                            )}

                            {oauthSuccess && (
                              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                                {oauthSuccess}
                              </div>
                            )}

                            <p className="text-xs text-slate-500">
                              Actionstep’s official docs say the authorize flow returns an authorization code to your redirect URI, and the token response returns both the bearer token and the `api_endpoint` to use for API requests.
                            </p>
                          </div>
                        )}

                        {searchMode === "live" && (
                          <div className="grid gap-4 sm:grid-cols-2">
                            <label className="block space-y-1">
                              <span className="text-sm font-medium text-slate-700">Actionstep api_endpoint</span>
                              <input
                                value={apiEndpoint}
                                onChange={(e) => setApiEndpoint(e.target.value)}
                                placeholder="https://ap-southeast-2.actionstep.com/api/"
                                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-700"
                              />
                            </label>
                            <label className="block space-y-1">
                              <span className="text-sm font-medium text-slate-700">Actionstep access_token</span>
                              <input
                                value={accessToken}
                                onChange={(e) => setAccessToken(e.target.value)}
                                placeholder="Paste the bearer token returned by Actionstep OAuth"
                                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-700"
                              />
                            </label>
                          </div>
                        )}

                        <label className="block space-y-1">
                          <span className="text-sm font-medium text-slate-700">Search Actionstep matters</span>
                          <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Search by client, file number, court, or lawyer"
                              className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700"
                            />
                          </div>
                        </label>

                        {searchMode === "live" && (
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={handleLiveSearch}
                              disabled={isSearchingLive}
                              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                            >
                              {isSearchingLive && <LoaderCircle className="h-4 w-4 animate-spin" />}
                              Search live Actionstep matters
                            </button>
                            <p className="text-xs text-slate-500">
                              Actionstep docs say to use the returned <code>api_endpoint</code> as the base URL and prefix API requests with <code>rest</code>.
                            </p>
                          </div>
                        )}

                        {searchMode === "live" && isConnected && accessToken && (
                          <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-4 flex items-center justify-between gap-4">
                            <div>
                              <p className="text-sm font-bold text-purple-900">Import all matters</p>
                              <p className="text-xs text-purple-700 mt-0.5">Quickly import up to 100 recent matters from Actionstep.</p>
                            </div>
                            <button
                              type="button"
                              onClick={handleImportAll}
                              disabled={isImportingAll}
                              className="inline-flex items-center gap-2 rounded-lg bg-white border border-purple-200 px-4 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-100 transition-all shadow-sm disabled:opacity-50"
                            >
                              {isImportingAll ? (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                              ) : (
                                <DatabaseZap className="h-4 w-4" />
                              )}
                              Import all matters
                            </button>
                          </div>
                        )}

                        {liveError && (
                          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                            {liveError}
                          </div>
                        )}

                        <div className="space-y-3">
                          {visibleResults.map((matter) => {
                            const isSelected = matter.externalId === selectedMatterId;
                            return (
                              <button
                                key={matter.externalId}
                                type="button"
                                onClick={() => setSelectedMatterId(matter.externalId)}
                                className={`w-full rounded-xl border p-4 text-left transition ${
                                  isSelected
                                    ? "border-purple-300 bg-white shadow-sm"
                                    : "border-slate-200 bg-white hover:border-slate-300"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <div className="font-semibold text-slate-900">{matter.client.fullName}</div>
                                    <div className="mt-1 text-sm text-slate-500">
                                      {[matter.client.fileNumber, matter.matter.court].filter(Boolean).join(" - ")}
                                    </div>
                                    <p className="mt-2 text-sm text-slate-600">{matter.matter.summary}</p>
                                  </div>
                                  {matter.matter.nextAppearanceDate && (
                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                      {matter.matter.nextAppearanceDate}
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}

                          {visibleResults.length === 0 && (
                            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
                              {searchMode === "live"
                                ? "No live Actionstep matters matched that search yet. Run the search after entering api_endpoint, access_token, and a matter query."
                                : "No stub matters matched that search. Try a client name, file number, court, or lawyer name."}
                            </div>
                          )}
                        </div>

                        {selectedMatter && (
                          <div className="rounded-xl border border-purple-200 bg-white p-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                              <UserRoundSearch className="h-4 w-4 text-purple-600" />
                              Import preview
                            </div>
                            <div className="mt-3 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                              <div>
                                <div className="font-medium text-slate-900">Client</div>
                                <div>{selectedMatter.client.fullName}</div>
                              </div>
                              <div>
                                <div className="font-medium text-slate-900">File reference</div>
                                <div>{selectedMatter.client.fileNumber || "Not returned"}</div>
                              </div>
                              <div>
                                <div className="font-medium text-slate-900">Court / type</div>
                                <div>{selectedMatter.matter.court || "Not returned"}</div>
                              </div>
                              <div>
                                <div className="font-medium text-slate-900">Next appearance</div>
                                <div>{selectedMatter.matter.nextAppearanceDate || "Not returned"}</div>
                              </div>
                              <div>
                                <div className="font-medium text-slate-900">Lawyer</div>
                                <div>{selectedMatter.matter.lawyer || "Not returned"}</div>
                              </div>
                              <div>
                                <div className="font-medium text-slate-900">Appearance type</div>
                                <div>{selectedMatter.matter.appearanceType || "To be completed manually"}</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {!canConfirm && (
                  <p className="text-sm text-slate-500">
                    This connector is planned but not wired yet. Actionstep is the first live entry point in the UI and the other practice managers can follow the same adapter pattern.
                  </p>
                )}

                <div className="mt-4 border-t border-slate-200 bg-slate-50 px-4 py-3">
                  <DialogFooter>
                    <button
                      type="button"
                      onClick={() => onOpenChange(false)}
                      className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        selectedAdapter &&
                        onConfirmAdapter(selectedAdapter, selectedMatter, {
                          provider: selectedAdapter.id,
                          mode: searchMode,
                          apiEndpoint: apiEndpoint.trim(),
                          accessToken: accessToken.trim(),
                        })
                      }
                      disabled={!canConfirm || (selectedAdapter?.supportsStubSearch && !selectedMatter)}
                      className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {selectedAdapter?.supportsStubSearch ? "Import selected matter" : `Use ${selectedAdapter?.name || "connector"} import path`}
                    </button>
                  </DialogFooter>
                </div>
              </div>
            ) : null}
          </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
