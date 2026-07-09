const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { spawn } = require("child_process");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config({ path: path.join(__dirname, "../../.env.local") });

const GROQ_API_KEY = process.env.GROQ_API_KEY;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize Gemini API client if key is available
let genAI;
if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log("Initialized Google Generative AI client.");
  } catch (e) {
    console.error(
      "Failed to initialize Google Generative AI client:",
      e.message,
    );
  }
}

async function runGeminiPrompt(prompt) {
  if (!genAI) {
    throw new Error("Gemini API client not initialized. Check GEMINI_API_KEY.");
  }
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text().trim();
}

async function runGroqPrompt(prompt) {
  if (!GROQ_API_KEY) {
    throw new Error("Groq API key not found in environment.");
  }
  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
    },
    {
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (response.data && response.data.choices && response.data.choices[0]) {
    return response.data.choices[0].message.content.trim();
  }
  throw new Error("Invalid response structure from Groq API.");
}

function getFreeAssistantReply(message, language) {
  const text = (message || "").toLowerCase().trim();
  const isTamil = language === "ta";

  // Greetings
  if (
    text === "hi" ||
    text === "hello" ||
    text === "hey" ||
    text.includes("வணக்கம்") ||
    text.includes("நலம்")
  ) {
    return isTamil
      ? "வணக்கம்! நான் உங்களின் ஸ்மார்ட் விவசாய உதவியாளர். பூச்சி நோய், வானிலை, சந்தை விலை, உரங்கள், பயிர் சாகுபடி பற்றி என்னிடம் கேட்கலாம். நான் உங்களுக்கு எவ்வாறு உதவ வேண்டும்?"
      : "Hello! I am your Smart Farmer Assistant. You can ask me about pests/diseases, weather, market prices, fertilizers, crop suggestions, or general farming tips. How can I help you today?";
  }

  // Gratitude
  if (
    text.includes("thank") ||
    text.includes("thanks") ||
    text.includes("நன்றி") ||
    text.includes("உதவி")
  ) {
    if (text.includes("நன்றி")) {
      return "உங்களுக்கு உதவியதில் மிக்க மகிழ்ச்சி! வேறு ஏதேனும் கேள்விகள் இருந்தால் கேளுங்கள். வாழ்க வளமுடன்!";
    }
    return "You are welcome! Happy to help. Let me know if you have any other questions. Happy farming!";
  }

  // Pest & Disease
  if (
    text.includes("pest") ||
    text.includes("disease") ||
    text.includes("insect") ||
    text.includes("fungus") ||
    text.includes("பூச்சி") ||
    text.includes("நோய்") ||
    text.includes("புழு")
  ) {
    return isTamil
      ? "பூச்சி அல்லது நோய் மேலாண்மைக்கு:\n1. பாதிக்கப்பட்ட செடி அல்லது இலைகளை உடனே அகற்றி அழிக்கவும்.\n2. வேப்ப எண்ணெய் கரைசல் (3%) அல்லது இஞ்சி-பூண்டு-மிளகாய் கரைசல் தெளிக்கவும்.\n3. உயிரியல் கட்டுப்பாட்டு முறைகளான டிரைக்கோடெர்மா விரிடி பயன்படுத்தவும்.\n4. கடுமையான பாதிப்புக்கு அருகிலுள்ள வேளாண் விரிவாக்க மையத்தை அணுகவும்."
      : "For Pest & Disease Management:\n1. Isolate and destroy affected plant parts immediately to prevent spreading.\n2. Spray Neem oil solution (3% concentration) or garlic-ginger-chilli extract as a natural repellent.\n3. Use biocontrol agents like Trichoderma viride or Pseudomonas fluorescens.\n4. For severe infestation, consult your local agricultural officer with a photo of the crop.";
  }

  // Weather / Rain
  if (
    text.includes("weather") ||
    text.includes("rain") ||
    text.includes("monsoon") ||
    text.includes("temperature") ||
    text.includes("வானிலை") ||
    text.includes("மழை") ||
    text.includes("புயல்")
  ) {
    return isTamil
      ? "மழைக்கால மேலாண்மை:\n1. உங்கள் வயலில் வடிகால் வசதியை சரிபார்த்து உபரி நீர் தேங்காமல் தடுக்கவும்.\n2. உரமிடுதல் மற்றும் பூச்சிக்கொல்லி தெளிப்பதை மழை நேரத்தில் தவிர்க்கவும்.\n3. அறுவடை செய்த தானியங்களை பாதுகாப்பான உலர்ந்த இடங்களில் சேமிக்கவும்."
      : "Weather & Irrigation Action Guide:\n1. Ensure proper drainage channels in your fields to prevent waterlogging during heavy rains.\n2. Avoid applying fertilizers or spraying pesticides when rain is forecasted within 24 hours.\n3. Move harvested produce to elevated, dry storage yards.";
  }

  // Market / Price
  if (
    text.includes("market") ||
    text.includes("price") ||
    text.includes("rate") ||
    text.includes("sell") ||
    text.includes("சந்தை") ||
    text.includes("விலை") ||
    text.includes("மதிப்பு") ||
    text.includes("விற்பனை")
  ) {
    return isTamil
      ? 'சந்தை விலை ஆலோசனை:\n1. சந்தை விலை தினமும் மாறுபடும். எங்களின் "சந்தை விலை" பக்கத்தில் தற்போதைய விலையை சரிபார்க்கவும்.\n2. இடைத்தரகர்களைத் தவிர்த்து உழவர் சந்தை அல்லது e-NAM (தேசிய வேளாண் சந்தை) மூலம் விற்க முயலுங்கள்.\n3. நல்ல விலை கிடைக்கும் வரை தானியங்களை உலர்த்தி கிடங்குகளில் சேமிக்கவும்.'
      : 'Market Price Strategy:\n1. Track local and regional market rates daily on our "Market Prices" page.\n2. Try selling directly through Uzhavar Sandhai or register on e-NAM (National Agriculture Market) to bypass middlemen.\n3. Dry your grains properly and consider warehouse storage if current prices are unfavorable.';
  }

  // Fertilizer & Soil
  if (
    text.includes("fertilizer") ||
    text.includes("soil") ||
    text.includes("manure") ||
    text.includes("urea") ||
    text.includes("உரம்") ||
    text.includes("மண்") ||
    text.includes("தழைச்சத்து")
  ) {
    return isTamil
      ? "மண் மற்றும் உர மேலாண்மை:\n1. 2 ஆண்டுகளுக்கு ஒருமுறை மண் பரிசோதனை செய்து மண் அட்டை (Soil Health Card) பெறுங்கள்.\n2. தொழு உரம், மண்புழு உரம் போன்ற கரிம உரங்களை அதிகம் பயன்படுத்தவும்.\n3. இரசாயன உரங்களை (N:P:K) பரிந்துரைக்கப்பட்ட அளவில் மட்டுமே இடவும்; அதிகப்படியான உரியா பயன்பாடு நோயை அதிகரிக்கும்."
      : "Soil & Fertilizer Best Practices:\n1. Get your soil tested every 2 years to obtain a Soil Health Card.\n2. Increase organic matter in soil by applying well-decomposed farmyard manure or vermicompost.\n3. Apply chemical NPK fertilizers in recommended doses. Excess nitrogen (Urea) makes crops soft and highly susceptible to pests.";
  }

  // Seeds / Crop Suggestions
  if (
    text.includes("crop") ||
    text.includes("seed") ||
    text.includes("suggest") ||
    text.includes("plant") ||
    text.includes("பயிர்") ||
    text.includes("விதை") ||
    text.includes("சாகுபடி") ||
    text.includes("நடவு")
  ) {
    return isTamil
      ? 'பயிர் சாகுபடி ஆலோசனை:\n1. உங்கள் பகுதி மண் வகை (கரிசல், செம்மண், களிமண்) மற்றும் நீர் ஆதாரத்திற்கு ஏற்ப பயிரைத் தேர்வு செய்யவும்.\n2. எங்கள் "பயிர் ஆலோசனை" பக்கத்தில் மண் மற்றும் பருவம் கொடுத்து சிறந்த பயிர்களை தேர்வு செய்யலாம்.\n3. தரமான சான்றளிக்கப்பட்ட விதைகளைப் பயன்படுத்தி விதை நேர்த்தி செய்த பின் விதைக்கவும்.'
      : 'Crop Selection Guidelines:\n1. Choose crops based on your soil type (clay, sandy, loamy) and water availability.\n2. Use our "Crop Suggestion" tool by entering soil type and season to get customized recommendations.\n3. Always use certified high-yield seeds and practice seed treatment before sowing.';
  }

  // Irrigation / Water
  if (
    text.includes("water") ||
    text.includes("irrigation") ||
    text.includes("drip") ||
    text.includes("நீர்") ||
    text.includes("பாசனம்") ||
    text.includes("சொட்டுநீர்")
  ) {
    return isTamil
      ? "நீர் மேலாண்மை:\n1. சொட்டு நீர் பாசனம் (Drip Irrigation) அல்லது தெளிப்பு நீர் பாசனம் மூலம் 50% வரை நீரைச் சேமிக்கலாம்.\n2. காலை அல்லது மாலை வேளையில் நீர்ப்பாசனம் செய்வதால் நீர் ஆவியாவது குறையும்.\n3. சொட்டு நீர் பாசனம் அமைக்க அரசு 100% வரை மானியம் வழங்குகிறது; விண்ணப்பிக்க வேளாண் துறையை அணுகவும்."
      : "Water & Irrigation Efficiency:\n1. Adopt Drip or Sprinkler Irrigation to save up to 50% water and increase yield.\n2. Irrigate during early morning or late evening to minimize water loss due to evaporation.\n3. Check state government schemes for micro-irrigation subsidies (up to 100% for small/marginal farmers).";
  }

  // Govt Schemes / Subsidies
  if (
    text.includes("scheme") ||
    text.includes("subsidy") ||
    text.includes("loan") ||
    text.includes("pm kisan") ||
    text.includes("திட்டம்") ||
    text.includes("மானியம்") ||
    text.includes("கடன்") ||
    text.includes("காப்பீடு")
  ) {
    return isTamil
      ? 'அரசு திட்டங்கள் தகவல்:\n1. PM-KISAN: தகுதியான விவசாயிகளுக்கு ஆண்டுக்கு ₹6,000 நிதியுதவி வழங்கப்படுகிறது.\n2. பயிர் காப்பீடு (PMFBY): இயற்கை பேரிடரால் ஏற்படும் இழப்புகளுக்கு காப்பீடு பெறலாம்.\n3. கூடுதல் விவரங்களுக்கு எங்களின் "அரசு திட்டங்கள்" பக்கத்தை பார்க்கவும்.'
      : 'Government Schemes & Subsidies:\n1. PM-KISAN: Eligible farmers receive ₹6,000 yearly in three installments.\n2. Crop Insurance (PMFBY): Protects against crop loss due to natural calamities like drought or floods.\n3. Check our dedicated "Govt Schemes" page for details and links to apply.';
  }

  // Default response
  return isTamil
    ? "மன்னிக்கவும், தங்களின் கேள்வி எனக்கு முழுமையாக புரியவில்லை. நீங்கள் பூச்சி நோய், வானிலை, சந்தை விலை, உரங்கள், சொட்டு நீர் பாசனம் அல்லது அரசு திட்டங்கள் பற்றி என்னிடம் கேட்கலாம்."
    : "I can help with your agricultural questions. Ask me about pests & diseases, weather, market prices, fertilizers, irrigation, crop selection, or government schemes.";
}

