"use client";

import { siteConfig } from "@/config/site";
import { useState } from "react";
import { FiCheck, FiCode, FiCopy, FiExternalLink } from "react-icons/fi";

const examples = [
  ["Popular movies", "/api/movies/popular"],
  ["Search movies and shows", "/api/movies/search?query=inception"],
  ["Movie details", "/api/movies/movie/27205"],
  ["Trending this week", "/api/movies/trending/movie/week"],
  ["Popular TV shows", "/api/movies/tv/1399"],
] as const;

export default function DevelopersPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const origin = typeof window === "undefined" ? "https://devlopermovie.vercel.app" : window.location.origin;
  const copy = async (path: string) => {
    await navigator.clipboard.writeText(`${origin}${path}`);
    setCopied(path);
    setTimeout(() => setCopied(null), 1600);
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 pb-12">
      <section className="rounded-3xl bg-linear-to-br from-primary/20 via-background to-secondary/20 p-8 md:p-14">
        <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary text-2xl text-white"><FiCode /></div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-primary">Developer portal</p>
        <h1 className="max-w-2xl">Build with {siteConfig.name}&apos;s movie data.</h1>
        <p className="mt-5 max-w-2xl text-lg text-foreground/70">A simple JSON API for movies and TV shows. No API key required. Use it for prototypes, dashboards, bots, and personal projects.</p>
      </section>

      <section className="space-y-4">
        <div><h2>Quick start</h2><p className="mt-2 text-foreground/60">All requests are GET requests and return TMDB-compatible JSON.</p></div>
        <div className="overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/5 p-5 font-mono text-sm"><span className="text-primary">GET</span> {origin}/api/movies/popular</div>
      </section>

      <section className="space-y-4">
        <h2>Endpoints</h2>
        <div className="grid gap-3">
          {examples.map(([label, path]) => <div key={path} className="flex flex-col gap-3 rounded-2xl border border-foreground/10 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">{label}</p><code className="text-sm text-foreground/60">GET {path}</code></div><div className="flex gap-2"><button onClick={() => copy(path)} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white">{copied === path ? <FiCheck /> : <FiCopy />}{copied === path ? "Copied" : "Copy URL"}</button><a href={path} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl border border-foreground/10 px-4 py-2 text-sm"><FiExternalLink />Try it</a></div></div>)}
        </div>
      </section>

      <section className="rounded-2xl border border-foreground/10 p-6"><h2 className="text-xl!">Parameters</h2><p className="mt-3 text-foreground/70"><code>page</code> supports values from 1 to 500. The search endpoint also accepts <code>query</code>. Responses are cached at the edge for faster repeat requests.</p><p className="mt-4 text-sm text-foreground/50">Please cache responses in your app and respect TMDB&apos;s terms of use.</p></section>
    </div>
  );
}
