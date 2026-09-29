/**
 * ENGLISH DICTIONARY — the typed single source of truth.
 * Hindi (hi.ts) must structurally mirror this object (`satisfies Dictionary`).
 * Engines and verify suites keep English defaults; localized dynamic content
 * is provided through the function entries below.
 */

export const en = {
  common: {
    loading: "Loading",
    retry: "Retry",
    tryAgain: "Try again",
    cancel: "Cancel",
    close: "Close dialog",
    send: "Send",
    remove: "Remove",
    replace: "Replace",
    chooseImage: "Choose an image",
    selectedImage: "Selected image",
    notAvailableYet: "Not available yet",
    acres: "acres",
    kmAway: (km: number) => `${km} km away`,
    optional: "optional",
    now: "Now",
    today: "Today",
    tomorrow: "Tomorrow",
    thisWeek: "This week",
    seasonLabel: (season: string) => season,
    seasonWithNote: {
      kharif: "Kharif (monsoon — Jun–Oct)",
      rabi: "Rabi (winter — Nov–Apr)",
      zaid: "Zaid (summer — Apr–Jun)",
    },
    seasons: {
      kharif: "Kharif",
      rabi: "Rabi",
      zaid: "Zaid",
    },
    due: "Due",
    duePrefix: (date: string) => `Due ${date}`,
    sourcePrefix: "Source:",
    categoryPrefix: "Category:",
    notePrefix: "Note:",
    likelihoodLabels: {
      likely: "Likely",
      possible: "Possible",
      uncertain: "Uncertain",
    },
  },

  source: {
    "live-api": "LIVE API",
    "model-result": "AI MODEL",
    "rules-based": "DECISION ENGINE",
    demo: "SERVICE DATA",
    illustrative: "FALLBACK",
  },

  verification: {
    blockchainVerified: "Blockchain verified",
    localVerified: "Local verification",
    pending: "Blockchain pending",
    unavailable: "Blockchain unavailable",
  },

  nav: {
    primary: "Primary",
    primaryMobile: "Primary mobile",
    dashboard: "Dashboard",
    farmProfile: "Farm Profile",
    cropAdvisor: "Crop Advisor",
    cropHealth: "Crop Health",
    weather: "Weather",
    operations: "Farm Operations",
    planner: "Farm Planner",
    timeline: "Farm Timeline",
    assistant: "AI Assistant",
    dashboardDesc: "Your farm at a glance",
    farmProfileDesc: "Your farm context",
    cropAdvisorDesc: "Choose what to grow",
    cropHealthDesc: "Check leaf photos",
    weatherDesc: "Weather to farm action",
    operationsDesc: "Machinery requests",
    plannerDesc: "Today's plan",
    timelineDesc: "Actions & records",
    assistantDesc: "Ask about your farm",
    mobileHome: "Home",
    mobileCrops: "Crops",
    mobileWeather: "Weather",
    mobileAsk: "Ask",
  },

  chrome: {
    brandAria: "AgriSaarthi 360 — go to dashboard",
    brandHome: "AgriSaarthi 360 — home",
    chainTagline: "Farm → Decision → Action",
    askAgriSaarthi: "Ask AgriSaarthi",
    askAssistantAria: "Open the AgriSaarthi AI assistant",
    farmWorkspace: "Farm workspace",
    openMenu: "Open navigation menu",
    closeMenu: "Close navigation menu",
    skipToContent: "Skip to main content",
    workspaceFooter:
      "AgriSaarthi 360 — Smart Agriculture Platform. Decision support, not a replacement for qualified agricultural experts.",
    language: "Language",
    languageAria: "Change language",
    languageSwitched: (lang: string) => `Language changed to ${lang}.`,
    // Sidebar farm card
    currentFarm: "Current farm",
    noFarmSet: "No farm set —",
    createProfile: "create profile",
    sampleFarmData: "Sample farm data",
    yourFarmData: "Your farm data",
    noCropSelected: "No crop selected",
    seasonField: (season: string) => `${season} season`,
    // Status line
    setupPrompt: "Set up your farm to unlock guidance",
  },

  landing: {
    navProduct: "Product",
    navHow: "How It Works",
    navIntelligence: "Intelligence",
    navAbout: "About",
    navAria: "Landing navigation",
    navMenuOpenAria: "Close navigation menu",
    navMenuClosedAria: "Open navigation menu",
    homeAria: "AgriSaarthi 360 — home",
    addYourFarm: "Add Your Farm",
    exploreHow: "Explore How It Works",
    footerExplore: "Explore",
    footerGetStarted: "Get started",
    footerPrivacy: "Privacy",
    footerTerms: "Terms",
    footerDisclaimer:
      "Decision support, not a replacement for qualified agricultural experts.",
    footerCopyright: "Smart Agriculture Platform",
    brandTagline: "Smart Agriculture Platform",
    chain: {
      farm: "Farm",
      decision: "Decision",
      action: "Action",
      plan: "Plan",
      proof: "Proof",
    },
    hero: {
      eyebrow: "Smart Agriculture Decision Support",
      headlineLines: ["FROM FARM", "TO DECISION", "TO ACTION."],
      support:
        "One connected workflow from your farm's context to the decision, the action, the plan — and the proof it happened.",
      contextFlow: [
        { label: "Farm Context", value: "Nashik · 5 acres · Rabi" },
        { label: "Crop Decision", value: "Wheat" },
        { label: "Weather Action", value: "Irrigation review" },
      ],
      contextFlowAria: "Product flow — sample farm context",
      sampleNote: "Sample farm context",
      subline:
        "AI-assisted decision support · Live weather · Farm operations",
      scrollCue: "The problem",
    },
    problem: {
      eyebrow: "The problem",
      statementLines: [
        "YOUR FARM SHOULDN'T NEED",
        "FIVE DIFFERENT PLACES",
        "TO MAKE ONE DECISION.",
      ],
      fragments: ["Farm", "Crop", "Health", "Weather", "Operations", "Plan"],
      conclusion: "ONE CONNECTED CONTEXT.",
    },
    system: {
      eyebrow: "The core idea",
      headlineLines: ["ONE FARM.", "ONE CONNECTED CONTEXT."],
      body: "Configure your farm once. Every module after that — decisions, weather, health, operations, planning — works from the same context.",
      nodes: [
        { name: "Farm Profile", detail: "Land, soil, irrigation, season" },
        { name: "Crop", detail: "What you decided to grow" },
        { name: "Weather", detail: "Live conditions, your location" },
        { name: "Health", detail: "What the field is showing" },
        { name: "Operation", detail: "The work behind the crop" },
        { name: "Plan", detail: "The season, scheduled" },
      ],
    },
    decisionEngine: {
      eyebrow: "Decision engine",
      headlineLines: ["KNOW WHAT FITS", "YOUR FARM."],
      body: "Crop guidance computed from your actual conditions — with the reasoning shown, dimension by dimension.",
      inputs: [
        { label: "Season", value: "Rabi" },
        { label: "Soil", value: "Loamy" },
        { label: "Irrigation", value: "Drip" },
        { label: "Farm size", value: "5 acres" },
        { label: "Location", value: "Nashik" },
      ],
      decisionBasisTitle: "Decision basis",
      sampleNote: "Sample farm inputs",
      cta: "Open the Crop Advisor",
      source: "Decision Engine",
    },
    weatherAction: {
      eyebrow: "Weather → farm action",
      headlineLines: ["DATA", "BECOMES ACTION."],
      body: "Live conditions for your location pass through transparent decision rules. What comes out is not a forecast to interpret — it is the next practical step.",
      dataLive: "Live weather",
      dataFallback: "Cached weather",
      dataRuleEngine: "Decision rule applied",
      cta: "Open Weather",
    },
    cropHealth: {
      eyebrow: "AI crop health",
      headlineLines: ["SEE MORE", "IN EVERY CROP IMAGE."],
      body: "Upload a field image. The analysis returns a possible condition with an explicit likelihood, what was seen, and a cautious next step — caveats included, always.",
      flow: [
        { step: "Upload crop image", note: "Validated on-device" },
        { step: "AI-assisted health check", note: "Analysis with confidence framing" },
        { step: "Result", note: "Possible condition · Likelihood · Visual note · Next step" },
      ],
      caution:
        "Likelihoods, not diagnoses. No pesticide dosages. The farmer decides.",
      cta: "Open Crop Health",
      source: "AI Model",
    },
    operations: {
      eyebrow: "Farm operations",
      headlineLines: ["OPERATION.", "MACHINERY.", "SERVICE."],
      body: "Choose the operation, review the machinery it needs, and raise the service request — one workflow for the work behind the crop.",
      flow: ["Choose operation", "Match machinery", "Review", "Request service"],
      operationTypes: ["Seedbed Preparation", "Sowing", "Spraying", "Harvesting", "Transport"],
      serviceNote:
        "Machinery and service information is service data. Availability depends on connected service providers.",
      cta: "Open Farm Operations",
      source: "Service Data",
    },
    journey: {
      eyebrow: "How it works",
      headline: "Five stages. One connected workflow.",
      body: "Scroll through the whole product — each stage is a real capability, not a promise.",
      stages: [
        {
          name: "FARM",
          capability: "Farm context",
          detail: "Location, size, soil, irrigation and season — understood from the first screen.",
          link: "Farm Profile",
        },
        {
          name: "DECISION",
          capability: "Crop recommendation",
          detail: "Guidance computed on real conditions, reasoning visible, score honestly labeled.",
          link: "Crop Advisor",
        },
        {
          name: "ACTION",
          capability: "Weather · Health · Operations",
          detail: "Live weather becomes the next step; crop images become cautious assessments.",
          link: "Weather & more",
        },
        {
          name: "PLAN",
          capability: "Farm planner",
          detail: "Today's action becomes a dated, season-long plan you can work through.",
          link: "Farm Planner",
        },
        {
          name: "PROOF",
          capability: "Timeline + verification",
          detail: "Completed work becomes a timeline; key events keep tamper-evident records.",
          link: "Farm Timeline",
        },
      ],
    },
    assistant: {
      eyebrow: "Contextual farm intelligence",
      headlineLines: ["ASK WITH", "YOUR FARM", "IN MIND."],
      body: "The assistant answers with your farm context attached — and every answer carries its data source and caveats with it. It does not act autonomously. The farmer stays in control.",
      prompt: "Should I irrigate my wheat today?",
      contextLine: "Context: 5 acres · Rabi · Wheat · Drip · Nashik",
      answer:
        "Today's weather action for your farm is an irrigation review — check conditions before scheduling. Inspect the field for visible crop stress as well.",
      sourceLabel: "AI Model",
      autonomyNote:
        "Suggested actions are added to your plan only when you confirm them.",
      cta: "Open AgriSaarthi AI",
    },
    trust: {
      eyebrow: "Proof & transparency",
      headlineLines: ["NEVER HIDE", "HOW IT'S MADE."],
      body: "Every result carries a visible data source. That is a design principle, not a footnote.",
      sources: [
        { label: "LIVE API", body: "Weather information for your farm location." },
        { label: "AI MODEL", body: "Crop-health analysis and assistant answers." },
        { label: "DECISION ENGINE", body: "Transparent crop guidance and farm actions." },
        { label: "SERVICE DATA", body: "Operations workflow reference." },
        { label: "FALLBACK", body: "Labeled cached data when a live source is down." },
      ],
      recordsTitle: "Verified farm records",
      recordsBody:
        "Completed farm events can be recorded with tamper-evident verification — the default is local SHA-256 verification of each record, so later alteration is detectable.",
      recordsCta: "Open Farm Timeline",
    },
    finalCta: {
      headlineLines: ["YOUR FARM.", "YOUR CONTEXT.", "BETTER DECISIONS."],
      support:
        "Bring your farm context, crop decisions, actions and plans into one connected workflow.",
      primary: "Add Your Farm",
      secondary: "Explore How It Works",
    },
    fragmentsAria: "Disconnected farm information",
    resolutionBody:
      "AgriSaarthi 360 connects all of it — the farm, the crop, the weather, the work — so every decision starts from the same place.",
    systemRailAria: "The connected AgriSaarthi system",
    systemRailNote:
      "One profile. Every module reads the same context — so an answer about irrigation already knows your soil, your season and your crop.",
    advisorPanelLabel: "Crop Advisor",
    inputsAria: "Farm inputs",
    recommendationLabel: "Recommendation",
    recommendationValue: "Wheat",
    recommendationSubline: "High suitability for this farm profile",
    basisListAria: "Decision basis dimensions",
    scoreNoteShort:
      "The suitability score reflects configured decision weights — it is not a model accuracy measure. The full reasoning is shown inside the advisor.",
    weatherPanelLabel: "Weather",
    weatherUnavailableNote:
      "Weather is unavailable right now — the action panel shows the rule that would apply.",
    weatherLoadingNote: "Loading live conditions…",
    actionPanelLabel: "Farm action",
    actionAwaitingNote:
      "Awaiting conditions — the transparent rules compare rain, heat and wind thresholds before suggesting anything.",
    actionLoadingNote: "Reading conditions…",
    actionWhyPrefix: "Why: ",
    healthFlowAria: "Crop health workflow",
    opsFlowAria: "Operations workflow",
    opsSupportedLabel: "Supported operations",
    journeyKeepScrolling: "Keep scrolling",
    assistantPreviewAria:
      "Preview of the AgriSaarthi assistant: a farmer asks about irrigation and receives an answer grounded in their farm's weather action",
    assistantName: "AgriSaarthi AI",
    assistantConnected: "Connected to your farm context",
    finalCtaNote:
      "Decision support — the farmer stays in control of every action.",
    sourcesAria: "Data sources used by AgriSaarthi 360",
    preloader: {
      brandLines: ["AGRI", "SAARTHI 360"],
      subline: "Smart Agriculture Platform",
    },
  },

  dashboard: {
    greetingMorning: "Good morning",
    greetingAfternoon: "Good afternoon",
    greetingEvening: "Good evening",
    welcomeBack: "Welcome back",
    welcomeTitle: "Welcome to AgriSaarthi 360",
    emptyHeadline: "One farm context. Every decision connected.",
    emptyBody:
      "Create your farm profile once — crop advice, weather actions, crop health and operations all build on it.",
    setupProfile: "Set up your farm profile",
    farmOverview: "Farm overview",
    farmContextAria: "Farm context",
    farmStatusAria: "Farm status",
    chooseCropCta: "Choose a crop to personalise guidance",
    statusFarmConfigured: "Farm configured",
    statusCropNotSelected: "Crop not selected",
    statusWeatherLoading: "Weather loading…",
    statusPlanNotGenerated: "Plan not generated yet",
    statusNext: (title: string) => `Next: ${title}`,
    lastHealthCheck: (crop: string, condition: string, likelihood: string) =>
      `Last health check: ${crop} — ${condition} (${likelihood})`,
    latestOperation: (name: string) => `Latest operation: ${name}`,
    guidanceHeading: "Today's farm guidance",
    guidanceSub: "Existing workflows, in the order they matter today.",
    // KPI cards
    kpiWeather: "Weather",
    kpiCrop: "Crop",
    kpiCropHealth: "Crop Health",
    kpiTodayPlan: "Today's Plan",
    kpiUnavailable: "Unavailable",
    kpiWeatherUnavailable: "Weather unavailable right now.",
    kpiLoadingConditions: "Loading conditions…",
    kpiNoCropSelected: "No crop selected yet",
    kpiSeasonSoil: (season: string, soil: string) => `${season} season · ${soil} soil`,
    kpiRecommended: (suitability: string) => `Recommended · ${suitability} suitability`,
    kpiNotChecked: "Not available yet — run a check in Crop Health.",
    kpiCheckedOn: (date: string) => `Checked ${date}`,
    kpiDueDone: (due: number, done: number) => `${due} due · ${done} done`,
    kpiNextTask: (title: string) => `Next: ${title}`,
    kpiAllClear: "All clear for today.",
    kpiGeneratePlan: "Not available yet — generate your farm plan.",
    // Today's actions
    todaysActions: "Today's actions",
    sessionChecklist: "Your session checklist",
    actionProfileTitle: "Set up your farm profile",
    actionProfileDetail: "Name, location and size unlock every other feature.",
    actionProfileCta: "Start now",
    actionCropTitle: "Choose what to grow",
    actionCropDetail: "Get transparent, rules-based crop suggestions for your land.",
    actionCropCta: "Open advisor",
    actionCropDoneTitle: (crop: string) => `${crop} selected`,
    actionCropDoneDetail: "Advisor inputs are saved to your farm context.",
    actionCropDoneCta: "Review",
    actionWeatherTitle: "Review today's weather action",
    actionWeatherDetailCrop: (crop: string) =>
      `Conditions and cautions for your ${crop.toLowerCase()}.`,
    actionWeatherDetailGeneric: "Conditions and cautions for your farm location.",
    actionWeatherCta: "Check",
    actionHealthTitle: "Run a crop health check",
    actionHealthDetail: "Upload a leaf photo for a cautious visual assessment.",
    actionHealthCta: "Check now",
    actionOperationTitle: "Plan a farm operation",
    actionOperationDetail: "Find suitable machinery for sowing, spraying or harvesting.",
    actionOperationCta: "Plan",
    actionAssistantTitle: "Ask AgriSaarthi about your farm",
    actionAssistantDetail: 'Context-aware answers: "What should I do today?"',
    actionAssistantCta: "Ask",
    actionAllSetTitle: "You're all set",
    actionAllSetDetail: "Ask the assistant what to do next on your farm.",
    actionAllSetCta: "Ask AgriSaarthi",
    // Planner preview
    plannerTitle: "Today's Plan",
    plannerSetupHint: "Set up your farm profile and select a crop to build your plan.",
    plannerCropHint: "Select a crop in the advisor to generate your contextual farm plan.",
    plannerDueToday: (n: number) => `${n} due today`,
    plannerWeatherAware: (n: number) => `${n} weather-aware`,
    plannerCompleted: (n: number) => `${n} completed`,
    plannerNoTasks: "No active tasks right now — open the planner to generate your plan.",
    plannerWeatherAction: (title: string) => `Weather action: ${title.toLowerCase()}`,
    plannerDecisionEngine: "Decision engine · from your farm context",
    plannerOpen: "Open planner",
    // Timeline preview
    timelineTitle: "Farm Timeline",
    timelineEmpty:
      "Your farm actions will appear here as you use the app — crop selection, weather actions, health checks, tasks and operations.",
    timelineEventCount: (n: number) =>
      `${n} event${n === 1 ? "" : "s"} this session`,
    timelineVerifiedPresent: "Verified records present in your timeline.",
    timelineView: "View timeline",
    // Assistant entry
    assistantEntryTitle: "Ask AgriSaarthi",
    assistantLatest: "Latest question",
    assistantAnswered: "answered",
    assistantKnownFarm: (
      acres: number,
      crop: string,
      location: string
    ) =>
      `I know your ${acres}-acre ${crop} farm in ${location} — ask about irrigation, crop checks or operations.`,
    assistantGeneric:
      "Ask about irrigation, crop checks or farm operations — answers use your farm context when available.",
    assistantSuggested1: "What should I do today?",
    assistantSuggested2: "Is irrigation needed?",
    assistantEntryFooter: "AI model — not expert advice",
    assistantEntryOpen: "Open assistant",
  },

  featureCards: {
    // Weather action card
    weatherTitle: "Weather",
    weatherUnavailable:
      "Live weather is temporarily unavailable. Add your farm location in the profile to see weather-driven actions.",
    weatherFallbackNote: "Live weather unavailable — showing fallback values.",
    weatherLiveFooter: (time: string) =>
      `Live API — Open-Meteo · updated ${time}`,
    weatherFallbackFooter: "Weather fallback — fixed sample values",
    weatherRefreshAria: "Refresh weather",
    weatherFullView: "Full view",
    metricTemperature: "Temperature",
    metricRainChance: "Rain chance",
    metricHumidity: "Humidity",
    metricWind: "Wind",
    actionBlockLabel: "Farm action · Decision engine",
    actionWhy: "Why: ",
    // Crop recommendation card
    recTitle: "Recommended crop",
    recSetupTitle: "Complete your farm profile first",
    recSetupBody:
      "The rules engine needs your location, size, soil, irrigation and season to generate matching crops.",
    recSetupFooter: "Rules-based preview",
    recOpenProfile: "Open profile",
    recNoMatchTitle: "No strong match for this profile yet",
    recNoMatchBody: "Try adjusting season, soil or irrigation in the Crop Advisor.",
    recOpenAdvisor: "Open advisor",
    recMoreReasons: (n: number) => ` — plus ${n} more matching reasons.`,
    recFooter: "Rules-based — from your current farm context",
    recSelected: "Selected",
    waterLabel: (req: string) => `${req} water`,
    water: { low: "Low", moderate: "Moderate", high: "High" },
    suitability: { high: "High", moderate: "Moderate", exploratory: "Exploratory" },
    suitabilityBadge: (s: string) => `${s} suitability`,
    // Crop health card
    healthTitle: "Crop health",
    healthLatestTitle: "Latest crop health check",
    healthRunTitle: "Run a crop health check",
    healthRunBody:
      "Upload a leaf photo for a cautious AI-assisted visual assessment with safe fallback guidance.",
    healthFooter: "Decision support, not a diagnosis",
    healthCheckNow: "Check now",
    healthViewAnalysis: "View analysis",
    healthLikelihood: (l: string) => `Visual likelihood: ${l}`,
    healthFallbackBadge: "Fallback guidance",
    healthFallbackNote:
      "Live model was unavailable — this is fallback guidance, not an AI model result.",
    // Operations preview card
    opsTitle: "Farm Operations",
    opsPlanTitle: "Plan a farm operation",
    opsPlanBody:
      "Choose an operation, review suitable machinery, and send a service request.",
    opsSubmitted: "Request submitted",
    opsAccepted: "Provider accepted the request",
    opsProviderUnavailable: "Provider unavailable",
    opsInProgress: "Request in progress",
    opsAvailabilityNote: "Availability depends on connected service providers",
    opsViewStatus: "View request status",
    opsOpenWorkflow: "Open workflow",
    // Assistant note inside cards
    notExpertAdvice: "AI model — not expert advice",
  },

  farmProfile: {
    eyebrow: "Step 1 of your farm journey",
    title: "Farm profile",
    description:
      "This profile becomes the shared context for crop advice, weather actions, crop health and operations. Everything else builds on it.",
    savedTitle: "Profile saved",
    savedBody: "Your farm context is updated across the app —",
    savedLink: "continue to Crop Advisor",
    useSampleFarm: "Use Sample Farm",
    clearSession: "Clear session",
    sampleNote:
      "Sample farm: Ramesh Patil, 5 acres, Nashik — or edit the form with your own details.",
    whoTitle: "Who farms this land",
    whoDescription: "Used to personalise guidance.",
    farmerName: "Farmer name",
    farmerNameHint: "This name personalises your dashboard guidance.",
    farmerNamePlaceholder: "e.g. Ramesh Patil",
    location: "Location / district",
    locationHint: "Village, district or region — used for weather and crops.",
    locationPlaceholder: "e.g. Nashik, Maharashtra",
    landTitle: "Land details",
    landDescription:
      "Helps match crops, machines and water planning to your land.",
    farmSize: "Farm size (acres)",
    farmSizeHint: "In acres — used to shortlist suitable machines.",
    irrigation: "Irrigation",
    irrigationHint: "Affects crop water planning.",
    soilType: "Soil type",
    soilTypeHint: "A rough type is enough — refine it later if needed.",
    season: "Season",
    seasonHint: "Kharif / Rabi / Zaid.",
    cropTitle: "Current crop (optional)",
    cropDescription: "You can also choose a crop later via the Crop Advisor.",
    cropLabel: "What is currently growing?",
    cropHint: "Leave empty if undecided — the advisor will suggest options.",
    cropPlaceholder: "e.g. Wheat",
    save: "Save farm profile",
    continueToAdvisor: "Continue to Crop Advisor",
    irrigationOptions: {
      "rain-fed": "Rain-fed only",
      canal: "Canal",
      borewell: "Borewell",
      drip: "Drip",
      sprinkler: "Sprinkler",
    },
    soilOptions: {
      black: "Black (cotton soil)",
      alluvial: "Alluvial",
      loamy: "Loamy",
      sandy: "Sandy",
      clay: "Clay",
      red: "Red soil",
      laterite: "Laterite",
    },
    seasonOptions: {
      kharif: "Kharif (monsoon — Jun–Oct)",
      rabi: "Rabi (winter — Nov–Apr)",
      zaid: "Zaid (summer — Apr–Jun)",
    },
    cancel: "Cancel",
    errors: {
      farmerName: "Farmer name is required.",
      location: "Location helps every other feature work.",
      farmSize: "Enter a farm size between 0.1 and 500 acres.",
    },
  },

  cropAdvisor: {
    eyebrow: "Step 2 of your farm journey",
    title: "Crop advisor",
    description:
      "Smart crop suggestions generated from your farm context — the reasoning is always shown, never hidden.",
    detailsTitle: "Your farm details",
    detailsDescription: "Pre-filled from your farm profile — adjust for this season.",
    location: "Location",
    season: "Season",
    farmSize: "Farm size (acres)",
    irrigation: "Irrigation",
    soilType: "Soil type",
    seasonOptions: {
      kharif: "Kharif (monsoon)",
      rabi: "Rabi (winter)",
      zaid: "Zaid (summer)",
    },
    landPhoto: "Land photo (optional)",
    landPhotoHint:
      "Context signal only — never the sole basis for crop recommendation.",
    photoPreviewAlt: "Selected land photo preview",
    removePhoto: "Remove land photo",
    engineNote: "Decision engine — the photo never affects scores.",
    analyzing: "Analyzing farm profile…",
    findCrops: "Find suitable crops",
    incompleteTitle:
      "Not enough profile information for a reliable recommendation",
    completeProfile: "Complete Farm Profile",
    resultsAria: "Crop recommendations",
    howToReadTitle: "How to read these results",
    howToReadBody:
      "Rankings come from a transparent decision engine — decision support, not scientific certainty. Confirm with your local agriculture officer.",
    viewDashboard: "View dashboard",
    noMatchTitle: "No crop met enough of the decision rules",
    noMatchBody:
      "For this season/soil/irrigation combination, no crop in the knowledge base scored strongly. Adjust the inputs or verify locally.",
    emptyTitle: "No recommendations yet",
    emptyComplete:
      'Review your farm details above and choose "Find suitable crops" to see options with clear reasoning.',
    emptyIncomplete:
      "Complete your farm profile first — the advisor uses it to generate matching crops.",
    eventSelectedTitle: (crop: string) => `${crop} selected`,
    eventSelectedDescription: (crop: string, season: string, location: string) =>
      `Crop selected from the advisor for the ${season} season at ${location}.`,
    // Result card
    suitability: "Suitability: ",
    decisionBasis: "Decision basis: Season · Soil · Irrigation · Location · Farm size",
    whyTitle: "Why it matches your profile",
    checkBeforePlantingLabel: "Check before planting: ",
    caveatLabel: "Caveat: ",
    howCalculated: "How this score was calculated",
    scoreNote:
      "Decision engine — transparent scoring weights, not scientific accuracy. The land photo is never used for scoring.",
    resultFooter:
      'Recommended crop based on the current profile — not "the best" crop.',
    selectCrop: (crop: string) => `Select ${crop.split(" ")[0]}`,
    dimension: {
      season: "Season",
      soil: "Soil",
      irrigation: "Irrigation",
      location: "Location",
      farmSize: "Farm size",
    },
  },

  cropHealth: {
    eyebrow: "AI Crop Health Analysis — not a diagnosis",
    title: "AI Crop Health Analysis",
    description:
      "Upload a leaf photo for a cautious visual assessment. Always confirm with a qualified agriculture professional before treating.",
    howTitle: "How this works",
    howBody:
      "Results are possible conditions with visual likelihood — never certainty. Uploaded images are used for this analysis flow and are not stored permanently.",
    imageTitle: "Leaf / crop image",
    imageDescription:
      "One clear, well-lit photo works best — JPEG, PNG or WEBP, up to 5 MB.",
    uploadTitle: "Upload a clear leaf or crop image",
    uploadHint: "Tap to choose an image — JPEG, PNG or WEBP",
    imageNotUsable: "Image not usable",
    chooseAnother: "Choose another image",
    previewAlt: (name: string) => `Preview of selected crop image: ${name}`,
    analyzeImage: "Analyze image",
    visualLikelihood: (l: string) => `Visual likelihood: ${l}`,
    eventCheckTitle: (crop: string) => `Health check: ${crop}`,
    eventCheckDescription: (condition: string, likelihood: string) =>
      `Possible condition: ${condition} (visual likelihood: ${likelihood}).`,
    analyzingTitle: "Analyzing crop image…",
    analyzingHint:
      "Usually takes a few seconds. You'll get a cautious visual assessment.",
    analyzedAlt: (name: string) => `Analyzed crop photo: ${name}`,
    possibleCondition: "Possible condition",
    cropSuggestion: (crop: string) => `Visual crop suggestion: ${crop}`,
    modelConfidence: (c: string) =>
      `Model confidence: ${c} — not agricultural certainty`,
    fallbackBadge: "Fallback guidance",
    qualityBadge: "Image quality insufficient",
    observedAria: "What we observed",
    observedTitle: "What we observed",
    actionsAria: "Recommended next steps",
    actionsTitle: "Recommended next steps",
    importantTitle: "Important",
    importantBody:
      " This is an image-based screening aid, not a confirmed diagnosis. Confirm with a qualified agriculture professional.",
    followUpAdded: "Follow-up added to your Farm Plan.",
    addFollowUp: "Add follow-up to Farm Plan",
    fallbackTaskNote:
      "Task will be labeled FALLBACK — derived from fallback guidance, not an AI model result.",
    resultFallback: "Fallback guidance — not an AI model result",
    resultModel: "AI model result",
    analyzeAnother: "Analyze another image",
    unavailableTitle:
      "AI analysis is temporarily unavailable — showing fallback guidance",
    unavailableBody:
      "The live model could not be reached, so conservative fallback guidance will be shown on the next successful analysis. You can retry at any time.",
    followUpTaskTitle: (condition: string) => `Follow up: ${condition}`,
    followUpTaskDescription: (
      crop: string,
      condition: string,
      likelihood: string
    ) =>
      `Crop health check on ${crop} indicated "${condition}" (visual likelihood: ${likelihood}). Re-inspect affected plants and confirm with a qualified agriculture professional before treatment.`,
  },

  weather: {
    eyebrow: "Weather is only useful when it becomes action",
    title: "Weather → Farm Action",
    description:
      "Live conditions from your farm location, translated into a cautious, decision-engine farming action.",
    unavailableTitle: "Weather unavailable",
    unavailableBody:
      "Live weather is temporarily unavailable. Add your farm location in the Farm Profile, then try again.",
    fallbackBanner:
      "Live weather is temporarily unavailable — showing fallback values. Values stay fixed and predictable.",
    conditionsTitle: "Current conditions",
    weatherFor: (name: string) => `Weather for ${name}`,
    refreshWeather: "Refresh weather",
    feelsLike: "Feels like",
    humidity: "Humidity",
    precipitation: "Precipitation",
    wind: "Wind",
    farmAction: "Farm action",
    decisionEngine: "Decision engine",
    caution: "Caution",
    normal: "Normal",
    why: "Why",
    recommendation: "Recommendation",
    caveat: "Caveat",
    outlookTitle: "3-day outlook",
    outlookFallback: "Fallback forecast — fixed sample values",
    outlookLive: "Live forecast — Open-Meteo",
    liveFetched: (time: string) => `Live API — Open-Meteo · fetched ${time}`,
    thresholdsNote:
      "Action rules are configured thresholds, not agronomic guarantees.",
  },

  operations: {
    eyebrow: "Operation to equipment to service request",
    title: "Farm Operations",
    description:
      "Choose an operation, review suitable machinery, and send a service request — the status is tracked in your farm workspace.",
    progressAria: "Workflow progress",
    step1: "Choose operation",
    step2: "Review machinery",
    step3: "Request service",
    profileIncompleteTitle: "Farm profile incomplete",
    profileIncompleteBody:
      "Set up your farm profile to get contextual operation suggestions.",
    completeProfile: "Complete Farm Profile",
    weatherSuggests: (title: string) =>
      `Weather action currently suggests: ${title.toLowerCase()}.`,
    chooseQuestion: "What farm operation do you need?",
    findEquipment: "Find equipment",
    suitableTitle: (name: string) => `Suitable machinery — ${name}`,
    suitableNote:
      "Suitability from the decision engine — based on farm size, crop and distance. Not a scientifically optimal selection.",
    chooseDifferent: "Choose a different operation",
    noMachineryTitle: "No suitable machinery found for this operation.",
    noMachineryBody:
      "No equipment is currently listed for this operation. Try another operation or check back later.",
    tryAnotherOperation: "Try another operation",
    confirmTitle: "Confirm your request",
    confirmDescription:
      "Review the details before sending your service request.",
    detailOperation: "Operation",
    detailMachine: "Machine",
    detailProvider: "Provider",
    detailDate: "Requested date",
    detailDateFlexible: "Flexible — to be confirmed with provider",
    detailLocation: "Farm location",
    detailSize: "Farm size",
    dateLabel: "Requested date (optional)",
    availabilityNote: "Availability depends on connected service providers.",
    confirmRequest: "Confirm request",
    backToMachinery: "Back to machinery",
    submittedTitle: "Request submitted",
    providerResponse: (time: string) => `Provider response expected in ${time}.`,
    responseTitle: "Service request status",
    acceptedBody: (provider: string, operation: string) =>
      `${provider} accepted your service request for ${operation}.`,
    machineDate: (machine: string, date: string) =>
      `Machine: ${machine} · Date: ${date}`,
    flexible: "flexible",
    finalScheduling: "Final scheduling is confirmed directly with the provider.",
    planAnother: "Plan another operation",
    providerUnavailableTitle: "Provider unavailable",
    providerUnavailableBody:
      "That machine is currently unavailable. You can try another suitable machine from the service dataset.",
    alternativeMachine: "Alternative machine",
    alternativeMeta: (provider: string, km: number, badge: string) =>
      `${provider} · ${km} km away · ${badge}`,
    noAlternative: "No alternative provider is available for this operation right now.",
    tryAnotherMachine: "Try another suitable machine",
    startOver: "Start over",
    serviceDataNote:
      "SERVICE DATA · Availability depends on connected service providers.",
    requestService: "Request service",
    suitableFor: (min: number, max: number) =>
      `Suitable for: ${min}–${max} acres`,
    responseTime: (time: string) => `Response: ${time}`,
    // Availability badges
    shownAvailable: "Shown available",
    shownBusy: "Shown busy",
    unavailableBadge: "Unavailable",
    unavailableNote: "Currently unavailable — try another provider",
    eventRequestedTitle: (name: string) => `${name} requested`,
    eventRequestedDescription: (machine: string, provider: string) =>
      `Service request sent for ${machine} (${provider}).`,
    eventAcceptedTitle: (name: string) => `${name} accepted by provider`,
    eventAcceptedDescription:
      "Provider accepted the service request in the workflow. Final scheduling is confirmed directly with the provider.",
    seasonChip: "Season: ",
    cropChip: "Crop: ",
    viewDashboard: "View dashboard",
  },

  planner: {
    eyebrow: "Farm → Decision → Action → Plan",
    title: "Farm Planner",
    description:
      "Your farm context converted into contextual upcoming actions — today, this week and weather-aware. Every task shows why it exists.",
    planFor: (crop: string) => `Plan for `,
    seasonActive: (season: string, count: number) =>
      `${season} season · ${count} active task${count === 1 ? "" : "s"}`,
    createRecord: "Create farm record",
    recordEventTitle: "Farm record snapshot created",
    recordEventDescription: (crop: string, location: string) =>
      `Plan snapshot for ${crop} at ${location}.`,
    noPlanTitle: "No farm plan yet — select a crop first",
    noPlanBody:
      "The planner builds tasks from your crop calendar, weather action and farm context. Choose a crop to get started.",
    openAdvisor: "Open Crop Advisor",
    completedSkipped: "Completed & skipped",
    completedAria: "Completed and skipped tasks",
    bucket: {
      today: "Today",
      todayHint: "Due today or overdue",
      thisWeek: "This week",
      thisWeekHint: "Next 7 days",
      upcoming: "Upcoming",
      upcomingHint: "Later this season",
      weatherWatch: "Weather watch",
      weatherWatchHint: "Weather-aware tasks — re-check the forecast",
      farmAction: "Farm action",
      farmActionHint: "From today's weather action",
      tasksAria: (title: string) => `${title} tasks`,
    },
    timelineTip: "Tip: complete tasks to build your verified farm record in the ",
    timelineTipLink: "Farm Timeline",
    taskAria: (title: string) => `Task: ${title}`,
    priority: { high: "high", medium: "medium", low: "low" },
    weatherAware: "Weather-aware",
    whyTask: "Why this task?",
    sourceCalendar: "Crop calendar template",
    calendarNote: "Weather-aware task — re-check the forecast before acting.",
    statusStart: "Start",
    statusComplete: "Complete",
    statusSkip: "Skip",
    statusReopen: "Reopen",
    statusInProgressAria: "Mark task as in progress",
    statusCompleteAria: "Mark task as complete",
    statusSkipAria: "Skip task",
    statusReopenAria: (id: string) => `Reopen task: ${id}`,
  },

  timeline: {
    eyebrow: "Farm → Decision → Action → Plan → Proof",
    title: "Farm Timeline",
    description:
      "Every action you take in the app appears here in order. Important events can be verified into a tamper-evident farm record.",
    feedAria: "Farm timeline — newest first",
    emptyTitle: "No farm activity yet",
    emptyBody:
      "As you use the app — selecting a crop, checking weather, analyzing crop health, planning tasks and requesting operations — each action appears here in order.",
    earlierEvents: (n: number) =>
      `${n} earlier event${n === 1 ? "" : "s"} this session`,
    hashPrefix: "hash",
    eventType: {
      CROP_SELECTED: "Crop selected",
      WEATHER_ACTION: "Weather action generated",
      HEALTH_CHECK: "Crop health analyzed",
      TASK_CREATED: "Farm task created",
      TASK_COMPLETED: "Farm task completed",
      OPERATION_REQUESTED: "Operation requested",
      OPERATION_COMPLETED: "Operation accepted",
      FARM_RECORD_CREATED: "Farm record created",
      PROVENANCE_VERIFIED: "Provenance verified",
    },
    // Verify button flow
    createRecord: "Create Verified Record",
    createRecordAria: (title: string) => `Create verified record for: ${title}`,
    anchorTestnet: "Anchor on Testnet",
    anchorTestnetAria: (title: string) =>
      `Anchor the record for ${title} on the configured testnet`,
    verifyAgain: "Verify Again",
    verifyAgainAria: (title: string) => `Verify the record for ${title} again`,
    busyCreating: "Creating record…",
    busyAnchoring: "Anchoring…",
    busyVerifying: "Verifying…",
    networkLabel: "Network: ",
    txLabel: "Tx: ",
    createUnavailable: "Record creation unavailable — the record was not created.",
    createNetworkError: "Record creation unavailable — network error.",
    localVerifiedNote: (hash: string) =>
      `Record verified locally (hash ${hash.slice(0, 12)}…). Deterministic in-app verification — not a blockchain transaction.`,
    localVerifiedEventTitle: (title: string) => `Record verified: ${title}`,
    localVerifiedEventDescription:
      "Local verification completed for this farm event.",
    anchoredNote: (network: string, hash: string) =>
      `Anchored on ${network}. Transaction ${hash.slice(0, 14)}…`,
    anchoredEventTitle: (title: string) => `Blockchain anchor: ${title}`,
    anchoredEventDescription: (network: string, hash: string) =>
      `Canonical hash anchored on ${network} (tx ${hash.slice(0, 14)}…).`,
    pendingNote: "Anchor transaction submitted — awaiting confirmation.",
    anchoringUnavailable:
      "Blockchain anchoring is unavailable. The record remains locally verified.",
    verifyUnavailable: "Verification could not be run right now.",
    verifyNetworkError: "Verification could not be run right now — network error.",
    reverifiedChain:
      "Re-verified on-chain — the record hash is confirmed by the contract.",
    reverifiedLocal:
      "Re-verified locally — the record hash matches the registered hash.",
  },

  assistantPage: {
    eyebrow: "Contextual to your farm",
    title: "AgriSaarthi AI Assistant",
    description:
      "Your agriculture decision-support assistant, connected to your farm context.",
    profileIncompleteTitle: "Farm profile incomplete",
    profileIncompleteBody:
      "Set up your farm profile to get personalized guidance. General agriculture questions still work.",
    completeProfile: "Complete Farm Profile",
    farmLabel: "Farm: ",
    notSet: "not set",
    locationNotSet: "Location not set",
    cropLabel: "Crop: ",
    notSelected: "not selected",
    seasonLabel: "Season: ",
    conversationAria: "Assistant conversation",
    typingAria: "Assistant is typing",
    thinking: "AgriSaarthi is thinking…",
    tryAsking: "Try asking",
    suggested: [
      "What should I do today?",
      "Is irrigation needed?",
      "What should I check in my crop?",
    ],
    inputAria: "Ask a question about your farm",
    inputPlaceholder: "e.g. Should I irrigate today?",
    sendAria: "Send message",
    unavailable:
      "AI assistant is temporarily unavailable. Showing fallback guidance.",
    fallbackShown:
      "AI assistant is temporarily unavailable — fallback guidance shown.",
    footerNote: "AI model — not a qualified agriculture professional. Chat is not stored.",
    backToDashboard: "Back to dashboard",
  },

  robot: {
    panelAria: "AgriSaarthi AI Assistant panel",
    connected: "Connected to your farm context",
    expandAria: "Expand to full assistant page",
    expandTitle: "Open full assistant",
    closeAria: "Close assistant panel",
    quickPromptsAria: "Quick prompts",
    quickPrompts: [
      "What should I do today?",
      "Should I irrigate?",
      "What should I check in my wheat crop?",
    ],
    greetingFarm: (name: string, crop?: string) =>
      `Namaste ${name} — how can I help with your${
        crop ? ` ${crop.toLowerCase()}` : ""
      } farm today?`,
    greetingGeneric:
      "How can I help? Set up your farm profile for context-aware answers.",
    conversationAria: "Assistant conversation",
    typingAria: "Assistant is typing",
    thinking: "AgriSaarthi is thinking…",
    added: "Added ✓",
    addToPlan: "Add to Farm Plan",
    addToPlanAria: (action: string) => `Add to Farm Plan: ${action}`,
    suggestedBy: (preview: string) =>
      `Suggested by AgriSaarthi AI: "${preview}"`,
    unavailable:
      "AI assistant is temporarily unavailable. Showing fallback guidance.",
    inputAria: "Ask a question about your farm",
    inputPlaceholder: "Ask about your farm…",
    sendAria: "Send message",
    launcherAria: "Ask AgriSaarthi AI Assistant",
    launcherTitle: "Ask AgriSaarthi",
    launcherTooltip: "Ask AgriSaarthi",
  },

  assistantLib: {
    /** Appended to the system instruction when the UI language is Hindi. */
    languageDirective:
      "LANGUAGE: The user may write in English or Hindi. If the user's question is in Hindi, respond in natural, simple Indian Hindi (Devanagari script) that a farmer can easily understand — use everyday agricultural Hindi, not heavy Sanskrit. If the question is in English, respond in English. Keep the JSON structure exactly as specified.",
    fallbackHindiNote:
      "Hindi replies come from the AI model; fallback answers are English-only.",
    redirect:
      "I'm focused on agriculture and farm decision support. I can help with your farm, crop, weather, crop health, or farm-operation questions.",
    todayAnswer: (crop?: string) => {
      const parts: string[] = [
        "Based on your current farm context, review today's weather action,",
      ];
      parts.push(
        crop
          ? `check your ${crop} for visible stress,`
          : "check your crop for visible stress,"
      );
      parts.push("and review any pending farm operation.");
      return parts.join(" ");
    },
    todayActions: [
      "Review weather action",
      "Check crop health",
      "Review operation status",
    ],
    todayCaveat:
      "Fallback guidance built from the current app context — not AI-generated advice.",
    weatherWithContext: (title: string, message: string) =>
      `The current weather rule suggests: ${title.toLowerCase()}. ${message}`,
    weatherActions: [
      "Open Weather for the full forecast",
      "Check soil moisture before deciding",
    ],
    weatherCaveat:
      "Weather action comes from the decision engine; check field conditions before acting.",
    weatherNoData:
      "I don't have a current weather result in this session. Open Weather to load the latest farm weather, then ask again.",
    weatherNoDataActions: ["Open Weather page"],
    weatherNoDataCaveat: "Fallback response — no weather data was available.",
    weatherWithContextSingle: (title: string, message: string) =>
      `The current weather rule suggests: ${title.toLowerCase()}. ${message}`,
    weatherLiveCaveat:
      "Weather information is supplied by the app — it is not invented here.",
    weatherNoDataShort:
      "I don't have a current weather result in this session. Open Weather to load the latest farm weather.",
    cropCheckAnswer: (crop?: string) =>
      crop
        ? `Walk your ${crop} field and look for visible stress: yellowing leaves, spots, wilting or unusual growth. If you notice anything unusual, upload a clear leaf photo in Crop Health for an image-based screening.`
        : "Walk your field and look for visible stress: yellowing leaves, spots, wilting or unusual growth. Select a crop in your Farm Profile for more specific guidance.",
    cropCheckActionsWithCrop: [
      "Walk the field and observe",
      "Upload a leaf photo in Crop Health",
    ],
    cropCheckActionsWithoutCrop: [
      "Select a crop in Farm Profile",
      "Observe the field regularly",
    ],
    cropCheckCaveat:
      "Visual observation guidance only — not a diagnosis. Confirm with a qualified agriculture professional.",
    healthWithResult: (condition: string, crop: string) =>
      `The latest image check indicates a possible ${condition} pattern on ${crop}. That is an image-based screening result, not a confirmed diagnosis.`,
    healthWithResultActions: [
      "Open Crop Health for details",
      "Consult a qualified agriculture professional",
    ],
    healthCaveat: "Image-based screening is not a diagnosis.",
    healthNoResult:
      "Upload a clear crop/leaf image in Crop Health first. I can then reference the screening result here — I cannot diagnose from text alone.",
    healthNoResultActions: ["Open Crop Health page"],
    healthNoResultCaveat: "No crop-health result exists in this session.",
    operationWithResult: (
      operation: string,
      machine: string,
      status: string
    ) =>
      `Your latest operation request (${operation} — ${machine}) has status: ${status}. Final scheduling is confirmed directly with the provider.`,
    operationActions: ["Open Farm Operations to view the workflow"],
    operationCaveat:
      "Machinery availability depends on connected service providers.",
    operationNoResult:
      "No farm operation has been planned in this session yet. You can choose an operation and review suitable machinery in Farm Operations.",
    operationNoResultActions: ["Open Farm Operations page"],
    recommendationAnswer:
      "Your Crop Advisor currently generates recommendations from the configured farm profile using transparent rules. Open Crop Advisor to see them — this assistant does not replace that engine.",
    recommendationActions: ["Open Crop Advisor page"],
    recommendationCaveat:
      "Recommendations come from the decision engine; check against local agronomic and market conditions.",
    genericContextLine: (location?: string, size?: string, crop?: string) =>
      `For your farm${location ? ` in ${location}` : ""}${
        size ? ` (${size})` : ""
      }${crop ? ` growing ${crop}` : ""}, `,
    genericAnswer:
      "here is general, conservative guidance based on the context available in this session: review your weather action, observe your crop for visible stress, and plan field work around the forecast. Details are limited to the app's current context.",
    genericActions: [
      "Review weather action",
      "Observe crop",
      "Check farm operations",
    ],
  },

  weatherLib: {
    standardCaveat:
      "Decision-engine rules — check field conditions, soil moisture and crop stage before acting. Not an expert agricultural guarantee.",
    excessWater: {
      title: "Prepare for possible excess water",
      message: (crop?: string) =>
        `Significant precipitation is forecast in the next 3 days${crop ? ` (${crop})` : ""}.`,
      reason: (mm: string) =>
        `Forecast shows up to ${mm} mm precipitation in the window.`,
      recommendation: (crop?: string) =>
        `Review field drainage${crop ? ` for your ${crop}` : ""}. Avoid scheduling new irrigation until conditions are clear.`,
    },
    irrigation: {
      title: "Review planned irrigation",
      message: (day: string, percent: number, crop?: string) =>
        `Rain is likely ${day} (${percent}% probability)${crop ? ` (${crop})` : ""}.`,
      reason: (percent: number) =>
        `Precipitation probability reaches ${percent}% in the next 24–48 hours.`,
      recommendation: (delayNote: string) =>
        `Hold off on weather-sensitive field work if possible.${delayNote} Re-check the forecast before deciding.`,
      irrigationDelayNote: " Consider delaying the next irrigation cycle.",
    },
    heat: {
      title: "Monitor crop water stress",
      message: (temp: number, crop?: string) =>
        `High temperature of ${temp}°C recorded${crop ? ` (${crop})` : ""}.`,
      reason: (threshold: number) =>
        `Temperature is at or above the configured heat threshold (${threshold}°C).`,
      recommendation: (crop?: string) =>
        `Check soil moisture before irrigating${crop ? ` for your ${crop}` : ""}. High heat can increase water demand — rely on field observation, not fixed schedules.`,
    },
    wind: {
      title: "Consider postponing vulnerable field operations",
      message: (speed: number) =>
        `Strong wind of ${speed} km/h recorded.`,
      reason: (threshold: number) =>
        `Wind is at or above the configured operations threshold (${threshold} km/h).`,
      recommendation:
        "Spraying and other wind-sensitive operations may be less suitable today. Assess on-site conditions first.",
    },
    monitoring: {
      title: "Continue normal monitoring",
      message: "No major weather trigger detected by the current decision rules.",
      reason: (temp: number, wind: number, rain: number) =>
        `Conditions are within configured thresholds: ${temp}°C, ${wind} km/h wind, ${rain}% max rain probability.`,
      recommendation: (crop?: string) =>
        `Keep up routine crop observation${crop ? ` for your ${crop}` : ""}. Re-check weather before scheduling major field work.`,
    },
    dayWord: { today: "today", tomorrow: "tomorrow" },
    conditions: {
      clear: "Clear sky",
      mainlyClear: "Mainly clear",
      partlyCloudy: "Partly cloudy",
      overcast: "Overcast",
      fog: "Fog",
      drizzle: "Drizzle",
      freezingDrizzle: "Freezing drizzle",
      rain: "Rain",
      freezingRain: "Freezing rain",
      snow: "Snow",
      rainShowers: "Rain showers",
      snowShowers: "Snow showers",
      thunderstorm: "Thunderstorm",
      thunderstormHail: "Thunderstorm with hail",
      mixed: "Mixed conditions",
    },
  },

  cropLib: {
    basis: {
      seasonMatch: (season: string, crop: string) =>
        `${season} matches ${crop}'s season profile.`,
      seasonMiss: (season: string, crop: string) =>
        `${season} is outside ${crop}'s season profile — needs local verification.`,
      soilMatch: (soil: string, crop: string) =>
        `${soil} soil matches the configured rule set for ${crop}.`,
      soilPartial: (soil: string, crop: string) =>
        `${soil} soil is workable for ${crop} (partial match).`,
      soilMiss: (soil: string, crop: string) =>
        `${soil} soil is not in ${crop}'s preferred soil list.`,
      irrigationMatch: (irrigation: string, crop: string, water: string) =>
        `${irrigation} irrigation supports ${crop}'s ${water} water requirement.`,
      irrigationPartial: (irrigation: string, crop: string) =>
        `${irrigation} irrigation is workable for ${crop} (partial match).`,
      irrigationMiss: (irrigation: string, crop: string) =>
        `${irrigation} irrigation is not in ${crop}'s preferred irrigation list.`,
      locationNoted: (location: string) =>
        `Location "${location}" noted — regional agronomy is not modeled; verify locally.`,
      locationMissing: "Insufficient location information — generic default applied.",
      sizeMatch: (size: number, crop: string) =>
        `${size} acres fits the configured farm-size range for ${crop}.`,
      sizeMiss: (size: number, crop: string, min: number, max: number) =>
        `${size} acres is outside ${crop}'s configured range (${min}–${max}).`,
    },
    missingLocation: "Location is missing.",
    missingFarmSize: "Valid farm size (> 0 acres) is missing.",
    waterWord: { low: "low", moderate: "moderate", high: "high" },
    suitability: { high: "high", moderate: "moderate", exploratory: "exploratory" },
    checkBeforePlanting:
      "Local market demand, current weather, seed availability, and advice from a qualified agriculture professional.",
    cropNames: {
      Wheat: "Wheat",
      "Chickpea (Chana)": "Chickpea (Chana)",
      "Mustard (Sarson)": "Mustard (Sarson)",
      "Rice (Paddy)": "Rice (Paddy)",
      Maize: "Maize",
      Cotton: "Cotton",
      "Green Gram (Moong)": "Green Gram (Moong)",
      "Onion (Rabi)": "Onion (Rabi)",
    },
    seasonNames: { kharif: "Kharif", rabi: "Rabi", zaid: "Zaid" },
    soilNames: {
      black: "Black",
      alluvial: "Alluvial",
      loamy: "Loamy",
      sandy: "Sandy",
      clay: "Clay",
      red: "Red",
      laterite: "Laterite",
    },
    irrigationNames: {
      "rain-fed": "Rain-fed",
      canal: "Canal",
      borewell: "Borewell",
      drip: "Drip",
      sprinkler: "Sprinkler",
    },
  },

  operationsLib: {
    basis: {
      suggestedCombine: (operation: string) =>
        `Suggested match — combine harvester suits ${operation} on farms of this size.`,
      suggestedMachine: (machine: string, operation: string) =>
        `Suggested match — ${machine} suits ${operation}.`,
      sizeInRange: (size: number, min: number, max: number) =>
        `Suitability — your ${size} acres fit the ${min}–${max} acre range.`,
      sizeOutOfRange: (size: number, min: number, max: number) =>
        `Suitability — farm size outside the typical ${min}–${max} acre range.`,
      cropSuggested: (crop: string) =>
        `Suggested for your selected crop: ${crop}.`,
    },
    operationNames: {
      "seedbed-preparation": "Seedbed preparation",
      sowing: "Sowing",
      spraying: "Spraying",
      harvesting: "Harvesting",
      transport: "Transport",
    },
    operationPhrases: {
      "seedbed-preparation": "seedbed preparation",
      sowing: "sowing",
      spraying: "spraying",
      harvesting: "harvesting",
      transport: "transport",
    },
    machineTypes: {
      tractor: "a tractor",
      rotavator: "a rotavator",
      "seed-drill": "a seed drill",
      sprayer: "a sprayer",
      "combine-harvester": "a combine harvester",
      trolley: "a trolley",
    },
  },

  plannerLib: {
    caveat:
      "Planning support based on your farm context and configured templates — verify with local conditions before acting. Not a scientific prediction.",
    weatherTaskIrrigation: "Irrigation review",
    weatherTaskFieldwork: "Review field work timing",
    weatherTaskDrainage: "Check field drainage",
    healthFollowUpTitle: (condition: string) => `Follow up: ${condition}`,
    healthFollowUpDescription: (
      crop: string,
      condition: string,
      likelihood: string
    ) =>
      `Crop health check on ${crop} indicated "${condition}" (visual likelihood: ${likelihood}). Re-inspect affected plants, capture a clearer photo if needed, and confirm with a qualified agriculture professional before treatment.`,
    operationPrepare: (operation: string) =>
      `Prepare for ${operation.toLowerCase()}`,
    operationTrack: (operation: string) =>
      `Track ${operation.toLowerCase()} request`,
    operationAcceptedDescription: (operation: string) =>
      `${operation} request is accepted in the service workflow. Prepare the field and confirm final scheduling directly with the provider.`,
    operationWaitingDescription: (operation: string) =>
      `${operation} request is awaiting provider response. Availability depends on connected service providers — try an alternative machine if unavailable.`,
  },

  privacy: {
    title: "Privacy",
    intro:
      "Plain statements about how your farm information is handled. If a behavior ever changes, this page changes with it.",
    contactPrefix: "Questions? Write to ",
    contactSuffix: ". Or return to the ",
    landingLink: "landing page",
    sections: [
      {
        title: "What we store",
        body: "Your farm profile, plan, timeline and assistant conversation live in your browser for the current session. There is no account system and no server-side storage of your farm information.",
      },
      {
        title: "What leaves your device",
        body: "Requests for live weather send your farm's location to the weather service. Crop-health images and assistant questions are sent to the AI model provider to generate analysis. Farm records written for tamper-evident verification contain only the event details you choose to record.",
      },
      {
        title: "What we never do",
        body: "No advertising trackers, no third-party analytics, no sale of information, no fabricated data — every result shows the source it came from.",
      },
      {
        title: "Your control",
        body: "Use Sample Farm and Clear Session in Farm Profile reset everything stored in your browser at any time.",
      },
    ],
  },

  terms: {
    title: "Terms",
    intro: "The short version: use the guidance, verify the important things.",
    contactPrefix: "Questions? Write to ",
    contactSuffix: ". Or return to the ",
    landingLink: "landing page",
    sections: [
      {
        title: "What the platform provides",
        body: "AgriSaarthi 360 is a decision-support tool. It organizes your farm context, computes crop guidance, analyzes crop images, and turns live weather into suggested actions.",
      },
      {
        title: "What it is not",
        body: "It is not a replacement for qualified agricultural experts, local regulations, or your own judgment. Weather information depends on external services and can be wrong. AI analysis can misread images. Every result shows its source for a reason.",
      },
      {
        title: "How to use guidance responsibly",
        body: "Treat suggestions as a starting point. Verify important decisions with local expertise and confirm critical operations — irrigation, spraying, harvesting — against your own field conditions before acting.",
      },
      {
        title: "Your farm record",
        body: "Verified farm records reflect the events you choose to record. Their tamper-evident verification makes later alteration detectable; it does not attest to what happened in the physical field.",
      },
    ],
  },
};

export type Dictionary = typeof en;
