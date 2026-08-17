/**
 * Smart Farmer Assistant - Global Farmer Voice Controller & Navigation Assistant
 * Supports: Page navigation, dynamic input filling, button clicking, and language toggling.
 */

let bubbleTimeout;
let hasSpokenOnLoad = false;
let recognition = null;
let isListening = false;

// Load stylesheet dynamically if not already loaded
if (!document.querySelector('link[href*="farmer.css"]')) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "/css/farmer.css";
  document.head.appendChild(link);
}

// Voice commands mapping for navigation
const commands = {
  home: {
    keywords: ["home", "main", "dashboard", "index", "முகப்பு", "வீடு", "ஹோம்", "mukappu", "veedu", "vittu"],
    url: "index.html",
    speakEn: "Going to home page",
    speakTa: "முகப்பு பக்கத்திற்குச் செல்கிறேன்"
  },
  weather: {
    keywords: ["weather", "climate", "forecast", "rain", "வானிலை", "மழை", "வெப்பநிலை", "vanailai", "mazhai"],
    url: "weather.html",
    speakEn: "Opening weather forecast",
    speakTa: "வானிலை பக்கத்திற்குச் செல்கிறேன்"
  },
  survey: {
    keywords: ["survey", "land", "patta", "chitta", "map", "நில அளவை", "பட்டா", "சிட்டா", "nilam", "patta"],
    url: "survey.html",
    speakEn: "Opening land survey records",
    speakTa: "நில அளவை பக்கத்திற்குச் செல்கிறேன்"
  },
  forum: {
    keywords: ["forum", "community", "discuss", "chat", "மன்றம்", "விவாதம்", "forum", "manram"],
    url: "forum.html",
    speakEn: "Opening community forum",
    speakTa: "மன்ற பக்கத்திற்குச் செல்கிறேன்"
  },
  market: {
    keywords: ["market", "price", "rate", "commodity", "சந்தை", "விலை", "market", "santhai", "vilai"],
    url: "market.html",
    speakEn: "Opening market prices",
    speakTa: "சந்தை பக்கத்திற்குச் செல்கிறேன்"
  },
  pest: {
    keywords: ["pest", "disease", "insect", "bug", "cure", "பூச்சி", "நோய்", "poochi", "noi"],
    url: "pest.html",
    speakEn: "Opening pest and disease detection",
    speakTa: "பூச்சி மற்றும் நோய் கண்டறிதல் பக்கத்திற்குச் செல்கிறேன்"
  },
  schemes: {
    keywords: ["scheme", "government", "subsidy", "benefit", "திட்டம்", "அரசு", "scheme", "thittam"],
    url: "schemes.html",
    speakEn: "Opening government schemes",
    speakTa: "அரசு திட்டங்கள் பக்கத்திற்குச் செல்கிறேன்"
  },
  ledger: {
    keywords: ["ledger", "accounts", "book", "cost", "expense", "income", "கணக்கு", "kanakku"],
    url: "ledger.html",
    speakEn: "Opening farm ledger",
    speakTa: "விவசாய கணக்கு பக்கத்திற்குச் செல்கிறேன்"
  },
  login: {
    keywords: ["login", "signin", "auth", "account", "உள்நுழை", "login", "ulnulai"],
    url: "login.html",
    speakEn: "Opening login page",
    speakTa: "உள்நுழை பக்கத்திற்குச் செல்கிறேன்"
  },
  register: {
    keywords: ["register", "signup", "create account", "பதிவு", "signup", "pathivu"],
    url: "register.html",
    speakEn: "Opening registration page",
    speakTa: "பதிவு பக்கத்திற்குச் செல்கிறேன்"
  }
};

// Helper to get current language
function getLanguage() {
  return window.currentLang || localStorage.getItem("lang") || "en";
}

