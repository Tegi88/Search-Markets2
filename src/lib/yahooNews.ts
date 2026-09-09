import type { NewsItem } from "./types";

// Yahoo's long-standing RSS feed — free, unofficial, no daily cap. Used as
// a fallback when FMP's /news/stock is unavailable (permanently 402 on
// the free plan, same as its other analytics endpoints).
function tag(xml: string, name: string): string | undefined {
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  if (!m) return undefined;
  return m[1]
    .replace(/^<!\[CDATA\[/, "")
    .replace(/\]\]>$/, "")
    .trim();
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export async function getYahooNews(symbol: string, limit = 12): Promise<NewsItem[]> {
  const url = `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(symbol)}&region=US&lang=en-US`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; SearchMarkets/1.0)" },
    next: { revalidate: 300 },
  });
  if (!res.ok) return [];
  const xml = await res.text();

  const items = xml.match(/<item>[\s\S]*?<\/item>/gi) ?? [];
  const news: NewsItem[] = [];

  for (const item of items.slice(0, limit)) {
    const title = tag(item, "title");
    const link = tag(item, "link");
    if (!title || !link) continue;
    const pubDate = tag(item, "pubDate");
    const description = tag(item, "description") ?? "";
    const imgMatch = description.match(/<img[^>]+src="([^"]+)"/i);

    news.push({
      symbol,
      publishedDate: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      title,
      image: imgMatch?.[1],
      site: "Yahoo Finance",
      text: stripHtml(description),
      url: link,
    });
  }

  return news;
}
