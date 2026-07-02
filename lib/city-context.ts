export type CityContextInput = {
  locationLabel: string;
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  weather: "clear" | "rain" | "cloudy" | "snow";
  speedKmh: number;
};

export type CityContextBrief = {
  title: string;
  tags: string[];
  tempoRange: string;
  explanation: string[];
  musicBrief: string;
  publicSafetyNote: string;
};

export function mapCityContextToBrief(input: CityContextInput): CityContextBrief {
  const speed = Number.isFinite(input.speedKmh) ? Math.max(0, Math.min(140, input.speedKmh)) : 0;
  const movementTag = speed < 8 ? "walking pace" : speed < 35 ? "city glide" : speed < 80 ? "commute motion" : "highway momentum";
  const tempoRange = speed < 8 ? "72-88 BPM" : speed < 35 ? "88-104 BPM" : speed < 80 ? "104-124 BPM" : "124-138 BPM";
  const timeTag = {
    morning: "fresh start",
    afternoon: "focused daylight",
    evening: "golden-hour warmth",
    night: "neon calm",
  }[input.timeOfDay];
  const weatherTag = {
    clear: "bright air",
    rain: "soft rain texture",
    cloudy: "muted skyline",
    snow: "quiet sparkle",
  }[input.weather];
  const location = input.locationLabel.trim() || "Seoul city route";

  return {
    title: `${location} ${timeTag} cue`,
    tags: [timeTag, weatherTag, movementTag],
    tempoRange,
    explanation: [
      `${input.timeOfDay} selects the emotional palette: ${timeTag}.`,
      `${input.weather} weather adds the arrangement texture: ${weatherTag}.`,
      `${speed} km/h maps to ${movementTag} and ${tempoRange}.`,
    ],
    musicBrief: `Create a ${tempoRange} ${weatherTag} ${movementTag} track for ${location}, shaped for ${timeTag}. Keep it instrumental, loop-friendly, and clearly labeled as a mock city-context recommendation.`,
    publicSafetyNote: "Rational product interpretation inspired by public city-context music ideas; no geolocation is sent and no real composition occurs.",
  };
}