// Function to inject farmer DOM globally
function injectFarmer() {
  if (document.querySelector(".farmer-corner-container")) return; // Already exists

  const currentLang = getLanguage();
  const labelText = (window.translations && window.translations[currentLang] && window.translations[currentLang].voice_label)
      ? window.translations[currentLang].voice_label
      : (currentLang === "ta" ? "குரல்" : "Voice");

  const container = document.createElement("div");
  container.className = "farmer-corner-container";
  container.innerHTML = `
    <div class="farmer-speech-bubble" id="farmer-speech-bubble">
      <span id="speech-bubble-text"></span>
    </div>
    <div class="farmer-avatar-wrapper">
      <div class="farmer-avatar" id="farmer-avatar" onclick="handleFarmerClick()">
        <svg class="farmer-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="48" fill="#e8f5e9" stroke="#81c784" stroke-width="2" />
          <path d="M22 85 C22 70, 35 65, 50 65 C65 65, 78 70, 78 85 Z" fill="#2e7d32" />
          <path d="M42 65 L50 78 L58 65 Z" fill="#f1f8e9" />
          <rect x="44" y="58" width="12" height="10" fill="#ffcc80" />
          <circle cx="34" cy="48" r="6" fill="#ffcc80" />
          <circle cx="66" cy="48" r="6" fill="#ffcc80" />
          <circle cx="50" cy="48" r="17" fill="#ffe0b2" />
          <g class="farmer-eyes">
            <circle cx="43" cy="44" r="2.5" fill="#333" />
            <circle cx="57" cy="44" r="2.5" fill="#333" />
            <circle cx="44" cy="43" r="0.8" fill="#fff" />
            <circle cx="58" cy="43" r="0.8" fill="#fff" />
          </g>
          <path d="M38 39 Q43 38 46 41" stroke="#333" stroke-width="1.5" fill="none" stroke-linecap="round" />
          <path d="M62 39 Q57 38 54 41" stroke="#333" stroke-width="1.5" fill="none" stroke-linecap="round" />
          <path d="M50 43 Q48 48 50 49" stroke="#e0a86d" stroke-width="1.5" fill="none" stroke-linecap="round" />
          <path class="farmer-mustache" d="M35 52 Q44 50 50 53 Q56 50 65 52 Q70 56 65 58 Q55 58 50 54 Q45 58 35 58 Q30 56 35 52 Z" fill="#333" />
          <ellipse class="farmer-mouth" cx="50" cy="54" rx="4" ry="1" fill="#d32f2f" />
          <g class="farmer-turban">
            <path d="M31 35 C31 22, 69 22, 69 35 C69 38, 31 38, 31 35 Z" fill="#4caf50" />
            <path d="M32 32 C38 24, 62 24, 68 32" stroke="#2e7d32" stroke-width="2" fill="none" />
            <path d="M35 29 C42 21, 58 21, 65 29" stroke="#1b5e20" stroke-width="1.5" fill="none" />
            <path d="M68 32 C74 32, 78 38, 76 44 C74 46, 68 44, 68 38 Z" fill="#4caf50" stroke="#2e7d32" stroke-width="1" />
          </g>
        </svg>
      </div>
      <div class="voice-toggle-container">
        <div class="voice-toggle-label" id="farmer-voice-label">${labelText}</div>
        <label class="voice-switch">
          <input type="checkbox" id="voice-toggle" onchange="handleVoiceToggle(this)">
          <span class="voice-slider">
            <i class="fas fa-volume-mute"></i>
            <i class="fas fa-volume-up"></i>
          </span>
        </label>
      </div>
    </div>
  `;
  document.body.appendChild(container);
  
  // Initialize toggle checked state
  const voiceToggle = document.getElementById("voice-toggle");
  const savedState = localStorage.getItem("farmerVoiceEnabled");
  if (voiceToggle) {
    voiceToggle.checked = savedState === "true";
  }
}

function showSpeechBubble(text) {
  const bubble = document.getElementById("farmer-speech-bubble");
  const bubbleText = document.getElementById("speech-bubble-text");
  if (bubble && bubbleText) {
    bubbleText.textContent = text;
    bubble.classList.add("active");
    if (bubbleTimeout) clearTimeout(bubbleTimeout);
  }
}

function scheduleHideBubble() {
  if (bubbleTimeout) clearTimeout(bubbleTimeout);
  bubbleTimeout = setTimeout(() => {
    const bubble = document.getElementById("farmer-speech-bubble");
    if (bubble) {
      bubble.classList.remove("active");
    }
  }, 3000);
}

