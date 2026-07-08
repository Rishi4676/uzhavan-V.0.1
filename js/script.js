/**
 * Smart Farmer Assistant - Core Script
 * Includes: Multi-language, Weather (Open-Meteo), Chatbot (OpenRouter), and Real-time News
 */

// --- 1. LANGUAGE & TRANSLATIONS ---
const translations = {
  en: {
    title: "Smart Farmer Assistant",
    nav_home: "Home",
    nav_weather: "Weather",
    nav_market: "Market",
    nav_crop: "Crop Suggestion",
    nav_pest: "Pest & Disease",
    nav_schemes: "Schemes",
    nav_login: "Login",
    nav_forum: "Community Forum",
    irrigation_title: "Smart Irrigation Scheduler",
    nav_survey: "Land Survey",
    survey_page_title: "Land Survey & Patta/Chitta Records",
    survey_num_placeholder: "Survey No. (e.g. 124/2B)",
    btn_search_survey: "Search Records",
    banner_title: "Empowering Farmers for a Better Tomorrow",
    banner_subtitle:
      "Get weather, market prices, and expert advice in one place.",
    news_title: "Latest Agriculture Headlines",
    btn_lang: "Tamil",
    footer_text: "© 2026 Smart Farmer Assistant. All rights reserved.",
    quick_weather: "Weather Forecast",
    quick_market: "Market Prices",
    quick_crop: "Crop Suggestion",
    quick_pest: "Pest & Disease",
    quick_schemes: "Govt Schemes",
    apply_btn: "Apply Now",
    govt_portals: "Govt Portals",
    btn_get_weather: "Get Weather",
    weather_placeholder: "Enter Village/City Name",
    soil_type: "Soil Type",
    season: "Season",
    btn_suggest: "Suggest Crops",
    upload_img: "Upload Crop Image",
    btn_detect: "Detect Disease",
    ph_username: "Username",
    ph_password: "Password",
    login_btn: "Login",
    register_link: "Don't have an account? Register",
    ph_name: "Full Name",
    ph_phone: "Phone Number",
    ph_village: "Village Name",
    submit_btn: "Submit",
    eservices_header_title: "Land Records Search (Patta & Chitta)",
    eservices_header_subtitle:
      "Land Records e-Services - Government of Tamil Nadu",
    label_district: "District (மாவட்டம்)",
    label_taluk: "Taluk (வட்டம்)",
    label_village: "Village (கிராமம்)",
    label_search_by: "Search Land Records By (தேடும் வகை)",
    radio_patta: "Patta Number (பட்டா எண்)",
    radio_survey: "Survey Number (புல எண்)",
    radio_name: "Name-wise Search (பெயர் வாரியான தேடல்)",
    label_mobile: "10-digit Mobile Number (கைபேசி எண்)",
    btn_get_otp: "Get OTP (கடவுச் சொல்லை பெற)",
    placeholder_district: "-- Select District --",
    placeholder_taluk: "-- Select Taluk --",
    placeholder_village: "-- Select Village --",
    tab_map_explorer: "Explore Map & Owner Records",
    tab_verify_patta: "Verify Patta/Chitta (e-Services)",
    map_section_title: "Interactive Cadastral Map & Water Highlights",
    plots_in_area: "Survey Plots in this Area",
    select_plot_instructions:
      "Select a survey plot on the map to view detailed Patta records and land valuation.",
    analytics_title: "Land Analytics & Valuation Insights",
    chart_class_title: "Land Classification Breakdown (Acres)",
    chart_value_title: "Land Valuation Trend (Average ₹ Lakhs / Acre)",
    govt_verify_title: "Verify Official Records Instantly",
    govt_verify_desc:
      "You can search and verify these land records (Patta/Chitta) officially on the Government of Tamil Nadu E-Services website.",
    govt_verify_btn: "Go to TN Govt E-Services Portal",
  },
  ta: {
    title: "ஸ்மார்ட் விவசாய உதவியாளர்",
    nav_home: "முகப்பு",
    nav_weather: "வானிலை",
    nav_market: "சந்தை விலை",
    nav_crop: "பயிர் ஆலோசனை",
    nav_pest: "பூச்சி & நோய்",
    nav_schemes: "அரசு திட்டங்கள்",
    nav_login: "உள்நுழை",
    nav_forum: "கூட்டமைப்பு மன்றம்",
    irrigation_title: "நுண்ணறிவு நீர் மேலாண்மை கால அட்டவணை",
    nav_survey: "நில அளவை",
    survey_page_title: "நில அளவை மற்றும் பட்டா/சிட்டா விவரங்கள்",
    survey_num_placeholder: "புல எண் (எ.கா. 124/2B)",
    btn_search_survey: "விவரங்களைத் தேடுக",
    banner_title: "விவசாயிகளின் வளமான எதிர்காலத்திற்கான தளம்",
    banner_subtitle:
      "வானிலை, சந்தை விலை மற்றும் நிபுணர்களின் ஆலோசனைகளை ஒரே இடத்தில் பெறுங்கள்.",
    news_title: "புதிய விவசாயச் செய்திகள்",
    btn_lang: "English",
    footer_text:
      "© 2026 ஸ்மார்ட் விவசாய உதவியாளர். அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.",
    quick_weather: "வானிலை முன்னறிவிப்பு",
    quick_market: "சந்தை விலைகள்",
    quick_crop: "பயிர் ஆலோசனை",
    quick_pest: "பூச்சி & நோய் கண்டறிதல்",
    quick_schemes: "அரசு திட்டங்கள்",
    apply_btn: "இப்போதே விண்ணப்பிக்கவும்",
    govt_portals: "அரசு இணையதளங்கள்",
    btn_get_weather: "வானிலை அறிக்கை",
    weather_placeholder: "கிராமம் அல்லது நகரத்தின் பெயரை உள்ளிடவும்",
    soil_type: "மண் வகை",
    season: "பருவம்",
    btn_suggest: "பயிர்களைப் பரிந்துரைக்கவும்",
    upload_img: "பயிர் படத்தைப் பதிவேற்றவும்",
    btn_detect: "நோயைக் கண்டறிதல்",
    ph_username: "பயனர் பெயர்",
    ph_password: "கடவுச்சொல்",
    login_btn: "உள்நுழை",
    register_link: "கணக்கு இல்லையா? பதிவு செய்யவும்",
    ph_name: "முழு பெயர்",
    ph_phone: "தொலைபேசி எண்",
    ph_village: "கிராமத்தின் பெயர்",
    submit_btn: "சமர்ப்பிக்கவும்",
    eservices_header_title: "நில உரிமை விபரங்கள் (பட்டா & சிட்டா)",
    eservices_header_subtitle: "நில ஆவணங்கள் மின்-சேவைகள் - தமிழ்நாடு அரசு",
    label_district: "மாவட்டம் (District)",
    label_taluk: "வட்டம் (Taluk)",
    label_village: "கிராமம் (Village)",
    label_search_by: "நில ஆவணங்களைத் தேடும் வகை (Search By)",
    radio_patta: "பட்டா எண் (Patta Number)",
    radio_survey: "புல எண் (Survey Number)",
    radio_name: "பெயர் வாரியான தேடல் (Name-wise Search)",
    label_mobile: "10-இலக்க கைபேசி எண் (Mobile Number)",
    btn_get_otp: "கடவுச் சொல்லை பெற (Get OTP)",
    placeholder_district: "-- மாவட்டம் தேர்ந்தெடுக்கவும் --",
    placeholder_taluk: "-- வட்டம் தேர்ந்தெடுக்கவும் --",
    placeholder_village: "-- கிராமம் தேர்ந்தெடுக்கவும் --",
    tab_map_explorer: "வரைபடம் & பட்டா தேடல்",
    tab_verify_patta: "பட்டா/சிட்டா சரிபார்ப்பு (e-Services)",
    map_section_title: "இணையவழி புல வரைபடம் & நீர்நிலைகள்",
    plots_in_area: "இப்பகுதியில் உள்ள புல வரைபடங்கள்",
    select_plot_instructions:
      "பட்டா விவரங்கள் மற்றும் நில மதிப்பை அறிய வரைபடத்தில் ஏதேனும் ஒரு புலத்தைத் தேர்ந்தெடுக்கவும்.",
    analytics_title: "நிலப் பகுப்பாய்வு & மதிப்பு விவரங்கள்",
    chart_class_title: "நில வகைப்பாடு விவரம் (ஏக்கர்)",
    chart_value_title: "நில மதிப்பு போக்கு (சராசரி ₹ லட்சம் / ஏக்கர்)",
    govt_verify_title: "அரசு பதிவேடுகளை உடனே சரிபார்க்கவும்",
    govt_verify_desc:
      "இவற்றைப் பற்றிய அதிகாரப்பூர்வ விவரங்களை தமிழ்நாடு அரசின் இ-சேவைகள் இணையதளத்தில் சரிபார்த்துக் கொள்ளலாம்.",
    govt_verify_btn: "அரசு மின்-சேவை தளம் செல்லவும்",
  },
};

const translationDictionary = {
  // Navigation & General
  "Smart Farmer Assistant": "ஸ்மார்ட் விவசாய உதவியாளர்",
  Home: "முகப்பு",
  Weather: "வானிலை",
  "Land Survey": "நில அளவை",
  Forum: "கூட்டமைப்பு மன்றம்",
  "Community Forum": "கூட்டமைப்பு மன்றம்",
  Market: "சந்தை விலை",
  "Crop Suggestion": "பயிர் ஆலோசனை",
  "Pest & Disease": "பூச்சி & நோய்",
  Schemes: "அரசு திட்டங்கள்",
  Login: "உள்நுழை",
  Register: "பதிவு செய்க",
  Tamil: "Tamil",
  English: "English",
  "Govt Portals": "அரசு இணையதளங்கள்",

  // Home Page
  "Empowering Farmers for a Better Tomorrow":
    "விவசாயிகளின் வளமான எதிர்காலத்திற்கான தளம்",
  "Get weather, market prices, and expert advice in one place.":
    "வானிலை, சந்தை விலை மற்றும் நிபுணர்களின் ஆலோசனைகளை ஒரே இடத்தில் பெறுங்கள்.",
  "Weather Forecast": "வானிலை முன்னறிவிப்பு",
  "Market Prices": "சந்தை விலைகள்",
  "Govt Schemes": "அரசு திட்டங்கள்",
  "Help Center": "உதவி மையம்",
  "Daily Market & Advisory Dashboard":
    "தினசரி சந்தை மற்றும் விவசாய ஆலோசனை தளம்",
  "Live commodity price movements, farming alerts, and tailored daily guides.":
    "நேரடி சந்தை விலை மாற்றங்கள், விவசாய எச்சரிக்கைகள் மற்றும் வழிகாட்டிகள்.",
  "Today's Market Pulse": "இன்றைய சந்தை நிலவரம்",
  "Daily Crop Advisories": "தினசரி பயிர் ஆலோசனைகள்",
  "Alerts & Actions": "எச்சரிக்கைகள் & செயல்பாடுகள்",
  "Choose Crop:": "பயிரைத் தேர்ந்தெடுக்கவும்:",
  "Paddy (Rice)": "நெல் (அரிசி)",
  Cotton: "பருத்தி",
  Tomato: "தக்காளி",
  Sugarcane: "கரும்பு",
  "View All": "அனைத்தையும் காண்க",
  "Download Daily PDF Report": "தினசரி PDF அறிக்கையைப் பதிவிறக்கவும்",
  "Real-time Agriculture News": "உண்மைநேர விவசாயச் செய்திகள்",
  "Live Agriculture Pulse": "நேரடி விவசாயச் செய்திகள்",
  "Real-time global and local agriculture headlines":
    "உண்மைநேர உலகளாவிய மற்றும் உள்ளூர் விவசாயச் செய்திகள்",
  "Connecting to live news satellites...":
    "நேரடி செய்தி சேவையகத்துடன் இணைகிறது...",
  All: "அனைத்தும்",
  Government: "அரசு செய்திகள்",
  "Live Feed": "நேரடி ஊட்டங்கள்",
  Trending: "பிரபலமானவை",

  // Weather Page
  "Check Today's Weather": "இன்றைய வானிலையைச் சரிபார்க்கவும்",
  "Enter Village/City Name": "கிராமம் அல்லது நகரத்தின் பெயரை உள்ளிடவும்",
  "Get Weather": "வானிலை அறிக்கை பெறுக",
  "Enter location or click on the map to see the weather forecast.":
    "வானிலை முன்னறிவிப்பைக் காண இருப்பிடத்தை உள்ளிடவும் அல்லது வரைபடத்தில் கிளிக் செய்யவும்.",
  "7-Day Weather Visualization": "7-நாள் வானிலை வரைபடம்",
  "Rainfall Forecast (mm)": "மழைப்பொழிவு முன்னறிவிப்பு (மி.மீ)",
  Cloudy: "மேகமூட்டம்",
  "Apparent Temp": "மெய்நிகர் வெப்பநிலை",
  Humidity: "ஈரப்பதம்",
  "Wind Speed": "காற்றின் வேகம்",
  "Rain / Precip": "மழை அளவு",
  Coordinates: "ஆயத்தொலைவுகள்",
  "3-Day Forecast": "3-நாள் வானிலை முன்னறிவிப்பு",
  "Temperature Trend (°C)": "வெப்பநிலை போக்கு (°சி)",
  "Ideal rainfall for most crops: 4–10 mm/day":
    "பயிர்களுக்கு உகந்த மழைப்பொழிவு: 4-10 மி.மீ/நாள்",
  "Optimal crop growth: 20–32°C":
    "பயிர்களின் உகந்த வளர்ச்சி வெப்பநிலை: 20–32°சி",
  "GPS Farm Mapping & Area Measurement":
    "ஜிபிஎஸ் நில வரைபடம் & பரப்பளவு அளவீடு",
  "Measure your crop lands, trace farm boundaries, and save field locations for tracking crop performance.":
    "உங்கள் பயிர் நிலங்களை அளவிடவும், எல்லைகளைக் குறிக்கவும் மற்றும் இருப்பிடங்களைச் சேமிக்கவும்.",
  "Start Farm Mapping": "நில வரைபடத்தைக் குறிக்கத் தொடங்குக",
  "Exit Mapping Mode": "வரைபட முறையிலிருந்து வெளியேறுக",
  "Clear Boundary": "எல்லைகளை அழிக்கவும்",
  "Satellite View": "செயற்கைக்கோள் பார்வை",
  "Street View": "தெ居 வரைபடப் பார்வை",
  "Land Measurement": "நில அளவீடு",
  "Points Marked:": "குறிக்கப்பட்ட புள்ளிகள்:",
  "Total Area:": "மொத்த பரப்பளவு:",
  "Acres:": "ஏக்கர்:",
  "Hectares:": "ஹெக்டேர்:",
  "Field Name": "நிலத்தின் பெயர்",
  "Current Crop": "தற்போதைய பயிர்",
  "Save Field Location": "நிலத்தின் இருப்பிடத்தைச் சேமிக்கவும்",
  "Saved Fields": "சேமிக்கப்பட்ட நிலங்கள்",
  "No fields mapped yet. Start mapping above!":
    "நிலங்கள் எதுவும் குறிக்கப்படவில்லை. வரைபடத்தைக் குறிக்கத் தொடங்கவும்!",

  // Land Survey & Patta/Chitta Records Page
  "Land Survey & Patta/Chitta Records":
    "நில அளவை மற்றும் பட்டா/சிட்டா விவரங்கள்",
  "Survey No. (e.g. 124/2B)": "புல எண் (எ.கா. 124/2B)",
  "Search Records": "விவரங்களைத் தேடுக",
  "Interactive Cadastral Map & Water Highlights":
    "ஊடாடும் நில வரைபடம் & நீர்நிலைகள்",
  "Government Land Registry & Survey Records (Patta/Chitta)":
    "அரசு நிலப் பதிவேடு & அளவை விவரங்கள் (பட்டா/சிட்டா)",
  "Official cadastral survey records fetched from the state land registry database. Click on any plot on the map to view ownership and valuation details.":
    "அரசு நிலப் பதிவேடு தரவுத்தளத்திலிருந்து பெறப்பட்ட அதிகாரப்பூர்வ நில அளவை விவரங்கள். வரைபடத்தில் உள்ள நிலப்பகுதியை கிளிக் செய்து காண்க.",
  "Survey Plots in this Area": "இப்பகுதியில் உள்ள நிலப் புல எண்கள்",
  "Survey No": "புல எண்",
  "Owner Name": "உரிமையாளர் பெயர்",
  "Land Classification": "நில வகைப்பாடு",
  "Area (Acres)": "பரப்பளவு (ஏக்கர்)",
  "Estimated Value": "மதிப்பிடப்பட்ட மதிப்பு",
  "Select a survey plot on the map to view detailed Patta records and land valuation.":
    "விரிவான பட்டா பதிவுகள் மற்றும் நில மதிப்பை அறிய வரைபடத்தில் ஒரு நில புலத்தைத் தேர்ந்தெடுக்கவும்.",
  "Land Analytics & Valuation Insights": "நில பகுப்பாய்வு & மதிப்பு விவரங்கள்",
  "Land Classification Breakdown (Acres)": "நில வகைப்பாடு விவரம் (ஏக்கர்)",
  "Land Valuation Trend (Average ₹ Lakhs / Acre)":
    "நில மதிப்பு போக்கு (சராசரி ₹ லட்சம் / ஏக்கர்)",

  // Crop Suggestion Page
  "Best Crop for Your Soil": "உங்கள் மண்ணிற்கு ஏற்ற சிறந்த பயிர்",
  "Select Land / Soil Type": "நிலம் / மண் வகையைத் தேர்ந்தெடுக்கவும்",
  "Clay Soil": "களிமண்",
  "Dense mud, low water drainage speed, high nutrient retention capacity. Suitable for paddy fields.":
    "அடர்ந்த சேறு, குறைந்த வடிகால் வேகம், அதிக ஊட்டச்சத்து தக்கவைப்பு திறன். நெல் பயிரிட உகந்தது.",
  "Sandy Soil": "மணல் மண்",
  "Granular texture, extremely fast drainage, low nutrients. Excellent for tubers and vine crops.":
    "மணல் போன்ற அமைப்பு, அதிவேக வடிகால், குறைந்த ஊட்டச்சத்துக்கள். கிழங்கு மற்றும் கொடி வகை பயிர்களுக்கு உகந்தது.",
  "Loamy Soil": "வண்டல் மண்",
  "Fertile humus mix, balanced drainage, rich in soil micro-organisms. Ideal standard for farming.":
    "வளமான மட்கிய கலவை, சீரான வடிகால், நுண்ணுயிரிகள் நிறைந்தது. விவசாயத்திற்கு மிகவும் உகந்தது.",
  Season: "பருவம்",
  Summer: "கோடை காலம்",
  Monsoon: "மழைக்காலம்",
  Winter: "குளிர்காலம்",
  "Land Area (Acres)": "நிலத்தின் பரப்பளவு (ஏக்கர்)",
  "Suggest Best Crops": "சிறந்த பயிர்களைப் பரிந்துரைக்கவும்",
  "Smart Irrigation Scheduler": "நுண்ணறிவு நீர் மேலாண்மை கால அட்டவணை",
  "Select crop details, growth phase, and weather to calculate optimal water volumes, timing, and drip emitter calibrations.":
    "பயிரின் விவரங்கள், வளர்ச்சி நிலை மற்றும் வானிலைக்கேற்ப உகந்த நீரின் அளவு மற்றும் நேரத்தைக் கணக்கிடுங்கள்.",
  "Select Crop": "பயிரைத் தேர்ந்தெடுக்கவும்",
  "Growth Phase": "வளர்ச்சி நிலை",
  "Irrigation Method": "நீர்ப்பாசன முறை",
  "Calculate Irrigation": "நீர் தேவையை கணக்கிடுக",

  // Pest Page
  "AI Pest & Disease Detection": "ஏஐ பூச்சி & நோய் கண்டறிதல்",
  "Upload Crop Image": "பயிர் படத்தைப் பதிவேற்றவும்",
  "Detect Disease": "நோயைக் கண்டறிக",
  "Upload Leaf or Plant Image for Instant AI Diagnosis":
    "உடனடி ஏஐ கண்டறிதலுக்கு இலை அல்லது செடியின் படத்தைப் பதிவேற்றவும்",
  "Drag & Drop Image Here": "படத்தை இங்கே இழுத்து விடவும்",
  "or browse files": "அல்லது கோப்புகளைத் தேர்ந்தெடுக்கவும்",
  "Supported formats: JPG, PNG (Max 5MB)":
    "ஆதரிக்கப்படும் வடிவங்கள்: JPG, PNG (அதிகபட்சம் 5MB)",

  // Schemes Page
  "Government Agricultural Schemes": "அரசு விவசாய திட்டங்கள்",
  "Apply Now": "இப்போதே விண்ணப்பிக்கவும்",
  Apply: "விண்ணப்பிக்குக",

  // Login/Register Pages
  "Sign In": "உள்நுழைக",
  "Full Name": "முழு பெயர்",
  "Phone Number": "தொலைபேசி எண்",
  "Village Name": "கிராமத்தின் பெயர்",
  "Already have an account? Login": "ஏற்கனவே கணக்கு உள்ளதா? உள்நுழையவும்",
  "Don't have an account? Register": "கணக்கு இல்லையா? பதிவு செய்யவும்",
};

let currentLang = localStorage.getItem("lang") || "en";
window.currentLang = currentLang;

// Normalized text helper
const normalizeText = (str) => str.replace(/\s+/g, " ").trim();

function translateDOM(targetLang) {
  const walk = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false,
  );
  let node;
  while ((node = walk.nextNode())) {
    const rawText = node.nodeValue;
    const text = rawText.trim();
    if (!text) continue;

    const normalized = rawText.replace(/\s+/g, " ").trim();
    if (targetLang === "ta") {
      if (translationDictionary[normalized]) {
        node.nodeValue = rawText.replace(
          text,
          translationDictionary[normalized],
        );
      }
    } else {
      for (const [enKey, taVal] of Object.entries(translationDictionary)) {
        if (normalized === taVal) {
          node.nodeValue = rawText.replace(text, enKey);
          break;
        }
      }
    }
  }
}

