import { env } from "@/utils/env";
import { NextRequest } from "next/server";

const API_BASE = "https://api.themoviedb.org/3";
const DAY = 60 * 60 * 24;

const ENDPOINTS: { pattern: RegExp; upstream: (path: string) => string; ttl: number }[] = [
  { pattern: /^popular$/, upstream: () => "movie/popular", ttl: 3600 },
  { pattern: /^now-playing$/, upstream: () => "movie/now_playing", ttl: 3600 },
  { pattern: /^upcoming$/, upstream: () => "movie/upcoming", ttl: 3600 },
  { pattern: /^top-rated$/, upstream: () => "movie/top_rated", ttl: 3600 },
  { pattern: /^trending\/(movie|tv)\/(day|week)$/, upstream: (path) => path, ttl: 3600 },
  { pattern: /^search$/, upstream: () => "search/multi", ttl: 900 },
  { pattern: /^movie\/\d+$/, upstream: (path) => path, ttl: 21600 },
  { pattern: /^tv\/\d+$/, upstream: (path) => path, ttl: 21600 },
];

const allowedParams = (search: URLSearchParams) => {
  const params = new URLSearchParams();
  const page = search.get("page");
  if (page !== null) {
    const value = Number(page);
    if (!Number.isInteger(value) || value < 1 || value > 500) return null;
    params.set("page", String(value));
  }
  const query = search.get("query")?.trim();
  if (query) {
    if (query.length > 100) return null;
    params.set("query", query);
  }
  return params;
};

const headers = (ttl: number) => ({
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Cache-Control": `public, max-age=${Math.min(ttl, 300)}`,
  "CDN-Cache-Control": `public, s-maxage=${ttl}, stale-while-revalidate=${DAY}`,
});

export const OPTIONS = () => new Response(null, { status: 204, headers: headers(60) });

export const GET = async (request: NextRequest, ctx: RouteContext<"/api/movies/[...path]">) => {
  const { path } = await ctx.params;
  const endpoint = path.join("/");
  const match = ENDPOINTS.find(({ pattern }) => pattern.test(endpoint));
  if (!match) return Response.json({ error: "Unknown endpoint" }, { status: 404, headers: headers(60) });

  const params = allowedParams(request.nextUrl.searchParams);
  if (!params) return Response.json({ error: "Invalid parameters" }, { status: 400, headers: headers(60) });

  if (endpoint === "movie/" + path[1] || endpoint === "tv/" + path[1]) {
    params.set("append_to_response", "videos,credits");
  }

  const upstream = await fetch(`${API_BASE}/${match.upstream(endpoint)}?${params}`, {
    headers: { Authorization: `Bearer ${env.TMDB_ACCESS_TOKEN}` },
    next: { revalidate: match.ttl },
  });
  return new Response(upstream.body, { status: upstream.status, headers: headers(upstream.ok ? match.ttl : 60) });
};