function triggerWelcomeSpeech() {
  const currentLang = getLanguage();
  const isTamil = currentLang === "ta";
  const speakText = isTamil ? "வணக்கம்" : "Welcome";

  speakFeedback(speakText, () => {
    hasSpokenOnLoad = true;
    scheduleHideBubble();
  });
}

function speakFeedback(text, callback) {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }

  const currentLang = getLanguage();
  const isTamil = currentLang === "ta";
  const langCode = isTamil ? "ta-IN" : "en-IN";

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = langCode;
  utterance.rate = 1.15;

  if (window.speechSynthesis.getVoices) {
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find((v) => v.lang.startsWith(langCode));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }
  }

  utterance.onstart = function () {
    const avatar = document.getElementById("farmer-avatar");
    if (avatar) avatar.classList.add("talking");
    showSpeechBubble(text);
  };

  utterance.onend = function () {
    const avatar = document.getElementById("farmer-avatar");
    if (avatar) avatar.classList.remove("talking");
    if (callback) callback();
  };

  utterance.onerror = function (e) {
    console.warn("SpeechSynthesis error:", e);
    const avatar = document.getElementById("farmer-avatar");
    if (avatar) avatar.classList.remove("talking");
    if (callback) callback();
  };

  if (window.speechSynthesis) {
    window.speechSynthesis.speak(utterance);
  } else {
    if (callback) callback();
  }
}

// Interactive Input Filling Logic
function fillInputField(name, value) {
  const inputs = Array.from(document.querySelectorAll("input, textarea, select"));
  const cleanName = name.toLowerCase().trim();
  let matchedInput = null;

  // 1. Priority match by ID, Name, Placeholder, or data-key
  matchedInput = inputs.find((input) => {
    const id = (input.id || "").toLowerCase();
    const nameAttr = (input.name || "").toLowerCase();
    const placeholder = (input.getAttribute("placeholder") || "").toLowerCase();
    const dataKey = (input.getAttribute("data-key") || "").toLowerCase();

    return id.includes(cleanName) || 
           nameAttr.includes(cleanName) || 
           placeholder.includes(cleanName) || 
           dataKey.includes(cleanName);
  });

  // 2. Secondary match by associated label texts
  if (!matchedInput) {
    matchedInput = inputs.find((input) => {
      if (input.id) {
        const labels = document.querySelectorAll(`label[for="${input.id}"]`);
        for (const label of labels) {
          if (label.textContent.toLowerCase().includes(cleanName)) return true;
        }
      }
      const parentLabel = input.closest("label");
      if (parentLabel && parentLabel.textContent.toLowerCase().includes(cleanName)) return true;
      return false;
    });
  }

  if (matchedInput) {
    matchedInput.value = value;
    matchedInput.dispatchEvent(new Event("input", { bubbles: true }));
    matchedInput.dispatchEvent(new Event("change", { bubbles: true }));

    // Highlight visual feedback
    matchedInput.style.outline = "3px solid var(--primary-green, #2e7d32)";
    matchedInput.style.backgroundColor = "#e8f5e9";
    matchedInput.focus();
    
    setTimeout(() => {
      matchedInput.style.outline = "";
      matchedInput.style.backgroundColor = "";
    }, 1500);

    const successMsg = getLanguage() === "ta"
      ? `${name}-ல் '${value}' என எழுதியுள்ளேன்.`
      : `Entered ${value} in ${name}.`;
    
    showSpeechBubble(successMsg);
    speakFeedback(successMsg, () => {
      startRecognition();
    });
    return true;
  }
  return false;
}