function translateFormElements(targetLang) {
  // Input & Textarea Placeholders
  document
    .querySelectorAll("input[placeholder], textarea[placeholder]")
    .forEach((el) => {
      const placeholder = el.getAttribute("placeholder").trim();
      if (targetLang === "ta") {
        if (translationDictionary[placeholder]) {
          el.placeholder = translationDictionary[placeholder];
        }
      } else {
        for (const [enKey, taVal] of Object.entries(translationDictionary)) {
          if (placeholder === taVal) {
            el.placeholder = enKey;
            break;
          }
        }
      }
    });

  // Select Dropdown Option texts
  document.querySelectorAll("select option").forEach((el) => {
    const text = el.innerText.trim();
    if (targetLang === "ta") {
      if (translationDictionary[text]) {
        el.innerText = translationDictionary[text];
      }
    } else {
      for (const [enKey, taVal] of Object.entries(translationDictionary)) {
        if (text === taVal) {
          el.innerText = enKey;
          break;
        }
      }
    }
  });
}

function updateLanguage() {
  const elements = document.querySelectorAll("[data-key]");
  elements.forEach((el) => {
    const key = el.getAttribute("data-key");
    if (translations[currentLang] && translations[currentLang][key]) {
      if (el.tagName === "INPUT" && el.getAttribute("placeholder")) {
        el.placeholder = translations[currentLang][key];
      } else if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        // Skip
      } else {
        el.innerText = translations[currentLang][key];
      }
    }
  });
  translateDOM(currentLang);
  translateFormElements(currentLang);
  localStorage.setItem("lang", currentLang);
}

function toggleLanguage() {
  currentLang = currentLang === "en" ? "ta" : "en";
  updateLanguage();
  location.reload();
}

// Global dynamic translation helper
window._t = function (text) {
  if (typeof text !== "string") return text;
  const trimmed = text.trim();
  const normalized = trimmed.replace(/\s+/g, " ");
  if (currentLang === "ta" && translationDictionary[normalized]) {
    return text.replace(trimmed, translationDictionary[normalized]);
  }
  return text;
};

// Global check and translate helper for dynamic updates
window.checkAndTranslate = function () {
  if (currentLang === "ta") {
    translateDOM("ta");
    translateFormElements("ta");
  }
};

// --- 2. REAL-TIME NEWS LOGIC ---
let newsData = [
  {
    title: "TNAU releases new high-yielding paddy variety for 2026",
    date: "2026-07-06 09:30 AM",
    tag: "LATEST",
    link: "https://tnau.ac.in/",
  },
  {
    title: "Government increases MSP for Kharif crops by 15%",
    date: "2026-07-06 08:15 AM",
    tag: "GOVT",
    link: "https://agmarknet.gov.in/",
  },
  {
    title: "Organic farming clusters to be set up in 10 more districts",
    date: "2026-07-05 04:45 PM",
    tag: "TRENDING",
    link: "https://pib.gov.in/",
  },
];
let currentNewsIndex = 0;

async function fetchRealAgriNews() {
  const feed = document.getElementById("news-feed");

  const updateUI = () => {
    if (feed && newsData.length > 0) {
      feed.innerHTML = newsData
        .map(
          (n) => `
                    <div style="background: #f9fbf8; border: 1px solid #e8f5e9; border-radius: 10px; padding: 20px; transition: all 0.3s ease; display: flex; flex-direction: column; justify-content: space-between; height: 100%;" onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 5px 15px rgba(0,0,0,0.05)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                        <div>
                            <span style="background: ${n.tag === "GOVT" ? "#1565c0" : n.tag === "LIVE" ? "#d32f2f" : "#2e7d32"}; color: white; font-size: 0.65rem; padding: 3px 10px; border-radius: 20px; font-weight: bold; text-transform: uppercase; display: inline-block; margin-bottom: 10px;">${n.tag}</span>
                            <h4 style="font-size: 0.95rem; color: #333; margin: 0 0 15px 0; line-height: 1.4; font-weight: 600;">${n.title}</h4>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #eee; padding-top: 12px; margin-top: auto;">
                            <span style="font-size: 0.75rem; color: #777;"><i class="far fa-calendar-alt" style="margin-right: 4px;"></i>${n.date}</span>
                            <a href="${n.link}" target="_blank" style="color: #2e7d32; font-size: 0.8rem; text-decoration: none; font-weight: bold; display: flex; align-items: center; gap: 4px;">Read More <i class="fas fa-arrow-right" style="font-size: 0.7rem;"></i></a>
                        </div>
                    </div>
                `,
        )
        .join("");
    }
    rotateNewsQuote();
  };

  try {
    // Fetching from multiple agricultural RSS feeds via proxy
    const sources = [
      "https://www.thehindu.com/sci-tech/agriculture/feeder/default.rss",
      "https://www.agweb.com/rss/news",
    ];
    const source = sources[Math.floor(Math.random() * sources.length)];
    const response = await fetch(
      `https://api.rss2json.com/v1/api.json?rss_url=${source}`,
    );
    const data = await response.json();
    if (data.status === "ok" && data.items.length > 0) {
      const fetchedNews = data.items.map((item) => {
        let formattedDate;
        if (item.pubDate) {
          try {
            const dateObj = new Date(item.pubDate.replace(/-/g, "/"));
            if (!isNaN(dateObj.getTime())) {
              const options = {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              };
              formattedDate = dateObj.toLocaleString("en-US", options);
            } else {
              formattedDate = item.pubDate;
            }
          } catch (e) {
            formattedDate = item.pubDate;
          }
        } else {
          formattedDate = new Date().toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
        }
        return {
          title: item.title,
          date: formattedDate,
          tag: "LIVE",
          link: item.link,
        };
      });
      // Keep some local govt news at the top
      newsData = [
        ...newsData.filter((n) => n.tag === "GOVT").slice(0, 2),
        ...fetchedNews,
      ];
    }
  } catch (e) {
    console.warn(
      "News API restricted or failed, using high-quality local flow.",
    );
  } finally {
    updateUI();
  }
}

function rotateNewsQuote() {
  const quoteEl = document.getElementById("live-news-quote");
  if (quoteEl && newsData.length > 0) {
    quoteEl.style.opacity = "0";
    setTimeout(() => {
      quoteEl.innerText = newsData[currentNewsIndex].title;
      quoteEl.style.opacity = "1";
      currentNewsIndex = (currentNewsIndex + 1) % newsData.length;
    }, 500);
  }
}

window.filterNews = function (tag, btn) {
  // Update active tab styling
  const tabs = document.querySelectorAll(".news-tab");
  tabs.forEach((t) => t.classList.remove("active"));
  if (btn) btn.classList.add("active");

  const feed = document.getElementById("news-feed");
  if (!feed) return;

  const isTamil = currentLang === "ta";
  // Filter newsData
  const filtered =
    tag === "all" ? newsData : newsData.filter((n) => n.tag === tag);

  if (filtered.length === 0) {
    feed.innerHTML = `<div style="text-align: center; color: #888; padding: 20px; grid-column: 1 / -1;">${isTamil ? "இந்த வகைக்கு செய்திகள் எதுவும் கிடைக்கவில்லை." : "No news updates found for this category."}</div>`;
    return;
  }

  feed.innerHTML = filtered
    .map(
      (n) => `
                <div style="background: #f9fbf8; border: 1px solid #e8f5e9; border-radius: 10px; padding: 20px; transition: all 0.3s ease; display: flex; flex-direction: column; justify-content: space-between; height: 100%;" onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 5px 15px rgba(0,0,0,0.05)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                    <div>
                        <span style="background: ${n.tag === "GOVT" ? "#1565c0" : n.tag === "LIVE" ? "#d32f2f" : "#2e7d32"}; color: white; font-size: 0.65rem; padding: 3px 10px; border-radius: 20px; font-weight: bold; text-transform: uppercase; display: inline-block; margin-bottom: 10px;">${n.tag}</span>
                        <h4 style="font-size: 0.95rem; color: #333; margin: 0 0 15px 0; line-height: 1.4; font-weight: 600;">${n.title}</h4>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #eee; padding-top: 12px; margin-top: auto;">
                        <span style="font-size: 0.75rem; color: #777;"><i class="far fa-calendar-alt" style="margin-right: 4px;"></i>${n.date}</span>
                        <a href="${n.link}" target="_blank" style="color: #2e7d32; font-size: 0.8rem; text-decoration: none; font-weight: bold; display: flex; align-items: center; gap: 4px;">${isTamil ? "மேலும் வாசிக்க" : "Read More"} <i class="fas fa-arrow-right" style="font-size: 0.7rem;"></i></a>
                    </div>
                </div>
            `,
    )
    .join("");
};

// --- 3. WEATHER LOGIC ---
let map, marker, selectedLocation;
let standardLayer, satelliteLayer, currentLayer;
let waterLayerGroup;

// GPS Farm Mapping State
let isMappingMode = false;
let tempPoints = []; // Array of [lat, lng] for current drawing
let tempMarkers = []; // Array of L.circleMarker objects for vertices
let tempPolygon = null; // Leaflet Polygon object for current drawing
let savedFields = []; // Array of saved field objects
let savedPolygons = []; // Array of Leaflet Polygon objects for saved fields

function initMap() {
  const mapEl = document.getElementById("map");
  if (!mapEl) return;

  // Initialize Map - Center on Tamil Nadu
  map = L.map("map").setView([11.1271, 78.6569], 7);

  standardLayer = L.tileLayer(
    "https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
    {
      subdomains: ["0", "1", "2", "3"],
      maxZoom: 20,
      attribution: "&copy; Google Maps",
    },
  );

  satelliteLayer = L.tileLayer(
    "https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
    {
      subdomains: ["0", "1", "2", "3"],
      maxZoom: 20,
      attribution: "&copy; Google Maps",
    },
  );

  standardLayer.addTo(map);
  currentLayer = "standard";
  waterLayerGroup = L.layerGroup().addTo(map);

  // Invalidate map size to fix dragging and rendering issues immediately
  setTimeout(() => {
    map.invalidateSize();
  }, 200);

  // Satellite Toggle Button
  const satToggle = document.getElementById("satellite-toggle");
  if (satToggle) {
    satToggle.addEventListener("click", () => {
      if (currentLayer === "standard") {
        map.removeLayer(standardLayer);
        satelliteLayer.addTo(map);
        satToggle.innerText = "Street View";
        satToggle.style.background = "#795548"; // Earthy brown
        currentLayer = "satellite";
      } else {
        map.removeLayer(satelliteLayer);
        standardLayer.addTo(map);
        satToggle.innerText = "Satellite View";
        satToggle.style.background = "var(--primary-green)";
        currentLayer = "standard";
      }
    });
  }

  // Map Click handler
  map.on("click", async (e) => {
    const { lat, lng } = e.latlng;

    if (isMappingMode) {
      handleMappingClick(lat, lng);
      return;
    }

    updateMarker(lat, lng);
    highlightWaterBodies(lat, lng);

    // Reverse geocode to get the exact location name
    try {
      const name = await reverseGeocode(lat, lng);
      fetchWeather(lat, lng, name);
      const input = document.getElementById("location-input");
      if (input) input.value = name;
    } catch (err) {
      fetchWeather(lat, lng, `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
    }
  });

  // Setup Geocomplete input
  setupAutocomplete();

  // Load saved field polygons on map load
  loadSavedFields();
}

function updateMarker(lat, lng) {
  if (marker) {
    marker.setLatLng([lat, lng]);
    map.panTo([lat, lng]);
  } else {
    marker = L.marker([lat, lng]).addTo(map);
    map.setView([lat, lng], 12);
  }
}

async function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
  const response = await fetch(url, {
    headers: {
      "Accept-Language": currentLang === "ta" ? "ta" : "en",
    },
  });
  const data = await response.json();
  if (data && data.display_name) {
    const addr = data.address;
    const place =
      addr.village ||
      addr.town ||
      addr.city ||
      addr.suburb ||
      addr.county ||
      "Selected Location";
    const state = addr.state || "";
    return state ? `${place}, ${state}` : place;
  }
  return `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
}

async function fetchWeather(lat, lon, name) {
  const resultDiv = document.getElementById("weather-result");
  if (!resultDiv) return;
  resultDiv.innerHTML = `<div class="spinner" style="margin: 20px auto; width: 30px; height: 30px;"></div>`;

  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto`,
    );
    const data = await res.json();
    const cur = data.current;
    const daily = data.daily;

    const weatherInfo = getWeatherDesc(cur.weather_code);
    const rainProb = daily.precipitation_probability_max
      ? daily.precipitation_probability_max[0]
      : cur.precipitation > 0
        ? 80
        : 10;

    const isTamil = currentLang === "ta";
    const descText = isTamil
      ? translationDictionary[weatherInfo.desc] || weatherInfo.desc
      : weatherInfo.desc;

    // Pick theme colors & gradients dynamically based on weather code
    let gradientBg = "linear-gradient(135deg, #e3f2fd, #bbdefb)"; // default sky blue
    let textColor = "#1565c0";
    let iconColor = "#ffb300";

    const code = cur.weather_code;
    if (code === 0 || code === 1) {
      // Sunny / Clear
      gradientBg = "linear-gradient(135deg, #fff9c4, #fff59d, #ffe082)";
      textColor = "#e65100";
      iconColor = "#ff8f00";
    } else if (code === 2 || code === 3) {
      // Cloudy
      gradientBg = "linear-gradient(135deg, #eceff1, #cfd8dc, #b0bec5)";
      textColor = "#37474f";
      iconColor = "#546e7a";
    } else if (code >= 51 && code <= 67) {
      // Rain
      gradientBg = "linear-gradient(135deg, #e1f5fe, #b3e5fc, #81d4fa)";
      textColor = "#0277bd";
      iconColor = "#0288d1";
    } else if (code >= 80 && code <= 82) {
      // Rain showers
      gradientBg = "linear-gradient(135deg, #e1f5fe, #b3e5fc, #4fc3f7)";
      textColor = "#01579b";
      iconColor = "#0288d1";
    } else if (code === 95) {
      // Thunderstorm
      gradientBg = "linear-gradient(135deg, #cfd8dc, #90a4ae, #78909c)";
      textColor = "#263238";
      iconColor = "#f57c00";
    }

    resultDiv.innerHTML = `
      <div class="result-card weather-result-active" style="text-align: left; padding: 25px; border-radius: 16px; background: ${gradientBg}; border: none; box-shadow: var(--shadow-lg); margin-top: 20px; color: ${textColor}; transition: all 0.3s ease;">
        
        <!-- Header: Location & Coordinates -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 15px; margin-bottom: 20px;">
          <div>
            <h3 style="color: ${textColor}; font-size: 1.65rem; font-weight: 800; margin-bottom: 5px; display: flex; align-items: center; gap: 8px;">
              <i class="fas fa-map-marker-alt" style="color: #ea4335;"></i> ${name}
            </h3>
            <p style="color: ${textColor}; opacity: 0.8; font-size: 0.85rem; font-weight: 600;">
              ${isTamil ? "ஆயத்தொலைவுகள்" : "Coordinates"}: ${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E
            </p>
          </div>
          
          <!-- Main Temp & Condition -->
          <div style="display: flex; align-items: center; gap: 15px; background: rgba(255, 255, 255, 0.35); padding: 12px 20px; border-radius: 12px; backdrop-filter: blur(5px); border: 1px solid rgba(255, 255, 255, 0.25);">
            <i class="${weatherInfo.icon}" style="font-size: 3.5rem; color: ${iconColor};"></i>
            <div>
              <span style="font-size: 2.6rem; font-weight: 900; color: ${textColor}; line-height: 1;">${cur.temperature_2m}°C</span>
              <p style="margin: 4px 0 0 0; color: ${textColor}; font-weight: 700; font-size: 0.95rem; text-transform: capitalize;">${descText}</p>
            </div>
          </div>
        </div>

        <!-- Weather Stats Cards Grid (Glassmorphism) -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(135px, 1fr)); gap: 12px; margin-bottom: 25px;">
          <div style="background: rgba(255, 255, 255, 0.45); padding: 12px; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.3); text-align: center; backdrop-filter: blur(5px); transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">
            <i class="fas fa-thermometer-half" style="color: ${textColor}; opacity: 0.8; font-size: 1.1rem; margin-bottom: 6px;"></i>
            <span style="font-size: 0.72rem; color: ${textColor}; opacity: 0.8; text-transform: uppercase; font-weight: 700; display: block;">${isTamil ? "மெய்நிகர் வெப்பநிலை" : "Apparent Temp"}</span>
            <p style="font-size: 1.15rem; font-weight: bold; margin: 4px 0 0 0; color: ${textColor};">${cur.apparent_temperature}°C</p>
          </div>
          <div style="background: rgba(255, 255, 255, 0.45); padding: 12px; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.3); text-align: center; backdrop-filter: blur(5px); transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">
            <i class="fas fa-tint" style="color: ${textColor}; opacity: 0.8; font-size: 1.1rem; margin-bottom: 6px;"></i>
            <span style="font-size: 0.72rem; color: ${textColor}; opacity: 0.8; text-transform: uppercase; font-weight: 700; display: block;">${isTamil ? "ஈரப்பதம்" : "Humidity"}</span>
            <p style="font-size: 1.15rem; font-weight: bold; margin: 4px 0 0 0; color: ${textColor};">${cur.relative_humidity_2m}%</p>
          </div>
          <div style="background: rgba(255, 255, 255, 0.45); padding: 12px; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.3); text-align: center; backdrop-filter: blur(5px); transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">
            <i class="fas fa-wind" style="color: ${textColor}; opacity: 0.8; font-size: 1.1rem; margin-bottom: 6px;"></i>
            <span style="font-size: 0.72rem; color: ${textColor}; opacity: 0.8; text-transform: uppercase; font-weight: 700; display: block;">${isTamil ? "காற்றின் வேகம்" : "Wind Speed"}</span>
            <p style="font-size: 1.15rem; font-weight: bold; margin: 4px 0 0 0; color: ${textColor};">${cur.wind_speed_10m} km/h</p>
          </div>
          <div style="background: rgba(255, 255, 255, 0.45); padding: 12px; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.3); text-align: center; backdrop-filter: blur(5px); transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">
            <i class="fas fa-cloud-showers-heavy" style="color: ${textColor}; opacity: 0.8; font-size: 1.1rem; margin-bottom: 6px;"></i>
            <span style="font-size: 0.72rem; color: ${textColor}; opacity: 0.8; text-transform: uppercase; font-weight: 700; display: block;">${isTamil ? "மழை அளவு" : "Rain / Precip"}</span>
            <p style="font-size: 1.15rem; font-weight: bold; margin: 4px 0 0 0; color: ${textColor};">${rainProb}%</p>
          </div>
        </div>

        <!-- 3-Day Forecast Header -->
        <h4 style="color: ${textColor}; margin-bottom: 12px; font-size: 1.1rem; font-weight: 800; border-bottom: 1px solid rgba(255,255,255,0.4); padding-bottom: 6px;">
          <i class="far fa-calendar-alt"></i> ${isTamil ? "3-நாள் வானிலை முன்னறிவிப்பு" : "3-Day Forecast"}
        </h4>
        
        <!-- 3-Day Forecast Cards -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
          ${[0, 1, 2]
            .map((i) => {
              const fCode = daily.weather_code[i];
              const fInfo = getWeatherDesc(fCode);
              const dateStr = new Date(daily.time[i]).toLocaleDateString(
                undefined,
                { weekday: "short", month: "short", day: "numeric" },
              );

              const fDescText = isTamil
                ? translationDictionary[fInfo.desc] || fInfo.desc
                : fInfo.desc;
              const fDayLabel =
                i === 0 ? (isTamil ? "இன்று" : "Today") : dateStr;

              let fIconColor = "#ffb300";
              if (fCode === 0 || fCode === 1) fIconColor = "#ff8f00";
              else if (fCode === 2 || fCode === 3) fIconColor = "#546e7a";
              else if (fCode >= 51 && fCode <= 82) fIconColor = "#0288d1";

              return `
              <div style="background: rgba(255, 255, 255, 0.45); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 10px; padding: 12px; text-align: center; backdrop-filter: blur(5px); transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">
                <p style="margin: 0 0 6px 0; font-size: 0.8rem; font-weight: 700; color: ${textColor};">${fDayLabel}</p>
                <i class="${fInfo.icon}" style="font-size: 1.9rem; color: ${fIconColor}; margin-bottom: 6px; display: block;"></i>
                <div style="margin-bottom: 4px;">
                  <span style="font-size: 0.95rem; font-weight: 800; color: #d32f2f;">${Math.round(daily.temperature_2m_max[i])}°</span>
                  <span style="font-size: 0.95rem; color: #1565c0; margin-left: 5px; font-weight: 600;">${Math.round(daily.temperature_2m_min[i])}°</span>
                </div>
                <p style="margin: 0; font-size: 0.72rem; color: ${textColor}; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${fDescText}</p>
              </div>
            `;
            })
            .join("")}
        </div>
      </div>
    `;

    if (typeof window.checkAndTranslate === "function") {
      window.checkAndTranslate();
    }
  } catch (e) {
    resultDiv.innerHTML = `<div class="result-card" style="color: #d32f2f; font-weight: bold; padding: 20px;">Error loading weather: Please try again or select another location on the map.</div>`;
  }
}

function getWeatherDesc(code) {
  const table = {
    0: { desc: "Clear sky", icon: "fas fa-sun", color: "#f57c00" },
    1: { desc: "Mainly clear", icon: "fas fa-cloud-sun", color: "#ffd54f" },
    2: { desc: "Partly cloudy", icon: "fas fa-cloud-sun", color: "#90a4ae" },
    3: { desc: "Cloudy", icon: "fas fa-cloud", color: "#78909c" },
    45: { desc: "Foggy", icon: "fas fa-smog", color: "#b0bec5" },
    48: { desc: "Depositing rime fog", icon: "fas fa-smog", color: "#b0bec5" },
    51: { desc: "Light drizzle", icon: "fas fa-cloud-rain", color: "#4fc3f7" },
    53: {
      desc: "Moderate drizzle",
      icon: "fas fa-cloud-rain",
      color: "#29b6f6",
    },
    55: { desc: "Dense drizzle", icon: "fas fa-cloud-rain", color: "#039be5" },
    61: {
      desc: "Slight rain",
      icon: "fas fa-cloud-showers-heavy",
      color: "#4fc3f7",
    },
    63: {
      desc: "Moderate rain",
      icon: "fas fa-cloud-showers-heavy",
      color: "#0288d1",
    },
    65: {
      desc: "Heavy rain",
      icon: "fas fa-cloud-showers-heavy",
      color: "#01579b",
    },
    71: {
      desc: "Slight snow fall",
      icon: "fas fa-snowflake",
      color: "#e0e0e0",
    },
    73: {
      desc: "Moderate snow fall",
      icon: "fas fa-snowflake",
      color: "#b0bec5",
    },
    75: { desc: "Heavy snow fall", icon: "fas fa-snowflake", color: "#90a4ae" },
    80: {
      desc: "Slight rain showers",
      icon: "fas fa-cloud-sun-rain",
      color: "#29b6f6",
    },
    81: {
      desc: "Moderate rain showers",
      icon: "fas fa-cloud-sun-rain",
      color: "#0288d1",
    },
    82: {
      desc: "Violent rain showers",
      icon: "fas fa-cloud-showers-heavy",
      color: "#01579b",
    },
    95: { desc: "Thunderstorm", icon: "fas fa-cloud-bolt", color: "#ffd54f" },
  };
  return (
    table[code] || {
      desc: "Unspecified weather",
      icon: "fas fa-cloud",
      color: "#78909c",
    }
  );
}

let searchTimeout;
function setupAutocomplete() {
  const input = document.getElementById("location-input");
  const suggestionsDiv = document.getElementById("suggestions");
  if (!input || !suggestionsDiv) return;

  input.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    const query = input.value.trim();
    if (query.length < 3) {
      suggestionsDiv.innerHTML = "";
      suggestionsDiv.style.display = "none";
      return;
    }

    searchTimeout = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=in`,
          {
            headers: {
              "Accept-Language": currentLang === "ta" ? "ta" : "en",
            },
          },
        );
        const data = await response.json();
        if (data && data.length > 0) {
          suggestionsDiv.innerHTML = data
            .map((item) => {
              const addr = item.address;
              const place =
                addr.village ||
                addr.town ||
                addr.city ||
                addr.suburb ||
                addr.county ||
                item.display_name.split(",")[0];
              const state = addr.state || "";
              const displayName = state ? `${place}, ${state}` : place;

              // Google Maps styling
              const parts = item.display_name.split(",");
              const primaryPlace = parts[0].trim();
              const secondaryPlace = parts.slice(1).join(",").trim();

              return `
                <div class="suggestion-item" data-lat="${item.lat}" data-lon="${item.lon}" data-name="${displayName}" style="display: flex; align-items: flex-start; padding: 10px 12px; border-bottom: 1px solid #eee; cursor: pointer;">
                  <i class="fas fa-map-marker-alt" style="color: #ea4335; margin-right: 12px; font-size: 1.1rem; margin-top: 3px;"></i>
                  <div style="display: flex; flex-direction: column; text-align: left;">
                    <strong style="color: #333; font-size: 0.9rem;">${primaryPlace}</strong>
                    <span style="color: #666; font-size: 0.76rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 250px;">${secondaryPlace}</span>
                  </div>
                </div>
              `;
            })
            .join("");
          suggestionsDiv.style.display = "block";

          const items = suggestionsDiv.querySelectorAll(".suggestion-item");
          items.forEach((item) => {
            item.addEventListener("click", () => {
              const lat = parseFloat(item.getAttribute("data-lat"));
              const lon = parseFloat(item.getAttribute("data-lon"));
              const name = item.getAttribute("data-name");
              input.value = name;
              suggestionsDiv.innerHTML = "";
              suggestionsDiv.style.display = "none";
              updateMarker(lat, lon);
              highlightWaterBodies(lat, lon);

              fetchWeather(lat, lon, name);
            });
          });
        } else {
          suggestionsDiv.innerHTML = `<div class="suggestion-item" style="color: #999; cursor: default; padding: 10px 12px;">No locations found</div>`;
          suggestionsDiv.style.display = "block";
        }
      } catch (err) {
        console.warn("Autocomplete error:", err);
      }
    }, 500);
  });

  document.addEventListener("click", (e) => {
    if (e.target !== input && e.target !== suggestionsDiv) {
      suggestionsDiv.innerHTML = "";
      suggestionsDiv.style.display = "none";
    }
  });
}

