import type { Dictionary } from "./en";

/**
 * HINDI DICTIONARY — natural Indian Hindi (not Sanskrit-heavy).
 * Structurally mirrors the English dictionary (`satisfies Dictionary`).
 * Technical names stay as-is: AgriSaarthi 360, AI, Open-Meteo, API,
 * Blockchain, Polygon Amoy, FARM → DECISION → ACTION → PLAN → PROOF,
 * hashes, transaction hashes, addresses, URLs, model IDs.
 */
export const hi: Dictionary = {
  common: {
    loading: "लोड हो रहा है",
    retry: "फिर कोशिश करें",
    tryAgain: "दोबारा कोशिश करें",
    cancel: "रद्द करें",
    close: "डायलॉग बंद करें",
    send: "भेजें",
    remove: "हटाएं",
    replace: "बदलें",
    chooseImage: "कोई तस्वीर चुनें",
    selectedImage: "चुनी गई तस्वीर",
    notAvailableYet: "अभी उपलब्ध नहीं है",
    acres: "एकड़",
    kmAway: (km) => `${km} किमी दूर`,
    optional: "वैकल्पिक",
    now: "अभी",
    today: "आज",
    tomorrow: "कल",
    thisWeek: "इस सप्ताह",
    seasonLabel: (season) => season,
    seasonWithNote: {
      kharif: "खरीफ (मानसून — जून–अक्टूबर)",
      rabi: "रबी (सर्दी — नवंबर–अप्रैल)",
      zaid: "ज़ायद (गर्मी — अप्रैल–जून)",
    },
    seasons: { kharif: "खरीफ", rabi: "रबी", zaid: "ज़ायद" },
    due: "देय",
    duePrefix: (date) => `देय ${date}`,
    sourcePrefix: "स्रोत:",
    categoryPrefix: "श्रेणी:",
    notePrefix: "ध्यान दें:",
    likelihoodLabels: {
      likely: "संभावित",
      possible: "संभव",
      uncertain: "अनिश्चित",
    },
    weatherConditions: {
      "0": "साफ़ आसमान",
      "1": "लगभग साफ़",
      "2": "आंशिक बादल",
      "3": "बादल छाए",
      "45": "कोहरा",
      "51": "बूंदाबांदी",
      "61": "बारिश",
      "66": "ओस में जमा देने वाली बारिश",
      "71": "बर्फ़बारी",
      "80": "बौछारें",
      "85": "बर्फ़ की बौछारें",
      "95": "आंधी-तूफ़ान",
      "96": "ओलों के साथ आंधी-तूफ़ान",
      mixed: "मिश्रित स्थितियां",
    },
  },

  source: {
    "live-api": "लाइव API",
    "model-result": "AI मॉडल",
    "rules-based": "डिसीज़न इंजन",
    demo: "सर्विस डेटा",
    illustrative: "फॉलबैक",
  },

  verification: {
    blockchainVerified: "ब्लॉकचेन से सत्यापित",
    localVerified: "लोकल सत्यापन",
    pending: "ब्लॉकचेन लंबित",
    unavailable: "ब्लॉकचेन अनुपलब्ध",
  },

  nav: {
    primary: "मुख्य नेविगेशन",
    primaryMobile: "मोबाइल मुख्य नेविगेशन",
    dashboard: "डैशबोर्ड",
    farmProfile: "फार्म प्रोफ़ाइल",
    cropAdvisor: "फसल सलाहकार",
    cropHealth: "फसल स्वास्थ्य",
    weather: "मौसम",
    operations: "खेत के कार्य",
    planner: "फार्म प्लानर",
    timeline: "गतिविधि समयरेखा",
    assistant: "AI सहायक",
    dashboardDesc: "आपके खेत की एक नज़र में",
    farmProfileDesc: "आपके खेत की जानकारी",
    cropAdvisorDesc: "तय करें कि क्या उगाएं",
    cropHealthDesc: "पत्तियों की फ़ोटो जांचें",
    weatherDesc: "मौसम से खेत की कार्रवाई",
    operationsDesc: "मशीनरी अनुरोध",
    plannerDesc: "आज की योजना",
    timelineDesc: "कार्य और रिकॉर्ड",
    assistantDesc: "अपने खेत के बारे में पूछें",
    mobileHome: "होम",
    mobileCrops: "फसल",
    mobileWeather: "मौसम",
    mobileAsk: "पूछें",
  },

  chrome: {
    brandAria: "AgriSaarthi 360 — डैशबोर्ड पर जाएं",
    brandHome: "AgriSaarthi 360 — होम",
    chainTagline: "Farm → Decision → Action",
    askAgriSaarthi: "AgriSaarthi से पूछें",
    askAssistantAria: "AgriSaarthi AI सहायक खोलें",
    farmWorkspace: "फार्म वर्कस्पेस",
    openMenu: "नेविगेशन मेन्यू खोलें",
    closeMenu: "नेविगेशन मेन्यू बंद करें",
    skipToContent: "मुख्य सामग्री पर जाएं",
    workspaceFooter:
      "AgriSaarthi 360 — स्मार्ट कृषि प्लेटफ़ॉर्म। निर्णय सहायता है, योग्य कृषि विशेषज्ञों का विकल्प नहीं।",
    language: "भाषा",
    languageAria: "भाषा बदलें",
    languageSwitched: (lang) => `भाषा बदली गई: ${lang}।`,
    currentFarm: "वर्तमान खेत",
    noFarmSet: "कोई खेत सेट नहीं —",
    createProfile: "प्रोफ़ाइल बनाएं",
    sampleFarmData: "नमूना खेत डेटा",
    yourFarmData: "आपका खेत डेटा",
    noCropSelected: "कोई फसल नहीं चुनी गई",
    seasonField: (season) => `${season} का मौसम`,
    setupPrompt: "मार्गदर्शन के लिए अपना खेत सेट करें",
  },

  landing: {
    navProduct: "उत्पाद",
    navHow: "यह कैसे काम करता है",
    navIntelligence: "इंटेलिजेंस",
    navAbout: "परिचय",
    navAria: "लैंडिंग नेविगेशन",
    navMenuOpenAria: "नेविगेशन मेनू बंद करें",
    navMenuClosedAria: "नेविगेशन मेनू खोलें",
    homeAria: "AgriSaarthi 360 — होम",
    addYourFarm: "अपना खेत जोड़ें",
    exploreHow: "देखें यह कैसे काम करता है",
    footerExplore: "देखें",
    footerGetStarted: "शुरू करें",
    footerPrivacy: "गोपनीयता",
    footerTerms: "शर्तें",
    footerDisclaimer:
      "निर्णय सहायता है — योग्य कृषि विशेषज्ञों का विकल्प नहीं।",
    footerCopyright: "स्मार्ट कृषि प्लेटफ़ॉर्म",
    brandTagline: "स्मार्ट कृषि प्लेटफ़ॉर्म",
    chain: {
      farm: "Farm",
      decision: "Decision",
      action: "Action",
      plan: "Plan",
      proof: "Proof",
    },
    hero: {
      eyebrow: "स्मार्ट कृषि निर्णय सहायता",
      headlineLines: ["खेत से", "निर्णय तक", "कार्रवाई तक।"],
      support:
        "आपके खेत की जानकारी से निर्णय, कार्रवाई और योजना तक — और यह साबित करने तक कि काम हुआ — एक जुड़ा हुआ फ्लो।",
      contextFlow: [
        { label: "खेत की जानकारी", value: "नाशिक · 5 एकड़ · रबी" },
        { label: "फसल निर्णय", value: "गेहूं" },
        { label: "मौसम कार्रवाई", value: "सिंचाई समीक्षा" },
      ],
      contextFlowAria: "उत्पाद फ्लो — नमूना खेत की जानकारी",
      sampleNote: "नमूना खेत की जानकारी",
      subline: "AI सहायता प्राप्त निर्णय · लाइव मौसम · खेत के कार्य",
      scrollCue: "समस्या",
    },
    problem: {
      eyebrow: "समस्या",
      statementLines: [
        "आपके खेत को एक निर्णय के लिए",
        "पांच अलग-अलग जगहों की",
        "ज़रूरत नहीं होनी चाहिए।",
      ],
      fragments: ["खेत", "फसल", "स्वास्थ्य", "मौसम", "कार्य", "योजना"],
      conclusion: "एक जुड़ा हुआ कॉन्टेक्स्ट।",
    },
    system: {
      eyebrow: "मूल विचार",
      headlineLines: ["एक खेत।", "एक जुड़ा हुआ कॉन्टेक्स्ट।"],
      body: "अपने खेत को एक बार सेट करें। उसके बाद हर मॉड्यूल — निर्णय, मौसम, स्वास्थ्य, कार्य, योजना — उसी जानकारी से काम करता है।",
      nodes: [
        { name: "फार्म प्रोफ़ाइल", detail: "ज़मीन, मिट्टी, सिंचाई, सीज़न" },
        { name: "फसल", detail: "जो आपने उगाने का फैसला किया" },
        { name: "मौसम", detail: "आपकी जगह की लाइव स्थिति" },
        { name: "स्वास्थ्य", detail: "खेत में क्या दिख रहा है" },
        { name: "कार्य", detail: "फसल के पीछे का काम" },
        { name: "योजना", detail: "पूरे सीज़न की तय योजना" },
      ],
    },
    decisionEngine: {
      eyebrow: "डिसीज़न इंजन",
      headlineLines: ["जानें क्या फिट है", "आपके खेत के लिए।"],
      body: "आपकी असली स्थितियों से फसल सलाह — हर पहलू का कारण दिखाते हुए।",
      inputs: [
        { label: "सीज़न", value: "रबी" },
        { label: "मिट्टी", value: "दोमट" },
        { label: "सिंचाई", value: "ड्रिप" },
        { label: "खेत का आकार", value: "5 एकड़" },
        { label: "स्थान", value: "नाशिक" },
      ],
      decisionBasisTitle: "निर्णय का आधार",
      sampleNote: "नमूना खेत के आंकड़े",
      cta: "फसल सलाहकार खोलें",
      source: "डिसीज़न इंजन",
    },
    weatherAction: {
      eyebrow: "मौसम → खेत की कार्रवाई",
      headlineLines: ["डेटा", "कार्रवाई बनता है।"],
      body: "आपकी जगह की लाइव स्थितियां पारदर्शी नियमों से गुज़रती हैं। नतीजा सिर्फ़ समझने के लिए पूर्वानुमान नहीं — अगला व्यावहारिक कदम है।",
      dataLive: "लाइव मौसम",
      dataFallback: "कैश्ड मौसम",
      dataRuleEngine: "लागू निर्णय नियम",
      cta: "मौसम खोलें",
    },
    cropHealth: {
      eyebrow: "AI फसल स्वास्थ्य",
      headlineLines: ["हर फसल तस्वीर में", "ज़्यादा देखें।"],
      body: "खेत की तस्वीर अपलोड करें। विश्लेषण स्पष्ट संभावना के साथ संभावित समस्या, जो दिखा और सावधान अगला कदम बताता है — हमेशा चेतावनियों के साथ।",
      flow: [
        { step: "फसल की तस्वीर अपलोड करें", note: "डिवाइस पर ही जांची जाती है" },
        { step: "AI सहायता प्राप्त स्वास्थ्य जांच", note: "विश्वास स्तर के साथ विश्लेषण" },
        { step: "नतीजा", note: "संभावित समस्या · संभावना · दृश्य टिप्पणी · अगला कदम" },
      ],
      caution:
        "संभावनाएं हैं, निदान नहीं। कोई कीटनाशक खुराक नहीं। फैसला किसान का।",
      cta: "फसल स्वास्थ्य खोलें",
      source: "AI मॉडल",
    },
    operations: {
      eyebrow: "खेत के कार्य",
      headlineLines: ["कार्य।", "मशीनरी।", "सेवा।"],
      body: "कार्य चुनें, ज़रूरी मशीनरी देखें और सेवा अनुरोध भेजें — फसल के पीछे के काम के लिए एक ही फ्लो।",
      flow: ["कार्य चुनें", "मशीनरी मिलाएं", "समीक्षा करें", "सेवा का अनुरोध करें"],
      operationTypes: ["बीज तैयारी", "बुवाई", "छिड़काव", "कटाई", "परिवहन"],
      serviceNote:
        "मशीनरी और सेवा जानकारी सर्विस डेटा है। उपलब्धता जुड़े हुए सेवा प्रदाताओं पर निर्भर करती है।",
      cta: "खेत के कार्य खोलें",
      source: "सर्विस डेटा",
    },
    journey: {
      eyebrow: "यह कैसे काम करता है",
      headline: "पांच चरण। एक जुड़ा हुआ फ्लो।",
      body: "पूरे उत्पाद को स्क्रॉल करके देखें — हर चरण असली क्षमता है, वादा नहीं।",
      stages: [
        {
          name: "FARM",
          capability: "खेत की जानकारी",
          detail: "जगह, आकार, मिट्टी, सिंचाई और सीज़न — पहली स्क्रीन से समझा जाता है।",
          link: "फार्म प्रोफ़ाइल",
        },
        {
          name: "DECISION",
          capability: "फसल सुझाव",
          detail: "असली स्थितियों पर गणना, कारण साफ़, स्कोर ईमानदारी से लेबल किया।",
          link: "फसल सलाहकार",
        },
        {
          name: "ACTION",
          capability: "मौसम · स्वास्थ्य · कार्य",
          detail: "लाइव मौसम अगला कदम बनता है; फसल की तस्वीरें सावधान आकलन बनती हैं।",
          link: "मौसम और अधिक",
        },
        {
          name: "PLAN",
          capability: "फार्म प्लानर",
          detail: "आज की कार्रवाई तारीखों वाली, पूरे सीज़न की योजना बनती है।",
          link: "फार्म प्लानर",
        },
        {
          name: "PROOF",
          capability: "समयरेखा + सत्यापन",
          detail: "पूरा हुआ काम समयरेखा बनता है; मुख्य घटनाओं के छेड़छाड़-रोधी रिकॉर्ड रहते हैं।",
          link: "गतिविधि समयरेखा",
        },
      ],
    },
    assistant: {
      eyebrow: "खेत-संदर्भित समझ",
      headlineLines: ["अपने खेत को", "ध्यान में रखकर", "पूछें।"],
      body: "सहायक आपके खेत की जानकारी के साथ जवाब देता है — और हर जवाब के साथ उसका डेटा स्रोत व चेतावनी भी। यह खुद से कोई काम नहीं करता। नियंत्रण किसान के पास रहता है।",
      prompt: "क्या मुझे आज गेहूं की सिंचाई करनी चाहिए?",
      contextLine: "संदर्भ: 5 एकड़ · रबी · गेहूं · ड्रिप · नाशिक",
      answer:
        "आज आपके खेत की मौसम कार्रवाई सिंचाई समीक्षा है — समय तय करने से पहले स्थिति जांचें। फसल में साफ़ दिखने वाली परेशानी भी देखें।",
      sourceLabel: "AI मॉडल",
      autonomyNote:
        "सुझाई गई कार्रवाई आपकी योजना में तभी जुड़ती है जब आप पुष्टि करें।",
      cta: "AgriSaarthi AI खोलें",
    },
    trust: {
      eyebrow: "सबूत और पारदर्शिता",
      headlineLines: ["कैसे बना, यह", "कभी न छिपाएं।"],
      body: "हर नतीजे के साथ उसका डेटा स्रोत दिखता है। यह सिर्फ़ टिप्पणी नहीं — डिज़ाइन सिद्धांत है।",
      sources: [
        { label: "लाइव API", body: "आपके खेत की जगह के लिए मौसम जानकारी।" },
        { label: "AI मॉडल", body: "फसल स्वास्थ्य विश्लेषण और सहायक के जवाब।" },
        { label: "डिसीज़न इंजन", body: "पारदर्शी फसल सलाह और खेत की कार्रवाई।" },
        { label: "सर्विस डेटा", body: "कार्य फ्लो का संदर्भ।" },
        { label: "फॉलबैक", body: "लाइव स्रोत बंद होने पर लेबल किया गया कैश्ड डेटा।" },
      ],
      recordsTitle: "सत्यापित फार्म रिकॉर्ड",
      recordsBody:
        "पूरी हुई खेत घटनाओं को छेड़छाड़-रोधी सत्यापन के साथ रिकॉर्ड किया जा सकता है — डिफ़ॉल्ट हर रिकॉर्ड का लोकल SHA-256 सत्यापन है, जिससे बाद का बदलाव पकड़ में आता है।",
      recordsCta: "गतिविधि समयरेखा खोलें",
    },
    finalCta: {
      headlineLines: ["आपका खेत।", "आपका कॉन्टेक्स्ट।", "बेहतर निर्णय।"],
      support:
        "खेत की जानकारी, फसल निर्णय, कार्रवाइयां और योजनाएं — एक जुड़े हुए फ्लो में लाएं।",
      primary: "अपना खेत जोड़ें",
      secondary: "देखें यह कैसे काम करता है",
    },
    fragmentsAria: "अलग-अलग खेत जानकारी",
    resolutionBody:
      "AgriSaarthi 360 इन सबको जोड़ता है — खेत, फसल, मौसम, काम — ताकि हर निर्णय एक ही जगह से शुरू हो।",
    systemRailAria: "जुड़ा हुआ AgriSaarthi सिस्टम",
    systemRailNote:
      "एक प्रोफ़ाइल। हर मॉड्यूल एक ही कॉन्टेक्स्ट पढ़ता है — इसलिए सिंचाई से जुड़ा जवाब आपकी मिट्टी, सीज़न और फसल पहले से जानता है।",
    advisorPanelLabel: "फसल सलाहकार",
    inputsAria: "खेत के आंकड़े",
    recommendationLabel: "सुझाव",
    recommendationValue: "गेहूं",
    recommendationSubline: "इस फार्म प्रोफ़ाइल के लिए उच्च उपयुक्तता",
    basisListAria: "निर्णय आधार आयाम",
    scoreNoteShort:
      "उपयुक्तता स्कोर कॉन्फ़िगर किए गए निर्णय वेट दिखाता है — यह मॉडल सटीकता का माप नहीं है। पूरा तर्क सलाहकार के अंदर दिखता है।",
    weatherPanelLabel: "मौसम",
    weatherUnavailableNote:
      "मौसम अभी उपलब्ध नहीं है — कार्रवाई पैनल वही नियम दिखाता है जो लागू होता।",
    weatherLoadingNote: "लाइव स्थितियां लोड हो रही हैं…",
    actionPanelLabel: "खेत कार्रवाई",
    actionAwaitingNote:
      "स्थितियों का इंतज़ार — पारदर्शी नियम सुझाव से पहले बारिश, गर्मी और हवा की सीमाओं की तुलना करते हैं।",
    actionLoadingNote: "स्थितियां पढ़ी जा रही हैं…",
    actionWhyPrefix: "क्यों: ",
    healthFlowAria: "फसल स्वास्थ्य फ्लो",
    opsFlowAria: "कार्य फ्लो",
    opsSupportedLabel: "समर्थित कार्य",
    journeyKeepScrolling: "और स्क्रॉल करें",
    assistantPreviewAria:
      "AgriSaarthi सहायक का प्रीव्यू: किसान सिंचाई के बारे में पूछता है और उसके खेत की मौसम कार्रवाई पर आधारित जवाब पाता है",
    assistantName: "AgriSaarthi AI",
    assistantConnected: "आपके खेत कॉन्टेक्स्ट से जुड़ा",
    finalCtaNote: "निर्णय सहायता — हर कार्रवाई पर किसान का नियंत्रण रहता है।",
    sourcesAria: "AgriSaarthi 360 के इस्तेमाल किए डेटा स्रोत",
    preloader: {
      brandLines: ["AGRI", "SAARTHI 360"],
      subline: "स्मार्ट कृषि प्लेटफ़ॉर्म",
    },
  },

  dashboard: {
    greetingMorning: "सुप्रभात",
    greetingAfternoon: "नमस्ते",
    greetingEvening: "शुभ संध्या",
    welcomeBack: "वापसी पर स्वागत है",
    welcomeTitle: "AgriSaarthi 360 में आपका स्वागत है",
    emptyHeadline: "एक खेत की जानकारी। हर निर्णय जुड़ा हुआ।",
    emptyBody:
      "अपनी फार्म प्रोफ़ाइल एक बार बनाएं — फसल सलाह, मौसम कार्रवाई, फसल स्वास्थ्य और कार्य इसी पर बनते हैं।",
    setupProfile: "फार्म प्रोफ़ाइल सेट करें",
    farmOverview: "खेत की समीक्षा",
    farmContextAria: "खेत की जानकारी",
    farmStatusAria: "खेत की स्थिति",
    chooseCropCta: "मार्गदर्शन के लिए फसल चुनें",
    statusFarmConfigured: "खेत सेट हो गया",
    statusCropNotSelected: "फसल नहीं चुनी गई",
    statusWeatherLoading: "मौसम लोड हो रहा है…",
    statusPlanNotGenerated: "योजना अभी बनी नहीं",
    statusNext: (title) => `अगला: ${title}`,
    lastHealthCheck: (crop, condition, likelihood) =>
      `पिछली स्वास्थ्य जांच: ${crop} — ${condition} (${likelihood})`,
    latestOperation: (name) => `नवीनतम कार्य: ${name}`,
    guidanceHeading: "आज की खेत मार्गदर्शिका",
    guidanceSub: "मौजूदा फ्लो, आज की प्राथमिकता के क्रम में।",
    kpiWeather: "मौसम",
    kpiCrop: "फसल",
    kpiCropHealth: "फसल स्वास्थ्य",
    kpiTodayPlan: "आज की योजना",
    kpiUnavailable: "अनुपलब्ध",
    kpiWeatherUnavailable: "मौसम अभी उपलब्ध नहीं है।",
    kpiLoadingConditions: "स्थितियां लोड हो रही हैं…",
    kpiNoCropSelected: "अभी कोई फसल नहीं चुनी गई",
    kpiSeasonSoil: (season, soil) => `${season} सीज़न · ${soil} मिट्टी`,
    kpiRecommended: (suitability) => `सुझाई गई · ${suitability} उपयुक्तता`,
    kpiNotChecked: "अभी उपलब्ध नहीं — फसल स्वास्थ्य में जांच करें।",
    kpiCheckedOn: (date) => `${date} को जांची गई`,
    kpiDueDone: (due, done) => `${due} देय · ${done} पूरी`,
    kpiNextTask: (title) => `अगला: ${title}`,
    kpiAllClear: "आज सब ठीक है।",
    kpiGeneratePlan: "अभी उपलब्ध नहीं — अपनी फार्म योजना बनाएं।",
    todaysActions: "आज की कार्रवाइयां",
    sessionChecklist: "आपकी सेशन चेकलिस्ट",
    actionProfileTitle: "फार्म प्रोफ़ाइल सेट करें",
    actionProfileDetail: "नाम, जगह और आकार हर दूसरी सुविधा खोलते हैं।",
    actionProfileCta: "अभी शुरू करें",
    actionCropTitle: "तय करें क्या उगाना है",
    actionCropDetail:
      "अपनी ज़मीन के लिए पारदर्शी, नियम-आधारित फसल सुझाव पाएं।",
    actionCropCta: "सलाहकार खोलें",
    actionCropDoneTitle: (crop) => `${crop} चुनी गई`,
    actionCropDoneDetail: "सलाहकार के आंकड़े आपके खेत कॉन्टेक्स्ट में सेव हो गए।",
    actionCropDoneCta: "समीक्षा",
    actionWeatherTitle: "आज की मौसम कार्रवाई देखें",
    actionWeatherDetailCrop: (crop) =>
      `आपकी ${crop} के लिए स्थितियां और सावधानियां।`,
    actionWeatherDetailGeneric:
      "आपके खेत की जगह के लिए स्थितियां और सावधानियां।",
    actionWeatherCta: "जांचें",
    actionHealthTitle: "फसल स्वास्थ्य जांच करें",
    actionHealthDetail: "सावधान दृश्य आकलन के लिए पत्ती की फ़ोटो अपलोड करें।",
    actionHealthCta: "अभी जांचें",
    actionOperationTitle: "खेत का कार्य योजना बनाएं",
    actionOperationDetail:
      "बुवाई, छिड़काव या कटाई के लिए उपयुक्त मशीनरी खोजें।",
    actionOperationCta: "योजना",
    actionAssistantTitle: "अपने खेत के बारे में AgriSaarthi से पूछें",
    actionAssistantDetail: 'संदर्भ-सचेत जवाब: "आज मुझे क्या करना चाहिए?"',
    actionAssistantCta: "पूछें",
    actionAllSetTitle: "सब तैयार है",
    actionAllSetDetail: "खेत में आगे क्या करना है, सहायक से पूछें।",
    actionAllSetCta: "AgriSaarthi से पूछें",
    plannerTitle: "आज की योजना",
    plannerSetupHint:
      "योजना बनाने के लिए फार्म प्रोफ़ाइल सेट करें और फसल चुनें।",
    plannerCropHint:
      "सलाहकार में फसल चुनें ताकि आपकी संदर्भ-आधारित फार्म योजना बने।",
    plannerDueToday: (n) => `${n} आज देय`,
    plannerWeatherAware: (n) => `${n} मौसम-सचेत`,
    plannerCompleted: (n) => `${n} पूरी`,
    plannerNoTasks:
      "अभी कोई सक्रिय कार्य नहीं — योजना बनाने के लिए प्लानर खोलें।",
    plannerWeatherAction: (title) => `मौसम कार्रवाई: ${title}`,
    plannerDecisionEngine: "डिसीज़न इंजन · आपके खेत कॉन्टेक्स्ट से",
    plannerOpen: "प्लानर खोलें",
    timelineTitle: "गतिविधि समयरेखा",
    timelineEmpty:
      "जैसे-जैसे आप ऐप इस्तेमाल करेंगे — फसल चयन, मौसम कार्रवाई, स्वास्थ्य जांच, कार्य और कार्य-अनुरोध — आपकी खेत गतिविधियां यहां दिखेंगी।",
    timelineEventCount: (n) =>
      n === 1 ? "इस सेशन में 1 घटना" : `इस सेशन में ${n} घटनाएं`,
    timelineVerifiedPresent: "आपकी समयरेखा में सत्यापित रिकॉर्ड मौजूद हैं।",
    timelineView: "समयरेखा देखें",
    assistantEntryTitle: "AgriSaarthi से पूछें",
    assistantLatest: "पिछला सवाल",
    assistantAnswered: "जवाब दिया",
    assistantKnownFarm: (acres, crop, location) =>
      `मुझे आपका ${location} में ${acres} एकड़ का ${crop} खेत पता है — सिंचाई, फसल जांच या कार्यों के बारे में पूछें।`,
    assistantGeneric:
      "सिंचाई, फसल जांच या खेत कार्यों के बारे में पूछें — जवाब उपलब्ध होने पर आपके खेत कॉन्टेक्स्ट का इस्तेमाल करते हैं।",
    assistantSuggested1: "आज मुझे क्या करना चाहिए?",
    assistantSuggested2: "क्या सिंचाई ज़रूरी है?",
    assistantEntryFooter: "AI मॉडल — विशेषज्ञ सलाह नहीं",
    assistantEntryOpen: "सहायक खोलें",
  },

  featureCards: {
    weatherTitle: "मौसम",
    weatherUnavailable:
      "लाइव मौसम अस्थायी रूप से उपलब्ध नहीं है। मौसम-आधारित कार्रवाई देखने के लिए प्रोफ़ाइल में अपनी खेत की जगह जोड़ें।",
    weatherFallbackNote: "लाइव मौसम उपलब्ध नहीं — फॉलबैक मान दिख रहे हैं।",
    weatherLiveFooter: (time) => `लाइव API — Open-Meteo · अपडेट ${time}`,
    weatherFallbackFooter: "मौसम फॉलबैक — निश्चित नमूना मान",
    weatherRefreshAria: "मौसम रिफ्रेश करें",
    weatherFullView: "पूरा व्यू",
    metricTemperature: "तापमान",
    metricRainChance: "बारिश की संभावना",
    metricHumidity: "नमी",
    metricWind: "हवा",
    actionBlockLabel: "खेत कार्रवाई · डिसीज़न इंजन",
    actionWhy: "क्यों: ",
    recTitle: "सुझाई गई फसल",
    recSetupTitle: "पहले अपनी फार्म प्रोफ़ाइल पूरी करें",
    recSetupBody:
      "नियम इंजन को मिलान फसलें बनाने के लिए आपकी जगह, आकार, मिट्टी, सिंचाई और सीज़न चाहिए।",
    recSetupFooter: "नियम-आधारित प्रीव्यू",
    recOpenProfile: "प्रोफ़ाइल खोलें",
    recNoMatchTitle: "इस प्रोफ़ाइल के लिए अभी कोई मज़बूत मिलान नहीं",
    recNoMatchBody: "फसल सलाहकार में सीज़न, मिट्टी या सिंचाई बदलकर देखें।",
    recOpenAdvisor: "सलाहकार खोलें",
    recMoreReasons: (n) => ` — साथ में ${n} और मिलान कारण।`,
    recFooter: "नियम-आधारित — आपके मौजूदा खेत कॉन्टेक्स्ट से",
    recSelected: "चुनी गई",
    waterLabel: (req) => `${req} पानी`,
    water: { low: "कम", moderate: "मध्यम", high: "अधिक" },
    suitability: { high: "उच्च", moderate: "मध्यम", exploratory: "प्रायोगिक" },
    suitabilityBadge: (s) => `${s} उपयुक्तता`,
    healthTitle: "फसल स्वास्थ्य",
    healthLatestTitle: "नवीनतम फसल स्वास्थ्य जांच",
    healthRunTitle: "फसल स्वास्थ्य जांच करें",
    healthRunBody:
      "सुरक्षित फॉलबैक मार्गदर्शन के साथ सावधान AI-सहायता प्राप्त दृश्य आकलन के लिए पत्ती की फ़ोटो अपलोड करें।",
    healthFooter: "निर्णय सहायता, निदान नहीं",
    healthCheckNow: "अभी जांचें",
    healthViewAnalysis: "विश्लेषण देखें",
    healthLikelihood: (l) => `दृश्य संभावना: ${l}`,
    healthFallbackBadge: "फॉलबैक मार्गदर्शन",
    healthFallbackNote:
      "लाइव मॉडल उपलब्ध नहीं था — यह फॉलबैक मार्गदर्शन है, AI मॉडल का नतीजा नहीं।",
    opsTitle: "खेत के कार्य",
    opsPlanTitle: "खेत का कार्य योजना बनाएं",
    opsPlanBody: "कार्य चुनें, उपयुक्त मशीनरी देखें और सेवा अनुरोध भेजें।",
    opsSubmitted: "अनुरोध भेजा गया",
    opsAccepted: "प्रदाता ने अनुरोध स्वीकार किया",
    opsProviderUnavailable: "प्रदाता अनुपलब्ध",
    opsInProgress: "अनुरोध प्रक्रिया में",
    opsAvailabilityNote: "उपलब्धता जुड़े हुए सेवा प्रदाताओं पर निर्भर करती है",
    opsViewStatus: "अनुरोध स्थिति देखें",
    opsOpenWorkflow: "फ्लो खोलें",
    notExpertAdvice: "AI मॉडल — विशेषज्ञ सलाह नहीं",
  },

  farmProfile: {
    eyebrow: "आपकी खेत यात्रा का चरण 1",
    title: "फार्म प्रोफ़ाइल",
    description:
      "यह प्रोफ़ाइल फसल सलाह, मौसम कार्रवाई, फसल स्वास्थ्य और कार्यों के लिए साझा कॉन्टेक्स्ट बनती है। बाकी सब इसी पर बनता है।",
    savedTitle: "प्रोफ़ाइल सेव हो गई",
    savedBody: "आपका खेत कॉन्टेक्स्ट पूरे ऐप में अपडेट हो गया —",
    savedLink: "फसल सलाहकार पर आगे बढ़ें",
    useSampleFarm: "नमूना खेत इस्तेमाल करें",
    clearSession: "सेशन साफ़ करें",
    sampleNote:
      "नमूना खेत: रमेश पाटिल, 5 एकड़, नाशिक — या फ़ॉर्म में अपनी जानकारी भरें।",
    whoTitle: "यह ज़मीन कौन खेती है",
    whoDescription: "मार्गदर्शन को निजी बनाने के लिए उपयोग।",
    farmerName: "किसान का नाम",
    farmerNameHint: "यह नाम आपके डैशबोर्ड मार्गदर्शन को निजी बनाता है।",
    farmerNamePlaceholder: "जैसे: रमेश पाटिल",
    location: "स्थान / ज़िला",
    locationHint: "गांव, ज़िला या क्षेत्र — मौसम और फसलों के लिए उपयोग।",
    locationPlaceholder: "जैसे: नाशिक, महाराष्ट्र",
    landTitle: "ज़मीन की जानकारी",
    landDescription:
      "फसलें, मशीनें और पानी की योजना आपकी ज़मीन से मिलाने में मदद करती है।",
    farmSize: "खेत का आकार (एकड़)",
    farmSizeHint: "एकड़ में — उपयुक्त मशीनें चुनने में उपयोग।",
    irrigation: "सिंचाई",
    irrigationHint: "फसल के पानी की योजना पर असर डालती है।",
    soilType: "मिट्टी का प्रकार",
    soilTypeHint: "अनुमानित प्रकार काफ़ी है — बाद में सुधार सकते हैं।",
    season: "सीज़न",
    seasonHint: "खरीफ / रबी / ज़ायद।",
    cropTitle: "मौजूदा फसल (वैकल्पिक)",
    cropDescription: "आप बाद में फसल सलाहकार से भी फसल चुन सकते हैं।",
    cropLabel: "अभी क्या उग रहा है?",
    cropHint: "तय न हो तो खाली छोड़ें — सलाहकार विकल्प सुझाएगा।",
    cropPlaceholder: "जैसे: गेहूं",
    save: "फार्म प्रोफ़ाइल सेव करें",
    continueToAdvisor: "फसल सलाहकार पर आगे बढ़ें",
    irrigationOptions: {
      "rain-fed": "केवल बारानी",
      canal: "नहर",
      borewell: "बोरवेल",
      drip: "ड्रिप",
      sprinkler: "स्प्रिंकलर",
    },
    soilOptions: {
      black: "काली (कपास की मिट्टी)",
      alluvial: "जलोढ़",
      loamy: "दोमट",
      sandy: "बलुई",
      clay: "चिकनी",
      red: "लाल मिट्टी",
      laterite: "लैटेराइट",
    },
    seasonOptions: {
      kharif: "खरीफ (मानसून — जून–अक्टूबर)",
      rabi: "रबी (सर्दी — नवंबर–अप्रैल)",
      zaid: "ज़ायद (गर्मी — अप्रैल–जून)",
    },
    cancel: "रद्द करें",
    errors: {
      farmerName: "किसान का नाम ज़रूरी है।",
      location: "स्थान हर दूसरी सुविधा को काम करने में मदद करता है।",
      farmSize: "0.1 और 500 एकड़ के बीच खेत का आकार भरें।",
    },
  },

  cropAdvisor: {
    eyebrow: "आपकी खेत यात्रा का चरण 2",
    title: "फसल सलाहकार",
    description:
      "आपके खेत कॉन्टेक्स्ट से बने स्मार्ट फसल सुझाव — कारण हमेशा दिखता है, कभी छिपता नहीं।",
    detailsTitle: "आपके खेत की जानकारी",
    detailsDescription:
      "आपकी फार्म प्रोफ़ाइल से पहले से भरी हैं — इस सीज़न के लिए बदलें।",
    location: "स्थान",
    season: "सीज़न",
    farmSize: "खेत का आकार (एकड़)",
    irrigation: "सिंचाई",
    soilType: "मिट्टी का प्रकार",
    seasonOptions: {
      kharif: "खरीफ (मानसून)",
      rabi: "रबी (सर्दी)",
      zaid: "ज़ायद (गर्मी)",
    },
    landPhoto: "खेत की फ़ोटो (वैकल्पिक)",
    landPhotoHint:
      "केवल संदर्भ संकेत — फसल सुझाव का अकेला आधार कभी नहीं।",
    photoPreviewAlt: "चुनी गई खेत फ़ोटो का प्रीव्यू",
    removePhoto: "खेत फ़ोटो हटाएं",
    engineNote: "डिसीज़न इंजन — फ़ोटो स्कोर पर कभी असर नहीं डालती।",
    analyzing: "खेत प्रोफ़ाइल का विश्लेषण हो रहा है…",
    findCrops: "उपयुक्त फसलें खोजें",
    incompleteTitle:
      "भरोसेमंद सुझाव के लिए प्रोफ़ाइल की जानकारी काफ़ी नहीं",
    completeProfile: "फार्म प्रोफ़ाइल पूरी करें",
    resultsAria: "फसल सुझाव",
    howToReadTitle: "ये नतीजे कैसे समझें",
    howToReadBody:
      "रैंकिंग पारदर्शी डिसीज़न इंजन से आती है — निर्णय सहायता है, वैज्ञानिक पक्कापन नहीं। अपने स्थानीय कृषि अधिकारी से पुष्टि करें।",
    viewDashboard: "डैशबोर्ड देखें",
    noMatchTitle: "कोई भी फसल निर्णय नियमों में काफ़ी नहीं टिकी",
    noMatchBody:
      "इस सीज़न/मिट्टी/सिंचाई के मेल के लिए नॉलेज बेस की कोई फसल मज़बूती से स्कोर नहीं कर पाई। आंकड़े बदलें या स्थानीय रूप से जांचें।",
    emptyTitle: "अभी कोई सुझाव नहीं",
    emptyComplete:
      "ऊपर अपने खेत की जानकारी देखें और साफ़ कारणों के साथ विकल्प देखने के लिए \"उपयुक्त फसलें खोजें\" चुनें।",
    emptyIncomplete:
      "पहले अपनी फार्म प्रोफ़ाइल पूरी करें — सलाहकार इसी से मिलान फसलें बनाता है।",
    eventSelectedTitle: (crop) => `${crop} चुनी गई`,
    eventSelectedDescription: (crop, season, location) =>
      `सलाहकार से ${location} में ${season} सीज़न के लिए फसल चुनी गई।`,
    suitability: "उपयुक्तता: ",
    decisionBasis:
      "निर्णय आधार: सीज़न · मिट्टी · सिंचाई · स्थान · खेत आकार",
    whyTitle: "आपकी प्रोफ़ाइल से क्यों मेल खाती है",
    checkBeforePlantingLabel: "बोने से पहले जांचें: ",
    caveatLabel: "चेतावनी: ",
    howCalculated: "यह स्कोर कैसे बना",
    scoreNote:
      "डिसीज़न इंजन — पारदर्शी स्कोरिंग वेट, वैज्ञानिक सटीकता नहीं। खेत की फ़ोटो स्कोरिंग में कभी इस्तेमाल नहीं होती।",
    resultFooter:
      "मौजूदा प्रोफ़ाइल के आधार पर सुझाई गई फसल — \"सबसे अच्छी\" फसल नहीं।",
    selectCrop: (crop) => `${crop.split(" ")[0]} चुनें`,
    dimension: {
      season: "सीज़न",
      soil: "मिट्टी",
      irrigation: "सिंचाई",
      location: "स्थान",
      farmSize: "खेत आकार",
    },
  },

  cropHealth: {
    eyebrow: "AI फसल स्वास्थ्य विश्लेषण — निदान नहीं",
    title: "AI फसल स्वास्थ्य विश्लेषण",
    description:
      "सावधान दृश्य आकलन के लिए पत्ती की फ़ोटो अपलोड करें। इलाज से पहले हमेशा योग्य कृषि विशेषज्ञ से पुष्टि करें।",
    howTitle: "यह कैसे काम करता है",
    howBody:
      "नतीजे दृश्य संभावना के साथ संभावित समस्याएं हैं — कभी पक्कापन नहीं। अपलोड की गई तस्वीरें इसी विश्लेषण फ्लो में इस्तेमाल होती हैं और स्थायी रूप से सेव नहीं होतीं।",
    imageTitle: "पत्ती / फसल की तस्वीर",
    imageDescription:
      "साफ़, अच्छी रोशनी वाली एक फ़ोटो सबसे अच्छी — JPEG, PNG या WEBP, 5 MB तक।",
    uploadTitle: "साफ़ पत्ती या फसल की तस्वीर अपलोड करें",
    uploadHint: "तस्वीर चुनने के लिए टैप करें — JPEG, PNG या WEBP",
    imageNotUsable: "तस्वीर इस्तेमाल योग्य नहीं",
    chooseAnother: "दूसरी तस्वीर चुनें",
    previewAlt: (name) => `चुनी गई फसल तस्वीर का प्रीव्यू: ${name}`,
    analyzeImage: "तस्वीर का विश्लेषण करें",
    visualLikelihood: (l) => `दृश्य संभावना: ${l}`,
    eventCheckTitle: (crop) => `स्वास्थ्य जांच: ${crop}`,
    eventCheckDescription: (condition, likelihood) =>
      `संभावित स्थिति: ${condition} (दृश्य संभावना: ${likelihood})।`,
    analyzingTitle: "फसल तस्वीर का विश्लेषण हो रहा है…",
    analyzingHint:
      "आमतौर पर कुछ सेकंड लगते हैं। आपको सावधान दृश्य आकलन मिलेगा।",
    analyzedAlt: (name) => `विश्लेषित फसल फ़ोटो: ${name}`,
    possibleCondition: "संभावित समस्या",
    cropSuggestion: (crop) => `दृश्य फसल सुझाव: ${crop}`,
    modelConfidence: (c) => `मॉडल विश्वास: ${c} — कृषि पक्कापन नहीं`,
    fallbackBadge: "फॉलबैक मार्गदर्शन",
    qualityBadge: "तस्वीर गुणवत्ता अपर्याप्त",
    observedAria: "हमने क्या देखा",
    observedTitle: "हमने क्या देखा",
    actionsAria: "सुझाए गए अगले कदम",
    actionsTitle: "सुझाए गए अगले कदम",
    importantTitle: "ज़रूरी",
    importantBody:
      " यह तस्वीर-आधारित स्क्रीनिंग सहायता है, पुष्ट निदान नहीं। योग्य कृषि विशेषज्ञ से पुष्टि करें।",
    followUpAdded: "फॉलो-अप आपकी फार्म योजना में जुड़ गया।",
    addFollowUp: "फॉलो-अप फार्म योजना में जोड़ें",
    fallbackTaskNote:
      "कार्य फॉलबैक के रूप में लेबल होगा — फॉलबैक मार्गदर्शन से बना, AI मॉडल नतीजा नहीं।",
    resultFallback: "फॉलबैक मार्गदर्शन — AI मॉडल नतीजा नहीं",
    resultModel: "AI मॉडल नतीजा",
    analyzeAnother: "दूसरी तस्वीर विश्लेषित करें",
    unavailableTitle:
      "AI विश्लेषण अस्थायी रूप से उपलब्ध — फॉलबैक मार्गदर्शन दिख रहा है",
    unavailableBody:
      "लाइव मॉडल तक नहीं पहुंच पाए, इसलिए अगली सफल जांच पर संरक्षित फॉलबैक मार्गदर्शन दिखेगा। आप कभी भी दोबारा कोशिश कर सकते हैं।",
    followUpTaskTitle: (condition) => `फॉलो-अप: ${condition}`,
    followUpTaskDescription: (crop, condition, likelihood) =>
      `${crop} की फसल स्वास्थ्य जांच ने "${condition}" (दृश्य संभावना: ${likelihood}) दिखाया। प्रभावित पौधों की दोबारा जांच करें और इलाज से पहले योग्य कृषि विशेषज्ञ से पुष्टि करें।`,
  },

  weather: {
    eyebrow: "मौसम तभी काम का है जब वह कार्रवाई बने",
    title: "मौसम → खेत की कार्रवाई",
    description:
      "आपके खेत की जगह की लाइव स्थितियां, सावधान डिसीज़न-इंजन कार्रवाई में बदली हुई।",
    unavailableTitle: "मौसम उपलब्ध नहीं",
    unavailableBody:
      "लाइव मौसम अस्थायी रूप से उपलब्ध नहीं है। फार्म प्रोफ़ाइल में अपनी खेत की जगह जोड़ें, फिर दोबारा कोशिश करें।",
    fallbackBanner:
      "लाइव मौसम अस्थायी रूप से उपलब्ध नहीं — फॉलबैक मान दिख रहे हैं। मान निश्चित और पूर्वानुमेय रहते हैं।",
    conditionsTitle: "मौजूदा स्थितियां",
    weatherFor: (name) => `${name} के लिए मौसम`,
    refreshWeather: "मौसम रिफ्रेश करें",
    feelsLike: "महसूस होता है",
    humidity: "नमी",
    precipitation: "वर्षा",
    wind: "हवा",
    farmAction: "खेत कार्रवाई",
    decisionEngine: "डिसीज़न इंजन",
    caution: "सावधानी",
    normal: "सामान्य",
    why: "क्यों",
    recommendation: "सुझाव",
    caveat: "चेतावनी",
    outlookTitle: "3-दिन का पूर्वानुमान",
    outlookFallback: "फॉलबैक पूर्वानुमान — निश्चित नमूना मान",
    outlookLive: "लाइव पूर्वानुमान — Open-Meteo",
    liveFetched: (time) => `लाइव API — Open-Meteo · ${time} पर लाया गया`,
    thresholdsNote:
      "कार्रवाई नियम कॉन्फ़िगर की गई सीमाएं हैं, कृषि गारंटी नहीं।",
  },

  operations: {
    eyebrow: "कार्य से उपकरण तक, सेवा अनुरोध तक",
    title: "खेत के कार्य",
    description:
      "कार्य चुनें, उपयुक्त मशीनरी देखें और सेवा अनुरोध भेजें — स्थिति आपके फार्म वर्कस्पेस में ट्रैक होती है।",
    progressAria: "फ्लो प्रगति",
    step1: "कार्य चुनें",
    step2: "मशीनरी देखें",
    step3: "सेवा का अनुरोध करें",
    profileIncompleteTitle: "फार्म प्रोफ़ाइल अधूरी है",
    profileIncompleteBody:
      "संदर्भ-आधारित कार्य सुझाव पाने के लिए अपनी फार्म प्रोफ़ाइल सेट करें।",
    completeProfile: "फार्म प्रोफ़ाइल पूरी करें",
    weatherSuggests: (title) => `मौसम कार्रवाई अभी सुझाती है: ${title}।`,
    chooseQuestion: "आपको कौन सा खेत कार्य चाहिए?",
    findEquipment: "उपकरण खोजें",
    suitableTitle: (name) => `उपयुक्त मशीनरी — ${name}`,
    suitableNote:
      "उपयुक्तता डिसीज़न इंजन से — खेत आकार, फसल और दूरी पर आधारित। वैज्ञानिक रूप से सर्वोत्तम चयन नहीं।",
    chooseDifferent: "दूसरा कार्य चुनें",
    noMachineryTitle: "इस कार्य के लिए कोई उपयुक्त मशीनरी नहीं मिली।",
    noMachineryBody:
      "इस कार्य के लिए अभी कोई उपकरण सूचीबद्ध नहीं है। दूसरा कार्य आज़माएं या बाद में देखें।",
    tryAnotherOperation: "दूसरा कार्य आज़माएं",
    confirmTitle: "अपना अनुरोध पुष्ट करें",
    confirmDescription:
      "सेवा अनुरोध भेजने से पहले जानकारी देख लें।",
    detailOperation: "कार्य",
    detailMachine: "मशीन",
    detailProvider: "प्रदाता",
    detailDate: "अनुरोधित तारीख",
    detailDateFlexible: "लचीली — प्रदाता के साथ तय होगी",
    detailLocation: "खेत का स्थान",
    detailSize: "खेत का आकार",
    dateLabel: "अनुरोधित तारीख (वैकल्पिक)",
    availabilityNote: "उपलब्धता जुड़े हुए सेवा प्रदाताओं पर निर्भर करती है।",
    confirmRequest: "अनुरोध पुष्ट करें",
    backToMachinery: "मशीनरी पर वापस",
    submittedTitle: "अनुरोध भेजा गया",
    providerResponse: (time) => `प्रदाता जवाब की उम्मीद ${time} में।`,
    responseTitle: "सेवा अनुरोध की स्थिति",
    acceptedBody: (provider, operation) =>
      `${provider} ने ${operation} के लिए आपका सेवा अनुरोध स्वीकार किया।`,
    machineDate: (machine, date) => `मशीन: ${machine} · तारीख: ${date}`,
    flexible: "लचीली",
    finalScheduling:
      "अंतिम समय-सारणी सीधे प्रदाता के साथ पुष्ट होती है।",
    planAnother: "दूसरा कार्य योजना बनाएं",
    providerUnavailableTitle: "प्रदाता अनुपलब्ध",
    providerUnavailableBody:
      "यह मशीन अभी अनुपलब्ध है। आप सेवा डेटा से दूसरी उपयुक्त मशीन आज़मा सकते हैं।",
    alternativeMachine: "वैकल्पिक मशीन",
    alternativeMeta: (provider, km, badge) =>
      `${provider} · ${km} किमी दूर · ${badge}`,
    noAlternative:
      "इस कार्य के लिए अभी कोई वैकल्पिक प्रदाता उपलब्ध नहीं है।",
    tryAnotherMachine: "दूसरी उपयुक्त मशीन आज़माएं",
    startOver: "फिर से शुरू करें",
    serviceDataNote:
      "सर्विस डेटा · उपलब्धता जुड़े हुए सेवा प्रदाताओं पर निर्भर करती है।",
    requestService: "सेवा का अनुरोध करें",
    suitableFor: (min, max) => `उपयुक्त: ${min}–${max} एकड़`,
    responseTime: (time) => `जवाब: ${time}`,
    shownAvailable: "उपलब्ध दिखाया गया",
    shownBusy: "व्यस्त दिखाया गया",
    unavailableBadge: "अनुपलब्ध",
    unavailableNote: "अभी अनुपलब्ध — दूसरा प्रदाता आज़माएं",
    eventRequestedTitle: (name) => `${name} का अनुरोध किया गया`,
    eventRequestedDescription: (machine, provider) =>
      `${machine} (${provider}) के लिए सेवा अनुरोध भेजा गया।`,
    eventAcceptedTitle: (name) => `${name} प्रदाता ने स्वीकार किया`,
    eventAcceptedDescription:
      "प्रदाता ने फ्लो में सेवा अनुरोध स्वीकार किया। अंतिम समय-सारणी सीधे प्रदाता के साथ पुष्ट होती है।",
    seasonChip: "मौसम: ",
    cropChip: "फसल: ",
    viewDashboard: "डैशबोर्ड देखें",
  },

  planner: {
    eyebrow: "Farm → Decision → Action → Plan",
    title: "फार्म प्लानर",
    description:
      "आपका खेत कॉन्टेक्स्ट संदर्भ-आधारित आगामी कार्यों में बदलता है — आज, इस सप्ताह और मौसम-सचेत। हर कार्य बताता है कि वह क्यों बना।",
    planFor: (crop) => `योजना — `,
    seasonActive: (season, count) =>
      `${season} सीज़न · ${count} सक्रिय कार्य`,
    createRecord: "फार्म रिकॉर्ड बनाएं",
    recordEventTitle: "फार्म रिकॉर्ड स्नैपशॉट बनाया गया",
    recordEventDescription: (crop, location) =>
      `${location} में ${crop} के लिए योजना स्नैपशॉट।`,
    noPlanTitle: "अभी कोई फार्म योजना नहीं — पहले फसल चुनें",
    noPlanBody:
      "प्लानर आपके फसल कैलेंडर, मौसम कार्रवाई और खेत कॉन्टेक्स्ट से कार्य बनाता है। शुरू करने के लिए फसल चुनें।",
    openAdvisor: "फसल सलाहकार खोलें",
    completedSkipped: "पूरे और छोड़े गए",
    completedAria: "पूरे और छोड़े गए कार्य",
    bucket: {
      today: "आज",
      todayHint: "आज देय या समय बीत चुके",
      thisWeek: "इस सप्ताह",
      thisWeekHint: "अगले 7 दिन",
      upcoming: "आगे आने वाले",
      upcomingHint: "इस सीज़न में बाद में",
      weatherWatch: "मौसम निगरानी",
      weatherWatchHint: "मौसम-सचेत कार्य — पूर्वानुमान दोबारा देखें",
      farmAction: "खेत कार्रवाई",
      farmActionHint: "आज की मौसम कार्रवाई से",
      tasksAria: (title) => `${title} कार्य`,
    },
    timelineTip:
      "सुझाव: कार्य पूरे करें ताकि आपका सत्यापित फार्म रिकॉर्ड ",
    timelineTipLink: "गतिविधि समयरेखा",
    taskAria: (title) => `कार्य: ${title}`,
    priority: { high: "उच्च", medium: "मध्यम", low: "कम" },
    weatherAware: "मौसम-सचेत",
    whyTask: "यह कार्य क्यों?",
    sourceCalendar: "फसल कैलेंडर टेम्पलेट",
    calendarNote: "मौसम-सचेत कार्य — काम से पहले पूर्वानुमान दोबारा देखें।",
    statusStart: "शुरू करें",
    statusComplete: "पूरा करें",
    statusSkip: "छोड़ें",
    statusReopen: "दोबारा खोलें",
    statusInProgressAria: "कार्य को चालू के रूप में चिह्नित करें",
    statusCompleteAria: "कार्य को पूरा के रूप में चिह्नित करें",
    statusSkipAria: "कार्य छोड़ें",
    statusReopenAria: (id) => `कार्य दोबारा खोलें: ${id}`,
  },

  timeline: {
    eyebrow: "Farm → Decision → Action → Plan → Proof",
    title: "गतिविधि समयरेखा",
    description:
      "आपकी हर कार्रवाई यहां क्रम से दिखती है। ज़रूरी घटनाओं को छेड़छाड़-रोधी फार्म रिकॉर्ड में सत्यापित किया जा सकता है।",
    feedAria: "खेत समयरेखा — नई पहले",
    emptyTitle: "अभी कोई खेत गतिविधि नहीं",
    emptyBody:
      "जैसे-जैसे आप ऐप इस्तेमाल करेंगे — फसल चयन, मौसम जांच, फसल स्वास्थ्य विश्लेषण, कार्य योजना और कार्य अनुरोध — हर कार्रवाई यहां क्रम से दिखेगी।",
    earlierEvents: (n) =>
      n === 1 ? "इस सेशन में 1 पहले की घटना" : `इस सेशन में ${n} पहले की घटनाएं`,
    hashPrefix: "हैश",
    eventType: {
      CROP_SELECTED: "फसल चुनी गई",
      WEATHER_ACTION: "मौसम कार्रवाई बनी",
      HEALTH_CHECK: "फसल स्वास्थ्य विश्लेषित",
      TASK_CREATED: "खेत कार्य बनाया गया",
      TASK_COMPLETED: "खेत कार्य पूरा हुआ",
      OPERATION_REQUESTED: "कार्य का अनुरोध किया गया",
      OPERATION_COMPLETED: "कार्य स्वीकार हुआ",
      FARM_RECORD_CREATED: "फार्म रिकॉर्ड बनाया गया",
      PROVENANCE_VERIFIED: "प्रोवेनेंस सत्यापित",
    },
    createRecord: "सत्यापित रिकॉर्ड बनाएं",
    createRecordAria: (title) => `सत्यापित रिकॉर्ड बनाएं: ${title}`,
    anchorTestnet: "टेस्टनेट पर एंकर करें",
    anchorTestnetAria: (title) =>
      `${title} का रिकॉर्ड कॉन्फ़िगर टेस्टनेट पर एंकर करें`,
    verifyAgain: "दोबारा सत्यापित करें",
    verifyAgainAria: (title) => `${title} का रिकॉर्ड दोबारा सत्यापित करें`,
    busyCreating: "रिकॉर्ड बन रहा है…",
    busyAnchoring: "एंकर हो रहा है…",
    busyVerifying: "सत्यापित हो रहा है…",
    networkLabel: "नेटवर्क: ",
    txLabel: "Tx: ",
    createUnavailable:
      "रिकॉर्ड बनाना उपलब्ध नहीं — रिकॉर्ड बना नहीं।",
    createNetworkError: "रिकॉर्ड बनाना उपलब्ध नहीं — नेटवर्क त्रुटि।",
    localVerifiedNote: (hash) =>
      `रिकॉर्ड लोकल सत्यापित (हैश ${hash.slice(0, 12)}…)। ऐप-भीतर निर्धारक सत्यापन — ब्लॉकचेन लेन-देन नहीं।`,
    localVerifiedEventTitle: (title) => `रिकॉर्ड सत्यापित: ${title}`,
    localVerifiedEventDescription:
      "इस खेत घटना का लोकल सत्यापन पूरा हुआ।",
    anchoredNote: (network, hash) =>
      `${network} पर एंकर हुआ। लेन-देन ${hash.slice(0, 14)}…`,
    anchoredEventTitle: (title) => `ब्लॉकचेन एंकर: ${title}`,
    anchoredEventDescription: (network, hash) =>
      `कैनोनिकल हैश ${network} पर एंकर हुआ (tx ${hash.slice(0, 14)}…)।`,
    pendingNote: "एंकर लेन-देन भेजा गया — पुष्टि की प्रतीक्षा में।",
    anchoringUnavailable:
      "ब्लॉकचेन एंकरिंग उपलब्ध नहीं। रिकॉर्ड लोकल सत्यापित बना रहता है।",
    verifyUnavailable: "सत्यापन अभी नहीं चलाया जा सका।",
    verifyNetworkError: "सत्यापन अभी नहीं चलाया जा सका — नेटवर्क त्रुटि।",
    reverifiedChain:
      "ऑन-चेन दोबारा सत्यापित — रिकॉर्ड हैश की पुष्टि कॉन्ट्रैक्ट ने की।",
    reverifiedLocal:
      "लोकल दोबारा सत्यापित — रिकॉर्ड हैश पंजीकृत हैश से मेल खाता है।",
  },

  assistantPage: {
    eyebrow: "आपके खेत के संदर्भ में",
    title: "AgriSaarthi AI सहायक",
    description:
      "आपका कृषि निर्णय-सहायता सहायक, आपके खेत कॉन्टेक्स्ट से जुड़ा हुआ।",
    profileIncompleteTitle: "फार्म प्रोफ़ाइल अधूरी है",
    profileIncompleteBody:
      "व्यक्तिगत मार्गदर्शन के लिए अपनी फार्म प्रोफ़ाइल सेट करें। सामान्य कृषि सवाल तब भी काम करते हैं।",
    completeProfile: "फार्म प्रोफ़ाइल पूरी करें",
    farmLabel: "खेत: ",
    notSet: "सेट नहीं",
    locationNotSet: "स्थान सेट नहीं",
    cropLabel: "फसल: ",
    notSelected: "नहीं चुनी गई",
    seasonLabel: "सीज़न: ",
    conversationAria: "सहायक बातचीत",
    typingAria: "सहायक टाइप कर रहा है",
    thinking: "AgriSaarthi सोच रहा है…",
    tryAsking: "ऐसे पूछें",
    suggested: [
      "आज मुझे क्या करना चाहिए?",
      "क्या सिंचाई ज़रूरी है?",
      "मुझे अपनी फसल में क्या जांचना चाहिए?",
    ],
    inputAria: "अपने खेत के बारे में सवाल पूछें",
    inputPlaceholder: "जैसे: क्या मुझे आज सिंचाई करनी चाहिए?",
    sendAria: "संदेश भेजें",
    unavailable:
      "AI सहायक अस्थायी रूप से उपलब्ध नहीं है। फॉलबैक मार्गदर्शन दिख रहा है।",
    fallbackShown:
      "AI सहायक अस्थायी रूप से उपलब्ध नहीं है — फॉलबैक मार्गदर्शन दिखाया गया।",
    footerNote:
      "AI मॉडल — योग्य कृषि विशेषज्ञ नहीं। चैट सेव नहीं होती।",
    backToDashboard: "डैशबोर्ड पर वापस",
  },

  robot: {
    panelAria: "AgriSaarthi AI सहायक पैनल",
    connected: "आपके खेत कॉन्टेक्स्ट से जुड़ा हुआ",
    expandAria: "पूरे सहायक पेज पर खोलें",
    expandTitle: "पूरा सहायक खोलें",
    closeAria: "सहायक पैनल बंद करें",
    quickPromptsAria: "तेज़ सवाल",
    quickPrompts: [
      "आज मुझे क्या करना चाहिए?",
      "क्या मुझे सिंचाई करनी चाहिए?",
      "मुझे अपनी गेहूं की फसल में क्या जांचना चाहिए?",
    ],
    greetingFarm: (name, crop) =>
      `नमस्ते ${name} — आज आपके${crop ? ` ${crop}` : ""} खेत में मैं कैसे मदद कर सकता हूं?`,
    greetingGeneric:
      "मैं कैसे मदद करूं? संदर्भ-आधारित जवाबों के लिए अपनी फार्म प्रोफ़ाइल सेट करें।",
    conversationAria: "सहायक बातचीत",
    typingAria: "सहायक टाइप कर रहा है",
    thinking: "AgriSaarthi सोच रहा है…",
    added: "जुड़ गया ✓",
    addToPlan: "फार्म प्लान में जोड़ें",
    addToPlanAria: (action) => `फार्म प्लान में जोड़ें: ${action}`,
    suggestedBy: (preview) => `AgriSaarthi AI का सुझाव: "${preview}"`,
    unavailable:
      "AI सहायक अस्थायी रूप से उपलब्ध नहीं है। फॉलबैक मार्गदर्शन दिख रहा है।",
    inputAria: "अपने खेत के बारे में सवाल पूछें",
    inputPlaceholder: "अपने खेत के बारे में पूछें…",
    sendAria: "संदेश भेजें",
    launcherAria: "AgriSaarthi AI सहायक से पूछें",
    launcherTitle: "AgriSaarthi से पूछें",
    launcherTooltip: "AgriSaarthi से पूछें",
  },

  assistantLib: {
    languageDirective:
      "LANGUAGE: The user may write in English or Hindi. If the user's question is in Hindi, respond in natural, simple Indian Hindi (Devanagari script) that a farmer can easily understand — use everyday agricultural Hindi, not heavy Sanskrit. If the question is in English, respond in English. Keep the JSON structure exactly as specified.",
    fallbackHindiNote:
      "Hindi replies come from the AI model; fallback answers are English-only.",
    redirect:
      "मैं कृषि और खेत निर्णय सहायता पर केंद्रित हूं। आपके खेत, फसल, मौसम, फसल स्वास्थ्य या खेत कार्यों के बारे में मैं मदद कर सकता हूं।",
    todayAnswer: (crop) => {
      const parts: string[] = [
        "आपके मौजूदा खेत कॉन्टेक्स्ट के आधार पर, आज की मौसम कार्रवाई देखें,",
      ];
      parts.push(
        crop
          ? `अपनी ${crop} फसल में साफ़ दिखने वाली परेशानी जांचें,`
          : "अपनी फसल में साफ़ दिखने वाली परेशानी जांचें,"
      );
      parts.push("और कोई लंबित खेत कार्य देखें।");
      return parts.join(" ");
    },
    todayActions: [
      "मौसम कार्रवाई देखें",
      "फसल स्वास्थ्य जांचें",
      "कार्य की स्थिति देखें",
    ],
    todayCaveat:
      "मौजूदा ऐप कॉन्टेक्स्ट से बना फॉलबैक मार्गदर्शन — AI-जनित सलाह नहीं।",
    weatherWithContext: (title, message) => `${title}. ${message}`,
    weatherActions: [
      "पूरे पूर्वानुमान के लिए मौसम खोलें",
      "तय करने से पहले मिट्टी की नमी जांचें",
    ],
    weatherCaveat:
      "मौसम कार्रवाई डिसीज़न इंजन से है; काम से पहले खेत की स्थिति जांचें।",
    weatherNoData:
      "इस सेशन में मेरे पास कोई मौसम नतीजा नहीं है। ताज़ा खेत मौसम लाने के लिए मौसम पेज खोलें, फिर दोबारा पूछें।",
    weatherNoDataActions: ["मौसम पेज खोलें"],
    weatherNoDataCaveat: "फॉलबैक जवाब — कोई मौसम डेटा उपलब्ध नहीं था।",
    weatherWithContextSingle: (title, message) => `${title}. ${message}`,
    weatherLiveCaveat:
      "मौसम जानकारी ऐप द्वारा दी गई है — यहां घड़ीयली नहीं की गई।",
    weatherNoDataShort:
      "इस सेशन में मेरे पास कोई मौसम नतीजा नहीं है। ताज़ा खेत मौसम लाने के लिए मौसम पेज खोलें।",
    cropCheckAnswer: (crop) =>
      crop
        ? `अपने ${crop} के खेत में चलें और साफ़ दिखने वाली परेशानी देखें: पीली पड़ती पत्तियां, धब्बे, मुरझाना या असामान्य वृद्धि। कुछ असामान्य दिखे तो तस्वीर-आधारित जांच के लिए फसल स्वास्थ्य में साफ़ पत्ती की फ़ोटो अपलोड करें।`
        : "अपने खेत में चलें और साफ़ दिखने वाली परेशानी देखें: पीली पड़ती पत्तियां, धब्बे, मुरझाना या असामान्य वृद्धि। ज़्यादा ठीक मार्गदर्शन के लिए फार्म प्रोफ़ाइल में फसल चुनें।",
    cropCheckActionsWithCrop: [
      "खेत में चलें और देखें",
      "फसल स्वास्थ्य में पत्ती की फ़ोटो अपलोड करें",
    ],
    cropCheckActionsWithoutCrop: [
      "फार्म प्रोफ़ाइल में फसल चुनें",
      "खेत की नियमित निगरानी करें",
    ],
    cropCheckCaveat:
      "केवल दृश्य अवलोकन मार्गदर्शन — निदान नहीं। योग्य कृषि विशेषज्ञ से पुष्टि करें।",
    healthWithResult: (condition, crop) =>
      `ताज़ा तस्वीर जांच, ${crop} पर संभावित ${condition} पैटर्न दिखाती है। यह तस्वीर-आधारित स्क्रीनिंग नतीजा है, पुष्ट निदान नहीं।`,
    healthWithResultActions: [
      "जानकारी के लिए फसल स्वास्थ्य खोलें",
      "योग्य कृषि विशेषज्ञ से सलाह लें",
    ],
    healthCaveat: "तस्वीर-आधारित स्क्रीनिंग निदान नहीं है।",
    healthNoResult:
      "पहले फसल स्वास्थ्य में साफ़ फसल/पत्ती की तस्वीर अपलोड करें। फिर मैं यहां स्क्रीनिंग नतीजे का हवाला दे सकता हूं — केवल टेक्स्ट से मैं निदान नहीं कर सकता।",
    healthNoResultActions: ["फसल स्वास्थ्य पेज खोलें"],
    healthNoResultCaveat: "इस सेशन में कोई फसल स्वास्थ्य नतीजा नहीं है।",
    operationWithResult: (operation, machine, status) =>
      `आपका ताज़ा कार्य अनुरोध (${operation} — ${machine}) की स्थिति: ${status}। अंतिम समय-सारणी सीधे प्रदाता के साथ पुष्ट होती है।`,
    operationActions: ["फ्लो देखने के लिए खेत के कार्य खोलें"],
    operationCaveat:
      "मशीनरी उपलब्धता जुड़े हुए सेवा प्रदाताओं पर निर्भर करती है।",
    operationNoResult:
      "इस सेशन में अभी कोई खेत कार्य योजना नहीं बनी। आप खेत के कार्य में कोई कार्य चुनकर उपयुक्त मशीनरी देख सकते हैं।",
    operationNoResultActions: ["खेत के कार्य पेज खोलें"],
    recommendationAnswer:
      "आपका फसल सलाहकार अभी कॉन्फ़िगर फार्म प्रोफ़ाइल से पारदर्शी नियमों द्वारा सुझाव बनाता है। उन्हें देखने के लिए फसल सलाहकार खोलें — यह सहायक उस इंजन की जगह नहीं लेता।",
    recommendationActions: ["फसल सलाहकार पेज खोलें"],
    recommendationCaveat:
      "सुझाव डिसीज़न इंजन से आते हैं; स्थानीय कृषि और बाज़ार स्थितियों से जांचें।",
    genericContextLine: (location, size, crop) =>
      `आपके खेत${location ? ` (${location})` : ""}${
        size ? ` — ${size}` : ""
      }${crop ? `, ${crop} की फसल` : ""} के लिए, `,
    genericAnswer:
      "इस सेशन में उपलब्ध कॉन्टेक्स्ट के आधार पर सामान्य, संरक्षित मार्गदर्शन: अपनी मौसम कार्रवाई देखें, फसल में साफ़ दिखने वाली परेशानी देखें, और पूर्वानुमान के अनुसार खेत काम योजना बनाएं। विवरण ऐप के मौजूदा कॉन्टेक्स्ट तक सीमित हैं।",
    genericActions: [
      "मौसम कार्रवाई देखें",
      "फसल देखें",
      "खेत कार्य जांचें",
    ],
  },

  weatherLib: {
    standardCaveat:
      "डिसीज़न-इंजन नियम — काम करने से पहले खेत की स्थिति, मिट्टी की नमी और फसल अवस्था जांचें। किसी विशेषज्ञ कृषि गारंटी नहीं।",
    excessWater: {
      title: "संभावित अधिक पानी के लिए तैयारी करें",
      message: (crop) =>
        `अगले 3 दिनों में काफ़ी वर्षा का पूर्वानुमान है${crop ? ` (${crop})` : ""}।`,
      reason: (mm) =>
        `पूर्वानुमान अवधि में ${mm} मिमी तक वर्षा दिखाता है।`,
      recommendation: (crop) =>
        `खेत की जल निकासी की समीक्षा करें${crop ? ` (आपकी ${crop} के लिए)` : ""}। स्थिति साफ़ होने तक नई सिंचाई न तय करें।`,
    },
    irrigation: {
      title: "तय सिंचाई की समीक्षा करें",
      message: (day, percent, crop) =>
        `${day} बारिश होने की संभावना (${percent}%)${crop ? ` (${crop})` : ""}।`,
      reason: (percent) =>
        `अगले 24–48 घंटों में वर्षा संभावना ${percent}% तक पहुंचती है।`,
      recommendation: (delayNote) =>
        `हो सके तो मौसम-संवेदनशील खेत काम टालें।${delayNote} फैसले से पहले पूर्वानुमान दोबारा देखें।`,
      irrigationDelayNote: " अगली सिंचाई चक्र टालने पर विचार करें।",
    },
    heat: {
      title: "फसल के पानी के तनाव पर नज़र रखें",
      message: (temp, crop) =>
        `${temp}°C तक ऊंचा तापमान दर्ज हुआ${crop ? ` (${crop})` : ""}।`,
      reason: (threshold) =>
        `तापमान कॉन्फ़िगर गर्मी सीमा (${threshold}°C) पर या उससे ऊपर है।`,
      recommendation: (crop) =>
        `सिंचाई से पहले मिट्टी की नमी जांचें${crop ? ` (आपकी ${crop} के लिए)` : ""}। गर्मी से पानी की मांग बढ़ सकती है — तय समय-सारणी पर नहीं, खेत के अवलोकन पर भरोसा करें।`,
    },
    wind: {
      title: "संवेदनशील खेत कार्य टालने पर विचार करें",
      message: (speed) => `${speed} किमी/घंटा तक तेज़ हवा दर्ज हुई।`,
      reason: (threshold) =>
        `हवा कॉन्फ़िगर कार्य सीमा (${threshold} किमी/घंटा) पर या उससे ऊपर है।`,
      recommendation:
        "आज छिड़काव और अन्य हवा-संवेदनशील कार्य कम उपयुक्त हो सकते हैं। पहले स्थल की स्थिति देखें।",
    },
    monitoring: {
      title: "सामान्य निगरानी जारी रखें",
      message: "मौजूदा निर्णय नियमों ने कोई बड़ा मौसम ट्रिगर नहीं पाया।",
      reason: (temp, wind, rain) =>
        `स्थितियां कॉन्फ़िगर सीमाओं के भीतर हैं: ${temp}°C, ${wind} किमी/घंटा हवा, ${rain}% अधिकतम बारिश संभावना।`,
      recommendation: (crop) =>
        `नियमित फसल अवलोकन जारी रखें${crop ? ` (आपकी ${crop} के लिए)` : ""}। बड़ा खेत काम तय करने से पहले मौसम दोबारा देखें।`,
    },
    dayWord: { today: "आज", tomorrow: "कल" },
    conditions: {
      clear: "साफ आसमान",
      mainlyClear: "मुख्यतः साफ",
      partlyCloudy: "आंशिक बादल",
      overcast: "बादल छाए",
      fog: "धुंध",
      drizzle: "बूंदाबांदी",
      freezingDrizzle: "जमने वाली बूंदाबांदी",
      rain: "बारिश",
      freezingRain: "जमने वाली बारिश",
      snow: "बर्फ",
      rainShowers: "बारिश की बौछारें",
      snowShowers: "बर्फ की बौछारें",
      thunderstorm: "आंधी-तूफान",
      thunderstormHail: "ओलों के साथ आंधी-तूफान",
      mixed: "मिश्रित स्थितियां",
    },
  },

  cropLib: {
    basis: {
      seasonMatch: (season, crop) =>
        `${season}, ${crop} के सीज़न प्रोफ़ाइल से मेल खाता है।`,
      seasonMiss: (season, crop) =>
        `${season}, ${crop} के सीज़न प्रोफ़ाइल से बाहर है — स्थानीय जांच ज़रूरी।`,
      soilMatch: (soil, crop) =>
        `${soil} मिट्टी, ${crop} के कॉन्फ़िगर नियम-सेट से मेल खाती है।`,
      soilPartial: (soil, crop) =>
        `${soil} मिट्टी, ${crop} के लिए चल जाएगी (आंशिक मेल)।`,
      soilMiss: (soil, crop) =>
        `${soil} मिट्टी, ${crop} की पसंदीदा मिट्टी सूची में नहीं है।`,
      irrigationMatch: (irrigation, crop, water) =>
        `${irrigation} सिंचाई, ${crop} की ${water} पानी ज़रूरत को पूरा करती है।`,
      irrigationPartial: (irrigation, crop) =>
        `${irrigation} सिंचाई, ${crop} के लिए चल जाएगी (आंशिक मेल)।`,
      irrigationMiss: (irrigation, crop) =>
        `${irrigation} सिंचाई, ${crop} की पसंदीदा सिंचाई सूची में नहीं है।`,
      locationNoted: (location) =>
        `स्थान "${location}" दर्ज — क्षेत्रीय कृषि-विज्ञान मॉडल नहीं है; स्थानीय रूप से जांचें।`,
      locationMissing:
        "स्थान की जानकारी अपर्याप्त — सामान्य डिफ़ॉल्ट लागू।",
      sizeMatch: (size, crop) =>
        `${size} एकड़, ${crop} की कॉन्फ़िगर खेत-आकार श्रेणी में फिट बैठता है।`,
      sizeMiss: (size, crop, min, max) =>
        `${size} एकड़, ${crop} की कॉन्फ़िगर श्रेणी (${min}–${max}) से बाहर है।`,
    },
    missingLocation: "स्थान नहीं दिया गया है।",
    missingFarmSize: "मान्य खेत आकार (> 0 एकड़) नहीं दिया गया है।",
    waterWord: { low: "कम", moderate: "मध्यम", high: "अधिक" },
    suitability: { high: "उच्च", moderate: "मध्यम", exploratory: "प्रायोगिक" },
    checkBeforePlanting:
      "स्थानीय बाज़ार मांग, मौजूदा मौसम, बीज की उपलब्धता और योग्य कृषि विशेषज्ञ की सलाह।",
    cropNames: {
      Wheat: "गेहूं",
      "Chickpea (Chana)": "चना",
      "Mustard (Sarson)": "सरसों",
      "Rice (Paddy)": "धान (चावल)",
      Maize: "मक्का",
      Cotton: "कपास",
      "Green Gram (Moong)": "मूंग",
      "Onion (Rabi)": "प्याज़ (रबी)",
    },
    seasonNames: { kharif: "खरीफ", rabi: "रबी", zaid: "ज़ायद" },
    soilNames: {
      black: "काली",
      alluvial: "जलोढ़",
      loamy: "दोमट",
      sandy: "बलुई",
      clay: "चिकनी",
      red: "लाल",
      laterite: "लैटेराइट",
    },
    irrigationNames: {
      "rain-fed": "बारानी",
      canal: "नहर",
      borewell: "बोरवेल",
      drip: "ड्रिप",
      sprinkler: "स्प्रिंकलर",
    },
  },

  operationsLib: {
    basis: {
      suggestedCombine: (operation) =>
        `सुझाव — इस आकार के खेतों पर कंबाइन हार्वेस्टर, ${operation} के लिए उपयुक्त है।`,
      suggestedMachine: (machine, operation) =>
        `सुझाव — ${machine}, ${operation} के लिए उपयुक्त है।`,
      sizeInRange: (size, min, max) =>
        `उपयुक्तता — आपके ${size} एकड़, ${min}–${max} एकड़ की श्रेणी में फिट हैं।`,
      sizeOutOfRange: (size, min, max) =>
        `उपयुक्तता — खेत आकार आम ${min}–${max} एकड़ श्रेणी से बाहर है।`,
      cropSuggested: (crop) => `आपकी चुनी हुई फसल के लिए सुझाव: ${crop}।`,
    },
    operationNames: {
      "seedbed-preparation": "बीज तैयारी",
      sowing: "बुवाई",
      spraying: "छिड़काव",
      harvesting: "कटाई",
      transport: "परिवहन",
    },
    operationPhrases: {
      "seedbed-preparation": "बीज तैयारी",
      sowing: "बुवाई",
      spraying: "छिड़काव",
      harvesting: "कटाई",
      transport: "परिवहन",
    },
    machineTypes: {
      tractor: "ट्रैक्टर",
      rotavator: "रोटावेटर",
      "seed-drill": "सीड ड्रिल",
      sprayer: "स्प्रेयर",
      "combine-harvester": "कंबाइन हार्वेस्टर",
      trolley: "ट्रॉली",
    },
  },

  plannerLib: {
    caveat:
      "आपके खेत कॉन्टेक्स्ट और कॉन्फ़िगर टेम्पलेट पर आधारित योजना सहायता — काम से पहले स्थानीय स्थितियों से जांचें। वैज्ञानिक भविष्यवाणी नहीं।",
    weatherTaskIrrigation: "सिंचाई समीक्षा",
    weatherTaskFieldwork: "खेत काम के समय की समीक्षा",
    weatherTaskDrainage: "खेत की जल निकासी जांचें",
    healthFollowUpTitle: (condition) => `फॉलो-अप: ${condition}`,
    healthFollowUpDescription: (crop, condition, likelihood) =>
      `${crop} की फसल स्वास्थ्य जांच ने "${condition}" (दृश्य संभावना: ${likelihood}) दिखाया। प्रभावित पौधों की दोबारा जांच करें, ज़रूरत हो तो साफ़ फ़ोटो लें, और इलाज से पहले योग्य कृषि विशेषज्ञ से पुष्टि करें।`,
    operationPrepare: (operation) => `${operation} के लिए तैयारी करें`,
    operationTrack: (operation) => `${operation} अनुरोध पर नज़र रखें`,
    operationAcceptedDescription: (operation) =>
      `${operation} अनुरोध सेवा फ्लो में स्वीकार है। खेत तैयार करें और अंतिम समय-सारणी सीधे प्रदाता से पुष्ट करें।`,
    operationWaitingDescription: (operation) =>
      `${operation} अनुरोध प्रदाता जवाब की प्रतीक्षा में है। उपलब्धता जुड़े सेवा प्रदाताओं पर निर्भर है — अनुपलब्ध होने पर वैकल्पिक मशीन आज़माएं।`,
  },

  privacy: {
    title: "गोपनीयता",
    intro:
      "आपकी खेत जानकारी कैसे संभाली जाती है — सीधी बात। कोई व्यवहार बदले तो यह पेज भी उसके साथ बदलेगा।",
    contactPrefix: "सवाल हों? लिखें ",
    contactSuffix: "। या वापस जाएं ",
    landingLink: "लैंडिंग पेज",
    sections: [
      {
        title: "हम क्या सेव करते हैं",
        body: "आपकी फार्म प्रोफ़ाइल, योजना, समयरेखा और सहायक बातचीत मौजूदा सेशन के लिए आपके ब्राउज़र में रहती है। कोई अकाउंट सिस्टम नहीं और आपकी खेत जानकारी का कोई सर्वर-साइड स्टोरेज नहीं।",
      },
      {
        title: "आपके डिवाइस से क्या जाता है",
        body: "लाइव मौसम के अनुरोध आपके खेत की जगह मौसम सेवा को भेजते हैं। फसल स्वास्थ्य तस्वीरें और सहायक के सवाल विश्लेषण बनाने के लिए AI मॉडल प्रदाता को भेजे जाते हैं। छेड़छाड़-रोधी सत्यापन के लिए लिखे गए फार्म रिकॉर्ड में केवल वही घटना विवरण होते हैं जिन्हें आप रिकॉर्ड करना चुनते हैं।",
      },
      {
        title: "हम कभी क्या नहीं करते",
        body: "कोई विज्ञापन ट्रैकर नहीं, कोई थर्ड-पार्टी एनालिटिक्स नहीं, जानकारी की बिक्री नहीं, कोई बनाया गया डेटा नहीं — हर नतीजा अपना स्रोत दिखाता है।",
      },
      {
        title: "आपका नियंत्रण",
        body: "फार्म प्रोफ़ाइल में Use Sample Farm और Clear Session आपके ब्राउज़र में सेव सब कुछ किसी भी समय रीसेट कर देते हैं।",
      },
    ],
  },

  terms: {
    title: "शर्तें",
    intro: "छोटा संस्करण: मार्गदर्शन इस्तेमाल करें, ज़रूरी चीज़ें जांचें।",
    contactPrefix: "सवाल हों? लिखें ",
    contactSuffix: "। या वापस जाएं ",
    landingLink: "लैंडिंग पेज",
    sections: [
      {
        title: "प्लेटफ़ॉर्म क्या देता है",
        body: "AgriSaarthi 360 एक निर्णय-सहायता उपकरण है। यह आपका खेत कॉन्टेक्स्ट व्यवस्थित करता है, फसल सलाह गणना करता है, फसल तस्वीरें विश्लेषित करता है, और लाइव मौसम को सुझाई गई कार्रवाइयों में बदलता है।",
      },
      {
        title: "यह क्या नहीं है",
        body: "यह योग्य कृषि विशेषज्ञों, स्थानीय नियमों या आपके अपने निर्णय का विकल्प नहीं है। मौसम जानकारी बाहरी सेवाओं पर निर्भर है और गलत हो सकती है। AI विश्लेषण तस्वीरें गलत पढ़ सकता है। इसीलिए हर नतीजा अपना स्रोत दिखाता है।",
      },
      {
        title: "मार्गदर्शन को ज़िम्मेदारी से कैसे इस्तेमाल करें",
        body: "सुझावों को शुरुआती बिंदु मानें। ज़रूरी निर्णय स्थानीय विशेषज्ञता से जांचें और काम से पहले सिंचाई, छिड़काव, कटाजैसे महत्वपूर्ण कार्य अपनी खेत स्थिति से पुष्ट करें।",
      },
      {
        title: "आपका फार्म रिकॉर्ड",
        body: "सत्यापित फार्म रिकॉर्ड उन घटनाओं को दर्शाते हैं जिन्हें आप रिकॉर्ड करना चुनते हैं। उनका छेड़छाड़-रोधी सत्यापन बाद का बदलाव पकड़ने योग्य बनाता है; यह खेत में भौतिक रूप से क्या हुआ, इसकी गवाही नहीं देता।",
      },
    ],
  },
};