// Smart Fallback Parser (e.g. "username admin" or "பயனர் பெயர் அட்மின்")
function attemptSmartInputFill(cleanCommand) {
  const words = cleanCommand.split(/\s+/);
  if (words.length < 2) return false;

  const inputs = Array.from(document.querySelectorAll("input, textarea, select"));

  // Check split index combinations (e.g. first 1 word or 2 words as search key)
  for (let splitIndex = 1; splitIndex <= Math.min(2, words.length - 1); splitIndex++) {
    const potentialKey = words.slice(0, splitIndex).join(" ").toLowerCase();
    const potentialValue = words.slice(splitIndex).join(" ");

    const matchedInput = inputs.find((input) => {
      const id = (input.id || "").toLowerCase();
      const nameAttr = (input.name || "").toLowerCase();
      const placeholder = (input.getAttribute("placeholder") || "").toLowerCase();
      const dataKey = (input.getAttribute("data-key") || "").toLowerCase();

      let labelMatch = false;
      if (input.id) {
        const labels = document.querySelectorAll(`label[for="${input.id}"]`);
        for (const label of labels) {
          if (label.textContent.toLowerCase().includes(potentialKey)) labelMatch = true;
        }
      }
      const parentLabel = input.closest("label");
      if (parentLabel && parentLabel.textContent.toLowerCase().includes(potentialKey)) labelMatch = true;

      return id.includes(potentialKey) || 
             nameAttr.includes(potentialKey) || 
             placeholder.includes(potentialKey) || 
             dataKey.includes(potentialKey) ||
             labelMatch;
    });

    if (matchedInput) {
      matchedInput.value = potentialValue;
      matchedInput.dispatchEvent(new Event("input", { bubbles: true }));
      matchedInput.dispatchEvent(new Event("change", { bubbles: true }));

      matchedInput.style.outline = "3px solid var(--primary-green, #2e7d32)";
      matchedInput.style.backgroundColor = "#e8f5e9";
      matchedInput.focus();
      
      setTimeout(() => {
        matchedInput.style.outline = "";
        matchedInput.style.backgroundColor = "";
      }, 1500);

      const successMsg = getLanguage() === "ta"
        ? `${potentialKey}-ல் '${potentialValue}' என எழுதியுள்ளேன்.`
        : `Entered ${potentialValue} in ${potentialKey}.`;
      
      showSpeechBubble(successMsg);
      speakFeedback(successMsg, () => {
        startRecognition();
      });
      return true;
    }
  }
  return false;
}

// Interactive Button Clicking Logic
function triggerButtonClick(labelText) {
  const buttons = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"], .btn, .lang-switch-btn'));
  const cleanLabel = labelText.toLowerCase().trim();

  const matchedButton = buttons.find((btn) => {
    const text = (btn.innerText || btn.textContent || "").toLowerCase();
    const value = (btn.value || "").toLowerCase();
    const dataKey = (btn.getAttribute("data-key") || "").toLowerCase();
    const id = (btn.id || "").toLowerCase();

    return text.includes(cleanLabel) || 
           value.includes(cleanLabel) || 
           dataKey.includes(cleanLabel) || 
           id.includes(cleanLabel);
  });

  if (matchedButton) {
    const successMsg = getLanguage() === "ta"
      ? `${matchedButton.innerText || "பொத்தான்"} கிளிக் செய்கிறேன்.`
      : `Clicking ${matchedButton.innerText || "button"}...`;
    
    showSpeechBubble(successMsg);
    matchedButton.style.outline = "3px solid #ffd54f";
    matchedButton.style.transform = "scale(1.04)";

    stopRecognition();
    speakFeedback(successMsg, () => {
      matchedButton.style.outline = "";
      matchedButton.style.transform = "";
      matchedButton.click();
      
      // Delay mic restart slightly for navigation
      setTimeout(() => {
        startRecognition();
      }, 1200);
    });
    return true;
  }
  return false;
}

// Fallback Link/Card Clicking by Text Matching
function clickElementByText(text) {
  const clickable = Array.from(document.querySelectorAll("a, button, [role='button'], .feature-card"));
  const cleanText = text.toLowerCase().trim();

  const element = clickable.find((el) => {
    const textVal = (el.innerText || el.textContent || "").toLowerCase();
    const dataKey = (el.getAttribute("data-key") || "").toLowerCase();
    return textVal.includes(cleanText) || dataKey.includes(cleanText);
  });

  if (element) {
    const successMsg = getLanguage() === "ta"
      ? `${element.innerText || "இணைப்பை"} கிளிக் செய்கிறேன்.`
      : `Opening ${element.innerText || "link"}...`;
    
    showSpeechBubble(successMsg);
    stopRecognition();
    
    speakFeedback(successMsg, () => {
      element.click();
      setTimeout(() => {
        startRecognition();
      }, 1500);
    });
    return true;
  }
  return false;
}

