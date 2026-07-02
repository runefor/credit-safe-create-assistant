import Link from "next/link";
import { SafetyBadge } from "@/components/SafetyBadge";

const features = [
  "Brief validation with deterministic warnings, suggestions, quality score, and simulated credit estimate.",
  "Idempotent async job creation with queued/running/completed/failed states and retry history.",
  "Workspace cards with mock audio metadata, favorite toggle, version note, and attribution reminder.",
  "City Context sidecar mapping time/weather/speed to an explainable music brief.",
];

export default function Home() {
  return (
    <main className="mx-auto grid max-w-6xl gap-10 px-6 py-12">
      <section className="grid gap-6 rounded-3xl bg-white p-8 shadow-soft md:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-signal">Portfolio full-stack demo</p>
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">Credit-safe create flow for AI music requests.</h1>
          <p className="text-lg text-gray-700">
            A public-flow-inspired demo that turns a music prompt into validation feedback, simulated credit cost, an async generation job, and a saved workspace result without claiming real AI generation or internal Muzig behavior.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/create" className="rounded-full bg-ink px-5 py-3 text-white">Try flagship flow</Link>
            <Link href="/city-context" className="rounded-full border border-ink px-5 py-3">Open city sidecar</Link>
          </div>
        </div>
        <div className="space-y-4 rounded-2xl bg-orange-50 p-5">
          <h2 className="text-xl font-semibold">Demo contract</h2>
          <ol className="space-y-3 text-sm text-gray-700">
            <li>1. Validate a brief before spending simulated credits.</li>
            <li>2. Submit once with an idempotency key.</li>
            <li>3. Poll status and retry a simulated failure.</li>
            <li>4. Review the completed mock track in Workspace.</li>
          </ol>
        </div>
      </section>
      <SafetyBadge />
      <section className="grid gap-4 md:grid-cols-2">
        {features.map((feature) => (
          <div key={feature} className="rounded-2xl border border-orange-200 bg-white p-5 text-gray-700">{feature}</div>
        ))}
      </section>
    </main>
  );
}
