import { describe, expect, it } from "vitest";
import { mapCityContextToBrief } from "@/lib/city-context";

describe("mapCityContextToBrief", () => {
  it("maps speed, weather, and time into explainable tags and brief text", () => {
    const result = mapCityContextToBrief({
      locationLabel: "Seoul riverside",
      timeOfDay: "night",
      weather: "rain",
      speedKmh: 62,
    });

    expect(result.tags).toEqual(expect.arrayContaining(["neon calm", "soft rain texture", "commute motion"]));
    expect(result.tempoRange).toBe("104-124 BPM");
    expect(result.explanation).toHaveLength(3);
    expect(result.musicBrief).toContain("Seoul riverside");
    expect(result.publicSafetyNote).toContain("Rational product interpretation");
  });
});