// Helper functions for cursor and text manipulation
function moveCursorUp() {
  const activeEl = document.activeElement;
  if (activeEl && (activeEl.tagName === 'TEXTAREA')) {
    const lines = activeEl.value.split('\n');
    const currentLine = activeEl.selectionStart;
    let lineStart = 0;
    let lineNum = 0;

    for (let i = 0; i < lines.length; i++) {
      if (lineStart + lines[i].length >= currentLine) {
        lineNum = i;
        break;
      }
      lineStart += lines[i].length + 1; // +1 for newline
    }

    if (lineNum > 0) {
      const prevLineStart = lineStart - lines[lineNum - 1].length - 1;
      const newPos = Math.min(prevLineStart + lines[lineNum - 1].length, activeEl.selectionStart);
      activeEl.setSelectionRange(newPos, newPos);
      activeEl.focus();
      return true;
    }
  }
  return false;
}

function moveCursorDown() {
  const activeEl = document.activeElement;
  if (activeEl && (activeEl.tagName === 'TEXTAREA')) {
    const lines = activeEl.value.split('\n');
    const currentLine = activeEl.selectionStart;
    let lineStart = 0;
    let lineNum = 0;

    for (let i = 0; i < lines.length; i++) {
      if (lineStart + lines[i].length >= currentLine) {
        lineNum = i;
        break;
      }
      lineStart += lines[i].length + 1; // +1 for newline
    }

    if (lineNum < lines.length - 1) {
      const nextLineStart = lineStart + lines[lineNum].length + 1;
      const newPos = Math.min(nextLineStart + (currentLine - lineStart), activeEl.value.length);
      activeEl.setSelectionRange(newPos, newPos);
      activeEl.focus();
      return true;
    }
  }
  return false;
}

function moveCursorLeft() {
  const activeEl = document.activeElement;
  if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
    const pos = activeEl.selectionStart;
    if (pos > 0) {
      activeEl.setSelectionRange(pos - 1, pos - 1);
      activeEl.focus();
      return true;
    }
  }
  return false;
}

function moveCursorRight() {
  const activeEl = document.activeElement;
  if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
    const pos = activeEl.selectionStart;
    if (pos < activeEl.value.length) {
      activeEl.setSelectionRange(pos + 1, pos + 1);
      activeEl.focus();
      return true;
    }
  }
  return false;
}

function selectAll() {
  const activeEl = document.activeElement;
  if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT')) {
    activeEl.select();
    return true;
  }
  return false;
}

function deleteSelectedText() {
  const activeEl = document.activeElement;
  if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
    const start = activeEl.selectionStart;
    const end = activeEl.selectionEnd;
    if (start !== end) {
      const value = activeEl.value;
      activeEl.value = value.slice(0, start) + value.slice(end);
      activeEl.setSelectionRange(start, start);
      activeEl.dispatchEvent(new Event('input', { bubbles: true }));
      activeEl.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
  }
  return false;
}

function backspace() {
  const activeEl = document.activeElement;
  if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
    const start = activeEl.selectionStart;
    const end = activeEl.selectionEnd;
    let newStart = start;
    if (start === end && start > 0) {
      newStart = start - 1;
    }
    const value = activeEl.value;
    activeEl.value = value.slice(0, newStart) + value.slice(end);
    activeEl.setSelectionRange(newStart, newStart);
    activeEl.dispatchEvent(new Event('input', { bubbles: true }));
    activeEl.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }
  return false;
}

function insertTextAtCursor(text) {
  const activeEl = document.activeElement;
  if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
    const start = activeEl.selectionStart;
    const end = activeEl.selectionEnd;
    const value = activeEl.value;
    activeEl.value = value.slice(0, start) + text + value.slice(end);
    activeEl.setSelectionRange(start + text.length, start + text.length);
    activeEl.dispatchEvent(new Event('input', { bubbles: true }));
    activeEl.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }
  return false;
}

