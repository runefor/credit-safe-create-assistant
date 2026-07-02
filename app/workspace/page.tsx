"use client";

import { useEffect, useState } from "react";
import { SafetyBadge } from "@/components/SafetyBadge";
import type { WorkspaceTrack } from "@/lib/types";

export default function WorkspacePage() {
  const [tracks, setTracks] = useState<WorkspaceTrack[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadTracks() {
    const response = await fetch("/api/workspace/tracks");
    const data = await response.json();
    setTracks(data.tracks);
    setLoading(false);
  }

  useEffect(() => { void loadTracks(); }, []);

  async function toggleFavorite(trackId: string) {
    const response = await fetch(`/api/workspace/tracks/${trackId}/favorite`, { method: "POST" });
    const updated = await response.json();
    setTracks((current) => current.map((track) => (track.id === updated.id ? updated : track)));
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <div className="rounded-3xl bg-white p-8 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-signal">Workspace</p>
        <h1 className="mt-2 text-3xl font-bold">Completed mock tracks</h1>
        <p className="mt-2 text-gray-700">Cards are created only after the local deterministic job runner reaches completed. Audio URLs are placeholders and no real AI music is generated.</p>
      </div>
      <SafetyBadge />
      {loading ? <p>Loading workspace…</p> : null}
      {!loading && tracks.length === 0 ? <p className="rounded-2xl bg-white p-6">No completed tracks yet. Create a successful job first.</p> : null}
      <section className="grid gap-5 md:grid-cols-2">
        {tracks.map((track) => (
          <article key={track.id} className="space-y-4 rounded-3xl bg-white p-6 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{track.title}</h2>
                <p className="text-sm text-gray-500">Job {track.jobId.slice(0, 8)} · {new Date(track.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => toggleFavorite(track.id)} className="rounded-full border border-orange-300 px-3 py-1 text-sm">{track.favorite ? "★ Favorite" : "☆ Favorite"}</button>
            </div>
            <div className="flex flex-wrap gap-2">{track.tags.map((tag) => <span key={tag} className="rounded-full bg-orange-100 px-3 py-1 text-xs">{tag}</span>)}</div>
            <div className="rounded-2xl bg-gray-100 p-4 text-sm">Mock audio card: {track.mockAudioUrl}</div>
            <p className="rounded-2xl bg-amber-50 p-3 text-sm">{track.licenseBadge}</p>
            <p className="text-sm text-gray-700">{track.versionNote}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
