"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SafetyBadge } from "@/components/SafetyBadge";
import type { JobResponse, ValidationResult } from "@/lib/types";

type FormState = {
  prompt: string;
  genre: string;
  styleTags: string;
  useCase: string;
  commercialIntent: boolean;
  demoOutcome: "success" | "fail";
};

const initialForm: FormState = {
  prompt: "Bright 105 BPM synth pop instrumental for a summer ocean travel short-form video, with clean drums and warm bass.",
  genre: "pop",
  styleTags: "bright, upbeat, travel",
  useCase: "short-form video",
  commercialIntent: true,
  demoOutcome: "success",
};

export default function CreatePage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [job, setJob] = useState<JobResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const styleTags = useMemo(() => form.styleTags.split(",").map((tag) => tag.trim()).filter(Boolean), [form.styleTags]);

  useEffect(() => {
    if (!job || job.status === "completed" || job.status === "failed") return;
    const timer = window.setInterval(async () => {
      const response = await fetch(`/api/generation-jobs/${job.jobId}`);
      if (response.ok) setJob(await response.json());
    }, 900);
    return () => window.clearInterval(timer);
  }, [job]);

  async function validate() {
    setBusy(true);
    setMessage(null);
    const response = await fetch("/api/brief/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, styleTags }),
    });
    setValidation(await response.json());
    setBusy(false);
  }

  async function submitJob() {
    setBusy(true);
    setMessage(null);
    const response = await fetch("/api/generation-jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify({ ...form, styleTags }),
    });
    if (!response.ok) {
      setMessage("Job creation failed. Check the idempotency key and request body.");
      setBusy(false);
      return;
    }
    const created = await response.json();
    const detail = await fetch(`/api/generation-jobs/${created.jobId}`);
    setJob(await detail.json());
    setBusy(false);
  }

  async function retryJob() {
    if (!job) return;
    setBusy(true);
    const response = await fetch(`/api/generation-jobs/${job.jobId}/retry`, { method: "POST" });
    setJob(await response.json());
    setBusy(false);
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1fr_0.9fr]">
      <section className="space-y-5 rounded-3xl bg-white p-6 shadow-soft">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-signal">Flagship flow</p>
          <h1 className="mt-2 text-3xl font-bold">Create Brief</h1>
          <p className="mt-2 text-gray-700">Validate before simulated credit spend, then create an idempotent async job.</p>
        </div>
        <label className="block text-sm font-medium">
          Prompt
          <textarea className="mt-2 min-h-32 w-full rounded-2xl border border-orange-200 p-3" value={form.prompt} onChange={(event) => setForm({ ...form, prompt: event.target.value })} />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-medium">Genre
            <input className="mt-2 w-full rounded-2xl border border-orange-200 p-3" value={form.genre} onChange={(event) => setForm({ ...form, genre: event.target.value })} />
          </label>
          <label className="block text-sm font-medium">Use case
            <input className="mt-2 w-full rounded-2xl border border-orange-200 p-3" value={form.useCase} onChange={(event) => setForm({ ...form, useCase: event.target.value })} />
          </label>
        </div>
        <label className="block text-sm font-medium">Style tags
          <input className="mt-2 w-full rounded-2xl border border-orange-200 p-3" value={form.styleTags} onChange={(event) => setForm({ ...form, styleTags: event.target.value })} />
        </label>
        <div className="grid gap-3 rounded-2xl bg-orange-50 p-4 md:grid-cols-2">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.commercialIntent} onChange={(event) => setForm({ ...form, commercialIntent: event.target.checked })} /> Commercial intent</label>
          <label className="text-sm">Demo terminal state
            <select className="ml-2 rounded-xl border border-orange-200 p-2" value={form.demoOutcome} onChange={(event) => setForm({ ...form, demoOutcome: event.target.value as FormState["demoOutcome"] })}>
              <option value="success">Complete</option>
              <option value="fail">Fail for retry demo</option>
            </select>
          </label>
        </div>
        <div className="flex flex-wrap gap-3">
          <button disabled={busy} onClick={validate} className="rounded-full border border-ink px-5 py-3 disabled:opacity-60">Validate brief</button>
          <button disabled={busy || !validation} onClick={submitJob} className="rounded-full bg-ink px-5 py-3 text-white disabled:opacity-60">Submit generation job</button>
        </div>
        {message ? <p className="text-sm text-red-700">{message}</p> : null}
        <SafetyBadge />
      </section>

      <section className="space-y-5">
        <Panel title="Validation output">
          {validation ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl bg-violet-50 p-4">
                <span>Quality score</span><strong className="text-3xl">{validation.qualityScore}</strong>
              </div>
              <p className="text-sm">Estimated credits: <strong>{validation.estimatedCredits}</strong></p>
              <List title="Warnings" items={validation.warnings} />
              <List title="Suggestions" items={validation.suggestions} />
              <p className="rounded-2xl bg-amber-50 p-3 text-sm">{validation.normalizedBrief.licenseBadge}</p>
            </div>
          ) : <p className="text-gray-600">Run validation to see score, warnings, suggestions, and simulated credits.</p>}
        </Panel>

        <Panel title="Job timeline">
          {job ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between"><span>Status</span><strong className="rounded-full bg-ink px-3 py-1 text-white">{job.status}</strong></div>
              <ol className="space-y-2">
                {job.timeline.map((event, index) => <li key={`${event.status}-${index}`} className="rounded-2xl border border-orange-200 p-3 text-sm"><strong>{event.status}</strong> — {event.label}</li>)}
              </ol>
              {job.status === "failed" ? <button onClick={retryJob} disabled={busy} className="rounded-full bg-signal px-5 py-3 text-white">Retry same brief</button> : null}
              {job.resultTrack ? <Link href="/workspace" className="inline-block rounded-full border border-ink px-5 py-3">Open saved workspace track</Link> : null}
            </div>
          ) : <p className="text-gray-600">Submit a validated brief to watch queued → running → terminal state.</p>}
        </Panel>
      </section>
    </main>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-3xl bg-white p-6 shadow-soft"><h2 className="mb-4 text-xl font-semibold">{title}</h2>{children}</div>;
}

function List({ title, items }: { title: string; items: string[] }) {
  return <div><h3 className="font-medium">{title}</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">{items.map((item) => <li key={item}>{item}</li>)}</ul></div>;
}