// Speech Recognition Functions
function startRecognition() {
  if (isListening) return;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showSpeechBubble(
      getLanguage() === "ta"
        ? "உலாவியில் மைக் வசதி இல்லை."
        : "Voice input is not supported in this browser."
    );
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = getLanguage() === "ta" ? "ta-IN" : "en-IN";

  recognition.onstart = function () {
    isListening = true;
    const avatar = document.getElementById("farmer-avatar");
    if (avatar) avatar.classList.add("listening");
    
    const tipText = getLanguage() === "ta"
      ? "நான் கேட்கிறேன்..."
      : "Listening...";
    showSpeechBubble(tipText);
  };

  recognition.onresult = function (event) {
    const resultIndex = event.resultIndex;
    if (event.results[resultIndex].isFinal) {
      const transcript = event.results[resultIndex][0].transcript.trim().toLowerCase();
      console.log("Recognized Speech Command:", transcript);
      processVoiceCommand(transcript);
    } else {
      const interimTranscript = event.results[resultIndex][0].transcript.trim();
      showSpeechBubble(interimTranscript);
    }
  };

  recognition.onerror = function (event) {
    console.error("Speech recognition error:", event.error);
    if (event.error === "not-allowed") {
      showSpeechBubble(
        getLanguage() === "ta"
          ? "மைக் அணுகல் மறுக்கப்பட்டது!"
          : "Microphone access blocked!"
      );
      stopRecognition();
      const voiceToggle = document.getElementById("voice-toggle");
      if (voiceToggle) voiceToggle.checked = false;
      localStorage.setItem("farmerVoiceEnabled", "false");
    }
  };

  recognition.onend = function () {
    const voiceToggle = document.getElementById("voice-toggle");
    if (voiceToggle && voiceToggle.checked && isListening) {
      try {
        recognition.start();
      } catch (e) {
        console.log("Restart error:", e);
      }
    } else {
      stopRecognition();
    }
  };

  try {
    recognition.start();
  } catch (e) {
    console.error("Failed to start speech recognition:", e);
  }
}

function stopRecognition() {
  isListening = false;
  const avatar = document.getElementById("farmer-avatar");
  if (avatar) avatar.classList.remove("listening");
  if (recognition) {
    try {
      recognition.stop();
    } catch (e) {}
  }
}

function processVoiceCommand(command) {
  const cleanCommand = command.toLowerCase().trim();

  // 1. Language Command
  const cmdLower = cleanCommand.toLowerCase();
  const wantTamil = cmdLower.includes("tamil") || cmdLower.includes("தமிழ்") || cmdLower.includes("tameel");
  const wantEnglish = cmdLower.includes("english") || cmdLower.includes("ஆங்கிலம்") || cmdLower.includes("inglish");
  const wantChange = cmdLower.includes("language") || cmdLower.includes("மொழி") || cmdLower.includes("change lang");

  if (wantTamil || wantEnglish || wantChange) {
    const current = getLanguage();
    let targetLang = current === "en" ? "ta" : "en"; // Default toggle
    if (wantTamil) targetLang = "ta";
    if (wantEnglish) targetLang = "en";

    if (targetLang !== current) {
      const speakText = targetLang === "en" ? "Changing language to English" : "மொழியை ஆங்கிலத்திலிருந்து தமிழுக்கு மாற்றுகிறேன்";
      stopRecognition();
      speakFeedback(speakText, () => {
        localStorage.setItem("lang", targetLang);
        location.reload();
      });
      return;
    }
  }

  // 2. Click button command (e.g. "click login" or "உள்நுழை கிளிக்")
  const clickMatch = cleanCommand.match(/^(?:click|press|go|click on)\s+(.+)$/) || 
                     cleanCommand.match(/^(.+)\s+(?:click|press|கிளிக்)$/);
  if (clickMatch) {
    const targetLabel = clickMatch[1].trim();
    if (triggerButtonClick(targetLabel)) return;
  }

  // 3. Fill input command with prefix (e.g. "enter username admin" or "set mobile to 98765")
  const fillMatch1 = cleanCommand.match(/^(?:enter|type|set|write)\s+(\w+)\s+(.+)$/);
  const fillMatch2 = cleanCommand.match(/^(?:set|type|enter|write)\s+(\w+)\s+to\s+(.+)$/);
  if (fillMatch2) {
    if (fillInputField(fillMatch2[1], fillMatch2[2])) return;
  } else if (fillMatch1) {
    if (fillInputField(fillMatch1[1], fillMatch1[2])) return;
  }

  // 4. Navigation Commands
  for (const [key, cmdData] of Object.entries(commands)) {
    const isMatch = cmdData.keywords.some((kw) => cleanCommand.includes(kw));
    if (isMatch) {
      const speakText = getLanguage() === "ta" ? cmdData.speakTa : cmdData.speakEn;
      
      stopRecognition();
      speakFeedback(speakText, () => {
        window.location.href = cmdData.url;
      });
      return;
    }
  }

  // 5. Smart Fallback Input Fill (e.g. "username admin" or "பயனர் பெயர் அட்மின்")
  if (attemptSmartInputFill(cleanCommand)) {
    return;
  }

  // 6. Generic Click Text Fallback (e.g. "login" or "quick weather")
  if (clickElementByText(cleanCommand)) {
    return;
  }

  // 7. Command not understood feedback
  const notUnderstood = getLanguage() === "ta"
    ? "மன்னிக்கவும், புரியவில்லை. மீண்டும் சொல்லவும்."
    : "Sorry, I didn't catch that. Please try again.";
  
  stopRecognition();
  speakFeedback(notUnderstood, () => {
    startRecognition();
  });
}

