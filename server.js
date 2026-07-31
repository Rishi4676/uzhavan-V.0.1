import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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

// Chatbot proxy endpoint using Groq Cloud API
app.post('/api/chat', async (req, res) => {
  const { message, lang } = req.body;
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Groq API Key is missing on the server' });
  }

  const systemInstructions = lang === 'ta'
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
