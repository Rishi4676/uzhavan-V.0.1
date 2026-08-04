import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// Serve static frontend files
app.use(express.static(__dirname));

// RSS Feed endpoint for live agricultural news
app.get('/api/news', async (req, res) => {
  try {
    const rssUrl = 'https://khetigaadi.com/blog/category/agriculture/feed';
    const feedRes = await fetch(rssUrl);
    if (!feedRes.ok) {
      throw new Error(`Failed to fetch RSS feed: ${feedRes.status}`);
    }
    const xmlText = await feedRes.text();
    
    // Parse RSS using regular expressions to keep dependencies minimal and installation fast
    const items = [];
    const matches = xmlText.matchAll(/<item>([\s\S]*?)<\/item>/g);
    
    for (const match of matches) {
      const content = match[1];
      const titleMatch = content.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/);
      const linkMatch = content.match(/<link>([\s\S]*?)<\/link>/);
      const pubDateMatch = content.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      const descMatch = content.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/);
      
      let dateString = '';
      if (pubDateMatch) {
        try {
          const dateObj = new Date(pubDateMatch[1].trim());
          dateString = dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        } catch (e) {
          dateString = pubDateMatch[1].trim();
        }
      }

      items.push({
        title: titleMatch ? titleMatch[1].trim() : 'Farming Update',
        link: linkMatch ? linkMatch[1].trim() : '#',
        pubDate: dateString,
        description: descMatch 
          ? descMatch[1].replace(/<[^>]*>/g, '').trim().substring(0, 180) + '...' 
          : 'Click read more to view full details about this farming update.'
      });
    }

    res.json(items.slice(0, 10)); // Return top 10 news items
  } catch (error) {
    console.error('Error fetching live news:', error);
    res.status(500).json({ error: 'Failed to fetch live news' });
  }
});