function getAiStatus() {
  const hasGroq = !!GROQ_API_KEY;
  const hasGemini = !!genAI;
  return {
    available: true,
    mode: hasGroq ? "groq" : hasGemini ? "gemini" : "local-ollama",
    message: hasGroq
      ? "Using the Groq API for intelligence."
      : hasGemini
        ? "Using the Gemini API for intelligence."
        : "Using the local free Ollama model.",
  };
}

function buildChatbotReply(message, language, aiReply) {
  if (aiReply) {
    return aiReply;
  }

  return getFreeAssistantReply(message, language);
}

function runOllamaPrompt(prompt) {
  return new Promise((resolve, reject) => {
    const child = spawn("ollama", ["run", "llama3:latest", prompt], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    let errorOutput = "";

    child.stdout.on("data", (data) => {
      output += data.toString();
    });

    child.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(errorOutput || "Ollama failed"));
        return;
      }
      resolve(output.trim());
    });
  });
}

// Market API Routes
const marketRoutes = require("./routes/market.routes");
app.use("/api", marketRoutes);



// AI Market Insights
app.post("/api/ai-insights", async (req, res) => {
  try {
    const { marketData } = req.body || {};
    const items = Array.isArray(marketData) ? marketData.slice(0, 15) : [];

    let sentiment = "Stable market with moderate demand.";
    let recommendations = ["Rice", "Tomato", "Onion"];

    if (items.length > 0) {
      try {
        const dataString = items
          .map(
            (item) =>
              `${item.commodity} in ${item.market} (${item.district}): Min: ₹${item.min_price}, Max: ₹${item.max_price}, Modal: ₹${item.modal_price}`,
          )
          .join("\n");

        const prompt = `You are an agricultural economist. Given the following recent market prices for various crops in Tamil Nadu, provide a concise 1-2 sentence market sentiment summary and list the top 3 recommended crops for farmers to sell or plant now to maximize profits.
Market Data:
${dataString}

Format your response exactly as a JSON object with keys "sentiment" and "recommendations" (which must be an array of 3 crop names). Do not include any markdown formatting like \`\`\`json or backticks.
Example Output:
{"sentiment": "Market shows rising demand for onions and turmeric due to lower arrivals, while paddy remains stable.", "recommendations": ["Onion", "Turmeric", "Tomato"]}`;

        let rawReply;
        let success = false;

        // 1. Try Groq
        if (GROQ_API_KEY) {
          try {
            console.log("Generating AI insights using Groq...");
            rawReply = await runGroqPrompt(prompt);
            success = true;
          } catch (groqError) {
            console.warn(
              "Groq insights failed, trying Gemini:",
              groqError.message,
            );
          }
        }

        // 2. Try Gemini
        if (!success && process.env.GEMINI_API_KEY) {
          try {
            console.log("Generating AI insights using Gemini...");
            rawReply = await runGeminiPrompt(prompt);
            success = true;
          } catch (geminiError) {
            console.warn("Gemini insights failed:", geminiError.message);
          }
        }

        if (success && rawReply) {
          const cleanJsonStr = rawReply
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();
          const parsed = JSON.parse(cleanJsonStr);
          if (parsed.sentiment && Array.isArray(parsed.recommendations)) {
            sentiment = parsed.sentiment;
            recommendations = parsed.recommendations;
          }
        }
      } catch (e) {
        console.warn(
          "AI insights processing failed, using fallback:",
          e.message,
        );
      }
    }

    res.json({
      sentiment,
      recommendations,
    });
  } catch (error) {
    console.error("Error generating AI insights:", error.message);
    res.status(500).json({ error: "Failed to generate AI insights" });
  }
});

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

