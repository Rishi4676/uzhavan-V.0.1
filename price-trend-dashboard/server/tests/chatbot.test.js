const test = require("node:test");
const assert = require("node:assert/strict");
const { buildChatbotReply, getAiStatus } = require("../index");

test("buildChatbotReply returns a practical fallback reply when Gemini is unavailable", () => {
  const reply = buildChatbotReply("How do I control pests?", "en", null);
  assert.match(reply.toLowerCase(), /pest|agriculture|fallback/i);
});

test("getAiStatus returns correct status when GROQ_API_KEY is defined", () => {
  const originalKey = process.env.GROQ_API_KEY;
  process.env.GROQ_API_KEY = "gsk_test";

  const status = getAiStatus();
  assert.strictEqual(status.mode, "groq");
  assert.match(status.message, /groq/i);

  if (originalKey) {
    process.env.GROQ_API_KEY = originalKey;
  } else {
    delete process.env.GROQ_API_KEY;
  }
});
