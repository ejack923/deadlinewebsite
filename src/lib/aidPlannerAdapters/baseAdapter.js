export function createPracticeManagerAdapter(config) {
  return {
    id: "",
    name: "",
    stage: "planned",
    description: "",
    connectSummary: "",
    importFields: [],
    manualFields: [],
    writeBackOptions: [],
    supportsStubSearch: false,
    sampleMatters: [],
    ...config,
  };
}

export function createAdapterPreview(adapter) {
  return {
    title: `${adapter.name} connector`,
    connectSummary: adapter.connectSummary,
    importFields: adapter.importFields || [],
    manualFields: adapter.manualFields || [],
    writeBackOptions: adapter.writeBackOptions || [],
  };
}
