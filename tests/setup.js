import { vi } from "vitest";

// Mock browser globals if needed
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
};

global.fetch = vi.fn();
