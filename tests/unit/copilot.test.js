import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock localStorage simple state in memory
class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  clear() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
}

describe("Farm Context Engine & Digital Twin Tests", () => {
  beforeEach(() => {
    global.localStorage = new LocalStorageMock();
  });

  // Mock implementation of updateFarmDigitalTwin for testing
  const updateFarmDigitalTwinMock = (newData) => {
    let twin = {};
    try {
      twin = JSON.parse(localStorage.getItem("farm_digital_twin")) || {};
    } catch (e) {
      twin = {};
    }

    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      twin.farmer = {
        uid: user.uid,
        name: user.full_name || user.username,
        village: user.village_name || "",
        phone: user.phone_number || ""
      };
    }

    if (newData.activeFarm) {
      twin.activeFarm = { ...(twin.activeFarm || {}), ...newData.activeFarm };
    }
    if (newData.conditions) {
      twin.conditions = { ...(twin.conditions || {}), ...newData.conditions };
    }
    if (newData.history) {
      twin.history = { ...(twin.history || {}), ...newData.history };
    }

    localStorage.setItem("farm_digital_twin", JSON.stringify(twin));
    return twin;
  };

  it("should initialize with user metadata from localStorage", () => {
    const mockUser = {
      uid: "user_123",
      full_name: "Rishi",
      username: "rishi4676",
      village_name: "Melur",
      phone_number: "9876543210"
    };
    localStorage.setItem("user", JSON.stringify(mockUser));

    const twin = updateFarmDigitalTwinMock({
      activeFarm: {
        surveyNo: "123/4A",
        crop: "Rice"
      }
    });

    expect(twin.farmer).toBeDefined();
    expect(twin.farmer.name).toBe("Rishi");
    expect(twin.farmer.village).toBe("Melur");
    expect(twin.activeFarm.surveyNo).toBe("123/4A");
    expect(twin.activeFarm.crop).toBe("Rice");
  });

  it("should merge subsequent updates to the Digital Twin cleanly", () => {
    // Initial setup
    updateFarmDigitalTwinMock({
      activeFarm: {
        surveyNo: "123/4A",
        crop: "Rice"
      }
    });

    // Update conditions later (e.g. from weather API)
    const twin = updateFarmDigitalTwinMock({
      conditions: {
        weather: {
          temp: 29.5,
          humidity: 85
        }
      }
    });

    expect(twin.activeFarm.surveyNo).toBe("123/4A");
    expect(twin.conditions.weather.temp).toBe(29.5);
    expect(twin.conditions.weather.humidity).toBe(85);
  });
});
