// tests/unit/helpers.test.ts
import {
  formatTime,
  formatDate,
  formatRelativeTime,
  ROOM_TYPE_LABELS,
  DEVICE_TYPE_LABELS,
  DEVICE_TYPE_ICONS,
  ROOM_TYPE_ICONS,
  DAY_LABELS,
  FREQUENCY_LABELS,
  cn,
} from "@/lib/utils/helpers";

describe("formatTime", () => {
  it("converts 07:00 to 7:00 AM", () => {
    expect(formatTime("07:00")).toBe("7:00 AM");
  });

  it("converts 13:30 to 1:30 PM", () => {
    expect(formatTime("13:30")).toBe("1:30 PM");
  });

  it("converts 00:00 to 12:00 AM (midnight)", () => {
    expect(formatTime("00:00")).toBe("12:00 AM");
  });

  it("converts 12:00 to 12:00 PM (noon)", () => {
    expect(formatTime("12:00")).toBe("12:00 PM");
  });

  it("converts 23:45 to 11:45 PM", () => {
    expect(formatTime("23:45")).toBe("11:45 PM");
  });

  it("pads single-digit minutes correctly", () => {
    expect(formatTime("09:05")).toBe("9:05 AM");
  });
});

describe("formatDate", () => {
  it("formats a valid ISO date string", () => {
    const result = formatDate("2024-06-15T10:00:00.000Z");
    expect(result).toMatch(/Jun/);
    expect(result).toMatch(/2024/);
  });

  it("returns a string", () => {
    expect(typeof formatDate("2024-01-01T00:00:00.000Z")).toBe("string");
  });
});

describe("formatRelativeTime", () => {
  it("returns 'just now' for timestamps less than 1 minute ago", () => {
    const now = new Date().toISOString();
    expect(formatRelativeTime(now)).toBe("just now");
  });

  it("returns minutes for timestamps within an hour", () => {
    const twoMinsAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    expect(formatRelativeTime(twoMinsAgo)).toBe("2m ago");
  });

  it("returns hours for timestamps within a day", () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(twoHoursAgo)).toBe("2h ago");
  });

  it("returns days for timestamps within a week", () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(threeDaysAgo)).toBe("3d ago");
  });

  it("returns formatted date for timestamps older than a week", () => {
    const oldDate = new Date("2020-01-01T00:00:00.000Z").toISOString();
    const result = formatRelativeTime(oldDate);
    expect(result).toMatch(/2020/);
  });
});

describe("Label and icon mappings", () => {
  it("has a label for every room type", () => {
    const roomTypes = ["bedroom", "kitchen", "living_room", "office", "bathroom", "garage", "basement", "other"];
    roomTypes.forEach((type) => {
      expect(ROOM_TYPE_LABELS[type as keyof typeof ROOM_TYPE_LABELS]).toBeDefined();
    });
  });

  it("has an icon for every room type", () => {
    const roomTypes = ["bedroom", "kitchen", "living_room", "office", "bathroom", "garage", "basement", "other"];
    roomTypes.forEach((type) => {
      expect(ROOM_TYPE_ICONS[type as keyof typeof ROOM_TYPE_ICONS]).toBeDefined();
    });
  });

  it("has a label for every device type", () => {
    const deviceTypes = ["light", "fan", "ac", "heater", "chiller", "tv", "camera", "lock", "thermostat", "speaker", "other"];
    deviceTypes.forEach((type) => {
      expect(DEVICE_TYPE_LABELS[type as keyof typeof DEVICE_TYPE_LABELS]).toBeDefined();
    });
  });

  it("has an emoji icon for every device type", () => {
    const deviceTypes = ["light", "fan", "ac", "heater", "chiller", "tv", "camera", "lock", "thermostat", "speaker", "other"];
    deviceTypes.forEach((type) => {
      const icon = DEVICE_TYPE_ICONS[type as keyof typeof DEVICE_TYPE_ICONS];
      expect(typeof icon).toBe("string");
      expect(icon.length).toBeGreaterThan(0);
    });
  });

  it("has 7 day labels", () => {
    expect(DAY_LABELS).toHaveLength(7);
    expect(DAY_LABELS[0]).toBe("Sun");
    expect(DAY_LABELS[6]).toBe("Sat");
  });

  it("has labels for all frequency types", () => {
    expect(FREQUENCY_LABELS.once).toBe("Once");
    expect(FREQUENCY_LABELS.daily).toBe("Daily");
    expect(FREQUENCY_LABELS.weekly).toBe("Weekly");
  });
});

describe("cn (className utility)", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("deduplicates conflicting Tailwind classes", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("handles conditional classes", () => {
    const isActive = true;
    expect(cn("base", isActive && "active")).toBe("base active");
  });

  it("handles falsy values gracefully", () => {
    expect(cn("base", false, undefined, null, "end")).toBe("base end");
  });
});
