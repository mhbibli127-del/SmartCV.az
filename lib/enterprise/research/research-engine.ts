import { cacheGetOrSet } from "@/lib/enterprise/cache/redis";
import type { ResearchResult } from "@/types/enterprise";

const TAVILY_SEARCH_URL = "https://api.tavily.com/search";

interface TavilyResponse {
  results?: { title: string; url: string; content: string }[];
}

/**
 * Internet research engine — aggregates live data for AI context.
 * Requires TAVILY_API_KEY for web search; degrades gracefully without it.
 */
export class ResearchEngine {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.TAVILY_API_KEY;
  }

  async search(query: string, maxResults = 5): Promise<ResearchResult> {
    const cacheKey = `research:${Buffer.from(query).toString("base64url").slice(0, 48)}`;
    return cacheGetOrSet(cacheKey, 3600, () => this.fetchSearch(query, maxResults));
  }

  private async fetchSearch(query: string, maxResults: number): Promise<ResearchResult> {
    const snippets: ResearchResult["snippets"] = [];

    if (this.apiKey) {
      try {
        const res = await fetch(TAVILY_SEARCH_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: this.apiKey,
            query,
            search_depth: "basic",
            max_results: maxResults,
            include_answer: false,
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as TavilyResponse;
          for (const r of data.results ?? []) {
            snippets.push({
              title: r.title,
              url: r.url,
              content: r.content.slice(0, 500),
            });
          }
        }
      } catch (err) {
        console.error("[research-engine] Tavily search failed:", err);
      }
    }

    return {
      query,
      snippets,
      skills: this.extractSkills(snippets),
      trends: this.extractTrends(snippets),
      fetchedAt: new Date().toISOString(),
    };
  }

  async researchForRole(role: string, industry?: string): Promise<ResearchResult> {
    const query = [
      `${role} resume skills requirements 2026`,
      industry ? `${industry} hiring trends` : "",
      "ATS keywords",
    ]
      .filter(Boolean)
      .join(" ");
    return this.search(query, 8);
  }

  async researchJobDescription(jd: string): Promise<ResearchResult> {
    const keywords = jd
      .split(/\s+/)
      .filter((w) => w.length > 4)
      .slice(0, 10)
      .join(" ");
    return this.search(`job requirements ${keywords} salary range`, 5);
  }

  async fetchGitHubProfile(username: string): Promise<Record<string, unknown> | null> {
    const token = process.env.GITHUB_TOKEN;
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "SmartCV-Enterprise",
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    try {
      const [userRes, reposRes] = await Promise.all([
        fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, { headers }),
        fetch(
          `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=10`,
          { headers }
        ),
      ]);

      if (!userRes.ok) return null;

      const user = (await userRes.json()) as Record<string, unknown>;
      const repos = reposRes.ok ? ((await reposRes.json()) as Record<string, unknown>[]) : [];

      const languages = new Set<string>();
      for (const repo of repos) {
        if (typeof repo.language === "string") languages.add(repo.language);
      }

      return {
        name: user.name ?? user.login,
        bio: user.bio,
        location: user.location,
        company: user.company,
        blog: user.blog,
        publicRepos: user.public_repos,
        languages: Array.from(languages),
        topRepos: repos.slice(0, 5).map((r) => ({
          name: r.name,
          description: r.description,
          language: r.language,
          stars: r.stargazers_count,
        })),
      };
    } catch {
      return null;
    }
  }

  private extractSkills(snippets: ResearchResult["snippets"]): string[] {
    const text = snippets.map((s) => s.content).join(" ");
    const techPatterns =
      /\b(TypeScript|JavaScript|Python|React|Node\.js|AWS|Docker|Kubernetes|SQL|PostgreSQL|MongoDB|Figma|Agile|Scrum|Leadership|Communication)\b/gi;
    const matches = text.match(techPatterns) ?? [];
    return [...new Set(matches.map((m) => m.charAt(0).toUpperCase() + m.slice(1).toLowerCase()))].slice(
      0,
      15
    );
  }

  private extractTrends(snippets: ResearchResult["snippets"]): string[] {
    return snippets.slice(0, 3).map((s) => s.title);
  }
}

let engine: ResearchEngine | null = null;

export function getResearchEngine(): ResearchEngine {
  if (!engine) engine = new ResearchEngine();
  return engine;
}