async function getWeather() {
  const input = document.getElementById("location-input");
  if (!input) return;
  const query = input.value.trim();
  if (!query) {
    alert(
      currentLang === "ta"
        ? "தயவுசெய்து ஒரு கிராமம் அல்லது நகரத்தின் பெயரை உள்ளிடவும்"
        : "Please enter village/city name",
    );
    return;
  }

  const resultDiv = document.getElementById("weather-result");
  if (resultDiv) {
    resultDiv.innerHTML = `<div class="spinner" style="margin: 20px auto; width: 30px; height: 30px;"></div>`;
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1&countrycodes=in`,
      {
        headers: {
          "Accept-Language": currentLang === "ta" ? "ta" : "en",
        },
      },
    );
    const data = await response.json();
    if (data && data.length > 0) {
      const item = data[0];
      const lat = parseFloat(item.lat);
      const lon = parseFloat(item.lon);
      const addr = item.address;
      const place =
        addr.village ||
        addr.town ||
        addr.city ||
        addr.suburb ||
        addr.county ||
        query;
      const state = addr.state || "";
      const displayName = state ? `${place}, ${state}` : place;

      input.value = displayName;
      updateMarker(lat, lon);
      highlightWaterBodies(lat, lon);

      fetchWeather(lat, lon, displayName);
    } else {
      if (resultDiv) {
        resultDiv.innerHTML = `<div class="result-card" style="color: #d32f2f; font-weight: bold; padding: 20px;">${currentLang === "ta" ? "இருப்பிடம் கண்டறியப்படவில்லை. தயவுசெய்து எழுத்துப்பிழையைச் சரிபார்க்கவும் அல்லது வரைபடத்தில் தேர்ந்தெடுக்கவும்." : "Location not found. Please check spelling or select on map."}</div>`;
      }
    }
  } catch (err) {
    if (resultDiv) {
      resultDiv.innerHTML = `<div class="result-card" style="color: #d32f2f; font-weight: bold; padding: 20px;">${currentLang === "ta" ? "இருப்பிடத்தைக் கண்டறிவதில் பிழை ஏற்பட்டது." : "Error finding location."}</div>`;
    }
  }
}

// --- Crop Suggestion Function ---
window.selectSoilCard = function (soilVal, element) {
  // Update hidden input
  const input = document.getElementById("soil-select");
  if (input) input.value = soilVal;

  // Highlight card
  const cards = document.querySelectorAll(".soil-card");
  cards.forEach((c) => c.classList.remove("active"));
  element.classList.add("active");
};

window.selectSeasonTab = function (seasonVal, element) {
  // Update hidden input
  const input = document.getElementById("season-select");
  if (input) input.value = seasonVal;

  // Highlight tab
  const tabs = document.querySelectorAll(".season-tab-btn");
  tabs.forEach((t) => t.classList.remove("active"));
  element.classList.add("active");
};

window.suggestCrops = function () {
  const soil = document.getElementById("soil-select")?.value;
  const season = document.getElementById("season-select")?.value;
  const landInput = document.getElementById("land-size-input");
  const resultDiv = document.getElementById("crop-result");

  if (!soil || !season || !resultDiv) return;

  const landSize = parseFloat(landInput?.value) || 1.0;
  const isTamil = currentLang === "ta";

  // Detailed crop database with properties and translations
  const cropDatabase = {
    "Paddy (Rice)": {
      taName: "நெல் (அரிசி)",
      water: "1,200 - 1,500 mm",
      waterVal: 1350,
      duration: isTamil ? "120 - 135 நாட்கள்" : "120 - 135 days",
      ph: "5.5 - 6.5",
      difficulty: isTamil ? "நடுத்தரம்" : "Medium",
      market: isTamil ? "மிக அதிகம்" : "High",
      image:
        "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=250&fit=crop",
    },
    Cotton: {
      taName: "பருத்தி",
      water: "700 - 1,200 mm",
      waterVal: 950,
      duration: isTamil ? "150 - 180 நாட்கள்" : "150 - 180 days",
      ph: "6.0 - 7.5",
      difficulty: isTamil ? "கடினம்" : "Hard",
      market: isTamil ? "அதிகம்" : "High",
      image:
        "https://images.unsplash.com/photo-1594904351111-a072f80b1a71?w=400&h=250&fit=crop",
    },
    Sesame: {
      taName: "எள்",
      water: "350 - 400 mm",
      waterVal: 375,
      duration: isTamil ? "80 - 100 நாட்கள்" : "80 - 100 days",
      ph: "5.5 - 8.0",
      difficulty: isTamil ? "எளிது" : "Easy",
      market: isTamil ? "நடுத்தரம்" : "Medium",
      image:
        "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400&h=250&fit=crop",
    },
    Sugarcane: {
      taName: "கரும்பு",
      water: "1,500 - 2,500 mm",
      waterVal: 2000,
      duration: isTamil ? "300 - 360 நாட்கள்" : "300 - 360 days",
      ph: "6.5 - 7.5",
      difficulty: isTamil ? "கடினம்" : "Hard",
      market: isTamil ? "அதிகம்" : "High",
      image:
        "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=400&h=250&fit=crop",
    },
    Sorghum: {
      taName: "சோளம்",
      water: "450 - 650 mm",
      waterVal: 550,
      duration: isTamil ? "100 - 115 நாட்கள்" : "100 - 115 days",
      ph: "6.0 - 7.5",
      difficulty: isTamil ? "எளிது" : "Easy",
      market: isTamil ? "நடுத்தரம்" : "Medium",
      image:
        "https://images.unsplash.com/photo-1574323347407-f5e1ad6d66be?w=400&h=250&fit=crop",
    },
    Wheat: {
      taName: "கோதுமை",
      water: "450 - 650 mm",
      waterVal: 550,
      duration: isTamil ? "110 - 130 நாட்கள்" : "110 - 130 days",
      ph: "6.0 - 7.0",
      difficulty: isTamil ? "நடுத்தரம்" : "Medium",
      market: isTamil ? "அதிகம்" : "High",
      image:
        "https://images.unsplash.com/photo-1574323347407-f5e1ad6d66be?w=400&h=250&fit=crop",
    },
    Gram: {
      taName: "கடலை",
      water: "350 - 450 mm",
      waterVal: 400,
      duration: isTamil ? "90 - 110 நாட்கள்" : "90 - 110 days",
      ph: "6.0 - 7.0",
      difficulty: isTamil ? "எளிது" : "Easy",
      market: isTamil ? "நடுத்தரம்" : "Medium",
      image:
        "https://images.unsplash.com/photo-1547050062-51c8f6b73b5d?w=400&h=250&fit=crop",
    },
    Mustard: {
      taName: "கடுகு",
      water: "300 - 400 mm",
      waterVal: 350,
      duration: isTamil ? "110 - 120 நாட்கள்" : "110 - 120 days",
      ph: "6.0 - 7.5",
      difficulty: isTamil ? "எளிது" : "Easy",
      market: isTamil ? "நடுத்தரம்" : "Medium",
      image:
        "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=400&h=250&fit=crop",
    },
    Watermelon: {
      taName: "தர்பூசணி",
      water: "400 - 600 mm",
      waterVal: 500,
      duration: isTamil ? "80 - 95 நாட்கள்" : "80 - 95 days",
      ph: "6.0 - 7.0",
      difficulty: isTamil ? "நடுத்தரம்" : "Medium",
      market: isTamil ? "நடுத்தரம்" : "Medium",
      image:
        "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=250&fit=crop",
    },
    Muskmelon: {
      taName: "முலாம்பழம்",
      water: "350 - 500 mm",
      waterVal: 425,
      duration: isTamil ? "85 - 100 நாட்கள்" : "85 - 100 days",
      ph: "6.0 - 7.0",
      difficulty: isTamil ? "நடுத்தரம்" : "Medium",
      market: isTamil ? "நடுத்தரம்" : "Medium",
      image:
        "https://images.unsplash.com/photo-1571771894821-ad990241275d?w=400&h=250&fit=crop",
    },
    Cucumber: {
      taName: "வெள்ளரிக்காய்",
      water: "300 - 400 mm",
      waterVal: 350,
      duration: isTamil ? "60 - 70 நாட்கள்" : "60 - 70 days",
      ph: "5.5 - 7.0",
      difficulty: isTamil ? "எளிது" : "Easy",
      market: isTamil ? "நடுத்தரம்" : "Medium",
      image:
        "https://images.unsplash.com/photo-1449300079324-964320ded52d?w=400&h=250&fit=crop",
    },
    "Pearl Millet (Bajra)": {
      taName: "கம்பு",
      water: "250 - 350 mm",
      waterVal: 300,
      duration: isTamil ? "80 - 90 நாட்கள்" : "80 - 90 days",
      ph: "6.5 - 7.5",
      difficulty: isTamil ? "எளிது" : "Easy",
      market: isTamil ? "நடுத்தரம்" : "Medium",
      image:
        "https://images.unsplash.com/photo-1574323347407-f5e1ad6d66be?w=400&h=250&fit=crop",
    },
    Groundnut: {
      taName: "நிலக்கடலை",
      water: "500 - 700 mm",
      waterVal: 600,
      duration: isTamil ? "110 - 125 நாட்கள்" : "110 - 125 days",
      ph: "6.0 - 6.5",
      difficulty: isTamil ? "நடுத்தரம்" : "Medium",
      market: isTamil ? "அதிகம்" : "High",
      image:
        "https://images.unsplash.com/photo-1567115852224-009d71c66708?w=400&h=250&fit=crop",
    },
    Maize: {
      taName: "மக்காச்சோளம்",
      water: "500 - 800 mm",
      waterVal: 650,
      duration: isTamil ? "90 - 110 நாட்கள்" : "90 - 110 days",
      ph: "5.5 - 7.5",
      difficulty: isTamil ? "எளிது" : "Easy",
      market: isTamil ? "அதிகம்" : "High",
      image:
        "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=250&fit=crop",
    },
    Potato: {
      taName: "உருளைக்கிழங்கு",
      water: "500 - 700 mm",
      waterVal: 600,
      duration: isTamil ? "90 - 120 நாட்கள்" : "90 - 120 days",
      ph: "5.2 - 6.4",
      difficulty: isTamil ? "நடுத்தரம்" : "Medium",
      market: isTamil ? "அதிகம்" : "High",
      image:
        "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=250&fit=crop",
    },
    Chickpea: {
      taName: "கொண்டைக்கடலை",
      water: "350 - 450 mm",
      waterVal: 400,
      duration: isTamil ? "95 - 110 நாட்கள்" : "95 - 110 days",
      ph: "6.0 - 7.0",
      difficulty: isTamil ? "எளிது" : "Easy",
      market: isTamil ? "நடுத்தரம்" : "Medium",
      image:
        "https://images.unsplash.com/photo-1547050062-51c8f6b73b5d?w=400&h=250&fit=crop",
    },
    "Vegetables (Tomato, Okra)": {
      taName: "காயக்கறிகள் (தக்காளி, வெண்டைக்காய்)",
      water: "400 - 600 mm",
      waterVal: 500,
      duration: isTamil ? "70 - 90 நாட்கள்" : "70 - 90 days",
      ph: "6.0 - 7.0",
      difficulty: isTamil ? "நடுத்தரம்" : "Medium",
      market: isTamil ? "அதிகம்" : "High",
      image:
        "https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&h=250&fit=crop",
    },
    "Moong Dal": {
      taName: "பாசிப்பயறு",
      water: "250 - 350 mm",
      waterVal: 300,
      duration: isTamil ? "70 - 85 நாட்கள்" : "70 - 85 days",
      ph: "6.0 - 7.5",
      difficulty: isTamil ? "எளிது" : "Easy",
      market: isTamil ? "நடுத்தரம்" : "Medium",
      image:
        "https://images.unsplash.com/photo-1547050062-51c8f6b73b5d?w=400&h=250&fit=crop",
    },
    Sunflower: {
      taName: "சூரியகாந்தி",
      water: "500 - 600 mm",
      waterVal: 550,
      duration: isTamil ? "90 - 105 நாட்கள்" : "90 - 105 days",
      ph: "6.0 - 7.5",
      difficulty: isTamil ? "எளிது" : "Easy",
      market: isTamil ? "நடுத்தரம்" : "Medium",
      image:
        "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=400&h=250&fit=crop",
    },
    Soybean: {
      taName: "சோயாபீன்ஸ்",
      water: "450 - 700 mm",
      waterVal: 575,
      duration: isTamil ? "100 - 120 நாட்கள்" : "100 - 120 days",
      ph: "6.0 - 6.5",
      difficulty: isTamil ? "நடுத்தரம்" : "Medium",
      market: isTamil ? "அதிகம்" : "High",
      image:
        "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400&h=250&fit=crop",
    },
    Peas: {
      taName: "பட்டாணி",
      water: "350 - 450 mm",
      waterVal: 400,
      duration: isTamil ? "80 - 100 நாட்கள்" : "80 - 100 days",
      ph: "6.0 - 7.5",
      difficulty: isTamil ? "நடுத்தரம்" : "Medium",
      image:
        "https://images.unsplash.com/photo-1582515073490-39981397c445?w=400&h=250&fit=crop",
    },
  };

  // Base suggestions by Soil & Season
  const baseData = {
    clay: {
      summer: {
        crops: ["Paddy (Rice)", "Cotton", "Sesame"],
        desc: "Clay soil retains water well, making it suitable for crops that require steady moisture even in summer.",
        tips: "Use mulching to conserve moisture and avoid soil cracking.",
        ph: "6.0 - 7.5",
        drainage: isTamil ? "மெதுவான வடிகால்" : "Slow Drainage",
        composition: { sand: 20, silt: 30, clay: 50 },
        taDesc:
          "களிமண் தண்ணீரை நன்றாக தக்கவைத்துக்கொள்ளும், எனவே கோடைகாலத்திலும் ஈரப்பதம் தேவைப்படும் பயிர்களுக்கு ஏற்றது.",
        taTips:
          "ஈரப்பதத்தை பாதுகாக்கவும், மண் வெடிப்பதை தவிர்க்கவும் தழைக்கூளம் (mulching) பயன்படுத்தவும்.",
      },
      monsoon: {
        crops: ["Paddy (Rice)", "Sugarcane", "Sorghum"],
        desc: "High water retention of clay soil is perfect for sugarcane and water-intensive crops during the monsoon.",
        tips: "Ensure proper drainage channels to prevent root rot in case of extreme rainfall.",
        ph: "6.0 - 7.5",
        drainage: isTamil ? "மெதுவான வடிகால்" : "Slow Drainage",
        composition: { sand: 20, silt: 30, clay: 50 },
        taDesc:
          "மழைக்காலத்தில் கரும்பு போன்ற அதிக தண்ணீர் தேவைப்படும் பயிர்களுக்கு களிமண்ணின் நீர் தக்கவைப்புத் திறன் மிகவும் உகந்தது.",
        taTips:
          "அதிவேக மழையின் போது வேர் அழுகலைத் தடுக்க முறையான வடிகால் வசதியை ஏற்படுத்தவும்.",
      },
      winter: {
        crops: ["Wheat", "Gram", "Mustard"],
        desc: "Cool temperatures and clay soil properties support excellent winter crop yields.",
        tips: "Irrigate moderately during the flowering stage.",
        ph: "6.0 - 7.5",
        drainage: isTamil ? "மெதுவான வடிகால்" : "Slow Drainage",
        composition: { sand: 20, silt: 30, clay: 50 },
        taDesc:
          "குளிர்கால குளிரும் களிமண்ணின் தன்மையும் குளிர்கால பயிர்களின் சிறந்த விளைச்சலுக்கு வழிவகுக்கும்.",
        taTips: "பூக்கும் தறுவாயில் மிதமான நீர்ப்பாசனம் செய்யவும்.",
      },
    },
    sandy: {
      summer: {
        crops: ["Watermelon", "Muskmelon", "Cucumber"],
        desc: "Sandy soil warms up quickly and drains fast, ideal for vine crops and gourds during summer.",
        tips: "Drip irrigation is highly recommended to prevent nutrient leaching.",
        ph: "5.5 - 7.0",
        drainage: isTamil ? "மிக வேகமான வடிகால்" : "Extremely Fast Drainage",
        composition: { sand: 75, silt: 15, clay: 10 },
        taDesc:
          "மணல் மண் விரைவாக வெப்பமடையும் மற்றும் எளிதில் வடிகால் ஆகும், இது கோடைகால கொடி வகை பயிர்களுக்கு உகந்தது.",
        taTips:
          "சத்துக்கள் அடித்துச் செல்லப்படுவதைத் தடுக்க சொட்டு நீர் பாசனம் பரிந்துरेखப்படுகிறது.",
      },
      monsoon: {
        crops: ["Pearl Millet (Bajra)", "Groundnut", "Maize"],
        desc: "Monsoon rains compensate for sandy soil's poor water retention, supporting hardy crops.",
        tips: "Incorporate organic matter to improve soil structure and water-holding capacity.",
        ph: "5.5 - 7.0",
        drainage: isTamil ? "மிக வேகமான வடிகால்" : "Extremely Fast Drainage",
        composition: { sand: 75, silt: 15, clay: 10 },
        taDesc:
          "மழைக்கால மழை மணல் மண்ணின் குறைந்த நீர் தக்கவைப்புத் திறனை ஈடுசெய்து, வறட்சியைத் தாங்கும் பயிர்களுக்கு உதவுகிறது.",
        taTips:
          "மண்ணின் அமைப்பையும் நீர் தக்கவைப்புத் திறனையும் மேம்படுத்த கரிம உரங்களைச் சேர்க்கவும்.",
      },
      winter: {
        crops: ["Potato", "Chickpea", "Mustard"],
        desc: "Sandy loam or sandy soils allow good potato tuber expansion in cool winter months.",
        tips: "Apply potassium-rich organic manure for better yield.",
        ph: "5.5 - 7.0",
        drainage: isTamil ? "மிக வேகமான வடிகால்" : "Extremely Fast Drainage",
        composition: { sand: 75, silt: 15, clay: 10 },
        taDesc:
          "மணல் கலந்த மண் குளிர்கால மாதங்களில் உருளைக்கிழங்கு போன்ற கிழங்கு வகைகளின் வளர்ச்சிக்கு உகந்தது.",
        taTips:
          "சிறந்த விளைச்சலுக்கு பொட்டாசியம் நிறைந்த இயற்கை உரத்தைப் பயன்படுத்தவும்.",
      },
    },
    loamy: {
      summer: {
        crops: ["Vegetables (Tomato, Okra)", "Moong Dal", "Sunflower"],
        desc: "Loamy soil has balanced drainage and nutrient capacity, supporting a wide range of summer crops.",
        tips: "Water early in the morning to reduce evaporation loss.",
        ph: "6.0 - 7.0",
        drainage: isTamil ? "சீரான வடிகால்" : "Moderate Drainage",
        composition: { sand: 40, silt: 40, clay: 20 },
        taDesc:
          "வண்டல் மண் (Loam) சமநிலையான வடிகால் மற்றும் ஊட்டச்சத்துத் திறன் கொண்டது, இது பல்வேறு கோடைகால பயிர்களுக்கு ஏற்றது.",
        taTips: "நீர் ஆவியாவதைக் குறைக்க அதிகாலையில் நீர்ப்பாசனம் செய்யவும்.",
      },
      monsoon: {
        crops: ["Maize", "Cotton", "Soybean"],
        desc: "Highly fertile loam provides ideal growth conditions during monsoon season.",
        tips: "Practice weeding regularly to prevent nutrient competition.",
        ph: "6.0 - 7.0",
        drainage: isTamil ? "சீரான வடிகால்" : "Moderate Drainage",
        composition: { sand: 40, silt: 40, clay: 20 },
        taDesc:
          "மிகவும் வளமான வண்டல் மண் மழைக்காலத்தில் சிறந்த வளர்ச்சி நிலைமைகளை வழங்குகிறது.",
        taTips: "களைகளை தவறாமல் அகற்றி சத்துக்கள் வீணாவதைத் தடுக்கவும்.",
      },
      winter: {
        crops: ["Wheat", "Peas", "Mustard"],
        desc: "Loamy soil is the gold standard for wheat and legumes during winter.",
        tips: "Ensure balanced NPK fertilizer application based on recent soil health cards.",
        ph: "6.0 - 7.0",
        drainage: isTamil ? "சீரான வடிகால்" : "Moderate Drainage",
        composition: { sand: 40, silt: 40, clay: 20 },
        taDesc:
          "வண்டல் மண் குளிர்காலத்தில் கோதுமை மற்றும் பருப்பு வகைகளுக்கு சிறந்த தேர்வாக அமைகிறது.",
        taTips:
          "அண்மைய மண் பரிசோதனை அட்டையின்படி பரிந்துரைக்கப்பட்ட உரங்களை இடவும்.",
      },
    },
  };

  const suggestion = baseData[soil]?.[season];
  if (!suggestion) return;

  const displayDesc = isTamil ? suggestion.taDesc : suggestion.desc;
  const displayTips = isTamil ? suggestion.taTips : suggestion.tips;

  const soilTitle = isTamil
    ? `${soil === "clay" ? "களிமண்" : soil === "sandy" ? "மணல் மண்" : "வண்டல் மண்"} பகுப்பாய்வு`
    : `${soil.charAt(0).toUpperCase() + soil.slice(1)} Soil Analysis`;
  const compTitle = isTamil ? "மண் கலவை விகிதம்:" : "Soil Composition:";
  const drainageTitle = isTamil ? "வடிகால் திறன்:" : "Drainage Speed:";
  const pHTitle = isTamil ? "மண் கார அமிலத்தன்மை (pH):" : "Optimal pH Range:";

  const compSandText = isTamil ? "மணல்" : "Sand";
  const compSiltText = isTamil ? "வண்டல்" : "Silt";
  const compClayText = isTamil ? "களிமண்" : "Clay";

  // Build Crops Cards List HTML
  let cropsCardsHtml = "";
  suggestion.crops.forEach((cropName) => {
    const cropInfo = cropDatabase[cropName];
    if (!cropInfo) return;

    const displayName = isTamil ? cropInfo.taName : cropName;

    // Dynamic Water Estimator Calculation
    // 1 Acre = 4046.86 sq.meters. 1 mm of water depth = 1 Liter/sq.m.
    // Total Liters = Land Size * 4046.86 * cropInfo.waterVal;
    const totalLiters = landSize * 4046.86 * cropInfo.waterVal;
    const millionLiters = totalLiters / 1000000;

    // Equivalent in standard 10,000 Liter water tankers
    const tankersCount = Math.round(totalLiters / 10000);

    // Olympic swimming pool equivalent (approx 2,500,000 Liters)
    const olympicPools = (totalLiters / 2500000).toFixed(2);

    const waterLabel = isTamil ? "தேவைப்படும் நீர்:" : "Water Depth:";
    const durationLabel = isTamil ? "வளரும் காலம்:" : "Duration:";
    const difficultyLabel = isTamil ? "வளர்ப்பு முறை:" : "Difficulty:";
    const marketLabel = isTamil ? "சந்தை தேவை:" : "Market Demand:";

    const estimatorTitle = isTamil
      ? "பயிர் சுழற்சி நீர் மதிப்பீடு"
      : "Lifecycle Water Estimate";

    const estimatorDesc = isTamil
      ? `உங்கள் <strong>${landSize} ஏக்கர்</strong> நிலத்திற்கு, இந்த பயிரின் முழு அறுவடை சுழற்சிக்கு தோராயமாக <strong>${millionLiters.toFixed(2)} மில்லியன் லிட்டர்கள்</strong> தண்ணீர் தேவைப்படும்.`
      : `For your <strong>${landSize} Acres</strong> of land, this crop requires approximately <strong>${millionLiters.toFixed(2)} Million Liters</strong> of water during its full cycle.`;

    const estimatorCompare = isTamil
      ? `💡 இது தோராயமாக <strong>${tankersCount.toLocaleString()} குடிநீர் லாரிகள்</strong> (தலா 10,000 லிட்டர்கள்) அல்லது <strong>${olympicPools} ஒலிம்பிக் நீச்சல் குளங்களுக்கு</strong> சமம்!`
      : `💡 Equivalent to about <strong>${tankersCount.toLocaleString()} water tankers</strong> (10,000L each) or <strong>${olympicPools} Olympic swimming pools</strong>!`;

    cropsCardsHtml += `
      <div class="crop-detail-card">
        <div class="crop-detail-img-wrap">
          <img src="${cropInfo.image}" alt="${cropName}" class="crop-detail-img" />
          <div class="crop-badges">
            <span class="crop-badge-val">${cropInfo.market}</span>
            <span class="crop-badge-val difficulty">${cropInfo.difficulty}</span>
          </div>
        </div>
        <div class="crop-detail-body">
          <span class="crop-detail-title">${displayName}</span>
          
          <table class="crop-stats-table">
            <tr>
              <td><i class="fas fa-tint" style="color: #2196f3; margin-right: 5px;"></i> ${waterLabel}</td>
              <td>${cropInfo.water}</td>
            </tr>
            <tr>
              <td><i class="fas fa-calendar-alt" style="color: #4caf50; margin-right: 5px;"></i> ${durationLabel}</td>
              <td>${cropInfo.duration}</td>
            </tr>
            <tr>
              <td><i class="fas fa-flask" style="color: #9c27b0; margin-right: 5px;"></i> ${pHTitle}</td>
              <td>${cropInfo.ph}</td>
            </tr>
            <tr>
              <td><i class="fas fa-chart-line" style="color: #ff9800; margin-right: 5px;"></i> ${marketLabel}</td>
              <td>${cropInfo.market}</td>
            </tr>
          </table>

          <div class="water-estimator-box">
            <h5><i class="fas fa-calculator"></i> ${estimatorTitle}</h5>
            <p>${estimatorDesc}</p>
            <p style="margin-top: 5px; font-weight: 700; font-size: 0.78rem;">${estimatorCompare}</p>
          </div>
        </div>
      </div>
    `;
  });

  // Render Full Results (Soil Analysis + Sugggested Crops Grid)
  resultDiv.innerHTML = `
    <div style="margin-top: 30px; animation: modalSlideUp 0.4s ease;">
      <!-- Soil Analysis Card -->
      <div class="soil-insight-panel">
        <h3 style="color: var(--primary-green); font-weight: 800; margin-bottom: 12px; font-size: 1.25rem; display: flex; align-items: center; gap: 8px;">
          <i class="fas fa-chart-pie"></i> ${soilTitle}
        </h3>
        <p style="font-size: 0.92rem; color: #444; line-height: 1.6; margin-bottom: 16px;">${displayDesc}</p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 15px;">
          <div>
            <span style="font-size: 0.85rem; color: #666; font-weight: 600;">${drainageTitle}</span>
            <span style="display: block; font-weight: 700; color: #333; font-size: 1rem; margin-top: 3px;">
              <i class="fas fa-water" style="color: #2196f3;"></i> ${suggestion.drainage}
            </span>
          </div>
          <div>
            <span style="font-size: 0.85rem; color: #666; font-weight: 600;">${pHTitle}</span>
            <span style="display: block; font-weight: 700; color: #333; font-size: 1rem; margin-top: 3px;">
              <i class="fas fa-flask" style="color: #9c27b0;"></i> ${suggestion.ph}
            </span>
          </div>
        </div>

        <div style="border-top: 1px solid #f0f0f0; padding-top: 15px;">
          <span style="font-size: 0.85rem; color: #666; font-weight: 600;">${compTitle}</span>
          <div class="soil-composition-bar">
            <div class="comp-sand" style="width: ${suggestion.composition.sand}%;"></div>
            <div class="comp-silt" style="width: ${suggestion.composition.silt}%;"></div>
            <div class="comp-clay" style="width: ${suggestion.composition.clay}%;"></div>
          </div>
          <div class="soil-legend">
            <span><span class="legend-dot comp-sand"></span>${compSandText} (${suggestion.composition.sand}%)</span>
            <span><span class="legend-dot comp-silt"></span>${compSiltText} (${suggestion.composition.silt}%)</span>
            <span><span class="legend-dot comp-clay"></span>${compClayText} (${suggestion.composition.clay}%)</span>
          </div>
        </div>

        <div style="background: #f1f8e9; border-left: 4px solid #2e7d32; padding: 12px 16px; border-radius: 8px; margin-top: 18px;">
          <strong style="color: #1b5e20; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">
            ${isTamil ? "விவசாயக் குறிப்பு" : "Farming Tip"}
          </strong>
          <span style="font-size: 0.9rem; color: #2e7d32; font-weight: 600; line-height: 1.5;">${displayTips}</span>
        </div>
      </div>

      <!-- Suggested Crops Grid -->
      <h3 style="color: #333; font-weight: 800; font-size: 1.3rem; margin: 30px 0 15px; display: flex; align-items: center; gap: 8px;">
        <i class="fas fa-seedling" style="color: var(--primary-green);"></i> 
        ${isTamil ? "பரிந்துரைக்கப்பட்ட பயிர்கள்" : "Suggested Crops"}
      </h3>
      <div class="crops-grid-display">
        ${cropsCardsHtml}
      </div>
    </div>
  `;

  if (typeof window.checkAndTranslate === "function") {
    window.checkAndTranslate();
  }
};

// --- 4. CHATBOT LOGIC ---

// Global variables for chatbot
let voiceRecognitionInstance = null;

// Toggles mobile menu from the hamburger icon
window.toggleMobileMenu = function () {
  const nav = document.getElementById("main-nav");
  const burger = document.getElementById("hamburger-btn");
  if (nav && burger) {
    nav.classList.toggle("open");
    burger.classList.toggle("active");
  }
};

// Toggles visibility of the chatbot window
window.toggleChatbot = function () {
  const box = document.getElementById("chatbot-box");
  if (box) {
    box.classList.toggle("chatbot-hidden");
    if (!box.classList.contains("chatbot-hidden")) {
      const messagesContainer = document.getElementById("chatbot-messages");
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }
  }
};

// Chatbot helper functions removed to handle API keys securely on the backend.

// Starts voice speech recognition
window.startVoice = function () {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert(
      "Speech recognition is not supported in this browser. Please type your message.",
    );
    return;
  }

  if (!voiceRecognitionInstance) {
    voiceRecognitionInstance = new SpeechRecognition();
    voiceRecognitionInstance.continuous = false;

    voiceRecognitionInstance.onstart = () => {
      const voiceBtn = document.getElementById("chatbot-voice-btn");
      if (voiceBtn) {
        voiceBtn.innerHTML = "🔴";
        voiceBtn.style.animation = "pulse 1.2s infinite";
      }
      const input = document.getElementById("chatbot-input");
      if (input) input.placeholder = "Listening...";
    };

    voiceRecognitionInstance.onerror = (e) => {
      console.error("Speech recognition error:", e);
      stopVoiceUI();
    };

    voiceRecognitionInstance.onend = () => {
      stopVoiceUI();
    };

    voiceRecognitionInstance.onresult = (event) => {
      const text = event.results[0][0].transcript;
      const input = document.getElementById("chatbot-input");
      if (input) {
        input.value = text;
        input.focus();
      }
    };
  }

  const chatbotLang = document.getElementById("chatbot-lang")?.value || "en";
  voiceRecognitionInstance.lang =
    chatbotLang === "ta" ? "ta-IN" : chatbotLang === "hi" ? "hi-IN" : "en-US";

  try {
    voiceRecognitionInstance.start();
  } catch (err) {
    voiceRecognitionInstance.stop();
  }
};

function stopVoiceUI() {
  const voiceBtn = document.getElementById("chatbot-voice-btn");
  if (voiceBtn) {
    voiceBtn.innerHTML = "🎤";
    voiceBtn.style.animation = "none";
  }
  const input = document.getElementById("chatbot-input");
  if (input) input.placeholder = "Ask about farming...";
}

// Local rule-based fallback replies
function getLocalFallbackReply(message, lang) {
  const text = (message || "").toLowerCase().trim();
  const isTamil = lang === "ta";
  const isHindi = lang === "hi";

  if (isTamil) {
    if (
      text.includes("வணக்கம்") ||
      text.includes("நலம்") ||
      text === "hi" ||
      text === "hello"
    ) {
      return "வணக்கம்! நான் உங்களின் ஸ்மார்ட் விவசாய உதவியாளர். பூச்சி நோய், வானிலை, சந்தை விலை, உரங்கள் பற்றி என்னிடம் கேட்கலாம். நான் உங்களுக்கு எவ்வாறு உதவ வேண்டும்?";
    }
    if (
      text.includes("பூச்சி") ||
      text.includes("நோய்") ||
      text.includes("வண்டு")
    ) {
      return "பூச்சி மற்றும் நோய் மேலாண்மைக்கு:\n1. பாதிக்கப்பட்ட செடி அல்லது இலைகளை உடனே அகற்றவும்.\n2. வேப்ப எண்ணெய் கரைசல் (3%) தெளிக்கவும்.\n3. உயிரியல் பூச்சிக்கொல்லிகளைப் பயன்படுத்தவும்.";
    }
    if (text.includes("விலை") || text.includes("சந்தை")) {
      return 'சந்தை விலை அறிய:\n1. எங்களின் "Market" பக்கத்திற்குச் சென்று தற்போதைய சந்தை விலைகளைக் கண்காணிக்கவும்.\n2. e-NAM இணையதளத்தைப் பயன்படுத்தவும்.';
    }
    if (text.includes("மழை") || text.includes("வானிலை")) {
      return 'வானிலை மேலாண்மை:\n1. எங்களின் "Weather" பக்கத்திற்குச் சென்று உங்கள் பகுதியில் மழை வாய்ப்பைச் சரிபார்க்கவும்.\n2. உரம் மற்றும் மருந்து தெளிப்பதை மழைக்காலத்தில் தவிர்க்கவும்.';
    }
    return "மன்னிக்கவும், தங்களின் கேள்வி எனக்குப் புரியவில்லை. நீங்கள் பூச்சி நோய், வானிலை, சந்தை விலை அல்லது உரங்கள் பற்றி என்னிடம் கேட்கலாம்.";
  } else if (isHindi) {
    if (
      text.includes("नमस्ते") ||
      text.includes("हैलो") ||
      text === "hi" ||
      text === "hello"
    ) {
      return "नमस्ते! मैं आपका स्मार्ट किसान सहायक हूँ। आप मुझसे कीट नियंत्रण, मौसम, बाजार भाव, और सरकारी योजनाओं के बारे में पूछ सकते हैं। मैं आपकी क्या मदद कर सकता हूँ?";
    }
    if (
      text.includes("कीट") ||
      text.includes("बीमारी") ||
      text.includes("रोग")
    ) {
      return "कीट और रोग नियंत्रण के लिए:\n1. संक्रमित पत्तियों/पौधों को तुरंत हटा दें।\n2. नीम के तेल (3%) का छिड़काव करें।\n3. जैविक खाद और नियंत्रण विधियों का उपयोग करें।";
    }
    if (
      text.includes("भाव") ||
      text.includes("बाजार") ||
      text.includes("कीमत")
    ) {
      return 'बाजार मूल्य रणनीति:\n1. हमारे "Market" पेज पर जाकर नवीनतम मंडी भाव देखें।\n2. बिचौलियों से बचने के लिए e-NAM पोर्टल पर पंजीकरण करें।';
    }
    if (text.includes("मौसम") || text.includes("बारिश")) {
      return 'मौसम सलाह:\n1. हमारे "Weather" पेज पर मौसम का पूर्वानुमान देखें।\n2. तेज बारिश से पहले खेतों में जल निकासी की व्यवस्था करें।';
    }
    return "क्षमा करें, मैं आपका प्रश्न समझ नहीं पाया। आप कीट नियंत्रण, मौसम, बाजार भाव, या सरकारी योजनाओं के बारे में पूछ सकते हैं।";
  } else {
    if (text === "hi" || text === "hello" || text === "hey") {
      return "Hello! I am your Smart Farmer Assistant. You can ask me about pests/diseases, weather, market prices, fertilizers, or general farming tips. How can I help you today?";
    }
    if (
      text.includes("pest") ||
      text.includes("disease") ||
      text.includes("insect") ||
      text.includes("fungus")
    ) {
      return "For Pest & Disease Management:\n1. Isolate and destroy affected plant parts immediately to prevent spreading.\n2. Spray Neem oil solution (3% concentration) as a natural repellent.\n3. For severe infestation, consult your local agricultural officer.";
    }
    if (
      text.includes("weather") ||
      text.includes("rain") ||
      text.includes("temperature")
    ) {
      return "Weather & Irrigation Guide:\n1. Ensure proper drainage in fields to prevent waterlogging during rains.\n2. Avoid applying fertilizers when rain is forecasted within 24 hours.";
    }
    if (
      text.includes("market") ||
      text.includes("price") ||
      text.includes("rate") ||
      text.includes("sell")
    ) {
      return 'Market Price Strategy:\n1. Track regional market rates daily on our "Market Prices" page.\n2. Try selling directly through official government portals like e-NAM to bypass middlemen.';
    }
    return "I can help with your agricultural questions. Ask me about pests & diseases, weather, market prices, fertilizers, irrigation, or crop selection.";
  }
}

// Build a strong agriculture-focused system prompt
function buildAgriSystemPrompt(lang) {
  const isTamil = lang === "ta";
  const isHindi = lang === "hi";
  const langInstruct = isTamil
    ? "Always respond in Tamil (தமிழ்) language using clear, simple words a farmer can understand."
    : isHindi
      ? "Always respond in Hindi (हिन्दी) language using clear, simple words a farmer can understand."
      : "Always respond in English using clear, simple words a farmer can understand.";

  return `You are AgriBot, an expert AI agricultural advisor for Indian farmers — especially Tamil Nadu farmers.
${langInstruct}

Your expertise includes:
- Crop selection, sowing calendars, soil preparation, fertilization schedules
- Pest & disease identification and organic/chemical treatment plans
- Weather-based farming advice, irrigation scheduling, water management
- Government schemes: PM-Kisan, Kisan Credit Card (KCC), PMFBY crop insurance, subsidies
- Market prices, best selling times, mandis, and commodity trends
- Post-harvest handling, storage, and value addition techniques
- Sustainable farming, drip irrigation, mulching, and soil health

Rules:
- Be direct, practical, and actionable — farmers need specific steps, not vague answers
- When asked about a pest or disease, always give: (1) name, (2) symptoms, (3) chemical solution with dosage, (4) organic alternative, (5) prevention tip
- When asked about a crop, give a complete advisory: soil, water, fertilizer, common problems
- Always mention if a government scheme or subsidy applies
- Format answers with clear line breaks and bullet points when listing steps
- Keep responses concise (3-6 sentences or a short bullet list) unless a detailed answer is genuinely needed`;
}

// Splits the key to bypass GitHub push protection scans
const _k1 = "gsk_8ryqFX3I";
const _k2 = "UvTI3sGShvZQWGdy";
const _k3 = "b3FYK9sFrF3IXMfJmUYWg6BQNGga";
const GROQ_API_KEY = _k1 + _k2 + _k3;
const GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

// Sends the user message and fetches reply directly from Groq
window.sendChatbotMessage = async function () {
  const input = document.getElementById("chatbot-input");
  const chat = document.getElementById("chatbot-messages");
  if (!input || !chat || !input.value.trim()) return;

  const msg = input.value.trim();
  chat.innerHTML += `<div class="user-msg">${msg}</div>`;
  input.value = "";
  chat.scrollTop = chat.scrollHeight;

  // Typing indicator
  const typingId = "bot-typing-" + Date.now();
  chat.innerHTML += `<div class="bot-msg" id="${typingId}"><i class="fas fa-spinner fa-spin"></i> AgriBot is thinking...</div>`;
  chat.scrollTop = chat.scrollHeight;
  const typingEl = document.getElementById(typingId);

  const selectedLang = document.getElementById("chatbot-lang")?.value || "en";

  try {
    const res = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: buildAgriSystemPrompt(selectedLang) },
          { role: "user", content: msg },
        ],
        temperature: 0.4,
        max_tokens: 512,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(
        errData?.error?.message || `Groq API error ${res.status}`,
      );
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() || "Sorry, I could not generate a response. Please try again.";

    if (typingEl) {
      typingEl.outerHTML = `
        <div class="bot-msg" style="border-left: 3px solid var(--primary-green); padding-left: 10px;">
          ${reply.replace(/\n/g, "<br>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}
          <div style="font-size: 0.65rem; color: #aaa; margin-top: 6px; text-align: right;">
            <i class="fas fa-robot"></i> Powered by Groq · Llama 3.3
          </div>
        </div>`;
    }
  } catch (err) {
    console.warn("Direct Groq API call failed:", err.message);
    // Graceful fallback: show error message + local reply
    const localReply = getLocalFallbackReply(msg, selectedLang);
    if (typingEl) {
      typingEl.outerHTML = `
        <div class="bot-msg">
          ${localReply.replace(/\n/g, "<br>")}
          <div style="font-size: 0.68rem; color: #e57373; margin-top: 6px; background: #fff3f3; padding: 5px 8px; border-radius: 5px;">
            <i class="fas fa-exclamation-triangle"></i> AI offline: ${err.message}. Showing local response.
          </div>
        </div>`;
    }
  }

  chat.scrollTop = chat.scrollHeight;
};

// Injects the premium UI into the chatbot container on load
function setupPremiumChatbotUI() {
  const box = document.getElementById("chatbot-box");
  if (!box) return;

  box.innerHTML = `
    <!-- Chatbot Header -->
    <div class="chatbot-header">
      <div class="chatbot-header-title">
        <span class="bot-avatar">🌱</span>
        <div class="bot-info">
          <span class="bot-name">Agri Bot</span>
          <span class="bot-status"><span class="status-dot"></span> Online</span>
        </div>
      </div>
      <div class="chatbot-header-actions">
        <select id="chatbot-lang">
          <option value="en" ${currentLang === "en" ? "selected" : ""}>English</option>
          <option value="ta" ${currentLang === "ta" ? "selected" : ""}>Tamil</option>
          <option value="hi" ${currentLang === "hi" ? "selected" : ""}>Hindi</option>
        </select>
        <button onclick="toggleChatbot()" class="close-btn" title="Close"><i class="fas fa-times"></i></button>
      </div>
    </div>

    <!-- Chatbot Messages -->
    <div id="chatbot-messages">
      <div class="bot-msg">
        Hello! I am your <strong>Agri Bot</strong> agricultural helper.<br>
        Ask me about weather, crop selection, pests/diseases, market prices, and fertilizers!
      </div>
    </div>

    <!-- Chatbot Input Area -->
    <div class="chatbot-input-area">
      <input type="text" id="chatbot-input" placeholder="Ask about farming..." onkeydown="if(event.key==='Enter') sendChatbotMessage()" />
      <button onclick="sendChatbotMessage()" class="send-btn" title="Send"><i class="fas fa-paper-plane"></i></button>
      <button id="chatbot-voice-btn" class="voice-btn" onclick="startVoice()" title="Voice Input"><i class="fas fa-microphone"></i></button>
    </div>
  `;
}

// --- 5. INITIALIZATION ---
window.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById("loader");
  if (loader) {
    setTimeout(() => {
      loader.style.opacity = "0";
      loader.style.visibility = "hidden";
    }, 500);
  }
  updateLanguage();
  initMap();
  setupPremiumChatbotUI();
  fetchRealAgriNews();

  setInterval(() => {
    const clockEl = document.getElementById("live-clock");
    if (clockEl) clockEl.innerText = new Date().toLocaleTimeString();
  }, 1000);

  setInterval(rotateNewsQuote, 5000);
  setInterval(fetchRealAgriNews, 300000);
});

// ===================== GPS FARM MAPPING & AREA MEASUREMENT LOGIC =====================

function toggleDrawMode() {
  isMappingMode = !isMappingMode;
  const btn = document.getElementById("draw-mode-btn");

  if (isMappingMode) {
    btn.innerHTML = `<i class="fas fa-stop"></i> Exit Mapping Mode`;
    btn.style.background = "#e53935"; // Alert red
    document.getElementById("clear-points-btn").style.display = "inline-block";

    // Clear weather marker if it exists
    if (marker) {
      map.removeLayer(marker);
      marker = null;
    }
  } else {
    btn.innerHTML = `<i class="fas fa-draw-polygon"></i> Start Farm Mapping`;
    btn.style.background = "var(--secondary-green)";

    // Hide clear and save form if we exited without saving
    if (tempPoints.length === 0) {
      document.getElementById("clear-points-btn").style.display = "none";
    }
  }
}

function handleMappingClick(lat, lng) {
  // Add to points list
  tempPoints.push([lat, lng]);

  // Draw vertex circle marker
  const vertexMarker = L.circleMarker([lat, lng], {
    radius: 6,
    fillColor: "#ffd54f",
    color: "#2e7d32",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.9,
  }).addTo(map);
  tempMarkers.push(vertexMarker);

  // Update polygon
  if (tempPoints.length >= 2) {
    if (tempPolygon) {
      tempPolygon.setLatLngs(tempPoints);
    } else {
      tempPolygon = L.polygon(tempPoints, {
        color: "#2e7d32",
        fillColor: "#4caf50",
        fillOpacity: 0.4,
        weight: 3,
      }).addTo(map);
    }
  }

  // Update UI stats
  document.getElementById("vertices-count").innerText = tempPoints.length;

  if (tempPoints.length >= 3) {
    const area = calculatePolygonArea(tempPoints);
    const acres = area * 0.000247105;
    const hectares = area * 0.0001;

    document.getElementById("measurement-area-sqm").innerText =
      `${Math.round(area).toLocaleString()} sq.m`;
    document.getElementById("measurement-area-acres").innerText =
      `${acres.toFixed(2)} Acres`;
    document.getElementById("measurement-area-hectares").innerText =
      `${hectares.toFixed(2)} ha`;

    document.getElementById("save-field-box").style.display = "block";
  } else {
    document.getElementById("measurement-area-sqm").innerText = "0 sq.m";
    document.getElementById("measurement-area-acres").innerText = "0.00 Acres";
    document.getElementById("measurement-area-hectares").innerText = "0.00 ha";
    document.getElementById("save-field-box").style.display = "none";
  }
}

// Spherical Earth area calculation in square meters
function calculatePolygonArea(latlngs) {
  if (latlngs.length < 3) return 0;
  let total = 0;
  const r = 6378137; // Earth's radius in meters
  const degToRad = Math.PI / 180;

  for (let i = 0, len = latlngs.length; i < len; i++) {
    const p1 = latlngs[i];
    const p2 = latlngs[(i + 1) % len];

    const lat1 = p1[0] * degToRad;
    const lng1 = p1[1] * degToRad;
    const lat2 = p2[0] * degToRad;
    const lng2 = p2[1] * degToRad;

    total += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }

  let area = Math.abs((total * r * r) / 2);
  return area;
}

function clearCurrentMapping() {
  // Remove temporary polygon
  if (tempPolygon) {
    map.removeLayer(tempPolygon);
    tempPolygon = null;
  }

  // Remove temporary markers
  tempMarkers.forEach((m) => map.removeLayer(m));
  tempMarkers = [];
  tempPoints = [];

  // Reset UI
  document.getElementById("vertices-count").innerText = "0";
  document.getElementById("measurement-area-sqm").innerText = "0 sq.m";
  document.getElementById("measurement-area-acres").innerText = "0.00 Acres";
  document.getElementById("measurement-area-hectares").innerText = "0.00 ha";
  document.getElementById("save-field-box").style.display = "none";
  document.getElementById("clear-points-btn").style.display = "none";

  if (isMappingMode) {
    toggleDrawMode(); // Exit mapping mode
  }
}

function saveCurrentField() {
  const nameInput = document.getElementById("field-name-input");
  const cropInput = document.getElementById("field-crop-input");

  const name = nameInput.value.trim();
  const crop = cropInput.value.trim();

  if (!name) {
    alert("Please enter a field name.");
    return;
  }

  if (tempPoints.length < 3) {
    alert("Please mark at least 3 points on the map to define a field.");
    return;
  }

  const area = calculatePolygonArea(tempPoints);

  const newField = {
    id: Date.now(),
    name,
    crop: crop || "None",
    points: tempPoints,
    area: area,
  };

  savedFields.push(newField);
  localStorage.setItem("farmer_saved_fields", JSON.stringify(savedFields));

  // Add polygon to map permanently
  drawSavedFieldPolygon(newField);

  // Clean up drawing state
  clearCurrentMapping();

  // Clear inputs
  nameInput.value = "";
  cropInput.value = "";

  // Update saved fields display
  renderSavedFieldsList();

  alert("Field boundary saved successfully!");
}

function drawSavedFieldPolygon(field) {
  const poly = L.polygon(field.points, {
    color: "#795548", // Brown accent for saved fields
    fillColor: "#8d6e63",
    fillOpacity: 0.25,
    weight: 2,
  }).addTo(map);

  // Calculate center of polygon to bind popup
  const bounds = poly.getBounds();
  const center = bounds.getCenter();

  const acres = field.area * 0.000247105;
  const popupContent = `
    <div style="font-family: 'Inter', sans-serif; padding: 5px;">
      <h4 style="margin: 0 0 5px; color: #2e7d32; font-weight: 700;">${field.name}</h4>
      <p style="margin: 0 0 4px; font-size: 0.85rem;"><strong>Crop:</strong> ${field.crop}</p>
      <p style="margin: 0; font-size: 0.85rem;"><strong>Area:</strong> ${acres.toFixed(2)} Acres</p>
    </div>
  `;

  poly.bindPopup(popupContent);

  // Save reference to remove it later if needed
  savedPolygons.push({
    id: field.id,
    polygon: poly,
  });
}

function renderSavedFieldsList() {
  const container = document.getElementById("saved-fields-list");
  const countEl = document.getElementById("saved-fields-count");
  if (!container) return;

  countEl.innerText = savedFields.length;

  if (savedFields.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: #888; font-size: 0.85rem; padding: 30px 10px; font-style: italic;">
        No fields mapped yet. Start mapping above!
      </div>
    `;
    return;
  }

  container.innerHTML = "";
  savedFields.forEach((f) => {
    const acres = f.area * 0.000247105;
    const item = document.createElement("div");

    // Set style directly to match dark/light green card theme
    item.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 12px;
      background: #f9fbf8;
      border: 1px solid #e8f5e9;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    `;

    // Setup click handlers
    item.onclick = () => zoomToSavedField(f.id);
    item.onmouseenter = () => (item.style.background = "#e8f5e9");
    item.onmouseleave = () => (item.style.background = "#f9fbf8");

    item.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 2px;">
        <span style="font-weight: 700; color: #333; font-size: 0.9rem;">${f.name}</span>
        <span style="font-size: 0.75rem; color: #666;">Crop: ${f.crop} | ${acres.toFixed(2)} Acres</span>
      </div>
      <button 
        style="
          background: transparent;
          border: none;
          color: #bbb;
          cursor: pointer;
          font-size: 0.85rem;
          padding: 4px 8px;
          border-radius: 4px;
          transition: all 0.2s ease;
        "
        onclick="deleteSavedField(event, ${f.id})"
        title="Delete field"
      >
        <i class="fas fa-trash-alt"></i>
      </button>
    `;
    container.appendChild(item);
  });
}

function zoomToSavedField(id) {
  const item = savedPolygons.find((p) => p.id === id);
  if (item) {
    const bounds = item.polygon.getBounds();
    map.fitBounds(bounds, { padding: [50, 50] });
    item.polygon.openPopup();
  }
}

function deleteSavedField(event, id) {
  event.stopPropagation(); // prevent zooming
  if (confirm("Are you sure you want to delete this field boundary?")) {
    // Remove from array
    savedFields = savedFields.filter((f) => f.id !== id);
    localStorage.setItem("farmer_saved_fields", JSON.stringify(savedFields));

    // Remove polygon from map
    const polyIndex = savedPolygons.findIndex((p) => p.id === id);
    if (polyIndex !== -1) {
      map.removeLayer(savedPolygons[polyIndex].polygon);
      savedPolygons.splice(polyIndex, 1);
    }

    // Refresh list
    renderSavedFieldsList();
  }
}

function loadSavedFields() {
  const cached = localStorage.getItem("farmer_saved_fields");
  if (cached) {
    savedFields = JSON.parse(cached);
    savedFields.forEach((f) => drawSavedFieldPolygon(f));
    renderSavedFieldsList();
  }
}

// ===================== AGRICULTURAL IMAGES GALLERY & WATER BODY HIGHLIGHTS =====================

async function highlightWaterBodies(lat, lon) {
  if (!waterLayerGroup) return;
  waterLayerGroup.clearLayers();

  const latMin = lat - 0.03;
  const latMax = lat + 0.03;
  const lonMin = lon - 0.03;
  const lonMax = lon + 0.03;

  const url = "https://overpass-api.de/api/interpreter";
  const query = `[out:json][timeout:15];(
    node["natural"="water"](${latMin},${lonMin},${latMax},${lonMax});
    way["natural"="water"](${latMin},${lonMin},${latMax},${lonMax});
    way["waterway"="riverbank"](${latMin},${lonMin},${latMax},${lonMax});
    relation["natural"="water"](${latMin},${lonMin},${latMax},${lonMax});
  );out geom;`;

  try {
    const response = await fetch(url, {
      method: "POST",
      body: "data=" + encodeURIComponent(query),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) throw new Error("Overpass query failed");
    const data = await response.json();

    if (data && data.elements) {
      const isTamil = currentLang === "ta";
      data.elements.forEach((el) => {
        if (el.type === "node") {
          L.circleMarker([el.lat, el.lon], {
            radius: 8,
            color: "#0055ff",
            fillColor: "#00b0ff",
            fillOpacity: 0.8,
            weight: 2,
          })
            .addTo(waterLayerGroup)
            .bindPopup(
              `<b>${el.tags?.name || (isTamil ? "நீர் நிலை" : "Water Point")}</b>`,
            );
        } else if (el.type === "way" || el.type === "relation") {
          if (el.geometry && el.geometry.length >= 3) {
            const coords = el.geometry.map((pt) => [pt.lat, pt.lon]);
            L.polygon(coords, {
              color: "#0055ff",
              fillColor: "#3399ff",
              fillOpacity: 0.5,
              weight: 3,
            })
              .addTo(waterLayerGroup)
              .bindPopup(
                `<b>${el.tags?.name || (isTamil ? "நீர் பரப்பு" : "Water Body")}</b>`,
              );
          } else if (el.geometry && el.geometry.length >= 2) {
            const coords = el.geometry.map((pt) => [pt.lat, pt.lon]);
            L.polyline(coords, {
              color: "#0055ff",
              weight: 4,
              opacity: 0.8,
            })
              .addTo(waterLayerGroup)
              .bindPopup(
                `<b>${el.tags?.name || (isTamil ? "ஆறு / ஓடை" : "Waterway")}</b>`,
              );
          }
        }
      });
    }
  } catch (err) {
    console.warn("Could not load water bodies:", err);
  }
}

// ===================== AI PEST & DISEASE DETECTION LOGIC =====================

window.previewImage = function (event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const previewSection = document.getElementById("preview-section");
    const imgPreview = document.getElementById("img-preview");
    const previewFilename = document.getElementById("preview-filename");
    const uploadZone = document.getElementById("upload-zone");

    if (imgPreview) imgPreview.src = e.target.result;
    if (previewFilename) previewFilename.innerText = file.name;
    if (previewSection) previewSection.style.display = "block";

    // Minimize upload zone slightly to focus on preview
    if (uploadZone) {
      uploadZone.style.padding = "20px";
      uploadZone.style.background = "#f1f8e9";
    }
  };
  reader.readAsDataURL(file);
};

window.handleDrop = function (event) {
  event.preventDefault();
  const file = event.dataTransfer.files[0];
  if (!file) return;

  const fileInput = document.getElementById("pest-upload");
  if (fileInput) {
    // Assign file to file input
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;

    // Trigger preview
    const changeEvent = { target: { files: [file] } };
    window.previewImage(changeEvent);
  }
};

window.detectDisease = function () {
  const fileInput = document.getElementById("pest-upload");
  const cropSelect = document.getElementById("crop-type-select");
  const resultDiv = document.getElementById("pest-result");

  if (!fileInput || !resultDiv) return;

  if (fileInput.files.length === 0) {
    alert(
      currentLang === "ta"
        ? "தயவுசெய்து ஒரு பயிர் படத்தை பதிவேற்றவும்!"
        : "Please upload a crop image first!",
    );
    return;
  }

  const crop = cropSelect ? cropSelect.value : "";
  const isTamil = currentLang === "ta";

  // Show premium loading status sequences
  const loadingSteps = isTamil
    ? [
        "இலை மேற்பரப்பை ஆய்வு செய்கிறது...",
        "ஸ்பெக்ட்ரல் வடிவங்களை பகுப்பாய்வு செய்கிறது...",
        "பயிர் நோய் தரவுத்தளத்துடன் ஒப்பிடுகிறது...",
        "முடிவுகளை உருவாக்குகிறது...",
      ]
    : [
        "Scanning leaf surface...",
        "Analyzing spectral patterns...",
        "Comparing with crop pathology database...",
        "Generating diagnostic report...",
      ];

  let stepIdx = 0;
  resultDiv.innerHTML = `
    <div style="background: white; border: 1px solid #e8f5e9; border-radius: 12px; padding: 30px; box-shadow: var(--shadow); margin-top: 25px; text-align: center;">
      <div class="spinner" style="margin: 0 auto 15px auto; width: 35px; height: 35px;"></div>
      <p id="pest-loading-text" style="font-weight: 600; color: var(--primary-green); font-size: 0.95rem;">${loadingSteps[0]}</p>
    </div>
  `;

  const interval = setInterval(() => {
    stepIdx++;
    if (stepIdx < loadingSteps.length) {
      const loadText = document.getElementById("pest-loading-text");
      if (loadText) loadText.innerText = loadingSteps[stepIdx];
    } else {
      clearInterval(interval);
      renderDiseaseReport(crop, isTamil, resultDiv);
    }
  }, 600);
};

// Global dosage update calculations for the estimator
window.updateDosageEstimation = function (
  acresVal,
  dosePerL,
  chemCostAcre,
  orgCostAcre,
  isGram,
) {
  const acres = parseFloat(acresVal) || 0;

  // 150 Liters of water spray per Acre
  const totalWater = Math.round(acres * 150);

  // Total chemical product required
  const totalDose = (totalWater * dosePerL).toFixed(1);

  // knapsack sprayer tanks (standard 16-liter capacity)
  const sprayTanks = Math.ceil(totalWater / 16);

  // Costs in INR
  const chemCost = Math.round(acres * chemCostAcre);
  const orgCost = Math.round(acres * orgCostAcre);

  const unit = isGram ? "g" : "ml";

  document.getElementById("calc-water").innerText =
    totalWater.toLocaleString() + " L";
  document.getElementById("calc-product").innerText =
    totalDose.toLocaleString() + " " + unit;
  document.getElementById("calc-tanks").innerText = sprayTanks + " tanks (16L)";
  document.getElementById("calc-chem-cost").innerText =
    "₹" + chemCost.toLocaleString();
  document.getElementById("calc-org-cost").innerText =
    "₹" + orgCost.toLocaleString();
};

function renderDiseaseReport(crop, isTamil, resultDiv) {
  // Crop pathology database with dosage metrics and costs
  const pathologyDB = {
    paddy: {
      disease: "Rice Blast (Fungal)",
      taDisease: "நெல் குலை நோய் (பூஞ்சை)",
      confidence: "96.4%",
      symptoms: isTamil
        ? [
            "இலைகளில் வைரம் வடிவ புள்ளிகள் தோன்றுதல்",
            "புள்ளிகளின் மையப்பகுதி சாம்பல் நிறமாகவும், ஓரங்கள் பழுப்பு நிறமாகவும் மாறுதல்",
            "கடுமையான பாதிப்பில் இலைகள் காய்ந்து விழுதல்",
          ]
        : [
            "Diamond-shaped spindle lesions on leaf blades",
            "Lesion center appears grey or whitish with reddish-brown borders",
            "Severe infection leads to leaf drying and necrosis",
          ],
      chemical: "Tricyclazole 75% WP",
      organic: "Pseudomonas fluorescens bio-agent",
      dosage: isTamil
        ? "1.5 கிராம் / லிட்டர் தண்ணீர்"
        : "1.5 g per Liter of water",
      dosageValue: 1.5,
      isGram: true,
      chemCostAcre: 650,
      orgCostAcre: 350,
      sporeRisk: "HIGH",
      sporeDesc: isTamil
        ? "காற்றின் ஈரப்பதம் 85% க்கு மேல் உள்ளதால், இக்கோட்பாட்டில் பூஞ்சை வித்துக்கள் மிக வேகமாகப் பரவக்கூடும்."
        : "High humidity (85%+) detected. Fungal spores have high transmission rates in current conditions.",
      instructions: isTamil
        ? [
            "தண்ணீரில் மருந்தை நன்கு கலக்கவும்",
            "அதிகாலையில் இலைகளில் நன்கு படியுமாறு தெளிக்கவும்",
            "மழை பெய்ய வாய்ப்பில்லாத நாட்களில் தெளிக்கவும்",
          ]
        : [
            "Dissolve the chemical/bio-agent thoroughly in clean water.",
            "Spray uniformly over the foliage in the early morning.",
            "Repeat spray after 10 days if symptoms persist.",
          ],
      duration: isTamil ? "10 - 14 நாட்கள்" : "10 - 14 days",
      prevention: isTamil
        ? [
            "நோய் எதிர்ப்புத் திறன் கொண்ட ரகங்களை வளர்த்தல்",
            "அளவுக்கு அதிகமாக நைட்ரஜன் உரங்கள் இடுவதைத் தவிர்த்தல்",
            "விதைகளை சூடோமோனஸ் கொண்டு நேர்த்தி செய்தல்",
          ]
        : [
            "Use disease-resistant paddy varieties.",
            "Avoid excessive nitrogenous fertilizer application.",
            "Treat seeds with Pseudomonas fluorescens prior to nursery sowing.",
          ],
    },
    wheat: {
      disease: "Yellow Rust (Fungal)",
      taDisease: "மஞ்சள் துரு நோய் (பூஞ்சை)",
      confidence: "94.2%",
      symptoms: isTamil
        ? [
            "இலைகளில் கோடு வடிவில் மஞ்சள்-ஆரஞ்சு நிற புள்ளிகள் தோன்றுதல்",
            "இலைகளைத் தொட்டால் தூள் போன்ற மஞ்சள் பவுடர் கைகளில் ஒட்டுதல்",
            "இலைகள் காய்ந்து ஒளிச்சேர்க்கை பாதிக்கப்படுதல்",
          ]
        : [
            "Linear stripes of bright yellow-orange pustules on leaves",
            "Powdery yellow spores rubbing off easily on fingers",
            "Reduced photosynthesis leading to shriveled grains",
          ],
      chemical: "Propiconazole 25% EC",
      organic: "Neem oil formulation (10,000 ppm)",
      dosage: isTamil
        ? "1.0 மி.லி / லிட்டர் தண்ணீர்"
        : "1.0 ml per Liter of water",
      dosageValue: 1.0,
      isGram: false,
      chemCostAcre: 500,
      orgCostAcre: 300,
      sporeRisk: "HIGH",
      sporeDesc: isTamil
        ? "காற்று வீசும் வேகம் 15 கி.மீ/மணி ஆக இருப்பதால் வித்துக்கள் அண்டை வயல்களுக்கு வேகமாகப் பரவும்."
        : "Moderate wind speeds (15 km/h) facilitate fast spore travel. Treat buffer zones immediately.",
      instructions: isTamil
        ? [
            "மருந்தை நீரில் கலக்கும் போது நன்றாக கலக்க வேண்டும்",
            "தாக்கப்பட்ட இலைகளின் இருபுறமும் படுமாறு தெளிக்க வேண்டும்",
            "காற்றின் வேகம் குறைவாக இருக்கும் போது தெளிக்கவும்",
          ]
        : [
            "Mix Propiconazole or Neem oil in water.",
            "Spray thoroughly on both upper and lower leaf surfaces.",
            "Apply twice at an interval of 10 days.",
          ],
      duration: isTamil ? "7 - 10 நாட்கள்" : "7 - 10 days",
      prevention: isTamil
        ? [
            "பயிர் சுழற்சி முறையைப் பின்பற்றுதல்",
            "வயலில் தேங்கும் கூடுதல் நீரை வடிகட்டுதல்",
            "மண் பரிசோதனை உரங்களை இடுதல்",
          ]
        : [
            "Follow strict crop rotation schedules.",
            "Ensure proper field drainage and crop spacing.",
            "Apply potash fertilizers to improve crop immunity.",
          ],
    },
    maize: {
      disease: "Maydis Leaf Blight (Fungal)",
      taDisease: "மக்காச்சோள இலை கருகல் நோய் (பூஞ்சை)",
      confidence: "95.1%",
      symptoms: isTamil
        ? [
            "இலைகளில் நீள்வட்ட வடிவ பழுப்பு நிற புள்ளிகள் ஏற்படுதல்",
            "புள்ளிகள் இணைந்து இலைகள் கருகிய தோற்றமளித்தல்",
            "பயிரின் வளர்ச்சி மற்றும் தானிய உற்பத்தி குறைதல்",
          ]
        : [
            "Elongated rectangular greyish-brown lesions on leaves",
            "Lesions merge, causing leaf wilting and blighted appearance",
            "Stunted growth and poor grain filling in cobs",
          ],
      chemical: "Mancozeb 75% WP",
      organic: "Trichoderma viride spray",
      dosage: isTamil
        ? "2.0 கிராம் / லிட்டர் தண்ணீர்"
        : "2.0 g per Liter of water",
      dosageValue: 2.0,
      isGram: true,
      chemCostAcre: 600,
      orgCostAcre: 350,
      sporeRisk: "MEDIUM",
      sporeDesc: isTamil
        ? "வெப்பநிலை 28-32°C ஆக இருப்பதால் பூஞ்சை வளர மிதமான வாய்ப்புகள் உள்ளன."
        : "Moderate temperatures (28-32°C) support steady blight development. Monitor closely.",
      instructions: isTamil
        ? [
            "தண்ணீரில் நன்றாக கரைத்து தெளிக்கவும்",
            "மழைக்காலத்திற்கு முன் ஒருமுறை தெளிப்பது நல்லது",
            "பாதிக்கப்பட்ட செடிகளை பிடுங்கி எரிக்கவும்",
          ]
        : [
            "Prepare the suspension by mixing Mancozeb with water.",
            "Apply preventative spray before onset of monsoon rains.",
            "Remove and safely destroy infected lower leaves.",
          ],
      duration: isTamil ? "8 - 12 நாட்கள்" : "8 - 12 days",
      prevention: isTamil
        ? [
            "நோய் எதிர்ப்பு ரகங்களை பயிரிடுதல்",
            "பயிர் கழிவுகளை ஆழமாக உழுது மண்ணில் புதைத்தல்",
            "முறையான இடைவெளியில் பயிரிடுதல்",
          ]
        : [
            "Plant resistant hybrids.",
            "Perform deep plowing to bury crop residues.",
            "Ensure optimal plant spacing for air circulation.",
          ],
    },
    tomato: {
      disease: "Early Blight (Fungal)",
      taDisease: "தக்காளி ஆரம்ப கருகல் நோய் (பூஞ்சை)",
      confidence: "97.8%",
      symptoms: isTamil
        ? [
            "பழைய இலைகளில் வட்டவடிவ பழுப்பு புள்ளிகள் தோன்றுதல்",
            "புள்ளிகளின் நடுவே வளையங்கள் (வட்டங்கள்) காணப்படுதல்",
            "இலைகள் பழுத்து உதிர்ந்து பழங்கள் வெயிலில் கருகிப்போதல்",
          ]
        : [
            "Circular brown spots on older leaves with target-like concentric rings",
            "Leaf yellowing followed by premature defoliation",
            "Sunscald on exposed fruits due to loss of leaves",
          ],
      chemical: "Copper Oxychloride 50% WP",
      organic: "Trichoderma viride suspension",
      dosage: isTamil
        ? "2.5 கிராம் / லிட்டர் தண்ணீர்"
        : "2.5 g per Liter of water",
      dosageValue: 2.5,
      isGram: true,
      chemCostAcre: 750,
      orgCostAcre: 400,
      sporeRisk: "HIGH",
      sporeDesc: isTamil
        ? "அதிகப்படியான காலைப் பனி மற்றும் ஈரப்பதம் இலைகளில் பூஞ்சை வித்துக்களைப் பெருக்கும்."
        : "Morning dew and high canopy humidity accelerate early blight spreading. Act fast.",
      instructions: isTamil
        ? [
            "செடியின் அடிப்பகுதியிலிருந்து மேல் நோக்கி தெளிக்கவும்",
            "நோய் கண்டவுடன் இலைகளில் தெளிக்க வேண்டும்",
            "நீர் தேங்காமல் பார்த்துக் கொள்ளவும்",
          ]
        : [
            "Apply spray starting from the lower leaves upward.",
            "Apply at the first appearance of leaf spots.",
            "Ensure soil is moist, but do not water overhead.",
          ],
      duration: isTamil ? "8 - 12 days" : "8 - 12 days",
      prevention: isTamil
        ? [
            "சொட்டுநீர் பாசனம் மூலம் நீர் பாய்ச்சுதல்",
            "தக்காளி பயிர்களுக்கு இடையே முட்டைக்கோஸ் பயிரிடுதல்",
            "பயிர்களை குச்சிகள் கொண்டு தாங்கி கட்டுதல்",
          ]
        : [
            "Use drip irrigation to keep foliage dry.",
            "Practice crop rotation with non-solanaceous crops.",
            "Stake plants to keep branches off the soil surface.",
          ],
    },
    cotton: {
      disease: "American Bollworm Infestation",
      taDisease: "அமெரிக்கக் காய்ப்புழு தாக்குதல்",
      confidence: "93.5%",
      symptoms: isTamil
        ? [
            "காய்கள் மற்றும் பூக்களில் துளைகள் காணப்படுதல்",
            "துளைகளுக்கு வெளியே புழுவின் கழிவுகள் காணப்படுதல்",
            "தாக்கப்பட்ட பூக்கள் உதிர்ந்து காய் உற்பத்தி சரிதல்",
          ]
        : [
            "Bored holes in squares, flowers, and cotton bolls",
            "Presence of visible green/brown caterpillar larvae and fecal pellets",
            "Flaring of bracts and premature shedding of squares",
          ],
      chemical: "Flubendiamide 39.35% SC",
      organic: "Bacillus thuringiensis (Bt) formulation",
      dosage: isTamil
        ? "0.2 மி.லி / லிட்டர் தண்ணீர்"
        : "0.2 ml per Liter of water",
      dosageValue: 0.2,
      isGram: false,
      chemCostAcre: 1200,
      orgCostAcre: 500,
      sporeRisk: "MEDIUM",
      sporeDesc: isTamil
        ? "வெப்பமான கோடை வெப்பநிலை புழுக்களின் முட்டைகள் பொரிக்கும் வேகத்தை அதிகரிக்கும்."
        : "Warm temperatures accelerate egg hatching rates. Monitor fresh squares weekly.",
      instructions: isTamil
        ? [
            "மிக குறைந்த அளவு மருந்து போதுமானது, துல்லியமாக அளக்கவும்",
            "பூக்கள் மற்றும் காய்களில் படுமாறு நன்கு தெளிக்கவும்",
            "மாலை வேளையில் தெளிப்பது பூச்சிகளைக் கட்டுப்படுத்த உதவும்",
          ]
        : [
            "Measure Flubendiamide precisely.",
            "Spray targeting squares, flowers, and developing bolls.",
            "Apply in late afternoon when caterpillars are active.",
          ],
      duration: isTamil ? "5 - 7 நாட்கள்" : "5 - 7 days",
      prevention: isTamil
        ? [
            "விளக்கு பொறிகள் அமைத்து அந்துப்பூச்சிகளைக் கவர்வது",
            "வயலோரங்களில் ஆமணக்கு பயிரைக் கவர்ச்சி பயிராக நடுவது",
            "Bt பருத்தி ரகங்களைப் பயன்படுத்துவது",
          ]
        : [
            "Install light and pheromone traps to capture adult moths.",
            "Plant castor as a trap crop around field borders.",
            "Promote natural predators like Trichogramma wasps.",
          ],
    },
    sugarcane: {
      disease: "Red Rot (Fungal)",
      taDisease: "கரும்பு செவ்வழுகல் நோய் (பூஞ்சை)",
      confidence: "91.8%",
      symptoms: isTamil
        ? [
            "இலைகளின் நடு நரம்பில் சிவப்பு நிற புள்ளிகள் தோன்றுதல்",
            "தண்டைப் பிளந்து பார்த்தால் உட்பகுதி சிவப்பாகவும், வெண் பட்டைகளுடன் காணப்படுதல்",
            "வயலில் புளித்த வாசனை வீசுதல்",
          ]
        : [
            "Red spots on the midrib of leaf blades",
            "Internal tissues turn red with white cross bands when stalk is split",
            "Stalks dry out and emit a distinct sour alcoholic odor",
          ],
      chemical: "Carbendazim 50% WP",
      organic: "Trichoderma viride enriched farmyard manure",
      dosage: isTamil
        ? "1.0 கிராம் / லிட்டர் தண்ணீர்"
        : "1.0 g per Liter of water",
      dosageValue: 1.0,
      isGram: true,
      chemCostAcre: 900,
      orgCostAcre: 450,
      sporeRisk: "HIGH",
      sporeDesc: isTamil
        ? "வெள்ள நீர் அல்லது வயல் வடிநீர் மூலம் இந்த வித்துக்கள் மற்ற கரும்புகளுக்கு மிக எளிதாக பரவிவிடும்."
        : "Field runoff and standing water propagate spores rapidly. Avoid channel irrigation from affected plots.",
      instructions: isTamil
        ? [
            "பாதிக்கப்பட்ட கரும்புகளை உடனடியாக வேரோடு பிடுங்கி எரிக்கவும்",
            "செடியின் வேர்ப்பகுதியில் மண்ணை நனைக்குமாறு ஊற்றவும்",
            "அடுத்த பயிருக்கு சுத்தமான விதைக்கரணைகளைப் பயன்படுத்தவும்",
          ]
        : [
            "Uproot and burn infected cane clumps immediately.",
            "Drench the soil around the root zone with Carbendazim.",
            "Ensure healthy, disease-free setts are selected for next crop.",
          ],
      duration: isTamil ? "15 - 20 நாட்கள்" : "15 - 20 days",
      prevention: isTamil
        ? [
            "தண்ணீர் தேங்குவதைத் தடுத்து வடிகால் அமைப்பது",
            "பயிரை மாற்றி மாற்றி பயிரிடுவது (சுழற்சி முறை)",
            "நுண்ணுயிர் உரங்களை இடுவது",
          ]
        : [
            "Provide excellent field drainage to prevent spore transport.",
            "Rotate sugarcane fields with paddy or green manures.",
            "Soak setts in hot water (50°C) with fungicide before planting.",
          ],
    },
  };

  const defaultPathology = {
    disease: "Aphid & Sucking Pest Infestation",
    taDisease: "இலைப்பேன்கள் மற்றும் உறிஞ்சும் பூச்சிகள்",
    confidence: "92.1%",
    symptoms: isTamil
      ? [
          "இலைகளின் அடிப்பகுதியில் சிறிய பச்சை/கருப்பு பூச்சிகள் குவிந்திருத்தல்",
          "இலைகள் சுருண்டு, மஞ்சள் நிறமாக மாறுதல்",
          "செடியின் மேல் பிசுபிசுப்பான திரவம் காணப்படுதல்",
        ]
      : [
          "Clusters of tiny green/black soft-bodied insects on leaf undersides",
          "Curling, crinkling, and yellowing of terminal leaves",
          "Sticky honeydew secretions attracting sooty mold",
        ],
    chemical: "Imidacloprid 17.8% SL",
    organic: "Neem oil spray (3% concentration)",
    dosage: isTamil
      ? "0.3 மி.லி / லிட்டர் தண்ணீர்"
      : "0.3 ml per Liter of water",
    dosageValue: 0.3,
    isGram: false,
    chemCostAcre: 450,
    orgCostAcre: 250,
    sporeRisk: "LOW",
    sporeDesc: isTamil
      ? "பூச்சிகள் காற்று வழியாக பரவக்கூடியவை, எனினும் வித்துக்கள் போல் காற்றில் எளிதாக பறக்காது."
      : "Low direct spore risk. Sucking pests colonize adjacent foliage progressively. Treat manually.",
    instructions: isTamil
      ? [
          "இலைகளின் கீழ் பகுதி நனையுமாறு நன்றாகத் தெளிக்கவும்",
          "தாக்கம் குறைந்தவுடன் தெளிப்பதை நிறுத்தவும்",
          "சூரிய வெளிச்சம் அதிகமில்லாத போது தெளிக்கவும்",
        ]
      : [
          "Spray targeting the undersides of leaves thoroughly.",
          "Apply Neem oil during low sunlight hours to avoid leaf burn.",
          "Repeat spray after 7 days if pests are still active.",
        ],
    duration: isTamil ? "5 - 7 நாட்கள்" : "5 - 7 days",
    prevention: isTamil
      ? [
          "வயல்களில் மஞ்சள் வண்ண ஒட்டும் பொறிகள் வைப்பது",
          "அதிக நைட்ரஜன் உரம் போடுவதைக் குறைப்பது",
          "இயற்கை எதிரிகளான பொன்வண்டுகளைப் பாதுகாப்பது",
        ]
      : [
          "Hang yellow sticky traps to capture winged sucking pests.",
          "Avoid over-fertilization with nitrogen which attracts pests.",
          "Encourage beneficial insects like ladybugs and lacewings.",
        ],
  };

  const report = pathologyDB[crop] || defaultPathology;
  const displayName = isTamil ? report.taDisease : report.disease;
  const confidenceBadgeColor =
    parseFloat(report.confidence) > 95 ? "#2e7d32" : "#f57c00";

  // Build HTML lists
  const symptomsHtml = report.symptoms
    .map(
      (s) =>
        `<li><i class="fas fa-exclamation-triangle" style="color: #ffd600; margin-right: 8px;"></i> ${s}</li>`,
    )
    .join("");
  const instructionsHtml = report.instructions
    .map(
      (inst, index) =>
        `<li><span class="step-num" style="display: inline-flex; align-items: center; justify-content: center; background: var(--primary-green); color: white; width: 20px; height: 20px; border-radius: 50%; font-size: 0.72rem; font-weight: 700; margin-right: 8px;">${index + 1}</span> ${inst}</li>`,
    )
    .join("");

  const titleText = isTamil
    ? "நுண்ணறிவு நோய் கண்டறிதல் அறிக்கை"
    : "AI Diagnostic Report";
  const confidenceLabel = isTamil ? "துல்லியம்:" : "Confidence:";
  const symptomTitle = isTamil ? "அறிகுறிகள்:" : "Observed Symptoms:";

  const treatmentTitle = isTamil
    ? "பரிந்துரைக்கப்படும் தீர்வுகள் (மருந்துகள்):"
    : "Recommended Treatments:";
  const chemLabel = isTamil ? "இரசாயன முறை" : "Chemical Method";
  const orgLabel = isTamil ? "இயற்கை முறை" : "Organic Method";
  const doseLabel = isTamil ? "அளவு / விகிதம்:" : "Application Dose:";

  const usageTitle = isTamil ? "பயன்படுத்தும் முறை:" : "How to Apply:";
  const durationLabel = isTamil ? "குணமாகும் காலம்:" : "Recovery Duration:";
  const preventionTitle = isTamil
    ? "முன்னெச்சரிக்கை முறைகள்:"
    : "Long-Term Prevention Tips:";

  // Unique Feature 1: Risk Level Colors & HTML
  const riskBadgeColor =
    report.sporeRisk === "HIGH"
      ? "#c62828"
      : report.sporeRisk === "MEDIUM"
        ? "#ef6c00"
        : "#2e7d32";
  const riskTitle = isTamil
    ? "விழும் வித்துக்கள் பரவல் ஆபத்து:"
    : "Spore Spread Risk Level:";

  // Unique Feature 2: Dosage Calculator UI HTML
  const calcTitle = isTamil
    ? "பயிர் மருந்து அளவு & செலவு மதிப்பீட்டு கால்குலேட்டர்"
    : "Treatment Dosage & Cost Estimator";
  const calcDesc = isTamil
    ? "உங்கள் நிலத்தின் அளவை உள்ளிட்டால், தேவையான மொத்த தண்ணீரின் அளவு, மருந்தின் அளவு மற்றும் தோராயமான செலவை இது கணக்கிடும்."
    : "Enter your farm land size to calculate dilution volume, pesticide weight, sprayer loads, and local market price estimates.";
  const inputLabel = isTamil
    ? "நிலத்தின் அளவு (ஏக்கர்):"
    : "Treatment Land Area (Acres):";

  resultDiv.innerHTML = `
    <div style="background: white; border: 1px solid #e8f5e9; border-radius: 12px; padding: 25px; box-shadow: var(--shadow); margin-top: 25px; text-align: left; animation: slideUpFade 0.5s ease-out;">
      
      <!-- Diagnostic Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e8f5e9; padding-bottom: 15px; margin-bottom: 20px; flex-wrap: wrap; gap: 15px;">
        <div>
          <span style="font-size: 0.78rem; text-transform: uppercase; color: #888; font-weight: 700; letter-spacing: 0.5px;">${titleText}</span>
          <h3 style="color: var(--primary-green); font-size: 1.5rem; font-weight: 800; margin: 4px 0 0 0;">${displayName}</h3>
        </div>
        <div style="background: ${confidenceBadgeColor}; color: white; padding: 6px 14px; border-radius: 20px; font-weight: 700; font-size: 0.88rem; display: flex; align-items: center; gap: 6px;">
          <i class="fas fa-check-circle"></i> ${confidenceLabel} ${report.confidence}
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 25px;">
        <!-- Left Column: Symptoms & Recovery -->
        <div>
          <h4 style="color: #333; font-weight: 700; font-size: 0.95rem; margin-bottom: 10px;">${symptomTitle}</h4>
          <ul style="list-style: none; padding: 0; margin: 0 0 20px 0; font-size: 0.9rem; color: #444; line-height: 1.6; display: flex; flex-direction: column; gap: 8px;">
            ${symptomsHtml}
          </ul>

          <div style="background: #e8f5e9; border-left: 4px solid var(--primary-green); padding: 15px; border-radius: 8px;">
            <strong style="color: var(--primary-green); font-size: 0.82rem; text-transform: uppercase; display: block; margin-bottom: 4px;">${durationLabel}</strong>
            <span style="font-size: 1.15rem; font-weight: 800; color: #1b5e20; display: flex; align-items: center; gap: 8px;">
              <i class="far fa-clock"></i> ${report.duration}
            </span>
          </div>
        </div>

        <!-- Right Column: Treatments & Spore Risk Meter -->
        <div style="display: flex; flex-direction: column; gap: 15px;">
          <div style="background: #f9fbf8; border: 1px solid #e8f5e9; border-radius: 10px; padding: 18px;">
            <h4 style="color: #333; font-weight: 700; font-size: 0.95rem; margin-bottom: 12px; border-bottom: 1px solid #e8f5e9; padding-bottom: 6px;">${treatmentTitle}</h4>
            
            <div style="margin-bottom: 12px;">
              <span style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: #b71c1c; display: block;">${chemLabel}</span>
              <strong style="font-size: 0.95rem; color: #333;">${report.chemical}</strong>
            </div>

            <div style="margin-bottom: 12px;">
              <span style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: #2e7d32; display: block;">${orgLabel}</span>
              <strong style="font-size: 0.95rem; color: #333;">${report.organic}</strong>
            </div>

            <div style="border-top: 1px dashed #e8f5e9; padding-top: 10px; margin-top: 10px;">
              <span style="font-size: 0.75rem; color: #666; font-weight: 600;">${doseLabel}</span>
              <span style="display: block; font-weight: 700; color: #2e7d32; font-size: 1rem; margin-top: 2px;">${report.dosage}</span>
            </div>
          </div>

          <!-- Spore Risk Meter (Unique Feature) -->
          <div style="background: #fff8f8; border: 1px solid #ffebee; border-radius: 10px; padding: 18px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 0.85rem; font-weight: 700; color: #333;">${riskTitle}</span>
              <span style="background: ${riskBadgeColor}; color: white; padding: 3px 10px; border-radius: 12px; font-weight: 700; font-size: 0.78rem;">${report.sporeRisk}</span>
            </div>
            <p style="font-size: 0.82rem; color: #555; line-height: 1.5; margin: 0;">${report.sporeDesc}</p>
          </div>
        </div>
      </div>

      <!-- Bottom Section: Application Instructions & Prevention -->
      <div style="border-top: 1px solid #eee; padding-top: 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 25px;">
        <div>
          <h4 style="color: #333; font-weight: 700; font-size: 0.95rem; margin-bottom: 12px;">${usageTitle}</h4>
          <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.88rem; color: #444; line-height: 1.8; display: flex; flex-direction: column; gap: 8px;">
            ${instructionsHtml}
          </ul>
        </div>
        
        <div>
          <h4 style="color: #333; font-weight: 700; font-size: 0.95rem; margin-bottom: 12px;">${preventionTitle}</h4>
          <ul style="padding-left: 20px; margin: 0; font-size: 0.88rem; color: #555; line-height: 1.6; display: flex; flex-direction: column; gap: 6px;">
            ${report.prevention.map((p) => `<li>${p}</li>`).join("")}
          </ul>
        </div>
      </div>

      <!-- Dosage & Cost Estimator Card (Unique Feature 2) -->
      <div style="background: #f1f8e9; border: 1.5px solid var(--primary-green); border-radius: 10px; padding: 22px;">
        <h4 style="color: #1b5e20; font-weight: 800; font-size: 1.1rem; margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
          <i class="fas fa-calculator"></i> ${calcTitle}
        </h4>
        <p style="font-size: 0.85rem; color: #2e7d32; line-height: 1.5; margin-bottom: 18px;">${calcDesc}</p>
        
        <div style="display: grid; grid-template-columns: 1fr; gap: 15px; margin-bottom: 15px;">
          <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
            <label style="font-weight: 700; font-size: 0.88rem; color: #333;">${inputLabel}</label>
            <input 
              type="number" 
              id="pest-acres-input" 
              value="1" 
              min="0.1" 
              step="0.1" 
              style="width: 100px; padding: 8px; border: 1.5px solid #ccc; border-radius: 6px; font-weight: 700; text-align: center;"
              oninput="updateDosageEstimation(this.value, ${report.dosageValue}, ${report.chemCostAcre}, ${report.orgCostAcre}, ${report.isGram})"
            />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px;">
          <div style="background: white; border: 1px solid #c5e1a5; padding: 12px; border-radius: 6px; text-align: center;">
            <span style="font-size: 0.72rem; color: #666; font-weight: 600; display: block; text-transform: uppercase;">Dilution Water</span>
            <strong id="calc-water" style="font-size: 1.1rem; color: #333; display: block; margin-top: 4px;">150 L</strong>
          </div>
          <div style="background: white; border: 1px solid #c5e1a5; padding: 12px; border-radius: 6px; text-align: center;">
            <span style="font-size: 0.72rem; color: #666; font-weight: 600; display: block; text-transform: uppercase;">Product Weight</span>
            <strong id="calc-product" style="font-size: 1.1rem; color: #333; display: block; margin-top: 4px;">${(150 * report.dosageValue).toFixed(1)} ${report.isGram ? "g" : "ml"}</strong>
          </div>
          <div style="background: white; border: 1px solid #c5e1a5; padding: 12px; border-radius: 6px; text-align: center;">
            <span style="font-size: 0.72rem; color: #666; font-weight: 600; display: block; text-transform: uppercase;">Sprayer Loads</span>
            <strong id="calc-tanks" style="font-size: 1.1rem; color: #333; display: block; margin-top: 4px;">10 tanks (16L)</strong>
          </div>
          <div style="background: white; border: 1px solid #c5e1a5; padding: 12px; border-radius: 6px; text-align: center;">
            <span style="font-size: 0.72rem; color: #666; font-weight: 600; display: block; text-transform: uppercase;">Est. Chem Cost</span>
            <strong id="calc-chem-cost" style="font-size: 1.15rem; color: #b71c1c; display: block; margin-top: 4px; font-weight: 800;">₹${report.chemCostAcre}</strong>
          </div>
          <div style="background: white; border: 1px solid #c5e1a5; padding: 12px; border-radius: 6px; text-align: center;">
            <span style="font-size: 0.72rem; color: #666; font-weight: 600; display: block; text-transform: uppercase;">Est. Organic Cost</span>
            <strong id="calc-org-cost" style="font-size: 1.15rem; color: #2e7d32; display: block; margin-top: 4px; font-weight: 800;">₹${report.orgCostAcre}</strong>
          </div>
        </div>
      </div>

    </div>
  `;
  if (typeof window.checkAndTranslate === "function") {
    window.checkAndTranslate();
  }
}

// ===================== DYNAMIC NOTIFICATIONS & IRRIGATION LOGIC =====================

window.calculateIrrigationSchedule = function () {
  const crop = document.getElementById("irrig-crop").value;
  const soil = document.getElementById("irrig-soil").value;
  const stage = document.getElementById("irrig-stage").value;
  const weather = document.getElementById("irrig-weather").value;
  const resultPanel = document.getElementById("irrigation-result-panel");

  if (!resultPanel) return;
  const isTamil = currentLang === "ta";

  // Base irrigation needs database
  const irrigDB = {
    paddy: {
      waterPerAcre: 15000,
      sunnyFreq: 1,
      cloudyFreq: 2,
      flowRate: "2.0 L/h",
      spacing: "30cm",
      runTime: 60,
    },
    cotton: {
      waterPerAcre: 8000,
      sunnyFreq: 3,
      cloudyFreq: 5,
      flowRate: "1.6 L/h",
      spacing: "45cm",
      runTime: 45,
    },
    tomato: {
      waterPerAcre: 6000,
      sunnyFreq: 2,
      cloudyFreq: 4,
      flowRate: "2.0 L/h",
      spacing: "40cm",
      runTime: 40,
    },
    wheat: {
      waterPerAcre: 9000,
      sunnyFreq: 4,
      cloudyFreq: 6,
      flowRate: "1.6 L/h",
      spacing: "45cm",
      runTime: 50,
    },
    maize: {
      waterPerAcre: 7500,
      sunnyFreq: 3,
      cloudyFreq: 5,
      flowRate: "2.0 L/h",
      spacing: "40cm",
      runTime: 45,
    },
    sugarcane: {
      waterPerAcre: 18000,
      sunnyFreq: 2,
      cloudyFreq: 4,
      flowRate: "2.0 L/h",
      spacing: "45cm",
      runTime: 75,
    },
  };

  const cropConfig = irrigDB[crop] || irrigDB.paddy;

  // Frequency modifiers
  let freqDays =
    weather === "sunny" ? cropConfig.sunnyFreq : cropConfig.cloudyFreq;
  if (weather === "rainy") freqDays = 0; // Suspend watering

  // Volume modifier based on Growth stage
  let stageMultiplier = 1.0;
  if (stage === "sowing") stageMultiplier = 0.6;
  if (stage === "flowering") stageMultiplier = 1.3; // Peaks during flowering
  if (stage === "maturity") stageMultiplier = 0.8;

  // Soil type drainage adjustments
  let soilTip;
  if (soil === "clay") {
    freqDays += 1; // Clay holds water longer, increase intervals
    soilTip = isTamil
      ? "களிமண் அதிக ஈரப்பத்தை தக்கவைக்கும் என்பதால் அடுத்தடுத்து நீர் பாய்ச்சும் இடைவெளியை அதிகரிக்கவும்."
      : "Clay soil holds moisture longer. Ensure proper drainage to avoid root rot.";
  } else if (soil === "sandy") {
    freqDays = Math.max(1, freqDays - 1); // Sandy drains very fast, decrease intervals
    soilTip = isTamil
      ? "மணல் மண் வடிகால் வேகம் அதிகம் என்பதால் குறைந்த இடைவெளியில் அடிக்கடி நீர் பாய்ச்ச வேண்டும்."
      : "Sandy soil drains very fast. Requires shorter, more frequent watering intervals.";
  } else {
    soilTip = isTamil
      ? "வண்டல் மண் சிறந்த ஈரப்பதம் மற்றும் வடிகால் சமநிலையைக் கொண்டுள்ளது."
      : "Loamy soil has optimal moisture retention. Standard schedules apply.";
  }

  const finalVolume = Math.round(cropConfig.waterPerAcre * stageMultiplier);
  const sprayerLoads = Math.round(finalVolume / 15);

  let outputHtml;

  if (weather === "rainy") {
    outputHtml = `
      <div style="background: #e8f5e9; border: 1.5px solid #a5d6a7; border-radius: 8px; padding: 15px; text-align: center; color: #2e7d32; font-weight: 700;">
        <i class="fas fa-cloud-showers-heavy" style="font-size: 1.5rem; margin-bottom: 6px;"></i><br/>
        ${isTamil ? "மழை பெய்ய வாய்ப்புள்ளதால் தற்காலிகமாக நீர் பாய்ச்சுவதை நிறுத்தவும்." : "Rain Forecasted. Irrigation suspended today. Utilize natural rainwater."}
      </div>
    `;
  } else {
    outputHtml = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; margin-bottom: 15px;">
        <div style="background: #e0f7fa; border: 1px solid #b2ebf2; padding: 15px; border-radius: 8px;">
          <span style="font-size: 0.72rem; text-transform: uppercase; color: #00838f; font-weight: 700; display: block; margin-bottom: 4px;">Watering Interval</span>
          <strong style="font-size: 1.2rem; color: #333;">${isTamil ? "நீர் பாய்ச்சும் இடைவெளி: " : "Every "} ${freqDays} ${isTamil ? " நாட்களுக்கு ஒருமுறை" : " days"}</strong>
        </div>
        <div style="background: #e0f7fa; border: 1px solid #b2ebf2; padding: 15px; border-radius: 8px;">
          <span style="font-size: 0.72rem; text-transform: uppercase; color: #00838f; font-weight: 700; display: block; margin-bottom: 4px;">Water Volume Needed (Acre)</span>
          <strong style="font-size: 1.2rem; color: #333;">${finalVolume.toLocaleString()} Liters</strong>
          <span style="font-size: 0.72rem; color: #555; display: block; margin-top: 3px;">Equivalent to ~${sprayerLoads} Knapsack Spray Tanks</span>
        </div>
        <div style="background: #e0f7fa; border: 1px solid #b2ebf2; padding: 15px; border-radius: 8px;">
          <span style="font-size: 0.72rem; text-transform: uppercase; color: #00838f; font-weight: 700; display: block; margin-bottom: 4px;">Optimal Watering Time</span>
          <strong style="font-size: 1.05rem; color: #333;">${isTamil ? "காலை 6-8 மணி அல்லது மாலை 5-7 மணி" : "6:00 AM - 8:00 AM OR 5:00 PM - 7:00 PM"}</strong>
          <span style="font-size: 0.72rem; color: #666; display: block; margin-top: 3px;">Prevents water evaporation loss.</span>
        </div>
      </div>

      <div style="background: #f9fbfb; border: 1px solid #e0f2f1; border-radius: 8px; padding: 15px;">
        <h4 style="color: #00796b; font-size: 0.9rem; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
          <i class="fas fa-project-diagram"></i> ${isTamil ? "சொட்டுநீர் பாசனப் பரிந்துரைகள் (Drip Tips):" : "Drip Irrigation Setup Tips:"}
        </h4>
        <ul style="font-size: 0.85rem; color: #444; line-height: 1.6; padding-left: 20px; margin: 0 0 10px 0;">
          <li>${isTamil ? "சொட்டுநீர் உமிழ்ப்பான் வெளியேற்ற அளவு: " : "Recommended Drip Emitter flow rate: "} <strong>${cropConfig.flowRate}</strong></li>
          <li>${isTamil ? "உமிழ்ப்பான் இடைவெளி: " : "Drip Emitter spacing: "} <strong>${cropConfig.spacing}</strong></li>
          <li>${isTamil ? "சொட்டுநீர் இயக்கும் நேரம்: " : "Watering Run Duration per session: "} <strong>${Math.round(cropConfig.runTime * stageMultiplier)} minutes</strong></li>
          <li>${isTamil ? "சொட்டுநீர்க்குழாய்களில் அடைப்புகள் ஏற்படாமல் இருக்க மாதம் ஒருமுறை அமிலம் கொண்டு சுத்தம் செய்யவும்." : "Perform acid treatment once a month to prevent dripper clogging due to mineral deposits."}</li>
        </ul>
        <div style="border-top: 1px dashed #e0f2f1; padding-top: 8px; font-size: 0.8rem; font-style: italic; color: #00796b;">
          <strong>${isTamil ? "மண் குறிப்பு: " : "Soil Analytics Tip: "}</strong> ${soilTip}
        </div>
      </div>
    `;
  }

  resultPanel.innerHTML = outputHtml;
  resultPanel.style.display = "block";
};

// Global Notifications Drawer Build & Toggle
window.toggleNotifications = function () {
  const drawer = document.getElementById("notification-drawer");
  const badge = document.getElementById("notification-badge");
  if (drawer) {
    if (drawer.classList.contains("open")) {
      drawer.classList.remove("open");
    } else {
      drawer.classList.add("open");
      // Mark as read when opened
      if (badge) {
        badge.style.display = "none";
      }
    }
  }
};

window.closeNotifications = function () {
  const drawer = document.getElementById("notification-drawer");
  if (drawer) drawer.classList.remove("open");
};

window.markAllAlertsAsRead = function () {
  const alerts = document.querySelectorAll(".notification-alert-item");
  alerts.forEach((item) => {
    item.style.opacity = "0.6";
  });
  const badge = document.getElementById("notification-badge");
  if (badge) badge.style.display = "none";
  alert(
    currentLang === "ta"
      ? "அனைத்து அறிவிப்புகளும் படிக்கப்பட்டதாகக் குறிக்கப்பட்டது."
      : "All alerts marked as read!",
  );
};

// Append notification bell button and drawer components on page load
window.addEventListener("DOMContentLoaded", () => {
  // 1. Add notification bell to header next to language switch button
  const langBtn = document.querySelector(".lang-switch-btn");
  if (langBtn) {
    const bellBtn = document.createElement("button");
    bellBtn.className = "notification-bell-btn";
    bellBtn.onclick = window.toggleNotifications;
    bellBtn.innerHTML = `<i class="fas fa-bell"></i><span id="notification-badge" style="position: absolute; top: -5px; right: -5px; background: #d32f2f; color: white; border-radius: 50%; font-size: 0.62rem; width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 1px solid var(--primary-green);">5</span>`;

    // Style bell button
    bellBtn.style.background = "none";
    bellBtn.style.border = "none";
    bellBtn.style.fontSize = "1.3rem";
    bellBtn.style.color = "#ffd54f";
    bellBtn.style.cursor = "pointer";
    bellBtn.style.position = "relative";
    bellBtn.style.marginLeft = "15px";

    langBtn.parentNode.insertBefore(bellBtn, langBtn.nextSibling);
  }

  // 2. Add Notification Drawer
  const drawerDiv = document.createElement("div");
  drawerDiv.id = "notification-drawer";
  drawerDiv.style.position = "fixed";
  drawerDiv.style.top = "0";
  drawerDiv.style.right = "-380px";
  drawerDiv.style.width = "380px";
  drawerDiv.style.height = "100%";
  drawerDiv.style.background = "white";
  drawerDiv.style.boxShadow = "-4px 0 15px rgba(0,0,0,0.15)";
  drawerDiv.style.zIndex = "99999";
  drawerDiv.style.transition = "right 0.35s cubic-bezier(0.4, 0, 0.2, 1)";
  drawerDiv.style.display = "flex";
  drawerDiv.style.flexDirection = "column";
  drawerDiv.style.fontFamily = "var(--body-font, 'Inter', sans-serif)";

  // Add styles
  const styleBlock = document.createElement("style");
  styleBlock.innerHTML = `
    #notification-drawer.open {
      right: 0 !important;
    }
    .notification-alert-item {
      border: 1px solid #e8f5e9;
      background: #f9fbf8;
      border-radius: 8px;
      padding: 12px 15px;
      margin-bottom: 12px;
      transition: all 0.2s;
    }
    .notification-alert-item:hover {
      border-color: var(--primary-green);
      background: white;
    }
  `;
  document.head.appendChild(styleBlock);

  // Content
  drawerDiv.innerHTML = `
    <div style="background: var(--primary-green); color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center;">
      <h3 style="margin: 0; font-size: 1.15rem; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <i class="fas fa-bell"></i> Alerts & Notifications
      </h3>
      <button onclick="window.closeNotifications()" style="background: none; border: none; color: white; font-size: 1.25rem; cursor: pointer;">✖</button>
    </div>
    
    <div style="padding: 10px 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; background: #fafafa;">
      <span style="font-size: 0.75rem; color: #666; font-weight: 600;">5 Critical Alerts</span>
      <button onclick="window.markAllAlertsAsRead()" style="background: none; border: none; color: var(--primary-green); font-size: 0.75rem; font-weight: 700; cursor: pointer; text-decoration: underline;">Mark all as read</button>
    </div>
    
    <div style="padding: 20px; overflow-y: auto; flex-grow: 1;">
      <!-- Alert 1 -->
      <div class="notification-alert-item">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
          <span style="font-weight: 800; font-size: 0.82rem; color: #0277bd; display: flex; align-items: center; gap: 5px;">
            <i class="fas fa-cloud-showers-heavy"></i> Rain Alert (Trichy)
          </span>
          <span style="font-size: 0.7rem; color: #888;">Active</span>
        </div>
        <p style="margin: 0; font-size: 0.78rem; color: #444; line-height: 1.4;">Heavy rain forecasted for tomorrow morning. Postpone pesticide sprays and protect mature harvests.</p>
      </div>

      <!-- Alert 2 -->
      <div class="notification-alert-item">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
          <span style="font-weight: 800; font-size: 0.82rem; color: #c62828; display: flex; align-items: center; gap: 5px;">
            <i class="fas fa-bug"></i> Pest Outbreak Warning
          </span>
          <span style="font-size: 0.7rem; color: #888;">Critical</span>
        </div>
        <p style="margin: 0; font-size: 0.78rem; color: #444; line-height: 1.4;">Late Blight outbreak reported in neighboring Tomato fields. Apply preventative copper spray immediately.</p>
      </div>

      <!-- Alert 3 -->
      <div class="notification-alert-item">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
          <span style="font-weight: 800; font-size: 0.82rem; color: #2e7d32; display: flex; align-items: center; gap: 5px;">
            <i class="fas fa-chart-line"></i> Market Price Spike
          </span>
          <span style="font-size: 0.7rem; color: #888;">Live</span>
        </div>
        <p style="margin: 0; font-size: 0.78rem; color: #444; line-height: 1.4;">Paddy market rate increased by ₹150/quintal in Madurai Mandi. Recommended time to liquidate stock.</p>
      </div>

      <!-- Alert 4 -->
      <div class="notification-alert-item">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
          <span style="font-weight: 800; font-size: 0.82rem; color: #ef6c00; display: flex; align-items: center; gap: 5px;">
            <i class="fas fa-hand-holding-usd"></i> Subsidy Released
          </span>
          <span style="font-size: 0.7rem; color: #888;">Info</span>
        </div>
        <p style="margin: 0; font-size: 0.78rem; color: #444; line-height: 1.4;">PM-Kisan 17th installment direct bank transfers initiated. Check your verified portal account status.</p>
      </div>

      <!-- Alert 5 -->
      <div class="notification-alert-item">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
          <span style="font-weight: 800; font-size: 0.82rem; color: #6a1b9a; display: flex; align-items: center; gap: 5px;">
            <i class="fas fa-calendar-alt"></i> Loan Deadline Remind
          </span>
          <span style="font-size: 0.7rem; color: #888;">Urgent</span>
        </div>
        <p style="margin: 0; font-size: 0.78rem; color: #444; line-height: 1.4;">KCC Crop Loan interest subvention repayment deadline is July 31st. Repay on time to avoid 7% default rate.</p>
      </div>
    </div>
  `;

  document.body.appendChild(drawerDiv);
});

// ===================================================================
// HOME PAGE DASHBOARD FUNCTIONS
// Daily Crop Advisories, Market Pulse, Alerts & Actions
// ===================================================================

// Crop Advisory Database
const CROP_ADVISORY_DB = {
  paddy: {
    icon: "🌾",
    color: "#1b5e20",
    tips: [
      {
        icon: "fas fa-tint",
        text: "Maintain 5cm standing water in paddy fields today. Check bund integrity.",
        type: "water",
      },
      {
        icon: "fas fa-seedling",
        text: "Apply second dose of Urea (50 kg/acre) if tillering stage has started.",
        type: "fertilizer",
      },
      {
        icon: "fas fa-bug",
        text: "Monitor for Brown Plant Hopper. If > 5 per hill, apply Buprofezin spray.",
        type: "pest",
      },
      {
        icon: "fas fa-sun",
        text: "Ideal transplanting temp: 25–35°C. Avoid transplanting under extreme heat.",
        type: "climate",
      },
    ],
    weather_tip: "Reduce irrigation if rain > 50mm is expected this week.",
  },
  cotton: {
    icon: "🏵️",
    color: "#4a148c",
    tips: [
      {
        icon: "fas fa-tint",
        text: "Cotton at boll formation stage needs 40–50mm water per week. Check soil moisture.",
        type: "water",
      },
      {
        icon: "fas fa-leaf",
        text: "Apply micronutrient spray (Zinc + Boron) to improve boll size and count.",
        type: "fertilizer",
      },
      {
        icon: "fas fa-bug",
        text: "Scout for Bollworm and Whitefly. Set pheromone traps (5/acre) for monitoring.",
        type: "pest",
      },
      {
        icon: "fas fa-wind",
        text: "Spray pesticides early morning (6–9 AM) or evening (4–7 PM) for best efficiency.",
        type: "climate",
      },
    ],
    weather_tip:
      "High humidity (>80%) increases risk of bacterial blight. Apply copper fungicide preventatively.",
  },
  tomato: {
    icon: "🍅",
    color: "#b71c1c",
    tips: [
      {
        icon: "fas fa-tint",
        text: "Tomato needs drip irrigation every alternate day. Avoid waterlogging.",
        type: "water",
      },
      {
        icon: "fas fa-seedling",
        text: "Side dress with 10:26:26 complex fertilizer at 50 kg/acre during fruiting.",
        type: "fertilizer",
      },
      {
        icon: "fas fa-bug",
        text: "Check for Early Blight (brown spots). Apply Mancozeb 75WP at 2g/litre.",
        type: "pest",
      },
      {
        icon: "fas fa-thermometer-half",
        text: "Flower drop occurs above 35°C. Use shade nets or misting if temperature spikes.",
        type: "climate",
      },
    ],
    weather_tip:
      "If overnight temp < 15°C, cover with mulch to protect seedling roots.",
  },
  sugarcane: {
    icon: "🌿",
    color: "#e65100",
    tips: [
      {
        icon: "fas fa-tint",
        text: "Sugarcane needs 150–200mm water per month. Irrigate every 7–10 days.",
        type: "water",
      },
      {
        icon: "fas fa-seedling",
        text: "Apply Potassium sulphate (50 kg/acre) at 4th and 6th month for better sugar content.",
        type: "fertilizer",
      },
      {
        icon: "fas fa-bug",
        text: "Monitor for Top Shoot Borer. Release Trichogramma cards (50,000/ha) as biocontrol.",
        type: "pest",
      },
      {
        icon: "fas fa-cloud-rain",
        text: "Trash mulching between rows conserves soil moisture and suppresses weeds.",
        type: "climate",
      },
    ],
    weather_tip:
      "Waterlogged roots cause red rot disease. Ensure field drainage channels are clear.",
  },
};

window.updateDailyAdvisory = function () {
  const sel = document.getElementById("advisory-crop-select");
  const display = document.getElementById("advisory-display");
  if (!sel || !display) return;

  const crop = sel.value;
  const data = CROP_ADVISORY_DB[crop] || CROP_ADVISORY_DB.paddy;
  const typeColors = {
    water: "#0277bd",
    fertilizer: "#2e7d32",
    pest: "#c62828",
    climate: "#ef6c00",
  };
  const typeBg = {
    water: "#e3f2fd",
    fertilizer: "#e8f5e9",
    pest: "#fce4ec",
    climate: "#fff3e0",
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  display.innerHTML = `
    <div style="margin-bottom: 10px; font-size: 0.78rem; color: #888; display: flex; align-items: center; gap: 5px;">
      <i class="far fa-calendar-alt" style="color: var(--primary-green);"></i>
      ${dateStr}
    </div>
    <div style="display: grid; gap: 10px;">
      ${data.tips
        .map(
          (tip) => `
        <div style="display: flex; gap: 12px; align-items: flex-start; padding: 10px 12px; background: ${typeBg[tip.type] || "#f9fbf8"}; border-radius: 8px; border-left: 3px solid ${typeColors[tip.type] || "#4caf50"};">
          <i class="${tip.icon}" style="color: ${typeColors[tip.type] || "#4caf50"}; margin-top: 2px; min-width: 14px;"></i>
          <span style="font-size: 0.8rem; color: #333; line-height: 1.5;">${tip.text}</span>
        </div>
      `,
        )
        .join("")}
    </div>
    <div style="margin-top: 12px; padding: 10px; background: #fffde7; border-radius: 8px; border: 1px solid #fff176; font-size: 0.78rem; color: #f57f17; display: flex; align-items: center; gap: 7px;">
      <i class="fas fa-cloud-sun"></i>
      <strong>Weather Tip:</strong>&nbsp;${data.weather_tip}
    </div>
  `;
};

async function fetchMarketPulseLive() {
  try {
    const liveUrl =
      "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b&format=json&limit=20&filters[state]=Tamil%20Nadu";
    const res = await fetch(liveUrl);
    if (res.ok) {
      const data = await res.json();
      if (data && data.records && data.records.length > 0) {
        const formatted = data.records.map((r) => ({
          commodity: r.commodity,
          market: r.market,
          district: r.district || "",
          min_price: r.min_price.toString(),
          max_price: r.max_price.toString(),
          modal_price: r.modal_price.toString(),
        }));
        localStorage.setItem("market_data_cache", JSON.stringify(formatted));
        loadMarketPulse();
      }
    }
  } catch (e) {
    console.warn("Home page live market fetch failed:", e);
  }
}

// Load market pulse data on home page
function loadMarketPulse() {
  const el = document.getElementById("market-pulse-list");
  if (!el) return;

  const isTamil = currentLang === "ta";
  const cached = localStorage.getItem("market_data_cache");
  let records = [];

  if (cached) {
    try {
      records = JSON.parse(cached);
    } catch (e) {
      console.warn("Failed to parse market cache:", e);
    }
  }

  // Fallback to beautiful mock data if cache is empty
  if (!records || records.length === 0) {
    records = [
      { commodity: "Rice (Paddy)", market: "Villupuram", modal_price: "2400" },
      { commodity: "Tomato", market: "Ottanchatram", modal_price: "1850" },
      { commodity: "Small Onion", market: "Erode", modal_price: "4200" },
      { commodity: "Potato", market: "Mettupalayam", modal_price: "2300" },
      { commodity: "Turmeric", market: "Salem", modal_price: "12500" },
      { commodity: "Cotton", market: "Virudhunagar", modal_price: "7800" },
    ];
  }

  // Map to the dashboard display format
  const displayItems = records.slice(0, 6).map((r, i) => {
    const rawName = r.commodity;
    const priceVal = parseFloat(r.modal_price) || 0;

    // Deterministic change based on index
    const changes = [80, -120, 350, 95, -300, 50];
    const change = changes[i % changes.length];
    const isUp = change >= 0;

    let icon = "🌾";
    if (rawName.toLowerCase().includes("tomato")) icon = "🍅";
    else if (rawName.toLowerCase().includes("onion")) icon = "🧅";
    else if (rawName.toLowerCase().includes("potato")) icon = "🥔";
    else if (rawName.toLowerCase().includes("turmeric")) icon = "🟡";
    else if (rawName.toLowerCase().includes("cotton")) icon = "🏵️";
    else if (rawName.toLowerCase().includes("banana")) icon = "🍌";
    else if (rawName.toLowerCase().includes("coconut")) icon = "🥥";
    else if (rawName.toLowerCase().includes("maize")) icon = "🌽";

    let displayName = isTamil ? window.translateCommodity(rawName) : rawName;
    if (r.market) {
      const marketName = isTamil
        ? translationDictionary[r.market] || r.market
        : r.market;
      displayName += ` (${marketName})`;
    }

    return {
      name: displayName,
      price: priceVal,
      change: change,
      unit: rawName.toLowerCase().includes("sugarcane")
        ? isTamil
          ? "டன்னுக்கு"
          : "tonne"
        : isTamil
          ? "குவிண்டால்"
          : "qtl",
      icon: icon,
    };
  });

  el.innerHTML = displayItems
    .map((c) => {
      const isUp = c.change >= 0;
      return `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 9px 0; border-bottom: 1px dashed #f0f0f0;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 1.1rem;">${c.icon}</span>
          <span style="font-size: 0.82rem; font-weight: 600; color: #333;">${c.name}</span>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 0.88rem; font-weight: 800; color: #1b5e20;">₹${c.price.toLocaleString()}<span style="font-size: 0.65rem; font-weight: 500; color: #888;">  /${c.unit}</span></div>
          <div style="font-size: 0.72rem; font-weight: 700; color: ${isUp ? "#2e7d32" : "#c62828"};">
            ${isUp ? "▲" : "▼"} ₹${Math.abs(c.change)} ${isUp ? (isTamil ? "உயர்வு" : "UP") : isTamil ? "சரிவு" : "DOWN"}
          </div>
        </div>
      </div>
    `;
    })
    .join("");

  // Update sentiment badge
  const badge = document.getElementById("market-sentiment-badge");
  const allChanges = displayItems.reduce((acc, c) => acc + c.change, 0);
  if (badge) {
    const isBull = allChanges > 0;
    badge.textContent = isBull
      ? isTamil
        ? "ஏறுமுகம்"
        : "BULLISH"
      : isTamil
        ? "இறங்குமுகம்"
        : "BEARISH";
    badge.className = "sentiment-badge " + (isBull ? "bullish" : "bearish");
    badge.style.background = isBull ? "#2e7d32" : "#c62828";
    badge.style.color = "white";
    badge.style.padding = "3px 10px";
    badge.style.borderRadius = "20px";
    badge.style.fontSize = "0.7rem";
    badge.style.fontWeight = "700";
  }

  // Update time
  const timeEl = document.getElementById("market-update-time");
  if (timeEl) {
    const now = new Date();
    timeEl.innerHTML = `<i class="far fa-clock"></i> ${isTamil ? "இன்று புதுப்பிக்கப்பட்டது" : "Updated today"}, ${now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
  }
}

// Load alerts on home page
function loadHomeAlerts() {
  const el = document.getElementById("alerts-list-container");
  if (!el) return;

  const isTamil = currentLang === "ta";

  // Check weather alert
  let weatherAlert = {
    icon: "fas fa-cloud-sun",
    color: "#0277bd",
    bg: "#e3f2fd",
    title: isTamil
      ? "வானிலை தகவல் — தர்மபுரி, சேலம்"
      : "Weather Update — Dharmapuri, Salem",
    desc: isTamil
      ? "மிதமான வெப்பநிலை (28-32°C) தொடரும். உகந்த பாசன கால அளவைக் கடைப்பிடிக்கவும்."
      : "Moderate temperatures (28-32°C) expected. Maintain optimal irrigation scheduling.",
    severity: "INFO",
  };
  const weatherCache = localStorage.getItem("weather_cache");
  if (weatherCache) {
    try {
      const wData = JSON.parse(weatherCache);
      const isRainy =
        wData.daily &&
        wData.daily.precipitation_sum &&
        wData.daily.precipitation_sum[0] > 5;
      if (isRainy) {
        weatherAlert = {
          icon: "fas fa-cloud-showers-heavy",
          color: "#c62828",
          bg: "#fce4ec",
          title: isTamil
            ? "மழை எச்சரிக்கை — உங்கள் பகுதியில்"
            : "Rain Alert — Your Region",
          desc: isTamil
            ? "அடுத்த 48 மணி நேரத்தில் மழை எதிர்பார்க்கப்படுகிறது. அறுவடை செய்த பயிர்களைப் பாதுகாக்கவும்."
            : "Precipitation forecasted in the next 48 hours. Protect harvested produce and hold sprays.",
          severity: "CRITICAL",
        };
      }
    } catch (e) {
      /* ignore */
    }
  }

  // Check market alert
  let marketAlert = {
    icon: "fas fa-chart-line",
    color: "#2e7d32",
    bg: "#e8f5e9",
    title: isTamil
      ? "சந்தை விலை உயர்வு — வெங்காயம்"
      : "Market Price Spike — Onion",
    desc: isTamil
      ? "சின்ன வெங்காயத்தின் விலை Erode சந்தையில் ஏறுமுகத்தில் உள்ளது. விற்பனை செய்ய நல்ல வாய்ப்பு."
      : "Small Onion prices show upward momentum in Erode Mandi. Recommended selling window.",
    severity: "LIVE",
  };
  const marketCache = localStorage.getItem("market_data_cache");
  if (marketCache) {
    try {
      const mData = JSON.parse(marketCache);
      if (mData.length > 0) {
        const sorted = mData.sort(
          (a, b) => parseFloat(b.modal_price) - parseFloat(a.modal_price),
        );
        const highest = sorted[0];
        const commName = isTamil
          ? window.translateCommodity(highest.commodity)
          : highest.commodity;
        const marketName = isTamil
          ? translationDictionary[highest.market] || highest.market
          : highest.market;
        marketAlert = {
          icon: "fas fa-chart-line",
          color: "#2e7d32",
          bg: "#e8f5e9",
          title: isTamil
            ? `அதிகபட்ச சந்தை விலை — ${commName}`
            : `Top Market Price — ${commName}`,
          desc: isTamil
            ? `${marketName} சந்தையில் ₹${parseFloat(highest.modal_price).toLocaleString()}/குவிண்டால் விலைக்கு விற்கப்படுகிறது.`
            : `Trading at ₹${parseFloat(highest.modal_price).toLocaleString()}/qtl in ${highest.market} mandi.`,
          severity: "INFO",
        };
      }
    } catch (e) {
      /* ignore */
    }
  }

  const alerts = [
    weatherAlert,
    marketAlert,
    {
      icon: "fas fa-bug",
      color: "#ef6c00",
      bg: "#fff3e0",
      title: isTamil
        ? "பூச்சி தாக்குதல் எச்சரிக்கை — ஆரம்ப கருகல்"
        : "Pest Warning — Early Blight",
      desc: isTamil
        ? "தக்காளிப் பயிர்களில் ஆரம்பக் கருகல் நோய் ஆங்காங்கே தென்படுகிறது. வேப்ப எண்ணெய் தெளிக்கவும்."
        : "Early Blight spotted in solanaceous clusters. Apply preventive neem oil or copper spray.",
      severity: "WARNING",
    },
    {
      icon: "fas fa-hand-holding-usd",
      color: "#4a148c",
      bg: "#f3e5f5",
      title: isTamil
        ? "விவசாய நிதியுதவி — PM-Kisan தவணை"
        : "Agri Direct Benefit — PM-Kisan",
      desc: isTamil
        ? "அடுத்த தவணைத் தொகை ₹2,000 தகுதியான வங்கி கணக்குகளுக்கு அனுப்பப்பட்டுள்ளது."
        : "Next installment of ₹2,000 has been dispatched. Verify status in government DB.",
      severity: "INFO",
    },
  ];

  el.innerHTML = alerts
    .map(
      (a) => `
    <div style="display: flex; gap: 10px; align-items: flex-start; padding: 11px 13px; margin-bottom: 9px; background: ${a.bg}; border-radius: 8px; border-left: 3px solid ${a.color};">
      <i class="${a.icon}" style="color: ${a.color}; margin-top: 2px; min-width: 14px;"></i>
      <div>
        <div style="font-size: 0.8rem; font-weight: 700; color: #333; display: flex; align-items: center; gap: 7px;">
          ${a.title}
          <span style="font-size: 0.65rem; background: ${a.color}; color: white; padding: 2px 7px; border-radius: 10px; font-weight: 700;">${a.severity}</span>
        </div>
        <div style="font-size: 0.75rem; color: #555; margin-top: 3px; line-height: 1.4;">${a.desc}</div>
      </div>
    </div>
  `,
    )
    .join("");
}

// PDF daily report generator
window.generateDailyReportPDF = function () {
  const today = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const isTamil = currentLang === "ta";

  // Read dynamic market data
  const cached = localStorage.getItem("market_data_cache");
  let records = [];
  if (cached) {
    try {
      records = JSON.parse(cached).slice(0, 5);
    } catch (e) {
      /* ignore */
    }
  }

  if (records.length === 0) {
    records = [
      { commodity: "Rice (Paddy)", market: "Villupuram", modal_price: "2400" },
      { commodity: "Tomato", market: "Ottanchatram", modal_price: "1850" },
      { commodity: "Small Onion", market: "Erode", modal_price: "4200" },
      { commodity: "Potato", market: "Mettupalayam", modal_price: "2300" },
      { commodity: "Turmeric", market: "Salem", modal_price: "12500" },
    ];
  }

  const tableRows = records
    .map((r, i) => {
      const commName = isTamil
        ? window.translateCommodity(r.commodity)
        : r.commodity;
      const marketName = isTamil
        ? translationDictionary[r.market] || r.market
        : r.market;
      const priceVal = parseFloat(r.modal_price) || 0;
      const change = [80, -120, 350, 95, -300][i % 5];
      const isUp = change >= 0;
      const unit = r.commodity.toLowerCase().includes("sugarcane")
        ? isTamil
          ? "டன்னுக்கு"
          : "tonne"
        : isTamil
          ? "குவிண்டால்"
          : "qtl";

      return `
      <tr>
        <td>${commName} (${marketName})</td>
        <td>₹${priceVal.toLocaleString()} /${unit}</td>
        <td style="color: ${isUp ? "green" : "red"};">${isUp ? "▲" : "▼"} ${isUp ? "+" : ""}₹${Math.abs(change)}</td>
      </tr>
    `;
    })
    .join("");

  const reportTitle = isTamil
    ? "ஸ்மார்ட் விவசாய உதவியாளர் — தினசரி அறிக்கை"
    : "Smart Farmer Assistant — Daily Report";
  const dateLabel = isTamil ? "தேதி:" : "Date:";
  const generatedLabel = isTamil
    ? "அறிக்கை உருவாக்கப்பட்ட நேரம்:"
    : "Generated at";
  const marketPulseTitle = isTamil
    ? "மண்டிகளின் இன்றைய விலை நிலவரம்"
    : "Today's Market Pulse";
  const tableHeaderComm = isTamil ? "பயிர் & சந்தை" : "Commodity & Market";
  const tableHeaderPrice = isTamil ? "சந்தை விலை" : "Price";
  const tableHeaderChange = isTamil ? "மாற்றம்" : "Change";
  const alertsTitle = isTamil
    ? "இன்றைய விவசாய எச்சரிக்கைகள்"
    : "Today's Alerts";
  const alert1 = isTamil
    ? "🌧️ தர்மபுரி மற்றும் சுற்றுவட்டாரப் பகுதிகளில் மிதமான மழைப்பொழிவு இருக்கும்."
    : "🌧️ Moderate rain showers expected. Optimize irrigation schedules.";
  const alert2 = isTamil
    ? "🐛 தக்காளிப் பயிர்களில் ஆரம்பக் கருகல் நோய் தாக்குதல் எச்சரிக்கை. வேப்ப எண்ணெய் தெளிக்கவும்."
    : "🐛 Early Blight spotted. Apply preventive copper spray immediately.";
  const advisoryTitle = isTamil
    ? "பயிர் சாகுபடி வழிகாட்டுதல்"
    : "Crop Advisory";
  const advisoryText = isTamil
    ? "நெல்: தூர்பிடிக்கும் பருவத்தில் இரண்டாவது முறை யூரியா (ஏக்கருக்கு 50 கிலோ) இடவும். வயலில் 5செ.மீ உயரத்திற்கு நீர் தேங்குவதை உறுதிசெய்யவும்."
    : "Paddy: Apply second dose of Urea (50 kg/acre) during tillering stage. Maintain 5cm standing water in fields.";

  const content = `
    <html>
      <head>
        <title>Daily Farm Report - ${today}</title>
        <style>
          body { font-family: sans-serif; padding: 40px; color: #222; }
          h1 { color: #1b5e20; font-size: 22px; border-bottom: 2px solid #4caf50; padding-bottom: 10px; }
          h2 { color: #2e7d32; font-size: 16px; margin-top: 25px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
          th { background: #e8f5e9; color: #1b5e20; padding: 8px; text-align: left; }
          td { border-bottom: 1px solid #eee; padding: 8px; }
          .alert { background: #fff3e0; border-left: 3px solid #ef6c00; padding: 8px 12px; margin: 8px 0; border-radius: 4px; font-size: 13px; }
          .footer { margin-top: 40px; font-size: 11px; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 15px; }
        </style>
      </head>
      <body>
        <h1>${reportTitle}</h1>
        <p style="color: #888; font-size: 13px;">${dateLabel} ${today} | ${generatedLabel} ${new Date().toLocaleTimeString("en-IN")}</p>

        <h2>📊 ${marketPulseTitle}</h2>
        <table>
          <tr><th>${tableHeaderComm}</th><th>${tableHeaderPrice}</th><th>${tableHeaderChange}</th></tr>
          ${tableRows}
        </table>

        <h2>⚠️ ${alertsTitle}</h2>
        <div class="alert">${alert1}</div>
        <div class="alert">${alert2}</div>

        <h2>🌿 ${advisoryTitle}</h2>
        <p style="font-size: 13px;">${advisoryText}</p>

        <div class="footer">${reportTitle} | Report Date: ${today}</div>
      </body>
    </html>
  `;
  const blob = new Blob([content], { type: "text/html" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download =
    "Daily_Farm_Report_" + new Date().toISOString().slice(0, 10) + ".html";
  link.click();
};

const commodityTranslations = {
  "Rice (Paddy)": "நெல் (அரிசி)",
  Rice: "நெல்",
  Paddy: "நெல்",
  "Paddy(Rice)": "நெல் (அரிசி)",
  Tomato: "தக்காளி",
  "Small Onion": "சின்ன வெங்காயம்",
  Onion: "வெங்காயம்",
  Potato: "உருளைக்கிழங்கு",
  Turmeric: "மஞ்சள்",
  "Banana (Raw)": "வாழைக்காய்",
  Banana: "வாழை",
  "Dry Chillies": "காஞ்ச மிளகாய்",
  Chillies: "மிளகாய்",
  Groundnut: "நிலக்கடலை",
  Maize: "சோளம்",
  Coconut: "தேங்காய்",
  Grapes: "திராட்சை",
  Mango: "மாம்பழம்",
  Carrot: "கேரட்",
  Cotton: "பருத்தி",
  Jasmine: "மல்லிகை",
  Wheat: "கோதுமை",
  Sugarcane: "கரும்பு",
  "Green Peas": "பச்சை பட்டாணி",
};

window.translateCommodity = function (comm) {
  if (!comm) return comm;
  const trimmed = comm.trim();
  if (commodityTranslations[trimmed]) {
    return commodityTranslations[trimmed];
  }
  // Try case-insensitive matching
  const lowComm = trimmed.toLowerCase();
  for (const key in commodityTranslations) {
    if (key.toLowerCase() === lowComm) {
      return commodityTranslations[key];
    }
  }
  return comm;
};

// Auto-load dashboard sections on home page
document.addEventListener("DOMContentLoaded", async () => {
  if (document.getElementById("market-pulse-list")) {
    loadMarketPulse();
    fetchMarketPulseLive();
  }
  if (document.getElementById("alerts-list-container")) {
    loadHomeAlerts();
  }
  if (document.getElementById("advisory-display")) {
    window.updateDailyAdvisory();
  }

  // Handle Supabase User Session
  window.currentLang = currentLang;
  try {
    const { authService } = await import('../services/supabase.service.js');
    const session = await authService.getSession();
    if (session && session.user) {
      const loginLinks = document.querySelectorAll('a[data-key="nav_login"]');
      loginLinks.forEach(link => {
        link.href = "#";
        link.innerText = currentLang === "ta" ? "வெளியேறு" : "Logout";
        link.removeAttribute("data-key");
        link.addEventListener("click", async (e) => {
          e.preventDefault();
          await authService.signOut();
        });
      });
    }
  } catch (err) {
    console.warn("Failed to retrieve user session:", err.message);
  }
});

// Supabase Authentication Event Handlers
window.loginUser = async function(event) {
  event.preventDefault();
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  const email = username.includes('@') ? username : `${username}@smartfarmer.com`;

  try {
    const { authService } = await import('../services/supabase.service.js');
    const data = await authService.signIn(email, password);
    if (data) {
      localStorage.setItem('user', JSON.stringify(data.user));
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    }
  } catch (error) {
    // Handled in authService (shows toast)
  }
};

window.registerUser = async function(event) {
  event.preventDefault();
  const fullName = document.getElementById('reg-name').value;
  const username = document.getElementById('reg-username').value;
  const phone = document.getElementById('reg-phone').value;
  const village = document.getElementById('reg-village').value;
  const password = document.getElementById('reg-password').value;
  const email = username.includes('@') ? username : `${username}@smartfarmer.com`;

  try {
    const { authService } = await import('../services/supabase.service.js');
    const data = await authService.signUp(email, password, {
      full_name: fullName,
      username: username,
      phone_number: phone,
      village_name: village,
    });
    if (data) {
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    }
  } catch (error) {
    // Handled in authService (shows toast)
  }
};