// AI Pest & Disease Detection Endpoint
app.post('/api/detect-pest', async (req, res) => {
  try {
    const { image, mimeType } = req.body || {};
    if (!image || !mimeType) {
      return res.status(400).json({ error: 'Missing image or mimeType in request body' });
    }

    const systemPrompt = `You are a professional agricultural plant pathologist and AI crop disease detector.
Analyze the provided crop leaf or plant image, detect the pest, disease, or nutrient deficiency, and return a JSON object with the diagnosis and recommendations.
The JSON object MUST follow this exact schema:
{
  "disease": "Disease Name in English (e.g., Rice Blast (Fungal))",
  "taDisease": "Disease Name in Tamil (e.g., நெல் குலை நோய் (பூஞ்சை))",
  "confidence": "Confidence percentage (e.g., 95.8%)",
  "symptoms": ["Symptom 1 in English", "Symptom 2 in English", "Symptom 3 in English"],
  "taSymptoms": ["Symptom 1 in Tamil", "Symptom 2 in Tamil", "Symptom 3 in Tamil"],
  "chemical": "Specific chemical pesticide/fungicide recommendation with percentage (e.g., Tricyclazole 75% WP)",
  "organic": "Specific organic control method (e.g., Pseudomonas fluorescens or Neem oil spray)",
  "dosage": "Dosage description in English (e.g., 1.5 g per Liter of water)",
  "taDosage": "Dosage description in Tamil (e.g., 1.5 கிராம் / லிட்டர் தண்ணீர்)",
  "dosageValue": 1.5, // numeric value only, represent dosage per Liter
  "isGram": true, // true if measured in grams/kg, false if measured in ml/L
  "chemCostAcre": 650, // estimated cost in INR per acre (number only, e.g., 500-1500)
  "orgCostAcre": 350, // estimated cost in INR per acre (number only, e.g., 200-800)
  "sporeRisk": "HIGH", // MUST be "HIGH", "MEDIUM", or "LOW" based on disease spread speed
  "sporeDesc": "Description in English explaining the transmission/spore risk under high humidity or normal weather.",
  "taSporeDesc": "Description in Tamil explaining transmission/spore risk.",
  "instructions": ["Step 1 to apply in English", "Step 2 in English", "Step 3 in English"],
  "taInstructions": ["Step 1 in Tamil", "Step 2 in Tamil", "Step 3 in Tamil"],
  "duration": "Recovery duration in English (e.g., 10 - 14 days)",
  "taDuration": "Recovery duration in Tamil (e.g., 10 - 14 நாட்கள்)",
  "prevention": ["Prevention tip 1 in English", "Prevention tip 2 in English"],
  "taPrevention": ["Prevention tip 1 in Tamil", "Prevention tip 2 in Tamil"]
}

Guidelines:
1. Be highly accurate. If the image is not a plant, crop, or leaf, identify the disease as "Non-crop Image / Healthy" and provide a warning/explanation in the symptoms and instructions.
2. Provide realistic, scientifically accurate chemical and organic recommendations common in Indian agriculture (e.g., Carbendazim, Mancozeb, Neem oil, Trichoderma viride).
3. The response MUST be ONLY a JSON object and nothing else. Do not wrap it in markdown code blocks. Just output the raw JSON.`;

    // Initialize Gemini client dynamically
    let genAI;
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        genAI = new GoogleGenerativeAI(geminiKey);
      } catch (err) {
        console.error("Gemini initialization failed in server.js:", err.message);
      }
    }

    // 1. Try Gemini
    if (genAI) {
      try {
        console.log("Using Gemini for Pest & Disease detection (server.js)...");
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          generationConfig: { responseMimeType: "application/json" }
        });
        const result = await model.generateContent([
          systemPrompt,
          {
            inlineData: {
              data: image,
              mimeType: mimeType
            }
          }
        ]);
        const text = result.response.text();
        const parsed = safeParseJSON(text);
        return res.json(parsed);
      } catch (geminiErr) {
        console.warn("Gemini pest detection failed (server.js), trying Groq:", geminiErr.message);
      }
    }

    // 2. Try Groq Vision Fallback
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
      try {
        console.log("Using Groq Vision for Pest & Disease detection (server.js)...");
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${groqKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.2-11b-vision-preview",
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: systemPrompt },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:${mimeType};base64,${image}`
                    }
                  }
                ]
              }
            ],
            temperature: 0.2,
            response_format: { type: "json_object" }
          })
        });

        if (response.ok) {
          const resJson = await response.json();
          const text = resJson.choices[0].message.content;
          const parsed = safeParseJSON(text);
          return res.json(parsed);
        } else {
          const errText = await response.text();
          throw new Error(`Groq API responded with status ${response.status}: ${errText}`);
        }
      } catch (groqErr) {
        console.warn("Groq vision pest detection failed (server.js), using mock database:", groqErr.message);
      }
    }

    // 3. Fallback to mock database
    console.log("Using local database fallback for Pest & Disease detection (server.js)...");
    const fallbackReport = {
      disease: "Aphid & Sucking Pest Infestation (Foliage)",
      taDisease: "இலைப்பேன்கள் மற்றும் உறிஞ்சும் பூச்சிகள் (உள்ளூர்)",
      confidence: "88.0% (Offline Fallback)",
      symptoms: [
        "Clusters of tiny green/black soft-bodied insects on leaf undersides",
        "Curling, crinkling, and yellowing of terminal leaves",
        "Sticky residue (honeydew) attracting ants and black mold"
      ],
      taSymptoms: [
        "இலைகளின் அடிப்பகுதியில் சிறிய பச்சை/கருப்பு பூச்சிகள் குவிந்திருத்தல்",
        "இலைகள் சுருண்டு, மஞ்சள் நிறமாக மாறுதல்",
        "செடியின் மேல் பிசுபிசுப்பான திரவம் காணப்படுதல்"
      ],
      chemical: "Imidacloprid 17.8% SL",
      organic: "Neem oil spray (3% concentration)",
      dosage: "0.3 ml per Liter of water",
      taDosage: "0.3 மி.லி / லிட்டர் தண்ணீர்",
      dosageValue: 0.3,
      isGram: false,
      chemCostAcre: 450,
      orgCostAcre: 250,
      sporeRisk: "LOW",
      sporeDesc: "Low direct spore risk. Sucking pests colonize adjacent foliage progressively.",
      taSporeDesc: "பூச்சிகள் காற்று வழியாக பரவக்கூடியவை, எனினும் வித்துக்கள் போல் காற்றில் எளிதாக பறக்காது.",
      instructions: [
        "Spray targeting the undersides of leaves thoroughly.",
        "Apply Neem oil during low sunlight hours to avoid leaf burn.",
        "Repeat spray after 7 days if pests are still active."
      ],
      taInstructions: [
        "இலைகளின் கீழ் பகுதி நனையுமாறு நன்றாகத் தெளிக்கவும்",
        "தாக்கம் குறைந்தவுடன் தெளிப்பதை நிறுத்தவும்",
        "சூரிய வெளிச்சம் அதிகமில்லாத போது தெளிக்கவும்"
      ],
      duration: "5 - 7 days",
      taDuration: "5 - 7 நாட்கள்",
      prevention: [
        "Hang yellow sticky traps to capture winged sucking pests.",
        "Avoid over-fertilization with nitrogen which attracts pests.",
        "Encourage beneficial insects like ladybugs and lacewings."
      ],
      taPrevention: [
        "வயல்களில் மஞ்சள் வண்ண ஒட்டும் பொறிகள் வைப்பது",
        "அதிக நைட்ரஜன் உரம் போடுவதைக் குறைப்பது",
        "இயற்கை எதிரிகளான பொன்வண்டுகளைப் பாதுகாப்பது"
      ]
    };
    return res.json(fallbackReport);

  } catch (err) {
    console.error("Top-level error in pest detection endpoint (server.js):", err.message);
    res.status(500).json({ error: "Internal server error during disease detection" });
  }
});

function safeParseJSON(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(json)?/, "").replace(/```$/, "").trim();
  }
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Error parsing JSON content in server.js:", e.message, cleaned);
    throw e;
  }
}

// Chatbot proxy endpoint supporting both /api/chat and /api/chatbot
app.post(['/api/chat', '/api/chatbot'], async (req, res) => {
  const { message, lang, language } = req.body;
  const selectedLang = lang || language || 'en';
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Groq API Key is missing on the server' });
  }

  const systemInstructions = selectedLang === 'ta'
    ? 'நீங்கள் "அக்ரி-AI உதவியாளர்", ஒரு தமிழ் விவசாய நிபுணர். விவசாயம், பயிர் நோய்கள், உரங்கள், பூச்சிக்கொல்லிகள் மற்றும் இயற்கை வேளாண்மை பற்றி விவசாயிகளுக்கு தெளிவான மற்றும் எளிய பதில்களை வழங்குங்கள்.'
    : 'You are "Agri-AI Assistant", a friendly and helpful agricultural expert assistant. Provide clear, concise, and professional advice to farmers regarding crop cultivation, soil health, pest management, crop diseases, organic fertilizers, and government agricultural schemes.';

  try {
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemInstructions },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      throw new Error(`Groq API responded with status ${groqResponse.status}: ${errText}`);
    }

    const data = await groqResponse.json();
    const reply = data.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error('Chatbot API error:', error);
    res.status(500).json({ error: 'Sorry, the Agri-AI assistant is currently offline. Please try again later.' });
  }
});

// Default route serving index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Smart Farmer Assistant server running at http://localhost:${PORT}`);
});
