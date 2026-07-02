"use client";

import { useMemo, useState } from "react";
import { SafetyBadge } from "@/components/SafetyBadge";
import { mapCityContextToBrief, type CityContextInput } from "@/lib/city-context";

export default function CityContextPage() {
  const [context, setContext] = useState<CityContextInput>({
    locationLabel: "Seoul riverside commute",
    timeOfDay: "evening",
    weather: "clear",
    speedKmh: 28,
  });
  const brief = useMemo(() => mapCityContextToBrief(context), [context]);

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[0.8fr_1fr]">
      <section className="space-y-5 rounded-3xl bg-white p-6 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-signal">Sidecar route</p>
        <h1 className="text-3xl font-bold">City Context Music Explainer</h1>
        <p className="text-gray-700">Mock controls map location, time, weather, and speed into an explainable music brief. No browser geolocation or external weather API is used.</p>
        <label className="block text-sm font-medium">Location label
          <input className="mt-2 w-full rounded-2xl border border-orange-200 p-3" value={context.locationLabel} onChange={(event) => setContext({ ...context, locationLabel: event.target.value })} />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-medium">Time
            <select className="mt-2 w-full rounded-2xl border border-orange-200 p-3" value={context.timeOfDay} onChange={(event) => setContext({ ...context, timeOfDay: event.target.value as CityContextInput["timeOfDay"] })}>
              <option value="morning">Morning</option><option value="afternoon">Afternoon</option><option value="evening">Evening</option><option value="night">Night</option>
            </select>
          </label>
          <label className="block text-sm font-medium">Weather
            <select className="mt-2 w-full rounded-2xl border border-orange-200 p-3" value={context.weather} onChange={(event) => setContext({ ...context, weather: event.target.value as CityContextInput["weather"] })}>
              <option value="clear">Clear</option><option value="rain">Rain</option><option value="cloudy">Cloudy</option><option value="snow">Snow</option>
            </select>
          </label>
        </div>
        <label className="block text-sm font-medium">Speed: {context.speedKmh} km/h
          <input className="mt-2 w-full" type="range" min="0" max="120" value={context.speedKmh} onChange={(event) => setContext({ ...context, speedKmh: Number(event.target.value) })} />
        </label>
        <SafetyBadge />
      </section>
      <section className="space-y-5 rounded-3xl bg-white p-6 shadow-soft">
        <h2 className="text-2xl font-semibold">{brief.title}</h2>
        <div className="flex flex-wrap gap-2">{brief.tags.map((tag) => <span key={tag} className="rounded-full bg-orange-100 px-3 py-1 text-xs">{tag}</span>)}</div>
        <p className="rounded-2xl bg-violet-50 p-4">Tempo range: <strong>{brief.tempoRange}</strong></p>
        <div>
          <h3 className="font-semibold">Why this brief?</h3>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-gray-700">{brief.explanation.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div className="rounded-2xl border border-orange-200 p-4">
          <h3 className="font-semibold">Mapped music brief</h3>
          <p className="mt-2 text-gray-700">{brief.musicBrief}</p>
        </div>
        <p className="text-sm text-gray-600">{brief.publicSafetyNote}</p>
      </section>
    </main>
  );
}