// Chatbot Endpoint
app.post("/api/chatbot", async (req, res) => {
  try {
    const { message, language } = req.body || {};
    const systemPrompt = buildAgriSystemPrompt(language || "en");
    const prompt = `${systemPrompt}\n\nUser Question: ${message}`;

    // 1. Try Groq
    try {
      if (GROQ_API_KEY) {
        console.log("Using Groq for chatbot response...");
        const groqReply = await runGroqPrompt(prompt);
        if (groqReply) {
          return res.json({ reply: groqReply });
        }
      }
    } catch (groqError) {
      console.warn("Groq chatbot failed, trying Gemini:", groqError.message);
    }

    // 2. Try Gemini
    try {
      if (process.env.GEMINI_API_KEY) {
        console.log("Using Gemini for chatbot response...");
        const geminiReply = await runGeminiPrompt(prompt);
        if (geminiReply) {
          return res.json({ reply: geminiReply });
        }
      }
    } catch (geminiError) {
      console.warn("Gemini chatbot failed:", geminiError.message);
    }

    // 2. Try Ollama (Local)
    try {
      console.log("Using Ollama fallback...");
      const aiReply = await runOllamaPrompt(prompt);
      return res.json({
        reply: aiReply || buildChatbotReply(message, language, null),
      });
    } catch (ollamaError) {
      console.warn("Ollama fallback failed:", ollamaError.message);
      // 3. Rule-based fallback
      return res.json({ reply: buildChatbotReply(message, language, null) });
    }
  } catch (error) {
    console.error("Error in chatbot:", error.message);
    res.status(500).json({
      reply: buildChatbotReply(
        req.body?.message || "",
        req.body?.language || "en",
        null,
      ),
    });
  }
});


if (require.main === module) {
  const { seedDatabase } = require("./repositories/seedData");
  try {
    seedDatabase();
  } catch (err) {
    console.error("Database seeding failed:", err.message);
  }
  const { startSyncCron } = require("./cron/marketSync");
  app.listen(PORT, () => {
    console.log(getAiStatus().message);
    console.log(`Server running on http://localhost:${PORT}`);
    startSyncCron();
  });
}

module.exports = { app, getAiStatus, buildChatbotReply };