window.handleVoiceToggle = function (checkbox) {
  const isChecked = checkbox.checked;
  localStorage.setItem("farmerVoiceEnabled", isChecked ? "true" : "false");

  if (isChecked) {
    triggerWelcomeSpeech();
    // Start listening after welcome speech
    setTimeout(() => {
      startRecognition();
    }, 1200);
  } else {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    stopRecognition();
    const bubble = document.getElementById("farmer-speech-bubble");
    if (bubble) bubble.classList.remove("active");
    const avatar = document.getElementById("farmer-avatar");
    if (avatar) {
      avatar.classList.remove("talking");
      avatar.classList.remove("listening");
    }
  }
};

window.handleFarmerClick = function () {
  const voiceToggle = document.getElementById("voice-toggle");
  const isEnabled = voiceToggle && voiceToggle.checked;
  const isTamil = getLanguage() === "ta";

  if (isEnabled) {
    triggerWelcomeSpeech();
    setTimeout(() => {
      startRecognition();
    }, 1200);
  } else {
    const hintText = isTamil
      ? "நான் பேச என் ஸ்பீக்கரை ஆன் செய்யவும்!"
      : "Turn on my speaker to hear me speak!";
    showSpeechBubble(hintText);
    scheduleHideBubble();

    // Quick visual wiggle
    const toggleContainer = document.querySelector(".voice-toggle-container");
    if (toggleContainer) {
      toggleContainer.style.transform = "scale(1.15)";
      toggleContainer.style.transition = "transform 0.15s ease";
      setTimeout(() => {
        toggleContainer.style.transform = "";
      }, 300);
    }
  }
};

function initFarmer() {
  injectFarmer();

  const savedState = localStorage.getItem("farmerVoiceEnabled");
  const isEnabled = savedState === "true";

  if (isEnabled) {
    setTimeout(() => {
      triggerWelcomeSpeech();
      startRecognition();
    }, 1200);
  }

  setupUserInteractionFallback();
}

function setupUserInteractionFallback() {
  const playOnFirstInteraction = () => {
    const savedState = localStorage.getItem("farmerVoiceEnabled");
    if (savedState === "true") {
      if (!hasSpokenOnLoad) {
        triggerWelcomeSpeech();
      }
      if (!isListening) {
        startRecognition();
      }
    }
    document.removeEventListener("click", playOnFirstInteraction);
    document.removeEventListener("keydown", playOnFirstInteraction);
  };
  document.addEventListener("click", playOnFirstInteraction);
  document.addEventListener("keydown", playOnFirstInteraction);
}

// Trigger voices load
if (window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
  window.speechSynthesis.onvoiceschanged = () => {
    // Voices loaded
  };
}

// Wait for DOM to load, then run initialization
if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", initFarmer);
} else {
  initFarmer();
}
